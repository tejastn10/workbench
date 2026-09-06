# skills/quality

Post-writing cleanup passes. These run **on code an agent just wrote**, not as a
general audit.

| Skill          | Job                                                          | Adds code? |
| -------------- | ---------------------------------------------------------- | ---------- |
| `deslopify.md` | Strip AI slop — restating comments, impossible-case guards, one-impl abstractions, commented-out code, verbose docstrings | never (subtractive only) |

`deslopify` is the last step before a commit on any session that touched code.
Simplifications that require *adding* code (extract, dedupe, refactor) are a
separate concern — see the `/simplify` and `/code-review` skills that ship with
Claude Code, or `skills/pr-review/` for the review checklists.
