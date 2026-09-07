---
name: wide-rename
description: Rename or retype something whose blast radius fans across the whole codebase — a shared column, a widely-imported symbol, an enum value — using expand → migrate in batches → contract, so CI stays green the whole way. Use when a rename touches hundreds of call sites, when asked to "rename X everywhere", or to "change the type of Y".
---

# Wide rename (expand / migrate / contract)

A rename that breaks 1 file is a find-and-replace. A rename that breaks 400 files
across services can't land in one green commit — sequence it.

## The three phases

### 1. Expand — add the new form beside the old

Introduce the new name/type/value. Keep the old one working, delegating to or
aliasing the new. Nothing breaks. One PR, mergeable on its own.

- DB column: add the new column, dual-write, backfill (see
  `deployment/data-migration`).
- Exported symbol: `export const newName = oldName` (or the reverse), deprecate
  the old with a comment.
- Enum/wire value: accept both on read, keep emitting the old on write for now.

### 2. Migrate — move call sites in batches

One PR per batch, sized by blast radius — per package, per directory, per service.
Each PR is green because the old form still exists. Each is blocked only by the
expand PR, so they can go in parallel.

- Give the reviewer the grep that scopes the batch.
- For a cross-service value, coordinate: the SDK/shared package moves first.

### 3. Contract — delete the old form

Once `grep` finds zero callers of the old name, remove it. One PR, blocked by
every migrate batch. For a DB column: stop writing it, then drop it in a later
migration once you're sure nothing reads it.

## If batches can't stay green alone

Share an integration branch; every batch PRs into it; a final "integrate and
verify" PR merges to main. Green is promised only there — say so.

## Anti-patterns

- ❌ One massive PR touching every call site.
- ❌ Deleting the old form before `grep` proves zero callers.
- ❌ Skipping the backfill on a DB rename.
- ❌ Renaming the wire value without asking what downstream reads it.
