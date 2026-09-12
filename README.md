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

- **13 skill categories** — workflows, planning, design, PR review, quality, git, data, queues, observability, deployment, incident, security, meta. Each grounded in real conventions, not generic best practice.
- **Workflows**: orchestrator skills that invoke the right *sequence* of others for a whole task (feature, change, incident, repo onboarding).
- **PR Review Skills**: Per-stack (NestJS/TypeScript, Go, Python, React, DevOps), distilled from ~120 real review comments.
- **Data & infra**: Postgres/Mongo/BigQuery/Redis indexing and aggregation; SQS/Kafka/BullMQ lifecycle and DLQ; OTEL + the LGTM stack.
- **Ship safely**: additive migrations, flag-gated cutovers, canary rollout, rollback, hotfix, incident response, blameless postmortems.
- **Phased Delivery**: multi-session work as tracer-bullet phases with non-goals and real rollback points.
- **Deslopify**: a subtractive pass that strips AI slop from freshly written code before commit.
- **Doc templates**: PRD, ADR, POSTMORTEM — one house format, filled by skills.
- **MCP Setup**: Context7 and DeepWiki configs with per-client setup notes (GitHub goes through `gh`).
- **Global Conventions**: commit, branch, and review standards in one place — see [AGENTS.md](AGENTS.md).

---

## Getting Started 🚀

Skills are the **Agent Skills open format** (`skills/<category>/<name>/SKILL.md`) and `AGENTS.md` is cross-tool — nothing is locked to one agent.

**Any agent** — Claude Code, Codex, Cursor, Copilot, Windsurf, …:

```bash
npx skills@latest add tejastn10/workbench     # pick skills + which agents
```

**Claude Code plugin** — managed, versioned, with slash commands + MCP servers:

```bash
claude plugins marketplace add tejastn10/workbench
claude plugins install workbench@tejastn10
```

**Or clone and symlink** (editable, `git pull` to update):

```bash
git clone git@github.com:tejastn10/workbench.git ~/workbench
~/workbench/scripts/install-skills.sh
```

Skills assume the conventions in `AGENTS.md`; if a project diverges, its own `CONTEXT.md` records the difference. Full walkthrough: [`docs/USAGE.md`](docs/USAGE.md) · plugin details: [`docs/plugin.md`](docs/plugin.md).

### Which route

| Route | Tools | Notes |
| --- | --- | --- |
| `npx skills add` | Claude Code, Codex, Cursor, +30 | the portable one — use for Codex |
| `claude plugins install` | Claude Code | + slash commands + MCP, auto-updates on `version` bump |
| `scripts/install-skills.sh` | Claude Code, VS Code | symlinked & editable; `--project` copies into a repo |
| reference `AGENTS.md` | Codex (native), all | the conventions, read directly |

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
├── .claude-plugin/
│   ├── plugin.json         # plugin manifest — lists every skill directory
│   └── marketplace.json    # this repo as its own Claude Code marketplace
├── .mcp.json               # MCP servers the plugin adds (Context7, DeepWiki)
├── commands/               # slash commands — /new-feature, /ship-change, /review, …
├── skills/                 # 12 categories · one dir per skill (<category>/<name>/SKILL.md)
│   ├── workflows/          #   orchestrators: new-feature, ship-change, handle-incident, adopt-repo
│   ├── planning/           #   grill, orient, evaluate-dependency, spike, phased-delivery, handoff, write-prd/adr
│   ├── design/             #   design-endpoint/event/schema, evolve-contract, scaffold-*
│   ├── pr-review/          #   nestjs / go / python / react / devops
│   ├── quality/            #   deslopify, tdd, refactors, git history (split/rebase/conflicts/bisect)
│   ├── data/               #   postgres / mongo / bigquery / redis — indexing, aggregation, cache
│   ├── queues/             #   sqs-consumer, kafka, bullmq
│   ├── observability/      #   instrument-service, debug-with-traces, define-alerts
│   ├── deployment/         #   data/code-migration, deploy-service, cut-release, rollback, hotfix
│   ├── incident/           #   investigate-bug, incident-response, on-call, postmortem
│   ├── security/           #   security-review, audit-dependencies
│   └── meta/               #   write-skill, audit-skills, distill-review-style
├── scripts/                # install-skills.sh · validate-skills.mjs
├── lefthook.yml            # local git hooks — conventional commits, branch names, validation
├── .commitlintrc.yml       # @commitlint/config-conventional
├── .agents/                # per-tool setup notes, MCP configs, gh-cli, external-skills
├── docs/                   # templates/ · USAGE.md · plugin.md · composing-skills.md
├── .out-of-scope/          # decisions to NOT do something, kept not deleted
├── AGENTS.md · CONTEXT.md · LICENSE.md · README.md
```

---

## Conventions 📐

- **Commits**: Conventional commits (`feat:`, `fix:`, `chore:`, `refactor:`, …).
- **Branches**: `feature/<name>` · `bugfix/<name>` · `improvement/<name>`.

Full detail in [AGENTS.md](AGENTS.md).

### Working on this repo

```bash
node scripts/validate-skills.mjs        # frontmatter, name↔folder, dup names, plugin.json sync
brew install lefthook && lefthook install   # commit-msg + branch-name + validate hooks
```

CI (`.github/workflows/validate.yml`) runs the validator and commitlint on every push / PR.

---

## License 📜

This project is licensed under the MIT License. See the [LICENSE](LICENSE.md) file for details.

---

## Acknowledgments 🙌

- Named **Workbench** — where the tools are kept, and kept sharp.
- Built with ❤️ for coding agents.
