---
name: evolve-contract
description: Change a live API, response shape, error code, or event schema without breaking consumers — classify the change as compatible or breaking, make compatible changes additively, version breaking ones, and never alter a legacy contract. Use when a PR changes an existing endpoint's response / status / fields / enum values, or when asked "is this a breaking change" / "how do I change this API safely".
---

# Evolve a contract

The review rule, non-negotiable: **you can't change the contract on the old
APIs.** CRM, frontend, mobile, partners may depend on the current behaviour.

## Classify the change

**Backward-compatible (safe, additive):**

- Adding a new optional request field (with a sensible default).
- Adding a new field to a response.
- Adding a new endpoint / a new enum value the client can ignore.
- Making a required request field optional.
- Relaxing a validation rule.

**Breaking (needs a version or a migration):**

- Removing or renaming a response field.
- Changing a field's type or format.
- Removing an endpoint or an enum value.
- Adding a required request field, or tightening validation.
- Changing a status code or an error code for an existing case.
- Changing pagination, ordering, or default behaviour.
- Changing the meaning of an existing field.

A new enum / event wire value is breaking for anyone matching on the old set —
**ask what reads it downstream before merge.**

## Handling a breaking change

1. **Don't touch the old version.** Build `v2` beside `v1` (new `v2/` folder).
2. Migrate consumers to `v2` — their PRs, blocked on `v2` shipping. You may have
   to reach across teams; tag the owner.
3. **Deprecate `v1`** — `Deprecation` + `Sunset` headers, a date, notify every
   known consumer. Track who's still on it (a metric per version).
4. Remove `v1` only when its traffic is zero.
5. This is a `deployment/code-migration` (`deployment/code-migration`) — flag/route the
   cutover, keep the fallback.

## If someone "just made it more correct"

A PR that changes a legacy error code or response shape because the new behaviour
is better → **revert, unconditionally.** Correctness doesn't override the
contract. Put the fix in a new version.

## Events / queues

- A consumer must tolerate unknown fields (forward-compat) — design for that.
- Renaming an event type or a field is breaking; dual-publish (old + new) through
  a migration window, or version the event.
- A new error/return path in a consumer must be classified terminal vs retryable
  (`pr-review/go-backend-pr-review`).

## Anti-patterns

- ❌ "It's more correct now" as justification for a legacy change.
- ❌ Renaming a response field in place.
- ❌ Changing an enum's values without checking downstream matchers.
- ❌ Adding a required request field to an existing endpoint.
- ❌ Removing `v1` while it still has traffic.
