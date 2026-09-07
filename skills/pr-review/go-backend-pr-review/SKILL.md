---
name: go-backend-pr-review
description: Review a Go backend PR the way Tejas reviews — correctness first (concurrency safety, error handling, context propagation), then optional-dependency degradation, queue/message lifecycle, then reuse and dead-code hygiene. Terse blocking/non-blocking split, same register as nestjs-backend-pr-review. Use when reviewing a PR, diff, or branch in a Go service (SQS/queue consumers, HTTP services, CLIs), or when asked to "review this Go PR like I would".
---

# Go backend PR review — house style

Same reviewer, same voice as `pr-review/nestjs-backend-pr-review`.
The difference is **ordering**: in Go, correctness outranks reuse. The language makes
concurrency, error handling and lifecycle easy to get subtly wrong, and those bugs
ship silently — so they come first.

Grounded in the `event-service` material from the Nest corpus (SQS consumer, OTEL,
BigQuery) and the conventions in the Go repos (`golangci-lint`, `gosec` +
`govulncheck`, table-driven tests beside the source, `go.mod` as the version
source, multi-stage distroless-ish Docker builds).

Not a generic Go style guide. Read §5 of the Nest skill for the register; this file
is the Go-specific checklist and the priority order.

---

## 1. The one-line summary of the style

**Trace the failure before you flag it; degrade, don't crash; classify every error.**
One or two sentences per comment, lowercase, addressed to a named person, phrased as
a question or a directive. Long comments only when the mechanism isn't obvious from
the line — then quote the caller, the line number, and what happens on the next cycle.

---

## 2. What to flag — the recurring standards

Ranked by how much they matter in Go review, not by volume.

### 2.1 Error handling — terminal vs retryable — **the first thing to check**
- [ ] Every new `error` return path must be classified: is it terminal (drop / DLQ)
      or retryable (redeliver)? An error that is neither deleted nor DLQ'd
      **redelivers forever** → **blocking**.
- [ ] Errors swallowed with `_ =` or logged-and-continued where the caller needed to
      know → **blocking** if it corrupts state, else 🟠.
- [ ] `fmt.Errorf` without `%w` when the caller does `errors.Is` / `errors.As`
      downstream → wrap it. Conversely, don't `%w`-wrap when you're deliberately
      hiding an internal error from a boundary.
- [ ] Sentinel errors (`var ErrNotFound = errors.New(...)`) compared with `==`
      instead of `errors.Is` → breaks the moment someone wraps.
- [ ] `panic` in library / request-path code for something that should be an error
      return → **blocking**. `panic` is for programmer bugs, not bad input.

### 2.2 Concurrency safety
- [ ] Goroutine started with no lifecycle owner — nothing cancels it, nothing waits
      on it → leak. Ask for a `context.Context` + `sync.WaitGroup` or an errgroup.
