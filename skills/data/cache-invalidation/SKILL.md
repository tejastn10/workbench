---
name: cache-invalidation
description: Choose a caching strategy and keep the cache correct — cache-aside vs read/write-through, invalidation on write, negative caching done safely, stampede protection, and TTL as the backstop. Use when adding a cache in front of a datastore, when cached data is going stale or wrong, or when a review flags a cache-correctness issue.
---

# Cache invalidation

Two hard cases: making sure the cache reflects writes, and not letting a cache
miss storm the source.

## Strategy

| Pattern | How | When |
| --- | --- | --- |
| **Cache-aside** (lazy) | app reads cache → miss → load from DB → populate cache | default; simple; first read after a write is a miss |
| **Read-through** | cache library loads on miss | same as aside, encapsulated |
| **Write-through** | write goes to cache + DB synchronously | reads always fresh; write latency + wasted cache for cold keys |
| **Write-behind** | write to cache, flush to DB async | fast writes, risk of loss on crash — rarely worth it |

Default to **cache-aside** with a TTL. Reach for write-through only on a hot key
where the first-read miss matters.

## Invalidation on write

- On update/delete: **delete the key** (let the next read repopulate) rather than
  updating it in place — updating races with concurrent loads.
- Invalidate **every key** that derives from the changed data: the entity key, any
  list/index keys it appears in, any computed rollups. Missing one is the bug.
- Cross-service: if service B caches data owned by service A, A must publish a
  change event B subscribes to, or B must use a short TTL and accept staleness.

## Negative caching (tombstones)

- Cache "not found" too, with a **short** TTL, to stop repeated misses hammering
  the DB for a key that doesn't exist.
- **The trap** (real review bug): a bulk loader writes tombstones for keys it
  didn't find *using a different filter* than the single-item loader — so real
  records get a tombstone and 404. The bulk and single loaders must use the
  **same** predicate, or don't let the bulk loader write negatives.

## Stampede protection

When a hot key expires, many requests miss at once and all hit the DB:

- **Single-flight / lock** — first miss takes a short lock, loads, populates;
  others wait briefly then read the fresh value.
- **Stale-while-revalidate** — serve the stale value past its soft TTL while one
  request refreshes in the background.
- **Jittered TTL** — so keys populated together don't all expire the same second.
- **Pre-warm** critical keys on deploy / on a schedule.

## TTL is the backstop

Even with perfect invalidation, every key has a TTL so a missed invalidation
self-heals within a bounded window.

## Anti-patterns

- ❌ Updating a cached value in place instead of deleting it.
- ❌ Invalidating the entity key but not the list/rollup keys.
- ❌ Bulk loader writing tombstones with a different filter than the single loader.
- ❌ No stampede protection on a hot, expensive-to-compute key.
- ❌ No TTL "because we invalidate properly".
