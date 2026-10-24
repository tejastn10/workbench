"use client";

// Fig 1 on the home page. The markup is built by figures/station/build.mjs with the
// anatomy kit and fetched as a static file, so the page itself stays light. This
// component only plays it: an agent's capsule docks on the core, each workflow step
// sends a signal along the truss to the module that owns the step's category, and the
// capsule undocks for the next agent. Timing follows the motion-design skill's
// "premium" personality: one curve, slow dock, short lights.

import { useEffect, useRef } from "react";
import "@/generated/anatomy.css";
import DATA from "@/generated/station.json";
import { asset } from "@/lib/asset";

type Pt = [number, number];

const MODULE_OF = new Map(DATA.modules.map((m) => [m.category, m]));
const DOCK_MS = 1100;
const SIGNAL_PX_PER_MS = 0.32;
const LIGHT_MS = 900;
const STEP_MS = 1500;
const UNDOCK_MS = 1300;
const IDLE_MS = 4000;
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function lengthOf(path: Pt[]) {
	let total = 0;
	for (let i = 1; i < path.length; i++)
		total += Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
	return total;
}
function pointAt(path: Pt[], d: number): Pt {
	for (let i = 1; i < path.length; i++) {
		const [ax, ay] = path[i - 1];
		const [bx, by] = path[i];
		const seg = Math.hypot(bx - ax, by - ay);
		if (d <= seg) return [ax + ((bx - ax) * d) / seg, ay + ((by - ay) * d) / seg];
		d -= seg;
	}
	return path[path.length - 1];
}

