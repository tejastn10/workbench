# Switching Python review tooling to ruff + mypy

Proposed: have `python-backend-pr-review.md` assume the modern `ruff` (lint +
format) + `mypy` (strict typing) toolchain that most large orgs now standardise on.

## Why this is out of scope

The actual Python repos (`verve`, `papyrus`) use **`black` + `flake8` + `isort`**,
configured in `.flake8` / `[tool.black]` / pre-commit, with **no `mypy`** anywhere.
The review skill has to match what CI actually enforces, not an aspirational setup.
Asking for `mypy` annotations or `ruff` rule compliance on a PR where neither runs
is noise.

If the toolchain migrates later, update the skill then — and delete this file.

## Prior requests

- Phase 3 interview (workbench setup). Initial answer was "industry standard", then
  corrected to "check my projects" — which showed flake8/black/isort.
