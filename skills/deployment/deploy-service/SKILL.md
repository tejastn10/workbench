---
name: deploy-service
description: Take a change to production safely — pre-deploy checks, decouple schema/config/code steps, roll out gradually (flag / canary), watch the right signals, and know the rollback trigger before you start. Use when asked to "deploy", "ship this", "roll it out", or after a PR merges and needs to reach prod.
---

# Deploy a service

The devops pr-review skill *reviews* pipelines; this *runs* a rollout.

## Before you start

- [ ] CI green — build, tests, lint, security-audit.
- [ ] The **rollback plan** is written and the trigger is defined ("if error rate
      > X for 5 min, roll back"). Know it before deploying, not during.
- [ ] Ordered steps if the change spans layers: **schema migration first**
      (additive, `deployment/data-migration`), then config, then code. New
      code must run against the old schema and vice versa.
- [ ] Feature-flagged if the change is risky (`deployment/code-migration`) —
      deploy dark, then ramp.
- [ ] Anyone who needs to know is told (on-call, dependent teams for a contract
      change).

## Rollout

- **Prefer**: canary / rolling / blue-green over the deploy target's mechanism, so
  a bad build doesn't hit 100% at once.
- Deploy → **health check passes** → small slice of traffic → **watch** → widen.
- **Watch** (`../observability/`): error rate, p50/p99 latency, the metric the
  change was meant to move, saturation (pool / queue / CPU), downstream health.
  Watch for at least one full traffic cycle, not 30 seconds.
- A `latest` image tag only moves for the default branch.

## After

- Confirm the change actually does what it was for (not just "no errors").
- Close the loop: update the ticket, note anything surprising.
- If it's a release, tag it (`deployment/cut-release`).

## Anti-patterns

- ❌ Deploying without a written rollback trigger.
- ❌ Code and its schema migration in one indivisible step.
- ❌ 0 → 100% with no canary.
- ❌ "Looks fine" after 30 seconds.
- ❌ Deploying on a Friday afternoon / before being AFK, for anything non-trivial.
