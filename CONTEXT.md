# CONTEXT.md

Stub. `CONTEXT.md` is a **per-project** file — it does not belong in workbench
itself. This copy documents the expected shape so it can be dropped into a project
and filled in.

Its main job is a **living glossary**: the project's domain terms, defined once, so
an agent stops inventing generic names for your concepts and stops using twenty
words where one shared term would do. Update it whenever a term's meaning shifts or
a new one appears. (Matt Pocock's `/grill-with-docs` and `/domain-modeling` skills
draft and maintain this — see [`.agents/external-skills.md`](.agents/external-skills.md).)

---

## Overview

> One paragraph: what this project is and does, in plain terms.

---

## Language

> The ubiquitous vocabulary. One entry per term: what it is and where it shows up
> in the code, then the synonyms to avoid so humans and agents converge on one word.

**[Term]** — [what it is, where it appears in the code].
_Avoid:_ [synonym], [synonym]

**[Term]** — [definition].
_Avoid:_ [synonym]

### Relationships

- A **[Term]** has many **[Term]**
- A **[Term]** belongs to exactly one **[Term]**

### Flagged ambiguities

- **[overloaded word]** — was used for both [X] and [Y]. Resolved: [the decision].

---

## Stack

> Language, framework, package manager, key libraries. Version-pin files.

---

## Where things live

> The handful of directories that matter. Skip the obvious ones.

---

## Deviations from AGENTS.md

> Anything this project does differently from the global conventions, and why.

---

## Landmines

> Parts that look wrong but aren't. Migrations in flight. Known-fragile areas.

---

## How to run it

> Dev server, tests, lint, build — one command each.
