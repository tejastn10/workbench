---
name: deslopify
description: Strip AI slop from code an agent just wrote — comments that restate the code, defensive branches for cases that can't happen, abstractions with one implementation, commented-out code, verbose docstrings on obvious functions. A diff-only pass that only ever removes or simplifies, never adds, so it can't introduce slop itself. Run after any agent session that touched code, before committing. Use when asked to "deslopify", "clean this up", "remove the slop", or as the last step before a commit.
---

# Deslopify

Agents pad. They narrate what the next line does, guard against inputs the type
system already rules out, wrap one function in an interface "for testability", and
leave the old version commented above the new one. This pass removes that.

## Hard rule: subtractive only

Every edit in this pass **removes or shortens**. No new code, no new comments, no
new abstractions, no renames, no behaviour changes. If a fix would add anything,
it's out of scope for deslopify — note it and move on. This constraint is what
keeps the pass from becoming another slop generator.

Work **only from the diff** of the session being cleaned (`git diff`, or the diff
against the branch point). Don't audit pre-existing code — that's not this pass.

## What to cut

### 1. Comments that restate the code
```
// increment the counter
counter++
```
Delete. Keep a comment only if it explains *why*, records a non-obvious
constraint, or warns about a footgun. When unsure, the test is: does the comment
survive the reader also reading the line below it?

### 2. Defensive code for cases that can't happen
- Null/undefined checks on a value the type guarantees is present.
- `default:` branches on an exhaustive switch over a closed union.
- `try/catch` around code that doesn't throw.
- Re-validating an argument a caller one line up already validated.
- `if (!Array.isArray(x))` on a parameter typed `T[]`.

Remove the guard. If the "impossible" case is actually reachable, that's a real
bug — flag it, don't silently keep the guard.

### 3. Abstractions with one implementation
- An `interface` / `Protocol` / `abstract class` with exactly one implementer and
  no test double that needs it.
- A config object / options bag passed one value.
- A factory that constructs one type.
- A wrapper function that only forwards its arguments.
- A single-caller helper that's used once, three lines long, and named worse than
  the code it replaces.

Inline it back to the concrete thing.

### 4. Commented-out code
Delete it. Git remembers. No "kept for reference", no `// old:` blocks.

### 5. Verbose docstrings on obvious functions
```
def get_user_name(user):
    """
    Get the name of the user.

    Args:
        user: The user to get the name of.

    Returns:
        The name of the user.
    """
    return user.name
```
Cut to one line, or delete if the signature already says everything. Keep
docstrings that document units, edge-case behaviour, raised exceptions, or
non-obvious contracts.

### 6. Other tells
- Redundant type annotations a good inferrer doesn't need (`const x: number = 5`).
- `console.log` / `print` / `logger.debug` left from the session.
- Ceremonial blank lines and section-divider comments (`// ---- helpers ----`)
  inside a short file.
- `TODO` / `FIXME` with no ticket and no owner that the session itself added.
- Test names and `it(...)` strings that restate the assertion verbatim.
- Over-split functions: a function called once, whose body would read fine inlined.

## What to leave alone

- Anything outside the session diff.
- Comments explaining *why*, TODOs that predate the session, domain-specific
  guards, docstrings carrying real contract detail.
- Style a formatter/linter owns — that's not slop, that's config.
- Genuine simplifications that require *adding* code (extract, dedupe, refactor) —
  those belong in a separate `/simplify` pass, not here.

## Process

1. Get the session diff. List the changed files.
2. Walk each hunk against the six categories above.
3. Apply only subtractive edits.
4. Re-run the tests / typecheck / lint — a deslopify pass must leave them green.
   If removing a guard breaks a test, decide: was the test asserting slop, or is
   the case real? Real → revert and flag as a bug. Slop → the test goes too.
5. Report: what was cut (grouped by category), and anything you flagged as a real
   bug or a follow-up `/simplify`.

## Anti-patterns for the agent running this

- ❌ Adding a comment, a rename, or a refactor "while you're in there".
- ❌ Touching code the session didn't.
- ❌ Removing a guard for a case that's actually reachable.
- ❌ Deleting a `why` comment because it looks like a `what` comment — read it.
- ❌ Turning this into a general code review. One job: cut what the session padded.
