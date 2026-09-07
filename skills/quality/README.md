# skills/quality

Code and repository health — cleanup, tests, behaviour-preserving refactors, and
clean git history. Every refactor keeps each commit green.

## Code

| Skill                  | Use for                                                     |
| ---------------------- | ------------------------------------------------------- |
| `quality/deslopify`         | Strip AI slop from freshly written code — subtractive only, run before commit |
| `quality/tdd`               | Red → green loop that produces tests worth keeping (adapted from Matt Pocock) |
| `quality/extract-module`    | Split a too-big file/module along its real seams          |
| `quality/wide-rename`       | Rename/retype across hundreds of call sites — expand / migrate / contract |
| `quality/break-coupling`    | Kill a circular dependency or a `forwardRef` triad        |
| `quality/dead-code-sweep`   | Repo-wide removal of code nothing calls, each proven by grep |

## Git history

| Skill                        | Use for                                                 |
| ---------------------------- | --------------------------------------------------- |
| `quality/split-commit`            | Messy tree / fat WIP → a series of conventional commits  |
| `quality/rebase-clean`            | Tidy a feature branch before merge — squash fixups, reorder, linearize |
| `quality/resolve-merge-conflicts` | Resolve conflicts by keeping both sides' intent (adapted from Matt Pocock) |
| `quality/bisect`                  | Find the commit that introduced a regression            |

Conventional Commits + `feature/` / `bugfix/` / `improvement/` branches,
husky-enforced (`../../AGENTS.md`). Commit as the configured git user only, no AI
trailers, never push unless asked.
