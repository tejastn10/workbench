// Fig 3 (/workflows): a sequencer rail. Ten press stations stand along a rail, one per
// category a workflow reaches for. A carriage carrying the change runs the workflow:
// for each step it parks under the station that owns the step's skill, and that
// station's plunger comes down. Step sequences are read from the workflow skills.
import { fileURLToPath } from "node:url";
import { A, digestOf, emit, f2, facts, fresh, G, k, setup } from "../lib.mjs";

const NAME = "sequencer";
const F = facts();
const STATIONS = ["planning", "design", "data", "queues", "observability", "quality", "pr-review", "security", "deployment", "incident"].filter((c) => F.counts.has(c));
const digest = digestOf(fileURLToPath(import.meta.url), { w: F.workflows, s: STATIONS });
if (fresh(NAME, digest)) {
	console.log(`${NAME}: up to date`);
	process.exit(0);
}

const W = 660;
const Ht = 420;
const PITCH = 26;
const N = STATIONS.length;
const LEN = N * PITCH + 30;
const X0 = -LEN / 2;
const sx = (i) => X0 + 15 + PITCH * (i + 0.5);
const PLATE = { x: X0 - 14, y: -46, w: LEN + 28, d: 92, r: 10 };
const RAIL_Z = 5;
const BEAM_Z = 58;
const STROKE = 9;

const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [X0, -22, BEAM_Z + 10], [X0 + LEN, -22, BEAM_Z + 10]], W, Ht, { pad: 22, azimuth: 62 });
const H = setup(P, NAME);
const { at, Ln, Dots, path3 } = H;
const back = [H.plate(PLATE, { ruler: false })];

// rails on end blocks, with a ruler strip between them
for (const y of [-12, 8]) H.box("rail", { x: X0, y, w: LEN, d: 4, r: 1 }, 0, RAIL_Z - 1, {}, { steps: 2, bevel: 0.4, extra: Dots([X0 + 5, X0 + LEN - 5].map((x) => at([x, y + 2, RAIL_Z - 1])), { size: 0.4 }) });
for (const x of [X0 - 6, X0 + LEN]) H.box("rail.stop", { x, y: -15, w: 6, d: 30, r: 1.2 }, 0, 9, {}, { steps: 3, bevel: 0.5, extra: Dots([at([x + 3, -10, 9]), at([x + 3, 10, 9])], { size: 0.45 }) });
const strip = { x: X0 + 4, y: -6.5, w: LEN - 8, d: 11, r: 0.6 };
H.box("rail.strip", strip, 0, 0.6, { tone: "lo", crease: "none" }, { steps: 2, bevel: 0, extra: (() => {
	const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, PITCH / 5, 5, strip.y, 0.6, [2, 4], P);
	return Ln(t.minor, { tone: "lo" }) + Ln(t.major, { tone: "mid" });
})() });

// gantry: two columns and a beam that carries the ten stations
for (const x of [X0 - 3, X0 + LEN + 3]) {
	H.box("gantry.foot", { x: x - 6, y: -36, w: 12, d: 12, r: 1.4 }, 0, 4, {}, { steps: 3, bevel: 0.5 });
	H.box("gantry.column", { x: x - 3.5, y: -33.5, w: 7, d: 7, r: 1 }, 4, BEAM_Z - 4, {}, { steps: 2 });
}
H.box("gantry.beam", { x: X0 - 6.5, y: -34, w: LEN + 13, d: 8, r: 1 }, BEAM_Z, 7, {}, { steps: 2, bevel: 0.6, inner: Ln(k.sideSeam({ x: X0 - 6.5, y: -34, w: LEN + 13, d: 8, r: 1 }, BEAM_Z + 3.5, P, 2), { tone: "faint" }) });

