---
name: adopt-repo
description: One-time setup when bringing a repo under agent-assisted work — get oriented, write its CONTEXT.md, install the skills, record deviations from AGENTS.md, seed .out-of-scope. Use the first time you (or an agent) start working in a project, or when asked to "set up this repo for Claude" / "onboard this codebase".
---

# Workflow — adopt a repo

Run once per project. Orchestrator — invoke each named skill with the Skill tool.

## Steps

| # | Do / invoke | Output |
| - | --- | --- |
| 1 | `planning/orient` | understanding of entry points, data flow, conventions, landmines |
| 2 | write `CONTEXT.md` (from the `CONTEXT.md` template at the repo root) | the glossary + stack + landmines + how-to-run, committed to the repo |
| 3 | run `workbench/scripts/install-skills.sh --project .` | `.claude/skills/` + `.github/skills/` populated |
| 4 | point the repo's `CLAUDE.md` / `.github/copilot-instructions.md` at `AGENTS.md` | one line, not a copy |
| 5 | note every deviation from `AGENTS.md` in `CONTEXT.md` | e.g. different commit scopes, a non-standard branch model, a custom lint config |
| 6 | create `.out-of-scope/` (empty, with the README pattern) | so ruled-out ideas get recorded from day one |
| 7 | check the repo's MCP needs | add `.mcp.json` if it benefits from Context7 / DeepWiki |

## For a richer glossary

Hand step 1–2 to Matt Pocock's `domain-modeling` / `grill-with-docs` if installed
(`.agents/external-skills.md`) — they build the ubiquitous-language glossary more
thoroughly.

## Rules

- `CONTEXT.md` is per-project and lives in that repo, not in workbench.
- Don't copy `AGENTS.md` into the project — reference it.
- Re-run step 1 (`planning/orient`) if you come back to the repo after months away.
