import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SkillCard } from "@/components/skill-card";
import { SITE } from "@/data/site";
import { getSkills } from "@/lib/content";

export const metadata: Metadata = {
	title: "Composition",
	description:
		"How to use several skills together for one task — skill composition, workflow orchestrators, and the four ways to trigger a bundle.",
};

const SLASH_CMD = `# ~/.claude/commands/feature.md
Follow ~/workbench/skills/workflows/new-feature.md for: $ARGUMENTS

#  then, in a session:
/feature add rate limiting`;

const EXAMPLE = [
	["“build the /reports export endpoint, sizeable”", "workflows/new-feature"],
	["(it interviews you)", "planning/grill"],
	["(drafts the spec, you review)", "planning/write-prd"],
	["(the contract)", "design/design-endpoint + design/design-schema"],
	["(phase list, you approve)", "planning/phased-delivery"],
	[
		"per phase",
		"scaffold-nestjs-module → tdd → deslopify → split-commit → pr-review → security-review → tag",
	],
	["ship", "deployment/deploy-service → deployment/cut-release"],
];

export default function WorkflowsPage() {
	const workflows = getSkills().find((g) => g.category === "workflows");

	return (
		<>
			<PageHeader
				label="Composition"
				title="Use skills together"
				intro="Most tasks need several skills in order — plan, design, build, review, ship. Using them together is skill composition. A workflow skill is the orchestrator that names the sequence."
			/>

			<Section label="How it works" title="Descriptions route, skills invoke skills">
				<ul className="space-y-3 text-sm leading-relaxed text-muted-foreground">
					<li>
						<strong className="text-foreground">Descriptions route.</strong> Every skill's{" "}
						<code>description</code> is packed with trigger phrases. Once installed, the agent reads
						them all and loads the matching skill automatically — you describe the task, you don't
						hand-pick.
					</li>
					<li>
						<strong className="text-foreground">Skills invoke skills.</strong> A workflow's body is
						an ordered list of which other skills to call, via the Skill tool.
					</li>
					<li>
						<strong className="text-foreground">Skills cross-reference.</strong>{" "}
						<code>write-prd</code> says “run <code>grill</code> first”; the chain forms even without
						a workflow.
					</li>
				</ul>
				<p className="mt-4 text-sm text-muted-foreground">
					Prerequisite: run <code>scripts/install-skills.sh</code> so every <code>SKILL.md</code> is
					where the agent can see its description.
				</p>
			</Section>

			<Section label="Trigger" title="Four ways to run a bundle">
				<ol className="space-y-5 text-sm leading-relaxed text-muted-foreground">
					<li>
						<strong className="text-foreground">A — Just describe the task.</strong> “let's build
						the reports-export endpoint, it's sizeable” → the agent matches{" "}
						<code>workflows/new-feature</code> and walks the sequence. No setup.
					</li>
					<li>
						<strong className="text-foreground">B — Slash command</strong> — a one-word trigger:
						<div className="mt-3">
							<CodeBlock code={SLASH_CMD} />
						</div>
					</li>
					<li>
						<strong className="text-foreground">C — Name the workflow.</strong> “use the ship-change
						workflow for this fix”
					</li>
					<li>
						<strong className="text-foreground">D — Chain by hand.</strong> “grill me on this, then
						draft the PRD, then break it into phases”
					</li>
				</ol>
			</Section>

			<Section
				label="The workflows"
				title="Orchestrators"
				count={workflows?.skills.length}
				intro="Each one's body is an ordered table of which skills to invoke at each stage and what each hands to the next."
			>
				<div className="grid gap-3 sm:grid-cols-2">
					{workflows?.skills.map((skill) => (
						<SkillCard key={skill.name} skill={skill} />
					))}
				</div>
			</Section>

			<Section label="Example" title="Building an endpoint">
				<div className="overflow-x-auto border border-border">
					<table className="w-full text-left text-[0.82rem]">
						<thead>
							<tr className="border-b border-border bg-muted">
								<th className="p-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
									You say
								</th>
								<th className="p-3 font-mono text-xs font-medium uppercase tracking-wider text-muted-foreground">
									Agent invokes
								</th>
							</tr>
						</thead>
						<tbody>
							{EXAMPLE.map(([say, invoke]) => (
								<tr key={say} className="border-b border-border last:border-b-0">
									<td className="p-3 align-top text-muted-foreground">{say}</td>
									<td className="p-3 align-top font-mono text-[0.78rem]">{invoke}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</Section>

			<Section label="More" title="Notes & limits">
				<ul className="space-y-2 text-sm text-muted-foreground">
					<li>— A workflow is a checklist the agent follows, not hard automation.</li>
					<li>— Auto-routing isn't perfect. Nudge it: “also run the security review”.</li>
					<li>— Each phase of a feature is its own fresh session.</li>
					<li>
						— Write a new workflow when you catch yourself running the same 4–8 skills in the same
						order (<code>meta/write-skill</code>).
					</li>
				</ul>
				<p className="mt-5 text-xs text-muted-foreground">
					Full write-up:{" "}
					<a
						href={`${SITE.repo}/blob/main/docs/composing-skills.md`}
						className="underline-slide text-foreground"
					>
						docs/composing-skills.md
					</a>
				</p>
			</Section>
		</>
	);
}
