---
name: phased-delivery
description: Break a multi-session plan into phases that each fit one context window — vertical tracer-bullet slices, a non-goals list per phase, a checkable definition of done, and a real rollback point (git tag or merged PR) at every boundary. Use when a change spans more than one session, when asked to "break this into phases / tickets", to "plan the rollout", or before starting a build big enough that scope will drift.
---

# Phased delivery

For work too big for one session. The goal is that no session ever has to hold
more than one phase's worth of decisions. Pattern adapted from
[mattpocock/skills](https://github.com/mattpocock/skills) (`to-tickets`,
`wayfinder`, phase boundaries) — see [`.agents/external-skills.md`](../../../.agents/external-skills.md)
to install those directly.

## The three rules that matter most

### 1. Every phase gets a non-goals list, not just goals

The non-goals list prevents scope creep more than the goals list does. For each
phase, write what it explicitly will **not** touch — the adjacent work that's
tempting to pull in "while we're here". A phase with no non-goals is
under-specified.

### 2. Definition of done is a checkable artifact, not a vibe

"Phase 2 is done" must mean something a machine or a five-minute manual check can
confirm:

- a named test suite passes,
- a specific flow works end to end (state the exact steps),
- a command exits 0,
- an endpoint returns the expected shape.

"It feels complete" is not a definition of done.

### 3. A phase boundary is a git tag or a merged PR

Not "I feel done". Each completed phase ends with a real, named rollback point —
a `git tag` (`phase-1-<slug>`) or a merged PR. If a later phase goes wrong, you
revert to the boundary, not to a guess.

## Slicing: vertical, not horizontal

Each phase is a **tracer bullet** — a narrow but complete path through every layer
it touches (schema → logic → API → UI → tests), demoable on its own the moment it
lands. Not "all the schema in phase 1, all the API in phase 2" — that way nothing
works until the end and each phase's done-check reaches into another phase's work.

Test for a bad slice: *"what can I demo when this phase is done?"* If the answer is
a layer, not a behaviour, re-slice.

**Exception — wide mechanical refactor** (rename a shared column, retype a symbol):
use expand → migrate in batches → contract, each batch a phase, CI green
throughout because the old form still exists until the final contract.

## Blocking edges

Every phase names the phases that must finish before it can start. Keep the graph
shallow — if everything blocks on phase 1, the slicing is probably horizontal.
The phase with no blockers is the one you start.

## Process

1. Start from a written plan, a spec, or the current conversation.
2. Draft the phase list. For each phase:
   - **Goal** — one or two sentences, a behaviour.
   - **Non-goals** — the adjacent work it won't do.
   - **Definition of done** — the checkable artifact.
   - **Boundary** — tag name or "PR merged to `main`".
   - **Blocked by** — earlier phases, or "nothing".
3. Put any prefactoring ("make the change easy, then make the easy change") first.
4. Present the list numbered and quiz it: is the granularity right, are the
   blocking edges real, does every phase have a demo answer, should any merge or
   split. Nothing starts until this is settled.
5. Run one phase per fresh session. At each boundary: tag or merge, then decide
   continue / clear / compact for the next (continue only if the next phase needs
   this one's reasoning verbatim or there's plenty of context left).

## Anti-patterns

- ❌ Phases sliced by layer.
- ❌ A phase with goals but no non-goals.
- ❌ "Done" meaning a feeling instead of a check.
- ❌ Moving to the next phase without a tag or merge behind you.
- ❌ Over-decomposition: twelve phases for a change that fits one session — then
  you don't need this skill, just build it.
- ❌ A done-check that's already green at the phase's starting commit.
