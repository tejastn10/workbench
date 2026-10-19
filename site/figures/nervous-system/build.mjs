// Fig 1 for the home page, built with the vendored anatomy kit (skills/visual/anatomy).
// A brain on a vertebral column sends impulses down two myelinated nerves to a pair
// of mechanical hands on a keyboard. The step sequences come from the workflow skills,
// and each step fires the finger that owns that step's skill category.
//
//   node figures/nervous-system/build.mjs            writes src/generated/nervous-system.json
//   node figures/nervous-system/build.mjs --page     also writes a standalone page for the kit's checks
//   node figures/nervous-system/build.mjs --audit    runs the kit's geometry audit
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const HERE = dirname(fileURLToPath(import.meta.url));
const SITE = join(HERE, "..", "..");
const REPO = join(SITE, "..");
const KIT = join(REPO, "skills", "visual", "anatomy", "kit");
const OUT_DIR = join(SITE, "src", "generated");
const OUT = join(OUT_DIR, "nervous-system.json");
const HTML_OUT = join(SITE, "public", "figures", "nervous-system.html");
const CSS_OUT = join(OUT_DIR, "anatomy.css");

const k = await import(join(KIT, "iso-kit.mjs"));
const G = await import(join(KIT, "lathe.mjs"));
const { tubePieces, tubeSvg } = await import(join(KIT, "tube.mjs"));
const A = await import(join(KIT, "audit.mjs"));

const AUDIT = process.argv.includes("--audit");
const PAGE = process.argv.includes("--page");

// ── truth: workflows → steps → categories ───────────────────────────────────
const WORKFLOWS_DIR = join(REPO, "skills", "workflows");
const WORKFLOW_ORDER = ["ship-change", "new-feature", "handle-incident", "adopt-repo"];

function stepsOf(text) {
	const steps = [];
	for (const line of text.split("\n")) {
		const row = line.match(/^\|\s*(\d+|)\s*\|(.*)$/);
		if (!row) continue;
		const skills = [...row[2].matchAll(/`([a-z-]+)\/([a-z<>-]+)`/g)].map((m) => ({ category: m[1], skill: `${m[1]}/${m[2]}` }));
		if (row[1]) steps.push({ n: Number(row[1]), alts: skills });
		else if (steps.length && skills.length && !steps[steps.length - 1].closed) {
			const last = steps[steps.length - 1];
			if (!last.alts.length) last.open = true;
			if (last.open) last.alts.push(...skills);
		}
	}
	return steps.filter((step) => step.alts.length).map(({ n, alts }) => ({ n, alts }));
}

const skillCount = new Map();
for (const category of readdirSync(join(REPO, "skills"))) {
	const dir = join(REPO, "skills", category);
	if (!existsSync(join(dir, "README.md"))) continue;
	skillCount.set(category, readdirSync(dir).filter((name) => existsSync(join(dir, name, "SKILL.md"))).length);
}

const workflows = WORKFLOW_ORDER.filter((name) => existsSync(join(WORKFLOWS_DIR, name, "SKILL.md"))).map((name) => ({
	name,
	steps: stepsOf(readFileSync(join(WORKFLOWS_DIR, name, "SKILL.md"), "utf8")),
}));

// Ten fingers, ten hands-on categories. Left hand pinky → thumb, then right thumb → pinky.
const FINGER_CATEGORY = ["planning", "design", "data", "queues", "observability", "quality", "pr-review", "security", "deployment", "incident"];

// Skip the build when nothing it reads has changed.
const hash = createHash("sha256");
hash.update(readFileSync(fileURLToPath(import.meta.url)));
for (const f of ["iso-kit.mjs", "lathe.mjs", "tube.mjs"]) hash.update(readFileSync(join(KIT, f)));
hash.update(JSON.stringify({ workflows, counts: [...skillCount] }));
const digest = hash.digest("hex").slice(0, 16);
if (!AUDIT && !PAGE && existsSync(OUT) && existsSync(CSS_OUT) && existsSync(HTML_OUT)) {
	try {
		if (JSON.parse(readFileSync(OUT, "utf8")).digest === digest) {
			console.log("nervous-system: up to date");
			process.exit(0);
		}
	} catch {}
}

// ── world ───────────────────────────────────────────────────────────────────
const W = 660;
const H = 470;
const PLATE = { x: -178, y: -154, w: 356, d: 216, r: 10 };
const PLATE_H = 10;
const FOOT_H = 5;

