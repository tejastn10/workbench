<!--
PRD template. Copy to docs/prd/<slug>.md and fill in.
- Keep the header as a table.
- Keep one `---` divider between every section.
- Replace every [bracketed] placeholder; delete the italic guidance lines as you go.
- Delete a section only if it genuinely doesn't apply — never leave it empty.
-->

# 📄 [Feature / Project Name]

> _One sentence: what this delivers and for whom._

| Field              | Value                                                        |
| ------------------ | ----------------------------------------------------------- |
| **Status**         | `Draft` · `In Review` · `Approved` · `Rejected` · `Superseded` |
| **Author**         | [name]                                                       |
| **Reviewers**      | [name], [name]                                               |
| **Stakeholders**   | [team / person]                                              |
| **Created**        | [YYYY-MM-DD]                                                 |
| **Last updated**   | [YYYY-MM-DD]                                                 |
| **Target release** | [version / sprint / date]                                    |
| **Related**        | [Ticket](#) · [Design](#) · [RFC / ADR](#)                   |

---

## 🧭 Summary

> _Three to five sentences. A reader should finish this paragraph knowing what is
> being built, why now, and what "done" looks like._

[…]

---

## 🔍 Problem

> _What is broken or missing today — who feels it, how often, what it costs. Bring
> data if you have it._

- **Context** — [how it works now]
- **Pain** — [the specific gap]
- **Why now** — [what makes this the right time]

---

## 🎯 Goals

> _Outcomes this PRD commits to. Each measurable or observable._

1. [goal]
2. [goal]
3. [goal]

---

## 🚫 Non-goals

> _Explicitly out of scope. Be generous here — this is what stops scope creep in
> review._

- [non-goal]
- [non-goal]

---

## 💡 Proposal

> _The proposed solution at a level a new team member could follow. Lead with the
> shape of the change, then the detail._

### Overview

[narrative description]

### User stories

| As a…      | I want to…   | So that…    |
| ---------- | ------------ | ----------- |
| [persona]  | [action]     | [benefit]   |

### Functional requirements

| #   | Requirement   | Priority              |
| --- | ------------- | --------------------- |
| FR1 | [requirement] | Must / Should / Could |
| FR2 | [requirement] | Must / Should / Could |

### Non-functional requirements

> _Performance, scale, security, accessibility, observability, compliance._

- [NFR]
- [NFR]

---

## 🔀 Alternatives considered

> _What else was on the table and why it lost. One subsection per alternative._

### [Alternative A]

- **What** — [summary]
- **Why not** — [reason]

### Do nothing

- **Cost of inaction** — [what happens if nothing ships]

---

## 🚀 Rollout plan

> _How this reaches production safely, and how it can be undone._

| Phase | Scope                | Gate to advance |
| ----- | -------------------- | --------------- |
| 1     | [internal / flag off] | [criteria]      |
| 2     | [% rollout / beta]    | [criteria]      |
| 3     | [GA]                  | —               |

- **Feature flag** — [name / default]
- **Migration** — [schema/data changes, backfill, order of operations]
- **Rollback** — [how to revert, and what state is left behind]

---

## ⚠️ Risks & mitigations

| Risk   | Likelihood       | Impact           | Mitigation   |
| ------ | ---------------- | ---------------- | ------------ |
| [risk] | Low / Med / High | Low / Med / High | [mitigation] |

---

## 📊 Success metrics

> _Name the metric, its current baseline, and the target._

| Metric   | Baseline | Target  | How measured       |
| -------- | -------- | ------- | ------------------ |
| [metric] | [value]  | [value] | [dashboard / query] |

---

## ❓ Open questions

> _Unresolved decisions. Every row gets an owner and a needed-by date._

| Question   | Owner  | Needed by    |
| ---------- | ------ | ------------ |
| [question] | [name] | [YYYY-MM-DD] |

---

## 📎 Appendix

> _Links, diagrams, raw research, prior art, glossary — anything useful that would
> clutter the body._

- [link / note]

---

## 🗒️ Changelog

| Date         | Author | Change        |
| ------------ | ------ | ------------- |
| [YYYY-MM-DD] | [name] | Initial draft |
