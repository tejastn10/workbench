---
name: bullmq
description: Build and review BullMQ (Redis-backed) job queues in Node/NestJS — queue and worker setup, concurrency, attempts and backoff, removeOnComplete/Fail, delayed and repeatable jobs, rate limiting, flows, graceful shutdown, idempotent job IDs, and the fact that Redis is the source of truth. Use when adding a background job, reviewing a BullMQ processor, or when jobs stall / duplicate / pile up in Redis.
---

# BullMQ

Redis-backed job queue. `Queue` (producer) + `Worker` (consumer) + `QueueEvents`
(observability), all pointed at the same Redis. NestJS: `@nestjs/bullmq`.

## Setup

- **Share one Redis connection config**; BullMQ needs `maxRetriesPerRequest: null`
  and `enableReadyCheck: false` on the ioredis connection for workers.
- Redis **is the source of truth** for job state — the `data/redis-patterns` rules
  apply: reconnect infinite with backoff, and Redis down means jobs don't run
  (degrade / alert, don't crash the app).
- Redis `maxmemory` + `allkeys-lru` is **dangerous** for a job queue — LRU can
  evict job data. Give the queue its own Redis / DB or `noeviction` policy for the
  queue instance.

## Job options

- **`attempts`** + **`backoff`** (`{ type: 'exponential', delay: 1000 }`) — retry
  transient failures. A thrown error retries; return normally = success.
- **Classify failures**: throw to retry (transient), or catch + mark handled +
  return (terminal — don't let it burn all attempts). After `attempts`, the job is
  `failed` — that's your DLQ; monitor the failed set and have a retry path.
- **`removeOnComplete`** / **`removeOnFail`** — set a number or age. Default keeps
  every job forever → Redis grows unbounded. Keep recent N for debugging, drop the
  rest.
- **`jobId`** — pass a deterministic id (a business key) to **dedup**: adding a job
  with an existing id is a no-op. This is how you get idempotent enqueue.
- **`delay`** for delayed jobs; **repeatable** jobs (cron / every) for schedules —
  note repeatable jobs need a stable `jobId`/key or you get duplicates on redeploy.

## Worker

- **`concurrency`** — how many jobs one worker runs in parallel. Also run multiple
  worker processes for horizontal scale.
- **Rate limiting** — `limiter: { max, duration }` to cap throughput (e.g. an
  external API's limit).
- **Stalled jobs** — if a worker dies mid-job, BullMQ re-queues it after
  `stalledInterval` (up to `maxStalledCount`). So handlers **must be idempotent**.
- **Graceful shutdown** — `await worker.close()` on `SIGTERM` to finish in-flight
  jobs and stop pulling new ones. Without it, `SIGKILL` mid-job → stalled → rerun.

## Flows & priorities

- **`FlowProducer`** for parent/child job dependencies (fan-out then aggregate).
- **`priority`** (lower = higher) for queue-jumping; don't overuse — priorities
  make throughput reasoning harder.

## Observe

- `QueueEvents` for `completed` / `failed` / `stalled` / `progress`.
- Track queue depth (`getWaitingCount`, `getDelayedCount`, `getFailedCount`) and
  alert on a growing backlog or failed set.

## Anti-patterns

- ❌ Queue Redis with `allkeys-lru` (jobs get evicted).
- ❌ No `removeOnComplete` — Redis fills with finished jobs.
- ❌ Non-idempotent handler (stalled jobs rerun).
- ❌ Burning all `attempts` on a terminal error instead of catching it.
- ❌ No graceful shutdown → stalled jobs on every deploy.
- ❌ Repeatable jobs without a stable key → duplicates after redeploy.
