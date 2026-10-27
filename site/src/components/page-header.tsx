import Link from "next/link";
import type { ReactNode } from "react";
import { Decode } from "@/components/decode";
import { Stage } from "@/components/stage";

type Props = {
	label: string;
	title: string;
	intro?: ReactNode;
	fig?: string;
	figure?: ReactNode;
	figTitle?: string;
};

// Centred page opening: HUD label, title, intro, then the page's figure on its 3D stage.
export function PageHeader({ label, title, intro, fig, figure, figTitle }: Props) {
	return (
		<header className="relative border-b border-border">
			<div className="mx-auto max-w-3xl pt-14 text-center sm:pt-20">
				<Link
					href="/"
					className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground underline-slide hover:text-foreground"
				>
					← workbench
				</Link>
				<span className="section-label marked mt-8 block">
					<Decode text={fig ? `${fig} / ${label}` : label} />
				</span>
				<h1 className="font-display mt-4 text-[2.6rem] leading-[0.98] sm:text-6xl xl:text-7xl">
					{title}
				</h1>
				{intro ? (
					<p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						{intro}
					</p>
				) : null}
			</div>
			{figure ? (
				<div className="mx-auto mt-6 max-w-5xl">
					<Stage code={fig ?? ""} label={figTitle ?? label}>
						{figure}
					</Stage>
				</div>
			) : (
				<div className="h-14" />
			)}
			<div className="ruler" aria-hidden />
		</header>
	);
}
