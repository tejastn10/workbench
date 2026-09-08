---
name: mongo-modeling
description: Model MongoDB documents for the access patterns — embed vs reference, the schema design patterns (subset, computed, bucket, outlier, extended reference), array pitfalls, index for the query shape, and the $lookup cost. Use when adding a Mongo collection, when asked to "design the document / schema", or when a Mongo query is slow or the documents are getting huge.
---

# MongoDB modeling

Model for **how the data is read**. There is no "correct" normalized form — there
is the shape that serves your queries with the fewest round-trips.

## Embed vs reference

**Embed** when the sub-document:

- is (almost) always loaded with the parent,
- is bounded in size and count (not unbounded growth),
- doesn't need to be queried or updated independently at scale.

**Reference** when it:

- is large, unbounded, or high-cardinality (comments, events, audit log),
- is queried on its own,
- is shared by many parents,
- would push the parent toward the 16 MB document limit.

## Design patterns

| Pattern | Use |
| --- | --- |
| **Extended reference** | copy the 2–3 fields of the referenced doc you always display, so the common read needs no `$lookup` (accept the denormalization; update on change) |
| **Subset** | embed the *most recent / top N* sub-docs, keep the full set in a referenced collection |
| **Computed** | store the rollup (counts, totals) on the parent, update on write — don't aggregate on every read |
| **Bucket** | for time-series / high-frequency inserts, one document per (device, hour) holding an array of readings, not one doc per reading |
| **Outlier** | most docs embed; the rare huge one flips to referenced with a flag |

## Arrays

- Unbounded arrays are the #1 Mongo modeling mistake — they fragment, blow the
  doc-size limit, and make updates slow. Cap them (subset/bucket pattern).
- `$push` with `$slice` to keep an array bounded.
- Multikey indexes on arrays: one array field per compound index (can't index two
  parallel arrays).

## Indexing

- Index the **query shape**: equality fields first, then sort field, then range
  (same ESR rule as SQL composite indexes).
- `explain("executionStats")` — check `totalDocsExamined` vs `nReturned`; large
  ratio = wrong or missing index.
- `MONGO_AUTO_INDEX=false` in prod — build indexes deliberately, in the background.
- Partial indexes (`partialFilterExpression`) for "only active docs" queries.
- TTL index for expiring data.

## $lookup

- `$lookup` is a nested loop — cheap for small driving sets and an indexed foreign
  field, expensive otherwise. If you `$lookup` on every read, you probably want an
  extended-reference embed instead.

## Anti-patterns

- ❌ Normalizing like SQL and `$lookup`-ing everything.
- ❌ Unbounded embedded arrays.
- ❌ One document per high-frequency event (use the bucket pattern).
- ❌ Aggregating a count on every read instead of maintaining a computed field.
- ❌ Relying on `MONGO_AUTO_INDEX` in prod.
