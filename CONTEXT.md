# CONTEXT.md

Stub. `CONTEXT.md` is a **per-project** file, not a per-repo one — it does not
belong in workbench itself. This copy just documents the expected shape so I can
drop it into a project and fill it in.

When used in a real project, `CONTEXT.md` records what an agent can't infer from
the code:

- **What this service does** — one paragraph, in plain terms.
- **Stack** — language, framework, package manager, key libraries.
- **Where things live** — the handful of directories that matter.
- **Deviations from `AGENTS.md`** — anything this project does differently, and why.
- **Landmines** — parts that look wrong but aren't, migrations in flight,
  known-fragile areas.
- **How to run it** — dev server, tests, lint, one command each.
