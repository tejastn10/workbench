# skills/release

Release and changelog routines. The pipeline is **tag-triggered** — pushing a
`v*.*.*` tag runs the build/publish workflow. These skills cover the work up to the
tag.

| Skill            | Use for                                                    |
| ---------------- | -------------------------------------------------------- |
| `cut-release.md` | Derive the next semver from conventional commits, write grouped release notes, tag |

Conventions: conventional commits drive the version bump; release notes group by
type with emoji headers; tag as the configured git user, no co-author; don't push
without being asked. See [`../../AGENTS.md`](../../AGENTS.md).
