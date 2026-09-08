---
name: kafka
description: Design and operate Kafka / Amazon MSK correctly — topic and partition design, partition key choice and hot partitions, consumer groups and rebalancing, offset commit semantics, idempotent/transactional producers, retries and dead-letter topics, schema registry, and the pain of repartitioning. Use when adding a Kafka topic or consumer, reviewing Kafka code, or when asked about partitioning / consumer lag / ordering.
---

# Kafka / MSK

## Topics & partitions

- **A topic's partition count is the unit of consumer parallelism** — at most one
  consumer *in a group* per partition. Size it for peak throughput plus headroom;
  **increasing partitions later breaks key-ordering** (a key can move to a new
  partition) and is disruptive.
- Start with a considered number (e.g. 6–12 for a busy topic), not 1 and not 100.
- Retention: time or size based; compacted topics for "latest value per key"
  (changelog / state).
- **Replication factor ≥ 3** on MSK, `min.insync.replicas = 2`, producer
  `acks=all` — otherwise a broker loss can lose data.

## Partition key

- **Ordering is guaranteed only within a partition**, i.e. per key. Choose the key
  so messages that must be ordered share it: all events for one `orderId` → key =
  `orderId`.
- **Hot partitions** — a key with far more traffic than others (a whale tenant, a
  null key) overloads one partition/consumer. If you don't need ordering, use a
  null key (round-robin) or a composite key.
- No key → round-robin (sticky per batch) — fine when order doesn't matter.

## Consumers

- **Consumer group** = the scaling and offset-tracking unit. Adding consumers up
  to the partition count adds parallelism; beyond that they idle.
- **Rebalancing** — a consumer join/leave/timeout pauses the group while
  partitions are reassigned. Minimize: tune `session.timeout.ms` /
  `max.poll.interval.ms` so a slow handler doesn't get kicked; use the
  **cooperative-sticky** assignor to avoid stop-the-world.
- **Offset commit** — commit **after** processing succeeds (at-least-once →
  idempotent handlers). Auto-commit commits on a timer regardless of success =
  message loss on crash. Prefer manual commit after the write.
- **`max.poll.records`** small enough that the batch processes within
  `max.poll.interval.ms`.

## Retries & dead-letter

- Kafka has no built-in redelivery/DLQ. Pattern: on a **retryable** error, either
  pause + seek back, or publish to a **retry topic** (with a delay) and a
  **dead-letter topic** after N attempts. On a **terminal** error, straight to the
  DLT. Same terminal-vs-retryable discipline as SQS.
- A poison message that throws on every attempt will **block the partition**
  forever if you just keep retrying in place — that's why the DLT matters.

## Schema

- Use a **schema registry** (Avro / Protobuf / JSON Schema) with compatibility
  checks. Additive changes stay compatible; renames/removals break consumers
  (`design/evolve-contract`, `design/design-event`).

## Operate

- **Monitor consumer lag** per group per partition — rising lag = consumers can't
  keep up (scale, or the handler is slow).
- Idempotent producer (`enable.idempotence=true`) to avoid dupes on producer
  retry; transactions (`transactional.id`) only if you need exactly-once across
  produce+consume.

## Anti-patterns

- ❌ 1 partition on a topic that needs throughput; or bumping partitions later on
  a keyed topic.
- ❌ Auto-commit with at-least-once expectations.
- ❌ A null/hot key causing one overloaded partition.
- ❌ Retrying a poison message in place forever (blocks the partition).
- ❌ No schema registry; renaming fields freely.
- ❌ `acks=1` / RF<3 on data you can't lose.
- ❌ Not monitoring consumer lag.
