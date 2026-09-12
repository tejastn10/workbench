import type { Metadata } from "next";
import { CodeBlock } from "@/components/code-block";
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
				label="MCP & tooling"
				title="Docs on tap, GitHub via gh"
				intro="Context7 covers version-pinned docs for the long tail, so there are no per-framework servers. GitHub access is the gh CLI, not an MCP server — it's already authenticated and adds no tool-list bloat."
			/>

			<section className="border-b border-border py-12">
				<span className="section-label">Servers</span>
				<ul className="mt-5 divide-y divide-border border border-border">
					{servers.map((s) => (
						<li key={s.name}>
							<a
								href={`${SITE.repo}/blob/main/${s.doc}`}
								className="group block p-4 transition-colors hover:bg-muted"
							>
								<div className="flex items-baseline justify-between gap-3">
									<span className="text-sm font-bold group-hover:underline">{s.name}</span>
									<span className="font-mono text-[0.66rem] uppercase tracking-wider text-muted-foreground">
										{s.auth}
									</span>
								</div>
								<p className="mt-1 text-[0.86rem] text-muted-foreground">{s.purpose}</p>
							</a>
						</li>
					))}
				</ul>
			</section>

			<section className="border-b border-border py-12">
				<span className="section-label">Claude Code</span>
				<div className="mt-5">
					<CodeBlock code={MCP_ADD} />
				</div>
			</section>

			<section className="py-12">
				<span className="section-label">Or a project .mcp.json</span>
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
