---
name: devops-pr-review
description: Review a DevOps / CI-CD / infra PR the way Tejas reviews — secrets exposure first, then supply-chain pinning and least-privilege, then reproducibility, Dockerfile hygiene, CI correctness, and release/versioning. GitHub Actions, Dockerfiles, docker-compose, release workflows. Terse blocking/non-blocking split, same register as nestjs-backend-pr-review. Use when reviewing a PR that touches .github/workflows, Dockerfile, docker-compose, scripts, or deployment config, or when asked to "review this pipeline like I would".
---

# DevOps PR review — house style

Same reviewer, same voice as `pr-review/nestjs-backend-pr-review`.
DevOps review is **safety-first**, not reuse-first: a bad workflow leaks a token or
ships an unreproducible image, and that's a bigger problem than a duplicated step.

Conventions from the repos: PR-triggered `lint` / `unit-test` / `security-audit`
workflows (`on: pull_request`, `types: [edited, opened, synchronize]`), tag-triggered
`release` / `docker-image` workflows (`on: push: tags: ["v*.*.*"]`), **multi-stage
Dockerfiles** (builder → `alpine`, `CGO_ENABLED=0`, `ca-certificates` added
explicitly), **buildx multi-arch** (`linux/amd64,linux/arm64`), push to **GHCR +
Docker Hub** via `docker/metadata-action` semver tags with `type=gha` cache,
`softprops/action-gh-release` for releases, `docker-compose.yml` for local infra
(postgres / mongo / redis / the LGTM stack), husky + commitlint, per-stack security
scanners (`gosec` + `govulncheck`, `npm audit --audit-level=low`, `safety`).

Read §5 of the Nest skill for the register; this file is the DevOps checklist.

---

## 1. The one-line summary of the style

**Where does the secret go; what's unpinned; who can this token touch.**
One or two sentences per comment, lowercase, `@name`, question or directive. When
you flag a risk, name the concrete blast radius — "this runs on `pull_request` from
forks, so any PR can read `secrets.TOKEN`".

---

## 2. What to flag — the recurring standards

### 2.1 Secrets and credential exposure — **the first thing to check**
- [ ] A secret `echo`'d, printed, written to a file that gets uploaded as an
      artifact, or interpolated into a log line → **blocking**.
- [ ] `pull_request_target` used with a checkout of the PR head, or `secrets`
      exposed to a workflow that runs untrusted PR code → **blocking**, that's the
      classic exfiltration hole.
- [ ] Secret passed as a build `ARG` (lands in image history / `docker history`) →
      use build secrets / mounts, or inject at runtime.
- [ ] `.env`, `.env.local`, `*.pem`, kubeconfig, service-account JSON committed with
      real values → **blocking**. Dev placeholders (`password`, `localhost`) get a
      one-line "confirm these are throwaway and nothing real reuses them".
- [ ] A new secret referenced but not documented (where does it come from, who
      rotates it) → ask.
- [ ] `GITHUB_TOKEN` / PAT with more scope than the job needs.

### 2.2 Supply chain — pin everything
- [ ] Third-party action referenced by a moving tag (`@v4`, `@main`) for anything
      security-sensitive → prefer a full commit SHA, or at least a pinned release.
      First-party (`actions/*`, `docker/*`) by major tag is the accepted baseline
      here — match the surrounding files.
- [ ] Docker base image as `:latest` or an unpinned major → pin to a specific
      version (and ideally a digest for the runtime stage). `golang:1.23` is fine;
      `golang:latest` is not.
- [ ] `curl … | bash` / `go install …@latest` / `pip install` without a version in
      a pipeline → pin it; `@latest` makes the build non-reproducible and is a
      supply-chain surface.
- [ ] New package registry / install source added → is it trusted, is it needed.

### 2.3 Least privilege
- [ ] Workflow with no top-level `permissions:` block → it inherits the repo default
      (often write-all). Add an explicit minimal block; escalate per-job only where
      needed (`contents: write` for releases, `packages: write` for GHCR).
- [ ] `permissions: write-all` or broad `contents: write` on a job that only reads.
- [ ] A deploy / release job with no environment protection or approval gate on a
      production target.
