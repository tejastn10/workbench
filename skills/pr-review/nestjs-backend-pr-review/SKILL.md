---
name: nestjs-backend-pr-review
description: Review a backend PR the way Tejas reviews at Habuild — reuse-over-abstraction, prod-log discipline, config/env hygiene, Nest DI and cache correctness, and a terse blocking/non-blocking split. Primarily NestJS/TypeScript services (auth-service, user-service, backend-common-sdk); also covers the Go services (event-service) and TS workers. Use when reviewing a PR, diff, or branch in any habuildserver backend repo, or when asked to "review this like I would".
---

# Backend PR review — house style

Distilled from 120 review comments left as a reviewer on **backend** PRs across the
`habuildserver` org (Jun–Sep 2026). By comment volume:

| Stack | Repos | Share |
|---|---|---|
| **NestJS / TypeScript** | `auth-service` (49), `user-service` (10), `subscription-service` (1) | **50%** |
| **TypeScript, Nest-consumed** | `backend-common-sdk` (24) — DI tokens, dynamic modules | 20% |
| **Go** | `event-service` (28) — SQS consumer, OTEL, BigQuery | 23% |
| Other | `platform-workers` (5), `api-gateway-kong` (2), `.github` (1) | 7% |

So the default assumption is a **NestJS service PR**; sections 2.7, 2.8 and 2.15 are
where the Go services carry the weight. No frontend PRs in the corpus — this skill has
nothing to say about React, and shouldn't be applied there.

This is not a generic best-practices list. It is the set of things actually flagged, in
the phrasing actually used, with the things deliberately let slide.

---

## 1. The one-line summary of the style

**Ask before asserting; reuse before building; delete before adding.**
Most comments are one line, lowercase, addressed to a named person, and phrased
as a question or a directive — not a lecture. Long comments are reserved for the
few findings that are genuinely load-bearing, and those come with a concrete
patch.

---

## 2. What to flag — the recurring standards

Work down this list against the diff. These are ranked by how often they show up.

### 2.1 Reuse over new abstraction — **the single most common flag**
- [ ] Is a new DTO / response class / interface / wrapper being introduced when an
      existing entity, Prisma model, repository, or helper already covers it?
      → *"use the invoker don't create new abstractions"*,
        *"directly call the repo"*,
        *"we can use the prisma schema here directly why are we creating interfaces again please remove this"*,
        *"please don't create responses use accounts and members directly. Restructuring responses for new apis doesnt make sense"*
- [ ] Is there an existing helper file (`src/api/helper.ts`, an exception-services
      list, a shared enum) that this hand-rolled code duplicates?
      → *"use the helper methods from `src/api/helper.ts` file"*,
        *"we have the exception services we can use that rather than using specific service names"*
- [ ] Can a needed field be derived from something already on the row instead of a
      new type? → *"if you need `isNewAccount` please check that based on the `created_at` field"*
- [ ] Does the same change need to happen in a sibling service, or should it become
      a shared package? → *"add the same origins which we had added in auth-service for this as well or see if we should make a package for all the other nest based repos"*

### 2.2 Constants and magic values
- [ ] Inline string/number literals that will grow → pull into a constants file,
      **inside the module folder**, not a global one.
      → *"move this to separate constant file"*,
        *"Create separate constants as if in future if we need to add more we can do that in that file also keep the constants in this module folder itself"*
- [ ] Cross-repo shared values (redis prefixes, service names) must be exported from
      the shared SDK so nobody hardcodes the string on either side.

### 2.3 Logging discipline
- [ ] `logger.debug` in code meant to be observed → **blocking**. Prod ships
      `info/warn/error` only, so debug lines are invisible where they're needed.
      → *"`logger.debug` → `logger.log` (invisible in prod otherwise)"*
- [ ] Debug logs on hot read paths → delete, don't reword. Quantify the call volume
      if you can. → *"getUser is ~281k calls/7d, lets drop these debug logs on the hot read paths"*,
        *"theres a ton of debug logs in this file (134 😅) and these per-iteration ones inside the bulk loops are just spam"*
- [ ] Manual `[module]` / `[method]` prefixes in Nest logs → redundant, Nest adds them.
- [ ] `JSON.stringify(error)` → `{}` (message/stack are non-enumerable). Pass the
      error object or `error.stack`. Call it out as a pattern the whole org copies.
