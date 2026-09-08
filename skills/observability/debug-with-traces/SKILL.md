---
name: debug-with-traces
description: Use traces, metrics, and logs to locate a production problem — start from the symptom in Grafana, find exemplar traces in Tempo, walk the span tree to the slow or failing hop, correlate with logs by trace_id. Use when something is slow or erroring in prod and you have telemetry, or when asked to "check the traces / dashboards" / "why is X slow in prod".
---

# Debug with traces

The telemetry-first counterpart to `incident/investigate-bug` (which
assumes local reproduction). Here the mechanism is found in prod data first, then
confirmed.

## Order of operations

1. **Pin the symptom in metrics.** Grafana: which endpoint / consumer, since when,
   what changed at that time (a deploy? traffic shift? a dependency?). Get the
   RED picture — is it rate, errors, or duration, and at which percentile.
2. **Get exemplar traces.** From the metric (exemplars) or Tempo search: filter by
   service + operation + `status=error` or `duration > p99`. Grab a handful of
   representative bad traces and a good one for comparison.
3. **Walk the span tree.** In a bad trace, find where the time goes or where the
   error originates:
   - one child span eating the wall time → that hop (DB query, downstream call,
     lock wait, external API).
   - a gap between spans → un-instrumented work, or queue/scheduler delay.
   - error status deep in the tree → the origin; the outer errors are propagation.
   - fan-out (N identical child spans) → N+1 or unbatched loop.
4. **Correlate with logs.** Pull Loki logs for that `trace_id` — the log lines
   around the bad span usually name the specific failure (timeout, constraint,
   nil, retry storm).
5. **Compare good vs bad.** Same trace shape? A bad trace missing a cache-hit span
   (cache miss path), or with an extra retry loop, tells you the branch.
6. **Form the hypothesis, state the mechanism**, then confirm — reproduce locally
   if you can, or watch the metric after a targeted change.

## Common shapes

- **p99 spike, p50 flat** → tail latency: a slow replica, GC pauses, a lock,
  connection-pool exhaustion under burst.
- **Error rate step at a deploy time** → the deploy; check its diff.
- **Latency climbs over hours then resets on restart** → a leak (connections,
  goroutines, timers, a growing cache).
- **Downstream span slow** → their problem or your call pattern (no timeout,
  no batching, retrying too hard).

## Anti-patterns

- ❌ Staring at one trace without the metric context (is it representative?).
- ❌ Blaming the outermost error span instead of walking to the origin.
- ❌ Not comparing against a healthy trace.
- ❌ Concluding from telemetry without confirming the mechanism.
