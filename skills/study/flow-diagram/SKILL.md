---
name: flow-diagram
description: Explain a concept, algorithm, request path or codebase flow as a diagram you step through — pick the one question it answers and the diagram type that fits (flowchart, sequence, state, data-flow), keep it to 5–12 nodes grounded in real code with file:line, then build an interactive HTML page where Next/Prev highlights each step and a side panel narrates what happens there, why, and what can go wrong. Use when the user says "draw me the flow", "how does X flow", "walk me through the request path", "flow diagram of X", "visualise how this works", or a lesson needs a diagram.
---

# Flow diagram

A diagram for *learning*, not for docs. A static picture shows every box at once; a
learner needs to follow one step at a time and know why each step happens. For a
static figure to drop into a README or doc (SVG, PNG, `.excalidraw`), use
`visual/diagram`. For an idea that's better shown as a working machine, use
`visual/anatomy`.

## 1. Decide what it answers

Write the one question first: "What happens between the click and the row in
Postgres?" Then pick the type from what moves through it:

| What you're showing | Type |
|---|---|
| Decisions and branches in one process | `flowchart LR` (pipelines) / `TD` (hierarchies) |
| Messages between actors over time | `sequenceDiagram` |
| A thing's lifecycle (order, job, connection) | `stateDiagram-v2` |
| Data being transformed stage by stage | `flowchart LR`, with the data's shape in the edge labels |

## 2. Ground it

- If it's code, **read it first**. Each node names the real function, queue or table,
  and its panel cites `path:line`. Don't add boxes the code doesn't have.
- 5–12 nodes. More than that → split it into an overview diagram plus a zoomed
  diagram per hop, linked from the overview's node.
- Short node labels. The detail goes on the edges ("JWT in header", "batch of 100")
  and in the panel.
- Show the **unhappy path** too: the retry, the DLQ, the 401. Draw it as a second
  route the reader can switch on.

## 3. Write the steps

An ordered list, one entry per step, each with:

- `target` — the node or edge id it highlights.
- **What happens** — one or two sentences.
- **Why** — the reason the system is built this way.
- **What can go wrong** — the failure mode at this hop, if there is one.
- `ref` — `path:line` or the source of the claim.

## 4. Build the page

A single self-contained `.html` file (CSS and JS inline). Keep the Mermaid source
beside it as `<slug>.mmd`.

- Render the diagram with `mermaid@12.1.0` from a pinned CDN. After it renders, find
  the node and edge elements by id and toggle a `.active` class. Don't redraw the
  diagram per step.
- **Stepper:** Prev / Next buttons and ← → keys. The active element is highlighted,
  everything before it is dimmed-but-visible, and everything after it is faint.
- **Panel** beside the diagram (below it on phones) shows the step's what / why /
  what-can-go-wrong / ref.
- **Path toggle** for the unhappy path; **click any node** to jump to its step.
- Light and dark themes from CSS variables. Respect `prefers-reduced-motion`
  (no transitions on highlights).

When the host can publish a page (Claude Code's Artifact tool), publish it and give
the link. Inside a `study/head-first` or `study/dissect-paper` page, embed the same
stepper instead of writing a separate file.

## Anti-patterns

- ❌ A diagram of everything — 30 boxes and no question.
- ❌ Nodes invented for symmetry that don't exist in the code.
- ❌ Labels that only say "process" or "handle" — name the mechanism.
- ❌ Only the happy path.
- ❌ All the explanation in a paragraph under the diagram instead of per step.
- ❌ Re-rendering the whole diagram on every step (flicker, lost zoom).