- [ ] Raw `headers` / full request `body` in logs → **blocking** PII/secret leak
      (Authorization, cookies, the OTP itself). Replace with a redacted allowlist.

### 2.4 Config, env and dead environments
- [ ] Infra connection details (redis, endpoints) belong in **env**, not in
      `asset/config/*.json`.
- [ ] Required env keys that nothing reads → *"why is jwt a required ENV key i don't think it is being used but please check"*
- [ ] Config blocks for environments that don't exist → *"remove this as we dont have a dev env for events service"*
- [ ] Connections established for a dependency that isn't used → comment it out now,
      remove in a separate PR.

### 2.5 Dead code and unused scaffolding
- [ ] Instruments/wrappers/recorders registered but never called → trim or move to a
      follow-up PR. Give the reviewer's own verification command:
      *"verify kar sakte ho: `grep -rn "RecordServiceCall\|ServiceWrapper" pkg/` → koi caller nahi milega"*
- [ ] Scaffolding for tech the org doesn't run (kafka recorders when the stack is SQS).
- [ ] Branches unreachable in prod → *"is anything actually sending `mode`? The scheduled event/test uses `detail:{}`, so this branch looks unreachable in prod."*
- [ ] Commented-out code and leftover comments → *"please remove these comments not needed"*

### 2.6 Naming
- [ ] Package/module names that are too generic to own a namespace →
      *"please rename this as common utils is very common name ... keep the name according to it"*
- [ ] Function names that no longer describe what they do after a refactor →
      *"`findOrBackfillUser` doesnt backfill anymore ... can we rename these since the name still says Backfill"*
- [ ] Casing consistency within a module — pick one (snake_case at the wire/DB layer
      here) and don't mix. → *"dont use these `anti-patterns` can we only keep the snake-case"*
- [ ] Table names, enum values, event names that don't match the source of truth.

### 2.7 Optional dependencies must degrade, never crash
- [ ] Telemetry / cache / replica init failing must not take the service down.
      `log.Fatalf` on OTEL init → **blocking**; fall back to a no-op.
      *"Observability optional honi chahiye, hard startup dependency nahi."*
- [ ] Read-replica connect failure must fall back to primary, not block boot.
- [ ] Reconnect strategies that give up permanently after N retries → a blip after a
      deploy leaves every call throwing until the pod restarts. Keep reconnect
      infinite with capped backoff; bound only the initial connect.
- [ ] If the author prefers loud-fail, that's allowed — but then stop calling the
      dependency "optional". *"dono me se ek stance decide kar lo, abhi contradictory hai."*

### 2.8 Queue / message lifecycle — Go consumers
- [ ] A new error return must be classified terminal vs retryable. An error that is
      neither deleted nor DLQ'd redelivers forever. → **blocking**.
- [ ] Confirm the deployed queue actually has the redrive policy the code relies on.
- [ ] Never delete before the downstream write succeeds.

### 2.9 Cache correctness
- [ ] Read key and write key must be derived identically (normalize once, use for
      both the index lookup and the loader).
- [ ] Negative tombstones written by a bulk loader with a different filter than the
      single-item loader will 404 real records → **blocking**.
- [ ] Reads that must be read-your-writes (OTP verify, rate-limit counters) must not
      go to a read replica. → *"replica lag means we can read a stale/missing otp or undercount the limit"*
- [ ] `KEYS` blocks redis on a shared instance → `SCAN`, or drop the method.
- [ ] `multi.exec()` result ignored → multi doesn't roll back; scan the result.

### 2.10 Resilience and efficiency in loops
- [ ] Per-item loops with no per-item try/catch → one transient 5xx aborts a whole
      multi-day backfill. Ask for per-item catch + continue, plus retry/backoff.
- [ ] Unbounded `Promise.all` of N×M round-trips when the endpoint takes a batch → chunk.
- [ ] `refreshUserCache`-style helpers called in a per-item loop when the rows are
      already in hand → ~2N redundant DB reads. Usually **non-blocking** but "worth
      doing in the same pass".
- [ ] `@Transaction` left on methods that became read-only after a refactor — it pins
      a pool connection and holds locks across a paginated loop.

