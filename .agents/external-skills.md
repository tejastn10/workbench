# External skills

Matt Pocock's [`mattpocock/skills`](https://github.com/mattpocock/skills) (MIT) is
a ~30-skill set for "real engineering, not vibe coding". Two ways to use it here:

1. **Adapted copies** of a few, living in `../skills/` — trimmed, self-contained,
   pointed at this repo's conventions. Listed below.
2. **The rest, installed from upstream** — they update as Matt ships and are
   designed to be subscribed to, not forked.

## Adapted into this repo

| This repo                        | From Matt's         | Changes                                        |
| -------------------------------- | ------------------- | -------------------------------------------- |
| `skills/planning/grill.md`       | `grill-me` + `grilling` | self-contained; hands off to our phased-delivery / write-prd / write-adr |
| `skills/planning/handoff.md`     | `handoff`           | self-contained; references our phase-boundary notes |
| `skills/quality/tdd.md`          | `tdd`               | inlined `tests.md` / `mocking.md` / `codebase-design` refs; stack conventions from our pr-review skills |

Keep these in sync manually when Matt's change materially — check a couple of times
a year.

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
| `grill-with-docs` | grilling that also drafts `CONTEXT.md` + ADRs as it goes — the richer version of our `grill` |
| `domain-modeling` | builds the ubiquitous-language glossary our `CONTEXT.md` wants |
| `wayfinder` / `to-tickets` / `to-spec` / `triage` | turning a goal into tracked, triaged, blocking-edge work |
| `research` / `wait-what` | structured investigation / "explain what just happened" |
| `resolving-merge-conflicts` | structured conflict resolution |

**Skip — we have our own, grounded version:**

| Matt's | Ours |
| --- | --- |
| `code-review` | `skills/pr-review/*` (built from a real 120-comment corpus, per stack) |
| `diagnosing-bugs` | `skills/debugging/investigate-bug.md` |
| `improve-codebase-architecture` / `codebase-design` | overlaps `skills/quality/` intent |

## `mattpocock/agent-rules-books`

<https://github.com/mattpocock/agent-rules-books> — `AGENTS.md` rules distilled from
Clean Code, Refactoring, DDD, Clean Architecture, DDIA. Reference material for
`../AGENTS.md`, not a skill install.
