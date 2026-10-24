// Shared plumbing for the page figures: kit imports, the repo facts they draw, the
// part helpers (each records its true shape for the audit), and writing the outputs.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const SITE = join(HERE, "..");
export const REPO = join(SITE, "..");
const KIT = join(REPO, "skills", "visual", "anatomy", "kit");
export const k = await import(join(KIT, "iso-kit.mjs"));
export const G = await import(join(KIT, "lathe.mjs"));
export const T = await import(join(KIT, "tube.mjs"));
export const A = await import(join(KIT, "audit.mjs"));

export const AUDIT = process.argv.includes("--audit");
export const PAGE = process.argv.includes("--page");
export const f2 = (v) => Math.round(v * 100) / 100;

// ── repo facts ──────────────────────────────────────────────────────────────
export const MODULE_ORDER = ["planning", "design", "quality", "pr-review", "data", "queues", "observability", "deployment", "incident", "security", "visual", "meta"];

function stepsOf(text) {
	const steps = [];
	for (const line of text.split("\n")) {
		const row = line.match(/^\|\s*(\d+|)\s*\|(.*)$/);
		if (!row) continue;
		const skills = [...row[2].matchAll(/`([a-z-]+)\/([a-z<>-]+)`/g)].map((m) => ({ category: m[1], skill: `${m[1]}/${m[2]}` }));
		if (row[1]) steps.push({ n: Number(row[1]), alts: skills, open: !skills.length });
		else if (steps.length && skills.length && steps[steps.length - 1].open) steps[steps.length - 1].alts.push(...skills);
	}
	return steps.filter((step) => step.alts.length).map(({ n, alts }) => ({ n, alts }));
}

export function facts() {
	const counts = new Map();
	for (const category of readdirSync(join(REPO, "skills"))) {
		const dir = join(REPO, "skills", category);
		if (!existsSync(join(dir, "README.md"))) continue;
		counts.set(category, readdirSync(dir).filter((name) => existsSync(join(dir, name, "SKILL.md"))).length);
	}
	const categories = ["workflows", ...MODULE_ORDER, ...[...counts.keys()].filter((c) => c !== "workflows" && !MODULE_ORDER.includes(c)).sort()].filter((c) => counts.has(c));
	const workflows = ["ship-change", "new-feature", "handle-incident", "adopt-repo"]
		.filter((name) => existsSync(join(REPO, "skills", "workflows", name, "SKILL.md")))
		.map((name) => ({ name, steps: stepsOf(readFileSync(join(REPO, "skills", "workflows", name, "SKILL.md"), "utf8")) }));
	const templates = readdirSync(join(REPO, "docs", "templates"))
		.filter((f) => f.endsWith(".md") && f !== "README.md")
		.sort()
		.map((f) => f.replace(/\.md$/, ""));
	const mcp = [...Object.keys(JSON.parse(readFileSync(join(REPO, ".mcp.json"), "utf8")).mcpServers), "gh"];
	const conventions = [...readFileSync(join(SITE, "src", "data", "site.ts"), "utf8").matchAll(/^\t\ttitle: "([^"]+)",$/gm)].map((m) => m[1]);
	return { counts, categories, workflows, templates, mcp, conventions };
}

// Skip a build when its script, the kit and the facts it draws are unchanged.
export function digestOf(script, extra) {
	const hash = createHash("sha256");
	for (const f of [script, fileURLToPath(import.meta.url), join(KIT, "iso-kit.mjs"), join(KIT, "lathe.mjs"), join(KIT, "tube.mjs")]) hash.update(readFileSync(f));
	hash.update(JSON.stringify(extra));
	return hash.digest("hex").slice(0, 16);
}
export function fresh(name, digest) {
	const out = join(SITE, "src", "generated", `${name}.json`);
	if (AUDIT || PAGE || !existsSync(out) || !existsSync(join(SITE, "public", "figures", `${name}.html`))) return false;
	try {
		return JSON.parse(readFileSync(out, "utf8")).digest === digest;
	} catch {
		return false;
	}
}

