---
name: break-coupling
description: Break a circular dependency or an over-tight coupling — a forwardRef triad, two modules that import each other, a service reaching across a boundary it shouldn't. Find what actually needs to cross, move it, invert the direction. Use when a build warns about a cycle, a review flags forwardRef / a cross-import, or the user says "these two modules are tangled".
---

# Break coupling

Straight from the NestJS review notes: *"question whether the cross-import is
needed at all if nothing injects the service yet"*.

## Diagnose

1. **Draw the cycle.** A → B → A. Name exactly what A takes from B and what B
   takes from A.
2. **Is one direction spurious?** Often one side imports the other for a type, a
   constant, or a helper that doesn't belong there. If nothing actually *uses*
   the cross-import at runtime, delete it — done.
3. **Is there a shared thing?** Both A and B depend on some concept X that's
   currently living inside one of them. Extract X to its own module; A and B both
   depend on X, cycle gone.

## Fixes, in order of preference

1. **Delete the unused cross-import.**
2. **Extract the shared piece** (a type, an interface, an enum, a small service)
   into a module both sides import — no cycle. For NestJS, shared connection/config
   modules should be `global: true`, not re-imported per feature.
3. **Invert the dependency** — B shouldn't call A; A should pass B a callback, or
   B should emit an event A listens for. The consumer declares the small
   interface it needs (especially in Go — define the interface on the consumer,
   not the producer).
4. **`forwardRef` is the last resort**, not a fix. If you reach for it, write a
   comment explaining why the cycle is unavoidable.

## Verify

- The cycle-detection warning is gone.
- `grep` the removed import name — zero hits.
- Tests green, and a test that would have caught a wiring break.
- Commit `refactor: break <A>/<B> circular dependency`.

## Anti-patterns

- ❌ Adding `forwardRef` and calling it done.
- ❌ Extracting a "shared" module that's just a dumping ground.
- ❌ Breaking the cycle by merging A and B into one bigger module.
