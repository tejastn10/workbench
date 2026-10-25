// Fig 5 (/mcp): a ground station. One dish per MCP server (and gh) stands on the bench,
// each cabled to a receiver rack — the agent's side. A signal runs down whichever
// link is in use: library docs, repo wikis, a Notion workspace, GitHub history.
import { fileURLToPath } from "node:url";
import { A, digestOf, emit, f2, facts, fresh, G, k, setup } from "../lib.mjs";

const NAME = "ground-station";
const F = facts();
const digest = digestOf(fileURLToPath(import.meta.url), F.mcp);
if (fresh(NAME, digest)) {
	console.log(`${NAME}: up to date`);
	process.exit(0);
}

const W = 640;
const Ht = 420;
const N = F.mcp.length;
const GAP = 46;
const PLATE = { x: -((N - 1) * GAP) / 2 - 40, y: -60, w: (N - 1) * GAP + 80, d: 128, r: 10 };
const DY = -24; // dish row
const RACK = { x: -34, y: 30, w: 68, d: 20, r: 2 };
const RACK_H = 26;

const P = k.fitProjection([...k.boxCorners(PLATE, -15, 0), [PLATE.x + 20, DY, 74], [PLATE.x + PLATE.w - 20, DY, 74]], W, Ht, { pad: 22, azimuth: 58 });
const H = setup(P, NAME);
const { at, Ln, Dots, path3 } = H;
const back = [H.plate(PLATE)];

// receiver rack: case, front panel with one connector per link, vents and feet
H.box("rack.case", RACK, 0, RACK_H, {}, { steps: 4, bevel: 0.8, inner: Ln(k.sideSeam(RACK, 6, P, 4), { tone: "faint" }) });
const face = RACK.y + RACK.d;
const vents = [];
for (let i = 0; i < 6; i++) vents.push(path3([[RACK.x + 8 + i * 4, face + 0.02, 14], [RACK.x + 10 + i * 4, face + 0.02, 14], [RACK.x + 10 + i * 4, face + 0.02, 22], [RACK.x + 8 + i * 4, face + 0.02, 22]], true));
H.put("rack.vents", [RACK.x + 18, face, 18], Ln(vents.join(""), { tone: "lo" }), [H.R.solid(A.box([RACK.x + 8, face, 14], [RACK.x + 32, face + 0.05, 22], { name: "rack.vents" }))], { bias: 0.1 });
H.put("rack.lamp", [RACK.x + RACK.w - 8, face, 19], Dots([at([RACK.x + RACK.w - 8, face + 0.1, 19])], { size: 1.1, tone: "hi" }), [H.R.solid(A.ball([RACK.x + RACK.w - 8, face + 0.6, 19], 0.7, { name: "rack.lamp" }))], { bias: 0.1 });

// dishes: base, mast, yoke, the dish itself and its feed; a cable from each base to its port on the rack's back
const links = F.mcp.map((name, i) => {
	const x = -((N - 1) * GAP) / 2 + i * GAP;
	const VF = H.VZ(x, DY);
	H.turned(`dish.${name}.base`, VF, [[0, 11], [2, 11], [3, 9], [6, 9]], {}, { bevel: 0.5, extra: Dots(G.dotsOf(VF, 6, 7.4, 6, P, { all: true }), { size: 0.4, tone: "mid" }) });
	H.disc(`dish.${name}.mast`, VF, 6, 34, 2.6, {}, { inner: Ln(G.arcOf(VF, 20, 2.6, P), { tone: "faint" }) });
	H.box(`dish.${name}.yoke`, { x: x - 5, y: DY - 2, w: 10, d: 4, r: 0.8 }, 34, 5, {}, { steps: 2 });
	const axis = G.unit3([0.62, -0.42, 0.66]);
	const hub = [x, DY, 39 + 4.2];
	const HUB = H.ball(`dish.${name}.hub`, hub, 4.2, {});
	const seat = Math.sqrt(4.2 ** 2 - 2.4 ** 2);
	const DF = G.frameAlong(G.add3(hub, G.mul3(axis, seat)), axis);
	H.turned(`dish.${name}.reflector`, DF, [[0, 2.4], [1.4, 8, 1], [3.2, 12.6, 1], [4, 14]], { tone: "hi" }, { smooth: true, cut: [HUB], seated: true, extra: k.fadedSvg(G.ribsOf(DF, 1.4, 3.2, 8, 12, P, { r1: 12.6, fade: [0.1, 0.55] }), { tone: "faint" }) });
	const feedF = G.frameAlong(G.add3(hub, G.mul3(axis, seat + 4)), axis);
	H.disc(`dish.${name}.feed`, feedF, 0, 16, 0.9, {}, { steps: 12 });
	const horn = G.add3(hub, G.mul3(axis, seat + 4 + 16 + Math.sqrt(1.8 ** 2 - 0.9 ** 2)));
	H.ball(`dish.${name}.horn`, horn, 1.8, { tone: "hi" });
	const port = [RACK.x + 10 + (i * (RACK.w - 20)) / Math.max(1, N - 1), RACK.y, 4.5];
	const route = H.cable(`cable.${name}`, [[x, DY + 9, 4.5], [x, DY + 22, 4.5], [port[0], DY + 36, 4.5], [port[0], RACK.y - 1.4, 4.5]], 1.2, { bend: 5 });
	H.disc(`port.${name}`, G.frameOf([port[0], RACK.y, 4.5], [0, -1, 0], [1, 0, 0], [0, 0, 1]), 0, 1.4, 2.2, {}, { steps: 16 });
	return { name, at: at(hub).map(f2), path: route.map((p) => at(p).map(f2)), horn: at(horn).map(f2) };
});

emit(NAME, H, {
	W, Ht, back,
	fig: "Fig 5",
	title: "Ground station",
	hint: "Hover a dish",
	readout: `${F.mcp[0]} · linked`,
	keys: [
		{ mark: "lit", label: "The link in use" },
		{ mark: "raised", label: `${N} dishes: ${F.mcp.join(", ")}` },
	],
	caption: `Each dish is one source the agent can reach beyond the repo: ${F.mcp.join(", ")}. Three are MCP servers from .mcp.json; GitHub goes through the gh CLI instead, cabled to the same rack.`,
	label: `A ground station with ${N} dish antennas cabled to a receiver rack, one per MCP server and one for the gh CLI.`,
	data: { links },
	css: `.fg-signal-core{fill:var(--anatomy-lit)}.fg-signal-halo{fill:var(--anatomy-lit);opacity:.14}`,
	front: [`<g data-part="pulse" opacity="0"><circle r="5" class="fg-signal-halo"/><circle r="1.8" class="fg-signal-core"/></g>`],
	digest,
});