- [ ] Loop variable captured by a goroutine / closure inside `for` (pre-1.22
      semantics, or any version if you're not certain) → shadow it: `item := item`.
- [ ] Shared map / slice / counter written from multiple goroutines without a mutex
      or channel → data race. Ask if `go test -race` was run.
- [ ] `context.Context` not threaded through — a new blocking call (DB, HTTP, queue)
      that ignores the caller's ctx can't be cancelled on shutdown or timeout.
- [ ] `context.Background()` / `context.TODO()` deep in a call tree where a real ctx
      was available → thread the real one.
- [ ] Unbuffered channel send with no guaranteed receiver → deadlock on the unhappy
      path. Trace both sides.
- [ ] `defer` inside a loop (file handles, unlocks, spans) → they stack until the
      function returns. Move to an inner func or `defer` explicitly per iteration.

### 2.3 Optional dependencies must degrade, never crash
- [ ] Telemetry / cache / read-replica init failing must not take the service down.
      `log.Fatalf` on OTEL / metrics / tracing init → **blocking**; fall back to a
      no-op provider. *"Observability optional honi chahiye, hard startup dependency
      nahi."*
- [ ] Read-replica connect failure must fall back to primary, not block boot.
- [ ] Reconnect that gives up permanently after N retries → a blip after a deploy
      leaves every call throwing until the pod restarts. Reconnect infinite with
      capped backoff; bound only the *initial* connect.
- [ ] If the author genuinely wants loud-fail, that's a valid stance — but then stop
      calling the dependency "optional" in the code and docs. Pick one.

### 2.4 Queue / message lifecycle (SQS and similar consumers)
- [ ] Never delete / ack a message before the downstream write succeeds. Trace the
      order of operations.
- [ ] Confirm the deployed queue actually has the redrive policy / DLQ the code
      assumes. If the code relies on max-receive-count, say which value.
- [ ] Partial-batch failures: does one bad record fail the whole batch, or is it
      handled per-record? Match it to the queue's batch-item-failure support.
- [ ] Visibility timeout vs handler runtime — a handler that can run longer than the
      timeout causes duplicate processing. Ask.

### 2.5 Resource lifecycle
- [ ] `rows.Close()`, `resp.Body.Close()`, file handles — every acquire needs a
      paired release on **every** path, including early error returns.
- [ ] `http.Client` / DB pool / gRPC conn created per-request instead of once →
      fd exhaustion and no connection reuse.
- [ ] Background tickers / `time.After` in a loop → `time.After` leaks a timer per
      iteration until it fires; use `time.NewTimer` and `Stop()`.
- [ ] No graceful shutdown — `SIGTERM` should drain in-flight work, close pools,
      flush telemetry. Check `signal.NotifyContext` + server `Shutdown(ctx)`.

### 2.6 Reuse over new abstraction (still applies, just not #1)
- [ ] New interface / wrapper / struct introduced when an existing type, repo method
      or helper already covers it → *"directly call the repo"*, *"why are we
      creating interfaces again"*. Go especially: don't define an interface on the
      producer side — let the consumer declare the small interface it needs.
- [ ] Instruments / recorders / wrappers registered but never called → give the grep
      that proves it: *"`grep -rn 'RecordServiceCall\|ServiceWrapper' pkg/` → koi
      caller nahi milega"*.
- [ ] Scaffolding for tech the stack doesn't run (kafka recorders when it's SQS).
- [ ] Same change needed in a sibling service → say so, or ask if it should be a
      shared internal package.

### 2.7 Config, env, dead environments
- [ ] Infra connection details in committed config files instead of env.
- [ ] Required env keys nothing reads → *"i don't think this is used, please check"*.
- [ ] Config blocks for environments that don't exist → *"remove this as we dont
      have a dev env for this service"*.
- [ ] Committed `.env` with real-looking values → flag secrets; dev placeholders get
      a one-line "confirm these are throwaway".

### 2.8 Naming & API
- [ ] Function names that stopped describing the function after a refactor →
      *"`findOrBackfillUser` doesnt backfill anymore, can we rename"*.
- [ ] Exported identifiers that don't need to be — Go has no "internal by
      convention", so an exported symbol is API. Lowercase it if nothing external
      uses it.
- [ ] Package names too generic to own a namespace (`utils`, `common`, `helpers`) →
      name for what's in it.
- [ ] Wire/DB values (table names, enum strings, event names, JSON tags) that don't
      match the source of truth.

### 2.9 Tests
- [ ] New handler / new exported func with no test → ask for a **table-driven** test
      (`tests := []struct{ name, input, want … }{…}` → `for _, tt := range tests {
      t.Run(tt.name, …) }`), and be specific about what it should assert.
- [ ] Test lives in a separate `tests/` tree instead of `<pkg>_test.go` beside the
      source → move it.
- [ ] `t.Fatalf` vs `t.Errorf` misuse — `Fatal` for setup that makes the rest
      meaningless, `Error` for assertions so all failures surface in one run.
- [ ] Concurrency-touching change with no `-race` in the test command → ask.
- [ ] Happy-path-only coverage when the PR's goal spans several call paths →
      enumerate the missing cases in a table.

