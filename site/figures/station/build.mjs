// Fig 1 for the home page, built with the vendored anatomy kit (skills/visual/anatomy).
// A space station on a display stand. The core node is AGENTS.md and the workflows; a
// capsule (the agent) docks on top of it; each module along the truss is a skill
// category. Every workflow step sends a signal along the truss and lights the module
// that owns the step's skill. Step sequences come from the workflow skills.
//
//   node figures/station/build.mjs            writes src/generated/station.json + public/figures/station.html
//   node figures/station/build.mjs --page     also writes a standalone page for the kit's checks
//   node figures/station/build.mjs --audit    runs the kit's geometry audit
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..", "..");
const REPO = join(SITE, "..");
const KIT = join(REPO, "skills", "visual", "anatomy", "kit");
const OUT_DIR = join(SITE, "src", "generated");
const OUT = join(OUT_DIR, "station.json");
const CSS_OUT = join(OUT_DIR, "anatomy.css");
const HTML_OUT = join(SITE, "public", "figures", "station.html");

const k = await import(join(KIT, "iso-kit.mjs"));
const G = await import(join(KIT, "lathe.mjs"));
const A = await import(join(KIT, "audit.mjs"));

const AUDIT = process.argv.includes("--audit");
const PAGE = process.argv.includes("--page");

// ── truth: categories, skill counts, workflow steps ─────────────────────────
const WORKFLOWS_DIR = join(REPO, "skills", "workflows");
const WORKFLOW_ORDER = ["ship-change", "new-feature", "handle-incident", "adopt-repo"];
const AGENTS = ["Claude Code", "Codex", "Cursor", "VS Code"];
// Module order along the truss, nearest the core first; unknown categories append.
const MODULE_ORDER = ["planning", "design", "quality", "pr-review", "data", "queues", "observability", "deployment", "incident", "security", "study", "visual", "meta"];

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

const skillCount = new Map();
for (const category of readdirSync(join(REPO, "skills"))) {
	const dir = join(REPO, "skills", category);
	if (!existsSync(join(dir, "README.md"))) continue;
	skillCount.set(category, readdirSync(dir).filter((name) => existsSync(join(dir, name, "SKILL.md"))).length);
}
const CATEGORIES = [...MODULE_ORDER.filter((c) => skillCount.has(c)), ...[...skillCount.keys()].filter((c) => c !== "workflows" && !MODULE_ORDER.includes(c)).sort()];
const workflows = WORKFLOW_ORDER.filter((name) => existsSync(join(WORKFLOWS_DIR, name, "SKILL.md"))).map((name) => ({
	name,
	steps: stepsOf(readFileSync(join(WORKFLOWS_DIR, name, "SKILL.md"), "utf8")),
}));

// Skip the build when nothing it reads has changed.
const hash = createHash("sha256");
hash.update(readFileSync(fileURLToPath(import.meta.url)));
for (const f of ["iso-kit.mjs", "lathe.mjs", "audit.mjs"]) hash.update(readFileSync(join(KIT, f)));
hash.update(JSON.stringify({ workflows, counts: [...skillCount] }));
const digest = hash.digest("hex").slice(0, 16);
if (!AUDIT && !PAGE && [OUT, CSS_OUT, HTML_OUT].every(existsSync)) {
	try {
		if (JSON.parse(readFileSync(OUT, "utf8")).digest === digest) {
			console.log("station: up to date");
			process.exit(0);
		}
	} catch {}
}

// ── world ───────────────────────────────────────────────────────────────────
const W = 680;
const H = 430;
const CZ = 100; // truss centreline height
const CORE_R = 13;
const TRUSS_X = 150; // half length
const TH = 4.5; // truss half section
const BAY = 12; // frame pitch
const MOD_R = 7.6;
const MOD_L = 27;
const WING_X = TRUSS_X + 3;
const DOCK_TRAVEL = 34;

