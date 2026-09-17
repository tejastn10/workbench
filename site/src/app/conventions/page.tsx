import type { Metadata } from "next";
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
				label="Conventions"
				title="AGENTS.md is the source of truth"
				intro="Cross-tool — Claude Code, Codex, and VS Code all read AGENTS.md, so a convention lives there once instead of being duplicated into per-tool config. Per-project domain glossary and context go in each repo's CONTEXT.md."
			/>

			<section className="border-b border-border py-12">
				<div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{CONVENTIONS.map((c) => (
						<div key={c.title} className="border border-border bg-card p-4">
							<h2 className="text-sm font-bold">{c.title}</h2>
							<p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted-foreground">
								{c.body}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="py-12">
				<span className="section-label">Read the full files</span>
				<ul className="mt-5 divide-y divide-border border border-border">
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
