"use client";

// A 3D stage for a figure. The figure enters lying flat like a blueprint on a table and
// stands up as it scrolls into view; after that it tilts toward the pointer in real
// perspective, with a grid floor behind it and a HUD in front on their own depth layers.
// Motion follows the motion-design skill's premium curve; reduced motion gets none.

import { type ReactNode, useEffect, useRef } from "react";

type Props = { children: ReactNode; code: string; label: string };

export function Stage({ children, code, label }: Props) {
	const stageRef = useRef<HTMLDivElement>(null);
	const rigRef = useRef<HTMLDivElement>(null);
	const coordRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const stage = stageRef.current;
		const rig = rigRef.current;
		const coord = coordRef.current;
		if (!stage || !rig || !coord) return;
		// Close the HUD frame on the drawing, above the figure's legend.
		const fit = () => {
			const legend = stage.querySelector<HTMLElement>(".iso-legend");
			const gap = legend ? rig.offsetHeight - legend.offsetTop + 34 : 56;
			stage.style.setProperty("--legend-h", `${gap}px`);
		};
		const ro = new ResizeObserver(fit);
		ro.observe(rig);
		fit();
		const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
		if (still) {
			stage.dataset.in = "";
			stage.dataset.live = "";
			return () => ro.disconnect();
		}
		let live: ReturnType<typeof setTimeout> | undefined;
		const io = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting || stage.dataset.in !== undefined) return;
				stage.dataset.in = "";
				live = setTimeout(() => {
					stage.dataset.live = "";
				}, 1300);
			},
			{ threshold: 0.18 }
		);
		io.observe(stage);

		let rx = 0;
		let ry = 0;
		let tx = 0;
		let ty = 0;
		let frame = 0;
		const step = () => {
			rx += (tx - rx) * 0.08;
			ry += (ty - ry) * 0.08;
			rig.style.setProperty("--rx", `${rx.toFixed(3)}deg`);
			rig.style.setProperty("--ry", `${ry.toFixed(3)}deg`);
			frame = Math.abs(tx - rx) + Math.abs(ty - ry) > 0.01 ? requestAnimationFrame(step) : 0;
		};
		const kick = () => {
			if (!frame) frame = requestAnimationFrame(step);
		};
		const onMove = (event: PointerEvent) => {
			if (stage.dataset.live === undefined) return;
			const box = stage.getBoundingClientRect();
			const x = (event.clientX - box.left) / box.width;
			const y = (event.clientY - box.top) / box.height;
			ty = (x - 0.5) * 12;
			tx = (0.5 - y) * 8;
			coord.textContent = `X ${x.toFixed(3)} · Y ${y.toFixed(3)} · θ ${ty.toFixed(1)}°`;
			kick();
		};
		const onLeave = () => {
			tx = 0;
			ty = 0;
			coord.textContent = "X 0.500 · Y 0.500 · θ 0.0°";
			kick();
		};
		stage.addEventListener("pointermove", onMove);
		stage.addEventListener("pointerleave", onLeave);
		return () => {
			ro.disconnect();
			io.disconnect();
			clearTimeout(live);
			cancelAnimationFrame(frame);
			stage.removeEventListener("pointermove", onMove);
			stage.removeEventListener("pointerleave", onLeave);
		};
	}, []);

	return (
		<div ref={stageRef} className="stage">
			<div className="stage-floor" aria-hidden />
			<div ref={rigRef} className="stage-rig">
				<div className="stage-ring" aria-hidden />
				<div className="stage-body">{children}</div>
				<div className="stage-hud" aria-hidden>
					<span className="stage-corner" data-c="tl" />
					<span className="stage-corner" data-c="tr" />
					<span className="stage-corner" data-c="bl" />
					<span className="stage-corner" data-c="br" />
					<span className="stage-tag" data-c="top">
						{code} <span className="stage-dot" /> {label}
					</span>
					<span ref={coordRef} className="stage-tag" data-c="bottom">
						X 0.500 · Y 0.500 · θ 0.0°
					</span>
					<span className="stage-scan" />
				</div>
			</div>
		</div>
	);
}