const P = k.fitProjection(
	[...[-1, 1].flatMap((sx) => [-1, 1].map((sy) => [sx * (WING_X + 30), sy * 86, CZ])), [-46, -46, 0], [46, 46, 0], [0, 0, CZ + 64], [0, 0, CZ - 46]],
	W,
	H,
	{ pad: 22, azimuth: 52, elevation: 30 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (p) => k.iso(p, P);
const f2 = (v) => Math.round(v * 100) / 100;
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const path3 = (points, closed = false) => k.pathOf(points.map(at), closed);
const VZ = (x, y) => G.frameOf([x, y, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);

const R = A.recorder(P);
const record = R.solid;
function put(name, ref, svg, shapes = [], { bias = 0, attrs = "" } = {}) {
	return R.put({ name, at: ref, bias, svg, shapes, piece: "station", attrs });
}
function box(name, plan, z0, h, style = {}, { steps = 2, bevel = 0, extra = "", inner = "", bias = 0, attrs } = {}) {
	const shape = record(A.slab(plan, z0, h, { name }, steps));
	put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z0 + h / 2], S(k.slabOf(plan, z0, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], { bias, attrs });
	return shape;
}
function turned(name, F, profile, style = {}, { extra = "", inner = "", bias = 0, smooth, steps, bevel = 0, attrs, cut, seated, ground } = {}) {
	const opts = { bevel, ...(smooth !== undefined ? { smooth } : {}), ...(steps ? { steps } : {}) };
	const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
	const shape = record(A.solid(F, profile, { name, radius: smooth?.radius ?? null, ...(cut ? { cut, seated } : {}), ...(ground ? { ground } : {}) }));
	put(name, G.add3(F.o, G.mul3(F.a, mid)), S(G.solidOf(profile, F, P, opts), { tone: "mid", ...style, inner }) + extra, [shape], { bias, attrs });
	return shape;
}
const disc = (name, F, s0, s1, r, style, options) => turned(name, F, [[s0, r], [s1, r]], style, options);
function ball(name, c, r, style = {}, { bias = 0, extra = "", attrs } = {}) {
	const shape = record(A.ball(c, r, { name }));
	put(name, c, S(G.sphereOf(c, r, P, { steps: 40 }), { tone: "mid", ...style }) + extra, [shape], { bias, attrs });
	return shape;
}

// ── display stand ───────────────────────────────────────────────────────────
const VF = VZ(0, 0);
const plinthTicks = k.radialTicks(0, 0, 37, 72, 6, 10, [1.3, 2.8], P);
turned("stand.plinth", VF, [[0, 46], [2, 46], [3.2, 44.8], [10, 44.8]], { tone: "mid" }, {
	bevel: 0.8,
	ground: true,
	extra:
		Ln(k.ring(0, 0, 37, 10, P, 96), { tone: "lo" }) +
		Ln(plinthTicks.minor, { tone: "lo" }) +
		Ln(plinthTicks.major, { tone: "mid" }) +
		Dots(G.dotsOf(VF, 10, 30, 6, P, { all: true, phase: Math.PI / 6 }), { size: 0.5, tone: "mid" }) +
		k.faceTextSvg(k.topMatrix([0, 21], 10, P, "x"), "WORKBENCH", { size: 3.4, tone: "lo", anchor: "middle" }),
	inner: Ln(G.arcOf(VF, 6, 44.8, P), { tone: "faint" }),
});
disc("stand.collar", VF, 10, 16, 9, {}, { bevel: 0.5, inner: Ln(G.arcOf(VF, 13, 9, P), { tone: "faint" }) });
const POST_TOP = CZ - CORE_R - 6;
disc("stand.post", VF, 16, POST_TOP, 3.2, {}, { inner: Ln([40, 64].map((z) => G.arcOf(VF, z, 3.2, P)).join(""), { tone: "faint" }) });
const cradleTop = CZ - Math.sqrt(CORE_R ** 2 - 6.4 ** 2);

// ── core node: AGENTS.md + workflows ────────────────────────────────────────
const CORE = ball("core", [0, 0, CZ], CORE_R, { tone: "hi" });
turned("stand.cradle", VF, [[POST_TOP, 4.2], [POST_TOP + 3, 6.4], [cradleTop, 6.4]], {}, { cut: [CORE], seated: true });
const PORT_Z = CZ + Math.sqrt(CORE_R ** 2 - 6 ** 2);
const PF = VZ(0, 0);
disc("core.port", PF, PORT_Z, CZ + CORE_R + 2.4, 6, {}, { cut: [CORE], seated: true, bevel: 0.4 });
turned("core.port.ring", PF, [[CZ + CORE_R + 2.4, 8.4], [CZ + CORE_R + 4.6, 8.4]], {}, {
	extra: Dots(G.dotsOf(PF, CZ + CORE_R + 4.6, 7.1, 8, P, { all: true }), { size: 0.45, tone: "mid" }),
});
const DOCK_Z = CZ + CORE_R + 4.6;

// ── truss: square frames every bay, longerons between them, diagonals on two faces ──
const truss = [];
const FRAMES = [];
for (let x = 18; x <= TRUSS_X; x += BAY) FRAMES.push(x);
const LONGERONS = [[-TH, CZ - TH], [TH, CZ - TH], [-TH, CZ + TH], [TH, CZ + TH]];
for (const side of [-1, 1]) {
	for (const x of FRAMES) {
		const cx = side * x;
		box(`truss${side}.frame`, { x: cx - 0.7, y: -TH - 1, w: 1.4, d: 2 * TH + 2, r: 0.3 }, CZ + TH - 1, 2, {});
		box(`truss${side}.frame`, { x: cx - 0.7, y: -TH - 1, w: 1.4, d: 2 * TH + 2, r: 0.3 }, CZ - TH - 1, 2, {});
		box(`truss${side}.frame`, { x: cx - 0.7, y: -TH - 1, w: 1.4, d: 2, r: 0.3 }, CZ - TH + 1, 2 * TH - 2, {});
		box(`truss${side}.frame`, { x: cx - 0.7, y: TH - 1, w: 1.4, d: 2, r: 0.3 }, CZ - TH + 1, 2 * TH - 2, {});
	}
	const stops = [Math.sqrt(CORE_R ** 2 - 2 * TH ** 2), ...FRAMES.map((x) => x - 0.7)];
	const starts = [Math.sqrt(CORE_R ** 2 - 2 * TH ** 2), ...FRAMES.map((x) => x + 0.7)];
	for (let i = 0; i < FRAMES.length; i++) {
		const x0 = starts[i];
		const x1 = stops[i + 1];
		for (const [y, z] of LONGERONS) {
			turned(`truss${side}.longeron`, G.frameOf([side * x0, y, z], [side, 0, 0], [0, 1, 0], [0, 0, 1]), [[0, 0.9], [x1 - x0, 0.9]], {}, { steps: 10, ...(i === 0 ? { cut: [CORE], seated: true } : {}) });
		}
		if (i > 0) {
			const xa = side * x0;
			const xb = side * x1;
			truss.push(path3([[xa, -TH + 0.9, CZ + TH + 0.9], [xb, TH - 0.9, CZ + TH + 0.9]]), path3([[xa, TH + 0.9, CZ + TH - 0.9], [xb, TH + 0.9, CZ - TH + 0.9]]));
		}
	}
}

// ── modules: one per category, berthed on the truss sides ─────────────────
const SLOTS = [];
const perQuad = Math.ceil(CATEGORIES.length / 4);
const span = TRUSS_X - 46;
for (let i = 0; i < perQuad; i++) {
	const x = 30 + (span * i) / Math.max(1, perQuad - 1);
	for (const [sx, sy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) SLOTS.push([sx * x, sy]);
}
const MODULES = CATEGORIES.map((category, i) => {
	const [x, side] = SLOTS[i];
	const bay = Math.round((Math.abs(x) - 18) / BAY);
	const mx = Math.sign(x) * (18 + bay * BAY + BAY / 2);
	const F = G.frameOf([mx, side * (TH + 1), CZ], [0, side, 0], [1, 0, 0], [0, 0, 1]);
	const L = MOD_L;
	const id = `m${i}`;
	turned(`mod.${category}.berth`, F, [[0, 5.4], [3, 5.4]], {}, { steps: 24, attrs: ` data-mod="${id}"` });
	turned(
		`mod.${category}`,
		F,
		[[3, 6.4], [4.2, MOD_R, 1], [5.4, MOD_R], [L - 2.4, MOD_R], [L - 1.2, MOD_R - 0.6, 1], [L, 4.4]],
		{ tone: "hi" },
		{
			steps: 40,
			attrs: ` data-mod="${id}"`,
			inner: Ln([L * 0.42, L * 0.7].map((s) => G.arcOf(F, s, MOD_R, P)).join(""), { tone: "faint" }),
			extra:
				k.fadedSvg(G.ribsOf(F, L * 0.42, L * 0.7, MOD_R, 16, P, { fade: [0.1, 0.55] }), { tone: "faint" }) +
				Dots(G.dotsOf(F, L, 2.4, 6, P, { all: true }), { size: 0.35, tone: "lo" }),
		},
	);
	const tip = G.add3(F.o, G.mul3(F.a, L * 0.56));
	return { id, category, skills: skillCount.get(category) ?? 0, x: mx, side, tip };
});

// ── solar wings: rotary joint, mast, two blankets per side ──────────────────
for (const side of [-1, 1]) {
	const jx = side * (FRAMES[FRAMES.length - 1] + 0.7);
	disc(`wing${side}.joint`, G.frameOf([jx, 0, CZ], [side, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 6, 6, {}, { bevel: 0.4, inner: Ln(G.arcOf(G.frameOf([jx, 0, CZ], [side, 0, 0], [0, 1, 0], [0, 0, 1]), 3, 6, P), { tone: "faint" }) });
	const mx = jx + side * 6;
	box(`wing${side}.mast`, { x: mx + (side > 0 ? 0 : -3), y: -84, w: 3, d: 168, r: 0.6 }, CZ - 1.5, 3, {});
	for (const sy of [-1, 1]) {
		const y0 = sy > 0 ? 8 : -84;
		const blanket = { x: mx + (side > 0 ? 3 : -27), y: y0, w: 24, d: 76, r: 0.4 };
		const grid = [];
		for (let g = 1; g < 4; g++) grid.push(path3([[blanket.x + g * 6, y0, CZ + 0.6], [blanket.x + g * 6, y0 + 76, CZ + 0.6]]));
		for (let g = 1; g < 19; g++) grid.push(path3([[blanket.x, y0 + g * 4, CZ + 0.6], [blanket.x + 24, y0 + g * 4, CZ + 0.6]]));
		box(`wing${side}.blanket${sy}`, blanket, CZ - 0.6, 1.2, { tone: "lo" }, { extra: Ln(grid.join(""), { tone: "faint" }) });
	}
}

// ── radiators and a comms dish ─────────────────────────────────────────────
for (const side of [-1, 1]) {
	const x = side * FRAMES[FRAMES.length - 2];
	box(`radiator${side}.stem`, { x: x - 1, y: -1, w: 2, d: 2, r: 0.4 }, CZ - TH - 8, 7, {});
	const panel = { x: x - 10, y: -0.6, w: 20, d: 1.2, r: 0.2 };
	const ribs = [];
	for (let g = 1; g < 5; g++) ribs.push(path3([[panel.x + g * 4, 0.6, CZ - TH - 40], [panel.x + g * 4, 0.6, CZ - TH - 8]]));
	box(`radiator${side}.panel`, panel, CZ - TH - 40, 32, { tone: "hi" }, { extra: Ln(ribs.join(""), { tone: "faint" }) });
}
const DISH_X = FRAMES[0];
const dishBase = CZ + TH + 1;
const MAST = box("dish.mast", { x: DISH_X - 1.2, y: -1.2, w: 2.4, d: 2.4, r: 0.6 }, dishBase, 16, {});
const DF = G.frameAlong([DISH_X, 0, dishBase + 16], G.unit3([0.7, -0.7, 0.45]));
turned("dish", DF, [[0, 0.8], [1.2, 4, 1], [2.2, 7.5, 1], [2.6, 8]], { tone: "hi" }, { smooth: true, cut: [MAST], seated: true });

// ── capsule: the agent ──────────────────────────────────────────────────────
const CF = VZ(0, 0);
const capProfile = [[DOCK_Z, 6], [DOCK_Z + 1.8, 13.2], [DOCK_Z + 3.4, 13.6], [DOCK_Z + 4.6, 13.2, 1], [DOCK_Z + 18, 7.4, 1], [DOCK_Z + 20, 5.4], [DOCK_Z + 22, 4.6]];
const capOffset = k.translateAlong(P, [0, 0, DOCK_TRAVEL]);
const capsule = [];
capsule.push(S(G.solidOf(capProfile, CF, P, { smooth: true }), { tone: "hi" }));
for (const a of [0.3, 1.87, 3.44, 5.01]) {
	const c = [Math.cos(a) * 11.8, Math.sin(a) * 11.8, DOCK_Z + 7];
	if (G.dot3([Math.cos(a), Math.sin(a), 0], V) > -0.2) capsule.push(S(k.slabOf({ x: c[0] - 1.4, y: c[1] - 1.4, w: 2.8, d: 2.8, r: 0.5 }, c[2], 2.6, P, 2, 0), { tone: "mid" }));
}
capsule.push(Dots([at([Math.cos(1) * 9.8, Math.sin(1) * 9.8, DOCK_Z + 12])], { size: 0.9, tone: "hi" }));
put("capsule", [0, 0, DOCK_Z + 10], `<g data-part="capsule">${capsule.join("")}</g>`, [record(A.solid(CF, capProfile.map(([s, r]) => [s, r]), { name: "capsule" }))], { bias: 2 });

// ── order and markup ────────────────────────────────────────────────────────
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item) => `<g class="it"${item.attrs ?? ""}>${item.svg}</g>`);
const trussLines = `<g class="st-truss">${Ln(truss.join(""), { tone: "lo" })}</g>`;
const pulse = `<g class="st-pulse" data-part="pulse" opacity="0"><circle r="5" class="st-pulse-halo"/><circle r="1.8" class="st-pulse-core"/></g>`;

const seed = (n) => {
	let s = 11;
	const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
	return Array.from({ length: n }, () => [f2(rnd() * W), f2(rnd() * H), f2(0.3 + rnd() * 0.6), f2(0.12 + rnd() * 0.5)]);
};
const stars = `<g class="st-stars" aria-hidden="true">${seed(120)
	.map(([x, y, r, o], i) => `<circle cx="${x}" cy="${y}" r="${r}" opacity="${o}"${i % 7 === 0 ? ' class="st-twinkle"' : ""}/>`)
	.join("")}</g>`;

const LABEL =
	"A space station on a display stand. A long truss runs through a spherical core node; along it are berthed modules, one per skill category, with solar wings at both ends, radiators below and a comms dish on top. A capsule docks on the port at the top of the core. Each workflow step sends a signal from the core along the truss and lights the module that owns that step's skill.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL, body: [stars, trussLines, `<g class="st-items">${groups.join("")}</g>`, pulse] });

const totalSkills = [...skillCount.values()].reduce((a, b) => a + b, 0);
const first = workflows[0].steps[0].alts[0];
const readout = `${AGENTS[0]} · ${workflows[0].name} · 1/${workflows[0].steps.length} · ${first.skill}`;
const html = k.plateHtml({
	fig: "Fig 1",
	title: "Docking",
	hint: "Hover a module · ← → agent",
	readout,
	keys: [
		{ mark: "lit", label: "The signal: one workflow step, core to module" },
		{ mark: "raised", label: `${MODULES.length} modules: one per skill category` },
		{ mark: "flat", label: "The capsule: whichever agent is docked" },
	],
	caption: `The core is AGENTS.md and the ${workflows.length} workflows. An agent docks on top; each step of the workflow it runs goes out along the truss to the module that owns that skill. Sequences are read from the workflow skills at build time; ${totalSkills} skills in ${skillCount.size} categories in all.`,
	body: `<div class="iso-stage st-stage" tabindex="0" role="group" aria-label="Workbench station. Left and right arrows switch the docked agent; hover a module to light it.">${svg}</div>`,
});

const data = {
	digest,
	readout,
	agents: AGENTS,
	capsule: capOffset.match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number),
	core: at([0, 0, CZ + TH + 1]).map(f2),
	modules: MODULES.map((m) => ({
		id: m.id,
		category: m.category,
		skills: m.skills,
		tip: at(m.tip).map(f2),
		path: [[0, 0, CZ + TH + 1.2], [m.x, 0, CZ + TH + 1.2], [m.x, m.side * (TH + 1), CZ + TH + 1.2], m.tip].map((p) => at(p).map(f2)),
	})),
	workflows,
};

// The kit's CSS, keyed to the site's theme class instead of data-theme.
const css =
	k.ISO_CSS.replace('.iso[data-theme="light"]{', "html:not(.dark) .iso{") +
	`
.iso{--anatomy-mono:var(--font-geist-mono),ui-monospace,monospace;--st-ease:cubic-bezier(.4,0,.2,1)}
.st-stage{outline:none;touch-action:pan-y}
.st-stars circle{fill:var(--anatomy-muted)}
.st-twinkle{animation:st-twinkle 5s var(--st-ease) infinite alternate}
@keyframes st-twinkle{to{opacity:.05}}
.st-pulse-core{fill:var(--anatomy-lit)}
.st-pulse-halo{fill:var(--anatomy-lit);opacity:.14}
[data-part="capsule"]{transition:transform 1s var(--st-ease)}
.it[data-mod] .iso-solid>.iso-edge{transition:stroke .35s var(--st-ease)}
.st-placeholder{aspect-ratio:${W}/${H}}
.st-host .iso-figure{margin:0}
.st-host .iso-legend{background:hsl(var(--background))}
@media (prefers-reduced-motion:reduce){.st-twinkle{animation:none}[data-part="capsule"]{transition:none}}
`;

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(dirname(HTML_OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
writeFileSync(CSS_OUT, css);
writeFileSync(HTML_OUT, html);
console.log(`station: ${R.items.length} items · ${(html.length / 1024) | 0} KB · ${MODULES.length} modules · scale ${KS.toFixed(3)}`);

if (PAGE) {
	const theme = process.argv.includes("--light") ? "light" : "dark";
	const page = k.pageHtml({ title: "Station", theme, body: html, width: 780 }).replace("</style>", `${css.replace("html:not(.dark) .iso{", '.iso[data-theme="light"]{')}</style>`);
	const file = join(process.env.PAGE_DIR ?? HERE, theme === "light" ? "station-light.html" : "station.html");
	writeFileSync(file, page);
	console.log("wrote", file);
}

A.auditOrExit(R, P, {});
