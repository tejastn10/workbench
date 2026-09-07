---
name: tdd
description: Test-driven development — the red → green loop done so it produces tests worth keeping. Test behaviour through public seams (agreed with the user up front), one vertical slice per cycle, expected values from an independent source. Use when building a feature or fixing a bug test-first, or when the user says "red-green-refactor" / "write the test first".
---

# Test-driven development

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `quality/tdd` (MIT),
inlined and trimmed to fit this repo's conventions.

When exploring the codebase first, read `CONTEXT.md` if it exists so test names and
interface vocabulary match the project's domain language, and respect any ADRs in
the area you're touching.

## What a good test is

Verifies **behaviour through a public interface**, not implementation details. The
code can change entirely; the test shouldn't. It reads like a specification —
`user can checkout with valid cart` — and survives refactors because it doesn't
care about internal structure.

## Seams: where tests go

A **seam** is the public boundary you observe behaviour at without reaching inside.

**Test only at pre-agreed seams.** Before writing any test, write down the seams
under test and confirm them with the user. Effort then lands on the critical paths
and the complex logic, not every edge case. Ask: *"what's the public interface, and
which seams should we test?"*

Match the project's test conventions (from `CONTEXT.md` / the pr-review skill for
that stack): Go → table-driven `_test.go` beside the source; Python → `_test.py`
beside the source with `@pytest.mark.parametrize`; NestJS → `*.spec.ts`.

## The loop

- **Red before green.** Write the failing test first, then only enough code to
  pass it. No speculative features, no anticipating the next test.
- **One slice at a time.** One seam, one test, one minimal implementation per
  cycle. Each test is a tracer bullet that responds to what the last cycle taught
  you.
- **Refactoring is not part of the loop.** It's a separate pass — see
  `skills/pr-review/` and the `/simplify` skill.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods,
  asserts through a side channel (querying the DB instead of the interface). Tell:
  the test breaks on a refactor when behaviour didn't change.
- **Tautological** — the assertion recomputes the expected value the way the code
  does (`expect(add(a,b)).toBe(a+b)`, a hand-derived snapshot, a constant equal to
  itself). Expected values must come from an independent source: a known-good
  literal, a worked example, the spec.
- **Horizontal slicing** — all tests first, then all implementation. You end up
  testing the imagined *shape* of things; the tests go insensitive to real change.
  Work vertically: one test → one implementation → repeat.
