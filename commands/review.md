---
description: Review the current diff / PR the way Tejas reviews — picks the right per-stack pr-review skill.
argument-hint: "[PR number or branch]"
---

Review $ARGUMENTS (or the current diff if empty).

Pick the matching skill by stack: `pr-review/nestjs-backend-pr-review`,
`pr-review/go-backend-pr-review`, `pr-review/python-backend-pr-review`,
`pr-review/react-frontend-pr-review`, or `pr-review/devops-pr-review`. If the
change touches auth, user input, files, external requests, or dependencies, also
run `security/security-review`.
