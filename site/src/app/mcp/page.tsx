import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
import { GroundStation } from "@/components/figures/players";
import { Jack } from "@/components/jack";
import { PageHeader } from "@/components/page-header";
import { MCP_ADD, MCP_JSON, SITE } from "@/data/site";
import { getMcpServers } from "@/lib/content";

export const metadata: Metadata = {
	title: "MCP & tooling",
	description: "Context7 for library docs, DeepWiki for unfamiliar repos, GitHub via the gh CLI.",
};

export default function McpPage() {
	const servers = getMcpServers();

	return (
		<>
			<PageHeader
				fig="Fig 5"
				figTitle="Ground station"
				figure={<GroundStation />}
				label="MCP & tooling"
				title="Docs on tap, GitHub via gh"
				intro="Context7 covers version-pinned docs for the long tail, so there are no per-framework servers. GitHub access is the gh CLI, not an MCP server — it's already authenticated and adds no tool-list bloat."
			/>

			<section data-reveal className="column border-b border-border py-12">
				<span className="section-label marked">Servers</span>
				<ul className="mt-5 plate divide-y divide-border border border-border">
					{servers.map((s) => (
						<li key={s.name}>
							{/* A patch connector: jack, a cable that carries a signal on hover, then auth */}
							<a
								href={`${SITE.repo}/blob/main/${s.doc}`}
								className="group block p-4 transition-colors hover:bg-muted"
							>
								<div className="flex items-center gap-3">
									<Jack />
									<span className="text-sm font-bold group-hover:underline">{s.name}</span>
									<span
										aria-hidden="true"
										className="mcp-cable h-px min-w-6 flex-1 bg-[repeating-linear-gradient(to_right,hsl(var(--muted-foreground)/0.5)_0_5px,transparent_5px_9px)]"
									/>
									<span className="shrink-0 border border-border bg-background px-1.5 py-0.5 font-mono text-[0.62rem] uppercase tracking-wider text-muted-foreground">
										{s.auth}
									</span>
								</div>
								<p className="mt-1.5 pl-6 text-[0.86rem] text-muted-foreground">{s.purpose}</p>
							</a>
						</li>
					))}
				</ul>
			</section>

			<section data-reveal className="column border-b border-border py-12">
				<span className="section-label marked">Claude Code</span>
				<div className="mt-5">
					<CodeBlock code={MCP_ADD} />
				</div>
			</section>

			<section data-reveal className="column py-12">
				<span className="section-label marked">Or a project .mcp.json</span>
				<p className="mt-3 text-sm text-muted-foreground">
					Also VS Code (<code>.vscode/mcp.json</code>) and Codex (<code>~/.codex/config.toml</code>)
					— per-client blocks in{" "}
					<a
						href={`${SITE.repo}/tree/main/.agents/mcp`}
						className="underline-slide text-foreground"
					>
						.agents/mcp/
					</a>
					.
				</p>
				<div className="mt-5">
					<CodeBlock code={MCP_JSON} />
				</div>
			</section>
		</>
	);
}
