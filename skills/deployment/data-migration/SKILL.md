---
name: data-migration
description: Migrate a live database safely — additive schema changes first, backfill in batches with no long locks, expand/contract for anything that isn't purely additive, reversible, and decoupled from the code deploy. Postgres / Prisma / Mongo. Use when asked to "add a column / table / index", "write a migration", "change the schema", "backfill X", or "move this data".
---

# Data migration

Pairs with `deployment/code-migration` — the schema moves first and
additively, the code cutover comes after.

The rule: a migration must be safe to run **while the old code is still serving
traffic**, and the new code must be safe to run **against the old schema**. Deploy
and migrate are separate steps.

## Expand / contract for anything not purely additive

| Change | Safe sequence |
| --- | --- |
| Add nullable column | one step — add it |
| Add non-null column | add nullable → backfill → set default / not-null in a later migration |
| Rename column | add new → dual-write in code → backfill → switch reads → drop old (later) — see `quality/wide-rename` |
| Change column type | add new column of new type → backfill → switch → drop |
| Drop column | stop writing (deploy) → drop (next migration), once nothing reads it |
| Add index | `CREATE INDEX CONCURRENTLY` (Postgres) — never a plain `CREATE INDEX` on a big table, it locks writes |
| Add NOT NULL / CHECK / FK | add as `NOT VALID` → `VALIDATE CONSTRAINT` separately (Postgres) |

## Backfill

- **In batches** with a bounded loop (`WHERE id BETWEEN … LIMIT n`), commit per
  batch, sleep between. Never one `UPDATE` over millions of rows — it locks and
  bloats the WAL.
- Idempotent and resumable — safe to re-run after a failure mid-way.
- A separate script/job, not inside the DDL migration.

## Rules

- **Reversible** — write the `down`, or explicitly note "irreversible, forward-fix
  only" and why.
- **No `@Transaction` / long transaction across a paginated loop** — it pins a
  pool connection and holds locks (a real flag in the review corpus).
- **Test on a prod-sized copy** for timing if the table is large.
- **Mongo** — same spirit: additive fields are free; a field rename or type change
  needs dual-read in code + a batched backfill; `MONGO_AUTO_INDEX=false` in prod so
  index builds are deliberate.
- Commit `feat(db): <change>` or `chore(db): …`; keep the migration and any code
  that depends on it in a sequence the deploy can follow.

## Anti-patterns

- ❌ Add-non-null-with-default in one step on a large table (rewrites every row).
- ❌ Plain `CREATE INDEX` on a hot table.
- ❌ One unbounded `UPDATE` backfill.
- ❌ Dropping a column in the same deploy that stops writing it.
- ❌ No `down` and no note saying why.
