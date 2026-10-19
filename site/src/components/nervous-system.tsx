"use client";

// Fig 1 on the home page. The markup is built by figures/nervous-system/build.mjs
// with the anatomy kit and fetched as a static file, so the page itself stays light.
// This component only plays it: each workflow step sends an impulse down the spine,
// node to node along a nerve, and presses the finger that owns the step's category.

import { useEffect, useRef } from "react";
import "@/generated/anatomy.css";
import DATA from "@/generated/nervous-system.json";
import { asset } from "@/lib/asset";

type Pt = [number, number];
type Alt = { category: string; skill: string };
type Hop = { at: Pt; ms: number; node?: string; hidden?: boolean };

const FINGER_OF = new Map(DATA.fingers.map((f) => [f.category, f.index]));
const SPINE_MS = 6; // per spine sample (3 world units)
const NODE_MS = 70; // per node of Ranvier
const TENDON_MS = 26;
const PRESS_MS = 260;
const STEP_MS = 1700;
const WORKFLOW_GAP_MS = 1400;
const IDLE_MS = 4000;

function hopsTo(finger: number): Hop[] {
	const nerve = DATA.nerves[finger < 5 ? 0 : 1];
	const hops: Hop[] = nerve.spine.map((at) => ({ at: at as Pt, ms: SPINE_MS }));
	hops.push({ at: nerve.ganglion as Pt, ms: NODE_MS });
	for (const node of nerve.nodes) hops.push({ at: node.at as Pt, ms: NODE_MS, node: node.id });
	hops.push({ at: nerve.port as Pt, ms: NODE_MS, hidden: true });
	const tendon = DATA.tendons[finger] as Pt[];
	for (const [i, at] of tendon.entries())
		hops.push({ at, ms: i === 0 ? 120 : TENDON_MS * 6, hidden: i === 0 });
	hops.push({ at: DATA.fingers[finger].tip as Pt, ms: TENDON_MS * 4 });
	return hops;
}

