---
name: redis-coordination
description: Use Redis for distributed locks and rate limiting correctly — single-instance SETNX+TTL with a fencing token, lock renewal, Redlock caveats, and atomic rate limiters (fixed window, sliding window, token bucket) via Lua. Know when a DB constraint or idempotency key is the better tool. Use when asked for a "distributed lock" / "mutex" / "rate limiter", or when reviewing one.
---

# Redis coordination — locks & rate limits

## First: do you need a distributed lock?

Often the answer is no. Prefer, in order:

1. **A DB unique constraint / upsert** — let the database enforce "only one".
2. **An idempotency key** — make the operation safe to run twice instead of
   preventing the second run.
3. **A single-writer design** — partition work so only one worker owns a key.
4. **Then** a Redis lock, accepting it's best-effort.

## Redis lock (single instance)

```
SET lock:<resource> <random-token> NX PX <ttl-ms>
```

- `NX` (only if absent) + `PX` (TTL) in **one** command — never `SETNX` then
  `EXPIRE` (crash between = permanent lock).
- The value is a **unique token** the holder generated. To release, a Lua script
  checks the token matches before `DEL` — so you never delete someone else's lock
  that you acquired after your TTL expired.
- **TTL < the work it protects?** Either the work must be idempotent (the lock is
  advisory), or renew the lock (a watchdog extending the PX while work continues)
  — and stop work immediately if a renewal fails.
- **Fencing token** — for correctness under GC pauses / network delays, the lock
  hands out a monotonically increasing token; the protected resource rejects
  writes with a stale token. Without this, no Redis lock is safe against a paused
  holder.

## Redlock (multi-instance)

The multi-node algorithm exists but is contested (Kleppmann vs antirez). Use it
only if you understand the trade-off; for most cases a single-instance lock +
fencing token + idempotent work is enough, and simpler.

## Rate limiting

All counters via **Lua** (atomic read-modify-write; a non-atomic
`INCR`-then-check races):

| Algorithm | Shape | Note |
| --- | --- | --- |
| **Fixed window** | `INCR key`, `EXPIRE` on first, reject if > limit | simplest; allows 2× burst at window edges |
| **Sliding window log** | sorted set of timestamps, `ZREMRANGEBYSCORE` old, count | accurate, more memory |
| **Sliding window counter** | weighted blend of current + previous fixed window | good accuracy/cost balance |
| **Token bucket** | stored tokens + last-refill timestamp, refill on read | allows controlled bursts |

- Key by the limited dimension: `ratelimit:<userId>:<route>`.
- Counter reads/writes go to the **primary** (replica lag undercounts).
- Return `429` + `Retry-After` + `X-RateLimit-*` headers.

## Anti-patterns

- ❌ A distributed lock where a unique constraint would do.
- ❌ `SETNX` + `EXPIRE` as two commands.
- ❌ Releasing a lock without checking the token.
- ❌ A lock with a TTL shorter than the work and no renewal and non-idempotent
  work.
- ❌ Non-atomic `INCR` then compare for rate limiting.
- ❌ Rate-limit counter reads off a replica.
