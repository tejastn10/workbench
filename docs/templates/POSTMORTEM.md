<!--
Postmortem / incident report template. Copy to docs/incidents/YYYY-MM-DD-slug.md.
- Blameless: describe systems and decisions, never people. Use roles, not names.
- Keep the header as a table; one `---` divider between every section.
- Write it within a few days of resolution, while memory is fresh.
- Replace every [bracketed] placeholder; delete the italic guidance lines.
-->

# 🔥 Incident: [Short description]

> _One sentence: what broke, who was affected, for how long._

| Field              | Value                                        |
| ------------------ | -------------------------------------------- |
| **Status**         | `Investigating` · `Resolved` · `Closed`      |
| **Severity**       | `SEV1` · `SEV2` · `SEV3`                      |
| **Detected**       | [YYYY-MM-DD HH:MM TZ]                         |
| **Resolved**       | [YYYY-MM-DD HH:MM TZ]                         |
| **Duration**       | [Xh Ym]                                       |
| **Author**         | [name]                                        |
| **Responders**     | [name], [name]                               |
| **Services**       | [affected services]                          |
| **Related**        | [Alert](#) · [Dashboard](#) · [Fix PR](#)    |

---

## 📉 Impact

> _Who and what was affected, quantified. Requests failed, users blocked, revenue,
> data loss, SLA breach._

- [impact]

---

## ⏱️ Timeline

> _Chronological, timezone-stamped. Detection, escalation, each diagnostic step,
> mitigation, confirmation. Link the messages / graphs._

| Time (TZ)     | Event                                     |
| ------------- | ----------------------------------------- |
| [HH:MM]       | [what happened / what was done]           |
| [HH:MM]       | [what happened / what was done]           |

---

## 🔍 Root cause

> _The actual mechanism, traced end to end. Not "a bug" — which change, which
> condition, which interaction. Include the contributing factors that made it
> possible or made it worse._

[…]

---

## 🛠️ Resolution

> _What actually stopped the bleeding, and what the permanent fix is (link the PR)._

- **Mitigation** — [what was done to restore service]
- **Permanent fix** — [PR / change]

---

## 🧪 Detection

> _How this was found. Did an alert fire? Was it a customer report? How long
> between the start and detection, and why?_

[…]

---

## 🌱 What went well / what went poorly

**Well**

- [thing]

**Poorly**

- [thing]

**Got lucky**

- [thing that could have been worse]

---

## ✅ Action items

> _Concrete, owned, dated. Prevention first, then detection, then response speed._

| Action              | Type        | Owner  | Due          | Tracking |
| ------------------- | ----------- | ------ | ------------ | -------- |
| [action]            | Prevent / Detect / Respond | [name] | [YYYY-MM-DD] | [#link]  |

---

## 🗒️ Changelog

| Date         | Author | Change        |
| ------------ | ------ | ------------- |
| [YYYY-MM-DD] | [name] | Initial draft |
