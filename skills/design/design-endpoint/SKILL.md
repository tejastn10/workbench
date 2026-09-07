---
name: design-endpoint
description: Design a REST (or RPC) endpoint before implementing — resource and verb, request/response shape, status codes, pagination, filtering, idempotency, versioning under a v1/ folder, and auth. Use when adding an API, when asked to "design the endpoint / API", or before writing a NestJS controller.
---

# Design an endpoint

Design the contract first — it's the expensive thing to change later
(`design/evolve-contract`).

## Shape

- **Resource, not action** — `POST /users/:id/deactivations` over
  `POST /users/:id/deactivate` where it's natural; pragmatic RPC-style verbs are
  fine for genuine operations. Be consistent within the service.
- **Verb semantics** — `GET` safe + idempotent, `PUT`/`DELETE` idempotent,
  `POST` not. `PATCH` for partial update with a defined merge semantics.
- **Request body** — a DTO with validation (`class-validator` for NestJS). Reject
  unknown fields or ignore them — pick one and document it. `snake_case` at the
  wire layer, don't mix.
- **Response** — return the resource (or the entity) directly; don't wrap every
  response in a new envelope class just for this endpoint. Consistent error shape
  across the service.
- **Status codes** — `200/201/204`, `400` (validation), `401` vs `403`, `404`,
  `409` (conflict / idempotency), `422` (semantic), `429`. Don't invent.
- **Idempotency** — for non-idempotent `POST` that a client may retry, accept an
  `Idempotency-Key` and dedup.

## Collections

- **Pagination** — cursor/keyset for anything that grows (`?cursor=…&limit=…`),
  not `offset`. Return the next cursor. Cap and default `limit`.
- **Filtering / sorting** — a small allowlist of fields, documented. Don't accept
  arbitrary query expressions.
- **Sparse fields / expansion** — only if there's a real need.

## Versioning & rollout

- Live under `v1/` from day one (NestJS: `v1/controllers`, `v1/dto`,
  `v1/services`). A breaking change becomes `v2/`, not an edit — see
  `design/evolve-contract`.
- New **public** route → added to the RBAC / gateway allowlist in **all** envs,
  loop in the platform owner, before it ships.

## Auth

- Every endpoint states its authz rule — not just "authenticated" but "allowed to
  touch *this* resource" (no IDOR).
- Rate limit where abuse is possible.

## Output

The path + verb, the request DTO, the response shape, the status codes, the authz
rule, pagination/filter design. Then hand to
`design/scaffold-nestjs-module` to build it.

## Anti-patterns

- ❌ A new response-wrapper class per endpoint.
- ❌ `offset` pagination on a growing collection.
- ❌ Arbitrary query-language filters.
- ❌ Inventing status codes, or `200` for everything.
- ❌ No `v1/`, so the first breaking change has nowhere to go.
- ❌ Authz that only checks "logged in".
