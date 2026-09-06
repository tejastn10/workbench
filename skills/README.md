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
| `quality/`       | Post-writing cleanup (deslopify, tdd)                   | ready   |
| `security/`      | Security review and dependency audit                    | ready   |

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
| `distill-review-style.md`        | *meta* — build a review skill from your own PR comment corpus | — |

## docs

| Skill          | Produces                      | Template   |
| -------------- | ---------------------------- | ---------- |
| `write-prd.md` | Product requirements document | `PRD.md`   |
| `write-adr.md` | Architecture decision record  | `ADR.md`   |

## planning

| Skill                | Use for                                                       |
| -------------------- | ---------------------------------------------------------- |
| `grill.md`           | Relentless interview to align on a plan before building (adapted from Matt Pocock) |
| `phased-delivery.md` | Split multi-session work into vertical phases with non-goals, checkable done-definitions, and tag/merge boundaries |
| `handoff.md`         | Compact a session into a portable handoff doc (adapted from Matt Pocock) |

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
| `tdd.md`       | Red → green loop that produces tests worth keeping (adapted from Matt Pocock) |

## security

| Skill                   | Use for                                                   |
| ----------------------- | ------------------------------------------------------- |
| `security-review.md`    | Whole-surface pass — deps, secrets, races, authz, injection, SSRF |
| `audit-dependencies.md` | Per-stack audit (`npm audit` / `govulncheck` / `pip-audit`), triage, safe updates |

## Installing skills

```bash
../scripts/install-skills.sh            # symlink all → ~/.claude/skills/<name>/SKILL.md
../scripts/install-skills.sh --list     # what's available
../scripts/install-skills.sh --project /path/to/repo   # copy into a repo's .claude + .github
```

Claude Code and VS Code agent mode both load the `SKILL.md` format. Codex has no
skills dir — reference the path from `AGENTS.md`. Full walkthrough:
[`../docs/USAGE.md`](../docs/USAGE.md).