export function NervousSystem() {
	const host = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const root = host.current;
		if (!root) return;
		let disposed = false;
		const timers = new Set<ReturnType<typeof setTimeout>>();
		const later = (fn: () => void, ms: number) => {
			const t = setTimeout(() => {
				timers.delete(t);
				fn();
			}, ms);
			timers.add(t);
		};
		const clearAll = () => {
			for (const t of timers) clearTimeout(t);
			timers.clear();
		};
		let frame = 0;
		let cleanup = () => {};

		fetch(asset("/figures/nervous-system.html"))
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
			};
			if (!found.stage || !found.svg || !found.readout || !found.pulse) return () => {};
			const stage: HTMLElement = found.stage;
			const svg: SVGSVGElement = found.svg;
			const readout: HTMLElement = found.readout;
			const pulse: SVGGElement = found.pulse;
			const sulci = [...svg.querySelectorAll<SVGGElement>("[data-sulci]")];
			const still = matchMedia("(prefers-reduced-motion: reduce)");
			const [px, py] = DATA.press;

			let workflow = 0;
			let step = 0;
			let lap = 0;
			let touring = !still.matches;
			let visible = false;
			let busy = false;
			let idle: ReturnType<typeof setTimeout> | undefined;

			const say = (text: string) => {
				if (readout.textContent !== text) readout.textContent = text;
			};
			const flash = (els: Element[], ms: number) => {
				for (const el of els) el.setAttribute("data-on", "");
				later(() => {
					for (const el of els) el.removeAttribute("data-on");
				}, ms);
			};
			const press = (finger: number, down: boolean) => {
				const key = finger === 4 || finger === 5 ? "key:space" : `key:${finger}`;
				const els = svg.querySelectorAll<SVGGElement>(
					`[data-move="finger:${finger}"],[data-move="${key}"]`
				);
				for (const el of els) el.style.transform = down ? `translate(${px}px, ${py}px)` : "";
			};

			function fire(finger: number, done?: () => void) {
				if (still.matches) {
					flash([...svg.querySelectorAll(`[data-tendon="${finger}"]`)], 900);
					done?.();
					return;
				}
				busy = true;
				flash(sulci, 420);
				const hops = hopsTo(finger);
				let i = 0;
				let t0 = 0;
				const first = hops[0].at;
				pulse.setAttribute("transform", `translate(${first[0]} ${first[1]})`);
				pulse.setAttribute("opacity", "1");
				const tendon = svg.querySelector(`[data-tendon="${finger}"]`);
				const tick = (now: number) => {
					if (!t0) t0 = now;
					// hops[i + 1].ms is the time it takes to travel from hop i to hop i + 1
					while (i < hops.length - 1 && now - t0 >= hops[i + 1].ms) {
						t0 += hops[i + 1].ms;
						i++;
						const node = hops[i].node;
						if (node)
							flash(
								[svg.querySelector(`[data-node="${node}"]`)].filter((el) => el !== null),
								380
							);
						if (tendon && i === hops.length - 4) flash([tendon], 700);
					}
					if (i >= hops.length - 1) {
						pulse.setAttribute("opacity", "0");
						press(finger, true);
						later(() => {
							press(finger, false);
							busy = false;
							done?.();
						}, PRESS_MS);
						frame = 0;
						return;
					}
					const a = hops[i].at;
					const b = hops[i + 1].at;
					// Saltatory: inside the nerve the impulse sits on a node, then jumps.
					const share =
						hops[i + 1].node || hops[i].node ? 0 : Math.min(1, (now - t0) / hops[i + 1].ms);
					pulse.setAttribute(
						"transform",
						`translate(${a[0] + (b[0] - a[0]) * share} ${a[1] + (b[1] - a[1]) * share})`
					);
					pulse.setAttribute("opacity", hops[i].hidden ? "0" : "1");
					frame = requestAnimationFrame(tick);
				};
				frame = requestAnimationFrame(tick);
			}

			const stepText = () => {
				const wf = DATA.workflows[workflow];
				const s = wf.steps[step];
				const alt: Alt = s.alts[lap % s.alts.length];
				return { wf, alt, text: `${wf.name} · ${step + 1}/${wf.steps.length} · ${alt.skill}` };
			};

			function next() {
				if (disposed || !touring || !visible || busy) return;
				const { wf, alt, text } = stepText();
				say(text);
				const finger = FINGER_OF.get(alt.category);
				const advance = () => {
					step++;
					let wait = STEP_MS;
					if (step >= wf.steps.length) {
						step = 0;
						lap++;
						workflow = (workflow + 1) % DATA.workflows.length;
						wait += WORKFLOW_GAP_MS;
					}
					later(next, wait);
				};
				if (finger === undefined) advance();
				else fire(finger, () => later(advance, 0));
			}

			const resumeLater = () => {
				clearTimeout(idle);
				idle = setTimeout(() => {
					touring = !still.matches;
					next();
				}, IDLE_MS);
			};

			function nearestFinger(event: PointerEvent) {
				const ctm = svg.getScreenCTM();
				if (!ctm) return -1;
				const p = new DOMPoint(event.clientX, event.clientY).matrixTransform(ctm.inverse());
				let best = -1;
				let dist = 22;
				for (const f of DATA.fingers) {
					const d = Math.hypot(f.tip[0] - p.x, f.tip[1] - p.y - 10);
					if (d < dist) {
						dist = d;
						best = f.index;
					}
				}
				return best;
			}
			let hovered = -1;
			const onMove = (event: PointerEvent) => {
				const finger = nearestFinger(event);
				if (finger === hovered) return;
				hovered = finger;
				if (finger < 0) return;
				touring = false;
				clearAll();
				cancelAnimationFrame(frame);
				pulse.setAttribute("opacity", "0");
				for (let i = 0; i < 10; i++) press(i, false);
				busy = false;
				const f = DATA.fingers[finger];
				say(`${f.category} · ${f.skills} skill${f.skills === 1 ? "" : "s"}`);
				fire(finger);
				resumeLater();
			};
			const onKey = (event: KeyboardEvent) => {
				const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
				if (!dir) return;
				event.preventDefault();
				clearAll();
				cancelAnimationFrame(frame);
				busy = false;
				for (let i = 0; i < 10; i++) press(i, false);
				workflow = (workflow + dir + DATA.workflows.length) % DATA.workflows.length;
				step = 0;
				say(stepText().text);
				touring = true;
				if (still.matches) {
					const finger = FINGER_OF.get(stepText().alt.category);
					if (finger !== undefined) fire(finger);
					return;
				}
				next();
			};

			const io = new IntersectionObserver(
				(entries) => {
					const was = visible;
					visible = entries[entries.length - 1].isIntersecting;
					if (visible && !was) next();
				},
				{ rootMargin: "80px 0px" }
			);
			io.observe(stage);
			stage.addEventListener("pointermove", onMove);
			stage.addEventListener("pointerleave", () => {
				hovered = -1;
			});
			stage.addEventListener("keydown", onKey);

			return () => {
				io.disconnect();
				clearTimeout(idle);
				stage.removeEventListener("pointermove", onMove);
				stage.removeEventListener("keydown", onKey);
			};
		}

		return () => {
			disposed = true;
			clearAll();
			cancelAnimationFrame(frame);
			cleanup();
		};
	}, []);

	return (
		<div ref={host} className="iso ns-host min-w-0">
			<div className="iso-figure">
				<div className="iso-plate ns-placeholder" aria-hidden />
			</div>
		</div>
	);
}
