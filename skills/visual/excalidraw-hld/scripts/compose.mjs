#!/usr/bin/env node
// Compose an HLD scene from components.excalidraw. Zero dependencies.
//   node compose.mjs <spec.json> [out.excalidraw]   write the scene (default: spec name + .excalidraw)
//   node compose.mjs --list                        print every component and its default label
// Only components tagged in the sheet can be placed; anything else is an error.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SHEET = join(dirname(fileURLToPath(import.meta.url)), "..", "components.excalidraw");
const PRIMITIVES = new Set(["card", "tier", "divider", "arrow"]);

const GAP_NODE = 40; // between nodes in a tier
const GAP_TIER = 180; // between tiers in a row (room for arrow labels)
const GAP_ROW = 160; // between rows
const PAD = 40; // tier padding
const TITLE = 44; // tier title band

const rid = () =>
	Array.from({ length: 21 }, () => "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-"[(Math.random() * 64) | 0]).join("");
const rint = () => (Math.random() * 2 ** 31) | 0;
const fail = (m) => {
	console.error(`compose: ${m}`);
	process.exit(1);
};

// --- the sheet: hld tag → its elements ---
const sheet = JSON.parse(readFileSync(SHEET, "utf8"));
const components = new Map();
for (const e of sheet.elements) {
	const tag = e.customData?.hld;
	if (!tag || PRIMITIVES.has(tag)) continue;
	if (!components.has(tag)) components.set(tag, []);
	components.get(tag).push(e);
}
const labelOf = (es) => es.find((e) => e.customData?.role === "label");

if (process.argv[2] === "--list") {
	for (const [name, es] of components) console.log(`${name.padEnd(32)} ${labelOf(es)?.text.replace(/\s+/g, " ") ?? "(no label slot)"}`);
	process.exit(0);
}

const specPath = process.argv[2];
if (!specPath) fail("usage: compose.mjs <spec.json> [out.excalidraw] | --list");
const spec = JSON.parse(readFileSync(specPath, "utf8"));
const outPath = process.argv[3] ?? `${specPath.replace(/\.json$/, "")}.excalidraw`;

// --- geometry ---
function bbox(es) {
	let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
	for (const e of es) {
		const pts = e.points ? e.points.map(([px, py]) => [e.x + px, e.y + py]) : [[e.x, e.y], [e.x + e.width, e.y + e.height]];
		for (const [x, y] of pts) {
			x0 = Math.min(x0, x); y0 = Math.min(y0, y);
			x1 = Math.max(x1, x); y1 = Math.max(y1, y);
		}
	}
	return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
}
const measure = (text, size) => {
	const lines = text.split("\n");
	return { width: Math.max(...lines.map((l) => l.length)) * size * 0.55, height: lines.length * size * 1.25 };
};

function fresh(o) {
	return { id: rid(), seed: rint(), versionNonce: rint(), version: 1, updated: Date.now(), isDeleted: false, groupIds: [], frameId: null, boundElements: [], link: null, locked: false, angle: 0, ...o };
}
const STROKE = { strokeColor: "#000000", backgroundColor: "transparent", fillStyle: "hachure", strokeWidth: 1, roughness: 1, opacity: 50 };
function text(t, x, y, size, o = {}) {
	return fresh({ type: "text", x, y, ...measure(t, size), text: t, originalText: t, fontSize: size, fontFamily: 5, textAlign: "center", verticalAlign: "top", containerId: null, lineHeight: 1.25, autoResize: true, strokeColor: "#1e1e1e", backgroundColor: "transparent", fillStyle: "solid", strokeWidth: 1, strokeStyle: "solid", roughness: 1, opacity: 100, roundness: null, ...o });
}

// Copy a component with fresh ids, its label swapped, its top-left at (0, 0).
function instance(name, label) {
	const src = components.get(name);
	if (!src) fail(`unknown component "${name}". Run --list; only those exist.`);
	const ids = new Map(src.map((e) => [e.id, rid()]));
	const groups = new Map();
	const g = (id) => groups.get(id) ?? groups.set(id, rid()).get(id);
	const b = bbox(src);
	const es = src.map((e0) => {
		const e = structuredClone(e0);
		e.id = ids.get(e0.id);
		e.groupIds = e.groupIds.map(g);
		e.seed = rint(); e.versionNonce = rint(); e.x -= b.x; e.y -= b.y;
		e.boundElements = (e.boundElements ?? []).filter((r) => ids.has(r.id)).map((r) => ({ ...r, id: ids.get(r.id) }));
		if (e.containerId) e.containerId = ids.get(e.containerId) ?? null;
		for (const k of ["startBinding", "endBinding"]) if (e[k]) e[k] = ids.has(e[k].elementId) ? { ...e[k], elementId: ids.get(e[k].elementId) } : null;
		return e;
	});
	if (label !== undefined) {
		const l = labelOf(es);
		if (!l) fail(`"${name}" has no label slot; drop "label" or pick another component`);
		const cx = l.x + l.width / 2;
		Object.assign(l, { text: label, originalText: label, ...measure(label, l.fontSize) });
		l.x = cx - l.width / 2;
	}
	return es;
}
const move = (es, dx, dy) => es.forEach((e) => { e.x += dx; e.y += dy; });
// What arrows bind to: the tagged card, else (patterns) the largest rectangle.
const cardOf = (es) =>
	es.find((e) => e.customData?.role === "card") ??
	es.filter((e) => e.type === "rectangle").sort((p, q) => q.width * q.height - p.width * p.height)[0];

