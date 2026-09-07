---
name: scaffold-project
description: Bootstrap a new repo or service the way Tejas's existing repos are set up — pick the closest existing template, then apply the standard baseline (house-style README, MIT LICENSE.md, commitlint conventional config, husky commit-msg/pre-commit/pre-push hooks, security-audit workflow, issue/PR templates, .nvmrc / .python-version / go.mod). Use when asked to "start a new service", "scaffold a repo", "set up a new project", or "bootstrap X".
---

# Scaffold a new project

Tejas has starter templates already. **Reuse one — don't hand-roll a new setup.**

## Pick the base template

| New thing                     | Copy from        | Stack baseline                                  |
| ----------------------------- | ---------------- | ---------------------------------------------- |
| NestJS backend service        | `hearth` / `ember` | Nest, versioned modules, Biome, docker-compose |
| React SPA                     | `eden`           | Vite, React 19, TS, Biome, axios helper layer  |
| Next.js app                   | `arbor` / `nimbus` | Next App Router, Tailwind v4, shadcn, Biome    |
| Go CLI                        | `halcyon` / `quill` | cobra, `cmd/`, `tasks/`, `utils/`, install.sh |
| Go service (queue / HTTP)     | `argus`          | Dockerfile multi-stage, docker-image workflow  |
| Python service (FastAPI)      | `papyrus` backend | Poetry, flake8/black/isort, pytest             |
| Python script / bot           | `verve`          | Poetry, `src/` layout, schedule                |
| Turborepo monorepo            | `verdant`        | Turborepo + Nest + Vite                        |

If nothing is close, copy the nearest and note the divergence.

## Standard baseline — every repo gets these

- **README.md** — house style (copy the skeleton from any recent repo):
  centered `logo.svg` block, `# Name <emoji>`, badge row, bold intro + tagline,
  `---` dividers, `## Features 🌟` / `## Getting Started 🚀` / `## Structure 📂` /
  `## License 📜` / `## Acknowledgments 🙌`.
- **LICENSE.md** — MIT, `Copyright (c) <year> Tejas Nikhar`.
- **.commitlintrc.yml** — `extends: ["@commitlint/config-conventional"]`.
- **.husky/** — `commit-msg` (commitlint), `pre-commit` (lint / lint-staged),
  `pre-push` (branch name must match `^(feature|bugfix|improvement)/.+`, `main`
  allowed).
- **.github/workflows/security-audit.yml** — per stack: `npm audit --audit-level=low`
  (JS), `gosec` + `govulncheck` (Go), `safety` (Python). PR-triggered with
  `types: [edited, opened, synchronize]`.
- **.github/workflows/{lint,unit-test}.yml** where the stack has them (Go: golangci-lint
  pinned + `go test ./... -v`; JS: `biome check`; Python: `poetry run pytest`).
- **.github/ISSUE_TEMPLATE/{bug_report,feature_request}.md** and
  **.github/pull_request_template.md**.
- **.gitignore** — macOS + the stack's noise.
- Version pin file: **.nvmrc** (Node ≥ 22), **.python-version**, or Go version in
  **go.mod** (workflows use `go-version-file: go.mod`).
- **biome.json** for any TS/JS repo (tab indent, width 100, double quotes, `es5`
  trailing commas, `useImportType`/`useExportType` error, `noUnusedVariables`
  error).
- **Dockerfile** (multi-stage, non-root runtime, manifest copied before source) and
  **docker-compose.yml** for local infra where the service needs it.

## Process

1. Confirm stack + name with the user if not given. Names are short, single words
   (their repos: halcyon, ember, arbor…). Ask for the emoji + one-line description.
2. Copy the base template's config files; strip its domain code.
3. Apply the baseline checklist above; fill README from the house skeleton.
4. First commit: `chore: initialize project` (or `feat: initialize <name>`) as the
   configured git user — never co-author.
5. Branch convention: `feature/<name>`, `bugfix/<name>`, `improvement/<name>`.

## Anti-patterns

- ❌ Writing a fresh tool/lint/CI setup when a template already encodes it.
- ❌ A README that isn't the house style.
- ❌ Skipping the husky hooks or commitlint config.
- ❌ Committing `.env` with real values (placeholders only, and say so).
