# Codex

Setup notes specific to the [Codex CLI](https://github.com/openai/codex).

## Conventions

Codex reads `AGENTS.md` natively — root, and nested per-directory. Point it at the
conventions by copying or symlinking this repo's `AGENTS.md` into a project root
(or `~/.codex/AGENTS.md` for a personal global set). No Codex-specific rewrite
needed; the file format is shared.

## Skills

This repo's skills are `skills/<category>/<name>/SKILL.md` — the Agent Skills open
format, so the tool-agnostic `skills` CLI installs them into Codex:

```bash
npx skills@latest add tejastn10/workbench    # pick which skills, target = Codex
npx skills@latest add mattpocock/skills      # Matt's set too
```

Or reference a skill's path from `AGENTS.md`, or paste one in for a one-off.
The `.claude-plugin/` manifest is Claude-Code-only and Codex ignores it.

## MCP — `~/.codex/config.toml`

```toml
[mcp_servers.context7]
command = "npx"
args = ["-y", "@upstash/context7-mcp"]

[mcp_servers.deepwiki]
url = "https://mcp.deepwiki.com/mcp"
```

GitHub access is via `gh` (already on PATH) — see [`../github-cli.md`](../github-cli.md).

## Notes

- Codex is stricter about sandboxing/approvals than Claude Code — the
  `AGENTS.md` "never push unless asked" rule aligns with its defaults; keep
  approval mode conservative.
- The `to-tickets` skill's GitHub sub-issue wiring is flakier on Codex than on
  Claude Code — wire parent links with `gh` afterward if needed.
