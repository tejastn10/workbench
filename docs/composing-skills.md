# Composing skills

Most tasks need **several skills, in order** — plan, then design, then build, then
review, then ship. Using them together is called **skill composition** (or
orchestration). This is how to leverage it.

---

## The pieces

| Term | What it is |
| --- | --- |
| **Skill** | one packaged instruction set — a `SKILL.md` in `skills/<category>/` |
| **Composition / orchestration** | using several skills for one task |
| **Workflow skill** (orchestrator, playbook) | a skill whose body is an ordered list of *which other skills to invoke when* — lives in `skills/workflows/` |
| **Workflow** | the end-to-end sequence itself |

---

## How skills get picked

1. **Descriptions route.** Every skill's frontmatter `description` is packed with
   trigger phrases ("review this PR", "cut a release", "we have an incident").
   When skills are installed, the agent reads all the descriptions and **loads the
   matching one automatically** — you describe the task, you don't hand-pick.
2. **Skills invoke skills.** A skill body can call the `Skill` tool for another
   skill. `workflows/new-feature` says "now invoke `planning/grill`", "now invoke
   `pr-review/nestjs-backend-pr-review`", in sequence.
3. **Skills cross-reference.** `write-prd` says "run `grill` first";
   `ship-change` step 4 says "then `deslopify`". Chains form even without a
   workflow.

**Prerequisite:** run `scripts/install-skills.sh` so every `SKILL.md` is in
`~/.claude/skills/` where the agent can see its description.

---

## Four ways to trigger a bundle

### A — Just describe the task (no setup)

> "let's build the reports-export endpoint, it's a sizeable feature"

The agent matches that to `workflows/new-feature` and walks the sequence.

### B — Slash command (one-word trigger)

`~/.claude/commands/feature.md` (global) or `<project>/.claude/commands/feature.md`:

```md
Follow ~/workbench/skills/workflows/new-feature/SKILL.md for: $ARGUMENTS
```

Then: `/feature add rate limiting`

### C — Name the workflow

> "use the ship-change workflow for this fix"

### D — Chain by hand

> "grill me on this, then draft the PRD, then break it into phases"

The agent loads each skill as you name it.

---

## The workflows in this repo

| Workflow | For | Chain (abridged) |
| --- | --- | --- |
| `workflows/new-feature` | multi-session feature | grill → evaluate-dependency → write-prd → design-\* → phased-delivery → *(per phase)* scaffold → tdd → deslopify → split-commit → pr-review → security-review → tag → deploy → cut-release |
| `workflows/ship-change` | bounded one-session change | orient → domain skill (data/queues/design) → tdd → deslopify → split-commit → pr-review → security-review *(if warranted)* → deploy |
| `workflows/handle-incident` | production incident | on-call → incident-response → rollback/mitigate → investigate-bug / debug-with-traces / bisect → hotfix → postmortem |
| `workflows/adopt-repo` | first time in a repo | orient → CONTEXT.md → install-skills → point at AGENTS.md → record deviations → seed .out-of-scope |

---

## Example — building an endpoint

| You say | Agent invokes |
| --- | --- |
| "build the /reports export endpoint, sizeable" | `workflows/new-feature` |
| *(it interviews you)* | `planning/grill` |
| *(drafts spec, you review)* | `planning/write-prd` |
| *(the contract)* | `design/design-endpoint` + `design/design-schema` |
| *(phase list, you approve)* | `planning/phased-delivery` |
| **per phase** | `design/scaffold-nestjs-module` → `quality/tdd` → `quality/deslopify` → `quality/split-commit` → `pr-review/nestjs-backend-pr-review` → `security/security-review` → tag |
| ship | `deployment/deploy-service` → `deployment/cut-release` |

---

## Notes & limits

- A workflow is a **checklist the agent follows**, not hard automation — it still
  invokes each skill step by step.
- Auto-routing isn't perfect. Nudge it: "also run the security review", "skip the
  scaffold, the module exists".
- Each phase of `new-feature` is its own fresh session — clear/compact at the
  boundary (see `planning/phased-delivery`).
- **Write a new workflow** when you notice yourself running the same 4–8 skills in
  the same order for a recurring kind of task. Use `meta/write-skill`.
