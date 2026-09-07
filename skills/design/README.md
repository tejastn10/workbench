# skills/design

Designing and creating new structure — API and event contracts, data schema, and
scaffolding it into a service.

| Skill                          | Use for                                                  |
| ------------------------------ | --------------------------------------------------- |
| `design/design-endpoint`           | REST/RPC endpoint — resource, shape, status codes, pagination, `v1/` |
| `design/evolve-contract`           | Classify a change compatible vs breaking; version breaking ones |
| `design/design-event`              | Schema and semantics of a domain event / queue message   |
| `design/design-schema`             | Model a table/collection from the access patterns        |
| `design/scaffold-project`          | New repo/service — pick a template, apply the baseline    |
| `design/scaffold-nestjs-module`    | New feature module in an existing Nest service            |

The contract on live APIs does not change (`design/evolve-contract`). Running a schema
change → `deployment/data-migration`. Query/index tuning → `../data/`.
