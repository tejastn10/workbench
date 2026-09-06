# GitHub access — use `gh`, not an MCP server

The `pr-review/` skills lean on real PR and review history. That access goes
through the **`gh` CLI**, which is already authenticated on this machine — not
through the GitHub MCP server.

Why: `gh` is already set up, it's scriptable, it doesn't add a long tool list to
every session, and there's no token to wire into MCP config. See
[`../.out-of-scope/github-mcp-server.md`](../.out-of-scope/github-mcp-server.md).

## Commands the review / release skills use

```bash
# PR under review
gh pr view <n> --json title,body,files,commits,reviews
gh pr diff <n>
gh pr checks <n>

# reviewer's own comment history (grounding for the pr-review skills)
gh api "repos/<owner>/<repo>/pulls/comments?per_page=100" --paginate \
  --jq '.[] | select(.user.login=="<me>") | .body'
gh search prs --author @me --reviewed-by @me --json number,title,url

# issues
gh issue view <n> --json title,body,labels,comments
gh issue list --search "<query>"

# release work
gh release list
gh release view <tag>
git describe --tags --abbrev=0        # last tag, for the conventional-commit diff
```

## Reading another repo's files without cloning

```bash
gh api "repos/<owner>/<repo>/git/trees/HEAD?recursive=1" --jq '.tree[].path'
gh api "repos/<owner>/<repo>/contents/<path>" --jq '.content' | base64 -d
```

For architecture-level orientation on an unfamiliar public repo, use DeepWiki
(`.agents/mcp/deepwiki.md`) instead.
