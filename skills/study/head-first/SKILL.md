---
name: head-first
description: Teach any topic the way the Head First books do — a concrete problem before the theory, pictures with the words in them, a conversational voice, the name of the idea given only after the reader has felt the need for it, and the books' recurring beats (Sharpen your pencil, Brain Power, There are no Dumb Questions, Fireside Chat, Bullet Points) turned into an interactive HTML lesson. Keeps a small workspace so a topic can run over several sessions. Use when the user says "teach me X", "explain X the Head First way", "I want to learn design patterns / Kafka / transformers", "make me a lesson on X", or wants to understand a topic deeply rather than get a summary.
---

# Head First

The method is Kathy Sierra and Bert Bates's, from the Head First series (O'Reilly) —
*Head First Design Patterns* is the reference chapter shape. The multi-session
workspace is adapted from [mattpocock/skills](https://github.com/mattpocock/skills)
`teach` (MIT, © 2026 Matt Pocock). Teach the way the books do; don't copy their
text, art or O'Reilly branding.

The bet the books make: your brain only keeps what it thinks matters. Make it
matter — a problem it cares about, a surprise, a picture — then repeat the idea in
several forms until it sticks.

## Before the first lesson

1. **Ask why** (one question): what they want to do with the topic and what they
   already know. That sets the starting point and the running example.
2. **Workspace** at `./study/<topic-slug>/` (or the folder they name):
   - `MISSION.md` — why they're learning this, their starting level, the goal.
   - `lessons/NN-<slug>.html` — one self-contained lesson per idea.
   - `progress.md` — per lesson: what clicked, what didn't, quiz misses. Read it
     before every new lesson, so the next one starts where they actually are.
3. **Plan 4–8 lessons**, each one idea, foundations first. Show the plan; adjust.

## The shape of every lesson

In this order — it is the book's chapter structure:

1. **The problem.** A small, concrete story about the running example that goes
   wrong (SimUDuck's ducks that all start flying when only some should). The reader
   should feel the pain before you offer any cure.
2. **Brain Power.** A question that makes them predict or design before reading on.
3. **The first try fails.** Show the obvious fix and why it breaks under the next
   change. Learning comes from seeing the wrong answer fail.
4. **The idea emerges.** Build the principle step by step from the failure.
   **Name it last** — "Congratulations, you just invented the Strategy pattern."
5. **The formal version.** The textbook definition, now that it means something.
6. **Fireside Chat.** Two related concepts argue in dialogue (Strategy vs State,
   TCP vs UDP). The difference sticks because they disagree.
7. **There are no Dumb Questions.** 3–5 questions a real learner asks here, answered.
8. **Watch it!** The common mistake or misuse, and how to tell.
9. **Exercises.** Sharpen your pencil, plus one matching or ordering puzzle.
   Every exercise has an answer they can reveal.
10. **Bullet Points.** A summary of 4–7 lines, and one sentence linking to the next lesson.

## Voice and pictures

- Talk to the reader — "you", contractions, a little humour, never condescending.
- **Words go inside the picture**, as labels and callouts on the diagram, never in a
  caption underneath. Every diagram should still teach with the paragraph removed.
- Say the key idea at least three ways: a picture, a story, code or a formula.
- Ground it in real artifacts: real code, real config, real numbers. If the topic is
  in the current repo, read the source and use it as the example.
- Keep each lesson to about 15–25 minutes of reading and doing.

## The lesson page

One self-contained `.html` file per lesson: CSS and JS inline, no build step. Use
libraries only from a CDN, pinned (for example `mermaid@12.1.0`, `katex@0.19.0`).
Use light and dark themes from CSS variables, and make it readable on a phone.

| Beat | Interaction |
|---|---|
| Brain Power | Prompt + a textarea; "show what we think" reveals the answer only after they write |
| Sharpen your pencil | Inputs checked against the answer, or reveal-to-compare |
| Ordering puzzle (Code Magnets) | Drag the lines into order; check button |
| Who Does What? | Match concepts to definitions; wrong pairs shake and stay |
| Fireside Chat | Two-voice dialogue, one speaker per line |
| There are no Dumb Questions | Q&A list |
| Diagram | Stepper or hover states — see `study/flow-diagram` |

When the host can publish a page (Claude Code's Artifact tool), publish each lesson
too, and give the link. A mechanism worth a machine-like figure → `visual/anatomy`.

## After each lesson

- Run `study/feynman-check` on the lesson's core idea. Its gaps go into
  `progress.md` and shape the next lesson.
- Every 2–3 lessons, open with a 3-question warm-up on older material (spaced
  retrieval) before the new problem.

## Anti-patterns

- ❌ Opening with the definition. The name comes after the need.
- ❌ A wall of text with one diagram at the end, captioned underneath.
- ❌ Exercises without answers, or answers the reader sees before attempting.
- ❌ Toy examples unrelated to the learner's mission.
- ❌ Skipping the failed first attempt — it's where the lesson lands.
- ❌ Copying the books' text, characters or O'Reilly branding.
- ❌ One giant lesson covering five ideas.
