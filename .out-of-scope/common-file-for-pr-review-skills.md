# A shared `_common.md` for the pr-review skills

Proposed: factor the shared review philosophy (voice, severity markers, review
structure) out of the per-stack `pr-review/*.md` files into one `_common.md` that
each skill imports or references, to avoid restating it.

## Why this is out of scope

The canonical NestJS skill (`nestjs-backend-pr-review.md`) is fully self-contained,
and every skill needs to work when pasted alone into a project as a single
`SKILL.md`. A `_common.md` that has to travel alongside breaks that.

The chosen approach instead: each derived skill is self-contained, restates the
essentials of the register in its own §5, and points back to the NestJS skill's
§4–§5 as the canonical version for anyone who wants the full treatment. Minor
duplication, but each file installs cleanly on its own.

## Prior requests

- Phase 2 of the workbench setup (structure discussion) — a `pr-review/_common.md`
  stub was created and then removed once the NestJS skill's shape was clear.
