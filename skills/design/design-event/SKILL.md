---
name: design-event
description: Design the schema and semantics of a domain event before publishing it — event vs command, name, payload (thin vs fat), key, versioning, delivery guarantee, and how consumers classify failures. Use when adding a queue message / Kafka topic / webhook, or when asked to "design the event" / "what should this message contain".
---

# Design an event

The event is a contract — usually with more consumers than you know about. Design
it like an API (`design/evolve-contract` governs changes).

## Event vs command

- **Event** — a fact that happened, past tense: `OrderPlaced`, `UserDeactivated`.
  The publisher doesn't know or care who consumes it.
- **Command** — an instruction to do something: `SendWelcomeEmail`. One intended
  handler.

Prefer events for decoupling; use commands when there's genuinely one owner.

## Payload

- **Thin (event-carried key + minimal data)** — consumers fetch what they need.
  Smaller, less coupling to producer's model, but N lookups. Good when consumers
  need different subsets.
- **Fat (event carries the full state)** — no lookup needed, but couples every
  consumer to the producer's shape and leaks data. Good for audit/replay, or a
  known small consumer set.
- **Extended-key** middle ground — carry the key plus the 2–3 fields every
  consumer displays.
- Include: a **unique event id** (for dedup), **occurred-at** timestamp, the
  **aggregate id**, an explicit **type** and **version**, and a **trace context**
  for correlation. No secrets / PII beyond what consumers are entitled to.

## Semantics

- **Ordering** — guaranteed only per partition key. Choose the key so events that
  must be ordered share it (all events for one order → key = order id).
- **Delivery** — at-least-once is the norm → **consumers must be idempotent**
  (dedup on event id, or design the handler to be naturally idempotent).
- **Failure classification** — every consumer must decide, per error: terminal
  (drop / DLQ) or retryable (redeliver). An unclassified error redelivers forever
  (`queues/sqs-consumer`, `queues/kafka`).

## Versioning

- Consumers tolerate unknown fields (forward-compatible) — state this.
- Additive changes (new optional field) are safe.
- Renaming / removing / retyping a field, or renaming the event → breaking.
  Dual-publish old + new through a window, or bump the version and migrate
  consumers.

## Output

The event name, direction (event/command), payload schema with the envelope
fields, the partition key rationale, delivery guarantee, and the consumer
idempotency requirement. Register it wherever the org keeps event schemas.

## Anti-patterns

- ❌ Present-tense / imperative names for events (`CreateOrder` as an event).
- ❌ No event id → consumers can't dedup an at-least-once delivery.
- ❌ Fat payloads that couple every consumer to the producer's DB schema.
- ❌ A partition key that doesn't group events needing order.
- ❌ Renaming a field in place.
