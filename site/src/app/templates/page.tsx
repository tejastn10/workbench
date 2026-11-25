import type { Metadata } from "next";
import { Stamps } from "@/components/figures/players";
import { GridText } from "@/components/grid-text";
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
				fig="Fig 4"
				figTitle="Stamp rack"
				figure={<Stamps />}
				label="Templates"
				title="Docs that render clean"
				intro="Copied into a project, driven by the skills in skills/docs and skills/debugging. Never edited in place."
			/>

			<section data-reveal className="column border-b border-border py-12">
				<span className="section-label marked">The templates</span>
				{/* Each template as a stapled sheet: folded corner, staple, file name as the header */}
				<ul className="mt-5 grid gap-6 sm:grid-cols-3">
					{templates.map((t) => (
						<li key={t.file}>
							<a
								href={`${SITE.repo}/blob/main/docs/templates/${t.file}`}
								className="group relative block h-full"
							>
								<span
									aria-hidden="true"
									className="absolute inset-0 translate-x-1.5 translate-y-1.5 border border-border bg-card transition-transform duration-300 ease-out group-hover:translate-x-2 group-hover:translate-y-2 group-hover:rotate-[1.5deg]"
								/>
								<div className="relative flex h-full flex-col border border-border bg-card bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_23px,hsl(var(--border)/0.3)_23px,hsl(var(--border)/0.3)_24px)] p-5 pl-7 transition-transform duration-300 ease-out [clip-path:polygon(0_0,calc(100%-20px)_0,100%_20px,100%_100%,0_100%)] group-hover:-translate-y-1">
									<span
										aria-hidden="true"
										className="absolute top-0 right-0 size-5 border-b border-l border-border bg-muted [clip-path:polygon(0_0,0_100%,100%_100%)]"
									/>
									<span
										aria-hidden="true"
										className="absolute top-2.5 left-2.5 h-0.5 w-3.5 -rotate-[35deg] bg-muted-foreground/70"
									/>
									<span className="section-num">Template</span>
									<span className="mt-2 font-mono text-sm font-medium group-hover:underline">
										{t.file}
									</span>
									<span className="mt-3 flex-1 text-xs leading-relaxed text-muted-foreground">
										{t.purpose}
									</span>
								</div>
							</a>
						</li>
					))}
				</ul>
			</section>

			<section data-reveal className="column border-b border-border py-12">
				<span className="section-label marked">One shared format</span>
				<ul className="mt-5 space-y-2 text-sm text-muted-foreground">
					{FORMAT.map((f) => (
						<li key={f}>— {f}</li>
					))}
				</ul>
			</section>

			<section data-reveal className="column py-12">
				<span className="section-label marked">Where they live in a project</span>
				<pre className="mt-5">
					<code>
						<GridText
							text={`docs/
├── prd/NNNN-slug.md
├── adr/NNNN-slug.md          # numbered, immutable once accepted
└── incidents/YYYY-MM-DD-slug.md   # blameless — systems, never people`}
						/>
					</code>
				</pre>
			</section>
		</>
	);
}
