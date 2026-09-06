---
name: security-review
description: A dedicated security pass over a diff or a service — deeper than the PR-review checklist. Dependency vulnerabilities, secrets leakage (committed, logged, bundled, in history), race conditions and concurrency bugs, then authz / injection / SSRF / path traversal / deserialization. Per-stack audit commands baked in. Use when asked for a "security review", before a release, after a dependency bump, or when a change touches auth, file handling, user input, or external requests.
---

# Security review

Runs on top of the `pr-review/` skills, not instead of them. Those flag PII in
logs and secret exposure inline; this is the deliberate, whole-surface pass.

Same register as the pr-review skills: terse, one or two sentences, name the
mechanism, split blocking / non-blocking. A finding without a concrete exploit
path or a named affected file is a "please confirm", not a blocker.

---

## 1. Dependencies

Run the audit for every ecosystem the change touches:

| Stack  | Commands                                                        |
| ------ | ------------------------------------------------------------- |
| Node   | `npm audit --audit-level=low` · `npm outdated`                 |
| Go     | `govulncheck ./...` · `gosec ./...` · `go list -m -u all`      |
| Python | `pip-audit` (or `safety check`) · `poetry show --outdated`     |

- [ ] Any **high / critical** advisory with a reachable call path → **blocking**.
      `govulncheck` already tells you reachability; for `npm audit` check whether
      the vulnerable path is a runtime dep or dev-only.
- [ ] `npm audit` advisory only in a dev/build dependency, not shipped → note it,
      not a blocker.
- [ ] `pyproject.toml` / `package.json` changed but the lockfile not regenerated
      and committed → **blocking** (CI installs from the lock).
- [ ] A dependency pinned loosely (`^` widened to `*`, or a range removed) → tighten.
- [ ] A new dependency: is it maintained (last release, open-CVE count), and is it
      worth the transitive surface for what it does?
- See `skills/security/audit-dependencies.md` for triage + safe-update flow.

## 2. Secrets leakage

- [ ] Secret / token / key / password / connection string **committed** — in code,
      config, a fixture, a test, `.env`, or a CI file → **blocking**. Check it isn't
      also in git history (`git log -p -S '<fragment>'`), and treat any real
      committed secret as compromised → must be rotated, not just removed.
- [ ] Secret in a **log line** — full request `headers` / `body`, `Authorization`,
      cookies, the OTP itself, a full connection URL with credentials → **blocking**.
- [ ] Secret reachable from the **client bundle** — `NEXT_PUBLIC_*` on anything
      sensitive, a server key imported into a `"use client"` file → **blocking**
      (see `skills/pr-review/react-frontend-pr-review.md`).
- [ ] Secret passed as a Docker build `ARG` (persists in image history) or echoed
      in a GitHub Actions step, or a workflow that exposes `secrets` to
      fork-triggered code → **blocking** (see `skills/pr-review/devops-pr-review.md`).
- [ ] Error responses / stack traces returned to the client that leak internal
      paths, queries, or infra detail.

## 3. Race conditions & concurrency

- [ ] Go: concurrency-touching change with no `go test -race` run → ask for it.
      Shared map/slice/counter written from multiple goroutines without a mutex or
      channel → **blocking**.
- [ ] **TOCTOU** — check-then-act on a file, a DB row, a balance, a rate-limit
      counter, a uniqueness constraint, where another request can slip between the
      check and the act. Needs a lock, a transaction, or an atomic operation.
- [ ] Read-your-writes on a security-relevant value (OTP verify, session, rate
      limit, permission) going to a read replica → replica lag = stale/missing
      read → **blocking**.
- [ ] Non-idempotent handler with no dedup key on an at-least-once delivery path
      (queue consumer, webhook) → double-spend / double-effect.
- [ ] `async` handler mutating shared module-level state between `await` points.

## 4. Authorization & authentication

- [ ] New endpoint / handler / GraphQL field with **no authz check**, or one that
      only checks *authentication* (logged in) not *authorization* (allowed to
      touch **this** resource) → **blocking**. IDOR: `GET /orders/:id` that doesn't
      verify the order belongs to the caller.
- [ ] Authz check on the controller but bypassable via a second entry point
      (a batch endpoint, an internal RPC, a job) to the same data.
- [ ] Role / permission derived from a client-supplied value (header, body, JWT
      claim the server didn't sign).
- [ ] New public route not added to the RBAC / gateway allowlist in **all** envs.
- [ ] Token/session: no expiry, no rotation on privilege change, compared with
      `==` instead of a constant-time compare.

## 5. Injection & untrusted input

- [ ] SQL / NoSQL built by string concatenation or template literal with user
      input → parameterize. ORM raw-query escape hatches count.
- [ ] Shell / `exec` / `child_process` with interpolated input → **blocking**.
- [ ] Path built from user input without normalization + containment check →
      path traversal (`../`). Same for archive extraction (zip slip).
- [ ] `eval`, `Function(...)`, `pickle.loads`, `yaml.load` (non-safe),
      `JSON` reviver, prototype-pollution-prone merge on untrusted input.
- [ ] Reflected user input into HTML / a template without escaping → XSS.
      `dangerouslySetInnerHTML` / `v-html` on anything user-influenced.
- [ ] Regex built from or run against unbounded user input → ReDoS.

## 6. External requests & data flow

- [ ] Outbound request to a **user-supplied URL / host** with no allowlist → SSRF
      (metadata endpoints, internal services). Follow-redirects makes it worse.
- [ ] File upload: type/size not validated, stored in a web-served path, served
      with a user-controlled `Content-Type`.
- [ ] CORS `*` with credentials, or an origin reflected from the request.
- [ ] Missing `Secure` / `HttpOnly` / `SameSite` on session cookies.
- [ ] PII / secrets sent to a third party (analytics, logging, an LLM) that
      shouldn't receive them.

---

## What to let slide

- Advisories in dev-only dependencies with no runtime path → `⚪`, "dev-only".
- Theoretical timing attacks on non-secret comparisons.
- Defense-in-depth suggestions with no actual bypass today → note as follow-up,
  not a blocker.
- Hardening a code path that has no untrusted input reaching it → say you checked
  and it's not reachable.
- Things you suspected and verified are safe — **say you checked them**.

---

## Output

1. **One-line summary** — worst finding + count by severity.
2. **Blocking** — exploit path traced (input → sink → impact), affected file/line,
   and the fix.
3. **Non-blocking** — hardening, dev-only advisories, follow-ups.
4. **Checked & cleared** — the surfaces you looked at and found safe.
5. If a real secret was committed: a rotate-and-purge checklist, flagged as the
   first action.

## Anti-patterns for the reviewing agent

- ❌ Pasting raw `npm audit` output as the review. Triage it: reachable? runtime?
  fixable?
- ❌ "This could be vulnerable to X" with no traced path. Trace it or phrase it as
  "confirm X once".
- ❌ Flagging every string interpolation as injection without checking the source.
- ❌ Treating a removed-but-not-rotated committed secret as resolved.
- ❌ A CVE wall on a 5-line diff — match ceremony to the change.
