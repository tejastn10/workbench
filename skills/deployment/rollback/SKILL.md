---
name: rollback
description: Get production back to a known-good state fast and safely — flip the flag or redeploy the previous artifact, deal with migrations that can't be un-run, verify recovery, then follow up with a postmortem. Use when a deploy has caused an incident, when asked to "roll back" / "revert prod", or when the rollback trigger from a deploy fires.
---

# Roll back

Speed matters, but a careless rollback can make it worse (especially with
migrations). Have the plan from `deployment/deploy-service`; this executes it.

## Decide the mechanism (fastest safe option first)

1. **Feature flag off** — if the change was flagged, one flip returns to the old
   path instantly, no deploy. This is why risky changes get flags.
2. **Redeploy the previous artifact** — the last known-good image/tag. Fast,
   clean, *if* there's no incompatible schema change.
3. **Revert commit + deploy** — `git revert` the merge, ship it. Slower (full
   pipeline) but sometimes the only option.

## The migration problem

- **Additive migration** (new nullable column, new table) — safe to leave; the old
  code ignores it. Roll back code only.
- **Destructive / transforming migration already run** — you usually **cannot**
  roll the schema back without data loss. Options: roll forward with a fix
  instead; or restore from backup (last resort, has its own data-loss window).
- This is why migrations are additive and decoupled from the deploy — so a code
  rollback doesn't need a schema rollback.

## Execute

1. Announce it (incident channel): what, why, ETA.
2. Do the rollback.
3. **Verify recovery** — the error rate / latency / the affected metric returns to
   baseline. Not just "the deploy finished".
4. Confirm no new problem introduced (e.g. old code + new data).
5. Hold the fixed version out of prod until the root cause is understood — don't
   immediately redeploy forward.

## After

- Timeline the incident while it's fresh → `incident/postmortem`.
- The bad change gets a real fix + a test before it ships again.

## Anti-patterns

- ❌ Rolling back code while a destructive migration stays applied (old code, new
  schema → new breakage).
- ❌ `git revert` + full pipeline when a flag flip would've been instant.
- ❌ "Recovered" declared because the deploy succeeded, not because the metric
  recovered.
- ❌ Immediately redeploying the fix forward without understanding the cause.