- [ ] Cloud credentials with a wildcard policy where a scoped role would do (tag the
      platform owner rather than deciding for them).

### 2.4 Reproducibility and determinism
- [ ] Install step that doesn't use the lockfile (`npm install` not `npm ci`,
      `go get` not `go mod download`, `pip install` not a locked file) → **blocking**
      for release builds.
- [ ] Lockfile changed by the PR but the manifest not, or vice versa → out of sync.
- [ ] Build depends on wall-clock time, network state, or an external mutable
      resource with no pin.
- [ ] Cache key that doesn't include the lockfile hash → stale deps, or a cache that
      never invalidates. `type=gha` for buildx is fine; hand-rolled `actions/cache`
      needs a real key.
- [ ] Toolchain bump (go `1.22 → 1.25`, node major) → confirm CI matrix, Dockerfile
      base image, and any ECS / runtime base all move together.

### 2.5 Dockerfile hygiene
- [ ] Single-stage build shipping the compiler / dev deps / source in the runtime
      image → multi-stage, copy only the artifact.
- [ ] Runs as root with no `USER` directive → add a non-root user for the runtime
      stage.
- [ ] `COPY . .` before `RUN` install steps → busts the dependency layer cache on
      every source change. Copy the manifest + lockfile, install, *then* copy source.
- [ ] No `.dockerignore` (or one that misses `.git`, `node_modules`, `dist`) → fat
      context, secrets risk.
- [ ] `apt-get install` / `apk add` without `--no-cache` / without cleaning lists →
      image bloat.
- [ ] `latest` in `FROM`, or missing `ca-certificates` for a static binary that
      makes HTTPS calls (the alpine runtime stage needs it added explicitly).
- [ ] `ADD` where `COPY` would do; `ADD` of a remote URL.
- [ ] No `HEALTHCHECK` on a long-running service image (non-blocking, but ask).
- [ ] Multi-arch: `platforms:` list changed → does the base image support all of
      them, does QEMU setup exist for cross-build.

### 2.6 CI workflow correctness
- [ ] New workflow's triggers: does `on:` match intent? `types: [edited, opened,
      synchronize]` is the house pattern for PR checks — a new PR workflow that
      omits `synchronize` won't re-run on pushes.
- [ ] Path filters missing / wrong → a docs-only change running the full matrix, or
      a critical check that a `paths-ignore` silently skips.
- [ ] `continue-on-error: true` on a check that's supposed to gate merge → it goes
      green regardless. **Blocking** if it's the security or test job.
- [ ] `if:` condition that can't be true, or is always true → dead / accidental.
- [ ] Job added but not in branch-protection required checks → it's advisory only;
      tag the repo owner.
- [ ] Matrix that lost `fail-fast` consideration, or a `max-parallel` that starves
      other jobs.
- [ ] Concurrency group missing on a deploy workflow → two merges deploy on top of
      each other.
- [ ] Long-lived runner steps with no `timeout-minutes` → a hung job burns minutes
      until the 6h ceiling.

### 2.7 Release and versioning
- [ ] Release triggered by something other than the agreed signal (tag push
      `v*.*.*` here) → or a tag format that `docker/metadata-action` semver patterns
      won't match.
- [ ] Version bumped in one place but not the others (`package.json`, `pyproject`,
      a constants file, the chart).
- [ ] Changelog / release notes generated from nothing (empty `## Changelog`
      section) when conventional-commit history could fill it.
- [ ] `draft: false` / `prerelease: false` on a workflow that should stage first.
- [ ] No rollback path documented for a deploy change.
- [ ] `latest` tag pushed from a non-default branch (`enable={{is_default_branch}}`
      guard missing).

### 2.8 Config, env, and dead environments (same as Nest §2.4)
- [ ] Infra connection details hardcoded in compose / manifests instead of env.
- [ ] Config blocks / jobs for environments that don't exist → *"remove this, we
      dont have a dev env for this service"*.
- [ ] Required env / secret keys nothing consumes.
- [ ] Services / containers wired up but never used → comment out now, remove in a
      separate PR.

### 2.9 Reuse (below safety, still flagged)
- [ ] The same 20 lines of setup copy-pasted across `lint.yml`, `unit-test.yml`,
      `security-audit.yml` → a composite action or a reusable workflow.
