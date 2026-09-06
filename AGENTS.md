# AGENTS.md

Global conventions for any coding agent working in my repos. Skills and
project `CONTEXT.md` files build on this — they don't restate it.

## Commits

- Conventional Commits, enforced with commitlint.
- Types: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `build:`,
  `ci:`, `perf:`, `style:`, `revert:`.
- If a repo ships its own `commitlint.config.*`, that file is the source of
  truth for types and scopes — read it and follow it exactly.
- One logical change per commit. Subject in imperative mood, no trailing period.

## Branches

- `feature/<name>` for new work.
- `bugfix/<name>` for fixes.
- `<name>` is short and kebab-cased.

## Commit authorship

- Commit as the configured git user only. Never add agent/AI co-author or
  attribution trailers, and never push on my behalf unless asked.

## PR review — house priorities

Ordered; earlier beats later when they conflict.

1. **Reuse before building** — is there an existing helper, module, or pattern
   this should use instead of a new one?
2. **Correctness** — logic, edge cases, error handling, concurrency.
3. **Right altitude** — the change solves the actual problem, not more, not less.
4. **Convention fit** — matches the surrounding code and this file's rules.
5. **Tests** — meaningful coverage for the change.
6. Style nits last, and only if not autoformatted.

Stack-specific checks and tooling live in `skills/pr-review/<language>.md`.

## Docs

- PRDs and ADRs use the templates in `docs/templates/`.
