"use client";

// A label that decodes like a terminal readout when it first scrolls into view.
import { useEffect, useRef } from "react";

const GLYPHS = "01<>/\\[]{}#+=-_:";

export function Decode({ text, className = "" }: { text: string; className?: string }) {
	const ref = useRef<HTMLSpanElement>(null);
	useEffect(() => {
		const el = ref.current;
		if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		let frame = 0;
		const io = new IntersectionObserver(([entry]) => {
			if (!entry.isIntersecting) return;
			io.disconnect();
			const start = performance.now();
			const tick = (now: number) => {
				const t = (now - start) / 700;
				const solved = Math.floor(t * text.length);
				el.textContent = [...text]
					.map((ch, i) =>
						i < solved || ch === " " ? ch : GLYPHS[(i * 7 + Math.floor(now / 40)) % GLYPHS.length]
					)
					.join("");
				if (t < 1) frame = requestAnimationFrame(tick);
				else el.textContent = text;
			};
			frame = requestAnimationFrame(tick);
		});
		io.observe(el);
		return () => {
			io.disconnect();
			cancelAnimationFrame(frame);
		};
	}, [text]);
	return (
		<span ref={ref} className={className}>
			{text}
		</span>
	);
}
