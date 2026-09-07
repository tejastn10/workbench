# skills

Agent skills, organized by category. Each skill is a directory
(`<category>/<name>/`) containing a `SKILL.md` with `name` / `description`
frontmatter — the Claude Code plugin format. Skills assume the conventions in
[`../AGENTS.md`](../AGENTS.md). Each category folder has its own README.

`workflows/` is the orchestration layer — a workflow skill invokes a *sequence* of
the others for a whole task (feature, change, incident, onboarding). See
[`workflows/README.md`](workflows/README.md) and the composition guide,
[`../docs/composing-skills.md`](../docs/composing-skills.md).

| Category         | What it covers                                             |
| ---------------- | ------------------------------------------------------- |
| `workflows/`     | **Orchestrators** — invoke the right sequence of skills for a whole task |
| `planning/`      | Align, investigate, break down, and write down — before building |
| `design/`        | API / event contracts, data schema, scaffolding new structure |
| `pr-review/`     | Reviewing PRs by stack (NestJS, Go, Python, React, DevOps) |
| `quality/`       | Cleanup, TDD, refactors, and clean git history             |
| `data/`          | Postgres / Mongo / BigQuery / Redis — indexing, aggregation, cache |
| `queues/`        | SQS, Kafka / MSK, BullMQ — lifecycle, DLQ, partitioning     |
| `observability/` | OTEL + LGTM stack — instrument, debug with traces, alerts   |
| `deployment/`    | Migrations, rollout, release, rollback, hotfix              |
| `incident/`      | Bug investigation, live incident response, on-call, postmortem |
| `security/`      | Whole-surface security review, dependency audit             |
| `meta/`          | Maintaining the workbench; building review skills from a corpus |

## Installing

**As a plugin** (skills + slash commands + MCP servers):

```bash
claude plugins marketplace add tejastn10/workbench
claude plugins install workbench@tejastn10
```

**Or symlink the skills** (editable):

```bash
../scripts/install-skills.sh            # link every skill dir → ~/.claude/skills/<name>
../scripts/install-skills.sh --list
../scripts/install-skills.sh --project /path/to/repo
```

See [`../docs/plugin.md`](../docs/plugin.md) and [`../docs/USAGE.md`](../docs/USAGE.md).

## Conventions for skill files

- One skill = one directory `<category>/<name>/` with a `SKILL.md` inside.
- `name:` matches the directory name, unique across the repo.
- `description:` is the router — pack it with real trigger phrases + "Use when …".
- Terse, mechanism-focused body; a "what to let slide" section for review skills;
  end with `## Anti-patterns`. Reference other skills as `` `category/name` ``.
- Adapted-from-elsewhere skills start a body line with `Adapted from [<source>]`.
- Add the new dir path to the `skills` array in `../.claude-plugin/plugin.json`.
- See `meta/write-skill`.
