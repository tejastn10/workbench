import Link from "next/link";
import { BracketField } from "@/components/bracket-field";
import { CodeBlock } from "@/components/code-block";
import { Logo } from "@/components/logo";
import { INSTALL_SHORT, SITE } from "@/data/site";
import { getMcpServers, getSkillCount, getSkills, getTemplates } from "@/lib/content";

const EXPLORE = [
	{ href: "/skills", label: "Skills", blurb: "Every skill, grouped by category." },
	{
		href: "/workflows",
		label: "Compose",
		blurb: "Use several skills together — orchestration, workflows, how to trigger a bundle.",
	},
	{ href: "/templates", label: "Templates", blurb: "PRD, ADR, and postmortem — one house format." },
	{ href: "/mcp", label: "MCP & tooling", blurb: "Context7, DeepWiki, and GitHub via gh." },
	{
		href: "/conventions",
		label: "Conventions",
		blurb: "Commits, branches, review priorities, phased delivery.",
	},
	{
		href: "/install",
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
			{/* ── Hero ─────────────────────────────────────────────── */}
			<section className="relative flex min-h-[82vh] items-center overflow-hidden border-b border-border">
				{/* animated nested-bracket field, faded through the middle where the text sits */}
				<BracketField
					fill
					rows={13}
					size="text-sm sm:text-base"
					className="pointer-events-none absolute inset-0 py-8 [mask-image:linear-gradient(to_bottom,black,transparent_30%,transparent_70%,black)]"
				/>

				{/* oversized framing brackets, slow breathe */}
				<span
					aria-hidden
					className="bracket-breathe pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 select-none text-[15rem] leading-none sm:text-[24rem]"
				>
					[
				</span>
				<span
					aria-hidden
					className="bracket-breathe pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 select-none text-[15rem] leading-none sm:text-[24rem]"
				>
					]
				</span>

				<div className="relative w-full py-20">
					<div className="section-label flex items-center gap-2">
						<Logo size={15} /> Personal <span className="text-border">/</span> open{" "}
						<span className="text-border">/</span> MIT
					</div>

					<h1 className="font-display mt-7 text-[2.6rem] leading-[1.0] sm:text-6xl lg:text-7xl xl:text-8xl">
						One bench for
						<br />
						<span className="text-muted-foreground">every coding agent.</span>
					</h1>

					<p className="mt-7 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
						{SITE.tagline} Whichever agent you drive pulls from the same conventions —{" "}
						<span className="italic">{SITE.sub.toLowerCase()}</span>
					</p>

					<div className="mt-9 flex flex-wrap gap-2 font-mono text-xs uppercase tracking-wider">
						<Link
							href="/skills"
							className="border border-foreground bg-foreground px-4 py-2.5 font-mono text-background transition-opacity hover:opacity-80"
						>
							Browse skills →
						</Link>
						<a
							href={SITE.repo}
							className="border border-border bg-background px-4 py-2.5 transition-colors hover:border-foreground/40 hover:text-foreground"
						>
							GitHub repo
						</a>
						<a
							href={`${SITE.repo}/blob/main/AGENTS.md`}
							className="border border-border bg-background px-4 py-2.5 transition-colors hover:border-foreground/40 hover:text-foreground"
						>
							AGENTS.md
						</a>
					</div>

					<div className="mt-11">
						<CodeBlock code={INSTALL_SHORT} />
					</div>
				</div>
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
