// Fig 4 (/templates): a stamp rack. One stamp per doc template stands on a rack beside
// a stack of paper and an ink pad. In turn a stamp lifts, inks, and presses a sheet,
// leaving its mark: every PRD, ADR and postmortem comes out in the same house format.
import { fileURLToPath } from "node:url";
import { A, digestOf, emit, f2, facts, fresh, G, k, setup } from "../lib.mjs";

const NAME = "stamps";
const F = facts();
const digest = digestOf(fileURLToPath(import.meta.url), F.templates);
if (fresh(NAME, digest)) {
	console.log(`${NAME}: up to date`);
	process.exit(0);
}

const W = 620;
const Ht = 420;
const PLATE = { x: -84, y: -62, w: 168, d: 124, r: 10 };
const RACK = { x: -72, y: -48, w: 34, d: 12 + F.templates.length * 28, r: 2 };
const RACK_H = 5;
const SB = { w: 22, d: 19 }; // stamp base
const PAPER = { x: 8, y: -30, w: 52, d: 66, r: 1 };
const PAD = { x: -26, y: -50, w: 30, d: 24, r: 2 };
const SHEETS = 6;
const SHEET_H = 0.7;
const TOP = 1.2 + SHEETS * SHEET_H;

const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [RACK.x, RACK.y, 60], [PAPER.x + PAPER.w, PAPER.y, 60]], W, Ht, { pad: 24, azimuth: 52 });
const H = setup(P, NAME);
const { at, S, Ln, Dots, path3 } = H;
const back = [H.plate(PLATE)];

// rack: a low block with a groove per stamp
H.box("rack", RACK, 0, RACK_H, {}, { steps: 4, bevel: 0.8, inner: Ln(k.sideSeam(RACK, 2, P, 4), { tone: "faint" }) });

// paper tray with a lip on three sides
const TRAY = { x: PAPER.x - 4, y: PAPER.y - 4, w: PAPER.w + 8, d: PAPER.d + 8, r: 2 };
H.box("tray", TRAY, 0, 1.2, { tone: "lo" }, { steps: 3, bevel: 0.4 });
H.box("tray.lip.back", { x: TRAY.x, y: TRAY.y, w: TRAY.w, d: 2, r: 0.5 }, 1.2, 4, {}, { steps: 2 });
H.box("tray.lip.left", { x: TRAY.x, y: TRAY.y + 2, w: 2, d: TRAY.d - 2, r: 0.5 }, 1.2, 4, {}, { steps: 2 });
// paper stack, the top sheet with printed rule lines, and the ink pad in its tin
for (let i = 0; i < SHEETS; i++) {
	const o = (i % 2 ? 0.6 : -0.4) * (i / SHEETS);
	H.box(`paper.${i}`, { ...PAPER, x: PAPER.x + o, y: PAPER.y - o }, 1.2 + i * SHEET_H, SHEET_H, { tone: i === SHEETS - 1 ? "hi" : "lo" }, { steps: 2, bevel: 0 });
}
const rules = [];
for (let r = 0; r < 9; r++) rules.push(path3([[PAPER.x + 8, PAPER.y + 40 + r * 3.2, TOP], [PAPER.x + PAPER.w - (r % 3 === 2 ? 22 : 8), PAPER.y + 40 + r * 3.2, TOP]]));
const MARK = { x: PAPER.x + 20, y: PAPER.y + 10, w: SB.w, d: SB.d };
const mark = `<g data-imprint>${Ln(path3([[MARK.x, MARK.y, TOP], [MARK.x + MARK.w, MARK.y, TOP], [MARK.x + MARK.w, MARK.y + MARK.d, TOP], [MARK.x, MARK.y + MARK.d, TOP]], true), { tone: "lit" })}${Ln([0, 1, 2].map((r) => path3([[MARK.x + 3, MARK.y + 4 + r * 3, TOP], [MARK.x + MARK.w - 3 - r * 2, MARK.y + 4 + r * 3, TOP]])).join(""), { tone: "lit", free: true })}</g>`;
H.put("paper.print", [PAPER.x + PAPER.w / 2, PAPER.y + PAPER.d / 2, TOP], Ln(rules.join(""), { tone: "lo", free: true }) + mark, [H.R.solid(A.box([PAPER.x, PAPER.y, TOP], [PAPER.x + PAPER.w, PAPER.y + PAPER.d, TOP + 0.05], { name: "paper.print" }))], { bias: 0.1 });
H.box("pad.tin", PAD, 0, 4, {}, { steps: 4, bevel: 0.6 });
H.box("pad.felt", { ...k.insetPlan(PAD, 2.4), r: 1 }, 4, 0.6, { tone: "lo" }, { steps: 3, bevel: 0 });

