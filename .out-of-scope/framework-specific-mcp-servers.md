# Per-framework doc MCP servers

Proposed: add dedicated MCP servers for the frameworks in daily use (a Next.js
server, a Vercel server, a NestJS server, etc.) for first-class docs.

## Why this is out of scope

Context7 already covers version-pinned docs for essentially every library and
framework, including all of these. Running a separate server per framework means
more processes, more config drift, and more tool-list bloat for marginal gain over
what Context7 returns.

Reconsider only if a specific framework server offers something Context7
structurally can't — e.g. live project state, deploy status, or interactive
scaffolding — rather than just docs.

## Prior requests

- Workbench MCP setup discussion (2026-09-06).
