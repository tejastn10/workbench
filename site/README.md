# site

The workbench site — a static Next.js app in the Nimbus theme (black/white, sharp
corners, monospace, `PageLines`), deployed to GitHub Pages.

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

1. Push `site/` and `.github/workflows/pages.yml` to `main`.
2. Repo **Settings → Pages → Source: GitHub Actions**.
3. Builds on any push touching `site/**`, publishes to
   `https://tejastn10.github.io/workbench/`.
4. Add the URL to the repo's **About** sidebar.

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

- `next.config.ts` sets `basePath: /workbench` in production only.
- Static export — no server, no API routes, no image optimization.
- Font is Geist Mono. Swap `geist/font/mono` → `geist/font/pixel`
  (`GeistPixelSquare`) in `layout.tsx` for the exact Nimbus pixel face.
- Dev server: run on an explicit port (`npx next dev -p 4173`) — the Nimbus
  portfolio may hold :3000.
