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
		<section
			id={id}
			data-reveal
			className="scroll-mt-24 border-b border-border py-16 last:border-b-0"
		>
			<div className="mx-auto max-w-3xl text-center">
				{label ? <span className="section-label marked">{label}</span> : null}
				{title ? (
					<h2 className="font-display mt-2 text-3xl sm:text-4xl lg:text-5xl">
						{title}
						{typeof count === "number" ? (
							<span className="ml-3 align-middle font-mono text-xs font-normal text-muted-foreground">
								{String(count).padStart(2, "0")} skill{count === 1 ? "" : "s"}
							</span>
						) : null}
					</h2>
				) : null}
				{intro ? (
					<p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
						{intro}
					</p>
				) : null}
			</div>
			<div className={label || title || intro ? "mt-9" : ""}>{children}</div>
		</section>
	);
}
