---
name: define-alerts
description: Define alerts and SLOs that page on real user pain, not noise — pick SLIs from the RED metrics, set a target and error budget, alert on burn rate (multi-window), and make every alert actionable with a runbook link. Use when a service has no alerting, when asked to "add alerts / an SLO", or after an incident that nothing caught.
---

# Define alerts & SLOs

Rule: **every alert that pages is a human waking up.** If it's not worth that,
it's a dashboard, not an alert.

## SLIs — what to measure

From the RED metrics (`observability/instrument-service`), pick the few that represent the
user experience:

- **Availability** — `1 - (failed requests / total requests)` for the endpoint(s)
  that matter.
- **Latency** — proportion of requests faster than a threshold
  (`p99 < 500ms` → "99% of requests under 500ms").
- For a consumer/pipeline — **freshness** (age of the newest processed item) and
  **backlog** (queue depth / lag).

Exclude what the user doesn't feel (health checks, internal cron).

## SLO & error budget

- Set a target: `99.9%` over a rolling 28 days. That's ~40 min of budget/month.
- The budget is the licence to move fast; burning it fast is the signal.

## Alert on burn rate, not thresholds

- **Multi-window, multi-burn-rate**: page when the budget is burning fast enough
  to exhaust in hours (e.g. 14.4× over 1h **and** 5m), ticket when it's a slow
  burn (3× over 6h). This catches real problems fast and ignores blips.
- A raw `error_rate > 1%` alert fires on every transient spike — noise.

## Also alert on (symptom, not cause)

- Hard-down: no successful requests in N minutes.
- Saturation with imminent impact: pool/queue/disk near capacity and climbing.
- Certificate expiry, cron didn't run, deploy stuck.

Don't alert on: CPU/memory alone (unless it's about to cause user impact), single
error events, things a retry handles.

## Make it actionable

- Every alert links a **runbook**: what it means, how to confirm, first
  mitigations, escalation.
- Alert name says the user impact ("Checkout error budget burning fast"), not the
  metric ("http_5xx high").
- Route by severity: page vs ticket vs Slack.

## Verify

- Trigger it in staging (or reason through a past incident) — would it have fired,
  and in time?
- Check for alerts that never fire (dead) or always fire (ignored).

## Anti-patterns

- ❌ Threshold alerts on raw error rate / latency.
- ❌ Paging on CPU or memory with no user impact.
- ❌ An alert with no runbook.
- ❌ Alert names that describe the metric, not the impact.
- ❌ SLO target of 100% (no budget = no room to ship).
