# skills

Agent skills, organized by category. Each skill is a self-contained Markdown
file that assumes the conventions in [`../AGENTS.md`](../AGENTS.md).

| Category         | Purpose                                                  | Status       |
| ---------------- | ------------------------------------------------------- | ------------ |
| `pr-review/`     | Per-language PR review (NestJS, Python, Go)             | in progress  |
| `docs/`          | Doc generation — PRD, ADR, design docs                  | planned      |
| `scaffolding/`   | Service and module bootstrapping                        | planned      |
| `release/`       | Changelog and release-notes routines                   | planned      |
| `debugging/`     | Investigation flows and incident write-ups             | planned      |

## Installing a skill

**Claude Code**

```bash
mkdir -p .claude/skills/pr-review-python
cp ~/workbench/skills/pr-review/python.md .claude/skills/pr-review-python/SKILL.md
```

For `pr-review/`, also copy `_common.md` or inline its contents — the
per-language files build on it.

**VS Code agents / Codex** — reference the skill path from the agent's
instructions file, or paste it as context for a one-off review.