### 2.10 Efficiency
- [ ] Per-item loop doing N round-trips when the API / driver takes a batch → chunk.
- [ ] Unbounded `errgroup` / `sync.WaitGroup` fan-out over N items → bound with a
      semaphore.
- [ ] Slice built with `append` in a hot loop with a known final size → `make([]T,
      0, n)`.
- [ ] String concatenation with `+` in a loop → `strings.Builder`.
- [ ] Usually 🟡 "not a merge blocker, worth doing in the same pass" unless it's a
      genuinely hot path — then say so with the call volume.

---

## 3. What to let slide

- Style / formatting `gofmt` and `golangci-lint` already own.
- `err != nil { return err }` verbosity — it's the language, not a finding.
- Latent bugs with no in-repo caller today → `⚪ Minor`, "latent", "not a blocker".
- Defensible duplication on a cold path — say so explicitly so the fix targets the
  hot line and not this one.
- Micro-optimizations with no measured impact on a cold path.
- Things you suspected and then verified are fine — **say you checked them**.

---

## 4. How to structure the review

Same as the Nest skill §4. Recap:

1. **Review body**: one line of specific praise → numbered "before merge" list
   (2–4 items) → explicit Blocking / Non-blocking split → "details inline".
2. `CHANGES_REQUESTED` for correctness / contract / forever-redelivery / `Fatalf`
   on optional deps. `COMMENT` for everything else and all follow-up rounds.
3. Severity markers only on multi-finding reviews:

| Marker | Means (Go) |
|---|---|
| 🔴 Blocking | data race, goroutine leak on the request path, forever-redelivery, `Fatalf` on an optional dep, message deleted before write, `panic` on bad input |
| 🟠 | real bug, one-line fix — unwrapped error the caller inspects, missing `Close()` on the error path |
| 🟡 | efficiency / redundancy — unbatched loop, unbounded fan-out |
| ⚪ | latent, no caller today |
| 🟢 | checked and fine — noted so it isn't re-raised |

4. **Inline**: default one or two sentences. When you assert a bug, show the
   mechanism — quote the caller, the line, and what happens on the next
   receive/tick/deploy. When you claim something is unused, paste the grep.

---

## 5. Phrasing — same register as the Nest skill

Lowercase starts, dropped apostrophes ("doesnt", "cant"), no sign-off, `@name`
opener, Hinglish freely with Indian teammates for the longer explanations
(technical nouns in English, connective tissue in Hinglish). `??` marks real doubt,
not volume. Hedge when unsure — *"i dont think this ctx is cancelled on shutdown,
please check once"* — rather than asserting. Offer to push the fix when it's bigger
than the comment. Give the decision, not a menu.

---

## 6. Anti-patterns for the reviewing agent

- ❌ Flagging `err != nil` verbosity or asking for an interface.
- ❌ Claiming a race / leak without tracing both goroutines. If you can't, phrase it
  as "please run `go test -race` on this once".
- ❌ Generic "add error handling" with no line anchor.
- ❌ A severity table on a 5-line diff.
- ❌ Restating what the code does.
- ❌ Blocking on style a linter owns.

---

## 7. Applying this to a diff — order of operations

1. Read the PR description. One-liner or overclaim → finding.
2. For every new `error` return: terminal or retryable? deleted or redelivered?
3. For every new goroutine: who cancels it, who waits on it?
4. Grep the diff for `Fatalf`, `panic(`, `context.Background()`, `context.TODO()`,
   `go func(`, `defer` inside `for`, `time.After`, `.Close()` (and check the error
   paths above each), `_ =`.
5. For every optional dep (telemetry, cache, replica): does init failure degrade or
   crash? does reconnect give up?
6. For every new exported symbol: is it actually API? grep for a caller.
7. For every changed wire value / response shape: is this endpoint legacy? (revert
   unconditionally if so — see Nest skill §2.11)
8. Check whether a sibling service needs the identical change.
9. Write ≤4 "before merge" items, split blocking / non-blocking, rest inline.
10. State what you checked and cleared.
