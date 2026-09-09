---
name: audit-skills
description: Periodically check the workbench skills for rot — dead cross-links, references to files/flags/tools that no longer exist, stale tooling assumptions, missing frontmatter, drift between a skill and the conventions it cites, and category READMEs out of sync. Use every few months, after a big convention change, or when asked to "audit the skills" / "check the skills repo".
---

# Audit the skills

The repo cites real files, flags, tools, and commands — those drift. This is the
sweep that catches it.

## Checks

1. **Frontmatter** — every `skills/*/*.md` (not `README.md`) has `name` +
   `description`; `name` matches the filename; names are unique.
2. **Cross-links** — every `../category/skill.md` and `docs/...` / `.agents/...`
   link resolves to a real file. Grep the link targets, check they exist.
3. **Cited files & paths** — a skill that says "see `src/api/helper.ts`" or
   "`.github/workflows/security-audit.yml`" — does that path still exist in the
   reference repos? A skill naming `write-migration.md` after it was renamed to
   `deployment/data-migration` is stale.
4. **Tooling assumptions** — Python is still flake8/black/isort not ruff? Go
   golangci-lint version? The `ember` stack is still LGTM? If the toolchain
   migrated, the skill (and any `.out-of-scope/` file that pinned it) needs
   updating.
5. **Convention drift** — a skill's rules still match `AGENTS.md` and the relevant
   `pr-review/*` skill. Branch prefixes, commit types, review priority order.
6. **READMEs** — `skills/README.md` and each category `README.md` list every
   skill that exists, and nothing that doesn't. The site derives from the files,
   but the READMEs are hand-kept.
7. **Plugin manifest** — `.claude-plugin/plugin.json`'s `skills` array has exactly
   one `./skills/<cat>/<name>` entry per skill directory. Regenerate if it drifts.
7. **Site data** — `site/src/data/site.ts` prose (EXTERNAL adapted/take/skip,
   CONVENTIONS) still accurate; `getMcpServers()` matches `.agents/mcp/`.
8. **`.out-of-scope/`** — each rejection still holds. If a decision reversed,
   delete the file and add the thing.
9. **External skills** — `mattpocock/skills` moved? The adapted copies
   (`planning/grill`, `planning/handoff`, `quality/tdd`) materially diverged from upstream?

## Run the automated checks first

`node scripts/validate-skills.mjs` covers the mechanical part — missing/mismatched
frontmatter, duplicate names, `plugin.json` drift, invalid manifest JSON, missing
category READMEs. This skill is the parts a script can't judge: dead links, stale
tooling assumptions, convention drift, prose accuracy.

## Output

A list grouped by severity: broken (dead link, missing frontmatter, wrong path) →
stale (tooling/convention drift) → cosmetic (README out of sync). Fix the broken
ones in the same pass; propose the stale ones.

## Anti-patterns

- ❌ Auditing prose quality instead of factual accuracy — this is about whether
  the references are still true.
- ❌ Fixing a dead link by deleting the mention instead of updating the path.
- ❌ Leaving a reversed `.out-of-scope/` decision in place.
