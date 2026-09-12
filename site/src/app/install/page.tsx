import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { PageHeader } from "@/components/page-header";
import { INSTALL_AGNOSTIC, INSTALL_FULL, INSTALL_PLUGIN, INSTALL_TARGETS, SITE } from "@/data/site";

export const metadata: Metadata = {
	title: "Install",
	description:
		"Skills in the Agent Skills open format — install into Claude Code, Codex, Cursor, or anything, or as a managed Claude Code plugin.",
};

export default function InstallPage() {
	return (
		<>
			<PageHeader
				label="Install"
				title="Any agent, or a plugin"
				intro={
					<>
						Skills are the Agent Skills open format (<code>&lt;name&gt;/SKILL.md</code>) and{" "}
						<code>AGENTS.md</code> is cross-tool — nothing here is locked to one agent.
					</>
				}
			/>

			<section className="border-b border-border py-12">
				<span className="section-label">Tool-agnostic — npx skills</span>
				<p className="mt-3 text-sm text-muted-foreground">
					Claude Code, Codex, Cursor, Copilot, Windsurf, and ~30 more. The <code>skills</code> CLI
					drops the <code>SKILL.md</code> files into each agent's own location.
				</p>
				<div className="mt-5">
					<CodeBlock code={INSTALL_AGNOSTIC} />
				</div>
			</section>

			<section className="border-b border-border py-12">
				<span className="section-label">Claude Code plugin</span>
				<p className="mt-3 text-sm text-muted-foreground">
					Managed &amp; versioned — skills + the <code>commands/</code> slash commands + the{" "}
					<code>.mcp.json</code> servers in one bundle.
				</p>
				<div className="mt-5">
					<CodeBlock code={INSTALL_PLUGIN} />
				</div>
				<p className="mt-4 text-xs text-muted-foreground">
					Details:{" "}
					<a
						href={`${SITE.repo}/blob/main/docs/plugin.md`}
						className="underline-slide text-foreground"
					>
						docs/plugin.md
					</a>
				</p>
			</section>

			<section className="border-b border-border py-12">
				<span className="section-label">Or clone &amp; symlink</span>
				<p className="mt-3 text-sm text-muted-foreground">
					Editable skills, <code>git pull</code> to update.
				</p>
				<div className="mt-5">
					<CodeBlock code={INSTALL_FULL} />
				</div>
			</section>

			<section className="border-b border-border py-12">
				<span className="section-label">Per agent</span>
				<div className="mt-5 space-y-3">
					{INSTALL_TARGETS.map((t) => (
						<div key={t.tool} className="border border-border bg-card p-4">
							<h2 className="text-sm font-bold">{t.tool}</h2>
							<p className="mt-1.5 text-[0.84rem] leading-relaxed text-muted-foreground">
								{t.body}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="border-b border-border py-12">
				<span className="section-label">Per project, once</span>
				<ol className="mt-5 list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
					<li>
						Copy <code>CONTEXT.md</code> into the project and fill in the glossary, stack, and
						landmines.
					</li>
					<li>
						Add a project <code>.out-of-scope/</code> as decisions get ruled out.
					</li>
					<li>
						If the project's rules differ from <code>AGENTS.md</code>, note the deviation in its{" "}
						<code>CONTEXT.md</code>.
					</li>
				</ol>
			</section>

			<section className="py-12">
				<span className="section-label">Build your own review skill</span>
				<p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
					The review skills are generated from a real corpus of your PR comments, not best-practice
					lists. On the machine with repo access, run the{" "}
					<a
						href={`${SITE.repo}/blob/main/skills/pr-review/distill-review-style.md`}
						className="underline-slide text-foreground"
					>
						distill-review-style
					</a>{" "}
					skill — it pulls your comments with <code>gh</code>, categorises what you flag / let slide
					/ how you phrase it, and emits a new <code>pr-review/&lt;stack&gt;-pr-review.md</code>.
				</p>
				<p className="mt-4 text-xs text-muted-foreground">
					Full walkthrough:{" "}
					<a
						href={`${SITE.repo}/blob/main/docs/USAGE.md`}
						className="underline-slide text-foreground"
					>
						docs/USAGE.md
					</a>
				</p>
			</section>
		</>
	);
}
