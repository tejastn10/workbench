# skills/observability

Making a service visible in production. Reference stack: OpenTelemetry → the LGTM
stack (Loki / Grafana / Tempo / Mimir), as in the `ember` template.

| Skill                     | Use for                                                   |
| ------------------------- | ----------------------------------------------------- |
| `observability/instrument-service`   | Add traces / RED metrics / structured logs — degrade, never crash |
| `observability/debug-with-traces`    | Locate a prod problem from Grafana → Tempo → Loki       |
| `observability/define-alerts`        | SLOs and burn-rate alerts that page on real user pain    |

Local-repro debugging → `incident/investigate-bug`.
