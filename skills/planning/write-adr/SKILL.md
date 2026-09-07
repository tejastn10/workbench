---
name: write-adr
description: Draft an Architecture Decision Record using Tejas's template — numbered, immutable once accepted, table header, `---` dividers, emoji H2s. Capture the context and the honest trade-offs, not just the decision. Use when asked to "write an ADR", "record this decision", "document why we chose X", or after a significant technical call is made.
---

# Write an ADR

Fills in [`docs/templates/ADR.md`](../../../docs/templates/ADR.md).

## When to use

- A decision was made that is expensive to reverse (framework, datastore, protocol,
  boundary, auth model, build system).
- A reviewer or a new hire keeps asking "why is it done this way?".
- A decision is being *proposed* and needs written options before the call.

Not for small, reversible choices — those live in the PR description.

## Process

1. **Find the next number.** ADRs are sequential and zero-padded:
   `docs/adr/0007-use-sqs-not-kafka.md`. Never renumber.
2. **Write `Context` first, without the decision in mind.** State the forces: the
   problem, the constraints, the requirements, the assumptions. Facts only. If the
   context doesn't make the decision feel necessary, the context is incomplete.
3. **State the `Decision` in active voice** — "We will …". Specific enough to act on.
4. **List `Alternatives` honestly** — the ones actually considered, each with a
   one-line "rejected because". "Do nothing" is always an alternative.
5. **Write `Consequences` — including the bad ones.** This is the section that makes
   an ADR worth keeping. New risk accepted, new constraints, follow-up work.
6. **Set Status.** `Proposed` if the call isn't final; `Accepted` once it is.
7. **Immutability:** an Accepted ADR is not edited. To revisit, write a new ADR,
   set its `Supersedes`, and flip the old one's Status to
   `Superseded by ADR-NNNN`.

## House conventions

- Filename `NNNN-kebab-slug.md`, title `ADR-NNNN: Title`.
- Header is a table. One `---` between every section. Emoji H2s as in the template.
- Conventional-commit: `docs: add ADR-NNNN <slug>` (or `docs: supersede ADR-NNNN`).
- Link the ADR from the PRD or ticket that prompted it, and vice versa.

## Anti-patterns

- ❌ A `Context` that argues for the decision instead of describing the situation.
- ❌ Editing an Accepted ADR to change the decision — supersede instead.
- ❌ `Consequences` with only upsides.
- ❌ Alternatives section listing options nobody actually weighed.
- ❌ Writing an ADR for a trivially reversible choice.
