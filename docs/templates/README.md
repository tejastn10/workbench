# templates

Reusable document templates. Copy into a project, don't edit in place.

| Template        | Purpose                        | Filled in by                          |
| --------------- | ------------------------------ | ------------------------------------- |
| `PRD.md`        | Product requirements document  | `planning/write-prd`            |
| `ADR.md`        | Architecture decision record   | `planning/write-adr`            |
| `POSTMORTEM.md` | Blameless incident report      | `incident/postmortem` |

## Conventions

- **Header** as a table.
- One `---` divider between every section.
- Emoji section headers, matching the repo's README house style.
- `[bracketed]` placeholders; italic guidance lines under each heading, deleted as
  the section is written.
- An HTML comment at the top holds the fill-in rules (invisible when rendered).

## Suggested location in a project

```
docs/
├── prd/NNNN-slug.md          ── or ──  docs/prd/<slug>.md
├── adr/NNNN-slug.md
└── incidents/YYYY-MM-DD-slug.md
```
