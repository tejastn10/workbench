import type { Metadata } from "next";
import { Lock } from "@/components/figures/players";
import { PageHeader } from "@/components/page-header";
import { CONVENTIONS, SITE } from "@/data/site";

export const metadata: Metadata = {
	title: "Conventions",
	description:
		"AGENTS.md is the cross-tool source of truth — commits, branches, review priorities, phased delivery.",
};

export default function ConventionsPage() {
	return (
		<>
			<PageHeader
				fig="Fig 6"
				figTitle="Pin tumbler"
				figure={<Lock />}
				label="Conventions"
				title="AGENTS.md is the source of truth"
				intro="Cross-tool — Claude Code, Codex, and VS Code all read AGENTS.md, so a convention lives there once instead of being duplicated into per-tool config. Per-project domain glossary and context go in each repo's CONTEXT.md."
			/>

			<section data-reveal className="column border-b border-border py-12">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{CONVENTIONS.map((c, i) => (
						// A clause in the rulebook: number over a double rule, then the rule itself
						<div
							key={c.title}
							className="plate group border border-border bg-card p-4 transition-colors hover:border-foreground/40"
						>
							<div className="flex items-baseline justify-between border-b-[3px] border-double border-border pb-2">
								<span className="section-num">Clause {String(i + 1).padStart(2, "0")}</span>
								<span
									aria-hidden="true"
									className="font-mono text-xs text-muted-foreground transition-colors group-hover:text-foreground"
								>
									§
								</span>
							</div>
							<h2 className="mt-3 text-sm font-bold">{c.title}</h2>
							<p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted-foreground">
								{c.body}
							</p>
						</div>
					))}
				</div>
			</section>

			<section data-reveal className="column py-12">
				<span className="section-label marked">Read the full files</span>
				<ul className="mt-5 plate divide-y divide-border border border-border">
					{[
						["AGENTS.md", "global conventions", "/blob/main/AGENTS.md"],
						["CONTEXT.md", "per-project stub + glossary", "/blob/main/CONTEXT.md"],
						[".out-of-scope/", "rejected decisions, kept", "/tree/main/.out-of-scope"],
					].map(([name, purpose, path]) => (
						<li key={name} className="flex items-baseline justify-between gap-4 p-4">
							<a href={`${SITE.repo}${path}`} className="text-sm font-bold underline-slide">
								{name}
							</a>
							<span className="text-right text-xs text-muted-foreground">{purpose}</span>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
