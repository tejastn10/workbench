---
name: hotfix
description: Ship an urgent production fix without the full process overhead but without cutting the dangerous corners — smallest possible change, branch from the released tag, cherry-pick, expedited review, deploy with extra watching, then backport to main. Use when prod is broken or degraded and the normal release cadence is too slow.
---

# Hotfix

The goal: minimum change, minimum delay, without skipping the checks that stop the
hotfix from making things worse.

## Scope

- **Smallest change that stops the bleeding.** Not the "proper" fix, not a
  refactor, not "while I'm in here". One concern.
- If you can mitigate without code (flag off, config, scale up, rate-limit the
  bad path) — do that first (`deployment/rollback`), it's faster and safer.

## Branch & build

- Branch from the **currently released tag**, not from `main` (`main` may have
  unreleased changes you don't want in prod).
  `git checkout -b bugfix/<slug> <last-release-tag>`.
- Make the fix. Add a **regression test** — even under pressure, the test is what
  stops the recurrence and proves the fix.
- Conventional commit: `fix: <what>`.

## Review & ship

- **Still reviewed** — a second pair of eyes, expedited. A blocking-only review
  (`../pr-review/`): does it fix the thing, does it break anything, is it minimal.
- Run CI (tests, security-audit). Don't skip it — a hotfix that fails a test is
  not a hotfix.
- Deploy with the canary + watch from `deployment/deploy-service`, and watch **longer**
  than usual.
- Tag it — a patch release (`deployment/cut-release`): a `fix:` since the last
  tag → patch bump `vX.Y.Z+1`.

## After

- **Backport to `main`** immediately (cherry-pick or a forward PR) so the next
  release doesn't regress the fix.
- Postmortem (`incident/postmortem`) — the hotfix bought time;
  the real fix and prevention still need to happen.

## Anti-patterns

- ❌ Branching from `main` and dragging unreleased changes into prod.
- ❌ Skipping review or CI "because it's urgent".
- ❌ No regression test.
- ❌ Bundling the "real" fix or cleanup into the hotfix.
- ❌ Forgetting to backport → next release reintroduces the bug.
