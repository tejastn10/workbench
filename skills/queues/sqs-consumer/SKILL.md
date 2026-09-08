---
name: sqs-consumer
description: Build and review an AWS SQS consumer correctly — classify every error terminal vs retryable, delete only after the downstream write succeeds, match visibility timeout to handler runtime, confirm the redrive policy and DLQ, handle partial batch failures, and make handlers idempotent. Use when building an SQS consumer, reviewing one, or when messages redeliver forever / land in the DLQ unexpectedly.
---

# SQS consumer

The review corpus's #1 queue rule: **every error path must be classified terminal
vs retryable. An error that is neither deleted nor DLQ'd redelivers forever.**

## Message lifecycle

1. Receive (long-poll: `WaitTimeSeconds=20`, not busy-poll).
2. Process the message.
3. **On success** — `DeleteMessage`. **Never delete before the downstream write
   succeeds** — delete-then-write means a crash loses the message.
4. **On retryable failure** (transient 5xx, throttle, lock timeout) — do **not**
   delete; let the visibility timeout expire and SQS redelivers. Optionally
   `ChangeMessageVisibility` to add backoff.
5. **On terminal failure** (bad payload, validation, a 4xx that won't change) —
   don't retry. Either delete + record the failure, or let it go to the DLQ via
   `maxReceiveCount`. Decide which per message type.

## Redrive & DLQ

- **Confirm the deployed queue has the redrive policy the code assumes.** The code
  relying on "it'll go to the DLQ after 5 tries" is wrong if the queue's
  `RedrivePolicy` / `maxReceiveCount` isn't actually set. Check the infra.
- DLQ retention ≥ source retention. Alarm on `ApproximateNumberOfMessagesVisible`
  on the DLQ (`observability/define-alerts`).
- Have a documented **DLQ redrive** path (re-process after a fix) — SQS supports
  redrive-from-DLQ.

## Visibility timeout

- Must be **> the max handler runtime** (incl. retries/backoff inside the
  handler). If the handler can run 90s and visibility is 30s, the message
  reappears and is processed concurrently → duplicates.
- For long jobs, extend visibility with a heartbeat (`ChangeMessageVisibility`)
  rather than one huge timeout.

## Batches

- `ReceiveMessage` returns up to 10. If you process a batch and one fails, the
  whole batch redelivers unless you use **`ReportBatchItemFailures`** (Lambda
  event source) / delete the successful ones individually and leave the failed.
- Per-item try/catch + continue — one bad message must not fail the batch.

## Idempotency

- SQS standard queues are **at-least-once** — handlers **must** be idempotent
  (dedup on a message/business id, or naturally idempotent writes).
- FIFO queues give exactly-once *processing* within the dedup window + ordering
  per `MessageGroupId` — but still design idempotent.

## Anti-patterns

- ❌ An error path that's neither deleted nor DLQ'd.
- ❌ `DeleteMessage` before the write succeeds.
- ❌ Visibility timeout shorter than the handler can run.
- ❌ Assuming a DLQ exists without checking the queue's redrive policy.
- ❌ One bad message failing the whole batch.
- ❌ A non-idempotent handler on a standard queue.