// --- lay out tiers: left to right inside a row, rows top to bottom ---
const out = [];
const anchors = new Map(); // node or tier id → the element arrows bind to
const claim = (id, el) => {
	if (anchors.has(id)) fail(`duplicate id "${id}"`);
	anchors.set(id, el);
};

let y = 0;
if (spec.title) {
	out.push(text(spec.title, 0, 0, 28, { textAlign: "left" }));
	y = 90;
}
// "under": "<tier id>" puts a tier in the next row, starting at that tier's x.
const tiersById = new Map((spec.tiers ?? []).filter((t) => t.id).map((t) => [t.id, t]));
const rowOf = (t) => {
	if (!t.under) return t.row ?? 0;
	const above = tiersById.get(t.under);
	if (!above) fail(`tier "${t.title ?? t.id}": "under" names no tier id "${t.under}"`);
	return rowOf(above) + 1;
};
const tierX = new Map();
const rows = new Map();
for (const t of spec.tiers ?? []) {
	const r = rowOf(t);
	if (!rows.has(r)) rows.set(r, []);
	rows.get(r).push(t);
}
for (const r of [...rows.keys()].sort((a, b) => a - b)) {
	let x = 0, rowH = 0;
	for (const tier of rows.get(r)) {
		if (tier.under) x = Math.max(x, tierX.get(tier.under));
		const across = tier.flow === "row";
		const nodes = (tier.nodes ?? []).map((n) => {
			if (!n.id || !n.use) fail(`every node needs "id" and "use" (tier "${tier.title ?? tier.id}")`);
			const es = instance(n.use, n.label);
			claim(n.id, cardOf(es));
			return { es, b: bbox(es) };
		});
		const innerW = across ? nodes.reduce((s, n) => s + n.b.w, 0) + GAP_NODE * Math.max(0, nodes.length - 1) : Math.max(0, ...nodes.map((n) => n.b.w));
		const innerH = across ? Math.max(0, ...nodes.map((n) => n.b.h)) : nodes.reduce((s, n) => s + n.b.h, 0) + GAP_NODE * Math.max(0, nodes.length - 1);
		const head = tier.title ? TITLE : 0;
		let cx = x + PAD, cy = y + PAD + head;
		for (const n of nodes) {
			move(n.es, across ? cx : x + PAD + (innerW - n.b.w) / 2, across ? y + PAD + head + (innerH - n.b.h) / 2 : cy);
			cx += n.b.w + GAP_NODE;
			cy += n.b.h + GAP_NODE;
			out.push(...n.es);
		}
		const w = innerW + 2 * PAD, h = innerH + 2 * PAD + head;
		const frame = fresh({ type: "rectangle", ...STROKE, strokeStyle: "dotted", roundness: { type: 1 }, x, y, width: w, height: h });
		out.unshift(frame);
		if (tier.title) out.push(text(tier.title, x + w / 2 - measure(tier.title, 16).width / 2, y + 16, 16));
		if (tier.id) claim(tier.id, frame);
		if (tier.id) tierX.set(tier.id, x);
		x += w + GAP_TIER;
		rowH = Math.max(rowH, h);
	}
	y += rowH + GAP_ROW;
}

// --- edges: dashed arrows bound to both cards, label riding on the arrow ---
const mid = (e) => ({ x: e.x + e.width / 2, y: e.y + e.height / 2 });
for (const edge of spec.edges ?? []) {
	const a = anchors.get(edge.from), b = anchors.get(edge.to);
	if (!a || !b) fail(`edge ${edge.from} → ${edge.to}: unknown id "${a ? edge.to : edge.from}"`);
	const ca = mid(a), cb = mid(b);
	const across = Math.abs(cb.x - ca.x) >= Math.abs(cb.y - ca.y);
	const sx = across ? Math.sign(cb.x - ca.x) || 1 : 0, sy = across ? 0 : Math.sign(cb.y - ca.y) || 1;
	const p0 = { x: ca.x + (sx * a.width) / 2 + sx * 8, y: ca.y + (sy * a.height) / 2 + sy * 8 };
	const p1 = { x: cb.x - (sx * b.width) / 2 - sx * 8, y: cb.y - (sy * b.height) / 2 - sy * 8 };
	const arrow = fresh({
		type: "arrow", ...STROKE, strokeStyle: "dashed", roundness: { type: 2 },
		x: p0.x, y: p0.y, width: Math.abs(p1.x - p0.x), height: Math.abs(p1.y - p0.y),
		points: [[0, 0], [p1.x - p0.x, p1.y - p0.y]], lastCommittedPoint: null,
		startBinding: { elementId: a.id, focus: 0, gap: 8, fixedPoint: null },
		endBinding: { elementId: b.id, focus: 0, gap: 8, fixedPoint: null },
		startArrowhead: edge.both ? "triangle" : null, endArrowhead: "triangle", elbowed: false,
	});
	a.boundElements.push({ id: arrow.id, type: "arrow" });
	b.boundElements.push({ id: arrow.id, type: "arrow" });
	out.push(arrow);
	if (edge.label) {
		const m = measure(edge.label, 14);
		const t = text(edge.label, (p0.x + p1.x) / 2 - m.width / 2, (p0.y + p1.y) / 2 - m.height / 2, 14, { containerId: arrow.id, verticalAlign: "middle" });
		arrow.boundElements.push({ id: t.id, type: "text" });
		out.push(t);
	}
}

writeFileSync(outPath, `${JSON.stringify({ type: "excalidraw", version: 2, source: "https://excalidraw.com", elements: out, appState: { gridSize: 20, viewBackgroundColor: "#ffffff" }, files: {} }, null, "\t")}\n`);
console.log(`${outPath}: ${anchors.size} nodes, ${(spec.edges ?? []).length} edges`);
