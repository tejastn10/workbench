---
name: excalidraw-hld
description: Draw a high-level system design (HLD) as an editable `.excalidraw` scene built only from Tejas's own component sheet — clients, edge, compute, data, messaging and analytics components in dotted cards, tiers left to right, dashed labelled arrows — composed from a small JSON spec, plus the same components as an Excalidraw library for drawing live. Use when asked for an "HLD", "system design diagram", "architecture in excalidraw", "draw the design for X", or to prep or replay a system design interview round.
---

# Excalidraw HLD

The components live in `components.excalidraw`, next to this file. Each one is a
tagged group (`customData.hld`). `scripts/compose.mjs` copies them into a new scene.
It refuses anything that isn't in the sheet, so the diagram always uses the house
components. `references/components.md` says what each one stands for.

For a Mermaid flowchart or sequence diagram in a doc, use `visual/diagram`. For a
step-by-step learning diagram, use `study/flow-diagram`.

## 1. Settle the design first

- Pin the functional requirements, the scale (users, QPS, read:write ratio, data size)
  and the one or two hard constraints before drawing. The picture shows decisions; it
  doesn't make them.
- List the boxes. Map each one to a component name. When nothing fits, relabel the
  closest component (a third-party API → `fcm` relabelled `"Stripe"`) and say so.
  Never invent a shape.
- 6–15 nodes. More than that means a second diagram (a deep dive on one tier), not a
  bigger one.

## 2. Write the spec

`<outdir>/<slug>.json`. `<outdir>` is `./diagrams/` in a repo, else a scratch dir:

```json
{
  "title": "URL shortener",
  "tiers": [
    { "id": "clients", "title": "Clients", "nodes": [{ "id": "web", "use": "web-app" }] },
    { "id": "svc", "title": "Service Tier", "nodes": [{ "id": "api", "use": "service", "label": "<>\nShorten" }] },
    { "title": "Data Tier", "flow": "row", "nodes": [{ "id": "db", "use": "database", "label": "URLs" }] },
    { "under": "svc", "title": "Async", "nodes": [{ "id": "q", "use": "queue" }] }
  ],
  "edges": [{ "from": "clients", "to": "api", "label": "HTTPS" }, { "from": "api", "to": "db", "label": "insert" }]
}
```

- **Tiers run left to right:** Clients → Edge → Service Tier → Data Tier. Async work
  (queues, Kafka, Spark, jobs) goes in a second row, `"under"` the tier that feeds it.
- A tier stacks its nodes top to bottom. `"flow": "row"` lays them side by side.
- Edges bind to a node or a tier `id`. Point an edge at a tier when every node in it
  takes the call.
- **Label every edge** with the verb or protocol (`"POST /urls"`, `"publish"`,
  `"CDC"`). Leave the label off only on an edge where it's obvious, like queue →
  consumer. `"both": true` adds an arrowhead at the start too.
- Name the engine in the label (`"Postgres"`, `"Redis"`) once it's decided.
- Order nodes so arrows don't cross. Put the node a tier calls most at the top.
- `examples/url-shortener.json` is a full spec.

## 3. Compose

```bash
node <skill-dir>/scripts/compose.mjs <outdir>/<slug>.json      # writes <outdir>/<slug>.excalidraw
node <skill-dir>/scripts/compose.mjs --list                   # every component name
```

An unknown component, a duplicate id or an edge to a missing id fails with the reason.
Fix the spec and re-run. Never hand-patch the output JSON.

## 4. Deliver

1. List the `.json` and `.excalidraw`. The spec is the source of truth. Later changes
   go in the spec, then you recompose.
2. To open the diagram: excalidraw.com → *Open*, or the VS Code Excalidraw extension.
   Arrows stay bound to their cards, so dragging a card keeps the diagram connected.
3. In two or three lines, say why each tier exists and name the main trade-off. In an
   interview, that's the part you're graded on.

## Live rounds and editing the sheet

- To draw by hand in an interview, open Excalidraw's library panel, choose
  *Open*, and pick `components.excalidrawlib`. It has the same components, plus the
  patterns and primitives.
- To add or fix a component: edit `components.excalidraw` in Excalidraw. Group the new
  component and tag every element with `customData: { "hld": "<name>" }`. Tag its
  label with `"role": "label"` and its dotted card with `"role": "card"`. Then run
  `node scripts/library.mjs` and add a row to `references/components.md`.

## Anti-patterns

- ❌ Drawing a shape the sheet doesn't have, or hand-editing the scene JSON to sneak one in.
- ❌ Drawing before the requirements and scale are pinned.
- ❌ Unlabelled arrows between tiers.
- ❌ Every box a `service`: a cache, a queue and object storage are different components for a reason.
- ❌ One 25-node diagram instead of an overview plus a deep dive.
- ❌ Shipping the `.excalidraw` without the spec it came from.