const SPINE = [0, -100];
const VERT_R = 7.2;
const VERT_H = 6.6;
const VERT_PITCH = 8.4;
const VERTS = 9;
const VERT_Z0 = 7;
const SPINE_TOP = VERT_Z0 + (VERTS - 1) * VERT_PITCH + VERT_H;

const BRAIN_R = 27;
const BRAIN_L = 84;
const BRAIN_Y0 = SPINE[1] - BRAIN_L * 0.55;
const brainR = (s) => BRAIN_R * Math.sqrt(Math.max(0, 1 - ((s - BRAIN_L / 2) / (BRAIN_L / 2)) ** 2));
const brainSlope = (s) => {
	const c = BRAIN_L / 2;
	const t = (s - c) / c;
	const root = Math.sqrt(Math.max(1e-6, 1 - t * t));
	return (-BRAIN_R * t) / (c * root);
};
const STEM_R = 6.4;
const stemS = SPINE[1] - BRAIN_Y0;
const BRAIN_Z = SPINE_TOP + 20 + Math.sqrt(brainR(stemS) ** 2 - STEM_R ** 2);
const STEM_TOP = BRAIN_Z - Math.sqrt(brainR(stemS) ** 2 - STEM_R ** 2);

const KB = { x: -118, y: -18, w: 236, d: 64, r: 4 };
const KB_H = 7;
const COLS = 15;
const PITCH = (KB.w - 8) / COLS;
const ROW_P = 14;
const CAP = { w: 13, d: 12, h: 3.6 };
const CAP_TOP = KB_H + CAP.h;
const keyX = (c) => KB.x + 4 + PITCH * (c + 0.5);
const rowY = (r) => KB.y + 4 + ROW_P * (r + 0.5);
const PRESS = 2.6;

const P = k.fitProjection(
	[...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), ...[-1, 1].flatMap((x) => [0, 0.5, 1].map((t) => [x * BRAIN_R * 0.8, BRAIN_Y0 + BRAIN_L * t, BRAIN_Z + BRAIN_R]))],
	W,
	H,
	{ pad: 22, azimuth: 60, elevation: 30 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const Dots = (points, style) => k.dotsSvg(points, style);
const path3 = (points, closed = false) => k.pathOf(points.map(at), closed);
const f2 = (v) => Math.round(v * 100) / 100;
const pressBy = k.translateAlong(P, [0, 0, -PRESS]);

const R = A.recorder(P);
const record = R.solid;
function put(name, ref, svg, shapes = [], { bias = 0, move, ...rest } = {}) {
	return R.put({ name, at: ref, bias, svg, shapes, piece: "bench", data: move, ...rest });
}
function box(name, plan, z0, h, style = {}, { steps = 3, bevel = 0, extra = "", inner = "", bias = 0, move } = {}) {
	const shape = record(A.slab(plan, z0, h, { name }, steps));
	put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z0 + h / 2], S(k.slabOf(plan, z0, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], { bias, move });
	return shape;
}
function turned(name, F, profile, style = {}, { extra = "", inner = "", bias = 0, smooth, steps, rims, bevel = 0, owner, move, cut, seated } = {}) {
	const opts = { bevel, ...(smooth !== undefined ? { smooth } : {}), ...(steps ? { steps } : {}), ...(rims ? { rims } : {}) };
	const paths = G.solidOf(profile, F, P, opts);
	const mid = (profile[0][0] + profile[profile.length - 1][0]) / 2;
	const shape = record(A.solid(F, profile, { name, owner, radius: smooth?.radius ?? null, ...(cut ? { cut, seated } : {}) }));
	put(name, G.add3(F.o, G.mul3(F.a, mid)), S(paths, { tone: "mid", ...style, inner }) + extra, [shape], { bias, move });
	return shape;
}
const disc = (name, F, s0, s1, r, style, options) => turned(name, F, [[s0, r], [s1, r]], style, options);
function ball(name, c, r, style = {}, { bias = 0, extra = "", move, cut } = {}) {
	const shape = record(A.ball(c, r, { name, ...(cut ? { cut, seated: true } : {}) }));
	put(name, c, S(G.sphereOf(c, r, P, { steps: 32 }), { tone: "mid", ...style }) + extra, [shape], { bias, move });
	return shape;
}

