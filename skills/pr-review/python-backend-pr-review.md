---
name: python-backend-pr-review
description: Review a Python backend PR the way Tejas reviews — reuse over new abstraction first (same as the Nest corpus), then logging/config/dead-code hygiene, then correctness (warnings-as-errors, no broad except, contract stability). Poetry + flake8/black/isort, pytest, FastAPI/Pydantic. Terse blocking/non-blocking split, same register as nestjs-backend-pr-review. Use when reviewing a PR, diff, or branch in a Python service, or when asked to "review this Python PR like I would".
---

# Python backend PR review — house style

Same reviewer, same voice as [`nestjs-backend-pr-review.md`](nestjs-backend-pr-review.md),
and the **same priority ordering**: reuse-before-building is #1, then logging /
config / dead-code / naming, then correctness. Python doesn't get the
correctness-first treatment that Go does — the bias here is still "don't build a
class hierarchy when a function and a dict will do".

Grounded in the Python repo conventions (Poetry with a `dev` dependency group,
`black` line-length 120 + `flake8` + `isort`, `pre-commit`, `pytest` with
`filterwarnings = ["error", …]`, `.python-version`, `safety` for the security
audit). No `ruff`, no `mypy` in the corpus — don't ask for them.

Read §5 of the Nest skill for the register; this file is the Python-specific
checklist.

---

## 1. The one-line summary of the style

**Ask before asserting; reuse before building; delete before adding.**
Most comments are one line, lowercase, addressed to a named person, phrased as a
question or a directive. Long comments are reserved for the load-bearing findings
and come with a concrete patch.

---

## 2. What to flag — the recurring standards

### 2.1 Reuse over new abstraction — **the single most common flag**
- [ ] New Pydantic model / dataclass / `TypedDict` / wrapper introduced when an
      existing model, ORM row or schema already covers it → *"use it directly, don't
      restructure responses for new apis"*.
- [ ] Hand-rolled code that duplicates an existing helper module, constants file or
      shared enum → point at the file.
- [ ] A needed field that can be derived from something already on the row instead
      of a new type → *"if you need `is_new` check it off `created_at`"*.
- [ ] A class with one method and no state → make it a function.
- [ ] Inheritance used where composition or a plain function would do → the bias is
      always toward deleting an abstraction, never adding one.
- [ ] Same change needed in a sibling service → say so, or ask if it should be a
      shared package.

### 2.2 Constants and magic values
- [ ] Inline string / number literals that will grow → pull into a `constants.py`
      **inside the module/package**, not a global one. *"keep the constants in this
      module folder itself"*.
- [ ] Enum values / status strings that don't match the source of truth.
- [ ] Cross-service shared values → export from the shared package so nobody
      hardcodes the string on either side.

### 2.3 Logging discipline
- [ ] `logger.debug` on a path meant to be observed in prod → prod ships
      `info/warning/error`, so it's invisible where it's needed. Blocking if it's
      the only signal for an incident.
- [ ] Debug logs on hot read paths → delete, don't reword. Quantify call volume if
      you can.
- [ ] Per-iteration logs inside bulk loops → spam. Log once with a count.
- [ ] `logger.exception` vs `logger.error(str(e))` — use `exception` (or
      `error(..., exc_info=True)`) so the traceback is captured. `str(e)` / f-string
      of the exception loses the stack.
- [ ] `print()` in library / service code → logger.
- [ ] Raw request headers or full request body in logs → **blocking** PII / secret
      leak (Authorization, cookies, tokens, the OTP itself). Redacted allowlist only.
- [ ] Manual module/function prefixes in log messages when the formatter already
      adds them → redundant.

### 2.4 Config, env, dead environments
- [ ] Infra connection details (DB URL, redis, endpoints) in committed config /
      settings defaults instead of env → `pydantic-settings` / `os.environ`.
- [ ] Required settings fields nothing reads → *"i don't think this is used, please
      check"*.
