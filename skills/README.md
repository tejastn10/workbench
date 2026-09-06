# skills

Agent skills, organized by category. Each skill is a self-contained Markdown
file that assumes the conventions in [`../AGENTS.md`](../AGENTS.md).

| Category         | Purpose                                                  | Status  |
| ---------------- | ------------------------------------------------------- | ------- |
| `pr-review/`     | PR review by stack (see below)                          | ready   |
| `docs/`          | Doc generation — PRD, ADR                               | ready   |
| `planning/`      | Phased delivery of multi-session work                   | ready   |
| `scaffolding/`   | Service and module bootstrapping                        | ready   |
| `release/`       | Changelog and release-notes routines                   | ready   |
| `debugging/`     | Investigation flows and incident write-ups             | ready   |
| `quality/`       | Post-writing cleanup (deslopify)                        | ready   |

## pr-review

Distilled from a corpus of ~120 real review comments (NestJS/TS backend), then
carried onto the other stacks. `nestjs-backend-pr-review.md` is the canonical
reference for voice, severity markers, and review structure; the others point back
to its §4–§5 and add a stack-specific checklist.

| Skill                            | Stack                        | Priority order    |
| -------------------------------- | ---------------------------- | ----------------- |
| `nestjs-backend-pr-review.md`    | NestJS / TypeScript, Go SDK  | reuse-first       |
| `go-backend-pr-review.md`        | Go services, CLIs, consumers | correctness-first |
| `python-backend-pr-review.md`    | Python / Poetry, FastAPI     | reuse-first       |
| `react-frontend-pr-review.md`    | React / Next.js / Vite       | reuse-first       |
| `devops-pr-review.md`            | GitHub Actions, Docker, CI   | safety-first      |

## docs

| Skill          | Produces                      | Template   |
| -------------- | ---------------------------- | ---------- |
| `write-prd.md` | Product requirements document | `PRD.md`   |
| `write-adr.md` | Architecture decision record  | `ADR.md`   |

## planning

| Skill                | Use for                                                       |
| -------------------- | ---------------------------------------------------------- |
| `phased-delivery.md` | Split multi-session work into vertical phases with non-goals, checkable done-definitions, and tag/merge boundaries |

## scaffolding

| Skill                       | Use for                                          |
| --------------------------- | ----------------------------------------------- |
| `scaffold-project.md`       | New repo / service — pick a template, apply the baseline |
| `scaffold-nestjs-module.md` | New feature module in an existing Nest service   |

## release

| Skill            | Use for                                                     |
| ---------------- | --------------------------------------------------------- |
| `cut-release.md` | Next semver from commits, grouped release notes, tag      |

## debugging

| Skill                      | Use for                                            |
| -------------------------- | ------------------------------------------------- |
| `investigate-bug.md`       | Reproduce → isolate → hypothesis → trace → fix    |
| `write-incident-report.md` | Blameless postmortem (template `POSTMORTEM.md`)   |

## quality

| Skill          | Use for                                                       |
| -------------- | ---------------------------------------------------------- |
| `deslopify.md` | Strip AI slop from freshly written code — subtractive only, run before commit |

## Installing a skill

**Claude Code**

```bash
mkdir -p .claude/skills/pr-review-python
cp ~/workbench/skills/pr-review/python-backend-pr-review.md \
   .claude/skills/pr-review-python/SKILL.md
```

**VS Code agents / Codex** — reference the skill path from the agent's
instructions file, or paste it as context for a one-off.
