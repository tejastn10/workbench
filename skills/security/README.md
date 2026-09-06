# skills/security

A deliberate security pass, on top of the inline checks in `pr-review/`.

| Skill                    | Use for                                                     |
| ------------------------ | -------------------------------------------------------- |
| `security-review.md`     | Whole-surface review — deps, secrets leakage, races, authz, injection, SSRF |
| `audit-dependencies.md`  | Run the per-stack audit, triage by reachability, update packages safely |

Per-stack audit tooling (from the repos' `security-audit.yml` workflows):
`npm audit --audit-level=low`, `gosec` + `govulncheck`, `safety` / `pip-audit`.

The `pr-review/` skills already flag PII in logs, `NEXT_PUBLIC_` secret leaks, and
`pull_request_target` misuse inline — run those on the diff, this on the surface.
