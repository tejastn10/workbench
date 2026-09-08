---
name: bigquery-analytics
description: Model and query BigQuery for analytics without burning slots or money — partitioning and clustering, always filter the partition column, avoid SELECT * (columnar billing), nested/repeated fields, streaming vs batch load, approximate aggregates, scheduled queries and materialized views, and never treat it as an OLTP store. Use when the event pipeline lands data in BigQuery, when writing an analytics query, or when a query is expensive/slow.
---

# BigQuery analytics

BigQuery bills by **bytes scanned** (on-demand) or **slot-time** (reservations).
Every design decision is really a cost decision. The `event-service` pipeline
streams events here — model it for the dashboards that read it.

## Table design

- **Partition** every large table — by ingestion time (`_PARTITIONTIME` /
  `_PARTITIONDATE`), an event-time `DATE`/`TIMESTAMP` column, or an integer range.
  Queries **must** filter the partition column or they scan everything.
- **Cluster** by the columns you filter/group on most (up to 4, order matters —
  most-selective first). Clustering prunes blocks within a partition.
- **Require a partition filter** (`require_partition_filter = true`) on big tables
  so a missing filter errors instead of scanning a year.
- **Denormalize** — BigQuery joins are fine but a wide denormalized table (or
  nested/repeated fields) usually beats a star schema for scan cost.
- **Nested & repeated** (`STRUCT`, `ARRAY<STRUCT>`) — model one event with its
  attributes as nested fields; `UNNEST` to flatten in the query. Avoids joins.

## Querying

- **Never `SELECT *`** — you're billed for every column's bytes. Name the columns.
- Always filter the **partition column** in the `WHERE`; add cluster-column
  filters.
- Check the **bytes-processed estimate** (dry run / the editor's validator) before
  running — it's the bill.
- **Approximate aggregates** — `APPROX_COUNT_DISTINCT`, `APPROX_QUANTILES` — orders
  of magnitude cheaper than exact `COUNT(DISTINCT)` on billions of rows, when
  approximate is acceptable.
- **Window functions** and `QUALIFY` for top-N-per-group without a subquery.
- `WITH` CTEs are inlined (re-evaluated per reference) — for an expensive shared
  subquery, write to a temp table or use a materialized view.

## Loading

- **Batch load** (from GCS, or `LOAD DATA`) is free and preferred for bulk.
- **Streaming inserts** cost per row and land in a streaming buffer — use only
  when you need sub-minute freshness. The `event-service` should batch where it
  can.
- **Don't** update/delete row-by-row — BigQuery is append-optimized; DML on
  individual rows is slow and quota-limited. Model as append + "latest wins" via a
  window function or a scheduled dedup.

## Serving dashboards

- **Materialized views** for common rollups — auto-maintained, queries against the
  base table transparently use them.
- **Scheduled queries** to build daily rollup tables that dashboards read cheaply.
- **BI Engine** reservation for sub-second dashboard queries if it's worth the
  cost.

## Not an OLTP store

No point lookups by key at low latency, no per-request reads, no transactions.
If a service needs to read one row fast, that lives in Postgres/Mongo/Redis — copy
to BigQuery for analytics.

## Anti-patterns

- ❌ `SELECT *`.
- ❌ A query with no partition-column filter on a big table.
- ❌ Streaming inserts when a batch load would do.
- ❌ Row-by-row `UPDATE` / `DELETE`.
- ❌ Exact `COUNT(DISTINCT)` over billions when approximate is fine.
- ❌ Using it as a lookup store for a service's hot path.
