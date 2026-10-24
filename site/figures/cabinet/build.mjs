// Fig 2 (/skills): a parts cabinet. One drawer per skill category; each drawer is as
// deep as its category has skills, with one compartment per skill. Drawers slide out
// in turn, and hovering one pulls it.
import { fileURLToPath } from "node:url";
import { A, digestOf, emit, f2, facts, fresh, k, setup } from "../lib.mjs";

const NAME = "cabinet";
const F = facts();
const digest = digestOf(fileURLToPath(import.meta.url), [...F.counts]);
if (fresh(NAME, digest)) {
	console.log(`${NAME}: up to date`);
	process.exit(0);
}

const W = 620;
const Ht = 460;
const DRAWERS = F.categories.map((c) => ({ category: c, skills: F.counts.get(c) }));
const N = DRAWERS.length;
const PITCH = 9.6;
const DH = 8.4; // drawer front height
const CW = 70; // cabinet width
const CD = 96; // cabinet depth
const WALL = 3;
const BASE = 6; // plinth height
const CH = BASE + WALL + N * PITCH + WALL;
const UNIT = 6.6; // compartment length per skill
const lengthOf = (n) => 14 + n * UNIT;
const CAB = { x: -CW / 2, y: -CD / 2, w: CW, d: CD, r: 1.5 };
const FRONT = CAB.y + CAB.d;
const PLATE = { x: -96, y: -92, w: 192, d: 200, r: 10 };

const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [CAB.x, FRONT + 90, CH], [CAB.x + CW, FRONT + 90, 0], [CAB.x, CAB.y, CH + 8]], W, Ht, { pad: 24, azimuth: 40 });
const H = setup(P, NAME);
const { at, S, Ln, Dots, path3 } = H;
const back = [H.plate(PLATE)];

// carcass: plinth, two sides, back, top with a lip; drawers run between the sides
H.box("cab.plinth", { x: CAB.x + 2, y: CAB.y + 2, w: CW - 4, d: CD - 4, r: 1 }, 0, BASE, { tone: "lo" }, { steps: 2 });
H.box("cab.bottom", CAB, BASE, WALL, {}, { steps: 3, bevel: 0.6 });
H.box("cab.back", { x: CAB.x + WALL, y: CAB.y, w: CW - 2 * WALL, d: WALL, r: 0.6 }, BASE + WALL, CH - BASE - 2 * WALL, {}, { steps: 2 });
for (const sx of [0, 1]) {
	const side = { x: sx ? CAB.x + CW - WALL : CAB.x, y: CAB.y, w: WALL, d: CD, r: 0.6 };
	const rivets = [];
	for (let i = 0; i < N; i++) rivets.push(at([sx ? CAB.x + CW : CAB.x, FRONT - 6, BASE + WALL + i * PITCH + PITCH / 2]));
	const xs = sx ? CAB.x + CW + 0.02 : CAB.x - 0.02;
	const panel = [[xs, CAB.y + 10, BASE + WALL + 8], [xs, FRONT - 14, BASE + WALL + 8], [xs, FRONT - 14, CH - WALL - 8], [xs, CAB.y + 10, CH - WALL - 8]];
	const inner = panel.map(([x, y, z], i) => [x, y + (i === 0 || i === 3 ? 2 : -2), z + (i < 2 ? 2 : -2)]);
	H.box(`cab.side${sx}`, side, BASE + WALL, CH - BASE - 2 * WALL, {}, { steps: 2, extra: sx ? Dots(rivets, { size: 0.4, tone: "mid" }) + Ln(path3(panel, true), { tone: "lo" }) + Ln(path3(inner, true), { tone: "faint" }) : "" });
}
{
	const hz = CH - WALL - 22;
	const hx = CAB.x + CW;
	for (const y of [CAB.y + 30, FRONT - 34]) H.box("cab.handle.post", { x: hx, y: y - 1, w: 3, d: 2, r: 0.4 }, hz, 2, {}, { steps: 2, bevel: 0 });
	H.box("cab.handle", { x: hx + 3, y: CAB.y + 28, w: 1.8, d: FRONT - 34 - CAB.y - 28 + 3, r: 0.8 }, hz, 2, { tone: "hi" }, { steps: 3, bevel: 0 });
}
H.box("cab.top", { x: CAB.x - 1.5, y: CAB.y - 1.5, w: CW + 3, d: CD + 3, r: 1.6 }, CH - WALL, WALL, {}, {
	steps: 4,
	bevel: 0.8,
	extra: Ln(k.planOutline(k.insetPlan({ x: CAB.x - 1.5, y: CAB.y - 1.5, w: CW + 3, d: CD + 3, r: 1.6 }, 4), CH, P, 4), { tone: "lo" }),
});

