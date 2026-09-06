# .out-of-scope

Decisions to *not* do something, kept instead of deleted.

When an idea gets rejected — a skill that won't be written, a tool that won't be
added, a convention that was considered and dropped — it goes here as a short file
so an agent (or future me) doesn't re-propose it. Pattern borrowed from
[mattpocock/skills](https://github.com/mattpocock/skills).

## File format

```markdown
# <the thing that is out of scope>

<one paragraph: what was proposed>

## Why this is out of scope

<the reasoning>

## Prior requests

- <where it came up>
```

## Current

| File                                    | Rejected                                          |
| --------------------------------------- | ----------------------------------------------- |
| `common-file-for-pr-review-skills.md`   | A shared `_common.md` the pr-review skills import |
| `python-ruff-mypy.md`                   | Switching Python review tooling to ruff + mypy   |
| `github-mcp-server.md`                  | The GitHub MCP server (use `gh` instead)          |
| `framework-specific-mcp-servers.md`     | Per-framework doc MCP servers                     |
