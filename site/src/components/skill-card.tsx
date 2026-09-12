import { SITE } from "@/data/site";
import type { Skill } from "@/lib/content";

export function SkillCard({ skill }: { skill: Skill }) {
	return (
		<a
			href={`${SITE.repo}/blob/main/${skill.file}`}
			className="group flex flex-col border border-border bg-card p-4 transition-colors hover:border-foreground/40"
		>
			<div className="flex items-baseline justify-between gap-3">
				<span className="font-mono text-[0.82rem] font-medium group-hover:underline">
					{skill.name}
				</span>
				<span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
					{skill.adaptedFrom ? `adapted · ${skill.adaptedFrom}` : "SKILL.md ↗"}
				</span>
			</div>
			<p className="mt-2 text-[0.86rem] leading-relaxed text-muted-foreground">{skill.blurb}</p>
		</a>
	);
}
