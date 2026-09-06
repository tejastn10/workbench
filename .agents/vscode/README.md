# VS Code

Setup notes for agent mode in VS Code (GitHub Copilot / Copilot Chat).

## Conventions

Copilot reads two instruction sources, both of which can point at this repo's
`AGENTS.md`:

| File                                  | Scope                                  |
| ------------------------------------- | ------------------------------------- |
| `.github/copilot-instructions.md`     | Repo-wide, auto-loaded                 |
| `.github/instructions/*.instructions.md` | Path-scoped via a `applyTo` glob     |

Keep those thin — one line pointing at `AGENTS.md` plus anything genuinely
VS-Code-specific — rather than duplicating conventions.

```markdown
<!-- .github/copilot-instructions.md -->
Follow the conventions in ./AGENTS.md. Per-project specifics are in ./CONTEXT.md.
```

## Skills

No skills directory. Use a skill by:

- pasting it into Copilot Chat as context for a one-off (e.g. a PR review), or
- referencing its path from `.github/copilot-instructions.md` if it applies
  repo-wide.

## MCP — `.vscode/mcp.json`

```json
{
  "servers": {
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] },
    "deepwiki": { "type": "http", "url": "https://mcp.deepwiki.com/mcp" }
  }
}
```

GitHub is handled by the built-in GitHub integration / `gh` — no MCP server.

## Notes

- `.vscode/mcp.json` can be committed; keep any secrets in `${input:...}` prompts,
  not inline.
