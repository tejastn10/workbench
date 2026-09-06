# MCP

Model Context Protocol server configs, shared across agents. One file per server
(what it's for, config for each client, auth, gotchas).

| Server                       | For                                                     | Auth        |
| ---------------------------- | ----------------------------------------------------- | ----------- |
| [`context7.md`](context7.md) | Live, version-pinned library docs (long tail)         | none / opt key |
| [`deepwiki.md`](deepwiki.md) | Auto-generated architecture docs for public GitHub repos | none        |

GitHub PR / issue history goes through the `gh` CLI, not an MCP server — see
[`../github-cli.md`](../github-cli.md). Context7 already covers version-pinned docs
for individual frameworks, so there are no per-framework servers.

## Combined Claude Code `.mcp.json`

Drop into a project, or `~/.claude.json` for global:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    },
    "deepwiki": {
      "type": "http",
      "url": "https://mcp.deepwiki.com/mcp"
    }
  }
}
```

Verify with `/mcp` in a session — both should show `connected`.

## Install targets

- **Claude Code** — `~/.claude.json` (global) or a project `.mcp.json`
- **VS Code** — `.vscode/mcp.json`
- **Codex** — `~/.codex/config.toml`
