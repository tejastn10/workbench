# skills/scaffolding

Bootstrapping skills. The bias is **reuse an existing template**, never hand-roll a
new tool/lint/CI setup.

| Skill                        | Use for                                        |
| ---------------------------- | --------------------------------------------- |
| `scaffold-project.md`        | A new repo / service — picks the closest template, applies the standard baseline |
| `scaffold-nestjs-module.md`  | A new feature module inside an existing Nest service |

Baseline every repo gets: house-style README, MIT `LICENSE.md`, commitlint
conventional config, husky `commit-msg` / `pre-commit` / `pre-push` hooks,
`security-audit` workflow, issue/PR templates, version pin file. See
[`../../AGENTS.md`](../../AGENTS.md) for commit and branch conventions.
