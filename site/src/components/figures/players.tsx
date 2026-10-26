"use client";

// The page figures. Each player says what one item does; Figure runs the rest.

import "@/generated/cabinet.css";
import "@/generated/ground-station.css";
import "@/generated/launch.css";
import "@/generated/lock.css";
import "@/generated/sequencer.css";
import "@/generated/stamps.css";
import CABINET from "@/generated/cabinet.json";
import GROUND from "@/generated/ground-station.json";
import LAUNCH from "@/generated/launch.json";
import LOCK from "@/generated/lock.json";
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

// ── Fig 5: ground station ───────────────────────────────────────────────────
const VIA: Record<string, string> = { gh: "linked through the gh CLI" };
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const ground: Player = {
	count: () => GROUND.links.length,
	show(i, ctx) {
		const link = GROUND.links[i];
		ctx.say(`${link.name} · ${VIA[link.name] ?? "linked over MCP"}`);
		const pulse = ctx.svg.querySelector('[data-part="pulse"]');
		if (!pulse || ctx.still) return 1500;
		const pts = link.path;
		const seg = pts.slice(1).map((p, n) => Math.hypot(p[0] - pts[n][0], p[1] - pts[n][1]));
		const total = seg.reduce((a, b) => a + b, 0);
		const ms = Math.max(600, total / 0.22);
		let t0 = 0;
		const step = (now: number) => {
			if (!t0) t0 = now;
			const t = Math.min(1, (now - t0) / ms);
			let d = ease(t) * total;
			let n = 0;
			while (n < seg.length - 1 && d > seg[n]) d -= seg[n++];
			const a = pts[n];
			const b = pts[n + 1];
			const f = seg[n] ? d / seg[n] : 0;
			pulse.setAttribute(
				"transform",
				`translate(${a[0] + (b[0] - a[0]) * f} ${a[1] + (b[1] - a[1]) * f})`
			);
			pulse.setAttribute("opacity", t < 1 ? "1" : "0");
			if (t < 1) requestAnimationFrame(step);
		};
		requestAnimationFrame(step);
		return ms + 900;
	},
	pick: (x, y) =>
		nearest(
			GROUND.links.map((l) => l.at),
			x,
			y,
			22
		),
};

// ── Fig 6: pin tumbler ──────────────────────────────────────────────────────
const N_PINS = LOCK.pins.length;
const lock: Player = {
	count: () => N_PINS + 1,
	lapRest: 2200,
	reset(ctx) {
		ctx.move('[data-part="key"]', LOCK.out);
		for (const [n, p] of LOCK.pins.entries()) ctx.move(`[data-pin="${n}"]`, p.down);
		ctx.say(`${N_PINS} conventions · key out`);
	},
	show(i, ctx) {
		if (i === 0) {
			ctx.move('[data-part="key"]', null);
			ctx.say("key in · lifting the pins");
			return 1000;
		}
		const p = LOCK.pins[i - 1];
		ctx.move('[data-part="key"]', null);
		ctx.move(`[data-pin="${i - 1}"]`, null);
		ctx.say(
			i === N_PINS
				? `${N_PINS} of ${N_PINS} on the shear line · commit`
				: `${i}/${N_PINS} · ${p.title}`
		);
		return i === N_PINS ? 1800 : 650;
	},
	pick(x, y) {
		const hit = nearest(
			LOCK.pins.map((p) => p.at),
			x,
			y,
			10
		);
		return hit < 0 ? -1 : hit + 1;
	},
};

// ── Fig 7: launch pad ───────────────────────────────────────────────────────
const launch: Player = {
	count: () => LAUNCH.arms.length,
	lapRest: 1800,
	reset: (ctx) => ctx.move("[data-arm]", null),
	show(i, ctx) {
		const a = LAUNCH.arms[i];
		ctx.move(`[data-arm="${i}"]`, a.back);
		ctx.say(`${a.route} · ${a.tools}`);
		return 1500;
	},
	pick: (x, y) =>
		nearest(
			LAUNCH.arms.map((a) => a.at),
			x,
			y,
			16
		),
};

export const Cabinet = () => <Figure name="cabinet" player={cabinet} ratio="620/460" />;
export const Sequencer = () => <Figure name="sequencer" player={sequencer} ratio="660/420" />;
export const Stamps = () => <Figure name="stamps" player={stamps} ratio="620/420" />;
export const GroundStation = () => <Figure name="ground-station" player={ground} ratio="640/420" />;
export const Lock = () => <Figure name="lock" player={lock} ratio="640/420" />;
export const Launch = () => <Figure name="launch" player={launch} ratio="560/560" />;
