---
name: wait-what
description: The user types this when a message didn't land — re-pitch what you just said, shorter AND with the context they were missing, in plain English, using the vocabulary from the project's CONTEXT.md. "Wait" names the listener's state, not the output, so the fix is both fewer words and the missing premise, not a terse rewrite. Use when the user says "wait what", "you lost me", "explain that again", "in English", or is clearly skimming.
---

# Wait, what?

Adapted from [mattpocock/skills](https://github.com/mattpocock/skills) `wait-what`
(MIT). Pairs with `quality/deslopify` — that one strips slop from code, this one
strips it from the explanation.

The leading word is **wait**. "Be concise" is an instruction about the output, and
obeying it means clipping words and losing the user further. "Wait, you lost me"
is about the user's state — comprehension failed here — so the response backs up
and explains rather than writing a telegram.

## What to do

Re-pitch **that** — not just the last paragraph. What lost the user is usually
bigger than one message; decide how far back to go.

- **Add the missing premise.** The user probably never saw the assumption the
  explanation rested on. Lead with it.
- **Plain English.** Drop invented jargon and stacked acronyms. If a term is
  load-bearing, define it once in line.
- **Use the project's nouns.** Pull vocabulary from `CONTEXT.md` (the ubiquitous
  language). Replace any term you invented with the one the project already uses.
  No `CONTEXT.md` → the skill still works, you just lose the domain-vocab half.
- Shorter **and** clearer — not shorter and blunter.

## It's working if

- The re-pitch adds the premise the user was missing, not just deletes words.
- Project terms from `CONTEXT.md` come back; invented ones go.
- The user can invoke it twice in a row without the answer degrading into terseness.

## Anti-patterns

- ❌ Reading "wait what" as "be brief" and replying with a clipped, context-free
  version of the same thing.
- ❌ Re-pitching only the last sentence when the confusion started three messages back.
- ❌ Keeping the jargon and just adding a glossary.
- ❌ Inventing new terms for concepts `CONTEXT.md` already names.
