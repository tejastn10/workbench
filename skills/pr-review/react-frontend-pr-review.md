---
name: react-frontend-pr-review
description: Review a React / Next.js frontend PR the way Tejas reviews — reuse over new component/abstraction first, then hooks and RSC correctness, then accessibility, then render performance. TypeScript, Biome, Tailwind v4, shadcn, App Router / Vite. Terse blocking/non-blocking split, same register as nestjs-backend-pr-review. Use when reviewing a PR, diff, or branch in a React or Next.js repo, or when asked to "review this frontend PR like I would".
---

# React / Next.js frontend PR review — house style

Same reviewer, same voice as [`nestjs-backend-pr-review.md`](nestjs-backend-pr-review.md).
The Nest corpus has **no frontend PRs** — this file carries that reviewer's
philosophy (reuse over abstraction, delete before adding, terse blocking split,
trace-before-you-flag) onto the frontend stack, plus the concrete conventions from
the React repos.

Conventions from the repos: **Next.js (App Router) / Vite**, React 19, TypeScript,
**Biome** for lint + format (tab indent, width 100, double quotes, `es5` trailing
commas, semicolons always, `useImportType`/`useExportType` errors,
`noUnusedVariables` error, `noImplicitAnyLet` error; `noNonNullAssertion` and
`noExplicitAny` are **off**), **Tailwind v4** + `tailwind-merge`/`clsx` via a `cn()`
util, **shadcn** components, `next-themes`, `motion`. Husky: pre-commit lint,
commit-msg commitlint, pre-push branch-name (`feature/` `bugfix/` `improvement/`).
npm + `lint-staged`.

Ordering here is Nest-style: **reuse #1**, then hooks/RSC correctness, then a11y,
then performance. Biome has `noExplicitAny` and `noNonNullAssertion` off and
`useExhaustiveDependencies` off — so `any`, `!`, and effect-dependency bugs are
**the reviewer's job to catch**, the linter won't.

Read §5 of the Nest skill for the register; this file is the frontend checklist.

---

## 1. The one-line summary of the style

**Reuse the component before you build one; compute in render before you reach for
an effect; trace the re-render before you memo it.** One or two sentences per
comment, lowercase, `@name`, question or directive.

---

## 2. What to flag — the recurring standards

### 2.1 Reuse over new component / abstraction — **the single most common flag**
- [ ] New component built when an existing one + a prop / variant would cover it →
      *"extend the existing one, don't fork it"*.
- [ ] Re-implementing something the design system / shadcn / a primitive already
      provides (a button, a dialog, a dropdown, a spinner).
- [ ] New `Context` / provider for state that's passed down one or two levels →
      just pass the prop.
- [ ] Hand-rolled util that duplicates something in `src/utils` (date formatting,
      `cn()`, class merging, debounce).
- [ ] A wrapper component that only forwards props and adds nothing → delete it.
- [ ] A custom hook wrapping a single `useState` with no added logic.
- [ ] Same JSX block copy-pasted 3+ times in one file → extract *locally*, not into
      a shared package yet.
- [ ] The bias is always toward deleting an abstraction, never adding one.

### 2.2 Hooks correctness
- [ ] Hook called conditionally / in a loop / after an early `return` → **blocking**,
      breaks the rules of hooks.
- [ ] `useEffect` with a missing dependency → stale closure. Biome won't flag this
      (`useExhaustiveDependencies` off) — check every effect's deps by hand and say
      which var is missing.
- [ ] `useEffect` computing state that could be derived during render → delete the
      effect and the `useState`, compute inline. *"this doesnt need an effect, just
      compute it"*.
- [ ] Effect that subscribes / adds a listener / starts a timer / opens a socket
      with **no cleanup return** → leak on unmount and on every re-run. **Blocking**.
- [ ] `useState` initialized from a prop and never re-synced → the "derived state"
      trap. Either lift it or key the component.
- [ ] Data fetching in `useEffect` in a Next App Router file that could be a server
      component or a route loader → move it server-side.
- [ ] `useCallback` / `useMemo` with wrong or missing deps → worse than not having
      it, now it's stale.

### 2.3 Next.js / RSC specifics
- [ ] `"use client"` sitting higher in the tree than it needs to → pushes the whole
      subtree to the client. Move it to the leaf that actually needs interactivity.
- [ ] Server-only code (DB client, secrets, `fs`, a big server lib) imported into a
      `"use client"` file → **blocking**, it ships to the browser or fails the build.
- [ ] Secret / API key referenced as `NEXT_PUBLIC_*` or read in a client component →
      **blocking** leak. Server env only.
