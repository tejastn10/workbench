# skills/incident

When something is broken — from a single bug to a live outage.

| Skill                   | Use for                                                     |
| ----------------------- | ------------------------------------------------------- |
| `incident/investigate-bug`    | Work a bug: reproduce → isolate → one hypothesis → trace → fix at the right altitude |
| `incident/incident-response`  | Run a live incident — severity, roles, mitigate before fixing, communicate, timeline |
| `incident/on-call`            | Triage an alert, respond or escalate, shift log and handoff |
| `incident/postmortem`         | Blameless write-up after a SEV (template `../../docs/templates/POSTMORTEM.md`) |

Flow: alert (`incident/on-call`) → if user impact, `incident/incident-response` → `incident/investigate-bug`
for the mechanism → `incident/postmortem`. Prod problems with telemetry →
`observability/debug-with-traces`. Regression hunt → `quality/bisect`.
