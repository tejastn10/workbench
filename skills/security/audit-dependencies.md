---
name: audit-dependencies
description: Run the dependency audit for a repo's stack, triage the findings by reachability and severity, and update packages safely — lockfile regenerated, changelog noted, tests green. Covers npm audit / npm outdated, govulncheck / gosec / go list -u, pip-audit / poetry show --outdated. Use when asked to "audit dependencies", "update packages", "check for CVEs", "bump the lockfile", or on a schedule.
---

# Audit & update dependencies

## 1. Run the audit

| Stack  | Vulnerabilities                          | Outdated                        |
| ------ | -------------------------------------- | ------------------------------- |
| Node   | `npm audit --audit-level=low`           | `npm outdated`                  |
| Go     | `govulncheck ./...` · `gosec ./...`      | `go list -m -u all`             |
| Python | `pip-audit` · `safety check`             | `poetry show --outdated`        |

Match the tool to what the repo's CI already runs (the `security-audit.yml`
workflows use `npm audit --audit-level=low`, `gosec` + `govulncheck`, `safety`).

## 2. Triage each finding

For every advisory, in order:

1. **Reachable?** `govulncheck` says so directly. For npm/pip, is the vulnerable
   package a runtime dependency or dev/build-only, and is the vulnerable function
   actually called? A critical CVE in an unreachable dev tool is `⚪`, not urgent.
2. **Severity + exploitability** — CVSS, and whether the exploit needs conditions
   this service doesn't have (a public endpoint, a specific input path).
3. **Fix path**:
   - patch available in a compatible range → bump, lowest version that clears it
   - fix only in a major version → separate PR, check the changelog for breaks
   - no fix → is there a maintained fork, a config mitigation, or a way to drop
     the dependency? Otherwise document the accepted risk with an expiry date.

## 3. Update safely

- One concern per PR: security bumps separate from feature-driven bumps.
- Bump the manifest **and** regenerate the lockfile (`npm install`,
  `poetry lock`, `go mod tidy`) — commit both.
- Prefer the **smallest** version jump that clears the advisory over "latest".
- Run the full test suite + typecheck + lint. For a transitive-only bump with no
  behaviour change, say so in the PR.
- Note it: conventional-commit `fix(deps): bump <pkg> to <version> (CVE-…)` or
  `chore(deps): …`; add a `CHANGELOG.md` line if the repo keeps one.
- Toolchain bumps (Go / Node major) → confirm CI matrix, Dockerfile base image,
  and runtime base all move together.

## 4. Verify

- Re-run the audit — the advisory is gone, no new ones introduced.
- CI `security-audit` job is green.

## Anti-patterns

- ❌ `npm audit fix --force` blind — it happily makes breaking major bumps.
- ❌ Bumping to `latest` when a patch release clears it.
- ❌ Manifest bumped, lockfile not regenerated.
- ❌ Mixing a security bump with unrelated dependency churn in one PR.
- ❌ Closing a "no fix available" advisory with no documented decision.
