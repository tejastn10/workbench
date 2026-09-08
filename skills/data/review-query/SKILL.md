---
name: review-query
description: Review a database or cache access path for correctness and cost — N+1, missing index, unbounded result set, transaction scope, and the Redis/cache-key issues from the review corpus (read key ≠ write key, KEYS on a shared instance, negative tombstones, replica lag on read-your-writes). Use when reviewing a PR that adds a query, when something is slow, or when asked to "check this query".
---

# Review a query / cache access

## SQL / ORM

- [ ] **N+1** — a query inside a loop over rows already fetched. Batch it: one
      `WHERE id IN (…)`, or the ORM's `include` / `join`. `refreshUserCache`-style
      helpers in a per-item loop when the rows are in hand → ~2N redundant reads.
- [ ] **Missing index** — the `WHERE` / `ORDER BY` / join column has no index.
      Check `EXPLAIN`; a seq scan on a big table is the tell.
- [ ] **Unbounded result set** — `SELECT …` with no `LIMIT` on a table that grows.
      Paginate.
- [ ] **`SELECT *`** pulling columns (and big TEXT/JSON blobs) the caller doesn't
      use.
- [ ] **Transaction scope** — `@Transaction` / a `BEGIN` held across a paginated
      loop or an external call pins a connection and holds locks. Keep transactions
      short; don't wrap read-only paginated work in one.
- [ ] **Write-then-read** in the same request expecting to see the write — fine on
      primary, broken if the read goes to a replica.

## Redis / cache

- [ ] **Read key ≠ write key** — the key for the index lookup and the key for the
      loader must be derived identically. Normalize once, use for both.
- [ ] **`KEYS` on a shared instance** — blocks Redis. Use `SCAN`, or drop the
      method.
- [ ] **Negative tombstones from a bulk loader** written with a *different filter*
      than the single-item loader → real records 404. **Blocking.**
- [ ] **Read-your-writes on a replica** — OTP verify, rate-limit counters, session
      — replica lag means a stale/missing read. Must hit primary.
- [ ] **`multi.exec()` result ignored** — `MULTI` doesn't roll back; scan the
      result array for errors.
- [ ] **No TTL** on a cache entry that should expire, or a TTL so long the data
      goes stale.

## Output

Blocking (tombstone bug, replica on read-your-writes, `KEYS` on shared) vs
non-blocking (N+1 on a cold path, missing index that's not hot yet — quantify).
Show the mechanism: the query, the call volume, what happens under load.

## Anti-patterns

- ❌ "Add an index" with no `EXPLAIN` and no idea if the path is hot.
- ❌ Flagging N+1 on a path called once a day as a blocker.
- ❌ Missing that the read and write keys diverge.
