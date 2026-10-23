# Updating every install after a push

You pushed to `main`. Here's how each machine picks it up, by install route. Run the
block for the route that machine uses (`claude plugin list` / `npx skills ls -g`
tell you which). Commands checked against Claude Code 2.1 and `skills` 1.7.

---

## 0. Before you push (once per release)

```bash
node scripts/validate-skills.mjs          # frontmatter, names, plugin.json in sync
claude plugin validate .                  # manifest + marketplace
```

Bump `version` in [`.claude-plugin/plugin.json`](../.claude-plugin/plugin.json) on
any change you want plugin installs to receive — `plugin update` compares versions,
so an unbumped push is invisible to them. (`0.2.0` added `visual/anatomy`, `0.3.0` added `visual/motion-design`.)

---

## 1. Claude Code plugin — `workbench@tejastn10`

From a shell, on each machine:

```bash
claude plugin marketplace update tejastn10    # re-read the marketplace from GitHub
claude plugin update workbench@tejastn10      # pull the new version
# restart Claude Code (or /reload-plugins inside a session)
```

Or inside a running session:

```text
/plugin marketplace update tejastn10
/plugin update workbench@tejastn10
/reload-plugins
```

Check: `claude plugin details workbench@tejastn10` lists `anatomy` and `motion-design`
among the skills, and `/workbench:anatomy` autocompletes.

---

## 2. `npx skills` — portable installs (Claude Code, Codex, Cursor, …)

Existing skills:

```bash
npx skills@latest update -g -y            # global installs
npx skills@latest update -p -y            # inside a repo with project installs
```

`update` only refreshes skills you already have. A **new** skill has to be added once:

```bash
npx skills@latest add tejastn10/workbench -g -s anatomy -s motion-design -a claude-code -y
#   swap / add agents: -a codex, -a cursor, -a '*' for every agent it detects
```

Check: `npx skills@latest ls -g` shows `anatomy` and `motion-design`.

---

## 3. Clone + symlink — `scripts/install-skills.sh`

```bash
cd ~/workbench && git pull
./scripts/install-skills.sh               # re-link: picks up new skill dirs (anatomy, motion-design)
```

Existing skills are symlinks, so `git pull` alone updates them; re-running the script
is only needed when a skill is added, renamed or moved. For repos you copied skills
into with `--project`, re-run it there — copies don't follow `git pull`:

```bash
./scripts/install-skills.sh --project /path/to/repo
```

---

## 4. The website

Nothing to run. Pushing `site/**` to `main` triggers
[`.github/workflows/pages.yml`](../.github/workflows/pages.yml), which builds Fig 1
from `site/figures/` and deploys to <https://tejastn10.github.io/workbench/>.
A skills-only push does **not** redeploy the site (the workflow filters on `site/**`);
run it by hand when the skill counts or workflows changed:

```bash
gh workflow run pages.yml
```

---

## `visual/anatomy` specifics

- Needs **Node 20.10+** on the machine, and **Chrome or Chromium** for its
  screenshot / line / audit checks (`CHROME_PATH` if it's somewhere unusual).
- It's vendored from [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)
  (MIT, © 2026 Ryan). To pull a newer upstream into this repo, follow
  [`skills/visual/README.md`](../skills/visual/README.md), then bump `version` and
  push — the steps above carry it to every machine.
