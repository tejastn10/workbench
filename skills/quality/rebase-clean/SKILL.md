---
name: rebase-clean
description: Tidy a feature branch before it merges — squash fixup commits into their targets, drop "wip" noise, reorder so prefactors come first, rebase onto the base branch, keep history linear. Only on unshared branches. Use when asked to "clean up the branch", "squash the fixups", "rebase onto main", or before opening / updating a PR.
---

# Rebase a branch clean

Goal: the branch reads as the sequence of changes you *wish* you'd made — linear,
each commit meaningful, ready to review commit-by-commit.

## Before touching anything

- Is the branch **shared**? If someone else has it checked out or has built on it,
  don't rewrite without agreeing. A solo feature branch is fair game.
- `git fetch` and note the base (`main`).

## The passes

1. **Fixups first, as you go.** When you fix a review comment, commit it as
   `git commit --fixup <sha>` (or `--squash`). Then one
   `git rebase -i --autosquash <base>` folds every fixup into its target
   automatically.
2. **Interactive rebase** (`git rebase -i <base>`) for the rest:
   - `drop` pure noise ("wip", "typo", "revert the revert").
   - `squash` / `fixup` commits that only exist to patch an earlier one.
   - `reword` bad subjects into conventional form.
   - `move` prefactors and refactors ahead of the feature commit.
3. **Rebase onto the base** — resolve conflicts as they come
   (`quality/resolve-merge-conflicts`), `git rebase --continue`.
4. **Verify** — build + tests on the final tip, and ideally spot-check that a
   mid-branch commit builds (for `quality/bisect`).
5. **Force-push with lease** — `git push --force-with-lease` (never plain
   `--force`), so you don't clobber someone else's push.

## Rules

- `--force-with-lease`, not `--force`.
- Don't rebase `main` or any long-lived shared branch.
- Merge commits from `main` into the feature branch → prefer rebasing instead so
  history stays linear; if the team merges, follow the team.

## Anti-patterns

- ❌ Rewriting a branch other people have based work on.
- ❌ `git push --force` (use `--force-with-lease`).
- ❌ Squashing everything into one commit when the steps were meaningfully
  separate.
- ❌ A final tip that passes but broken commits in the middle.
