---
name: diagram
description: Turn an English description (or Mermaid source) into a diagram you can keep editing — the `.mmd` source, crisp SVG and PNG rendered with the Mermaid CLI, and an editable `.excalidraw` scene. Never a dead picture; the source is the single source of truth. Use when asked to "make a diagram", "draw the architecture", "create a flowchart", "diagram this", "sequence diagram of X", or "visualize this flow" for a doc, README, PR or slide.
---

# Diagram

Adapted from [garrytan/gstack](https://github.com/garrytan/gstack) `diagram` (MIT,
© 2026 Garry Tan), upstream `225a210`. Upstream renders through gstack's own bundle,
`gstack-render` and Bun. Here, SVG and PNG come from the pinned Mermaid CLI, and the
`.excalidraw` comes from gstack when it's installed, otherwise from excalidraw.com's
Mermaid import.

This is for static figures that go in docs. For a diagram someone learns from step
by step, use `study/flow-diagram`. For an idea shown as a working machine, use
`visual/anatomy`.

## 1. Author the Mermaid

- **Flowcharts** (`flowchart LR` for pipelines, `TD` for hierarchies) and **sequence
  diagrams** convert into excalidraw scenes you can edit box by box. State, class,
  gantt and the other types render fine to SVG and PNG, but arrive in excalidraw as
  one image. Say so when you deliver one.
- Short node labels; detail goes in edge labels. 5–15 nodes is the readable range.
  More → split it into several diagrams and say why.
- If it describes code, read the code first. Boxes name real modules, queues and tables.

Output dir: `./diagrams/` in a git repo (the user can commit them), else a scratch
dir. `<slug>` is kebab-case, ≤40 chars, from the subject.

## 2. Render SVG + PNG

Write `<outdir>/<slug>.mmd` first, then:

```bash
npx -y @mermaid-js/mermaid-cli@12.0.0 -i <outdir>/<slug>.mmd -o <outdir>/<slug>.svg -q
npx -y @mermaid-js/mermaid-cli@12.0.0 -i <outdir>/<slug>.mmd -o <outdir>/<slug>.png -s 3 -q
```

- `-s 3` renders the PNG at 3× scale, sharp enough for slides and READMEs. There is
  no width flag in v12.
- A parse error prints the failing line. Fix the `.mmd` and re-run. Never hand over
  a source file that doesn't parse.
- If the CLI can't find a browser, write `{"executablePath": "<path to Chrome>"}`
  to a scratch `puppeteer.json` and add `-p puppeteer.json`. Don't swap in a
  different renderer.

## 3. The `.excalidraw`

- **gstack installed** (`~/.claude/skills/gstack/bin/gstack-render.ts` exists): use
  its `diagram` skill's render step. It writes `<slug>.excalidraw` offline.
- **Otherwise:** tell the user to open excalidraw.com → the toolbar's extra tools
  → **Mermaid to Excalidraw**, paste the `.mmd`, insert it, then *Save to* →
  `<outdir>/<slug>.excalidraw`. Same editability rules as step 1.

## 4. Deliver

1. Read the PNG so the user sees it inline.
2. List the files.
3. Changes: edit the `.mmd` and re-render. The source wins over hand-edited SVG.
4. Going into Markdown that renders Mermaid (GitHub, most doc sites): embed the
   ` ```mermaid ` fence instead of the PNG, so it stays diffable.

## Anti-patterns

- ❌ Delivering a `.mmd` you never rendered. If rendering is impossible, say so and stop.
- ❌ 30 boxes in one diagram.
- ❌ Hand-editing the SVG — the next render loses it.
- ❌ An unpinned `npx @mermaid-js/mermaid-cli`.
- ❌ Boxes for things the code doesn't have.
