---
name: incident-response
description: Run a live production incident — declare severity, assign roles, stabilize (mitigate before fixing), communicate on a cadence, keep a timeline as you go, and hand off to a postmortem when it's resolved. Use when prod is down or degraded right now, an alert has paged, or the user says "we have an incident" / "prod is broken" / "everything's on fire".
---

# Incident response

The job during an incident is **restore service**, not find the root cause. Root
cause comes after, in the postmortem.

## 1. Declare

- **Severity** — `SEV1` (major outage / data loss / security), `SEV2` (significant
  degradation, key flow broken), `SEV3` (minor, contained). When unsure, round up.
- Open an incident channel. State: what's affected, since when, who's on it.

## 2. Assign roles (even solo, name them)

- **Incident Commander** — owns the response, makes calls, does not also debug.
- **Ops / responder** — investigates and applies changes.
- **Comms** — status page, stakeholder updates.
  Solo: you're IC + ops; still post updates on a timer.

## 3. Stabilize — mitigate before you fix

Fastest safe lever first:

- Feature flag off (`deployment/rollback`).
- Roll back the last deploy.
- Scale up / shed load / rate-limit the bad path.
- Fail over (replica, region).
- Disable the broken feature.

A crude mitigation that restores service now beats a correct fix in an hour.

## 4. Communicate on a cadence

- First update within minutes: "investigating, impact is X".
- Then every 15–30 min (SEV1) even if it's "still working on it".
- Say impact in user terms, not internals. No speculation on cause.
- Final: "resolved at HH:MM, postmortem to follow".

## 5. Timeline as you go

Timezone-stamp every action and finding in the channel while it happens — memory
is worse than you think an hour later. This becomes the postmortem timeline.

## 6. Resolve & hand off

- **Resolved** = the user-facing metric is back to baseline and holding, confirmed
  — not "the deploy finished".
- Don't immediately roll the fix forward — hold until the cause is understood.
- Within a few days: `incident/postmortem` (blameless).

## Anti-patterns

- ❌ Debugging root cause while the site is down instead of mitigating.
- ❌ The IC also being head-down in the code.
- ❌ Going quiet — no updates while you work.
- ❌ Speculating about cause in a public update.
- ❌ "Resolved" because the deploy succeeded, not because the metric recovered.
- ❌ No timeline until you sit down to write the postmortem.