### 2.11 API contract stability
- [ ] Changing an error code / response shape on a **legacy** endpoint → **revert**,
      unconditionally. CRM/frontend may depend on the old behaviour.
      → *"we cant change the contract on the old apis now ... keep the old behaviour"*
- [ ] Renamed enum/event wire values → ask what reads them downstream before merge.
- [ ] New public endpoints → must be added to the RBAC api list in **all** envs, and
      loop in the platform owner.

### 2.12 NestJS / DI specifics
- [ ] New `forwardRef` circular triads → question whether the cross-import is needed
      at all if nothing injects the service yet.
- [ ] Non-null assertion (`!`) hiding a `string | undefined` return → guard or make
      the field optional.
- [ ] Single shared connection modules should be `global: true` rather than imported
      into every feature module.
- [ ] Published packages: `Symbol.for("X")` not `Symbol()` for DI tokens — two copies
      in the tree otherwise fail with a confusing error.

### 2.13 Tests
- [ ] New endpoint / new handler with no test → ask for a small table-driven test that
      also guards the new signature. Be specific about what it should assert.
- [ ] Coverage that only exercises the happy branch when the PR's stated goal spans
      several call paths → enumerate the missing callers in a table.
- [ ] Test-only realignment that implies a production contract change from a base
      branch → confirm the owning PR covered it.

### 2.14 PR hygiene (raise in the review body, not inline)
- [ ] One-liner PR description → ask for **what / why / how to test**.
- [ ] PR doing two things → fine to merge, but call both out in the description.
- [ ] Stacked PRs → state the merge order explicitly.
- [ ] Description claiming more than the diff does → correct it.
- [ ] Toolchain bumps (go 1.22 → 1.25) → confirm CI/Docker/ECS base images match.

### 2.15 Vendored / inherited code
- [ ] Old org references left in `third_party/` from a previous author → replace with
      ours, and check whether the upstream entity can be brought into the org.

---

## 3. What to let slide

Explicitly **do not** flag these. Noting them as cleared is fine; blocking on them is not.

- Style/formatting a linter already owns.
- Latent bugs with **no in-repo consumer today** — flag as `⚪ Minor`, say it's latent,
  and say "not a blocker". → *"No in-repo consumer reads `freeMember.birth_year` today, so impact is latent"*
- Defensible duplication on a cold path. If the same pattern is a real problem in a hot
  loop and fine in a rare self-heal branch, say so explicitly so the fix targets the
  right line. → *"fine as-is ... flagging only so the #3 optimization targets line ~3680 and not this one"*
- Things you suspected and then verified are correct — **say you checked them**. A
  "Checked and cleared" paragraph is part of the review, not omitted.
- Cosmetic leftovers confined to log strings, comments and `it(...)` names → one
  sentence at the end, never a blocker.
- A hard-coded constant that is correct for the feature's actual scope — just ask for a
  comment saying it isn't general-purpose.

---

## 4. How to structure the review

### 4.1 Review body (the summary comment)
Short. Four moves, in order:

1. **One line of specific praise**, naming what was actually done well — not "LGTM".
   → *"OTEL ka base solid hai — no-op providers, nil guards, graceful shutdown sab theek se kiya hai 👍"*
   → *"Solid design and genuinely good test coverage."*
   → *"backfill removal looks good since we confirmed every account already has a members row"*
2. **A numbered "before merge" list**, 2–4 items, one clause each.
3. **An explicit Blocking / Non-blocking split** when there is more than one finding.
4. **"details inline"** — and then actually put the reasoning inline, not in the body.

Use `CHANGES_REQUESTED` when something is a correctness or contract problem;
`COMMENT` for everything else, including follow-up rounds (don't stack a second
CHANGES_REQUESTED on top of a standing one).

### 4.2 Severity markers
Only reach for these on multi-finding reviews (~8% of comments). Otherwise plain prose.

| Marker | Means |
|---|---|
| 🔴 Blocking | correctness, PII leak, contract break, prod-invisible logging, forever-redelivery |
| 🟠 | real bug, one-line fix, still fix before merge |
| 🟡 | efficiency / redundancy — "not a merge blocker, but worth doing in the same pass" |
| ⚪ | latent, no consumer today — explicitly not a blocker |
| 🟢 | checked and fine as-is; noted so it isn't re-raised |

