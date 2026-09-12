import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SkillCard } from "@/components/skill-card";
import { EXTERNAL, SITE } from "@/data/site";
import { getSkills } from "@/lib/content";

export const metadata: Metadata = {
	title: "Skills",
	description:
		"Agent skills by category — PR review, planning, docs, scaffolding, release, debugging, quality.",
};

export default function SkillsPage() {
	const groups = getSkills();

	return (
		<>
			<PageHeader
				label="Skills"
				title="Ranked, opinionated, per stack"
				intro="The PR-review skills are distilled from a real ~120-comment corpus, then carried onto the other stacks. Everything else encodes a specific working method. Each is a self-contained SKILL.md."
			/>

			{groups.map((group) => (
				<Section
					key={group.category}
					id={group.category}
					title={group.label}
					count={group.skills.length}
				>
					<div className="grid gap-3 sm:grid-cols-2">
						{group.skills.map((skill) => (
							<SkillCard key={skill.name} skill={skill} />
						))}
					</div>
				</Section>
			))}

			<Section id="borrowed" label="Borrowed" title="Matt Pocock's skills" intro={EXTERNAL.intro}>
				<div className="grid gap-6 sm:grid-cols-3">
					<div>
						<h3 className="section-label mb-2">Adapted in</h3>
						<ul className="space-y-1 text-[0.84rem] text-muted-foreground">
							{EXTERNAL.adapted.map((a) => (
								<li key={a.ours}>
									<a
										href={`${SITE.repo}/blob/main/skills/${a.ours}.md`}
										className="font-mono text-foreground underline-slide"
									>
										{a.ours}
									</a>{" "}
									← {a.theirs}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="section-label mb-2">Take from upstream</h3>
						<ul className="space-y-1 text-[0.84rem] text-muted-foreground">
							{EXTERNAL.take.map((t) => (
								<li key={t}>
									<code>{t}</code>
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className="section-label mb-2">Skip — ours is grounded</h3>
						<ul className="space-y-1 text-[0.84rem] text-muted-foreground">
							{EXTERNAL.skip.map((s) => (
								<li key={s.theirs}>
									<code>{s.theirs}</code> → {s.ours}
								</li>
							))}
						</ul>
					</div>
				</div>
				<p className="mt-5 text-xs text-muted-foreground">
					<a href={EXTERNAL.repo} className="underline-slide text-foreground">
						mattpocock/skills
					</a>{" "}
					· <code>{EXTERNAL.install}</code>
				</p>
			</Section>
		</>
	);
}