- [ ] A new bespoke script doing what an existing well-known action already does.
- [ ] Same change needed across sibling repos → say so, or ask if it belongs in a
      shared `.github` repo.

---

## 3. What to let slide

- `actions/*` and `docker/*` pinned by major tag rather than SHA — that's the
  established baseline in these repos; only push for SHA pinning on new third-party
  actions.
- YAML formatting / key order.
- A committed `.env` that is unambiguously local placeholders (`localhost`,
  `password`) — one line to confirm, not a blocker.
- Micro-optimizing image size on a rarely-built internal tool.
- Latent misconfig on a workflow path that can't currently trigger → `⚪ Minor`.
- Things you suspected and then verified are fine — **say you checked them**.

---

## 4. How to structure the review

Same as the Nest skill §4:

1. **Review body**: one line of specific praise → numbered "before merge" list
   (2–4 items) → explicit Blocking / Non-blocking split → "details inline".
2. `CHANGES_REQUESTED` for secret exposure, `pull_request_target` misuse,
   non-reproducible release builds, `continue-on-error` on a gate, root runtime
   image with a clear fix. `COMMENT` for everything else and follow-ups.
3. Severity markers only on multi-finding reviews:

| Marker | Means (DevOps) |
|---|---|
| 🔴 Blocking | secret printed / exfiltratable, `pull_request_target` + PR checkout, committed real credentials, `npm install` in a release build, security job with `continue-on-error`, `:latest` base image in a release |
| 🟠 | real risk, small fix — missing `permissions` block, unpinned new third-party action, `COPY . .` before install |
| 🟡 | redundancy / efficiency — duplicated setup blocks, image bloat |
| ⚪ | latent, path can't trigger today |
| 🟢 | checked and fine — noted so it isn't re-raised |

4. **Inline**: default one or two sentences. When you flag a risk, name the blast
   radius and the trigger. When you claim a job is dead, show the `if:` / trigger
   that proves it.

---

## 5. Phrasing — same register as the Nest skill

`can we pin this`, `lets not run this on forks`, `why does this job need
contents: write?`, bare `pin this` / `add a permissions block` for trivia. `@name`
opener, `@owner` when it crosses into branch-protection / cloud IAM / cost.
Lowercase starts, dropped apostrophes, no sign-off. Hinglish freely with Indian
teammates on the longer explanations. `??` for real doubt. Hedge when unsure. Offer
to push the fix when it's bigger than the comment. Give the decision, not a menu.

---

## 6. Anti-patterns for the reviewing agent

- ❌ Demanding SHA-pinning on `actions/checkout` when every other workflow in the
  repo uses `@v4` — match the baseline, flag only new third-party actions.
- ❌ Generic "follow security best practices" with no line anchor and no blast
  radius.
- ❌ Claiming a workflow leaks a secret without tracing which step and which
  trigger exposes it.
- ❌ A severity table on a 3-line YAML change.
- ❌ Bikeshedding image size on a tool built twice a month.
- ❌ Blocking a whole PR on a `HEALTHCHECK` nicety.

---

## 7. Applying this to a diff — order of operations

1. Read the PR description. One-liner or overclaim → finding.
2. Every `secrets.*` reference: where does that value end up? logs, artifacts,
   image history, a fork-triggered run?
3. Every `on:` trigger: can this run untrusted code with secrets in scope?
4. Grep the diff for `pull_request_target`, `@main`, `@latest`, `:latest`,
   `write-all`, `continue-on-error`, `npm install`, `curl`, `| bash`, `echo "$`,
   `ARG` + secret-ish names.
5. Every workflow: is there a top-level `permissions:` block, and is it minimal?
6. Every Dockerfile: multi-stage? non-root runtime? manifest copied before source?
   base image pinned? `.dockerignore` present?
7. Every install step: does it use the lockfile? is the lockfile in sync with the
   manifest?
8. Toolchain / base-image bump → do CI, Docker, and runtime all move together?
9. Release workflow: right trigger, versions in sync, changelog populated, `latest`
   guarded to the default branch?
10. Write ≤4 "before merge" items, split blocking / non-blocking, rest inline.
11. State what you checked and cleared.