// ── bench ───────────────────────────────────────────────────────────────────
const back = [];
back.push(`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`);
const byDepth = (points) => [...points].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
for (const [x, y] of byDepth(k.corners(PLATE, 22))) {
	back.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
	back.push(S(k.cylinder(x, y, 5.4, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
}
back.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: Ln(k.sideSeam(PLATE, -4, P, 8), { tone: "faint" }) }));
back.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
const plateScrews = k.corners(PLATE, 10);
back.push(Ln(plateScrews.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
back.push(Dots(plateScrews.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
record(A.slab(PLATE, -PLATE_H, PLATE_H, { name: "stand.plate", ground: true }, 8));

const STRIP = { x: PLATE.x + 20, y: PLATE.y + PLATE.d - 12, w: 150, d: 6, r: 1 };
back.push(S(k.slabOf(STRIP, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
const ticks = k.topTicks(STRIP.x + 4, STRIP.x + STRIP.w - 4, 4, 5, STRIP.y, 0.6, [1.8, 3.4], P);
back.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
back.push(Dots([at([STRIP.x + 2, STRIP.y + 3, 0.6]), at([STRIP.x + STRIP.w - 2, STRIP.y + 3, 0.6])], { size: 0.45 }));
const LABEL = { x: PLATE.x + PLATE.w - 66, y: PLATE.y + PLATE.d - 18, w: 46, d: 11, r: 1.2 };
back.push(S(k.slabOf(LABEL, 0, 0.8, P, 4), { tone: "lo" }));
back.push(Ln(k.planOutline(k.insetPlan(LABEL, 1.4), 0.8, P, 4), { tone: "faint" }));
back.push(k.faceTextSvg(k.topMatrix([LABEL.x + LABEL.w / 2, LABEL.y + LABEL.d / 2 + 1.3], 0.8, P, "x"), "WORKBENCH", { size: 3.6, tone: "mid", anchor: "middle" }));
back.push(Dots([at([LABEL.x + 2.6, LABEL.y + LABEL.d / 2, 0.8]), at([LABEL.x + LABEL.w - 2.6, LABEL.y + LABEL.d / 2, 0.8])], { size: 0.45 }));

// ── spine ───────────────────────────────────────────────────────────────────
const [SX, SY] = SPINE;
const VF = G.frameOf([SX, SY, 0], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
disc("spine.pedestal", VF, 0, 3, 15, { tone: "lo" }, { steps: 64, bevel: 0.6 });
disc("spine.collar", VF, 3, VERT_Z0, 10.5, { tone: "mid" }, { steps: 56, bevel: 0.5, extra: Dots(G.dotsOf(VF, 3, 12.8, 8, P, { all: true, phase: Math.PI / 8 }), { size: 0.45, tone: "mid" }) });
for (let i = 0; i < VERTS; i++) {
	const z0 = VERT_Z0 + i * VERT_PITCH;
	turned(`spine.v${i}`, VF, [[z0, VERT_R], [z0 + 0.9, VERT_R + 0.7], [z0 + VERT_H - 0.9, VERT_R + 0.7], [z0 + VERT_H, VERT_R]], { tone: "hi", crease: "lo" }, { steps: 40 });
	for (const side of [-1, 1]) {
		const F = G.frameOf([SX + side * Math.sqrt((VERT_R + 0.7) ** 2 - 1.7 ** 2), SY, z0 + VERT_H / 2], [side, 0, 0], [0, 1, 0], [0, 0, 1]);
		turned(`spine.v${i}.process${side}`, F, [[0, 1.7], [5.2, 1.3], [6.4, 0.6]], { tone: "mid" }, { steps: 16 });
	}
	if (i < VERTS - 1) disc(`spine.disc${i}`, VF, z0 + VERT_H, z0 + VERT_PITCH, VERT_R - 1.1, { tone: "lo" }, { steps: 40 });
}

// ── brain ───────────────────────────────────────────────────────────────────
const SF = G.frameOf([SX, SY, SPINE_TOP], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
const BF0 = G.frameOf([0, BRAIN_Y0, BRAIN_Z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
const brainProfile = Array.from({ length: 29 }, (_, i) => [(BRAIN_L * i) / 28, brainR((BRAIN_L * i) / 28), 1]);
const CEREBRUM = record(A.solid(BF0, brainProfile.map(([s, r]) => [s, r]), { name: "brain.cerebrum", radius: brainR }));
const stemH = STEM_TOP - SPINE_TOP;
turned("brain.stem", SF, [[0, 5.4], [stemH * 0.25, 5.7, 1], [stemH * 0.55, 7.8, 1], [stemH * 0.8, 7.2, 1], [stemH, STEM_R]], { tone: "hi", crease: "lo" }, { cut: [CEREBRUM], seated: true });
const CEREB_R = 10;
for (const side of [-1, 1]) {
	const sC = 15;
	const cx = side * 10.5;
	const topZ = BRAIN_Z - Math.sqrt(Math.max(0, brainR(sC) ** 2 - cx ** 2));
	ball(`brain.cerebellum${side}`, [cx, BRAIN_Y0 + sC, topZ - CEREB_R + 0.1], CEREB_R, { tone: "mid" }, { cut: [CEREBRUM] });
}
const surface = (s, angle) => G.pointOf(BF0, s, brainR(s), angle);
function sulcus(samples) {
	const list = [];
	for (let i = 0; i < samples.length - 1; i++) {
		const [s0, a0] = samples[i];
		const [s1, a1] = samples[i + 1];
		const facing = Math.min(G.facingOf(BF0, a0, P, brainSlope(s0)), G.facingOf(BF0, a1, P, brainSlope(s1)));
		const ends = Math.min(G.fadeOf(Math.min(s0, BRAIN_L - s0), [3, 14]), G.fadeOf(Math.min(s1, BRAIN_L - s1), [3, 14]));
		const alpha = G.fadeOf(facing, [0.04, 0.4]) * ends;
		if (alpha > 0.02) list.push({ d: path3([surface(s0, a0), surface(s1, a1)]), alpha });
	}
	return list;
}
const gyri = [];
const UP = Math.PI / 2;
for (const toward of [-1, 1]) {
	for (let j = 0; j < 7; j++) {
		const a0 = UP + toward * (0.2 + j * 0.24);
		const pts = [];
		for (let s = 2; s <= BRAIN_L - 2; s += 1) pts.push([s, a0 + toward * (0.06 * Math.sin(0.38 * s + 1.9 * j) + 0.035 * Math.sin(1.07 * s + 3 * j))]);
		gyri.push(...sulcus(pts));
	}
	for (const [sc, depth] of [[16, 0.8], [30, 1], [44, 1.2], [58, 1], [70, 0.7]]) {
		const pts = [];
		for (let a = 0.12; a <= 1.9; a += 0.04) pts.push([sc + 2.2 * depth * Math.sin(6 * a + sc), UP + toward * a]);
		gyri.push(...sulcus(pts));
	}
}
const deep = [];
for (const toward of [-1, 1]) {
	const lateral = [];
	for (let s = 30; s <= 74; s += 1) lateral.push([s, UP + toward * (1.95 - (s - 30) * 0.008 + 0.04 * Math.sin(0.5 * s))]);
	deep.push(...sulcus(lateral));
}
const fissure = [];
for (let s = 3; s <= BRAIN_L - 3; s += 1) fissure.push([s, UP + 0.012 * Math.sin(0.6 * s)]);
deep.push(...sulcus(fissure));
put(
	"brain.cerebrum",
	G.add3(BF0.o, G.mul3(BF0.a, BRAIN_L / 2)),
	S(G.solidOf(brainProfile, BF0, P, { smooth: { slope: brainSlope, radius: brainR } }), {
		tone: "hi",
		inner: `<g data-sulci>${k.fadedSvg(gyri, { tone: "lo" })}${k.fadedSvg(deep, { tone: "mid" })}</g>`,
	}),
	[CEREBRUM],
);

// ── keyboard ────────────────────────────────────────────────────────────────
// Row 0 is nearest the hands (space row), row 2 the home row.
box("kb.case", KB, 0, KB_H, { tone: "mid" }, { steps: 4, bevel: 0.8, inner: Ln(k.sideSeam(KB, 2.4, P, 4), { tone: "faint" }) });
const KEYS = new Map();
const keyAt = (c, r) => `${c},${r}`;
for (let r = 0; r < 4; r++) {
	for (let c = 0; c < COLS; c++) {
		if (r === 0 && c > 4 && c <= 10) continue;
		const wide = r === 0 && c === 4;
		const w = wide ? PITCH * 6 + CAP.w : CAP.w;
		const plan = { x: keyX(c) - CAP.w / 2, y: rowY(r) - CAP.d / 2, w, d: CAP.d, r: 1.8 };
		KEYS.set(wide ? "space" : keyAt(c, r), plan);
	}
}
const HOME = { left: [1, 2, 3, 4], right: [10, 11, 12, 13] };
const fingerKey = [keyAt(1, 2), keyAt(2, 2), keyAt(3, 2), keyAt(4, 2), "space", "space", keyAt(10, 2), keyAt(11, 2), keyAt(12, 2), keyAt(13, 2)];
for (const [id, plan] of KEYS) {
	const finger = fingerKey.indexOf(id);
	const live = finger >= 0;
	const move = id === "space" ? "key:space" : live ? `key:${finger}` : undefined;
	box(`key.${id}`, plan, KB_H, CAP.h, { tone: live ? "hi" : "mid", crease: live ? "lo" : "faint" }, {
		steps: 2,
		bevel: live ? 0.5 : 0,
		move,
		extra: Ln(k.planOutline(k.insetPlan(plan, 1.6), CAP_TOP, P, 3), { tone: "faint" }),
	});
}

// ── hands ───────────────────────────────────────────────────────────────────
// Forearms come forward from the spine; fingers point at the viewer onto the home row.
const FINGERS = [];
const LEN = [0.8, 0.95, 1, 0.93];
const HANDS = [-1, 1].map((side) => {
	const cols = side < 0 ? HOME.left : [...HOME.right].reverse();
	return { side, cols, cx: (keyX(cols[0]) + keyX(cols[3])) / 2 };
});
const PALM_Z0 = 19;
const PALM_TOP = 30.4;
const WRIST_Z = (PALM_Z0 + PALM_TOP) / 2;
const dir = (deg, L) => [0, -L * Math.cos((deg * Math.PI) / 180), L * Math.sin((deg * Math.PI) / 180)];

// Bones meet their joint balls rim on sphere: the bone's end face sits inside the ball,
// recorded as seated and cut by the ball so the audit sees the true contact.
function chain(name, joints, radii, balls, move, base) {
	const shapes = [base];
	joints.forEach((p, i) => {
		if (i > 0) shapes[i] = ball(`${name}.joint${i}`, p, balls[i], { tone: i === joints.length - 1 ? "hi" : "mid" }, { move });
	});
	for (let i = 0; i < joints.length - 1; i++) {
		const a = joints[i];
		const b = joints[i + 1];
		const L = G.len3(G.sub3(b, a));
		const r = radii[i];
		const s0 = Math.sqrt(Math.max(0, balls[i] ** 2 - r ** 2));
		const s1 = L - Math.sqrt(Math.max(0, balls[i + 1] ** 2 - r ** 2));
		disc(`${name}.bone${i}`, G.frameAlong(a, G.unit3(G.sub3(b, a))), s0, s1, r, { tone: "mid" }, { steps: 24, move, cut: [shapes[i], shapes[i + 1]], seated: true });
	}
}
const ccw = (pts) => {
	const area = pts.reduce((a, [x, y], i) => a + x * pts[(i + 1) % pts.length][1] - pts[(i + 1) % pts.length][0] * y, 0);
	return area < 0 ? [...pts].reverse() : pts;
};

const KNUCKLE_Y = rowY(2) - 1.2 - 9 * Math.cos((62 * Math.PI) / 180) - 13 * Math.cos((34 * Math.PI) / 180) - 20 * Math.cos(0.12);
const fingerLines = [];
for (const hand of HANDS) {
	const knuckles = [];
	hand.cols.forEach((col, j) => {
		const f = LEN[j];
		const index = hand.side < 0 ? j : 9 - j;
		const g = 0.9 + 0.1 * f;
		const rd = 2.6 * g;
		const tip = [keyX(col), rowY(2) - 1.2, CAP_TOP + rd];
		const dip = G.add3(tip, dir(62, 9 * f));
		const pip = G.add3(dip, dir(34, 13 * f));
		const mcp = G.add3(pip, [0, -20 * f * Math.cos(0.12), -20 * f * Math.sin(0.12)]);
		mcp[1] = KNUCKLE_Y;
		mcp[2] = PALM_TOP - 4.8;
		const balls = [4.8, 3.9 * g, 3.3 * g, rd];
		const knuckle = ball(`hand${hand.side}.mcp${j}`, mcp, balls[0], { tone: "mid" });
		chain(`finger${index}`, [mcp, pip, dip, tip], [3.4 * g, 2.9 * g, 2.5 * g], balls, `finger:${index}`, knuckle);
		knuckles.push(mcp);
		FINGERS[index] = { index, category: FINGER_CATEGORY[index], tip };
	});
	const inner = hand.side < 0 ? 1 : -1;
	const kx = knuckles.map((p) => p[0]);
	const xIn = hand.side < 0 ? Math.max(...kx) : Math.min(...kx);
	const xOut = hand.side < 0 ? Math.min(...kx) : Math.max(...kx);
	const front = Math.max(...knuckles.map((p) => p[1]));
	const PALM_BACK = Math.min(...knuckles.map((p) => p[1])) - 34;
	hand.back = PALM_BACK;
	const ring = [
		[xOut - inner * 6.5, knuckles[0][1] - 6],
		...knuckles.map((p) => [p[0], p[1] - 4.8]),
		[xIn + inner * 9, front - 10],
		[xIn + inner * 11, PALM_BACK + 12],
		[hand.cx + inner * 10, PALM_BACK],
		[hand.cx - inner * 10, PALM_BACK],
		[xOut - inner * 8, PALM_BACK + 14],
	];
	const hull = ccw(G.hullOf(ring));
	const wristPt = [hand.cx, PALM_BACK, PALM_TOP];
	const lines = [];
	const tendon = (index, mid, end) => {
		const pts = [wristPt, mid, end];
		fingerLines[index] = pts.map((q) => at(q).map(f2));
		lines.push(`<path class="iso-line ns-tendon" data-tone="faint" data-tendon="${index}" d="${path3(pts)}"/>`);
	};
	knuckles.forEach((p, j) => tendon(hand.side < 0 ? j : 9 - j, [p[0] * 0.45 + hand.cx * 0.55, PALM_BACK + 15, PALM_TOP], [p[0], p[1] - 4.8, PALM_TOP]));
	// thumb
	const tIndex = hand.side < 0 ? 4 : 5;
	const tipT = [-inner * 24, rowY(0) + 1, CAP_TOP + 2.8];
	const cmc = [xIn + inner * 15.4, PALM_BACK + 12, PALM_Z0 + 4.4];
	const mcpT = G.add3(tipT, [-inner * 9, -14, 8.6]);
	const ipT = G.add3(tipT, [-inner * 4, -6.5, 4.6]);
	const base = ball(`hand${hand.side}.cmc`, cmc, 4.4, { tone: "mid" });
	chain(`finger${tIndex}`, [cmc, mcpT, ipT, tipT], [3.5, 3.1, 2.6], [4.4, 3.9, 3.3, 2.8], `finger:${tIndex}`, base);
	tendon(tIndex, [hand.cx + inner * 7, PALM_BACK + 6, PALM_TOP], [xIn + inner * 11, PALM_BACK + 12, PALM_TOP]);
	FINGERS[tIndex] = { index: tIndex, category: FINGER_CATEGORY[tIndex], tip: tipT };
	put(
		`hand${hand.side}.palm`,
		[hand.cx, (front + PALM_BACK) / 2, (PALM_Z0 + PALM_TOP) / 2],
		S(k.extrude(hull, PALM_Z0, PALM_TOP - PALM_Z0, P, { bevel: 0.8 }), { tone: "hi", crease: "lo", inner: Ln(k.ringSeam(hull, PALM_Z0 + 3, P), { tone: "faint" }) }) +
			lines.join("") +
			Dots([at([hand.cx - 6, PALM_BACK + 5, PALM_TOP]), at([hand.cx + 6, PALM_BACK + 5, PALM_TOP])], { size: 0.45, tone: "mid" }),
		[record(A.extruded(hull, PALM_Z0, PALM_TOP - PALM_Z0, { name: `hand${hand.side}.palm` }))],
	);

	// forearm cuff on a rest, reaching back toward the spine
	const CF = G.frameOf([hand.cx, PALM_BACK, WRIST_Z], [0, -1, 0], [1, 0, 0], [0, 0, 1]);
	const CUFF_L = 28;
	turned(`hand${hand.side}.cuff`, CF, [[0, 5.8], [4, 5.8, 1], [9, 7.6, 1], [14, 9.8, 1], [CUFF_L, 9.8]], { tone: "mid" }, {
		inner: Ln([17, 23].map((s) => G.arcOf(CF, s, 9.8, P)).join(""), { tone: "faint" }),
	});
	box(`hand${hand.side}.rest`, { x: hand.cx - 15, y: PALM_BACK - 26, w: 30, d: 11, r: 3 }, 0, WRIST_Z - 9.8, { tone: "lo" }, { steps: 6, bevel: 0.6 });
	hand.port = [hand.cx, PALM_BACK - CUFF_L, WRIST_Z];
}

// ── nerves ──────────────────────────────────────────────────────────────────
const NERVE_R = 1.9;
const AXON_R = 0.85;
const NODE_PITCH = 9;
const NODE_LEN = 1.8;
const CLAMP_T = 2;
const NERVE_Z = 4.4;
const NERVES = [];
for (const hand of HANDS) {
	const side = hand.side;
	// spinal nerves leave through the gap between two vertebrae
	const exitZ = VERT_Z0 + VERT_PITCH + VERT_H + (VERT_PITCH - VERT_H) / 2;
	const gang = [SX + side * 18.4, SY, exitZ];
	const root = [SX + side * (VERT_R - 1.5), SY, exitZ];
	disc(`nerve${side}.root`, G.frameAlong(root, [side, 0, 0]), 0, G.len3(G.sub3(gang, root)) - Math.sqrt(3.8 ** 2 - 1.2 ** 2), 1.2, { tone: "mid" }, { steps: 16 });
	ball(`nerve${side}.ganglion`, gang, 3.8, { tone: "hi" });
	const start = [gang[0] + side * Math.sqrt(3.8 ** 2 - NERVE_R ** 2), gang[1], gang[2]];
	const route = G.fillet(
		[start, [side * 34, SY, exitZ], [hand.cx, SY, exitZ + 3], hand.port],
		13,
		12,
		{ P, tube: NERVE_R },
	);
	const total = G.pathLength(route);
	const clamps = [];
	const nodes = [];
	for (let s = 9; s < total - 8; s += NODE_PITCH) if (!clamps.some((c) => Math.abs(c - s) < 4)) nodes.push(s);
	const gaps = [...clamps.map((c) => [c - CLAMP_T / 2, c + CLAMP_T / 2]), ...nodes.map((n) => [n - NODE_LEN / 2, n + NODE_LEN / 2])].sort((a, b) => a[0] - b[0]);
	R.route(`nerve${side}`, route, NERVE_R, { gaps, limp: true, piece: "bench" });
	tubePieces(route, NERVE_R, P, { maxLength: 14, spacing: 1.4, gaps }).forEach((piece, i) =>
		put(`nerve${side}:${i}`, piece.mid, tubeSvg(piece, { tone: "mid" }), [A.tube(piece.points, piece.radii)], { route: `nerve${side}` }),
	);
	const nodeIds = [];
	nodes.forEach((s, i) => {
		const axon = G.cut(route, s - NODE_LEN / 2 - 0.2, s + NODE_LEN / 2 + 0.2);
		const centre = G.pointAlong(route, s);
		const id = `n${side < 0 ? "l" : "r"}${i}`;
		const c2 = at(centre).map(f2);
		nodeIds.push({ id, at: c2 });
		put(
			`nerve${side}.node${i}`,
			centre,
			tubePieces(axon, AXON_R, P, { maxLength: 6, spacing: 0.6 }).map((p) => tubeSvg(p, { tone: "hi" })).join("") +
				`<circle class="ns-node" data-node="${id}" cx="${c2[0]}" cy="${c2[1]}" r="${f2(AXON_R * KS * 1.15)}"/>`,
			[A.tube(axon, AXON_R, { name: `nerve${side}.axon${i}`, owner: `nerve${side}` })],
			{ bias: 0.05 },
		);
	});
	clamps.forEach((c, i) => {
		const centre = G.pointAlong(route, c);
		const foot = { x: centre[0] - 4, y: centre[1] - 4, w: 8, d: 8, r: 1.2 };
		const footH = NERVE_Z - NERVE_R - 1.4;
		box(`nerve${side}.clampfoot${i}`, foot, 0, footH, { tone: "lo" }, { extra: Dots([at([foot.x + 1.6, foot.y + 4, footH]), at([foot.x + 6.4, foot.y + 4, footH])], { size: 0.4, tone: "mid" }) });
		disc(`nerve${side}.clamp${i}`, G.frameAlong(centre, G.tangentAlong(route, c)), -CLAMP_T / 2, CLAMP_T / 2, NERVE_R + 1.4, { tone: "mid" }, { steps: 24, owner: `nerve${side}` });
	});
	const spinePts = [];
	for (let z = STEM_TOP; z >= exitZ; z -= 3) spinePts.push(at([SX + VERT_R * 0.5, SY + VERT_R * 0.87 + 0.6, z]).map(f2));
	NERVES.push({ side, nodes: nodeIds, spine: spinePts, ganglion: at(gang).map(f2), port: at(hand.port).map(f2) });
}

// ── order and markup ────────────────────────────────────────────────────────
A.settle(R, P);
R.items.sort((a, b) => a.key - b.key);
const groups = R.items.map((item) => {
	const move = item.data ? ` data-move="${item.data}"` : "";
	return `<g class="it"${move}>${item.svg}</g>`;
});

const pulse = `<g class="ns-pulse" data-part="pulse" opacity="0"><circle r="6" class="ns-pulse-halo"/><circle r="3.4" class="ns-pulse-halo"/><circle r="1.9" class="ns-pulse-core"/></g>`;

const LABEL_TEXT =
	"A brain on a vertebral column stands at the back of a bench. Two myelinated nerves leave the spine through their ganglia, run along the bench on clamps, and enter the wrist cuffs of two mechanical hands resting on a keyboard. Each workflow step sends an impulse that hops from node to node along a nerve and presses the key under the finger that owns that step's category.";
const svg = k.figureSvg({ width: W, height: H, label: LABEL_TEXT, body: [...back, `<g class="ns-items">${groups.join("")}</g>`, pulse] });

const totalSkills = [...skillCount.values()].reduce((a, b) => a + b, 0);
const firstStep = workflows[0].steps[0];
const readout = `${workflows[0].name} · 1/${workflows[0].steps.length} · ${firstStep.alts[0].skill}`;
const nodeCount = NERVES.reduce((n, nerve) => n + nerve.nodes.length, 0);
const html = k.plateHtml({
	fig: "Fig 1",
	title: "How the bench thinks",
	hint: "Hover a finger · ← → workflow",
	readout,
	keys: [
		{ mark: "lit", label: "The impulse: one workflow step, brain to finger" },
		{ mark: "raised", label: "Ten fingers: the ten categories a workflow reaches for" },
		{ mark: "edge", label: `Two myelinated nerves, ${nodeCount} nodes of Ranvier` },
	],
	caption: `The brain is the workflows layer: it reads AGENTS.md and decides which skill runs next. Each step travels down the spine and along a nerve, jumping node to node the way a real impulse does (saltatory conduction, slowed here from about 100 m/s), and presses the key under the finger whose category owns that skill. The sequences are read from the ${workflows.length} workflow skills at build time; ${totalSkills} skills in ${skillCount.size} categories in all.`,
	body: `<div class="iso-stage ns-stage" tabindex="0" role="group" aria-label="Workbench nervous system. Left and right arrows switch workflow; hover a finger to fire it.">${svg}</div>`,
});

const data = {
	digest,
	readout,
	press: pressBy.match(/translate\(([-\d.]+) ([-\d.]+)\)/).slice(1).map(Number),
	nerves: NERVES,
	tendons: fingerLines,
	fingers: FINGERS.map((f) => ({ index: f.index, category: f.category, skills: skillCount.get(f.category) ?? 0, tip: at(f.tip).map(f2) })),
	workflows: workflows.map((w) => ({ name: w.name, steps: w.steps.map((s) => ({ n: s.n, alts: s.alts })) })),
};

// The kit's CSS, keyed to the site's theme class instead of data-theme.
const css =
	k.ISO_CSS.replace('.iso[data-theme="light"]{', "html:not(.dark) .iso{") +
	`
.iso{--anatomy-mono:var(--font-geist-mono),ui-monospace,monospace}
.ns-stage{outline:none;touch-action:pan-y}
.ns-node{fill:var(--anatomy-paper);stroke:var(--anatomy-mid);stroke-width:.5;transition:fill .5s var(--anatomy-ease),stroke .5s var(--anatomy-ease)}
.ns-node[data-on]{fill:var(--anatomy-lit);stroke:var(--anatomy-lit);transition:none}
.ns-tendon{transition:stroke .6s var(--anatomy-ease)}
.ns-tendon[data-on]{stroke:var(--anatomy-lit);transition:none}
[data-sulci]{transition:opacity .8s var(--anatomy-ease)}
[data-sulci][data-on]{opacity:.55;transition:none}
.ns-pulse-core{fill:var(--anatomy-lit)}
.ns-pulse-halo{fill:var(--anatomy-lit);opacity:.16}
.it[data-move]{transition:transform .14s var(--anatomy-ease)}
.ns-placeholder{aspect-ratio:660/470}
.ns-host .iso-figure{margin:0}
.ns-host .iso-legend{background:var(--anatomy-page-bg,hsl(var(--background)))}
@media (prefers-reduced-motion:reduce){.ns-node,.ns-tendon,[data-sulci],.it[data-move]{transition:none}}
`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, JSON.stringify(data));
mkdirSync(dirname(HTML_OUT), { recursive: true });
writeFileSync(HTML_OUT, html);
writeFileSync(CSS_OUT, css);
console.log(`nervous-system: ${R.items.length} items · ${(html.length / 1024).toFixed(0)} KB · ${nodeCount} nodes · scale ${KS.toFixed(3)}`);

if (PAGE) {
	const theme = process.argv.includes("--light") ? "light" : "dark";
	const page = k.pageHtml({ title: "Nervous system", theme, body: html, width: 760 }).replace("</style>", `${css.replace(/html:not\(\.dark\) \.iso\{/, '.iso[data-theme="light"]{')}</style>`);
	const file = join(process.env.PAGE_DIR ?? HERE, theme === "light" ? "nervous-system-light.html" : "nervous-system.html");
	writeFileSync(file, page);
	console.log("wrote", file);
}

A.auditOrExit(R, P, {});
