---
name: postgres-indexing
description: Choose and verify Postgres indexes for real query shapes — index type (btree / GIN / GiST / BRIN), composite column order, partial / covering / expression indexes, reading EXPLAIN ANALYZE, adding them CONCURRENTLY, and knowing when NOT to index. Use when a query is slow, when reviewing a PR that adds a query, when asked "what index do I need", or "why is this doing a seq scan".
---

# Postgres indexing

Start from the query, not the table. For each slow or new query, get the plan
first: `EXPLAIN (ANALYZE, BUFFERS) <query>`.

## Reading the plan

- **Seq Scan** on a large table with a selective `WHERE` → missing/unused index.
- **Rows** estimate wildly off actual → stale stats (`ANALYZE <table>`), or a
  correlation the planner can't see (consider extended statistics).
- **Filter** removing most rows *after* an index scan → the index doesn't cover
  the predicate; add the column or use a partial index.
- **Sort** / **Hash** spilling to disk → `work_mem` too low, or an index could
  provide the order.
- **Nested Loop** with high loop count → the join column isn't indexed on the
  inner side.

## Index type

| Use | Type |
| --- | --- |
| equality, range, sort, most things | **btree** (default) |
| `@>`, `?`, full-text, `jsonb` containment, array membership | **GIN** |
| geometry, range types, exclusion constraints, nearest-neighbour | **GiST** |
| huge append-only table, naturally ordered column (time), tolerate imprecision | **BRIN** (tiny, cheap) |
| dedupe / uniqueness | btree `UNIQUE` |

## Shaping the index

- **Composite column order**: equality predicates first, then the range / sort
  column. `WHERE tenant_id = ? AND created_at > ? ORDER BY created_at` →
  `(tenant_id, created_at)`.
- **Partial index** — `WHERE status = 'active'` when you only ever query active
  rows. Smaller, faster, and it's the whole index for that query.
- **Covering index** — `INCLUDE (col)` so the query is an index-only scan, no heap
  fetch.
- **Expression index** — `CREATE INDEX ON t (lower(email))` if you query
  `WHERE lower(email) = ?`.
- **Don't index**: low-cardinality columns alone (a boolean), tiny tables,
  write-heavy tables where the read isn't hot, columns never in a predicate.
  Every index is write amplification and bloat.

## Adding safely

- `CREATE INDEX CONCURRENTLY` on any table with live writes — a plain
  `CREATE INDEX` takes an `ACCESS EXCLUSIVE`-ish lock and blocks writes.
- Sequence it via `deployment/data-migration`; it can't run inside a
  transaction block.
- After: re-run `EXPLAIN ANALYZE`, confirm the plan uses it and is faster.
- Check for now-redundant indexes (a prefix of the new composite) and drop them.

## Anti-patterns

- ❌ Adding an index without `EXPLAIN` before and after.
- ❌ Plain `CREATE INDEX` on a hot table.
- ❌ One index per column instead of a composite matching the query.
- ❌ Indexing a boolean or a tiny table.
- ❌ Leaving redundant/duplicate indexes after adding a composite.
