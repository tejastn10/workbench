---
name: handle-incident
description: Orchestration for a production incident — from the page through mitigation, root cause, fix, and postmortem, invoking the incident and deployment skills in order. Use when an alert fires with user impact, when prod is down or degraded, or the user says "we have an incident".
---

# Workflow — handle an incident

Orchestrator. During an incident, **restore service first** — root cause is later.
Invoke each named skill with the Skill tool.

## Sequence

| # | Invoke | Notes |
| - | --- | --- |
| 1 | `incident/on-call` | triage the alert — real? user impact? severity? |
| 2 | `incident/incident-response` | declare, assign roles, communicate on a cadence, timeline as you go |
| 3 | **mitigate** — fastest safe lever: | |
|   | `deployment/rollback` | flag off / redeploy previous / revert |
|   | (or scale up / shed load / disable the feature) | |
| 4 | `incident/investigate-bug` | once service is stable — reproduce, isolate, trace the mechanism |
|   | `observability/debug-with-traces` | if the mechanism lives in prod telemetry |
|   | `quality/bisect` | if it's a regression and you can name a good commit |
| 5 | `deployment/hotfix` | minimal fix, branch from the released tag, regression test, expedited review, backport |
| 6 | `incident/postmortem` | within a few days — blameless, owned + dated action items |

## Rules

- Do not run step 4 (root cause) while the site is still down. Mitigate first.
- "Resolved" = the user-facing metric recovered and held, confirmed — not "the
  deploy finished".
- Every action gets a timezone stamp in the incident channel as it happens — that
  becomes the postmortem timeline.
- Hold the fix out of prod until the cause is understood.
