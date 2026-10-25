// Fig 6 (/conventions): a pin-tumbler lock, cut away so the pins show. One pin stack
// per convention. The key (your change) slides into the plug; each pin rises until its
// split sits on the shear line — when every convention is met, the plug can turn and
// the commit goes through.
import { fileURLToPath } from "node:url";
import { A, digestOf, emit, f2, facts, fresh, G, k, setup } from "../lib.mjs";

const NAME = "lock";
const F = facts();
const digest = digestOf(fileURLToPath(import.meta.url), F.conventions);
if (fresh(NAME, digest)) {
	console.log(`${NAME}: up to date`);
	process.exit(0);
}

const W = 640;
const Ht = 420;
const N = F.conventions.length;
const PITCH = 11;
const LEN = N * PITCH + 22;
const PLATE = { x: -LEN / 2 - 50, y: -48, w: LEN + 100, d: 96, r: 10 };
const PLUG_R = 9;
const AXIS_Z = 26; // plug axis height
const SHEAR = AXIS_Z + PLUG_R; // shear line
const HOUSING = { x: -LEN / 2, y: -14, w: LEN, d: 28, r: 3 };
const TOP = SHEAR + 26;
const X0 = -LEN / 2 + 16;
const px = (i) => X0 + i * PITCH;
// bitting: how far each key pin must rise to put its split on the shear line
const CUTS = F.conventions.map((_, i) => [3.2, 5.6, 2.4, 6.4, 4, 1.6, 5.2, 3.6, 4.8, 2.8][i % 10]);
const PIN_R = 2.2;

const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [-LEN / 2, -14, TOP + 2], [LEN / 2 + 46, 14, AXIS_Z]], W, Ht, { pad: 22, azimuth: 64 });
const H = setup(P, NAME);
const { at, Ln, Dots, path3 } = H;
const back = [H.plate(PLATE)];

