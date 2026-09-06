# Context7

Up-to-date, version-pinned library/framework docs pulled live at request time
instead of from the model's training cutoff. Covers the long tail of libraries, so
it replaces most single-framework doc servers.

**Tools:** `resolve-library-id`, `get-library-docs`.

**Auth:** none required. A free API key (context7.com/dashboard) raises rate
limits — pass it as `--api-key` or the `CONTEXT7_API_KEY` env var.

## Claude Code

```bash
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp
# or, with a key:
claude mcp add --scope user context7 -- npx -y @upstash/context7-mcp --api-key $CONTEXT7_API_KEY
```

Or in `.mcp.json` / `~/.claude.json`:

```json
{
  "mcpServers": {
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

Remote alternative (no local process): `https://mcp.context7.com/mcp`
(`--transport http`).

## VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "context7": { "command": "npx", "args": ["-y", "@upstash/context7-mcp"] }
  }
}
```

## Codex (`~/.codex/config.toml`)

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]
```

## Notes

- Needs Node 18+.
- Ask the model to "use context7" in the prompt, or add a rule that doc lookups go
  through it.
- Gotcha: `npx` fetches the package on first run — expect a slow first call.
