import type { ReactNode } from "react";

type Props = {
	id?: string;
	label?: string;
	title?: string;
	count?: number;
	intro?: ReactNode;
	children: ReactNode;
};

export function Section({ id, label, title, count, intro, children }: Props) {
	return (
		<section id={id} className="scroll-mt-24 border-b border-border py-14 last:border-b-0">
			{label ? <span className="section-label">{label}</span> : null}
			{title ? (
				<h2 className="font-display mt-2 flex items-baseline gap-3 text-xl sm:text-2xl">
					{title}
					{typeof count === "number" ? (
						<span className="font-mono text-xs font-normal text-muted-foreground">
							{count} skill{count === 1 ? "" : "s"}
						</span>
					) : null}
				</h2>
			) : null}
			{intro ? (
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{intro}</p>
			) : null}
			<div className={label || title || intro ? "mt-7" : ""}>{children}</div>
		</section>
	);
}
