# Using workbench

How to get the skills, templates, MCP servers, and conventions in this repo into
your agents.

---

## 1. Clone

```bash
git clone git@github.com:tejastn10/workbench.git ~/workbench
```

Keep it at a stable path (`~/workbench`) — the install steps below symlink into it,
so moving it later breaks the links. `git pull` to update; the symlink approach
means updates land automatically.

---

## 2. Point your agent's global instructions at AGENTS.md

The conventions (commits, branches, review priorities, phased delivery, deslopify)
live in `AGENTS.md`. Don't copy them around — reference them.

| Agent        | File                        | Content                                             |
| ------------ | --------------------------- | -------------------------------------------------- |
| Claude Code  | `~/.claude/CLAUDE.md`       | `See ~/workbench/AGENTS.md for global conventions.` |
| Codex        | `~/.codex/AGENTS.md`        | symlink → `~/workbench/AGENTS.md`                   |
| VS Code      | user `copilot-instructions` | `Follow ~/workbench/AGENTS.md.`                     |

VS Code, Claude Code, and Codex all read `AGENTS.md` natively now, so a symlink is
usually enough:

```bash
ln -sf ~/workbench/AGENTS.md ~/.codex/AGENTS.md
```

---

## 3. Install the skills

Skills are plain Markdown with `name` / `description` frontmatter. Claude Code and
VS Code agent mode both load the `SKILL.md` format; the install script produces it.

```bash
~/workbench/scripts/install-skills.sh            # symlink all skills → ~/.claude/skills/<name>/SKILL.md
~/workbench/scripts/install-skills.sh --dry-run  # preview
~/workbench/scripts/install-skills.sh --list     # list what's available
```

Symlinks mean `git pull` in `~/workbench` updates every skill in place.

**VS Code** reads the same `SKILL.md` format from the user profile or `.github/` —
point it at `~/.claude/skills`, or drop copies into a project (below).

**Per project / another machine** — copies, not symlinks:

```bash
~/workbench/scripts/install-skills.sh --project /path/to/repo
# writes repo/.claude/skills/*/SKILL.md and repo/.github/skills/*/SKILL.md
```

**Codex** has no skills directory — reference a skill's path from `AGENTS.md`, or
paste it in for a one-off.

---

## 4. Borrowed skills — Matt Pocock

A few are **adapted into this repo** (`grill`, `handoff`, `tdd` — trimmed and
self-contained). The rest install from upstream:

```bash
# Claude Code — managed plugin, auto-updates
claude plugins install mattpocock-skills
#   then, once per repo:
/setup-matt-pocock-skills

# any agent — editable copies
npx skills@latest add mattpocock/skills
```

Take the workflow skills we don't cover (`grill-with-docs`, `domain-modeling`,
`wayfinder`, `to-tickets`, `research`); skip his `code-review` / `diagnosing-bugs`
in favour of our corpus-grounded `pr-review/*` and `investigate-bug`. Full mapping
in `.agents/external-skills.md`.

---

## 5. MCP servers

```bash
# Claude Code
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp
```

VS Code → `.vscode/mcp.json`, Codex → `~/.codex/config.toml`. Blocks for each are
in `.agents/mcp/`. GitHub is not an MCP server here — `gh` covers it
(`.agents/github-cli.md`).

Verify: `/mcp` in a session, both `connected`.

---

---

## 6. Per project, once

When you start using an agent in a new repo:

1. Copy `CONTEXT.md` from this repo into the project and fill in the glossary +
   stack + landmines. Run Matt's `/grill-with-docs` to draft it.
2. Add a project `.out-of-scope/` as decisions get ruled out.
3. If the project's commit/branch rules differ from `AGENTS.md`, note the
   deviation in its `CONTEXT.md`.

---

## 7. Building your own review skill

The review skills are generated from a real corpus of your PR comments, not from
best-practice lists. On the machine with access to the repos (your work laptop):

> Run the `distill-review-style` skill (`skills/pr-review/distill-review-style.md`).
> It pulls your review comments with `gh`, categorises what you flag / let slide /
> how you phrase it, and emits a `skills/pr-review/<stack>-pr-review.md`.

See §"Prompt to run on the work laptop" below for a copy-paste version.

---

## Prompt to run on the work laptop

```
Read ~/workbench/skills/pr-review/distill-review-style.md and follow it.

Target: my review comments in the <ORG> org, repos <repo-a>, <repo-b>, <repo-c>,
from the last 4 months. My GitHub login is <me>.

Produce skills/pr-review/<stack>-pr-review.md in the same format and voice as the
existing nestjs-backend-pr-review.md — ranked flags with verbatim quotes, a
"what to let slide" section, measured phrasing percentages, and an order-of-
operations. If a stack has fewer than ~15 comments, extend the closest existing
skill instead of writing a new one.

Do not commit. Show me the file for review first.
```