- [ ] `cookies()` / `headers()` / `noStore()` pulled in where it isn't needed →
      opts the whole route into dynamic rendering. Confirm that's intended.
- [ ] Sequential `await`s for independent data → waterfall. `Promise.all`.
- [ ] No `loading.tsx` / `<Suspense>` around a slow server component → blank screen.
- [ ] `<img>` instead of `next/image`; heavy client-only lib not behind
      `next/dynamic`.
- [ ] Client-side `router.push` for something that should be a `<Link>` (loses
      prefetch).

### 2.4 Rendering correctness & hydration
- [ ] Array index as `key` on a list that can reorder / filter / delete →
      **blocking**, state attaches to the wrong row.
- [ ] `Date.now()` / `Math.random()` / `new Date()` / `window` / `localStorage`
      read during render → hydration mismatch. Move to `useEffect` or a client-only
      boundary.
- [ ] `typeof window !== "undefined"` guards scattered through a component instead
      of a mount effect / `useSyncExternalStore`.
- [ ] Controlled ↔ uncontrolled input switch (`value` going `undefined` → string).
- [ ] Missing loading / empty / error states on an async view — the PR shows the
      happy path only.

### 2.5 TypeScript
- [ ] `any` (explicit or implicit via untyped param) → Biome allows it, the
      reviewer doesn't. Ask for the real type or `unknown` + a narrow.
- [ ] Non-null `!` hiding a `T | undefined` → guard it or make the type honest.
      Biome allows `!`, the reviewer flags it.
- [ ] `as` cast that lies (casting an API response straight to a domain type with no
      validation).
- [ ] `import` used only as a type not written as `import type` → Biome *will* flag
      this (`useImportType` error), so it's a CI break, mention it.
- [ ] Props typed inline and repeated → one exported `Props` type.
- [ ] Enum / union string values that don't match the API's source of truth.

### 2.6 Accessibility (raise as 🟠, occasionally blocking)
- [ ] `onClick` on a `<div>` / `<span>` with no `role`, `tabIndex`, or keyboard
      handler → use a `<button>`.
- [ ] `<img>` with no `alt` (empty `alt=""` for decorative is fine, say so).
- [ ] Form input with no associated `<label>` (`htmlFor` / wrapping).
- [ ] Icon-only button with no `aria-label`.
- [ ] Modal / dialog with no focus trap or no `Esc` to close (shadcn gives this for
      free — flag only hand-rolled ones).
- [ ] Colour-only state indication.

### 2.7 Rendering performance
- [ ] Context `value` that's a fresh object / array literal every render → every
      consumer re-renders. Memoize it.
- [ ] New inline `{}` / `[]` / `() => {}` passed to a `React.memo`'d child or as a
      hook dep → defeats the memo.
- [ ] Expensive compute in render body with no `useMemo` on a component that
      re-renders often — quantify why it's hot.
- [ ] Long list (hundreds+) rendered without virtualization / pagination.
- [ ] `useMemo` / `useCallback` cargo-culted on trivially cheap values → flag *both*
      directions; unnecessary memo is noise and churn.
- [ ] Barrel-file (`index.ts` re-export) import pulling a whole module for one
      symbol → import direct.
- [ ] Usually 🟡 "not a merge blocker, worth doing in the same pass" unless it's a
      visible jank / typing-lag path.

### 2.8 Styling
- [ ] `className` string-concatenated with `+` / template literals instead of
      `cn()` / `clsx`.
- [ ] Arbitrary Tailwind values (`w-[437px]`, `text-[#3b3b3b]`) that should be
      design tokens / theme scale.
- [ ] Inline `style={{}}` for something Tailwind covers.
- [ ] Duplicated long class strings across siblings → extract a variant or a
      component.

### 2.9 Dead code, naming, contract
- [ ] Unused props, commented-out JSX, unreachable branches, `console.log` → remove.
      (`noUnusedVariables` is a Biome error, so unused *vars* fail CI — mention it.)
- [ ] Component / hook names that stopped describing what they do after a refactor.
- [ ] Generic file/dir names (`utils`, `helpers`, `components/common`).
- [ ] Changing a shared component's prop API (rename, remove, change a default) →
      who renders it? grep before merge. On a widely-used primitive, treat like a
      contract change.

### 2.10 Env & dependencies
- [ ] `.env` / `.env.local` committed with real values → **blocking**.
- [ ] `package.json` changed without the lockfile regenerated and committed →
      **blocking**, CI runs `npm ci`.
