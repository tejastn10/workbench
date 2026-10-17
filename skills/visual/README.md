# skills/visual

Explaining an idea with a picture you can touch — figures for docs, blog posts and
landing pages.

| Skill            | Use for                                                   |
| ---------------- | ----------------------------------------------------- |
| `visual/anatomy` | Build an interactive isometric figure that explains a technical idea as a real, working machine (SVG, WebGL, optional 3D) |

`visual/anatomy` is vendored from [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)
(MIT, © 2026 Ryan) with its kit, scripts and example sources. It needs Node 20.10+,
and Chrome or Chromium for its checks. To refresh it from upstream:

```bash
git clone --depth 1 https://github.com/wheresryan22/anatomy /tmp/anatomy
rsync -a --delete \
  --exclude .git --exclude .github --exclude tests --exclude evals \
  --exclude '*.test.mjs' --exclude 'examples/**/*.html' --exclude README.md \
  --exclude CHANGELOG.md --exclude CONTRIBUTING.md --exclude CODE_OF_CONDUCT.md \
  --exclude SECURITY.md --exclude .gitattributes --exclude .gitignore \
  --filter 'P .gitignore' \
  /tmp/anatomy/ skills/visual/anatomy/
```

Then put the attribution paragraph back under `# Anatomy` in `SKILL.md` and update
the pinned commit in it.
