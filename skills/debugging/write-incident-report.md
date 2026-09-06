---
name: write-incident-report
description: Write a blameless postmortem using Tejas's template — table header, timezone-stamped timeline, root cause traced end to end, owned and dated action items. Systems and decisions, never people. Use when asked to "write a postmortem", "do the incident writeup", "RCA for X", after a SEV is resolved.
---

# Write an incident report

Fills in [`../../docs/templates/POSTMORTEM.md`](../../docs/templates/POSTMORTEM.md).

## Principles

- **Blameless.** Describe systems, code, and decisions — never individuals. Use
  roles ("the on-call", "the deploy") not names. If a human action contributed, the
  finding is "the system allowed / didn't catch it", not "person X did Y".
- **Mechanism over narrative.** The root cause is a traced chain, the same standard
  as [`investigate-bug.md`](investigate-bug.md) — which change, which condition,
  which interaction.
- **Timely.** Write within a few days, while the timeline is still recoverable from
  memory and chat history.

## Process

1. **Rebuild the timeline** from alerts, chat, deploy logs, dashboards. Timezone-
   stamp every entry: detection, escalation, each diagnostic step, mitigation,
   confirmation of recovery.
2. **Quantify impact** — requests failed, users affected, duration, data loss, SLA.
   Real numbers, not "some users".
3. **Trace the root cause** end to end, including contributing factors (what made it
   possible, what made it worse, why it wasn't caught sooner).
4. **Separate mitigation from fix** — what stopped the bleeding vs the permanent
   change (link the PR).
5. **Analyse detection** — how it was found, time-to-detect, and why that long.
6. **What went well / poorly / got lucky** — honest, specific.
7. **Action items** — every one concrete, owned, dated, tracked. Order: prevent
   first, then detect faster, then respond faster. Don't let it become a wishlist;
   3–6 real items beats 20 aspirational ones.
8. **Save** to `docs/incidents/YYYY-MM-DD-<slug>.md`. Status `Resolved` →
   `Closed` once action items are filed.

## House conventions

- Header is a table. One `---` between every section. Emoji H2s as in the template.
- Severity: `SEV1` (major outage / data loss), `SEV2` (significant degradation),
  `SEV3` (minor / contained).
- Conventional-commit: `docs: add postmortem for <incident>`.

## Anti-patterns

- ❌ Naming or implying blame on a person.
- ❌ "Human error" as a root cause — that's where the analysis starts, not ends.
- ❌ A vague timeline with no timestamps.
- ❌ Action items with no owner or no date.
- ❌ Conflating the mitigation with the permanent fix.
