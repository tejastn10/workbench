# External skills

Matt Pocock's [`mattpocock/skills`](https://github.com/mattpocock/skills) (MIT) is
a ~30-skill set for "real engineering, not vibe coding". Two ways to use it here:

1. **Adapted copies** of a few, living in `../skills/` — trimmed, self-contained,
   pointed at this repo's conventions. Listed below.
2. **The rest, installed from upstream** — they update as Matt ships and are
   designed to be subscribed to, not forked.

## Adapted into this repo

| This repo                             | From Matt's             | Notes                                    |
| ------------------------------------- | ----------------------- | -------------------------------------- |
| `planning/grill`            | `grill-me` + `grilling`  | self-contained; hands to phased-delivery / write-prd |
| `planning/orient`           | `wayfinder` (spirit)     | adds the `CONTEXT.md` output            |
| `planning/spike`            | `prototype`              | timeboxed, delete-after, write-up rule  |
| `planning/handoff`          | `handoff`                | self-contained                          |
| `planning/to-questionnaire` | `to-questionnaire`       | self-contained; runs after a stalled `grill` |
| `quality/wait-what`         | `wait-what`              | self-contained; leans on `CONTEXT.md` vocab |
| `quality/tdd`               | `tdd`                    | inlined the `tests.md` / `mocking.md` refs |
| `quality/resolve-merge-conflicts` | `resolving-merge-conflicts` | lockfile-regeneration specifics    |
| `meta/write-skill`          | `writing-for-agents` (spirit) | this repo's frontmatter + house style |
| `study/head-first`          | `teach` (workspace only)  | the Head First lesson shape is ours; keeps `MISSION.md` + `lessons/` + `progress.md` |

Every adapted skill starts a body line with `Adapted from [mattpocock/skills]`.
Re-check against upstream a couple of times a year.

## Install from upstream

```bash
# Claude Code — managed plugin, auto-updates
claude plugins install mattpocock-skills
#   then, once per repo:
/setup-matt-pocock-skills

# any agent — editable copies via the skills CLI
npx skills@latest add mattpocock/skills
```

**Worth taking** (gaps our set doesn't cover):

| Skill | Why |
| --- | --- |
| `grill-with-docs` | grilling that also drafts `CONTEXT.md` + ADRs as it goes — richer than our `grill` + `write-adr` |
| `domain-modeling` | builds the ubiquitous-language glossary our `CONTEXT.md` wants |
| `to-tickets` / `to-spec` / `triage` | turning a goal into tracked, triaged, blocking-edge work (needs `/setup-matt-pocock-skills`) |
| `teach` | stateful multi-session teaching workspace (`MISSION.md`, `RESOURCES.md`, `lessons/*.html`). Its workspace idea is adapted into `study/head-first`; install upstream for its fuller record-keeping |

**Skip — we have our own, grounded version:**

| Matt's | Ours |
| --- | --- |
| `code-review` | `skills/pr-review/*` (built from a real 120-comment corpus, per stack) |
| `diagnosing-bugs` | `incident/investigate-bug` |
| `improve-codebase-architecture` / `codebase-design` | overlaps `skills/quality/` intent |

## `wheresryan22/anatomy`

<https://github.com/wheresryan22/anatomy> (MIT, © 2026 Ryan) — explains a technical
idea by building it as an interactive isometric machine (SVG, WebGL, optional 3D).
**Vendored whole** as [`visual/anatomy`](../skills/visual/anatomy/SKILL.md): unlike
the adapted skills above it isn't trimmed, because its `kit/`, `scripts/` and
example sources are what the skill runs. Built example pages, tests and evals are
left out. Refresh steps: [`skills/visual/README.md`](../skills/visual/README.md).

To use upstream directly instead:

```bash
npx skills add wheresryan22/anatomy -g -a claude-code
```

## `lottiefiles/motion-design-skill`

<https://github.com/lottiefiles/motion-design-skill> (MIT, © 2025 LottieFiles) — motion
design principles for UI animation: personality archetypes, duration and easing
tables, choreography, Disney principles. **Vendored whole** as
[`visual/motion-design`](../skills/visual/motion-design/SKILL.md) (Markdown only).
Refresh steps: [`skills/visual/README.md`](../skills/visual/README.md).

```bash
npx skills add lottiefiles/motion-design-skill     # upstream directly instead
```

## `garrytan/gstack` — `diagram`

<https://github.com/garrytan/gstack> (MIT, © 2026 Garry Tan) — English or Mermaid in,
a `.mmd` + SVG + PNG + editable `.excalidraw` out. **Adapted** as
[`visual/diagram`](../skills/visual/diagram/SKILL.md): upstream renders through
gstack's own bundle and `gstack-render`, so ours uses the pinned Mermaid CLI and only
uses gstack for the `.excalidraw` when it's installed. Pinned at upstream `225a210`.

```bash
npx skills add garrytan/gstack --skill diagram     # upstream directly (needs gstack's setup)
```

## Learning skills behind `study/`

| Upstream | License | Used in | What we took |
| --- | --- | --- | --- |
| [haunguyendev/feynman-skill](https://github.com/haunguyendev/feynman-skill) | MIT, © 2026 haunguyendev | `study/feynman-check` | explain / gaps / break modes |
| [Freya0525/supertutor-skill](https://github.com/Freya0525/supertutor-skill) | MIT, © 2026 cskwork | `study/feynman-check` | six-gap rubric, teaching frame, hint ladder |
| [karpathy/nanochat](https://github.com/karpathy/nanochat) `read-arxiv-paper` | MIT, © 2025 Andrej Karpathy | `study/dissect-paper` | read the arXiv TeX source, not the PDF |
| [a1henu/paper-reading-skill](https://github.com/a1henu/paper-reading-skill) | MIT | `study/dissect-paper` | one self-contained illustrated report per paper |

Ideas only, rewritten in the house style — no files copied. Not used:
[lyndonkl/claude](https://github.com/lyndonkl/claude) `paper-three-pass-extraction` has
no license; the three-pass method itself comes from Keshav's paper.

## `mattpocock/agent-rules-books`

<https://github.com/mattpocock/agent-rules-books> — `AGENTS.md` rules distilled from
Clean Code, Refactoring, DDD, Clean Architecture, DDIA. Reference material for
`../AGENTS.md`, not a skill install.
