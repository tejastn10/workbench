"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitHubIcon } from "@/components/icons";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { NAV, SITE } from "@/data/site";

export function Nav() {
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
			<div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
				<Link href="/" className="flex items-center gap-2">
					<Logo />
					<span className="font-display text-base">{SITE.name.toLowerCase()}</span>
				</Link>

				<nav className="hidden gap-4 font-mono text-xs uppercase tracking-wider text-muted-foreground sm:flex">
					{NAV.map((item) => {
						const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
						return (
							<Link
								key={item.href}
								href={item.href}
								className={`underline-slide hover:text-foreground ${active ? "text-foreground" : ""}`}
							>
								{item.label}
							</Link>
						);
					})}
				</nav>

				<div className="flex items-center gap-3">
					<a
						href={SITE.repo}
						aria-label="GitHub repository"
						className="border border-border p-1.5 text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
					>
						<GitHubIcon size={14} />
					</a>
					<ThemeToggle />
				</div>
			</div>
		</header>
	);
}
