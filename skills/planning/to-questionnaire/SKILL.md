---
name: to-questionnaire
description: Turn a decision you can't settle yourself into a Markdown questionnaire for the one person who holds the missing knowledge — a client, a domain expert, the exec who owns the business rules. Grills you only about the send (who it's going to, what you need back), never the subject, then drafts questions aimed at the gap. Use when a `grill` session stalls on something that isn't yours to answer, or the user says "send this to the client / to X", "I need answers from someone else".
---

# To questionnaire

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `to-questionnaire`
(MIT). Companion to `planning/grill`: grilling mines the user's own head, this
mines someone else's.

Run it in the **same conversation** as the grilling session that stalled — the
open questions are already in context. Started fresh, it knows nothing about the
subject and the user has to re-supply it.

## Interview — two questions, then stop

1. **Who is it going to?** Role, expertise, relationship to the user. Fixes tone
   and how much context the document carries — an outside client needs orienting,
   a teammate doesn't.
2. **What do you need back?** The concrete decisions or facts the user can't
   resolve alone. This is the checklist the finished document is measured against:
   every item named gets a question aimed at it.

Do **not** interview the user about the subject. Not knowing the subject is the
whole reason for writing to someone else.

## The document — `to-questionnaire-<slug>.md` in the working directory

Framed as a **discovery questionnaire** (the user lacks the context, the recipient
holds it):

- Purpose line naming the decision riding on it, then a short context section for
  a recipient who was never in the user's head.
- Questions ordered **most-important-first**, grouped under themed headings — async
  means one pass may be all you get.
- **One idea per question**, never compound. An answer stub beneath each. A *why
  this matters* line only where a question could be misread.
- Explicit permission to answer "I don't know" — a flagged uncertainty is useful,
  a confident guess that reads like a fact is not.
- Closing catch-all: "anything we didn't ask that we should know?"

Not branching (flat grouped list, not a tree). Not multi-recipient — one run, one
document, one person. If three people hold three parts, run it three times.

## After

The answers come back as raw material — feed them into the next `planning/grill`
round, or into `planning/write-prd` if the work is heading for a build.

## Anti-patterns

- ❌ Asking the user a question about the subject itself — the skill is off the rails.
- ❌ Compound questions, or questions the recipient can't answer without the
  user's context.
- ❌ Copying the user's open questions down verbatim instead of re-aiming them at
  what the recipient knows.
- ❌ One document trying to serve several recipients.
- ❌ Starting it in a fresh session with no grilling context to draw on.
