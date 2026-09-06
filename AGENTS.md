# AGENTS.md

Global conventions for any coding agent working in my repos. Skills and
project `CONTEXT.md` files build on this — they don't restate it.

This file is the cross-tool source of truth. Claude Code, Codex, and other agents
all read `AGENTS.md` — put a convention here once instead of duplicating it into
tool-specific config. Per-project specifics (domain glossary, stack, deviations)
go in that project's `CONTEXT.md` (see the stub in this repo).

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
- `improvement/<name>` for non-feature, non-bug changes (perf, refactor, tooling).
- `<name>` is short and kebab-cased. Enforced by a husky `pre-push` hook.

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

- PRDs, ADRs, and postmortems use the templates in `docs/templates/`, driven by the
  skills in `skills/docs/` and `skills/debugging/`.
- ADRs are numbered and immutable once accepted — supersede, don't edit.
- Postmortems are blameless: systems and decisions, never people.
- Each project keeps a `CONTEXT.md` with a living domain glossary (ubiquitous
  language). Use the shared term; don't invent synonyms.

## Planning multi-session work

- A change that spans more than one session gets broken into phases first
  (`skills/planning/phased-delivery.md`).
- Every phase has a **non-goals** list, a **checkable** definition of done, and a
  **git tag or merged PR** as its boundary. Slice vertically (tracer bullets),
  not by layer. Confirm the phase list before starting.

## Before committing

- On any session that touched code, run the `deslopify` pass
  (`skills/quality/deslopify.md`) before the commit — subtractive only.

## Security

- A change touching auth, user input, file handling, external requests, or
  dependencies gets a `security-review` pass (`skills/security/`) on top of the
  inline pr-review checks. Run it before a release too.
- A real secret that was ever committed is compromised — rotate it, don't just
  delete it.

## Rejected ideas

- Decisions to *not* do something live in `.out-of-scope/` as short files, not in
  memory and not deleted. Check there before re-proposing something; add a file
  when a direction is ruled out.

## Tooling

- MCP servers: configs and per-client setup in `.agents/mcp/` — Context7 (library
  docs), DeepWiki (unfamiliar repos).
- GitHub (PR / issue / release history) goes through the `gh` CLI, not an MCP
  server: `.agents/github-cli.md`.
- External skill sets worth installing (Matt Pocock's, etc.): `.agents/external-skills.md`.
