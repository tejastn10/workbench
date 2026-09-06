---
name: grill
description: A relentless interview that sharpens a plan, design, or decision before any code is written — map the open decisions as a tree, ask the whole frontier one round at a time with a recommended answer for each, look up facts yourself, stop only when nothing is left silently assumed. Use when the user says "grill me", wants to stress-test their thinking, or is about to start something under-specified.
---

# Grill

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `grill-me` /
`grilling` (MIT). The point: the most common failure is the agent starting to build
before it understands the problem. This closes that gap first.

Run this before [`phased-delivery.md`](phased-delivery.md), before `write-prd`,
before implementing anything non-trivial.

## How it works

Interview the user until you reach a **shared understanding**. Model the open
questions as a **decision tree** — every decision branches into the decisions that
hang off it.

Work the tree in **rounds**:

- The **frontier** is every decision whose prerequisites are already settled — the
  questions you can ask *now* without guessing at answers you haven't heard.
- Ask the **whole frontier in one round**. Number each question, give a short title,
  and state your **recommended answer**.
- Wait for the user's answers before the next round.

Format:

```
❓ **Q1 — <title>**: <question, with options if there are any>

➡️ <your recommended answer, and why in one line>

---

❓ **Q2 — <title>**: <question>

➡️ <your recommended answer>
```

Each round's answers reshape the tree: settled decisions push the frontier outward
and unblock questions that depended on them. Recompute the frontier, ask the next
round. A question whose answer depends on another still-open question belongs to a
**later** round.

## Rules

- **Facts are your job, never the user's.** If a frontier question needs a fact
  from the repo, the filesystem, `gh`, or docs — go find it (dispatch a sub-agent
  if it's a big search). Don't block the whole round on it: only the questions
  downstream of that fact wait; ask the rest now.
- **Decisions are the user's.** Put each one to them and wait.
- **One round at a time.** Don't run ahead and answer round three's questions in
  round one.
- **Done = empty frontier.** Every branch visited, nothing silently assumed. Do
  not start work until the user confirms the understanding is shared.

## After grilling

Hand off to the right next step:

- Multi-session build → [`phased-delivery.md`](phased-delivery.md).
- Needs a written spec → `skills/docs/write-prd.md`.
- A decision worth recording → `skills/docs/write-adr.md`.
- Want the interview to also draft `CONTEXT.md` + ADRs as it goes → use Matt's
  `grill-with-docs` (install via the plugin, see `.agents/external-skills.md`).

## Anti-patterns

- ❌ Asking one question at a time when five are on the frontier.
- ❌ Asking the user something you could look up.
- ❌ Skipping the recommended answer — it's what makes the round fast to work.
- ❌ Starting to build while questions are still open.
