---
name: spike
description: A timeboxed throwaway experiment to answer one specific question — build the smallest thing that resolves the unknown, then delete the spike and write up the answer. The code is disposable; the answer is the deliverable. Use when a plan is blocked on "will this even work" / "how does X behave" / "which approach is faster", or the user says "spike", "prototype", "try it quick".
---

# Spike

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `prototype`.

A spike answers **one question**. It is not the first draft of the feature.

## Rules

1. **Write the question down first.** "Can we stream this response through the
   existing middleware?" — specific, falsifiable. If you can't phrase it, you're
   not ready to spike.
2. **Timebox it.** Say the budget out loud (30 min, 2 hours). When it's up, you
   either have the answer or you report what you learned and what's still open.
3. **Smallest possible build.** Hard-code, skip error handling, skip tests, skip
   types. On a throwaway branch (`spike/<slug>`) or a scratch dir.
4. **Don't polish.** The moment it answers the question, stop.
5. **Delete the spike.** The branch, the scratch files — gone. Git remembers if
   you ever need it.
6. **Write up the answer** — 3–6 sentences: the question, what you found, the
   mechanism, what it means for the plan. Link a permalink to the spike commit if
   it's worth referencing.

## When the answer is "yes, do it this way"

The spike still gets deleted. The real implementation is built fresh, properly,
informed by what the spike taught you — not by promoting spike code to production
(it has no tests, no error handling, and you cut corners you've now forgotten).

## Anti-patterns

- ❌ A spike with no written question — it becomes aimless exploration.
- ❌ Adding tests / types / error handling "while I'm here".
- ❌ Merging the spike branch.
- ❌ No write-up — the learning evaporates when the session ends.
- ❌ Spiking something you could answer by reading the docs (use
  `planning/evaluate-dependency` or Context7 instead).
