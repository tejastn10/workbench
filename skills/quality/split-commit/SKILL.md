---
name: split-commit
description: Turn a messy working tree or a fat WIP commit into a clean series of conventional commits — one logical change each, each one building and passing tests, subjects in the right type. Use when asked to "split this commit", "clean up before the PR", "these changes should be separate commits", or when a diff mixes a refactor with a feature.
---

# Split into conventional commits

House rule: **one logical change per commit**, Conventional Commits, imperative
subject, no trailing period, enforced by commitlint. Prefactoring and refactors
come *before* the change that needed them.

## From an uncommitted working tree

1. **Group the diff.** List the hunks and bucket them: the prefactor, the feature,
   the test, the unrelated fix you noticed. Each bucket is a commit.
2. **Stage a bucket** — `git add -p` for hunk-level, or by file. Order:
   refactor/prefactor first, then the feature, then tests, then docs.
3. **Commit** with the right type: `refactor:`, `feat:`, `fix:`, `test:`,
   `chore:`, `docs:` (or whatever a repo's `commitlint.config.*` defines).
4. **Verify each commit builds** — `git stash` the rest, run the build/tests,
   `git stash pop`. A commit that doesn't build breaks `quality/bisect` later.
5. Repeat until the tree is clean.

## From an existing fat commit (not yet pushed)

- `git reset --soft HEAD~1` to put it all back in the index, then follow the
  working-tree flow above.
- Or `git rebase -i` and mark it `edit`, then `git reset HEAD^` at the stop.

## Rules

- Never split commits that are already pushed and shared without agreeing first.
- Commit as the configured git user, no AI trailers.
- If two changes are genuinely entangled and can't be separated cleanly, one
  commit is fine — say so in the body.

## Anti-patterns

- ❌ A commit that doesn't build on its own.
- ❌ "wip", "fixes", "stuff" subjects.
- ❌ A refactor and the feature it enabled in one commit.
- ❌ Splitting shared history nobody agreed to rewrite.
