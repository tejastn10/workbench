// Fig 7 (/install): a launch pad. The rocket is the workbench; one swing arm per install
// route reaches it from the service tower. Pick a route and its arm swings clear —
// any one of them is enough to get the skills off the pad. Routes come from the
// README's "Which route" table.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { A, digestOf, emit, f2, fresh, G, k, REPO, setup } from "../lib.mjs";

const NAME = "launch";
const ROUTES = [...readFileSync(join(REPO, "README.md"), "utf8").matchAll(/^\| `([^`]+)` \| ([^|]+) \|/gm)].map((m) => ({ route: m[1], tools: m[2].trim() }));
ROUTES.push({ route: "AGENTS.md", tools: "Codex (native), all" });
const digest = digestOf(fileURLToPath(import.meta.url), ROUTES);
if (fresh(NAME, digest)) {
	console.log(`${NAME}: up to date`);
	process.exit(0);
}

const W = 560;
const Ht = 560;
const PLATE = { x: -96, y: -96, w: 192, d: 192, r: 12 };
const TOP = 236;
const TX = 46;
const TY = -12;
const TS = 18;
const MOUNT_Z = 24;
const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [0, 0, TOP], [TX + TS, TY, 222]], W, Ht, { pad: 22, azimuth: 45 });
const H = setup(P, NAME);
const { at, Ln, Dots, path3 } = H;
const back = [H.plate(PLATE)];

// flame trench and the mount on four legs
const TR = { x: -14, y: -34, w: 28, d: 126, r: 3 };
back.push(H.S(k.slabOf(TR, 0, 0.3, P, 3), { tone: "lo", flat: true }), Ln(k.planOutline(k.insetPlan(TR, 3), 0.3, P, 3), { tone: "faint" }));
const MT = { x: -26, y: -26, w: 52, d: 52, r: 5 };
for (const [x, y] of k.corners(MT, 5)) H.box("mount.leg", { x: x - 3.2, y: y - 3.2, w: 6.4, d: 6.4, r: 1 }, 0, MOUNT_Z - 6, {}, { steps: 2 });
H.box("mount.table", MT, MOUNT_Z - 6, 6, {}, { steps: 6, bevel: 0.8, inner: Ln(k.sideSeam(MT, MOUNT_Z - 3, P, 6), { tone: "faint" }), extra: Ln(k.planOutline(k.insetPlan(MT, 4), MOUNT_Z, P, 6), { tone: "lo" }) });
for (const [x, y] of k.corners({ x: -15, y: -15, w: 30, d: 30, r: 0 }, 0)) H.box("mount.clamp", { x: x - 2.6, y: y - 2.6, w: 5.2, d: 5.2, r: 0.8 }, MOUNT_Z, 5, {}, { steps: 2 });

// the rocket: skirt, booster, interstage, upper stage, fairing
const AX = H.VZ(0, 0);
const Z0 = MOUNT_Z;
H.disc("booster.skirt", AX, Z0, Z0 + 5, 14.2, {}, { bevel: 0.4 });
H.turned("booster", AX, [[Z0 + 5, 13.4], [Z0 + 112, 13.4]], { tone: "hi" }, { inner: Ln([40, 68, 96].map((s) => G.arcOf(AX, Z0 + s, 13.4, P)).join(""), { tone: "faint" }) });
for (const a of [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]) H.box("gridfin", { x: Math.cos(a) * 16 - 2.6, y: Math.sin(a) * 16 - 2.6, w: 5.2, d: 5.2, r: 0.4 }, Z0 + 100, 1.2, {}, { steps: 2, bevel: 0 });
H.disc("interstage", AX, Z0 + 112, Z0 + 122, 13.4, {}, { inner: Ln(G.arcOf(AX, Z0 + 117, 13.4, P), { tone: "lo" }) });
H.turned("stage2", AX, [[Z0 + 122, 11.8], [Z0 + 170, 11.8]], { tone: "hi" }, { inner: Ln(G.arcOf(AX, Z0 + 146, 11.8, P), { tone: "faint" }) });
const L = 42;
const ogive = (s) => 11.8 * Math.sqrt(Math.max(0, 1 - ((s - (Z0 + 170)) / L) ** 2));
H.turned("fairing", AX, Array.from({ length: 17 }, (_, i) => { const s = Z0 + 170 + (L * i) / 16; return [s, ogive(s), 1]; }), { tone: "hi", lit: true });

// service tower: four posts, a deck every 21 units
const posts = [[TX, TY], [TX + TS, TY], [TX, TY + TS], [TX + TS, TY + TS]];
for (const [x, y] of posts) H.disc("tower.post", H.VZ(x, y), 0, 222, 1.7, {}, { steps: 12 });
for (let z = 20; z <= 210; z += 21) {
	const B = 1.4;
	H.box("tower.beam", { x: TX + 1.7, y: TY - B / 2, w: TS - 3.4, d: B, r: 0.3 }, z, 1.4, {}, { steps: 2, bevel: 0 });
	H.box("tower.beam", { x: TX + 1.7, y: TY + TS - B / 2, w: TS - 3.4, d: B, r: 0.3 }, z, 1.4, {}, { steps: 2, bevel: 0 });
	H.box("tower.beam", { x: TX - B / 2, y: TY + 1.7, w: B, d: TS - 3.4, r: 0.3 }, z, 1.4, {}, { steps: 2, bevel: 0 });
	H.box("tower.beam", { x: TX + TS - B / 2, y: TY + 1.7, w: B, d: TS - 3.4, r: 0.3 }, z, 1.4, {}, { steps: 2, bevel: 0 });
}
const HINGE_X = TX - 0.7 - 1.2;
H.disc("tower.hinge", H.VZ(HINGE_X, 0), 20, 222, 1.2, {}, { steps: 12 });
const ARM_END = HINGE_X - 1.2;
H.box("tower.cap", { x: TX - 3, y: TY - 3, w: TS + 6, d: TS + 6, r: 1 }, 222, 3, {}, { steps: 2, bevel: 0.5 });

// swing arms, one per route; each moves as a group and swings back toward the tower
const ARM_Z = ROUTES.map((_, i) => Z0 + 46 + i * 40);
const arms = ROUTES.map((r, i) => {
	const z = ARM_Z[i];
	const parts = [];
	parts.push(H.S(k.slabOf({ x: 13.4 + 0.6, y: -3, w: ARM_END - 14, d: 6, r: 1 }, z, 3.4, P, 2, 0.4), { tone: "mid" }));
	parts.push(H.S(k.slabOf({ x: 13.4 + 0.6, y: -4, w: 3, d: 8, r: 0.6 }, z - 1, 5.4, P, 2, 0.3), { tone: "hi" }));
	const shape = H.R.solid(A.box([13.4 + 0.6, -3, z], [ARM_END, 3, z + 3.4], { name: `arm.${i}` }));
	H.put(`arm.${i}`, [30, 0, z + 1.7], `<g data-arm="${i}">${parts.join("")}</g>`, [shape], { bias: 0.4 });
	return { ...r, at: at([24, 0, z + 2]).map(f2), back: k.translateAlong(P, [18, 0, 0]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number) };
});
const lift = k.translateAlong(P, [0, 0, 26]).match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number);

emit(NAME, H, {
	W, Ht, back,
	fig: "Fig 7",
	title: "Four routes up",
	hint: "Hover an arm",
	readout: `${ROUTES[0].route} · ${ROUTES[0].tools}`,
	keys: [
		{ mark: "lit", label: "The payload: the skills and AGENTS.md" },
		{ mark: "raised", label: `${ROUTES.length} swing arms: one per install route` },
	],
	caption: `${ROUTES.length} ways onto any agent: ${ROUTES.map((r) => r.route).join(", ")}. Each is an arm on the same tower — pick the one that fits the machine, and it swings clear.`,
	label: `A rocket on a launch pad beside a service tower with ${ROUTES.length} swing arms, one per install route.`,
	data: { arms, lift },
	css: `[data-arm]{transition:transform .6s var(--st-ease)}\n@media (prefers-reduced-motion:reduce){[data-arm]{transition:none}}`,
	digest,
});
