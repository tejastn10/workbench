---
name: dissect-paper
description: Take a research paper apart section by section until it's understood — Keshav's three passes, the paper's history (the prior work it builds on and the work that followed, resolved through arXiv and Semantic Scholar, never invented), every symbol defined, every equation built intuition-first with a worked number, key figures redrawn as interactive widgets, and an honest critique. Produces one interactive HTML explainer. Use when the user shares an arXiv link, a PDF or a paper title and says "help me understand this paper", "explain this paper", "dissect / break down / walk me through this paper", "what's the history behind X", or "read this paper with me".
---

# Dissect a paper

The three passes are S. Keshav's, from "How to Read a Paper" (*ACM SIGCOMM CCR*, 2007).
Reading the TeX source instead of the PDF comes from
[karpathy/nanochat](https://github.com/karpathy/nanochat) `read-arxiv-paper` (MIT,
© 2025 Andrej Karpathy). The single illustrated report page comes from
[a1henu/paper-reading-skill](https://github.com/a1henu/paper-reading-skill) (MIT).

The goal: the reader could explain the paper to a colleague and say where it's weak,
without reopening the PDF.

## 0. Get the source

- **arXiv:** fetch the TeX source at `https://arxiv.org/src/<id>` (a tarball), unpack
  it to a scratch folder, find the entrypoint (`\documentclass`) and follow the
  `\input` files. Equations and figure captions survive intact, and PDF text
  extraction mangles both. Fall back to the PDF only when there's no source.
- **Metadata and graph:** `https://api.semanticscholar.org/graph/v1/paper/arXiv:<id>?fields=title,year,authors,venue,citationCount,tldr,references.title,references.year,references.externalIds,references.isInfluential`
  (`DOI:<doi>` for others). Citations come from `/paper/<id>/citations` the same way.
- **Code:** the paper's own repo link, then the GitHub repo search.
- Ask **one** question first: the reader's background with this field. It sets how
  much the history and math sections explain.

## 1. Pass one — the bird's-eye view

Read the title, the abstract, the intro, the section headings, the conclusion, and
glance at the references. Report Keshav's five Cs in five lines before going deeper:
**Category** (what kind of paper), **Context** (which papers it stands on),
**Correctness** (do the assumptions look valid), **Contributions**, **Clarity**.
Then stop briefly; the reader may only need this.

## 2. History — how we got here

- **The problem's timeline:** 4–8 dated milestones leading to this paper, each with
  one line on what it solved and what it left open, ending with the gap this
  paper fills.
- **Load-bearing references:** the 3–6 works cited in the *method* section or
  flagged `isInfluential`, not the related-work dump. For each one: what this paper
  borrows, and what it changes.
- **What came after:** the most-cited and influential follow-ups, and whether they
  extend the paper, refute it or replace it.
- Every reference is resolved to a real link (arXiv, DOI, S2). A claim you can't
  trace to a fetched source is labelled as your inference, or dropped.

## 3. Pass two — section by section

For each section, in the paper's order:

- **The question it answers**, in one line, and the claim it makes.
- **Plain English** — the paragraph a smart outsider would understand.
- **Symbols table** — every symbol: meaning, shape or units, where it first appears.
- **Equations, intuition first:** what the equation needs to achieve → the
  equation → each term labelled → a tiny worked example with real numbers.
- **Evidence** — which experiment or figure supports the claim, and how strongly.
- **Redraw the key figures** as widgets driven by the paper's own equations: a
  slider for the hyperparameter, a toggle for the ablation. The original figure sits
  beside the redraw, with its number cited.

## 4. Pass three — rebuild it

- **Re-implement it in your head:** the method as pseudocode, or a toy that runs in
  the page (JS, small dimensions), so the reader can step through it.
- **Hidden assumptions** — what has to be true for this to work, stated or not.
- **Critique:** missing baselines or ablations, metric choice, dataset leakage, what
  compute it needs, which limitations the authors admit and which they don't.
- **Reproduce it:** links to the code, data and checkpoints, and the commands quoted
  from the README. Don't run the paper's code for a reading request.

## The output page

One self-contained `<paper-slug>.html`: CSS and JS inline, KaTeX
(`katex@0.19.0`) and Mermaid (`mermaid@12.1.0`) from a pinned CDN, light and dark
themes, readable on a phone. Layout: a metadata bar (authors, venue, year, links) →
the five Cs → a history timeline you can click → a section-by-section walk with a
sticky table of contents → interactive figures → the rebuild → critique → glossary.
Put heavy derivations in collapsible blocks so the main thread reads straight
through. When the host can publish a page (Claude Code's Artifact tool), publish it
and give the link.

End by offering `study/feynman-check` on the paper's core contribution.

## Anti-patterns

- ❌ Summarising the abstract back and calling it an explanation.
- ❌ Citing a paper you didn't resolve to a real link. A hallucinated reference is worse than none.
- ❌ An equation shown without each term defined and a worked number.
- ❌ Decorative figures that aren't tied to the paper's equations or results.
- ❌ Skipping the critique because the paper is famous.
- ❌ Parsing the PDF when the TeX source is on arXiv.
- ❌ Listing all 80 references instead of the load-bearing few.
