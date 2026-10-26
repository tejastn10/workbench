"use client";

// The page figures. Each player says what one item does; Figure runs the rest.

import "@/generated/cabinet.css";
import "@/generated/sequencer.css";
import "@/generated/stamps.css";
import CABINET from "@/generated/cabinet.json";
import SEQ from "@/generated/sequencer.json";
import STAMPS from "@/generated/stamps.json";
import { type Ctx, Figure, nearest, type Player } from "./figure";

// ── Fig 2: parts cabinet ────────────────────────────────────────────────────
const cabinet: Player = {
	count: () => CABINET.drawers.length,
	reset: (ctx) => ctx.move("[data-drawer]", null),
	show(i, ctx) {
		const d = CABINET.drawers[i];
		ctx.move("[data-drawer]", null);
		ctx.move(`[data-drawer="${i}"]`, d.pull);
		ctx.say(`${d.category} · ${d.skills} skill${d.skills === 1 ? "" : "s"}`);
		return 1500;
	},
	pick: (x, y) =>
		nearest(
			CABINET.drawers.map((d) => d.at),
			x,
			y,
			14
		),
};

// ── Fig 3: sequencer rail ───────────────────────────────────────────────────
let seqWorkflow = 0;
let seqLap = 0;
const seqStep = (i: number) => {
	const wf = SEQ.workflows[seqWorkflow];
	const step = wf.steps[i];
	const alt = step.alts[seqLap % step.alts.length];
	return { wf, alt, station: SEQ.stations.findIndex((s) => s.category === alt.category) };
};
const carriageTo = (ctx: Ctx, x: number) =>
	ctx.move('[data-part="carriage"]', [SEQ.unit[0] * x, SEQ.unit[1] * x]);
const sequencer: Player = {
	count: () => SEQ.workflows[seqWorkflow].steps.length,
	reset(ctx) {
		seqLap++;
		carriageTo(ctx, SEQ.home);
	},
	show(i, ctx) {
		const { wf, alt, station } = seqStep(i);
		ctx.say(`${wf.name} · ${i + 1}/${wf.steps.length} · ${alt.skill}`);
		if (station < 0) return 600;
		carriageTo(ctx, SEQ.stations[station].x);
		const strike = () => {
			ctx.move(`[data-plunger="${station}"]`, SEQ.press);
			ctx.later(() => ctx.move(`[data-plunger="${station}"]`, null), 260);
		};
		if (ctx.still) strike();
		else ctx.later(strike, 760);
		return 1700;
	},
	pick(x, y) {
		const s = nearest(
			SEQ.stations.map((st) => st.at),
			x,
			y,
			16
		);
		if (s < 0) return -1;
		return SEQ.workflows[seqWorkflow].steps.findIndex((step) =>
			step.alts.some((a) => a.category === SEQ.stations[s].category)
		);
	},
	key(dir, ctx) {
		seqWorkflow = (seqWorkflow + dir + SEQ.workflows.length) % SEQ.workflows.length;
		carriageTo(ctx, SEQ.home);
		const { wf, alt } = seqStep(0);
		ctx.say(`${wf.name} · 1/${wf.steps.length} · ${alt.skill}`);
	},
};

// ── Fig 4: stamp rack ───────────────────────────────────────────────────────
const stamps: Player = {
	count: () => STAMPS.stamps.length,
	lapRest: 1600,
	reset(ctx) {
		ctx.move("[data-stamp]", null);
		ctx.on("[data-imprint]", false);
	},
	show(i, ctx) {
		const s = STAMPS.stamps[i];
		const sel = `[data-stamp="${i}"]`;
		ctx.say(`${s.name} · docs/templates/${s.name}.md`);
		ctx.on("[data-imprint]", false);
		if (ctx.still) {
			ctx.on("[data-imprint]", true);
			return 1500;
		}
		const path: [readonly number[] | null, number][] = [
			[s.lift, 450],
			[s.ink, 450],
			[s.inked, 260],
			[s.ink, 380],
			[s.hover, 520],
			[s.press, 300],
			[s.hover, 420],
			[s.lift, 520],
			[null, 500],
		];
		let t = 0;
		path.forEach(([to, ms], n) => {
			ctx.later(() => {
				ctx.move(sel, to);
				if (n === 6) ctx.on("[data-imprint]", true);
			}, t);
			t += ms;
		});
		return t + 900;
	},
	pick: (x, y) =>
		nearest(
			STAMPS.stamps.map((s) => s.at),
			x,
			y,
			14
		),
};

export const Cabinet = () => <Figure name="cabinet" player={cabinet} ratio="620/460" />;
export const Sequencer = () => <Figure name="sequencer" player={sequencer} ratio="660/420" />;
export const Stamps = () => <Figure name="stamps" player={stamps} ratio="620/420" />;
