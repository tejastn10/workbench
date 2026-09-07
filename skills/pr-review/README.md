# skills/pr-review

Distilled from ~120 real review comments (NestJS/TS backend), then carried onto the
other stacks. `pr-review/nestjs-backend-pr-review` is the canonical reference for voice,
severity markers, and review structure; the others point back to its §4–§5 and add
a stack-specific checklist.

| Skill                         | Stack                        | Priority order    |
| ----------------------------- | ---------------------------- | ----------------- |
| `pr-review/nestjs-backend-pr-review` | NestJS / TypeScript, Go SDK  | reuse-first       |
| `pr-review/go-backend-pr-review`     | Go services, CLIs, consumers | correctness-first |
| `pr-review/python-backend-pr-review` | Python / Poetry, FastAPI     | reuse-first       |
| `pr-review/react-frontend-pr-review` | React / Next.js / Vite       | reuse-first       |
| `pr-review/devops-pr-review`         | GitHub Actions, Docker, CI   | safety-first      |

Building a review skill for a new stack from your own comment corpus →
`meta/distill-review-style`. A deeper whole-surface security pass →
`security/security-review`.
