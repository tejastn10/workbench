# Claude Code

Setup notes specific to [Claude Code](https://code.claude.com/docs).

## Where things go

| What                | Location                                              |
| ------------------- | --------------------------------------------------- |
| Global conventions  | `~/.claude/CLAUDE.md` → point it at this repo's `AGENTS.md` |
| Per-project context | `<project>/CLAUDE.md` (or `AGENTS.md` — Claude Code reads both) |
| Skills (global)     | `~/.claude/skills/<name>/SKILL.md`                    |
| Skills (project)    | `<project>/.claude/skills/<name>/SKILL.md`            |
| MCP (global)        | `~/.claude.json`                                      |
| MCP (project)       | `<project>/.mcp.json`                                 |
| Settings            | `~/.claude/settings.json`, `<project>/.claude/settings.json` |

## Installing skills from this repo

```bash
# one skill, into a project
mkdir -p .claude/skills/deslopify
cp ~/workbench/skills/quality/deslopify.md .claude/skills/deslopify/SKILL.md

# or make the whole collection available globally
ln -s ~/workbench/skills ~/.claude/skills/workbench   # then reference by path
```

A skill file needs YAML frontmatter with `name` and `description` — the ones in
`skills/` already have it. Claude Code loads a skill when the description matches
the task, or on `/`<name>.

## Settings

`settings.example.json` here is a starting point — merge it into
`~/.claude/settings.json`. It:

- allowlists the read-only `gh` / `git` calls the review, release, and
  investigate skills make, so they don't prompt every time;
- keeps write actions (`git commit`, `git push`, `gh pr create`) **out** of the
  allowlist — those stay manual, per `AGENTS.md`.

## Commit authorship

Claude Code appends `Co-Authored-By` / `Claude-Session` trailers by default.
`AGENTS.md` says commits are the configured git user only — so either strip those
trailers, or set up a `commit-msg` hook that does. Never `git push` unless asked.

## Plugins

Matt Pocock's skills install as a plugin (`claude plugins install mattpocock-skills`)
— see [`../external-skills.md`](../external-skills.md). Plugin skills are
read-only and auto-update; this repo's skills are editable copies you own.
