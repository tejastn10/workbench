---
name: investigate-bug
description: Work a bug the way Tejas wants it worked — reproduce first, isolate with evidence, form one hypothesis at a time, trace the mechanism end to end before proposing a fix. Same "show the mechanism, not the symptom" discipline as the PR-review skills. Use when asked to "debug X", "figure out why Y", "investigate this failure", or handed a stack trace / bug report.
---

# Investigate a bug

The rule from the review corpus applies here too: **don't assert a cause you can't
trace.** Quote the line, the caller, the state, and what happens on the next cycle.

## Order of operations

1. **Reproduce.**
   - Get the exact inputs, environment, version/commit, and expected-vs-actual.
   - Reproduce locally or in a test before touching anything. A bug you can't
     reproduce is a bug you can't confirm fixed — say so if it's not reproducible
     and switch to evidence-gathering (logs, traces, metrics around the event).
   - Write the repro as a failing test if the codebase allows it.

2. **Isolate.**
   - Narrow to the smallest failing case. Remove variables one at a time.
   - `git bisect` when it's a regression and the good/bad commits are known.
   - Check the boundary: is it the code, the data, the config, the environment, or
     a dependency version?

3. **One hypothesis at a time.**
   - State it: "I think X because Y." Make a prediction it implies. Test that
     prediction. Confirm or kill it before moving on.
   - Don't shotgun multiple changes hoping one sticks.

4. **Trace the mechanism.**
   - Follow the actual path: entry point → each call → the failing operation.
   - For concurrency: which goroutine/async task, what ordering, what shared state.
   - For queues: terminal vs retryable, deleted vs redelivered.
   - For cache: is the read key derived identically to the write key.
   - For contract bugs: what changed in the shape/code and who consumes it.

5. **Explain before fixing.** Write two or three sentences: the mechanism, the
   trigger condition, why it didn't show up earlier. If you can't, you're not done
   isolating.

6. **Fix at the right altitude.** Smallest change that addresses the mechanism —
   not a broad refactor, not a band-aid one layer too shallow. Reuse existing
   helpers/patterns rather than adding an abstraction.

7. **Prove the fix.** The repro test now passes; nearby cases still pass; add a
   regression test named for the bug.

8. **Check for siblings.** Does the same pattern exist elsewhere in this repo or a
   sibling service? Flag it even if out of scope for the current fix.

## Output

- **Summary** — mechanism, trigger, blast radius, since when.
- **Evidence** — the log lines / traces / diffs that prove it, with locations.
- **Fix** — what changed and why it's at the right altitude.
- **Regression test** — added.
- **Related** — other places the pattern appears.

If the bug caused user-facing impact, follow with
`incident/postmortem`.

## Anti-patterns

- ❌ Proposing a cause from reading the code without reproducing.
- ❌ Multiple simultaneous speculative changes.
- ❌ Fixing the symptom (swallow the error, add a retry) without the mechanism.
- ❌ A broad refactor smuggled into a bug fix.
- ❌ No regression test.
