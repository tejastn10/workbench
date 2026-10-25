"use client";

// Plays a page figure built by figures/<name>/build.mjs. The markup is fetched as a
// static file; a player only says what one "item" does (pull a drawer, press a stamp)
// and the shell runs the idle tour, hover, arrow keys, offscreen pause and reduced motion.

import { useEffect, useRef } from "react";
import "@/generated/anatomy.css";
import { asset } from "@/lib/asset";

export type Ctx = {
	svg: SVGSVGElement;
	still: boolean;
	say: (text: string) => void;
	move: (selector: string, by: readonly number[] | null) => void;
	on: (selector: string, value: boolean) => void;
	later: (fn: () => void, ms: number) => void;
};

export type Player = {
	count: () => number;
	// Run item i; return how long to hold before the next one.
	show: (i: number, ctx: Ctx) => number;
	// Put the figure back at rest (between laps, before hover).
	reset?: (ctx: Ctx) => void;
	// Which item sits under this point (SVG units), or -1.
	pick: (x: number, y: number) => number;
	// ← / →: optional; defaults to stepping the tour.
	key?: (dir: number, ctx: Ctx) => void;
	lapRest?: number;
};

const IDLE_MS = 4000;

export function Figure({ name, player, ratio }: { name: string; player: Player; ratio: string }) {
	const host = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = host.current;
		if (!root) return;
		let disposed = false;
		let cleanup = () => {};
		fetch(asset(`/figures/${name}.html`))
			.then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
			.then((html) => {
				if (disposed) return;
				root.innerHTML = html;
				cleanup = start(root);
			})
			.catch(() => {
				root.dataset.failed = "";
			});

		function start(root: HTMLElement) {
			const stageEl = root.querySelector<HTMLElement>(".iso-stage");
			const svgEl = root.querySelector<SVGSVGElement>("svg");
			const readoutEl = root.querySelector<HTMLElement>("[data-readout]");
			if (!stageEl || !svgEl || !readoutEl) return () => {};
			const stage: HTMLElement = stageEl;
			const svg: SVGSVGElement = svgEl;
			const readout: HTMLElement = readoutEl;
			const reduced = matchMedia("(prefers-reduced-motion: reduce)");
			const timers = new Set<ReturnType<typeof setTimeout>>();
			const ctx: Ctx = {
				svg,
				still: reduced.matches,
				say: (text) => {
					if (readout.textContent !== text) readout.textContent = text;
				},
				move: (selector, by) => {
					for (const el of svg.querySelectorAll<SVGGElement>(selector))
						el.style.transform = by ? `translate(${by[0]}px, ${by[1]}px)` : "";
				},
				on: (selector, value) => {
					for (const el of svg.querySelectorAll(selector)) {
						if (value) el.setAttribute("data-on", "");
						else el.removeAttribute("data-on");
					}
				},
				later: (fn, ms) => {
					const t = setTimeout(() => {
						timers.delete(t);
						fn();
					}, ms);
					timers.add(t);
				},
			};
			const stop = () => {
				for (const t of timers) clearTimeout(t);
				timers.clear();
			};

			let i = 0;
			let started = false;
			let touring = !reduced.matches;
			let visible = false;
			let playing = false;
			let idle: ReturnType<typeof setTimeout> | undefined;

			function tick() {
				if (disposed || !touring || !visible) {
					playing = false;
					return;
				}
				playing = true;
				if (!started) {
					started = true;
					player.reset?.(ctx);
					ctx.later(tick, 700);
					return;
				}
				const n = player.count();
				if (i >= n) {
					i = 0;
					player.reset?.(ctx);
					ctx.later(tick, player.lapRest ?? 1200);
					return;
				}
				const hold = player.show(i, ctx);
				i++;
				ctx.later(tick, hold);
			}
			const resumeLater = () => {
				clearTimeout(idle);
				idle = setTimeout(() => {
					touring = !reduced.matches;
					if (!playing) tick();
				}, IDLE_MS);
			};

			let hovered = -1;
			const onMove = (event: PointerEvent) => {
				const m = svg.getScreenCTM();
				if (!m) return;
				const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(m.inverse());
				const hit = player.pick(p.x, p.y);
				if (hit === hovered) return;
				hovered = hit;
				if (hit < 0) return;
				touring = false;
				playing = false;
				stop();
				player.reset?.(ctx);
				player.show(hit, { ...ctx, still: true });
				i = hit + 1;
				resumeLater();
			};
			const onLeave = () => {
				hovered = -1;
			};
			const onKey = (event: KeyboardEvent) => {
				const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
				if (!dir) return;
				event.preventDefault();
				stop();
				if (player.key) {
					player.key(dir, ctx);
					i = 0;
				} else {
					player.reset?.(ctx);
					const n = player.count();
					i = (((i - 1 + dir) % n) + n) % n;
					player.show(i, { ...ctx, still: true });
					i++;
				}
				touring = false;
				playing = false;
				resumeLater();
			};
			const io = new IntersectionObserver(
				(entries) => {
					visible = entries[entries.length - 1].isIntersecting;
					if (visible && touring && !playing) tick();
				},
				{ rootMargin: "80px 0px" }
			);
			io.observe(stage);
			stage.addEventListener("pointermove", onMove);
			stage.addEventListener("pointerleave", onLeave);
			stage.addEventListener("keydown", onKey);
			return () => {
				io.disconnect();
				clearTimeout(idle);
				stop();
				stage.removeEventListener("pointermove", onMove);
				stage.removeEventListener("pointerleave", onLeave);
				stage.removeEventListener("keydown", onKey);
			};
		}

		return () => {
			disposed = true;
			cleanup();
		};
	}, [name, player]);

	return (
		<div ref={host} className="iso fg-host min-w-0">
			<div className="iso-figure">
				<div className="iso-plate" style={{ aspectRatio: ratio }} aria-hidden />
			</div>
		</div>
	);
}

// Nearest point within `reach` SVG units, or -1.
export function nearest(points: readonly (readonly number[])[], x: number, y: number, reach = 24) {
	let best = -1;
	let dist = reach;
	points.forEach((p, i) => {
		const d = Math.hypot(p[0] - x, p[1] - y);
		if (d < dist) {
			dist = d;
			best = i;
		}
	});
	return best;
}