// A cutaway: plug and housing are cut on the centreline (y = 0) and only their back
// halves are drawn, so each chamber shows its pin stack standing on the cut face.
const XS = HOUSING.x;
const XE = HOUSING.x + LEN;
const half = (r, n = 20) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI / 2 + (i / n) * Math.PI; return [Math.cos(a) * r, Math.sin(a) * r]; });
const XF = G.frameOf([XS, 0, AXIS_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
H.box("housing.foot", { x: XS - 6, y: -22, w: LEN + 12, d: 30, r: 3 }, 0, 4, { tone: "lo" }, { steps: 4, bevel: 0.6, extra: Dots(k.corners({ x: XS - 6, y: -22, w: LEN + 12, d: 30, r: 3 }, 4).map(([x, y]) => at([x, y, 4])), { size: 0.5 }) });
H.box("housing.cradle", { x: XS, y: -16, w: LEN, d: 16, r: 1 }, 4, AXIS_Z - PLUG_R - 4, {}, { steps: 2, bevel: 0.5 });
const plugShape = H.R.solid(A.prism(XF, half(PLUG_R), 0, LEN, { name: "plug" }));
H.put("plug", [XS + LEN / 2, -PLUG_R / 2, AXIS_Z], H.S(G.prismOf(XF, half(PLUG_R), 0, LEN, P), { tone: "hi" }), [plugShape]);
H.box("housing.chambers", { x: XS, y: -12, w: LEN, d: 12, r: 0.6 }, SHEAR, TOP - SHEAR - 6, {}, { steps: 2, bevel: 0.5, extra: Ln(path3([[XS, 0.02, SHEAR], [XE, 0.02, SHEAR]]), { tone: "mid" }) });
H.box("housing.topbar", { x: XS - 2, y: -12, w: LEN + 4, d: 12 + 2 * PIN_R + 2, r: 1 }, TOP - 6, 6, {}, { steps: 3, bevel: 0.6 });
{
	const FF = G.frameOf([XE, 0, AXIS_Z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
	H.put("plug.face", [XE + 1.6, 0, AXIS_Z], H.S(G.ringBand(0, 3.2, 5.4, PLUG_R + 3, FF, P), {}), [H.R.solid(A.ring(FF, 0, 3.2, 5.4, PLUG_R + 3, { name: "plug.face" }))]);
}

// pin stacks, drawn aligned (key in): key pin from the blade to the shear line, driver
// above it, a spring, and the bar overhead. Each stack stands on the cut face.
const blade = (i) => AXIS_Z - 3 + (6.4 - CUTS[i]);
const PY = PIN_R + 0.02;
const pins = F.conventions.map((title, i) => {
	const x = px(i);
	const VF = H.VZ(x, PY);
	const bt = blade(i);
	const stack = H.S(G.solidOf([[bt, 1.2], [bt + 1, PIN_R, 1], [SHEAR, PIN_R]], VF, P), { tone: "hi" }) + H.S(G.solidOf([[SHEAR, PIN_R], [SHEAR + 7, PIN_R]], VF, P), { tone: "mid" });
	const coil = [];
	const z1 = SHEAR + 7;
	const z2 = TOP - 6;
	const turns = 6;
	for (let c = 0; c < turns; c++) {
		const zc = z1 + ((c + 0.5) * (z2 - z1)) / turns;
		coil.push(H.S(G.solidOf([[zc - 0.45, PIN_R * 0.85], [zc + 0.45, PIN_R * 0.85]], VF, P, { steps: 18 }), { tone: "lo" }));
	}
	coil.push(H.S(G.solidOf([[z1, 0.6], [z2, 0.6]], VF, P, { steps: 10 }), { tone: "lo" }));
	H.put(`pin.${i}`, [x, PY, (bt + TOP) / 2], `<g data-pin="${i}">${stack}${coil.join("")}</g>`, [H.R.solid(A.solid(VF, [[bt, PIN_R], [TOP - 6, PIN_R]], { name: `pin.${i}` }))], { bias: 0.3 });
	const drop = bt - (AXIS_Z - 4.6);
	return { title, drop, down: k.translateAlong(P, [0, 0, -drop]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number), at: at([x, PY, SHEAR]).map(f2) };
});

// key: a stepped blade cut to the bitting, a shoulder at the face and a bow. It is
// split at the face plate, inside and outside, so each half orders against the plate.
const inner = [];
const innerShapes = [];
const slab = (list, shapes, name, plan, z0, h, tone) => {
	list.push(H.S(k.slabOf(plan, z0, h, P, 2, 0), { tone }));
	shapes.push(H.R.solid(A.box([plan.x, plan.y, z0], [plan.x + plan.w, plan.y + plan.d, z0 + h], { name })));
};
for (let i = 0; i < N; i++) slab(inner, innerShapes, "key.blade", { x: px(i) - PITCH / 2, y: 0.02, w: PITCH, d: 1.8, r: 0.2 }, AXIS_Z - 4.6, blade(i) - (AXIS_Z - 4.6), "mid");
slab(inner, innerShapes, "key.tip", { x: XS + 4, y: 0.02, w: px(0) - PITCH / 2 - XS - 4, d: 1.8, r: 0.2 }, AXIS_Z - 4.6, 3, "mid");
slab(inner, innerShapes, "key.shank", { x: px(N - 1) + PITCH / 2, y: 0.02, w: XE - px(N - 1) - PITCH / 2, d: 1.8, r: 0.2 }, AXIS_Z - 4.6, 6, "mid");
const outer = [];
const outerShapes = [];
slab(outer, outerShapes, "key.shoulder", { x: XE + 3.2, y: -2.2, w: 5, d: 4.4, r: 0.6 }, AXIS_Z - 5, 8, "mid");
const BOWF = G.frameOf([XE + 17.6, -1.2, AXIS_Z + 1], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
outer.push(H.S(G.solidOf([[0, 9.5], [2.4, 9.5]], BOWF, P), { tone: "hi", lit: true }), Ln(G.circleOf(BOWF, 2.42, 3.2, P), { tone: "lo" }));
outerShapes.push(H.R.solid(A.disc(BOWF, 0, 2.4, 9.5, { name: "key.bow" })));
const out = k.translateAlong(P, [40, 0, 0]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
H.put("key.inner", [XE - 20, 0.9, AXIS_Z], `<g data-part="key">${inner.join("")}</g>`, innerShapes, { bias: 0.4 });
H.put("key.outer", [XE + 10, 0, AXIS_Z], `<g data-part="key">${outer.join("")}</g>`, outerShapes, { bias: 0.4 });

emit(NAME, H, {
	W, Ht, back,
	fig: "Fig 6",
	title: "Pin tumbler",
	hint: "Hover a pin",
	readout: `${N} of ${N} pins on the shear line · commit`,
	keys: [
		{ mark: "lit", label: "The key: your change" },
		{ mark: "raised", label: `${N} pin stacks: one per convention` },
	],
	caption: `Every convention is a pin. A change only turns the plug when each pin's split sits on the shear line — commits, branches, review order, phases, deslopify and the rest, all ${N} at once.`,
	label: `A cutaway pin-tumbler lock with ${N} pin stacks, one per convention, and a key that slides into the plug.`,
	data: { pins, out },
	css: `[data-part="key"]{transition:transform .9s var(--st-ease)}[data-pin]{transition:transform .25s var(--st-ease)}\n@media (prefers-reduced-motion:reduce){[data-part="key"],[data-pin]{transition:none}}`,
	digest,
});
