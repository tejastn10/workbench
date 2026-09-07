---
name: dead-code-sweep
description: Repo-wide removal of code nothing calls — unused exports, unreachable branches, registered-but-never-invoked handlers, scaffolding for tech the stack doesn't run, commented-out blocks. Every removal proven with a grep. Use when asked to "remove dead code", "clean up the repo", after a big feature removal, or on a periodic tidy.
---

# Dead-code sweep

Repo-wide and deliberate — distinct from `quality/deslopify`, which only
touches the current session's diff.

## What counts as dead

- **Unused exports** — exported symbol, zero importers. `grep -rn "name" --include=…`
  or the language tool (`ts-prune`, `deadcode` for Go, `vulture` for Python).
- **Unreachable branches** — an `if` / `case` that can't be true given how the
  function is actually called. Trace the callers.
- **Registered but never invoked** — an instrument, recorder, wrapper, listener,
  route, or job that's wired up and never fires. Give the grep that proves it:
  `grep -rn "RecordServiceCall\|ServiceWrapper" pkg/ → no caller`.
- **Scaffolding for absent tech** — Kafka recorders when the stack is SQS, a dev
  env config when there's no dev env.
- **Commented-out code** — delete, git remembers.
- **Dead dependencies** — in the manifest, imported nowhere (`depcheck`,
  `go mod tidy`).
- **Orphaned files** — a module nothing imports, a test for deleted code.

## Rules

- **Prove it before deleting.** Every removal has a grep or a tool output showing
  zero references. Paste it in the PR.
- **Watch for reflection / dynamic dispatch** — DI containers, decorators, string
  keys, config-driven registries can "use" something `grep` won't show. Check.
- **Public API of a published package** is not dead just because this repo doesn't
  call it — check downstream first.
- **One PR per coherent chunk**, `chore: remove dead <area>`. Not one giant PR.
- Latent-but-not-dead (a self-heal branch, a fallback) → leave it, it's not this
  skill's job.

## Anti-patterns

- ❌ Deleting on "looks unused" without the grep.
- ❌ Missing a reflective/dynamic caller.
- ❌ One 2000-line deletion PR nobody can review.
- ❌ Removing a published package's exported API.
