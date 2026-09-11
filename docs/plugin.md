# Installing as a Claude Code plugin

This is **one** of several install paths — the one that gives Claude Code users a
managed, versioned, auto-updating bundle. It doesn't lock the repo to Claude Code:
the skills are the Agent Skills open format, `AGENTS.md` is cross-tool, and the
`.claude-plugin/` directory is inert for every other tool. For the tool-agnostic
routes (Codex, Cursor, …) see [`USAGE.md`](USAGE.md#install-anywhere).

The repo is a Claude Code plugin *and* its own **marketplace** — so it installs
the same way as any other, without touching the official marketplace.

## Install

From inside a Claude Code session:

```
/plugin marketplace add tejastn10/workbench
/plugin install workbench@tejastn10
```

(or `claude plugin marketplace add tejastn10/workbench` from the shell). If the
install summary says `Run /reload-plugins to activate`, do that.

That gives you:

- all **skills** — namespaced `/workbench:<name>` (e.g. `/workbench:grill`), and
  model-invoked by their `description`
- the **slash commands** in `commands/` — `/workbench:new-feature`,
  `/workbench:ship-change`, `/workbench:handle-incident`, `/workbench:adopt-repo`,
  `/workbench:deslopify`, `/workbench:review`
- the **MCP servers** in `.mcp.json` — Context7 and DeepWiki

**Updates:** bump `version` in `.claude-plugin/plugin.json` when you push changes,
then users run `/plugin update workbench` (or `claude plugin update workbench`).

## How it's wired

| File | Role |
| --- | --- |
| `.claude-plugin/plugin.json` | the manifest — **explicitly lists every skill directory** (auto-discovery only finds `skills/<name>/SKILL.md` one level deep; our skills are nested under a category, so they must be listed) |
| `.claude-plugin/marketplace.json` | makes this repo a marketplace hosting the `workbench` plugin (`"source": "./"`, marketplace `name` = `tejastn10`) |
| `.mcp.json` | MCP servers — auto-discovered at the plugin root |
| `commands/*.md` | slash commands — auto-discovered |
| `skills/<cat>/<name>/SKILL.md` | one skill per directory |

**When you add a skill:** add its path (`./skills/<category>/<name>`) to the
`skills` array in `plugin.json`, and bump `version`. `commands/` and `.mcp.json`
don't need manifest entries. Run `claude plugin validate .` to check.

## Getting it into the official marketplace

`claude plugins install workbench` (no `@tejastn10`) would require submitting to
Claude Code's official marketplace — a separate, reviewed process. The
marketplace-add flow above works immediately and is the right choice for a
personal setup.

## Without the plugin

`scripts/install-skills.sh` still works — it symlinks each skill directory into
`~/.claude/skills/`. Use it if you want editable skills rather than a managed
plugin bundle. See [`USAGE.md`](USAGE.md).
