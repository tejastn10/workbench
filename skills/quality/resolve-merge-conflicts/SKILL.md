---
name: resolve-merge-conflicts
description: Resolve merge or rebase conflicts by understanding both sides' intent, not by picking one blindly — reconstruct what each change was for, combine them, verify the result builds and both features still work. Use during a merge/rebase that stopped on conflicts, or when asked to "fix the conflicts" / "merge main in".
---

# Resolve merge conflicts

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills)
`resolving-merge-conflicts`.

A conflict is two intents meeting. Resolving it means keeping **both** intents,
not deleting the one that's less familiar.

## Process

1. **Know which operation you're in.** `git status`. In a `merge`, "ours" is your
   branch; in a `rebase`, "ours" is the branch you're rebasing *onto* (the base) —
   this trips people up.
2. **List the conflicted files** and triage: real logic conflicts vs mechanical
   (lockfiles, generated, imports, formatting).
3. **Mechanical first:**
   - Lockfiles (`package-lock.json`, `poetry.lock`, `go.sum`) — don't hand-merge.
     Take one side, then regenerate (`npm install`, `poetry lock`, `go mod tidy`)
     and commit the result.
   - Generated files — take one side, re-run the generator.
   - Import blocks — take both, let the formatter dedupe.
4. **For each logic conflict:**
   - `git log --merge -p <file>` — see both sides' commits and *why* each change
     was made.
   - State each side's intent in a sentence.
   - Write the version that satisfies both. If they're genuinely incompatible,
     that's a design decision — surface it, don't silently pick one.
5. **After resolving all files:** build + typecheck + lint, and run the tests for
   *both* features that collided.
6. `git add` the files, `git rebase --continue` / `git commit`.

## When it's a mess

If a rebase has many conflicting commits and each one re-conflicts on the same
lines, `git rebase --abort` and consider a single merge instead, or rebase in
smaller chunks.

## Anti-patterns

- ❌ `-X ours` / `-X theirs` on the whole merge to make it go away.
- ❌ Hand-editing a lockfile.
- ❌ Resolving without reading why each side changed the line.
- ❌ Marking resolved without building and testing both features.
- ❌ Deleting the unfamiliar side because yours is the one you understand.
