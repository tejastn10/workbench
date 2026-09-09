# skills/deployment

Getting changes to production and back — migrations, rollout, release, and
recovery. The `pr-review/devops-pr-review` skill reviews pipelines; these run them.

| Skill                | Use for                                                     |
| -------------------- | ------------------------------------------------------- |
| `deployment/data-migration`  | Live schema change — additive first, batched backfill, no long locks, reversible |
| `deployment/code-migration`  | Implementation / API / service cutover — feature flag, shadow run, ramp, fallback, kill switch |
| `deployment/deploy-service`  | Safe rollout — ordered steps, canary, watch the right signals |
| `deployment/cut-release`     | Next semver from conventional commits, grouped release notes, tag |
| `deployment/rollback`        | Get prod back to known-good fast — flag / redeploy / revert, and the migration problem |
| `deployment/hotfix`          | Urgent prod fix — minimal change, branch from the tag, expedited review, backport |

Order: schema migrates first (additively), then the code cutover, then the
release. Sequence multi-stage rollouts as phases
(`planning/phased-delivery`). A live incident → `../incident/`.
