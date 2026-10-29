import Link from "next/link";
import { CodeBlock } from "@/components/code-block";
import { Decode } from "@/components/decode";
import { Stage } from "@/components/stage";
import { Station } from "@/components/station";
import { ANATOMY, INSTALL_SHORT, SITE } from "@/data/site";
import { getMcpServers, getSkillCount, getSkills, getTemplates } from "@/lib/content";

const EXPLORE = [
	{ href: "/skills", fig: "Fig 2", label: "Skills", blurb: "Every skill, grouped by category." },
	{
		href: "/workflows",
		fig: "Fig 3",
		label: "Compose",
		blurb: "Use several skills together — orchestration, workflows, how to trigger a bundle.",
	},
	{
		href: "/templates",
		fig: "Fig 4",
		label: "Templates",
		blurb: "PRD, ADR, and postmortem — one house format.",
	},
	{
		href: "/mcp",
		fig: "Fig 5",
		label: "MCP & tooling",
		blurb: "Context7, DeepWiki, and GitHub via gh.",
	},
	{
		href: "/conventions",
		fig: "Fig 6",
		label: "Conventions",
		blurb: "Commits, branches, review priorities, phased delivery.",
	},
	{
		href: "/install",
		fig: "Fig 7",
		label: "Install",
		blurb: "Clone, link into Claude Code / VS Code, point at AGENTS.md.",
	},
];

function Head({
	n,
	label,
	title,
	intro,
}: {
	n: string;
	label: string;
	title?: string;
	intro?: string;
}) {
	return (
		<div className="mx-auto max-w-3xl text-center">
			<span className="section-num">§ {n}</span>
			<span className="section-label marked mt-2 block">{label}</span>
			{title ? (
				<h2 className="font-display mt-3 text-3xl sm:text-4xl lg:text-5xl">{title}</h2>
			) : null}
			{intro ? (
				<p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
					{intro}
				</p>
			) : null}
		</div>
	);
}

export default function Home() {
	const groups = getSkills();
	const skillCount = getSkillCount();
	const templates = getTemplates();
	const mcpCount = getMcpServers().length;
	const most = Math.max(...groups.map((g) => g.skills.length));

	return (
		<>
			{/* ── Hero: centred, the station on its stage ───────────── */}
			<section className="relative border-b border-border">
				<div className="mx-auto max-w-4xl pt-16 text-center sm:pt-24">
					<span className="section-label marked">
						<Decode text="Workbench / personal / open / MIT" />
					</span>
					<h1 className="font-display mt-7 text-[2.8rem] leading-[0.95] sm:text-7xl lg:text-8xl">
						One bench for
						<br />
						<span className="text-muted-foreground">every coding agent.</span>
					</h1>
					<p className="mx-auto mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						{SITE.tagline} Whichever agent you drive pulls from the same conventions —{" "}
						<span className="italic">{SITE.sub.toLowerCase()}</span>
					</p>
					<div className="mt-9 flex flex-wrap justify-center gap-2 font-mono text-xs uppercase tracking-wider">
						<Link
							href="/skills"
							className="plate border border-foreground bg-foreground px-5 py-3 font-mono text-background transition-opacity hover:opacity-80"
						>
							Browse skills →
						</Link>
						<a
							href={SITE.repo}
							className="plate border border-border bg-background px-5 py-3 transition-colors hover:border-foreground/40"
						>
							GitHub repo
						</a>
						<a
							href={`${SITE.repo}/blob/main/AGENTS.md`}
							className="plate border border-border bg-background px-5 py-3 transition-colors hover:border-foreground/40"
						>
							AGENTS.md
						</a>
					</div>
				</div>
				<div className="mx-auto mt-4 max-w-6xl">
					<Stage code="Fig 1" label="Docking">
						<Station />
					</Stage>
				</div>
				<div className="mx-auto max-w-xl pb-16">
					<CodeBlock code={INSTALL_SHORT} />
				</div>
				<div className="ruler" aria-hidden />
			</section>

			{/* ── Telemetry ─────────────────────────────────────────── */}
			<section data-reveal className="border-b border-border py-16">
				<Head n="01" label="Telemetry" />
				<dl className="plate mx-auto mt-9 grid max-w-5xl grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
					{[
						[skillCount, "skills"],
						[groups.length, "categories"],
						[templates.length, "doc templates"],
						[mcpCount, "MCP / tools"],
					].map(([n, label]) => (
						<div key={label as string} className="bg-background p-6 text-center">
							<dd className="font-display text-4xl tabular-nums sm:text-5xl lg:text-6xl">
								{String(n).padStart(2, "0")}
							</dd>
							<dt className="section-label mt-2">{label}</dt>
						</div>
					))}
				</dl>
			</section>

			{/* ── How it fits together ─────────────────────────────── */}
			<section data-reveal className="border-b border-border py-16">
				<Head
					n="02"
					label="How it fits together"
					title="Read it like a station"
					intro="The agent docks; the workbench decides which module it works in next, and what it does there."
				/>
				<dl className="plate mx-auto mt-9 grid max-w-6xl gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					{ANATOMY.map((part, i) => (
						<div key={part.organ} className="bg-background p-6">
							<span className="section-num">0{i + 1}</span>
							<dt className="section-label mt-3">{part.organ}</dt>
							<dd className="mt-2 text-sm font-bold">{part.is}</dd>
							<dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{part.body}</dd>
						</div>
					))}
				</dl>
			</section>

			{/* ── Categories: a bar per category, as long as it is big ── */}
			<section data-reveal className="border-b border-border py-16">
				<Head n="03" label="Skills by category" title="The modules" />
				<ul className="mx-auto mt-9 grid max-w-6xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{groups.map((g, i) => (
						<li key={g.category}>
							<Link
								href={`/skills#${g.category}`}
								className="plate group block border border-border bg-card p-4 transition-colors hover:border-foreground/40"
							>
								<div className="flex items-baseline justify-between">
									<span className="text-sm font-bold">
										<span className="section-num mr-2">{String(i + 1).padStart(2, "0")}</span>
										{g.label}
									</span>
									<span className="font-mono text-xs text-muted-foreground">
										{String(g.skills.length).padStart(2, "0")}
									</span>
								</div>
								<div className="mt-3 h-1 bg-muted">
									<div
										className="h-full bg-foreground/70 transition-all duration-500 group-hover:bg-foreground"
										style={{ width: `${(g.skills.length / most) * 100}%` }}
									/>
								</div>
							</Link>
						</li>
					))}
				</ul>
			</section>

			{/* ── Explore: every page, by figure ───────────────────── */}
			<section data-reveal className="py-16">
				<Head n="04" label="Explore" title="Seven figures" />
				<ul className="plate mx-auto mt-9 max-w-5xl divide-y divide-border border border-border">
					{EXPLORE.map((e) => (
						<li key={e.href}>
							<Link
								href={e.href}
								className="group flex items-center gap-4 p-5 transition-colors hover:bg-muted"
							>
								<span className="section-num w-14 shrink-0">{e.fig}</span>
								<span className="font-display text-xl sm:text-2xl">{e.label}</span>
								<span className="ml-auto hidden text-right text-xs text-muted-foreground sm:block">
									{e.blurb}
								</span>
								<span className="font-mono text-sm transition-transform duration-300 group-hover:translate-x-1">
									→
								</span>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
