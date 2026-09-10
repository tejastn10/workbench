---
name: new-feature
description: End-to-end orchestration for building a non-trivial new feature — invoke the right skills in order, from alignment through to release. Use when starting a feature that spans more than one session, when asked to "build X", "implement the Y feature", or "let's start on Z" and Z is substantial.
---

# Workflow — new feature

An **orchestrator**: it doesn't do the work, it says which skill to invoke when and
what each stage hands to the next. Invoke each named skill with the Skill tool at
its stage.

## Stages

| # | Invoke | Produces |
| - | --- | --- |
| 1 | `planning/grill` | shared understanding — every open decision resolved |
| 2 | `planning/evaluate-dependency` *(if new libs are in question)* | adopt / build / do-nothing per dependency |
| 3 | `planning/write-prd` | the spec — problem, goals, non-goals, rollout, metrics |
| 4 | `design/design-endpoint` and/or `design/design-schema` and/or `design/design-event` | the contracts |
| 5 | `planning/phased-delivery` | the phase list — each phase vertical, with non-goals + a checkable done + a tag/merge boundary |

Then **per phase** (fresh session each):

| # | Invoke | Notes |
| - | --- | --- |
| 6 | `design/scaffold-nestjs-module` *(if a new module)* | the skeleton |
| 7 | `quality/tdd` | red → green, one seam at a time |
| 8 | `quality/deslopify` | before the commit — subtractive only |
| 9 | `quality/split-commit` | conventional commits, one logical change each |
| 10 | `pr-review/<stack>` | self-review the diff before opening the PR |
| 11 | `security/security-review` *(if the phase touches auth, user input, files, external requests, or deps)* | traced exploit paths, not a CVE dump |
| 12 | phase boundary | tag `phase-N-<slug>` or merge the PR — the rollback point |

Then to ship:

| # | Invoke | Notes |
| - | --- | --- |
| 13 | `deployment/data-migration` | schema first, additive |
| 14 | `deployment/code-migration` *(if a risky cutover)* | flag-gated ramp with fallback |
| 15 | `deployment/deploy-service` | canary, watch the signals |
| 16 | `deployment/cut-release` | tag `vX.Y.Z`, grouped notes |
| 17 | `observability/instrument-service` + `observability/define-alerts` *(if new surface)* | so the feature is visible in prod |

## Rules

- Don't skip stage 1–5 to start coding. Misalignment is the most expensive failure.
- Confirm the phase list (stage 5) with the user before building.
- Each phase is one fresh session — clear/compact at the boundary.
- If the whole feature fits in one session, this is overkill — go straight to
  `quality/tdd` + `quality/deslopify`.
