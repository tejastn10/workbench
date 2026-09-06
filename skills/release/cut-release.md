---
name: cut-release
description: Cut a release the way Tejas's repos do it — derive the next semver from conventional-commit history, write grouped release notes, tag `vX.Y.Z`, and let the tag-triggered workflow build. Use when asked to "cut a release", "bump the version", "tag a release", "prepare release notes", or "what's the next version".
---

# Cut a release

Their release pipeline is **tag-triggered**: pushing a `v*.*.*` tag runs
`release.yml` / `docker-image.yml` (cross-compile or buildx multi-arch, GHCR +
Docker Hub, `softprops/action-gh-release`). This skill covers everything up to and
including the tag.

## 1. Determine the next version

Semver, decided from conventional commits since the last tag
(`git describe --tags --abbrev=0` → `git log <last>..HEAD`):

| Commits since last tag                          | Bump    |
| ---------------------------------------------- | ------- |
| any `feat!:` / `fix!:` / `BREAKING CHANGE:`    | major   |
| any `feat:` (no breaking)                      | minor   |
| only `fix:` / `perf:` / `refactor:` / `chore:` | patch   |

Pre-1.0 (`0.x`): a breaking change bumps minor, a feature bumps patch — flag this
and confirm with the user.

## 2. Write the release notes

Group commit subjects by type, most user-facing first. Match the house format seen
in `argus` / `halcyon` `release.yml`:

```markdown
# <Name> vX.Y.Z 🚀

## ✨ Features
- <feat subjects>

## 🐛 Fixes
- <fix subjects>

## 🔧 Maintenance
- <refactor / perf / chore / build / ci subjects>

## 📦 Docker Images       ← only if the repo publishes images
- `docker.io/tejastn10/<repo>:X.Y.Z`
- `ghcr.io/tejastn10/<repo>:X.Y.Z`
```

- Drop pure `docs:` / `test:` / `style:` noise unless notable.
- Rewrite terse subjects into readable lines; keep them one clause each.
- If a `CHANGELOG.md` exists, prepend the same content under a `## [X.Y.Z] - DATE`
  heading.

## 3. Tag and push

```bash
git checkout main && git pull
# update version in package.json / pyproject.toml / a constants file if the repo tracks it there
git commit -m "chore(release): vX.Y.Z"      # only if a version file changed
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin main --follow-tags
```

Commit and tag as the configured git user. Never co-author. Don't push unless the
user asked.

## 4. Verify

- The `Release` / `Build and Publish Docker Image` workflow went green.
- The GitHub Release exists and the notes render.
- Published artifacts / images are pullable at the new tag.
- `latest` only moved if the tag was on the default branch.

## Anti-patterns

- ❌ Guessing the bump instead of reading the commit history.
- ❌ A version file bumped in one place but not the others.
- ❌ Tagging off a feature branch.
- ❌ Hand-running the Docker build the workflow already does.
- ❌ Empty `## Changelog` section when the commits could fill it.
