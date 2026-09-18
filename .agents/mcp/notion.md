# Notion

Search, read, and write a Notion workspace — pages, databases, comments, users —
without leaving the session. Also reaches connected sources (Slack, Google Drive,
Jira) through `notion-search` when those connections exist.

**Tools:** 36 total, covering search, page/database CRUD, views, comments, and
Notion's Custom Agents. Core ones: `notion-search`, `notion-fetch`,
`notion-create-pages`, `notion-update-page`, `notion-create-database`,
`notion-create-comment`, `notion-get-comments`, `notion-get-users`.

**Auth:** OAuth on the hosted server (prompts a browser authorization the first
time; no token to manage) — the default. The self-hosted npm package instead
needs a Notion internal-integration token (`ntn_…`, from
[notion.so/my-integrations](https://www.notion.so/my-integrations)), and that
integration must be explicitly shared on every page/database it should reach —
a fresh integration sees nothing until you share pages with it.

## Claude Code — hosted (recommended)

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

Then run `/mcp` in a session and follow the OAuth flow. Or in `.mcp.json` /
`~/.claude.json`:

```json
{
  "mcpServers": {
    "notion": {
      "type": "http",
      "url": "https://mcp.notion.com/mcp"
    }
  }
}
```

## Self-hosted alternative (token-based, no OAuth)

```json
{
  "mcpServers": {
    "notion": {
      "command": "npx",
      "args": ["-y", "@notionhq/notion-mcp-server"],
      "env": { "NOTION_TOKEN": "ntn_your_integration_token" }
    }
  }
}
```

## VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "notion": { "type": "http", "url": "https://mcp.notion.com/mcp" }
  }
}
```

## Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.notion]
url = "https://mcp.notion.com/mcp"
```

## Notes

- Prefer the hosted server — OAuth means no token to store, rotate, or leak, and
  it's what the Claude Code / VS Code examples above assume.
- The self-hosted package's older env var, `OPENAPI_MCP_HEADERS` (a JSON blob
  with an `Authorization: Bearer …` header and a `Notion-Version`), still works
  but `NOTION_TOKEN` is the current documented one — use it unless you need a
  header the simple form doesn't expose.
- Workspace owners manage or revoke a connection under Settings → Connections;
  org admins can do the same per member via the Admin API.
- 36 tools is a lot of always-loaded surface. If tool-list bloat matters more
  than Notion access, this is a case for `disabledTools` / a narrower per-project
  `.mcp.json` rather than the global one.