- [ ] A heavy dependency added for something small / already in the stack (a date
      lib when `Intl` covers it, a state lib for one page).

### 2.11 Tests
- [ ] New component / hook with meaningful logic and no test → React Testing Library,
      query by role / label, `user-event` over `fireEvent`.
- [ ] Test asserting on implementation detail (state, class names) instead of what
      the user sees.
- [ ] Test files: `*.test.ts` / `*.test.tsx` (Biome's override recognises
      `.test.ts` and `.spec.ts`) beside the source.
- [ ] Snapshot test on a large tree that nobody will actually read on failure.

---

## 3. What to let slide

- Formatting Biome owns (tab indent, width 100, quote style, trailing commas).
- `any` / `!` in `*.test.ts` files — Biome's own override relaxes `noExplicitAny`
  there, so don't block on it in tests.
- `noExplicitAny` / `noNonNullAssertion` in genuinely pragmatic one-off spots where
  the author left a comment saying why — ask for the comment, don't block.
- Latent issues with no user-visible impact and no consumer today → `⚪ Minor`.
- `useMemo` that's slightly unnecessary on a cold path → mention once, not a blocker.
- Defensible duplication on a page that will diverge anyway — say so.
- Things you suspected and then checked are fine — **say you checked them**.

---

## 4. How to structure the review

Same as the Nest skill §4:

1. **Review body**: one line of specific praise → numbered "before merge" list
   (2–4 items) → explicit Blocking / Non-blocking split → "details inline".
2. `CHANGES_REQUESTED` for rules-of-hooks breaks, effect leaks, secret leaks,
   server code in a client bundle, index-as-key on reorderable lists, committed
   secrets, lockfile drift. `COMMENT` for everything else and follow-ups.
3. Severity markers only on multi-finding reviews:

| Marker | Means (frontend) |
|---|---|
| 🔴 Blocking | rules-of-hooks violation, effect with no cleanup, `NEXT_PUBLIC_` secret / server code in client bundle, index key on a mutable list, committed `.env`, lockfile not committed |
| 🟠 | real bug / a11y hole, small fix — stale effect dep, controlled/uncontrolled switch, `onClick` on a div |
| 🟡 | render perf / redundancy — unmemoized context value, unnecessary memo |
| ⚪ | latent, no user impact today |
| 🟢 | checked and fine — noted so it isn't re-raised |

4. **Inline**: default one or two sentences. Assert a bug → show the mechanism
   (which render, which dep, what the user sees). Claim a component is unused →
   paste the grep.

---

## 5. Phrasing — same register as the Nest skill

`can we <do X>` / `can you <do X>` standard directive. `lets <do X>` for shared
decisions. `why do we need this?` / `why a new component here?` for challenging
scope. Bare `<verb> this` for trivia. `@name` opener. Lowercase starts, dropped
apostrophes, no sign-off. Hinglish freely with Indian teammates on longer
explanations. `??` for real doubt. Hedge when unsure. Offer to push the fix when
it's bigger than the comment. Give the decision, not a menu.

---

## 6. Anti-patterns for the reviewing agent

- ❌ Blocking on formatting Biome owns, or on `any` in test files.
- ❌ Asking for `useMemo` / `useCallback` everywhere — flag both directions.
- ❌ Asking for a new abstraction / context / wrapper. Bias is toward deleting one.
- ❌ Claiming a re-render problem without naming the trigger. If you can't, say
  "profile this once".
- ❌ Generic "add error handling" / "improve accessibility" with no line anchor.
- ❌ A severity table on a 5-line diff.
- ❌ Approving a shared-primitive prop change because the new API is nicer.

---

## 7. Applying this to a diff — order of operations

1. Read the PR description. One-liner or overclaim → finding.
2. Scan for **new components / hooks / contexts** — most flags start there (2.1).
3. For every `useEffect`: are the deps complete? is there cleanup? could this be
   render-time or server-side instead?
4. Grep the diff for `"use client"` (is it as low as it can be?), `NEXT_PUBLIC_`,
   `useEffect`, `key={i}` / `key={index}`, `Math.random`, `Date.now`, `new Date(`,
   `typeof window`, `: any`, `!.`, `as `, `console.`, inline `style={{`.
5. For every new `"use client"` file: does it import anything server-only?
6. For every list render: is the key stable? is it virtualized if long?
7. For every changed shared component: grep its usages, is a prop contract breaking?
8. `package.json` changed → lockfile regenerated and committed?
9. Write ≤4 "before merge" items, split blocking / non-blocking, rest inline.
10. State what you checked and cleared.
