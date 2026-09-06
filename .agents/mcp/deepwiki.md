# DeepWiki

Auto-generated architecture docs for any public GitHub repo. Useful for getting
oriented in an unfamiliar dependency without cloning and reading it.

**Tools:** `read_wiki_structure` (topic list for a repo), `read_wiki_contents`
(the generated docs), `ask_question` (grounded Q&A about a repo).

**Auth:** none. Remote, free, public repos only.

## Claude Code

```bash
claude mcp add --transport http deepwiki https://mcp.deepwiki.com/mcp
```

Or in `.mcp.json`:

```json
{
  "mcpServers": {
    "deepwiki": {
      "type": "http",
      "url": "https://mcp.deepwiki.com/mcp"
    }
  }
}
```

## VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "deepwiki": { "type": "http", "url": "https://mcp.deepwiki.com/mcp" }
  }
}
```

## Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.deepwiki]
url = "https://mcp.deepwiki.com/mcp"
```

## Notes

- `https://mcp.deepwiki.com/sse` is the legacy transport, being deprecated — use
  `/mcp`.
- Private repos aren't covered. For those, clone and read, or use the GitHub MCP.
- Docs are DeepWiki's generation, not the maintainers' — treat as a map, verify
  specifics against source.
