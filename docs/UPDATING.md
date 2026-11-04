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
so an unbumped push is invisible to them. (`0.2.0` added `visual/anatomy`, `0.3.0` added `visual/motion-design`, `0.4.0` added
`study/` and `visual/diagram`.)

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

Check: `claude plugin details workbench@tejastn10` lists `anatomy`, `motion-design`,
`diagram` and the `study/` skills, and `/workbench:head-first` autocompletes.

---

## 2. `npx skills` — portable installs (Claude Code, Codex, Cursor, …)

Existing skills:

```bash
npx skills@latest update -g -y            # global installs
npx skills@latest update -p -y            # inside a repo with project installs
```

`update` only refreshes skills you already have. A **new** skill has to be added once:

```bash
npx skills@latest add tejastn10/workbench -g -s anatomy -s motion-design -s diagram \
  -s head-first -s dissect-paper -s flow-diagram -s feynman-check -a claude-code -y
#   swap / add agents: -a codex, -a cursor, -a '*' for every agent it detects
```

Check: `npx skills@latest ls -g` shows `anatomy`, `motion-design`, `diagram` and the
`study/` skills.

---

## 3. Clone + symlink — `scripts/install-skills.sh`

```bash
cd ~/workbench && git pull
./scripts/install-skills.sh               # re-link: picks up new skill dirs (study/*, diagram)
```

Existing skills are symlinks, so `git pull` alone updates them; re-running the script
is only needed when a skill is added, renamed or moved. For repos you copied skills
into with `--project`, re-run it there — copies don't follow `git pull`:

```bash
./scripts/install-skills.sh --project /path/to/repo
```

---

## 4. The website

Nothing to run. Vercel redeploys <https://www.workbench.tejastn10.com> on every push to
`main`, skills-only pushes included: the build reads `skills/` and `docs/` for the counts
and figures, so the project must not skip unaffected builds. Setup is in
[`site/README.md`](../site/README.md#deploy-one-time).

Check: the push's deployment shows **Ready** in the Vercel dashboard (or
`vercel ls workbench`). To redeploy without a push, use **Redeploy** on the latest
deployment, or `vercel --prod` from the repo root.

---

## `visual/anatomy` specifics

- Needs **Node 20.10+** on the machine, and **Chrome or Chromium** for its
  screenshot / line / audit checks (`CHROME_PATH` if it's somewhere unusual).
- It's vendored from [wheresryan22/anatomy](https://github.com/wheresryan22/anatomy)
  (MIT, © 2026 Ryan). To pull a newer upstream into this repo, follow
  [`skills/visual/README.md`](../skills/visual/README.md), then bump `version` and
  push — the steps above carry it to every machine.
