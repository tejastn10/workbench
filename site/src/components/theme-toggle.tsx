"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
	const { resolvedTheme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	const isDark = mounted && resolvedTheme === "dark";

	return (
		<button
			type="button"
			aria-label={
				!mounted ? "Toggle theme" : isDark ? "Switch to light theme" : "Switch to dark theme"
			}
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="cursor-pointer border border-border p-1.5 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
		>
			<span className="block dark:hidden">
				<MoonIcon />
			</span>
			<span className="hidden dark:block">
				<SunIcon />
			</span>
		</button>
	);
}

function MoonIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
		</svg>
	);
}

function SunIcon() {
	return (
		<svg
			width="14"
			height="14"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			aria-hidden
		>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
		</svg>
	);
}
