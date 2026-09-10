---
name: ship-change
description: The development loop for a change that fits in roughly one session — orient if needed, pick the domain skill for the area, build test-first, deslopify, clean the commits, self-review, security-check if warranted, ship. Use when asked to "fix X", "add Y", "change Z" and it's a bounded change, not a multi-session feature (that's new-feature).
---

# Workflow — ship a change

Orchestrator for the common case: a bounded change, one session. Invoke each named
skill with the Skill tool.

## Loop

| # | Invoke | When |
| - | --- | --- |
| 1 | `planning/orient` | first time working in this repo — skip if you know it |
| 2 | the **domain skill** for what you're touching: | |
|   | `design/evolve-contract` | changing an existing API / response / enum / event |
|   | `data/review-query` · `data/postgres-indexing` · `data/mongo-modeling` · `data/redis-patterns` | the change is a query / schema / cache path |
|   | `queues/sqs-consumer` · `queues/kafka` · `queues/bullmq` | the change is a producer / consumer |
|   | `observability/instrument-service` | adding a service surface that needs visibility |
| 3 | `quality/tdd` | build it — failing test first, minimum to pass |
| 4 | `quality/deslopify` | before committing — remove restating comments, impossible-case guards, etc. |
| 5 | `quality/split-commit` | one logical change per conventional commit |
| 6 | `pr-review/<stack>` | review your own diff as if it were someone else's |
| 7 | `security/security-review` | **only if** the change touches auth, user input, file handling, external requests, or dependencies |
| 8 | `deployment/deploy-service` | if you're the one shipping it |

## Rules

- Step 2 is "load the reference for the area you're in" — often just one skill.
- Steps 4–6 are non-negotiable on any change that touched code.
- Step 7 is conditional — don't run a full security pass on a copy tweak.
- If mid-change you discover it's actually a multi-session job → stop, switch to
  `workflows/new-feature`.
