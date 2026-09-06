# .agents

Agent-specific configuration and notes — the bits that differ per tool, plus
shared setup that isn't a convention.

| Path                  | Contents                                                    |
| --------------------- | ---------------------------------------------------------- |
| `mcp/`                | MCP server configs + per-server setup notes                |
| `external-skills.md`  | Skill sets worth installing rather than rewriting (Matt Pocock's, …) |
| `github-cli.md`       | GitHub access via `gh` (used instead of a GitHub MCP server) |
| `claude-code/`        | Skills/MCP/settings locations, `settings.example.json`, commit-trailer note |
| `vscode/`             | Copilot instruction files, `.vscode/mcp.json`              |
| `codex/`              | `AGENTS.md` native support, `~/.codex/config.toml` MCP block |

Tool-agnostic conventions live in [`../AGENTS.md`](../AGENTS.md), not here.
