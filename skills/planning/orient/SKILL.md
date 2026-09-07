---
name: orient
description: Get up to speed in an unfamiliar codebase fast — find the entry points, trace the main data flow, learn the local conventions and the landmines, then write it down as the project's CONTEXT.md. Use when starting work in a repo you don't know, when asked to "explain this codebase" / "how does this project work", or before an agent's first task in a new project.
---

# Orient in a codebase

Adapted in spirit from [mattpocock/skills](https://github.com/mattpocock/skills)
`wayfinder`. The output is a first-draft `CONTEXT.md`
(`CONTEXT.md` (repo root) as the template) — the thing every later session needs.

## Order of operations

1. **Read the README, then the package manifest.** Stack, framework, package
   manager, scripts, key dependencies. Note the version-pin files
   (`.nvmrc`, `.python-version`, `go.mod`).
2. **Find the entry points.** `main.ts` / `main.go` / `app.module.ts` / `main.tsx`.
   For a service: how does a request get from the edge to a handler?
3. **Trace one real flow end to end.** Pick a representative endpoint or job.
   Follow it: route → controller → service → repository → datastore. Note the
   layers and where the boundaries are.
4. **Map the directories that matter.** Usually a handful — skip the obvious ones
   (`node_modules`, generated). For unfamiliar dependencies, DeepWiki over
   guessing.
5. **Learn the conventions from the code, not the docs.** Casing at the wire
   layer, how errors propagate, how config/env is read, test layout and style,
   the logging pattern. Cross-check against `AGENTS.md` — note every deviation.
6. **Hunt the landmines.** Migrations in flight, `// don't touch` comments, code
   that looks wrong but has a reason, known-fragile areas, `.out-of-scope/` if it
   exists.
7. **Build the glossary.** The domain terms the code uses — pull the real ones,
   define them, list the synonyms to avoid.

## Output — `CONTEXT.md`

Fill the template's sections: Overview, Language (glossary), Stack, Where things
live, Deviations from AGENTS.md, Landmines, How to run it. Mark genuine unknowns
as `TBD` rather than guessing.

For a deep glossary pass, hand off to Matt's `domain-modeling`
(`.agents/external-skills.md`).

## Anti-patterns

- ❌ Reading files at random instead of tracing one flow.
- ❌ Documenting the framework's structure instead of this project's.
- ❌ Inventing domain terms the code doesn't use.
- ❌ Skipping the landmines section — it's the highest-value part for the next
  session.