- [ ] Config for environments that don't exist.
- [ ] Committed `.env` with real values → flag secrets; dev placeholders get a
      "confirm throwaway".
- [ ] `python = "^3.x"` in `pyproject.toml` not matching `.python-version` / CI /
      Docker base image.

### 2.5 Dead code and unused scaffolding
- [ ] Functions / classes / registered handlers never called → give the grep,
      trim or move to a follow-up PR.
- [ ] Commented-out code and leftover TODOs → *"please remove these not needed"*.
- [ ] Unused imports (flake8 catches most; `__init__.py` re-exports are the
      exception — `per-file-ignores = __init__.py:F401`).
- [ ] Branches unreachable given how the code is actually called.

### 2.6 Naming
- [ ] `snake_case` for functions / variables / module names, `PascalCase` for
      classes — pick one casing at the wire/DB layer and don't mix.
- [ ] Function names that stopped describing the function after a refactor → rename.
- [ ] Modules named too generically to own a namespace (`utils`, `helpers`,
      `common`).
- [ ] Boolean names without an `is_` / `has_` / `should_` prefix when it reads
      ambiguously.

### 2.7 Correctness (below hygiene, but still fix before merge)
- [ ] `except:` or `except Exception:` with no re-raise and no specific handling →
      swallows `KeyboardInterrupt`, `SystemExit`, and real bugs. Catch the specific
      exception; if you must catch broad, log with `exception` and re-raise.
- [ ] Mutable default argument (`def f(x=[])` / `={}`) → **blocking**, shared across
      calls.
- [ ] `datetime.now()` / `datetime.utcnow()` without tz → use
      `datetime.now(timezone.utc)`. Naive datetimes compared to aware ones raise.
- [ ] New code that triggers a `DeprecationWarning` / `RuntimeWarning` → CI runs
      `filterwarnings = ["error"]`, so this **fails the build**. Fix the warning,
      don't add an `ignore` entry without a reason.
- [ ] Blocking I/O (`requests`, sync DB driver, `time.sleep`, file reads) inside an
      `async def` → blocks the event loop. Use the async client or `run_in_executor`.
- [ ] `async def` endpoint doing only sync work → either make it real-async or make
      it `def` and let the framework threadpool it; don't fake it.
- [ ] Unawaited coroutine (`foo()` where `foo` is `async`) → silent no-op; flake8
      won't always catch it.
- [ ] Float for money / precise decimals → `Decimal`.
- [ ] Broad `# type: ignore` / `# noqa` with no code and no reason → ask for the
      specific rule and a one-line why.

### 2.8 API contract stability
- [ ] Changing a response shape / status code / error body on a **legacy** endpoint
      → **revert**, unconditionally. Downstream may depend on the old behaviour.
- [ ] Pydantic model field renamed / made required → what serializes/deserializes
      this downstream? Ask before merge.
- [ ] Changing a default value in a settings model or function signature that other
      callers rely on.

### 2.9 Dependencies (Poetry)
- [ ] `pyproject.toml` changed but `poetry.lock` not regenerated / not committed →
      **blocking**, CI installs from the lock.
- [ ] Runtime dependency added to `[tool.poetry.group.dev.dependencies]` or vice
      versa.
- [ ] A heavy transitive dependency pulled in for one small utility → is it worth it?
- [ ] Version pin loosened (`^` → `*`, or removed) without a reason.

### 2.10 Tests
- [ ] New endpoint / new function with no test → ask for a `@pytest.mark.parametrize`
      table covering the cases, and be specific about the assertions.
- [ ] Test lives in a separate `tests/` tree → prefer `<module>_test.py` beside the
      source (`_test.py` suffix, matching the `name-tests-test` hook).
- [ ] `assert` with no message on a non-obvious check → add the message.
- [ ] Happy-path only when the PR spans several call paths → enumerate the missing
      cases in a table.
