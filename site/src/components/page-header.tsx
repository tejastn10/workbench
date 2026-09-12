import Link from "next/link";
import type { ReactNode } from "react";
import { BracketField } from "@/components/bracket-field";

type Props = {
	label: string;
	title: string;
	intro?: ReactNode;
};

export function PageHeader({ label, title, intro }: Props) {
	return (
		<header className="relative overflow-hidden border-b border-border">
			<div className="py-16 sm:py-20">
				<Link
					href="/"
					className="font-mono text-xs uppercase tracking-wider text-muted-foreground underline-slide hover:text-foreground"
				>
					← workbench
				</Link>
				<span className="section-label mt-7 block">{label}</span>
				<h1 className="font-display mt-2 text-3xl sm:text-5xl">{title}</h1>
				{intro ? (
					<p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
				) : null}
			</div>
			<div className="border-t border-border">
				<BracketField rows={2} size="text-[0.7rem]" className="py-1.5" />
			</div>
		</header>
	);
}
