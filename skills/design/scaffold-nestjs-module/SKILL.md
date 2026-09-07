---
name: scaffold-nestjs-module
description: Add a new feature module to an existing NestJS service following Tejas's layout — versioned `v1/` folders for controllers/services/dto, module-local `constants.ts`, `.controller.options.ts` for route metadata, entity or schema folder, snake_case at the wire/DB layer. Use when asked to "add a module", "scaffold a new endpoint/resource", or "create the X module" in a Nest service.
---

# Scaffold a NestJS module

Matches the layout in `hearth` / `ember` (and the review conventions in
`pr-review/nestjs-backend-pr-review`).

## Layout

```
src/<module>/
├── <module>.module.ts
├── constants.ts                       # module-local constants — NOT a global file
├── entities/<module>.entity.ts        # (Postgres)   ── or ──
├── schema/<module>.schema.ts          # (Mongo)
└── v1/
    ├── controllers/
    │   ├── <module>.controller.ts
    │   └── <module>.controller.options.ts   # route metadata / swagger options
    ├── dto/
    │   ├── create-<module>.dto.ts
    │   ├── find-<module>.dto.ts
    │   └── update-<module>.dto.ts
    └── services/
        └── <module>.service.ts
```

## Rules

- **Version from day one** — endpoints live under `v1/`. A breaking change becomes
  `v2/`, not an edit.
- **Constants stay in the module folder** (`src/<module>/constants.ts`). Never add
  to a global constants file. If a value is shared cross-service, it belongs in the
  shared SDK, not here.
- **Reuse before creating** — before adding a DTO or response class, check whether
  the entity / schema / an existing repo method already covers it. The Nest review
  bias is toward *deleting* abstractions.
- **snake_case at the wire and DB layer**, camelCase in TS internals. Don't mix
  within a layer.
- **`.controller.options.ts`** holds route decorators' metadata / swagger config so
  the controller file stays thin.
- **DI**: single shared connection modules are `global: true`, not re-imported per
  feature. Avoid new `forwardRef` triads — question the cross-import first.
- **Logging**: `logger.log` not `logger.debug` for anything meant to be seen in
  prod. No manual `[module]` prefixes (Nest adds them).
- **Register the module** in `app.module.ts` (or the parent feature module).
- **Test**: add a `<module>.controller.spec.ts` / `<module>.service.spec.ts` with a
  small table-driven test that also guards the new signature.

## Process

1. Confirm the module name, the persistence layer (Postgres entity vs Mongo
   schema), and the endpoints needed.
2. Generate the folder tree above; wire the module into its parent.
3. Add `constants.ts` even if it starts with one value.
4. Add the spec file.
5. Commit `feat(<module>): scaffold module` on a `feature/<module>` branch.

## Anti-patterns

- ❌ Flat `src/<module>/<module>.controller.ts` with no `v1/`.
- ❌ New DTOs when the entity would serialize directly.
- ❌ Adding to a global `constants.ts`.
- ❌ `logger.debug` on request paths.
- ❌ camelCase leaking into wire/DB payloads.
