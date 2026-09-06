# skills/docs

Doc-generation skills. They fill in the templates in
[`../../docs/templates/`](../../docs/templates/) — the templates own the structure,
these skills own the process (what to gather, what to ask, how to phrase).

| Skill           | Produces                          | Template        |
| --------------- | -------------------------------- | --------------- |
| `write-prd.md`  | Product requirements document    | `PRD.md`        |
| `write-adr.md`  | Architecture decision record     | `ADR.md`        |

Incident write-ups: see [`../debugging/write-incident-report.md`](../debugging/write-incident-report.md)
(template `POSTMORTEM.md`).

Common rules: interview for gaps one question at a time, never invent scope /
goals / metrics, mark unknowns as `TBD`, conventional-commit the doc as `docs:`.
