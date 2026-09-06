# MCP

Model Context Protocol server configs, shared across agents. One file per server
(what it's for, config for each client, auth, gotchas).

| Server                       | For                                                     | Auth        |
| ---------------------------- | ----------------------------------------------------- | ----------- |
| [`context7.md`](context7.md) | Live, version-pinned library docs (long tail)         | none / opt key |
| [`deepwiki.md`](deepwiki.md) | Auto-generated architecture docs for public GitHub repos | none        |

**GitHub** is deliberately not an MCP server here — the `gh` CLI covers PR / issue
history and it's already authenticated. See
[`../github-cli.md`](../github-cli.md) and
[`../../.out-of-scope/github-mcp-server.md`](../../.out-of-scope/github-mcp-server.md).

Framework-specific doc servers (Next.js, Vercel, …) are also out — Context7 covers
the long tail. See
[`../../.out-of-scope/framework-specific-mcp-servers.md`](../../.out-of-scope/framework-specific-mcp-servers.md).

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
