export const SITE = {
	name: "Workbench",
	tagline:
		"Personal agent skills, instructions, and MCP setup for coding agents — Claude Code, VS Code agents, Codex.",
	sub: "Where the tools are kept, and kept sharp.",
	repo: "https://github.com/tejastn10/workbench",
	author: "Tejas Nikhar",
	authorUrl: "https://github.com/tejastn10",
};

export const NAV = [
	{ href: "/skills", label: "Skills" },
	{ href: "/workflows", label: "Compose" },
	{ href: "/templates", label: "Templates" },
	{ href: "/mcp", label: "MCP" },
	{ href: "/conventions", label: "Conventions" },
	{ href: "/install", label: "Install" },
];

export const INSTALL_SHORT = `# any agent — Claude Code, Codex, Cursor, Copilot, …
npx skills@latest add tejastn10/workbench`;

export const INSTALL_AGNOSTIC = `# the Agent Skills open format — installs into whichever agent(s) you pick
npx skills@latest add tejastn10/workbench

# Codex also: point it at the conventions
ln -sf ~/workbench/AGENTS.md ~/.codex/AGENTS.md`;

export const INSTALL_PLUGIN = `# Claude Code — skills + slash commands + MCP servers, managed & updatable
claude plugins marketplace add tejastn10/workbench
claude plugins install workbench@tejastn10
claude plugins update workbench          # later`;

export const INSTALL_FULL = `# clone
git clone git@github.com:tejastn10/workbench.git ~/workbench

# link every skill directory -> ~/.claude/skills/<name>  (editable; git pull to update)
~/workbench/scripts/install-skills.sh
~/workbench/scripts/install-skills.sh --list          # what's available
~/workbench/scripts/install-skills.sh --project DIR   # copy into a repo's .claude + .github

# point global instructions at the conventions
ln -sf ~/workbench/AGENTS.md ~/.codex/AGENTS.md
# and reference ~/workbench/AGENTS.md from ~/.claude/CLAUDE.md`;

export const MCP_JSON = `{
  "mcpServers": {
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] },
    "deepwiki": { "type": "http", "url": "https://mcp.deepwiki.com/mcp" }
  }
}`;

export const MCP_ADD = `claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp`;

export const CONVENTIONS = [
	{
		title: "Commits",
		body: "Conventional Commits (feat / fix / chore / refactor / docs / …), enforced with commitlint. Commit as the configured git user only — no AI co-author trailers, no pushing unless asked.",
	},
	{
		title: "Branches",
		body: "feature/<name>, bugfix/<name>, improvement/<name>. Short, kebab-cased. Enforced by a husky pre-push hook.",
	},
	{
		title: "PR review priorities",
		body: "Reuse before building · correctness · right altitude · convention fit · tests · style last. Stack-specific ordering lives in each pr-review skill (Go leads with correctness, DevOps with safety).",
	},
	{
		title: "Phased delivery",
		body: "Multi-session work is sliced into vertical tracer-bullet phases — a non-goals list, a checkable definition of done, and a git-tag / merged-PR boundary at every phase.",
	},
	{
		title: "Deslopify before commit",
		body: "Any session that touched code runs the subtractive deslopify pass before the commit — it only removes (restating comments, impossible-case guards, one-impl abstractions), never adds.",
	},
	{
		title: "Rejected ideas are kept",
		body: "Decisions to not do something live in .out-of-scope/ as short files, so nothing already ruled out gets re-proposed.",
	},
	{
		title: "Domain glossary per project",
		body: "Each repo keeps a CONTEXT.md with a ubiquitous-language glossary — use the shared term, don't invent synonyms.",
	},
	{
		title: "AGENTS.md is cross-tool",
		body: "Claude Code, Codex, and VS Code all read AGENTS.md — the convention lives there once, not duplicated into per-tool config.",
	},
];

export const EXTERNAL = {
	intro:
		"A few of Matt Pocock's skills are adapted into this repo — trimmed, self-contained, attributed. The rest install from upstream.",
	repo: "https://github.com/mattpocock/skills",
	install: "claude plugins install mattpocock-skills",
	installAlt: "npx skills@latest add mattpocock/skills",
	adapted: [
		{ ours: "planning/grill", theirs: "grill-me + grilling" },
		{ ours: "planning/handoff", theirs: "handoff" },
		{ ours: "quality/tdd", theirs: "tdd" },
	],
	take: ["grill-with-docs", "domain-modeling", "wayfinder", "to-tickets", "research", "wait-what"],
	skip: [
		{ theirs: "code-review", ours: "pr-review/* — built from a real ~120-comment corpus" },
		{ theirs: "diagnosing-bugs", ours: "debugging/investigate-bug" },
	],
};

export const INSTALL_TARGETS = [
	{
		tool: "Claude Code",
		body: "Install the plugin (skills + commands + MCP), or symlink skill dirs with install-skills.sh. git pull / claude plugins update to refresh.",
	},
	{
		tool: "VS Code agent mode",
		body: "Reads the same <name>/SKILL.md format from the user profile or .github/. AGENTS.md is read natively. MCP via .vscode/mcp.json.",
	},
	{
		tool: "Codex",
		body: "Reads AGENTS.md natively (root + nested). No skills directory — reference a skill's path from AGENTS.md, or paste it in. MCP via ~/.codex/config.toml.",
	},
];
