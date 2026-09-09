---
name: on-call
description: Handle being on call — triage an alert (real vs noise, severity, is it actionable), respond or escalate, keep the shift log, and hand off cleanly. Use when an alert fires, at the start/end of an on-call shift, or when asked "what do I do with this page".
---

# On call

## When an alert fires

1. **Acknowledge** it (stop the escalation timer) — even if you're still reading.
2. **Triage — is it real?**
   - Check the linked runbook and the dashboard it points to.
   - Is the user-facing symptom actually present, or is this a threshold blip?
   - Recent deploy / config change / traffic event that lines up?
3. **Classify:**
   - **Real + user impact** → treat as an incident (`incident/incident-response`), page
     for help if `SEV1/2`.
   - **Real but no user impact yet** (saturation climbing, budget burning slowly)
     → fix it now, before it becomes an incident. Ticket if it can wait to
     morning.
   - **Noise** (flaky alert, expected spike, already self-healed) → note it, and
     **fix or tune the alert** so it doesn't page again for this
     (`observability/define-alerts`). A page that shouldn't have paged is a
     bug.
4. **Can't resolve it?** Escalate early — to the service owner, or the next tier.
   Escalating is not failing; sitting on a `SEV1` alone is.

## During the shift

- Keep a running log: every page, what it was, what you did, was it noise.
- Batch non-urgent findings into tickets, don't context-switch on every one.

## Handoff

- Brief the next person: open issues, anything degraded, alerts that fired and
  why, anything you're watching, any silences you set (and when they expire).
- Un-silence anything that should be live again.

## After the shift

- File the alert-tuning tickets for every noisy page.
- If something paged that had no runbook, write one.

## Anti-patterns

- ❌ Ignoring / not acking a page.
- ❌ Silencing a noisy alert without a ticket to fix it.
- ❌ Sitting on a SEV1 alone instead of escalating.
- ❌ A handoff that's just "nothing happened" when three things are degraded.
- ❌ Leaving a silence in place past the shift.
