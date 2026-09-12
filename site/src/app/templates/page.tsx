import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { SITE } from "@/data/site";
import { getTemplates } from "@/lib/content";

export const metadata: Metadata = {
	title: "Templates",
	description: "Reusable document templates — PRD, ADR, and blameless postmortem.",
};

const FORMAT = [
	"Header as a table.",
	"One --- divider between every section.",
	"Emoji H2 headers, matching the README house style.",
	"[bracketed] placeholders with an italic guidance line under each heading.",
	"An HTML comment at the top with the fill-in rules — invisible when rendered.",
];

export default function TemplatesPage() {
	const templates = getTemplates();

	return (
		<>
			<PageHeader
				label="Templates"
				title="Docs that render clean"
				intro="Copied into a project, driven by the skills in skills/docs and skills/debugging. Never edited in place."
			/>

			<section className="border-b border-border py-12">
				<span className="section-label">The templates</span>
				<ul className="mt-5 divide-y divide-border border border-border">
					{templates.map((t) => (
						<li key={t.file} className="flex items-baseline justify-between gap-4 p-4">
							<a
								href={`${SITE.repo}/blob/main/docs/templates/${t.file}`}
								className="font-mono text-sm font-medium underline-slide"
							>
								{t.file}
							</a>
							<span className="text-right text-xs text-muted-foreground">{t.purpose}</span>
						</li>
					))}
				</ul>
			</section>

			<section className="border-b border-border py-12">
				<span className="section-label">One shared format</span>
				<ul className="mt-5 space-y-2 text-sm text-muted-foreground">
					{FORMAT.map((f) => (
						<li key={f}>— {f}</li>
					))}
				</ul>
			</section>

			<section className="py-12">
				<span className="section-label">Where they live in a project</span>
				<pre className="mt-5">
					<code>{`docs/
├── prd/NNNN-slug.md
├── adr/NNNN-slug.md          # numbered, immutable once accepted
└── incidents/YYYY-MM-DD-slug.md   # blameless — systems, never people`}</code>
				</pre>
			</section>
		</>
	);
}
