---
name: mongo-aggregation
description: Write and review MongoDB aggregation pipelines — stage order for index use ($match/$sort first), $group, $lookup and $unwind cost, $facet, memory limits and allowDiskUse, and when to use a materialized rollup instead. Use when building a report/analytics pipeline in Mongo, aggregating documents, or when a pipeline is slow or hits the memory limit.
---

# MongoDB aggregation

## Stage order is performance

The pipeline runs top to bottom. Only the **leading** `$match` and `$sort` can use
an index — once a `$group` / `$project` / `$unwind` transforms the docs, later
stages scan in memory.

- **`$match` as early as possible** — filter before anything else.
- **`$sort` before `$group`** if you want an index-backed sort; after `$group`
  it's an in-memory sort of the grouped output.
- **`$project` / `$unset`** early to drop big fields you don't need downstream
  (less data through the pipeline).
- **`$limit` early** when you only need top-N.

## Stages

- **`$group`** — `_id` is the group key; accumulators (`$sum`, `$avg`, `$push`,
  `$addToSet`, `$first`/`$last` with a prior `$sort`, `$topN`).
- **`$lookup`** — join. Cheap only with an indexed `foreignField` and a small
  left side. `$unwind` after `$lookup` multiplies docs — filter first.
- **`$facet`** — multiple sub-pipelines over the same input in one pass (counts +
  page + aggregates for a dashboard). Note: `$facet` can't use indexes for its
  sub-pipelines beyond what the pre-facet stages established.
- **`$setWindowFields`** — running totals / rank / lag, the window-function
  equivalent.
- **`$merge` / `$out`** — write the result to a collection (materialized rollup).

## Limits

- Each stage has a **100 MB memory cap**. Hitting it → `{ allowDiskUse: true }`,
  but that's a smell: filter earlier, or pre-aggregate.
- `explain("executionStats")` on the pipeline — check the leading stage uses an
  index (`IXSCAN`, not `COLLSCAN`).
- Result doc still bound by 16 MB — a giant `$group … $push` can exceed it.

## When not to use a pipeline

Dashboards that load constantly should read a **rollup collection** maintained
incrementally (`$merge` on a schedule, or updated on write via the computed
pattern), not run a full aggregation every request — same principle as Postgres
materialized views (`data/postgres-aggregation`).

## Anti-patterns

- ❌ `$match` after `$group` (index is already gone).
- ❌ `$lookup` then `$unwind` then `$match` — filter before the join.
- ❌ `allowDiskUse: true` as the fix instead of filtering earlier.
- ❌ Running the full pipeline on every dashboard load.
