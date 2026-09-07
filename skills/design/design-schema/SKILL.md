---
name: design-schema
description: Design a table or collection before the migration — model the entities and relationships, pick keys and indexes for the real access patterns, decide normalization vs denormalization, name columns to match the domain and the wire layer. Postgres / Mongo / Prisma. Use when adding a feature that needs new storage, when asked to "design the schema / data model", or before writing a migration.
---

# Design a schema

Do this before `deployment/data-migration`. Start from the **access patterns**,
not the entities — how will this data be read and written, how often, by what.

## Work through

1. **Entities & relationships** — what are the nouns, how do they relate (1:1,
   1:N, N:M), what owns what. Draw it.
2. **Keys** — natural vs surrogate. Prefer a surrogate PK (`id`), add unique
   constraints for the natural keys. UUID vs auto-increment: UUID if IDs are
   exposed or generated client-side or across services; sequential otherwise.
3. **Access patterns → indexes** — for each query the feature needs, name the
   `WHERE` / `ORDER BY` / join columns. Composite index column order = equality
   columns first, then range/sort. Don't index speculatively; do index the
   patterns you know.
4. **Normalize by default; denormalize deliberately.** A denormalized/derived
   column is fine when the read path is hot and the write path can keep it
   consistent — say so in a comment. `isNewAccount` doesn't need a column if it's
   `created_at > X`.
5. **Nullability & defaults** — `NULL` means "unknown/absent", not "zero". Every
   non-null column needs a default or a value at insert. Timestamps: store UTC,
   `timestamptz`.
6. **Constraints in the DB** — FKs, `CHECK`, `UNIQUE`, `NOT NULL`. The DB is the
   last line; don't rely only on app validation.
7. **Enums** — a lookup table or a native enum, values matching the domain
   vocabulary and the wire layer (`snake_case` at the wire/DB layer, don't mix).
8. **Mongo** — embed when the sub-doc is always loaded with the parent and bounded
   in size; reference when it's large, unbounded, or queried independently. Set
   the indexes explicitly (`MONGO_AUTO_INDEX=false` in prod).
9. **Growth** — will this table need partitioning / archival / a TTL? Note it now
   even if you don't build it.

## Output

The schema (DDL or Prisma model or Mongo schema), the indexes with the query each
serves, and any denormalization decision with its rationale. Hand to
`deployment/data-migration` to sequence the change.

## Anti-patterns

- ❌ Designing entities without listing the queries first.
- ❌ Indexing every column, or no columns.
- ❌ Denormalizing with no plan to keep the copy consistent.
- ❌ Naming that doesn't match the domain language (`CONTEXT.md` glossary).
- ❌ Validation only in the app, none in the schema.
