<p align="center">
  <img src="logo.svg" alt="Logo">
</p>

# Workbench 🛠️

![License](https://img.shields.io/badge/License-MIT-yellow?logo=open-source-initiative&logoColor=white)
![Claude Code](https://img.shields.io/badge/Claude%20Code-agent%20config-D97757?logo=anthropic&logoColor=white)
![MCP](https://img.shields.io/badge/MCP-servers-000000?logo=modelcontextprotocol&logoColor=white)
![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-FE5196?logo=conventionalcommits&logoColor=white)

**Workbench** is a personal collection of agent skills, instructions, and MCP configuration for coding agents — reused across [Claude Code](https://claude.com/claude-code), VS Code agents, and Codex. Not a framework: just my setup, kept in one place so whichever agent I'm driving pulls from the same conventions.

**Workbench:** where the tools are kept, and kept sharp.

---

## Features 🌟

- **PR Review Skills**: Per-language review skills (NestJS/TypeScript, Python, Go) matched to my actual review style, not generic best practices.
- **Doc Generation**: Reusable templates and skills for PRDs, ADRs, and design docs.
- **Service Scaffolding**: Bootstrapping new services and modules with my conventions baked in.
- **Release Routines**: Conventional-commit-driven changelogs and release notes.
- **Debugging Playbooks**: Structured investigation flows and incident write-ups.
- **MCP Setup**: Model Context Protocol server configs and setup notes, shared across agents.
- **Global Conventions**: Commit, branch, and review standards in one place — see [AGENTS.md](AGENTS.md).

---

## Getting Started 🚀

Each skill is a self-contained Markdown file. It assumes the conventions in `AGENTS.md`; if a project diverges, that project's own `CONTEXT.md` records the difference.

### Using a Skill ⚙️

**Claude Code** — copy or symlink the skill into a project (or `~/.claude/skills/` for global use):

```bash
mkdir -p .claude/skills/pr-review-go
cp ~/workbench/skills/pr-review/go.md .claude/skills/pr-review-go/SKILL.md
```

Or reference its path directly from the project's `CLAUDE.md`.

**VS Code agents / Codex** — point the agent's instructions file at the skill, or paste it as context for a one-off review.

### MCP Setup 🔌

MCP server configs live in `.agents/mcp/`. Copy the relevant server block into your agent's MCP config:

- **Claude Code** — `~/.claude/mcp.json` or a project `.mcp.json`
- **VS Code** — `.vscode/mcp.json`
- **Codex** — `~/.codex/config.toml`

Per-server notes (env vars, auth, gotchas) live alongside each config.

---

## Structure 📂

```bash
workbench/
├── skills/               # Agent skills, organized by category
│   ├── pr-review/        #   Per-language PR review (nestjs, python, go)
│   ├── docs/             #   Doc generation (PRD, ADR, design docs)
│   ├── scaffolding/      #   Service and module scaffolding
│   ├── release/          #   Changelog and release routines
│   └── debugging/        #   Investigation and incident playbooks
├── .agents/              # Agent-specific config and notes (Claude Code, VS Code, Codex)
│   └── mcp/              #   MCP server configs and setup notes
├── docs/
│   └── templates/        # Reusable document templates (PRD, ADR, …)
├── AGENTS.md             # Global conventions — commits, branches, review priorities
├── CONTEXT.md            # Stub — project context is per-project, not per-repo
├── LICENSE.md            # MIT
└── README.md            # This file
```

---

## Conventions 📐

- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, …), enforced with commitlint.
- **Branches**: `feature/<name>`, `bugfix/<name>`.

Full detail in [AGENTS.md](AGENTS.md).

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Named **Workbench** — where the tools are kept, and kept sharp.
- Built with ❤️ for coding agents.
