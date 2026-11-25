import { SITE } from "@/data/site";
import type { Skill } from "@/lib/content";

// A drawer in the parts cabinet (the /skills figure): a pull handle, a dashed label holder with
// the skill's name, and an adapted skill's provenance as a hang tag. The drawer slides out on
// hover.
export function SkillCard({ skill }: { skill: Skill }) {
	return (
		<a
			href={`${SITE.repo}/blob/main/${skill.file}`}
			className="plate group flex flex-col border border-border bg-card px-4 pt-2.5 pb-4 transition-[transform,border-color] duration-300 ease-out hover:-translate-y-0.5 hover:border-foreground/40"
		>
			<span
				aria-hidden="true"
				className="mx-auto h-1 w-10 border border-border bg-muted transition-colors duration-300 group-hover:bg-foreground"
			/>

			<div className="mt-3 flex items-baseline justify-between gap-3 border border-dashed border-border px-3 py-2 transition-colors duration-300 group-hover:border-foreground/40">
				<span className="font-mono text-[0.82rem] font-medium">{skill.name}</span>
				<span className="shrink-0 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground transition-colors group-hover:text-foreground">
					SKILL.md ↗
				</span>
			</div>

			<p className="mt-3 text-[0.86rem] leading-relaxed text-muted-foreground">{skill.blurb}</p>

			{skill.adaptedFrom ? (
				<span className="mt-3 inline-flex origin-top-left -rotate-2 items-center gap-1.5 self-start border border-border bg-background px-2 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground transition-transform duration-300 group-hover:rotate-0">
					<span aria-hidden="true" className="size-1.5 rounded-full border border-border" />
					adapted · {skill.adaptedFrom}
				</span>
			) : null}
		</a>
	);
}
