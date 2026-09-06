---
name: distill-review-style
description: Build (or extend) a PR-review skill from a real corpus of the reviewer's own comments — pull them with `gh`, analyse what they flag, what they let slide, and how they phrase it, then emit a skill file in the house format. Run this on the machine that has access to the private org repos (the work laptop). Use when asked to "make a review skill for <stack>", "distill my review style", or "update the review skill from recent PRs".
---

# Distill a review skill from a comment corpus

This is how `nestjs-backend-pr-review.md` was made. Run it wherever the target
repos are reachable by `gh` (your work laptop for private-org repos). Output is a
new `skills/pr-review/<stack>-pr-review.md` in the same format as the NestJS one.

## 1. Pull the corpus

Identify yourself and the repos/org, then collect every comment you authored as a
reviewer over a sensible window (last 3–6 months).

```bash
ME=$(gh api user --jq .login)
ORG=<org>                      # e.g. habuildserver
SINCE=2026-03-01

# review comments (inline, on the diff) across the org's repos
for REPO in $(gh repo list "$ORG" --limit 100 --json name --jq '.[].name'); do
  gh api --paginate "repos/$ORG/$REPO/pulls/comments?per_page=100" \
    --jq --arg me "$ME" --arg since "$SINCE" \
    '.[] | select(.user.login==$me and .created_at>=$since)
       | {repo:"'"$REPO"'", pr:.pull_request_url, path, line, body}'
done > /tmp/review-comments.jsonl

# PR-level review summaries (the body of an APPROVE / REQUEST_CHANGES / COMMENT)
for REPO in $(gh repo list "$ORG" --limit 100 --json name --jq '.[].name'); do
  gh api --paginate "repos/$ORG/$REPO/pulls?state=all&per_page=100" --jq '.[].number' \
    | while read PR; do
        gh api "repos/$ORG/$REPO/pulls/$PR/reviews" \
          --jq --arg me "$ME" '.[] | select(.user.login==$me and .body!="")
            | {repo:"'"$REPO"'", pr:'"$PR"', state, body}'
      done
done > /tmp/review-summaries.jsonl
```

If the org has many repos or a long history, scope to the 3–5 repos where you
actually review, and cap the PR loop.

## 2. Analyse (don't summarise — categorise)

Work the corpus into these buckets. Counts matter — they decide the ranking.

- **Volume by repo / stack / language** — where does the review effort actually go?
  This sets the skill's default assumption and scope note.
- **What gets flagged, ranked by frequency** — the recurring standards. Group them
  (reuse, logging, config, dead code, naming, correctness, tests, PR hygiene…).
  For each, pull 2–4 **verbatim** comment quotes.
- **What gets let slide** — comments that explicitly say "not a blocker",
  "latent", "fine as-is, noting so it isn't re-raised". These are as important as
  the flags.
- **Severity system** — do they use markers (🔴/🟠/🟡/⚪/🟢)? On what fraction of
  comments? What triggers a blocking vs non-blocking call?
- **Review structure** — how the summary/body comment is built (praise line?
  numbered before-merge list? blocking/non-blocking split?). `CHANGES_REQUESTED`
  vs `COMMENT` usage.
- **Phrasing** — measure it: % lowercase starts, contraction/apostrophe habits,
  opener frequency (`can we…`, `lets…`, `why do we need…`, `@name …`), use of
  another language (Hinglish etc.) and when, how escalation is marked (`??`),
  whether they offer to do the work, whether they give a decision vs a menu.
- **Anti-patterns** — things they never do, stated as prohibitions for the agent.

## 3. Emit the skill

Write `skills/pr-review/<stack>-pr-review.md` with this structure (copy the NestJS
skill's section layout exactly):

1. Frontmatter (`name`, `description` naming the stack, repos, and what's distinct).
2. Intro: what corpus it's from, volume table, the default assumption, scope
   limits ("nothing to say about X").
3. §1 one-line summary of the style.
4. §2 what to flag — ranked, each with verbatim quotes.
5. §3 what to let slide.
6. §4 how to structure the review (body, severity markers, inline).
7. §5 phrasing patterns to imitate — with the measured percentages.
8. §6 anti-patterns for the reviewing agent.
9. §7 applying this to a diff — order of operations.

If the corpus for a stack is thin (< ~15 comments), don't invent a full skill —
extend the closest existing one with a stack-specific section and say the phrasing
is carried over, not measured.

## 4. Keep it current

Re-run on the last ~2 months quarterly. Diff the new analysis against the skill;
add newly-recurring flags, drop ones that stopped appearing, refresh quotes.

## Anti-patterns

- ❌ Writing the skill from general best practices instead of the corpus.
- ❌ Paraphrasing comments instead of quoting them verbatim.
- ❌ A full skill from a handful of comments — extend, don't fabricate.
- ❌ Ranking flags by how important they seem rather than how often they appear.
- ❌ Leaving out the "what to let slide" section — it's half the signal.
