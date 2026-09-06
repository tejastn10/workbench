# The GitHub MCP server

Proposed: add the official GitHub MCP server (remote `https://api.githubcopilot.com/mcp/`
or the Docker image) so agents can navigate PR/issue history over MCP. Reasoning
was that the `pr-review/` skills already lean on that history.

## Why this is out of scope

The `gh` CLI already covers it, is already authenticated on the machine, and needs
no token wired into MCP config or secret store. The MCP server adds a large tool
list to every session for capability `gh` + `gh api` already provide, and it
overlaps with Claude Code's built-in GitHub support.

GitHub access goes through `gh` — see [`../.agents/github-cli.md`](../.agents/github-cli.md).

Reconsider only if a workflow needs GitHub interaction that `gh api` genuinely
can't express.

## Prior requests

- Workbench MCP setup discussion (2026-09-06). Added, then removed in favour of `gh`.
