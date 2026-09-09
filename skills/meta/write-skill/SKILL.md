---
name: write-skill
description: Author a new skill for this repo in the house style — YAML frontmatter with a trigger-rich description, terse mechanism-focused body, a "what to let slide" section for review skills, an anti-patterns list, grounded in real conventions not generic advice. Use when adding a skill to workbench, when asked to "write a skill for X", or to fix an existing one that's too vague.
---

# Write a skill

Adapted in spirit from [mattpocock/skills](https://github.com/mattpocock/skills)
`writing-for-agents`. A skill is a packaged instruction set an agent loads *instead
of* its default approach — so it must be specific enough to change behaviour.

## Frontmatter

```yaml
---
name: <kebab-case>            # matches the filename; unique across the repo
description: <what it does — one clause> · <the distinctive detail> · Use when <triggers>
---
```

- The **description is the router** — the agent decides to load the skill from it.
  Pack it with the phrases someone would actually use ("review this PR", "cut a
  release", "why is X slow"). Name the stack / tool if it's specific.
- Keep it one sentence-ish; front-load what it does.

## Body

- **Terse.** Same register as `pr-review/nestjs-backend-pr-review`: short
  sentences, name the mechanism, no throat-clearing.
- **Grounded, not generic.** "Use `SET k v EX 300`, not `SET` then `EXPIRE`" beats
  "handle TTLs carefully". Pull real rules from the codebase, the review corpus,
  the actual tooling. If you're writing best-practice platitudes, stop.
- **Structure to the task:**
  - Review skills: ranked "what to flag" (with the reason), a **"what to let
    slide"** section (as important), how to structure the output, then
    order-of-operations.
  - Process skills: the steps in order, the rules, the output.
- **Reference** sibling skills as `` `category/name` `` (bare, no path) — the agent
  invokes by name. The site turns `Adapted from [source]` at the start of a line
  into a badge.
- **End with `## Anti-patterns`** — what the agent must not do, as `❌` bullets.
- ~40–120 lines. Longer means it's trying to be a textbook.

## Placement

- `skills/<category>/<name>/SKILL.md` — one directory per skill (Claude Code
  plugin format). New category → just make the folder + a `README.md`; the site
  auto-discovers it and derives the label from the slug.
- Add the dir path (`./skills/<category>/<name>`) to the `skills` array in
  `.claude-plugin/plugin.json` — the plugin manifest is explicit, not auto-discovered.
- Add a row to `skills/README.md` and the category `README.md`.
- If it's a template-filler, the template goes in `docs/templates/` and its
  purpose row in `docs/templates/README.md`.

## Anti-patterns

- ❌ A description that doesn't say when to use the skill.
- ❌ Generic best-practice advice with no line-level specifics.
- ❌ A review skill with no "what to let slide" section.
- ❌ No anti-patterns list.
- ❌ Restating what the tool's own docs say instead of the house opinion.
- ❌ 300 lines.
