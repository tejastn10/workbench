# skills/queues

Message and job transports. Shared discipline across all three: **classify every
failure terminal vs retryable**, **idempotent handlers**, **confirm the DLQ /
dead-letter actually exists**.

| Skill              | Transport                | Use for                                       |
| ------------------ | ------------------------ | ------------------------------------------- |
| `queues/sqs-consumer`  | AWS SQS                   | Lifecycle, visibility timeout, redrive + DLQ, batch failures |
| `queues/kafka`         | Kafka / Amazon MSK       | Partition design & keys, consumer groups, offsets, dead-letter topics, lag |
| `queues/bullmq`        | BullMQ (Redis, Node)     | Attempts/backoff, removeOnComplete, stalled jobs, flows, graceful shutdown |

Designing the *message* (schema, semantics, versioning) → `design/design-event`.