// stations: an arm off the beam, a housing, a plunger with its tip
const stations = STATIONS.map((category, i) => {
	const x = sx(i);
	H.box(`st.${category}.arm`, { x: x - 3, y: -26, w: 6, d: 22, r: 0.8 }, BEAM_Z + 1, 4, {}, { steps: 2 });
	const VF = H.VZ(x, -1);
	H.disc(`st.${category}.housing`, VF, BEAM_Z - 13, BEAM_Z + 1, 5.6, {}, { bevel: 0.5, inner: Ln(G.arcOf(VF, BEAM_Z - 6, 5.6, P), { tone: "faint" }), extra: Ln(k.knurl(x, -1, 5.6, BEAM_Z - 3, BEAM_Z + 1, 28, P), { tone: "lo" }) });
	const tipZ = RAIL_Z + 14 + STROKE;
	const plunger = `<g data-plunger="${i}">${H.S(G.solidOf([[tipZ, 1.6], [tipZ + 1.4, 2.4], [tipZ + 3, 2.4], [tipZ + 3, 1.3], [BEAM_Z - 13, 1.3]], VF, P), { tone: "hi" })}</g>`;
	H.put(`st.${category}.plunger`, [x, -1, (tipZ + BEAM_Z - 13) / 2], plunger, [H.R.solid(A.solid(VF, [[tipZ, 2.4], [BEAM_Z - 13, 1.3]], { name: `st.${category}.plunger` }))], { bias: -0.2 });
	return { category, x, at: at([x, -1, BEAM_Z - 13]).map(f2) };
});

// carriage: a sled on four bushings with the change (a sealed case) on top
const CAR = { x: -10, y: -16, w: 20, d: 28, r: 2 };
const car = [];
for (const [bx, by] of [[-7, -12], [7, -12], [-7, 8], [7, 8]]) car.push(H.S(k.slabOf({ x: bx - 2.5, y: by - 1, w: 5, d: 6, r: 1 }, RAIL_Z - 1, 1.8, P, 2, 0), { tone: "lo" }));
car.push(H.S(k.slabOf(CAR, RAIL_Z + 0.8, 3.4, P, 4, 0.5), { tone: "mid" }));
const CASE = { x: -7, y: -8, w: 14, d: 14, r: 1.4 };
car.push(H.S(k.slabOf(CASE, RAIL_Z + 4.2, 9.8, P, 3, 0.6), { tone: "hi", lit: true }));
car.push(Ln(k.planOutline(k.insetPlan(CASE, 2), RAIL_Z + 14, P, 3), { tone: "lo" }), Dots([at([-1, -1, RAIL_Z + 14])], { size: 0.6, tone: "hi" }));
const firstX = stations[0].x;
H.put("carriage", [0, -2, RAIL_Z + 6], `<g data-part="carriage" transform="${k.translateAlong(P, [firstX, 0, 0])}">${car.join("")}</g>`, [H.R.solid(A.slab({ ...CAR, x: CAR.x + firstX }, RAIL_Z - 1, 15, { name: "carriage" }, 2))], { bias: 1 });

const unit = k.translateAlong(P, [1, 0, 0]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
const press = k.translateAlong(P, [0, 0, -STROKE]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);
const wf = F.workflows[0];
emit(NAME, H, {
	W, Ht, back,
	fig: "Fig 3",
	title: "Sequencer",
	hint: "← → workflow · hover a station",
	readout: `${wf.name} · 1/${wf.steps.length} · ${wf.steps[0].alts[0].skill}`,
	keys: [
		{ mark: "lit", label: "The change, riding the carriage" },
		{ mark: "raised", label: `${N} stations: the categories a workflow reaches for` },
	],
	caption: `A workflow is a route along the rail. The carriage stops under each step's station in order and the plunger strikes; ${F.workflows.map((w) => `${w.name} has ${w.steps.length} step${w.steps.length === 1 ? "" : "s"}`).join(", ")}.`,
	label: `A sequencer rail with ${N} press stations on a gantry, one per category, and a carriage that runs each workflow's steps in order.`,
	data: { stations, unit, press, home: firstX, workflows: F.workflows },
	css: `[data-part="carriage"]{transition:transform .7s var(--st-ease)}[data-plunger]{transition:transform .16s var(--st-ease)}\n@media (prefers-reduced-motion:reduce){[data-part="carriage"],[data-plunger]{transition:none}}`,
	digest,
});
