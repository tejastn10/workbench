# site

The workbench site — a static Next.js app in the Nimbus theme (black/white, sharp
corners, monospace, `PageLines`), deployed on Vercel at
<https://workbench.tejastn10.com>.

## Pages

| Route          | Content                                                  |
| -------------- | ------------------------------------------------------- |
| `/`            | Hero, what-it-is, stat tiles, category overview, explore |
| `/skills`      | Every skill by category + the borrowed-from-Matt-Pocock map |
| `/templates`   | PRD / ADR / POSTMORTEM + the shared format               |
| `/mcp`         | Context7, DeepWiki, gh; `.mcp.json` and `claude mcp add` |
| `/conventions` | The 8 AGENTS.md conventions + links to the full files    |
| `/install`     | Full setup walkthrough + per-agent notes                 |

## Content is derived, not hand-maintained

`src/lib/content.ts` reads the repo at build time, so the site needs **no edit**
when skills change:

| Change | What the site does |
| --- | --- |
| Add a skill to a category | Appears on `/` and `/skills` — from its `name` / `description` frontmatter |
| Add a whole category (`skills/<slug>/`) | Auto-discovered; label derived from the slug (`pr-review` → "PR review"); ordered via `CATEGORY_ORDER`, else alphabetically after |
| Mark a skill adapted | Start a body line with `Adapted from [<source>]` → the card gets an "adapted · …" badge |
| Add a doc template | Add its row to `docs/templates/README.md` (the convention already); purpose text comes from there |
| MCP count | From `getMcpServers()` |

Only `getMcpServers()` and the per-page prose (`src/data/site.ts`) are hand-kept.

## Assets

`public/logo.svg` is synced from the repo root by `npm run sync-assets` (runs on
`predev` and `prebuild`), so it's gitignored here — edit `../logo.svg`.

## Develop

```bash
cd site
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → site/out
```

## Deploy (one-time)

1. Vercel → **Add New → Project** → import `tejastn10/workbench`.
2. **Root Directory**: `site`. Keep **"Include files outside the root directory"** on —
   the build reads `../skills` and `../docs` for the skill list and the figures.
3. Framework Next.js, build `npm run build` (detected), Node 24 (matches `.nvmrc` and `engines`).
4. **Settings → Domains** → add `workbench.tejastn10.com`. If tejastn10.com's DNS is on
   Vercel it's automatic; otherwise add the CNAME Vercel shows
   (`workbench` → `cname.vercel-dns.com`).
5. Every push to `main` redeploys. Leave "skip unaffected projects" off: a skills-only
   push changes the counts and figures too.

## Layout & motif

- Content width is `max-w-6xl` (nav, main, footer, page-lines).
- The hero (`app/page.tsx`) fills `min-h-[82vh]` with `BracketField` — animated
  nested-bracket marquee rows (`<([{…}])>`), masked out through the middle where
  the text sits — plus oversized `[ ]` framing glyphs that slowly breathe. The
  install code block spans the full hero width.
- Inner pages get a smaller bracket strip under `PageHeader`.
- No dotted-grid background — the bracket field is the only texture.
- `prefers-reduced-motion` disables all bracket animation.

## Notes

- Served from the domain root — no `basePath`.
- Static export — no server, no API routes, no image optimization.
- Font is Geist Mono. Swap `geist/font/mono` → `geist/font/pixel`
  (`GeistPixelSquare`) in `layout.tsx` for the exact Nimbus pixel face.
- Dev server: run on an explicit port (`npx next dev -p 4173`) — the Nimbus
  portfolio may hold :3000.
