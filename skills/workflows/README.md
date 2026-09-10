# skills/workflows

**Orchestrators** — skills that don't do the work themselves but invoke the right
sequence of other skills for a whole task, with the handoff between each stage.
This is how a task picks a *bundle* of skills instead of one.

| Skill                 | Use for                                                     |
| --------------------- | ------------------------------------------------------- |
| `workflows/new-feature`      | Greenfield feature spanning multiple sessions — grill → PRD → phases → build → ship |
| `workflows/ship-change`      | Bounded one-session change — orient → domain skill → tdd → deslopify → commits → review → deploy |
| `workflows/handle-incident`  | Production incident — on-call → response → mitigate → root cause → hotfix → postmortem |
| `workflows/adopt-repo`       | One-time repo onboarding — orient → CONTEXT.md → install skills → record deviations |

## How this works

A workflow skill's `description` is broad ("starting a feature", "we have an
incident") so the agent loads it when you describe the task. Its body is an ordered
table of **which skill to invoke at each stage** (via the Skill tool) and what each
stage produces for the next. Individual skills also cross-link their neighbours, so
even without a workflow the chain tends to form (`planning/write-prd` says "grill first").

Add a workflow when you notice yourself running the same 4–8 skills in the same
order for a recurring kind of task.

Full guide — the concept, the four trigger methods, an example:
[`../../docs/composing-skills.md`](../../docs/composing-skills.md).
