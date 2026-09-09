---
name: code-migration
description: Cut over from an old implementation, API version, or service to a new one without downtime — dual-run behind a feature flag, ramp traffic gradually, fall back on error, keep a kill switch, then remove the old path once the new one is proven. Use when asked to "migrate to the new X", "cut over the API", "replace the old service", "roll out behind a flag", or "deprecate the old endpoint".
---

# Code migration (flagged cutover)

Swapping a live code path — a rewritten service, a new provider, a `v2` API, a
different algorithm. Never a hard switch. Pairs with
`deployment/data-migration` (schema moves first, additively) and
`planning/phased-delivery` (each stage is a
phase with a checkable gate and a rollback point).

## The stages

### 1. Build the new path, dark

New implementation lands fully but **nothing routes to it**. It compiles, has
tests, is deployed. Old path unchanged.

### 2. Add the switch

A **feature flag** decides old vs new, per call. The flag is:

- **Runtime-changeable** — no deploy to flip it (config service / LaunchDarkly /
  a DB row / an env var read per request, not per boot).
- **Scoped** — global %, or per-tenant / per-user / per-route, matching the blast
  radius you want to control.
- **Defaulted off.**

### 3. Shadow / dual-run (optional, for risky swaps)

Run **both** paths, serve the **old** result, compare the two async, log
divergences. Do not let the new path's errors or latency affect the response.
Ramp to step 4 only when divergence is understood (some divergence is the new path
being *more* correct — decide, don't just match).

### 4. Ramp

Flip the flag on for a small slice → watch → widen. `1% → 10% → 50% → 100%`, hours
to days apart depending on risk. At each step check: error rate, latency (p50/p99),
the business metric the change was supposed to move, and downstream (queues, DB
load).

### 5. Fallback & kill switch

- **Per-call fallback**: if the new path throws or times out, catch it, fall back
  to the old path (if still present), and count it. A rising fallback rate is a
  stop signal.
- **Kill switch**: one flag flip returns 100% to the old path, instantly, no
  deploy. Know who can flip it and how.
- Alert on: new-path error rate, fallback rate, divergence rate.

### 6. Contract — remove the old path

Only after the new path has held at 100% for a agreed soak (days/weeks). Then, in
separate PRs: delete the old implementation, delete the flag, delete the fallback,
delete the comparison code. `grep` proves the old path has no callers
(`quality/dead-code-sweep`).

## API version cutover specifics

- `v1` and `v2` run side by side; `v2` is additive, `v1` untouched.
- Migrate consumers off `v1` (their PRs, blocked on `v2` shipping) — you don't get
  to change `v1`'s contract (the review rule: *"we cant change the contract on the
  old apis"*).
- Deprecate `v1` with a sunset date + a `Deprecation` / `Sunset` header, tell every
  known consumer, then remove it once traffic is zero.
- New public routes go in the RBAC / gateway allowlist in **all** envs before the
  ramp.

## Anti-patterns

- ❌ A hard switch with no flag ("we'll just deploy it").
- ❌ A flag that needs a deploy to flip — that's not a kill switch.
- ❌ Ramping to 100% in one jump.
- ❌ New path's errors/latency leaking into responses during shadow mode.
- ❌ Removing the old path (or the fallback) before the soak.
- ❌ Changing the old API's contract instead of building a new version.
- ❌ Leaving the flag and comparison scaffolding in forever after cutover.
