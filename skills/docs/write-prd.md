---
name: write-prd
description: Draft a PRD using Tejas's template and house conventions — table header, `---` divider between every section, emoji H2s, outlines for prose and tables for structured data. Interview for the missing pieces before writing; never invent goals, metrics, or scope. Use when asked to "write a PRD", "draft a spec", "turn this into a PRD", or to flesh out a feature doc.
---

# Write a PRD

Fills in [`docs/templates/PRD.md`](../../docs/templates/PRD.md). The template is the
source of truth for structure and formatting — don't restructure it.

## When to use

- A feature or project needs a written spec before build.
- A rough idea / thread / ticket needs to become a reviewable document.
- An existing PRD needs a section fleshed out.

## Process

1. **Read the template** so the output matches it exactly (section order, emoji
   headers, `---` between every section, table header block).
2. **Gather what exists** — the ticket, the thread, any design doc, the code if the
   problem is in-repo. Quote real numbers; don't estimate impact silently.
3. **Interview for the gaps.** Ask one focused question at a time. The sections that
   almost always need input:
   - **Problem / why now** — what's the trigger, what does the status quo cost.
   - **Goals** — must be measurable or observable. Push back on vague ones.
   - **Non-goals** — ask explicitly "what's out of scope?" — this is the section
     people skip and reviewers fight over.
   - **Success metrics** — metric, baseline, target. If there's no baseline, say so.
   - **Rollout** — flag name, migration steps, rollback path.
   - **Open questions** — every one gets an owner and a needed-by date.
4. **Draft it.** One sentence under the title. Fill the header table. Write
   `Summary` last, once the body is settled — it should stand alone.
5. **Mark unknowns** as `> **TBD:** …` blockquotes rather than inventing an answer.
6. **Save** to `docs/prd/<slug>.md` in the target repo. Start Status at `Draft`.

## House conventions

- Header is a table. One `---` between every section. Emoji H2s as in the template.
- Outlines (nested bullets) for prose sections; tables for user stories, functional
  requirements, rollout phases, risks, metrics, open questions.
- `[bracketed]` placeholders get replaced; delete the italic guidance lines as each
  section is written.
- Conventional-commit the doc: `docs: add PRD for <feature>`.

## Anti-patterns

- ❌ Inventing goals, metrics, or scope to fill a section. Ask or mark TBD.
- ❌ Reordering or renaming the template's sections.
- ❌ A `Summary` that only makes sense after reading the rest.
- ❌ Non-goals left empty.
- ❌ Prose where the template wants a table.
