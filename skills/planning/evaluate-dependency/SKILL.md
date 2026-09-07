---
name: evaluate-dependency
description: Decide whether to add a library before adding it — API surface via Context7, architecture via DeepWiki, maintenance and CVE check, transitive cost, alternatives. Output a recommendation, and an ADR if it's load-bearing. Use when asked "should we use X", "what's the best library for Y", "is X maintained", or before a PR that adds a dependency.
---

# Evaluate a dependency

The `pr-review` bias is toward *fewer* abstractions and *fewer* dependencies. This
is the gate before one gets added.

## Checks

1. **Does something already cover it?** An existing dependency, a stdlib function
   (`Intl` vs a date lib, `crypto` vs a hashing lib), a helper already in the repo.
   If yes, stop here.
2. **API surface** — pull the docs via Context7 (`resolve-library-id` →
   `get-library-docs`, version-pinned). Is the API small and stable, or sprawling?
   Will you use 5% of it?
3. **Architecture** — for anything non-trivial, read the DeepWiki structure. How
   is it built, what does it pull in, does it fit your runtime (edge / Node / Go
   version)?
4. **Maintenance** — last release date, release cadence, open-issue and open-CVE
   count, single-maintainer risk, funding. `npm view <pkg> time`, `go list -m -u`,
   the repo's pulse.
5. **Transitive cost** — `npm ls <pkg>` / `go mod graph` after a trial install.
   How many packages, how much install weight, any duplicate-of-what-you-have.
6. **Bundle cost** (frontend) — does it tree-shake, what's the min+gzip, is it
   behind `next/dynamic` if it's heavy and client-only.
7. **Licence** — compatible with MIT.
8. **Exit cost** — if it's wrong in a year, how hard to remove? A thin wrapper at
   the boundary keeps that cheap.

## Output

- **Recommendation** — adopt / adopt-with-wrapper / build-it / do-nothing, one
  line of why.
- **Alternatives considered** — the 1–2 others, why they lost.
- If the choice is load-bearing (a framework, a datastore client, an auth lib):
  write an ADR (`planning/write-adr`).

## Anti-patterns

- ❌ Adopting because it has the most GitHub stars.
- ❌ Pulling a whole library for one function.
- ❌ Skipping the "does something already cover it" check.
- ❌ No wrapper at the boundary for a dependency you're not sure about.