- [ ] Real network / DB call in a unit test → fixture or mock.
- [ ] `pytest-asyncio` test not marked / not awaiting → it silently passes without
      running the body.

---

## 3. What to let slide

- Style / formatting `black` and `flake8` already own (line-length 120, `E203`,
  `W503`, `W504` are ignored on purpose — don't re-raise them).
- `max-complexity` under 12 — that's the configured ceiling.
- Latent bugs with no in-repo caller today → `⚪ Minor`, "latent", "not a blocker".
- Defensible duplication on a cold path — say so explicitly.
- A hard-coded constant correct for the feature's actual scope → just ask for a
  comment saying it isn't general-purpose.
- Things you suspected and then verified are fine — **say you checked them**.
- Cosmetic leftovers in log strings, comments, `test_*` names → one sentence at the
  end, never a blocker.

---

## 4. How to structure the review

Same as the Nest skill §4:

1. **Review body**: one line of specific praise → numbered "before merge" list
   (2–4 items) → explicit Blocking / Non-blocking split → "details inline".
2. `CHANGES_REQUESTED` for correctness / contract / lockfile-not-committed / PII in
   logs / warnings-as-errors build break. `COMMENT` for everything else and
   follow-ups.
3. Severity markers only on multi-finding reviews:

| Marker | Means (Python) |
|---|---|
| 🔴 Blocking | PII in logs, legacy contract change, mutable default arg, `poetry.lock` not committed, new `DeprecationWarning` (fails CI), blocking I/O in async on a hot path |
| 🟠 | real bug, small fix — bare `except`, naive `datetime`, unawaited coroutine |
| 🟡 | efficiency / redundancy — unbatched loop, redundant query in a loop |
| ⚪ | latent, no caller today |
| 🟢 | checked and fine — noted so it isn't re-raised |

4. **Inline**: default one or two sentences. Assert a bug → show the mechanism
   (the caller, the line, what happens). Claim something is unused → paste the grep.

---

## 5. Phrasing — same register as the Nest skill

`can we <do X>` / `can you <do X>` is the standard directive. `lets <do X>` for
shared decisions and reverts. `why do we need this?` for challenging scope. Bare
`<verb> this` for trivia. `@name` opener. Lowercase starts, dropped apostrophes, no
sign-off. Hinglish freely with Indian teammates on the longer explanations. `??`
for real doubt. Hedge when unsure instead of asserting. Offer to push the fix when
it's bigger than the comment. Give the decision, not a menu.

---

## 6. Anti-patterns for the reviewing agent

- ❌ Asking for `mypy` / `ruff` / type annotations the corpus doesn't use.
- ❌ Re-raising `E203` / `W503` / line-length — the config ignores them on purpose.
- ❌ Asking for a new class / abstraction. The bias is toward deleting one.
- ❌ Generic "add error handling" with no line anchor.
- ❌ Claiming a bug without tracing the caller → phrase it as "please confirm once".
- ❌ A severity table on a 3-line diff.
- ❌ Approving a legacy contract change because the new shape is cleaner.

---

## 7. Applying this to a diff — order of operations

1. Read the PR description. One-liner or overclaim → finding.
2. Scan for **new files and new types** — most flags start there (2.1, 2.2, 2.6).
3. Grep the diff for `logger.debug`, `print(`, `except:`, `except Exception`,
   `datetime.now()`, `datetime.utcnow()`, `=[]` / `={}` in signatures,
   `# type: ignore`, `# noqa`, `requests.`, `time.sleep`, raw `headers` / `body`
   logging.
4. Did `pyproject.toml` change? Then `poetry.lock` must have too, and be committed.
5. For every new symbol added, grep for a caller. No caller → 2.5.
6. For every changed response / model field / status code, ask: is this endpoint
   legacy?
7. Does any new code path emit a warning? CI treats warnings as errors.
8. Check whether a sibling service needs the identical change.
9. Write ≤4 "before merge" items, split blocking / non-blocking, rest inline.
10. State what you checked and cleared.
