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

- **PR Review Skills**: Per-stack review skills (NestJS/TypeScript, Go, Python, React, DevOps) matched to my actual review style, not generic best practices.
- **Doc Generation**: Reusable templates and skills for PRDs, ADRs, and postmortems.
- **Service Scaffolding**: Bootstrapping new services and modules with my conventions baked in.
- **Phased Delivery**: Splitting multi-session work into tracer-bullet phases with non-goals and real rollback points.
- **Release Routines**: Conventional-commit-driven changelogs and release notes.
- **Debugging Playbooks**: Structured investigation flows and incident write-ups.
- **Deslopify**: A subtractive pass that strips AI slop from freshly written code before commit.
- **MCP Setup**: Context7 and DeepWiki configs with per-client setup notes (GitHub goes through `gh`).
- **Global Conventions**: Commit, branch, and review standards in one place — see [AGENTS.md](AGENTS.md).

---

## Getting Started 🚀

Full walkthrough: [`docs/USAGE.md`](docs/USAGE.md). The short version:

```bash
git clone git@github.com:tejastn10/workbench.git ~/workbench
~/workbench/scripts/install-skills.sh          # symlink skills → ~/.claude/skills/<name>/SKILL.md
```

Each skill is a self-contained Markdown file with `name` / `description` frontmatter, loaded by Claude Code and VS Code agent mode alike. Skills assume the conventions in `AGENTS.md`; if a project diverges, its own `CONTEXT.md` records the difference.

### Installing a Skill ⚙️

- **Global** — `scripts/install-skills.sh` symlinks every skill; `git pull` keeps them current.
- **Per project** — `scripts/install-skills.sh --project /path/to/repo` copies them into `.claude/skills/` and `.github/skills/`.
- **Codex** — reference a skill's path from `AGENTS.md`, or paste it in for a one-off.

### MCP Setup 🔌

MCP server configs live in `.agents/mcp/` (Context7 for library docs, DeepWiki for unfamiliar repos). Copy the relevant server block into your agent's MCP config:

- **Claude Code** — `~/.claude.json` or a project `.mcp.json`
- **VS Code** — `.vscode/mcp.json`
- **Codex** — `~/.codex/config.toml`

Per-server notes (env vars, auth, gotchas) live alongside each config. GitHub access goes through the `gh` CLI, not an MCP server — see [`.agents/github-cli.md`](.agents/github-cli.md).

---

## Structure 📂

```bash
workbench/
├── skills/                 # Agent skills, organized by category
│   ├── pr-review/          #   Per-stack PR review + distill-review-style
│   ├── docs/               #   Doc generation (PRD, ADR)
│   ├── planning/           #   grill, phased-delivery, handoff
│   ├── scaffolding/        #   Service and module scaffolding
│   ├── release/            #   Changelog and release routines
│   ├── debugging/          #   Investigation and incident playbooks
│   └── quality/            #   deslopify, tdd
├── scripts/
│   └── install-skills.sh   # Wire skills into Claude Code / VS Code
├── .agents/                # Agent-specific config and shared setup
│   ├── mcp/                #   MCP server configs (Context7, DeepWiki)
│   ├── claude-code/  vscode/  codex/   #   per-tool setup notes
│   ├── github-cli.md       #   GitHub access via gh
│   └── external-skills.md  #   Matt Pocock's skills — adapted + install pointers
├── docs/
│   ├── templates/          #   PRD, ADR, POSTMORTEM
│   └── USAGE.md            #   How to install and use everything
├── .out-of-scope/          # Decisions to NOT do something, kept not deleted
├── AGENTS.md               # Global conventions — cross-tool source of truth
├── CONTEXT.md              # Stub — per-project domain glossary + context
├── LICENSE.md              # MIT
└── README.md              # This file
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
