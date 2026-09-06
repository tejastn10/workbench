---
name: handoff
description: Compact the current session into a portable handoff document so a fresh agent (new tool, new machine, a colleague) can pick the work up. References existing artifacts by path instead of duplicating them, names the skills the next session should use, redacts secrets. Use when the user says "handoff", is switching harness/machine, or forking a side task without derailing the current one.
---

# Handoff

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `handoff`
(MIT).

Write a handoff document so a fresh agent can continue this work with no shared
context. Save it to the **OS temp directory**, not the workspace (it's scaffolding,
not a deliverable).

## When it's the right move

Only when something is actually travelling:

- switching harness (Claude Code → Codex),
- moving to a different repo or machine,
- passing the work to a colleague,
- forking a side task found mid-session without losing your place.

If nothing is travelling, don't hand off — `/clear` or `/compact` is cheaper. See
Matt's phase-boundary tree (`.agents/external-skills.md`) for the full decision.

## What goes in it

- **Goal** — what the next session is trying to achieve (if the user passed a
  focus, tailor to it).
- **State** — what's done, what's in progress, what's untouched.
- **Key decisions** — the reasoning that isn't recoverable from the diff.
- **Next steps** — concrete, ordered.
- **Suggested skills** — which skills the next agent should invoke, by name.
- **Landmines** — anything fragile or surprising.

## Rules

- **Don't duplicate artifacts.** Specs, plans, ADRs, issues, commits, diffs —
  reference by path or URL, don't paste.
- **Redact** API keys, tokens, passwords, PII.
- Keep it short enough that reading it costs less than the context it replaces.

## Anti-patterns

- ❌ Saving it into the working tree.
- ❌ Copying the whole conversation in.
- ❌ Re-explaining what a linked spec already says.
- ❌ Handing off when you could just continue or `/compact`.