// ── part helpers ────────────────────────────────────────────────────────────
export function setup(P, piece) {
	const R = A.recorder(P);
	const at = (p) => k.iso(p, P);
	const S = (paths, style = {}) => k.solidSvg(paths, style);
	const Ln = (d, style) => k.lineSvg(d, style);
	const Dots = (points, style) => k.dotsSvg(points, style);
	const path3 = (points, closed = false) => k.pathOf(points.map(at), closed);
	const put = (name, ref, svg, shapes = [], { bias = 0, attrs = "" } = {}) => R.put({ name, at: ref, bias, svg, shapes, piece, attrs });
	const H = {
		R, P, at, S, Ln, Dots, path3, put,
		VZ: (x, y) => G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]),
		box(name, plan, z0, h, style = {}, { steps = 3, bevel = 0.5, extra = "", inner = "", bias = 0, attrs, ground, cut, seated } = {}) {
			const shape = R.solid(A.slab(plan, z0, h, { name, ...(ground ? { ground } : {}), ...(cut ? { cut, seated } : {}) }, steps));
			put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z0 + h / 2], S(k.slabOf(plan, z0, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], { bias, attrs });
			return shape;
		},
		turned(name, F, profile, style = {}, { extra = "", inner = "", bias = 0, smooth, steps, bevel = 0, attrs, cut, seated, ground } = {}) {
			const opts = { bevel, ...(smooth !== undefined ? { smooth } : {}), ...(steps ? { steps } : {}) };
			const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
			const shape = R.solid(A.solid(F, profile, { name, radius: smooth?.radius ?? null, ...(cut ? { cut, seated } : {}), ...(ground ? { ground } : {}) }));
			put(name, G.add3(F.o, G.mul3(F.a, mid)), S(G.solidOf(profile, F, P, opts), { tone: "mid", ...style, inner }) + extra, [shape], { bias, attrs });
			return shape;
		},
		disc(name, F, s0, s1, r, style, options) {
			return H.turned(name, F, [[s0, r], [s1, r]], style, options);
		},
		ball(name, c, r, style = {}, { bias = 0, extra = "", attrs, cut, seated } = {}) {
			const shape = R.solid(A.ball(c, r, { name, ...(cut ? { cut, seated } : {}) }));
			put(name, c, S(G.sphereOf(c, r, P, { steps: 40 }), { tone: "mid", ...style }) + extra, [shape], { bias, attrs });
			return shape;
		},
		cable(name, points, r, { tone = "mid", bend = 4, maxLength = 14, attrs = "" } = {}) {
			const route = G.fillet(points, Math.max(bend, r * 2.6), 10, { P, tube: r });
			R.route(name, route, r, { limp: true, piece });
			T.tubePieces(route, r, P, { maxLength, spacing: Math.max(0.6, Math.min(1.6, r)) }).forEach((pc, i) =>
				put(`${name}:${i}`, pc.mid, T.tubeSvg(pc, { tone }), [A.tube(pc.points, pc.radii)], { attrs, bias: 0.02 }),
			);
			return route;
		},
		// Base plate on feet with groove, corner screws, a ruler strip and a label plate.
		plate(PLATE, { h = 10, foot = 5, label = "WORKBENCH", ruler = true } = {}) {
			const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -h - foot, h, P)}"/>`];
			const feet = [...k.corners(PLATE, 22)].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
			for (const [x, y] of feet) {
				out.push(S(k.cylinder(x, y, 7, -h - foot, 1.6, P, 28), { tone: "lo" }));
				out.push(S(k.cylinder(x, y, 5.4, -h - foot + 1.6, foot - 1.6, P, 28), { tone: "mid" }));
			}
			out.push(S(k.slabOf(PLATE, -h, h, P, 8, 1.6), { tone: "mid", inner: Ln(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
			out.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
			const sc = k.corners(PLATE, 10);
			out.push(Ln(sc.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }), Dots(sc.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
			if (ruler) {
				const strip = { x: PLATE.x + 16, y: PLATE.y + PLATE.d - 13, w: Math.min(150, PLATE.w * 0.5), d: 6, r: 1 };
				out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
				const t = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y, 0.6, [1.8, 3.4], P);
				out.push(Ln(t.minor, { tone: "lo" }), Ln(t.major, { tone: "mid" }));
			}
			if (label) {
				const lp = { x: PLATE.x + PLATE.w - 62, y: PLATE.y + PLATE.d - 17, w: 44, d: 10, r: 1.2 };
				out.push(S(k.slabOf(lp, 0, 0.8, P, 4), { tone: "lo" }), Ln(k.planOutline(k.insetPlan(lp, 1.4), 0.8, P, 4), { tone: "faint" }));
				out.push(k.faceTextSvg(k.topMatrix([lp.x + lp.w / 2, lp.y + lp.d / 2 + 1.2], 0.8, P, "x"), label, { size: 3.3, tone: "mid", anchor: "middle" }));
				out.push(Dots([at([lp.x + 2.4, lp.y + lp.d / 2, 0.8]), at([lp.x + lp.w - 2.4, lp.y + lp.d / 2, 0.8])], { size: 0.45 }));
			}
			R.solid(A.slab(PLATE, -h, h, { name: "stand.plate", ground: true }, 8));
			return out.join("");
		},
	};
	return H;
}

// ── output ──────────────────────────────────────────────────────────────────
export function emit(name, H, { W, Ht, back = [], front = [], fig, title, hint, readout, keys, caption, label, data, css = "", digest }) {
	A.settle(H.R, H.P);
	H.R.items.sort((a, b) => a.key - b.key);
	const items = H.R.items.map((it) => `<g class="it"${it.attrs ?? ""}>${it.svg}</g>`).join("");
	const svg = k.figureSvg({ width: W, height: Ht, label, body: [...back, `<g class="fg-items">${items}</g>`, ...front] });
	const html = k.plateHtml({
		fig, title, hint, readout, keys, caption,
		body: `<div class="iso-stage fg-stage" data-figure="${name}" tabindex="0" role="group" aria-label="${title}. ${hint}.">${svg}</div>`,
	});
	const css2 = `.fg-${name}-placeholder{aspect-ratio:${W}/${Ht}}\n${css}`;
	const gen = join(SITE, "src", "generated");
	mkdirSync(gen, { recursive: true });
	mkdirSync(join(SITE, "public", "figures"), { recursive: true });
	writeFileSync(join(gen, `${name}.json`), JSON.stringify({ digest, readout, ...data }));
	writeFileSync(join(gen, `${name}.css`), css2);
	writeFileSync(join(SITE, "public", "figures", `${name}.html`), html);
	console.log(`${name}: ${H.R.items.length} items · ${(html.length / 1024) | 0} KB`);
	if (PAGE) {
		const theme = process.argv.includes("--light") ? "light" : "dark";
		const base = readFileSync(join(gen, "anatomy.css"), "utf8").replace("html:not(.dark) .iso{", '.iso[data-theme="light"]{');
		const page = k.pageHtml({ title, theme, body: html, width: 780 }).replace("</style>", `${base}${css2}</style>`);
		const file = join(process.env.PAGE_DIR ?? SITE, `${name}${theme === "light" ? "-light" : ""}.html`);
		writeFileSync(file, page);
		console.log("wrote", file);
	}
	A.auditOrExit(H.R, H.P, {});
}