### 4.3 Inline comments
- Default length is **one or two sentences** (39% of comments are under 200 chars).
- Go long only when the reasoning isn't obvious from the line — then include a
  before/after code block, and say what you actually verified.
- When you assert a bug, show the mechanism, not just the symptom: quote the caller,
  the line number, and what happens on the next cycle.
- When you claim something is unused, give the grep that proves it.
- Reply to your own earlier thread rather than re-commenting the same point on a new line.
  On a re-review, list still-open items in a table instead of re-commenting the diff.

---

## 5. Phrasing patterns to imitate

**Register:** lowercase starts (78%), informal contractions, apostrophes often dropped
("doesnt", "cant", "wont"), no closing sign-off. Never corporate.

**Default openers, in order of frequency:**
- `can we <do X> ...` / `can you <do X> ...` — the standard directive (18% of comments)
- `lets <do X>` — for shared decisions and reverts (9%)
- `why do we need this?` / `why do you need this type` — for challenging scope (6%)
- `<verb> this` — bare imperative for trivia: *"delete these metrics as well"*, *"add alpha as well"*, *"default add 3"*, *"move this to separate constant file"*
- `@name <instruction>` — nearly half of all comments open with a mention (48%)

**Hinglish is used freely (21% of comments)** with Indian teammates, especially for
longer explanatory comments. Keep the technical nouns in English and the connective
tissue in Hinglish: *"span name `c.FullPath()` pe bana rahe ho — 404 pe yeh `""` return
karta hai, toh span name `"GET "` ban jayega. ek fallback laga do."* Sentence-final
`na?` softens a challenge into a check: *"replica is just an optimisation na —"*.
Match the language the author uses; don't force it.

**Hedging when unsure — do this rather than asserting:**
- *"Sorry i might have missed something please check if its x-platform or x-app-platform once from other apis"*
- *"i dont think redis is being used ... please check"*
- *"Circular dependency hai?? i dont think @mantoshkr1 please check this once"*

**Escalation is punctuation, not volume:** `??` and `???` mark real doubt
(*"why do we need this????"*, *"can we not use the dto itself here???"*). No shouting.

**Offer to do the work** when the fix is bigger than the comment:
*"Happy to push the choke-point implementation to this branch if you'd like."*

**Tag the owner** when the fix crosses into someone else's area — RBAC lists, kong
config, ad-spend impact — rather than deciding for them.

**Praise is short and earned:** `👍`, `👏`, *"change solid hai"*, *"Reasoning theek hai,
bas mechanism fragile hai."* Never a whole paragraph.

**Give the decision, not a menu.** When there are two acceptable answers, say which one
you want and why, then note the alternative — don't list options and leave it open.

---

## 6. Anti-patterns for the reviewing agent

Things this reviewer never does — don't do them either:

- ❌ Generic advice with no line-level anchor ("consider adding error handling").
- ❌ Restating what the code does back at the author.
- ❌ Flagging something without saying whether it blocks merge.
- ❌ A wall of severity tables on a 3-line diff. Match ceremony to diff size.
- ❌ Claiming a bug without tracing the caller. If you can't show the mechanism, phrase
  it as a check: "please confirm X once".
- ❌ Approving a legacy contract change because the new behaviour is more correct.
- ❌ Asking for a new abstraction. The bias is always toward deleting one.

---

## 7. Applying this to a diff — order of operations

1. Read the PR description first. If it's a one-liner or overclaims the diff, that's a
   finding.
2. Scan for **new files and new types** — most flags start there (2.1, 2.2, 2.6).
3. Grep the diff for `logger.debug`, `JSON.stringify(error)`, raw `headers`/`body`
   logging, `KEYS `, `!` non-null assertions, `forwardRef`, `@Transaction`, `Fatalf`.
4. For every new symbol added, grep for a caller. No caller → 2.5.
5. For every changed error path, ask: terminal or retryable? deleted or redelivered?
6. For every changed response/error code, ask: is this endpoint legacy?
7. Check whether a sibling service needs the identical change (2.1, last bullet).
8. Write ≤4 "before merge" items, split blocking / non-blocking, push the rest inline.
9. State what you checked and cleared.