export function Station() {
	const host = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = host.current;
		if (!root) return;
		let disposed = false;
		let cleanup = () => {};

		fetch(asset("/figures/station.html"))
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
			const found = {
				stage: root.querySelector<HTMLElement>(".iso-stage"),
				svg: root.querySelector<SVGSVGElement>("svg"),
				readout: root.querySelector<HTMLElement>("[data-readout]"),
				pulse: root.querySelector<SVGGElement>('[data-part="pulse"]'),
				capsule: root.querySelector<SVGGElement>('[data-part="capsule"]'),
			};
			if (!found.stage || !found.svg || !found.readout || !found.pulse || !found.capsule)
				return () => {};
			const stage: HTMLElement = found.stage;
			const svg: SVGSVGElement = found.svg;
			const readout: HTMLElement = found.readout;
			const pulse: SVGGElement = found.pulse;
			const capsule: SVGGElement = found.capsule;
			const still = matchMedia("(prefers-reduced-motion: reduce)");
			const [ux, uy] = DATA.capsule;

			const timers = new Set<ReturnType<typeof setTimeout>>();
			const later = (fn: () => void, ms: number) => {
				const t = setTimeout(() => {
					timers.delete(t);
					fn();
				}, ms);
				timers.add(t);
			};
			let frame = 0;
			const stopAll = () => {
				for (const t of timers) clearTimeout(t);
				timers.clear();
				cancelAnimationFrame(frame);
				pulse.setAttribute("opacity", "0");
			};

			const say = (text: string) => {
				if (readout.textContent !== text) readout.textContent = text;
			};
			const light = (id: string, on: boolean) => {
				for (const el of svg.querySelectorAll(`.it[data-mod="${id}"] .iso-solid`)) {
					if (on) el.setAttribute("data-lit", "");
					else el.removeAttribute("data-lit");
				}
			};
			const dock = (docked: boolean) => {
				capsule.style.transform = docked ? "" : `translate(${ux}px, ${uy}px)`;
			};

			function signal(path: Pt[], done: () => void) {
				const total = lengthOf(path);
				const ms = Math.max(420, total / SIGNAL_PX_PER_MS);
				let t0 = 0;
				pulse.setAttribute("opacity", "1");
				const tick = (now: number) => {
					if (!t0) t0 = now;
					const t = Math.min(1, (now - t0) / ms);
					const [x, y] = pointAt(path, ease(t) * total);
					pulse.setAttribute("transform", `translate(${x} ${y})`);
					if (t < 1) frame = requestAnimationFrame(tick);
					else {
						pulse.setAttribute("opacity", "0");
						done();
					}
				};
				frame = requestAnimationFrame(tick);
			}

			let run = 0;
			let step = 0;
			let lap = 0;
			let touring = !still.matches;
			let visible = false;
			let playing = false;
			let idle: ReturnType<typeof setTimeout> | undefined;

			const current = () => {
				const wf = DATA.workflows[run % DATA.workflows.length];
				const agent = DATA.agents[run % DATA.agents.length];
				return { wf, agent };
			};
			const stepText = () => {
				const { wf, agent } = current();
				const s = wf.steps[step];
				const alt = s.alts[lap % s.alts.length];
				return {
					alt,
					text: `${agent} · ${wf.name} · ${step + 1}/${wf.steps.length} · ${alt.skill}`,
				};
			};

			function beginRun() {
				if (disposed || !touring || !visible) {
					playing = false;
					return;
				}
				playing = true;
				step = 0;
				dock(false);
				say(stepText().text);
				later(() => {
					dock(true);
					later(nextStep, DOCK_MS);
				}, 60);
			}
			function nextStep() {
				if (disposed || !touring || !visible) {
					playing = false;
					return;
				}
				const { wf } = current();
				const { alt, text } = stepText();
				say(text);
				const mod = MODULE_OF.get(alt.category);
				const advance = () => {
					step++;
					if (step < wf.steps.length) later(nextStep, STEP_MS - LIGHT_MS / 2);
					else
						later(() => {
							dock(false);
							run++;
							lap++;
							later(beginRun, UNDOCK_MS);
						}, STEP_MS);
				};
				if (!mod) {
					advance();
					return;
				}
				signal(mod.path as Pt[], () => {
					light(mod.id, true);
					later(() => light(mod.id, false), LIGHT_MS);
					advance();
				});
			}

			const resumeLater = () => {
				clearTimeout(idle);
				idle = setTimeout(() => {
					touring = !still.matches;
					if (!playing) beginRun();
				}, IDLE_MS);
			};

			let hovered = "";
			const onMove = (event: PointerEvent) => {
				const ctm = svg.getScreenCTM();
				if (!ctm) return;
				const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
				let best: (typeof DATA.modules)[number] | undefined;
				let dist = 26;
				for (const m of DATA.modules) {
					const d = Math.hypot(m.tip[0] - p.x, m.tip[1] - p.y);
					if (d < dist) {
						dist = d;
						best = m;
					}
				}
				const id = best?.id ?? "";
				if (id === hovered) return;
				if (hovered) light(hovered, false);
				hovered = id;
				if (!best) return;
				touring = false;
				playing = false;
				stopAll();
				for (const m of DATA.modules) light(m.id, false);
				dock(true);
				light(best.id, true);
				say(`${best.category} · ${best.skills} skill${best.skills === 1 ? "" : "s"}`);
				resumeLater();
			};
			const onLeave = () => {
				if (hovered) light(hovered, false);
				hovered = "";
			};
			const onKey = (event: KeyboardEvent) => {
				const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
				if (!dir) return;
				event.preventDefault();
				stopAll();
				for (const m of DATA.modules) light(m.id, false);
				const n = DATA.workflows.length * DATA.agents.length;
				run = (run + dir + n) % n;
				step = 0;
				if (still.matches) {
					say(stepText().text);
					return;
				}
				touring = true;
				beginRun();
			};

			const io = new IntersectionObserver(
				(entries) => {
					visible = entries[entries.length - 1].isIntersecting;
					if (visible && touring && !playing) beginRun();
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
				stopAll();
				stage.removeEventListener("pointermove", onMove);
				stage.removeEventListener("pointerleave", onLeave);
				stage.removeEventListener("keydown", onKey);
			};
		}

		return () => {
			disposed = true;
			cleanup();
		};
	}, []);

	return (
		<div ref={host} className="iso st-host min-w-0">
			<div className="iso-figure">
				<div className="iso-plate st-placeholder" aria-hidden />
			</div>
		</div>
	);
}