// stamps: base (rubber + block), neck, knob; each moves as one group
const stamps = F.templates.map((name, i) => {
	const cx = RACK.x + RACK.w / 2;
	const cy = RACK.y + 20 + i * 28;
	const base = { x: cx - SB.w / 2, y: cy - SB.d / 2, w: SB.w, d: SB.d, r: 1.2 };
	const z0 = RACK_H;
	const parts = [];
	parts.push(S(k.slabOf(base, z0, 1.6, P, 2, 0), { tone: "lo" }));
	parts.push(S(k.slabOf(k.insetPlan(base, -0.6), z0 + 1.6, 6, P, 3, 0.6), { tone: "mid" }));
	parts.push(Ln([0, 1, 2].map((r) => path3([[base.x + 3, base.y + 4 + r * 3, z0 + 7.6], [base.x + SB.w - 3 - r * 2, base.y + 4 + r * 3, z0 + 7.6]])).join(""), { tone: "lo", free: true }));
	parts.push(S(k.cylinder(cx, cy, 3, z0 + 7.6, 9, P, 20), { tone: "mid" }));
	parts.push(S(k.cylinder(cx, cy, 4.4, z0 + 16.6, 1.6, P, 24), { tone: "mid" }));
	const knob = [cx, cy, z0 + 18.2 + 6];
	parts.push(S(G.sphereOf(knob, 6, P, { steps: 32 }), { tone: "hi" }));
	const shape = H.R.solid(A.slab(k.insetPlan(base, -0.6), z0, 7.6, { name: `stamp.${name}` }, 2));
	H.put(`stamp.${name}`, [cx, cy, z0 + 10], `<g data-stamp="${i}">${parts.join("")}</g>`, [shape, H.R.solid(A.cylinder(cx, cy, 3, z0 + 7.6, 9, { name: `stamp.${name}.neck` })), H.R.solid(A.cylinder(cx, cy, 4.4, z0 + 16.6, 1.6, { name: `stamp.${name}.collar` })), H.R.solid(A.ball(knob, 6, { name: `stamp.${name}.knob` }))], { bias: 30 });
	const lift = k.translateAlong(P, [0, 0, 30]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
	const over = (x, y, z) => k.translateAlong(P, [x - cx, y - cy, z]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
	return {
		name,
		at: at([cx, cy, z0 + 22]).map(f2),
		lift,
		ink: over(PAD.x + PAD.w / 2, PAD.y + PAD.d / 2, 30),
		inked: over(PAD.x + PAD.w / 2, PAD.y + PAD.d / 2, 4.6 - z0),
		hover: over(MARK.x + MARK.w / 2, MARK.y + MARK.d / 2, 30),
		press: over(MARK.x + MARK.w / 2, MARK.y + MARK.d / 2, TOP - z0),
	};
});

emit(NAME, H, {
	W, Ht, back,
	fig: "Fig 4",
	title: "Stamp rack",
	hint: "Hover a stamp",
	readout: `${F.templates[0]} · docs/templates/${F.templates[0]}.md`,
	keys: [
		{ mark: "lit", label: "The mark: the house format, every time" },
		{ mark: "raised", label: `${F.templates.length} stamps: one per doc template` },
	],
	caption: `${F.templates.length} templates — ${F.templates.join(", ")} — each a stamp. The skills that write docs pick one up, ink it and press it, so every document comes out with the same table header, dividers and sections.`,
	label: `A stamp rack holding ${F.templates.length} stamps, one per doc template, beside an ink pad and a stack of paper.`,
	data: { stamps },
	css: `[data-stamp]{transition:transform .45s var(--st-ease)}[data-imprint]{opacity:0;transition:opacity .4s var(--st-ease)}[data-imprint][data-on]{opacity:1}\n@media (prefers-reduced-motion:reduce){[data-stamp],[data-imprint]{transition:none}}`,
	digest,
});
