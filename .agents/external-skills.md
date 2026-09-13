# External skills

Matt Pocock's [`mattpocock/skills`](https://github.com/mattpocock/skills) (MIT) is
a ~30-skill set for "real engineering, not vibe coding". Two ways to use it here:

1. **Adapted copies** of a few, living in `../skills/` — trimmed, self-contained,
   pointed at this repo's conventions. Listed below.
2. **The rest, installed from upstream** — they update as Matt ships and are
   designed to be subscribed to, not forked.

## Adapted into this repo

| This repo                             | From Matt's             | Notes                                    |
| ------------------------------------- | ----------------------- | -------------------------------------- |
| `planning/grill`            | `grill-me` + `grilling`  | self-contained; hands to phased-delivery / write-prd |
| `planning/orient`           | `wayfinder` (spirit)     | adds the `CONTEXT.md` output            |
| `planning/spike`            | `prototype`              | timeboxed, delete-after, write-up rule  |
| `planning/handoff`          | `handoff`                | self-contained                          |
| `planning/to-questionnaire` | `to-questionnaire`       | self-contained; runs after a stalled `grill` |
| `quality/wait-what`         | `wait-what`              | self-contained; leans on `CONTEXT.md` vocab |
| `quality/tdd`               | `tdd`                    | inlined the `tests.md` / `mocking.md` refs |
| `quality/resolve-merge-conflicts` | `resolving-merge-conflicts` | lockfile-regeneration specifics    |
| `meta/write-skill`          | `writing-for-agents` (spirit) | this repo's frontmatter + house style |

Every adapted skill starts a body line with `Adapted from [mattpocock/skills]`.
Re-check against upstream a couple of times a year.

## Install from upstream

```bash
# Claude Code — managed plugin, auto-updates
claude plugins install mattpocock-skills
#   then, once per repo:
/setup-matt-pocock-skills

# any agent — editable copies via the skills CLI
npx skills@latest add mattpocock/skills
```

**Worth taking** (gaps our set doesn't cover):

| Skill | Why |
| --- | --- |
| `grill-with-docs` | grilling that also drafts `CONTEXT.md` + ADRs as it goes — richer than our `grill` + `write-adr` |
| `domain-modeling` | builds the ubiquitous-language glossary our `CONTEXT.md` wants |
| `to-tickets` / `to-spec` / `triage` | turning a goal into tracked, triaged, blocking-edge work (needs `/setup-matt-pocock-skills`) |
| `teach` | stateful multi-session teaching workspace (`MISSION.md`, `RESOURCES.md`, `lessons/*.html`) — too big and too far outside engineering scope to adapt; use upstream as-is |

**Skip — we have our own, grounded version:**

| Matt's | Ours |
| --- | --- |
| `code-review` | `skills/pr-review/*` (built from a real 120-comment corpus, per stack) |
| `diagnosing-bugs` | `incident/investigate-bug` |
| `improve-codebase-architecture` / `codebase-design` | overlaps `skills/quality/` intent |

## `mattpocock/agent-rules-books`

<https://github.com/mattpocock/agent-rules-books> — `AGENTS.md` rules distilled from
Clean Code, Refactoring, DDD, Clean Architecture, DDIA. Reference material for
`../AGENTS.md`, not a skill install.