// drawers: open box (floor, two walls, back), one compartment per skill, a front with
// a label holder and a pull
const IW = CW - 2 * WALL - 1.2;
const pullOf = (L) => k.translateAlong(P, [0, Math.min(L - 4, 64), 0]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
const most = DRAWERS.reduce((a, b) => (b.skills > a.skills ? b : a));
const pulls = [];
DRAWERS.forEach((d, i) => {
	const z0 = BASE + WALL + i * PITCH + 0.6;
	const L = lengthOf(d.skills);
	const x0 = CAB.x + WALL + 0.6;
	const y1 = FRONT - 2.4;
	const y0 = y1 - L;
	for (const sx of [0, 1]) {
		const rx = sx ? x0 + IW - 1.2 : CAB.x + WALL;
		H.box(`runner.${d.category}.${sx}`, { x: rx, y: CAB.y + WALL, w: 1.2 + 0.6, d: FRONT - 2.4 - CAB.y - WALL, r: 0.2 }, z0 - 0.8, 0.8, { tone: "lo" }, { steps: 2, bevel: 0 });
	}
	const parts = [];
	parts.push(S(k.slabOf({ x: x0, y: y0, w: IW, d: L, r: 0.4 }, z0, 1, P, 2, 0), { tone: "lo" }));
	parts.push(S(k.slabOf({ x: x0, y: y0, w: IW, d: 1, r: 0.2 }, z0 + 1, DH - 3, P, 2, 0), { tone: "mid" }));
	for (const sx of [0, 1]) parts.push(S(k.slabOf({ x: sx ? x0 + IW - 1 : x0, y: y0, w: 1, d: L, r: 0.2 }, z0 + 1, DH - 3, P, 2, 0), { tone: "mid" }));
	const dividers = [];
	for (let s = 1; s < d.skills; s++) dividers.push(path3([[x0 + 1, y1 - 7 - s * UNIT, z0 + 1], [x0 + IW - 1, y1 - 7 - s * UNIT, z0 + 1]]));
	if (dividers.length) parts.push(Ln(dividers.join(""), { tone: "faint" }));
	const face = { x: CAB.x + WALL + 0.2, y: y1, w: CW - 2 * WALL - 0.4, d: 2.4, r: 0.4 };
	parts.push(S(k.slabOf(face, z0, DH, P, 2, 0.4), { tone: "hi" }));
	const holder = [[face.x + 6, FRONT + 0.02, z0 + 2], [face.x + 22, FRONT + 0.02, z0 + 2], [face.x + 22, FRONT + 0.02, z0 + DH - 2], [face.x + 6, FRONT + 0.02, z0 + DH - 2]];
	parts.push(Ln(path3(holder, true), { tone: "lo" }), Dots([at([face.x + 4.4, FRONT + 0.02, z0 + DH / 2]), at([face.x + 23.6, FRONT + 0.02, z0 + DH / 2])], { size: 0.35, tone: "mid" }));
	const hx = face.x + face.w - 20;
	parts.push(S(k.slabOf({ x: hx, y: FRONT, w: 1.6, d: 2, r: 0.3 }, z0 + 3.4, 1.6, P, 2, 0), { tone: "mid" }));
	parts.push(S(k.slabOf({ x: hx + 10, y: FRONT, w: 1.6, d: 2, r: 0.3 }, z0 + 3.4, 1.6, P, 2, 0), { tone: "mid" }));
	parts.push(S(k.slabOf({ x: hx - 0.4, y: FRONT + 2, w: 12.4, d: 1.4, r: 0.5 }, z0 + 3.4, 1.6, P, 2, 0), { tone: "hi" }));
	const shape = H.R.solid(A.slab(face, z0, DH, { name: `drawer.${d.category}` }, 2));
	const open = d.category === most.category ? ` style="transform:translate(${pullOf(L)[0]}px, ${pullOf(L)[1]}px)"` : "";
	H.put(`drawer.${d.category}`, [0, FRONT - 1.2, z0 + DH / 2], `<g data-drawer="${i}"${open}>${parts.join("")}</g>`, [shape, H.R.solid(A.slab({ x: x0, y: y0, w: IW, d: L, r: 0.4 }, z0, 1, { name: `drawer.${d.category}.floor` }, 2))]);
	const pull = pullOf(L);
	pulls.push({ category: d.category, skills: d.skills, pull, at: at([0, FRONT + 2, z0 + DH / 2]).map(f2) });
});

const total = DRAWERS.reduce((n, d) => n + d.skills, 0);
emit(NAME, H, {
	W, Ht, back,
	fig: "Fig 2",
	title: "Parts cabinet",
	hint: "Hover a drawer",
	readout: `${most.category} · ${most.skills} skills`,
	keys: [
		{ mark: "lit", label: "The drawer that is out" },
		{ mark: "raised", label: `${N} drawers: one per category, as deep as its skills` },
	],
	caption: `A steel parts cabinet with ${N} drawers, one per skill category. Every drawer is as deep as its category is big — one compartment per skill, ${total} in all — so the long ones are where most of the work lives.`,
	label: `A parts cabinet on a bench with ${N} drawers, one per skill category. Each drawer is as deep as its category has skills, with one compartment per skill.`,
	data: { drawers: pulls },
	css: `[data-drawer]{transition:transform .6s var(--st-ease)}
@media (prefers-reduced-motion:reduce){[data-drawer]{transition:none}}`,
	digest,
});
