---
name: postgres-aggregation
description: Write and review Postgres aggregation queries — GROUP BY, window functions, CTEs and the materialization gotcha, FILTER, ROLLUP/GROUPING SETS, lateral joins, keyset pagination, and materialized views for expensive rollups. Use when building a report / dashboard query, aggregating events, or when an aggregation is slow or wrong.
---

# Postgres aggregation

## Building blocks

- **`GROUP BY`** — every non-aggregated select column must be grouped or
  functionally dependent on the PK. Index the group key.
- **`FILTER (WHERE …)`** — conditional aggregates without a `CASE`:
  `count(*) FILTER (WHERE status = 'paid')`. Cleaner and faster than
  `sum(case when …)`.
- **Window functions** — `row_number() / rank() / lag() / sum() OVER (PARTITION BY … ORDER BY …)`
  when you need per-row context (running totals, "first per group", deltas)
  without collapsing rows.
- **`DISTINCT ON (key) … ORDER BY key, ts DESC`** — the latest row per key, one
  pass, Postgres-specific.
- **`ROLLUP` / `GROUPING SETS`** — subtotals and grand totals in one query.
- **`LATERAL`** join — a subquery that references the outer row (top-N per group).
- **`generate_series`** — fill gaps in a time series so missing buckets show as 0.

## CTEs — the materialization gotcha

Before PG12, `WITH` was always an optimization fence (materialized). PG12+ inlines
by default *unless* referenced multiple times or marked `MATERIALIZED`. Know your
version:

- Use `WITH x AS MATERIALIZED (…)` to force it (compute once, reuse).
- Use `WITH x AS NOT MATERIALIZED (…)` to force inlining (let the planner push
  predicates in).
- A deep CTE chain that's slow → check whether an unwanted fence is the cause.

## Performance

- `EXPLAIN (ANALYZE, BUFFERS)` — look for a `HashAggregate` spilling to disk, or a
  `Sort` that an index could serve.
- **Pre-aggregate** hot dashboards into a **materialized view**; refresh on a
  schedule (`REFRESH MATERIALIZED VIEW CONCURRENTLY`, needs a unique index) or via
  a job.
- For "counts by day for the last 90 days" on a huge events table → a rollup
  table maintained incrementally beats scanning raw events every load.
- **Keyset pagination** (`WHERE (ts, id) < (?, ?) ORDER BY ts DESC, id DESC LIMIT n`)
  not `OFFSET` — `OFFSET 100000` still scans 100k rows.

## Correctness

- `NULL` is excluded by aggregates (except `count(*)`) — `avg` over a column with
  NULLs ignores them; decide if that's right.
- `count(DISTINCT x)` is expensive; if approximate is fine, consider
  `hll` / pre-computed.
- Integer division in `sum(a)/sum(b)` truncates — cast to numeric.

## Anti-patterns

- ❌ `OFFSET` pagination on a large result set.
- ❌ Re-scanning raw events for a dashboard that loads constantly (materialize).
- ❌ `CASE WHEN` soup where `FILTER` reads clearly.
- ❌ Ignoring a CTE materialization fence that's forcing a bad plan.
