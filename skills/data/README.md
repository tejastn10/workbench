# skills/data

Working with datastores — Postgres, MongoDB, BigQuery, Redis. Indexing,
aggregation, query correctness, and cache discipline.

| Skill                       | Store      | Use for                                            |
| --------------------------- | ---------- | ------------------------------------------------ |
| `data/review-query`           | PG / Redis | N+1, missing index, transaction scope, cache-key traps |
| `data/postgres-indexing`      | Postgres   | Index type, composite order, partial/covering, `EXPLAIN`, `CONCURRENTLY` |
| `data/postgres-aggregation`   | Postgres   | GROUP BY, window functions, CTE fences, rollups, materialized views |
| `data/mongo-modeling`         | MongoDB    | Embed vs reference, schema patterns, array pitfalls, `$lookup` cost |
| `data/mongo-aggregation`      | MongoDB    | Pipeline stage order, `$group`/`$lookup`/`$facet`, memory limits |
| `data/bigquery-analytics`     | BigQuery   | Partitioning/clustering, scan cost, nested fields, streaming vs batch |
| `data/redis-patterns`         | Redis      | Client, connection, key design, TTL, data structures, `SCAN` not `KEYS` |
| `data/cache-invalidation`     | Redis      | Strategy, invalidation on write, tombstones, stampede protection |
| `data/redis-coordination`     | Redis      | Distributed locks (fencing token), atomic rate limiters, and when not to |

Designing a schema before the migration → `design/design-schema`. Running a
live schema change → `deployment/data-migration`.
