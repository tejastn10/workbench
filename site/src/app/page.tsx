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

export default function Home() {
	const groups = getSkills();
	const skillCount = getSkillCount();
	const templates = getTemplates();
	const mcpCount = getMcpServers().length;

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

			{/* ── How it fits together ─────────────────────────────── */}
			<section className="border-b border-border py-14">
				<span className="section-label">How it fits together</span>
				<p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
					Read the figure like a nervous system. The agent is the body; the workbench is what tells
					it what to do next, and which hand does it.
				</p>
				<dl className="mt-8 grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
					{ANATOMY.map((part) => (
						<div key={part.organ} className="bg-background p-5">
							<dt className="section-label">{part.organ}</dt>
							<dd className="mt-2 text-sm font-bold">{part.is}</dd>
							<dd className="mt-1 text-xs leading-relaxed text-muted-foreground">{part.body}</dd>
						</div>
					))}
				</dl>
			</section>

			{/* ── What it is ───────────────────────────────────────── */}
			<section className="border-b border-border py-14">
				<span className="section-label">What it is</span>
				<p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
					Not a framework — a personal collection so whichever agent is driving pulls from the same
					conventions. Skills are self-contained Markdown with <code>name</code> /{" "}
					<code>description</code> frontmatter; Claude Code and VS Code agent mode both load the{" "}
					<code>SKILL.md</code> format, and Codex reads <code>AGENTS.md</code> natively.
				</p>

				<dl className="mt-8 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-4">
					{[
						[skillCount, "skills"],
						[groups.length, "categories"],
						[templates.length, "doc templates"],
						[mcpCount, "MCP / tools"],
					].map(([n, label]) => (
						<div key={label as string} className="bg-background p-5">
							<dd className="font-display text-3xl sm:text-4xl lg:text-5xl">{n}</dd>
							<dt className="section-label mt-1">{label}</dt>
						</div>
					))}
				</dl>
			</section>

			{/* ── Categories ───────────────────────────────────────── */}
			<section className="border-b border-border py-14">
				<div className="flex items-baseline justify-between">
					<span className="section-label">Skills by category</span>
					<Link
						href="/skills"
						className="font-mono text-xs uppercase tracking-wider text-muted-foreground underline-slide hover:text-foreground"
					>
						see all →
					</Link>
				</div>
				<ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{groups.map((g) => (
						<li key={g.category}>
							<Link
								href={`/skills#${g.category}`}
								className="flex items-baseline justify-between border border-border bg-card p-4 transition-colors hover:border-foreground/40"
							>
								<span className="text-sm font-bold">{g.label}</span>
								<span className="text-xs text-muted-foreground">
									{g.skills.length} skill{g.skills.length === 1 ? "" : "s"}
								</span>
							</Link>
						</li>
					))}
				</ul>
			</section>

			{/* ── Explore ──────────────────────────────────────────── */}
			<section className="py-14">
				<span className="section-label">Explore</span>
				<ul className="mt-6 divide-y divide-border border border-border">
					{EXPLORE.map((e) => (
						<li key={e.href}>
							<Link
								href={e.href}
								className="flex flex-col gap-1 p-4 transition-colors hover:bg-muted sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
							>
								<span className="text-sm font-bold">{e.label}</span>
								<span className="text-right text-xs text-muted-foreground">{e.blurb}</span>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</>
	);
}
