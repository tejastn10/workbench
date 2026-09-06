# Codex

Setup notes specific to the [Codex CLI](https://github.com/openai/codex).

## Conventions

Codex reads `AGENTS.md` natively — root, and nested per-directory. Point it at the
conventions by copying or symlinking this repo's `AGENTS.md` into a project root
(or `~/.codex/AGENTS.md` for a personal global set). No Codex-specific rewrite
needed; the file format is shared.

## Skills

```bash
npx skills@latest add mattpocock/skills      # installs to Codex too, pick which
```

This repo's skills are plain Markdown — reference a skill's path in `AGENTS.md`,
or paste it in for a one-off. There's no dedicated skills directory the way Claude
Code has; they act as instructions/context.

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
