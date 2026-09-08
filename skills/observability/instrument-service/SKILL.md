---
name: instrument-service
description: Add tracing, metrics, and structured logs to a service using OpenTelemetry and the LGTM stack (Loki, Grafana, Tempo, Mimir) — spans on the real boundaries, RED metrics, log discipline, and the rule that observability init must degrade, never crash. Use when a service has poor visibility, when adding OTEL, or when asked to "instrument this" / "add tracing / metrics".
---

# Instrument a service

Reference stack: OTEL SDK → OTLP → **Tempo** (traces), **Mimir**/Prometheus
(metrics), **Loki** (logs), **Grafana** (view). Matches the `ember` template.

## The non-negotiable rule

**Observability is optional infrastructure, never a hard startup dependency.**

- OTEL / metrics / tracing init failing must **not** take the service down.
  `log.Fatalf` on OTEL init → fall back to a **no-op provider** and start anyway.
- Exporter endpoint down → buffer and drop, don't block requests.
- If you genuinely want loud-fail, fine — but then it's not "optional", pick one
  stance and be consistent.

## Traces

- **Span the real boundaries**: inbound request, outbound HTTP/gRPC, DB query,
  cache call, queue publish/consume, expensive compute. Not every function.
- **Span names** are low-cardinality and stable — `GET /users/:id`, not the
  interpolated path. A 404 that returns `""` for the route → span name becomes
  `"GET "`; add a fallback.
- **Attributes**: `user.id`, `tenant.id`, `queue.name`, result codes — enough to
  filter in Tempo. Never secrets or PII.
- **Propagate context** — thread `context.Context` / the active span through every
  call so the trace isn't broken. A new blocking call that ignores ctx also can't
  be cancelled.
- **Errors** — record the exception on the span, set status `ERROR`.

## Metrics (RED, per endpoint / consumer)

- **Rate** — requests/sec (`http_server_requests_total`).
- **Errors** — error count / ratio.
- **Duration** — a histogram (`_seconds` buckets) for p50/p95/p99, not just a mean.
- Plus: queue depth / lag, cache hit ratio, DB pool in-use, in-flight requests.
- Low-cardinality labels only — no user IDs, no unbounded paths, no request IDs as
  labels.

## Logs

- Structured (JSON), one event per line, correlated with the trace
  (`trace_id` / `span_id` in every line).
- **`info` / `warn` / `error` in prod** — `debug` is invisible there, so anything
  you need during an incident must be `info`+. No per-iteration `debug` logs in
  bulk loops.
- No manual `[module]` / `[method]` prefixes if the framework adds them.
- Never log full `headers` / request `body` / `Authorization` / cookies / the OTP.
- `error.stack`, not `JSON.stringify(error)` (which serializes to `{}`).

## Verify

- A request produces one connected trace across all hops in Tempo.
- The RED metrics show in Grafana; the histogram gives real percentiles.
- Killing the collector doesn't kill the service.
- Graceful shutdown flushes the exporter.

## Anti-patterns

- ❌ `Fatalf` / crash on telemetry init.
- ❌ A span per function; high-cardinality span names.
- ❌ User IDs / paths as metric labels.
- ❌ `debug` logs for something you'd need in an incident.
- ❌ Broken traces because `context` isn't propagated.
