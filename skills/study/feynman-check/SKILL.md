---
name: feynman-check
description: Check whether you really understand something by explaining it back — pin one concept, take a 1–5 confidence reading, explain it from memory as if to a 12-year-old, then get graded against a fixed six-gap rubric (missing causal chain, circular definition, undefined jargon, missing boundary, missing concrete example, broken analogy), one gap and one Socratic question at a time, never the answer up front. Ends with the confidence delta and the one question that would break your understanding. Use when the user says "check my understanding", "let me explain it back", "quiz me on X", "do I actually get this", "feynman this", or at the end of a `study/head-first` lesson or `study/dissect-paper` read.
---

# Feynman check

Adapted from [haunguyendev/feynman-skill](https://github.com/haunguyendev/feynman-skill)
(MIT, © 2026 haunguyendev) — the explain / gaps / break modes — and
[Freya0525/supertutor-skill](https://github.com/Freya0525/supertutor-skill) (MIT,
© 2026 cskwork) — the six-gap rubric, the teaching frame and the hint ladder. The
technique is Richard Feynman's study habit.

Recognising an explanation feels like understanding it. Producing one from memory
shows whether you do. This skill makes the user produce one, then finds the exact
point where it breaks.

## The loop

1. **Pin one concept.** "Which one thing — consistent hashing, not distributed
   systems?" One concept per check.
2. **Teaching frame + confidence.** "Explain it to someone who has never heard of it,
   well enough that they could answer a test question alone. First: 1–5, how sure are
   you that you understand it?" Record the number.
3. **Closed book.** They explain from memory, in plain words. If they paste notes or
   read from the source: "Close it and explain from memory. Reading it back is
   copying."
4. **Grade against the rubric.** Find the **first, most foundational** gap present:

   | Gap | Sign | The one question |
   |---|---|---|
   | Circular definition | Uses the term to define itself | "Explain that without the word *X*." |
   | Undefined jargon | A term standing in for a mechanism | "What does *X* mean in plain words?" |
   | Missing causal chain | Says *what* happens, not *why* | "What makes that happen? Walk me through it in order." |
   | Missing concrete example | Stays abstract | "Give me one real instance you could point to." |
   | Missing boundary | Treats the rule as universal | "Where would this *not* be true?" |
   | Broken analogy | The analogy doesn't predict | "If your analogy holds, what happens when *Y*?" |

   Clear circular definitions and undefined jargon first; they block everything else.
5. **One gap, one question, then wait.** Say what was right first ("the hashing part
   is solid"), then ask the single question.
6. **Hint ladder**, only after a real attempt: point at where to look → teach the
   principle, not the answer → give the answer, then have them restate it.
7. **Two or three passes.** The first pass finds surface gaps; the next finds the
   missing *why*. Stop when they explain it cleanly, with an example and a boundary.

## Close

- **Confidence again** (1–5) and the delta. A drop means they found a real gap, and
  that's progress.
- **Gaps closed / still open**, one line each.
- **The breaking question:** the single hidden assumption their understanding rests
  on, posed as a question. If they can't answer it confidently, they're not ready to
  decide alone on this.
- **Their best explanation,** cleaned up into 2–3 sentences they could repeat.
- Inside a `study/head-first` workspace, append the result to `progress.md`.

If the concept is code in the current repo, read the source before grading. The
rubric grades the thinking against what the code actually does.

## Anti-patterns

- ❌ Explaining the concept before they've tried.
- ❌ Listing every gap at once. One gap per turn.
- ❌ Asking several questions in one message.
- ❌ Interrupting for phrasing — grade the reasoning, not the prose.
- ❌ Letting a jargon word pass because it's "obviously right".
- ❌ Ending without the confidence delta and the breaking question.
