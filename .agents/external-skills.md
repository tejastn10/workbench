# External skills

Skill sets worth installing rather than rewriting. These are **not vendored into
this repo** — they update upstream and Matt's set is designed to be subscribed to,
not forked. Install them alongside the skills in `../skills/`.

## Matt Pocock — `mattpocock/skills`

<https://github.com/mattpocock/skills> · MIT · ~30 skills for "real engineering,
not vibe coding". Small, composable, model-agnostic.

**Install**

```bash
# Claude Code plugin (managed, auto-updates):
claude plugins install mattpocock-skills
#   then, once per repo:  /setup-matt-pocock-skills

# or editable copies (skills.sh) for any agent:
npx skills@latest add mattpocock/skills
```

**What fills a real gap here**

| Skill | Why take it |
| --- | --- |
| `grill-me` / `grill-with-docs` | Forces alignment before the agent codes. `grill-with-docs` also drafts `CONTEXT.md` + ADRs so domain names stop being generic. Complements our `write-prd` / `write-adr`. |
| `domain-modeling` | Builds the ubiquitous-language glossary — the thing our `CONTEXT.md` is for. |
| `tdd` | Failing test → minimum code to pass. We have no TDD skill. |
| `wayfinder` / `to-tickets` / `to-spec` / `triage` | Turning a goal into tracked, triaged work. Out of scope for our set. |
| `handoff` | Session-to-session context handoff. |
| `resolving-merge-conflicts` | Structured conflict resolution. |

**What overlaps with ours — pick one, don't run both**

| Theirs | Ours |
| --- | --- |
| `code-review` | `skills/pr-review/*` (ours is grounded in a real 120-comment corpus and per-stack) |
| `diagnosing-bugs` | `skills/debugging/investigate-bug.md` |
| `improve-codebase-architecture` / `codebase-design` | partial overlap with `skills/quality/` intent |

Rule of thumb: keep ours for PR review and bug investigation (they encode Tejas's
actual style); take Matt's for the planning/ticketing/TDD workflows we don't cover.

## `mattpocock/agent-rules-books`

<https://github.com/mattpocock/agent-rules-books> · `AGENTS.md` rules distilled
from Clean Code, Refactoring, DDD, Clean Architecture, DDIA. Reference material for
`../AGENTS.md`, not a skill install.
