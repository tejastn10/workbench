---
name: redis-patterns
description: Use Redis correctly — client choice and connection handling, namespaced key design, TTL on everything, the right data structure per use, SCAN not KEYS, pipelines vs MULTI, and maxmemory-policy. Use when adding Redis to a service, reviewing Redis code, or when asked "how should I key this" / "why is Redis slow".
---

# Redis patterns

Reference: `redis/redis-stack`, `maxmemory 256mb`, `allkeys-lru` (the `ember`
compose). Node client: **ioredis** (mature, cluster support) or **node-redis v4+**.
Go: **go-redis**. NestJS: a single `global: true` cache module, one connection.

## Connection

- **One shared client** per process, injected — not one per call (fd exhaustion,
  no pooling benefit). ioredis multiplexes over one connection.
- **Reconnect must be infinite with capped backoff.** A blip after a deploy that
  makes the client give up permanently leaves every call throwing until the pod
  restarts. Bound only the *initial* connect.
- Redis being down must **degrade, not crash** — cache miss → hit the source; a
  cache write failure → log and continue. Same "optional dependency" rule as
  telemetry.
- `redis://:password@host:port` from env, never committed.

## Keys

- **Namespaced, structured**: `<app>:<domain>:<entity>:<id>` — e.g.
  `auth:user:otp:{userId}`. Predictable, greppable, drop-able by prefix.
- **Cross-service prefixes** (shared with another service) → export the constant
  from the shared SDK so nobody hardcodes the string on either side.
- **The read key and the write key must be derived identically** — normalize the
  inputs once, use that for both the lookup and the loader. (A recurring review
  bug: they diverge and the cache never hits.)

## TTL

- **Every key gets a TTL.** A key with no expiry is a leak waiting for
  `allkeys-lru` to evict it unpredictably (possibly the wrong key).
- Set it atomically with the write: `SET k v EX 300`, not `SET` then `EXPIRE`.
- Add **jitter** to TTLs of keys that get populated together (avoid a synchronized
  stampede when they all expire at once).
- `PERSIST` only with a deliberate reason.

## Data structures

| Use | Structure |
| --- | --- |
| single value / JSON blob / counter | String (`GET/SET`, `INCR`) |
| object with fields you update independently | Hash (`HSET/HGET`) |
| membership / unique set | Set (`SADD/SISMEMBER`) |
| leaderboard / time-ordered / rate window | Sorted Set (`ZADD/ZRANGEBYSCORE`) |
| event log / stream with consumer groups | Stream (`XADD/XREADGROUP`) |
| ephemeral pub/sub (no delivery guarantee) | Pub/Sub |

## Operations

- **Never `KEYS`** on a shared instance — it blocks the server. Use `SCAN` with a
  cursor and `COUNT`, or restructure so you don't need to enumerate.
- **Pipeline** independent commands to cut round-trips (`pipeline()` / `MULTI`
  without `WATCH` for batching).
- **`MULTI/EXEC` is not a rollback** — if a command in the transaction fails at
  runtime, earlier ones still applied. Scan the result array. Use `WATCH` for
  optimistic concurrency.
- **Lua scripts** (`EVALSHA`) for read-modify-write that must be atomic
  (counters with caps, conditional sets).
- **Read-your-writes** on OTP / rate-limit / session must go to the **primary**,
  not a read replica — replica lag = stale/missing.

## Anti-patterns

- ❌ A client per request.
- ❌ Reconnect that gives up permanently.
- ❌ `KEYS *` anywhere.
- ❌ A key with no TTL.
- ❌ `SET` then a separate `EXPIRE` (non-atomic — crash between = immortal key).
- ❌ Trusting `MULTI/EXEC` to roll back.
- ❌ Read-your-writes off a replica.
