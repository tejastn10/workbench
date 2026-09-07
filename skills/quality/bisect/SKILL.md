---
name: bisect
description: Find the commit that introduced a regression with git bisect — pin a known-good and known-bad commit, automate the test where possible, land on the culprit, then understand why. Use when something worked before and doesn't now, the cause isn't obvious from a recent diff, and you can name a commit/tag where it was fine.
---

# Bisect a regression

Binary search over history. Fast when you can name a good commit and script the
check.

## Setup

1. **Reproduce the bad behaviour** on `HEAD` — a concrete check (a failing test, a
   command, a script that exits non-zero on the bug). This is your test.
2. **Find a known-good point** — a tag, a release, a commit/date where it worked.
   Verify the bug is *absent* there.

## Run

```bash
git bisect start
git bisect bad                 # HEAD is bad
git bisect good v1.4.0         # this was good
# git checks out the midpoint; test it:
git bisect good   # or: git bisect bad   (per your test result)
# repeat until: "<sha> is the first bad commit"
git bisect reset
```

**Automate it** when the test is scriptable:

```bash
git bisect start HEAD v1.4.0
git bisect run ./scripts/repro.sh   # exit 0 = good, non-zero = bad, 125 = skip
```

- Use exit `125` (`git bisect skip`) for commits that don't build — don't let them
  score as good or bad.
- If the repro needs a fresh install per step, do it in the script
  (`npm ci` / `go mod download`).

## After

- You have the first bad commit. Read its diff with the bug in mind — usually the
  mechanism is now obvious.
- Hand to `incident/investigate-bug` to confirm the mechanism and write the
  regression test (name it for the bug).
- If the culprit is a merge commit, bisect *within* it (`git bisect start` with
  its parents).

## Anti-patterns

- ❌ Starting without verifying the "good" commit is actually good.
- ❌ Marking a non-building commit good or bad instead of `skip`.
- ❌ A flaky test as the bisect check — you'll land on the wrong commit.
- ❌ Stopping at the commit without understanding why it broke things.
