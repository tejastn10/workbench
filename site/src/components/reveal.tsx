"use client";

// Reveals [data-reveal] blocks as they scroll in. The html.js class (set inline in the
// layout) gates the hidden state, so the page reads fine without JavaScript.
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function Reveal() {
	const pathname = usePathname();
	useEffect(() => {
		const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-in])")];
		if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
			for (const el of els) el.dataset.in = "";
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				for (const e of entries) {
					if (!e.isIntersecting) continue;
					(e.target as HTMLElement).dataset.in = "";
					io.unobserve(e.target);
				}
			},
			{ rootMargin: "0px 0px -8% 0px" }
		);
		for (const el of els) io.observe(el);
		return () => io.disconnect();
	}, [pathname]);
	return null;
}
