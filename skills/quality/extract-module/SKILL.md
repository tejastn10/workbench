---
name: extract-module
description: Split a file or module that's grown too big — find the real seams, pull out a cohesive piece with a narrow interface, move the tests with it, keep every commit green. Behaviour-preserving only. Use when asked to "split this file", "extract X into its own module", "this file is too big", or a review flags a god-object.
---

# Extract a module

Behaviour must not change. Every commit compiles and passes tests.

## Find the seam

Don't split by line count — split by **cohesion**. Look for:

- A cluster of functions that only talk to each other and share private state.
- A set of functions that all take the same 2–3 parameters (they want to be a
  type with methods, or a module with that state closed over).
- A concern that has its own vocabulary (parsing, formatting, a protocol, a
  cache).
- Code the rest of the file only calls through 1–2 entry points — that's the
  interface of the new module.

If nothing has a clean seam, the file may be fine as-is. A big file of unrelated
small functions is a naming problem, not a structure problem.

## Do it

1. **Name the new module for what's in it**, not generically (`billing-period`,
   not `utils`). Match the project's layout — for NestJS, a new feature module
   gets its own `v1/` folders and module-local `constants.ts`
   (`design/scaffold-nestjs-module`).
2. **Move, don't rewrite.** Cut the code, paste it, fix imports. Resist improving
   it in the same pass.
3. **Keep the interface narrow** — export only what callers use. Everything else
   stays unexported.
4. **Move the tests** that cover the extracted code into a spec beside it. Don't
   leave them testing through the old file.
5. **One commit** (`refactor: extract <module> from <file>`), green.
6. **Then** — a separate commit/PR for any cleanup the extraction revealed.

## Anti-patterns

- ❌ Splitting by size with no cohesive seam.
- ❌ Rewriting logic during the move.
- ❌ A wide interface that exposes internals "just in case".
- ❌ Tests left behind, still coupled to the old module.
- ❌ Bundling the extraction with a behaviour change.
