#!/usr/bin/env bash
#
# install-skills.sh — wire the skills in this repo into your agents.
#
# Skills live at skills/<category>/<name>/SKILL.md (Claude Code plugin format).
# This links or copies each <name>/ directory to where an agent looks for skills.
#
#   ./scripts/install-skills.sh                 link all skills into ~/.claude/skills
#   ./scripts/install-skills.sh --dry-run       show what would happen
#   ./scripts/install-skills.sh --list          list available skills
#   ./scripts/install-skills.sh --project DIR   copy skills into DIR/.claude/skills
#                                               and DIR/.github/skills
#
# Or skip this script entirely and install the whole repo as a plugin:
#   claude plugins marketplace add tejastn10/workbench
#   claude plugins install workbench@tejastn10
#
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"

DRY_RUN=0
LIST_ONLY=0
PROJECT_DIR=""
CLAUDE_DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=1; shift ;;
    --list)    LIST_ONLY=1; shift ;;
    --project) PROJECT_DIR="${2:?--project needs a directory}"; shift 2 ;;
    -h|--help) sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

run() { if [[ $DRY_RUN -eq 1 ]]; then echo "  would: $*"; else eval "$*"; fi; }

# collect skills: name -> source directory
declare -a NAMES SOURCES
while IFS= read -r -d '' skillmd; do
  dir="$(dirname "$skillmd")"
  NAMES+=("$(basename "$dir")")
  SOURCES+=("$dir")
done < <(find "$SKILLS_DIR" -mindepth 3 -maxdepth 3 -name SKILL.md -print0 | sort -z)

if [[ ${#NAMES[@]} -eq 0 ]]; then echo "no skills found under $SKILLS_DIR" >&2; exit 1; fi

if [[ $LIST_ONLY -eq 1 ]]; then
  for i in "${!NAMES[@]}"; do
    printf '  %-32s %s\n' "${NAMES[$i]}" "${SOURCES[$i]#$REPO_ROOT/}"
  done
  exit 0
fi

if [[ -n "$PROJECT_DIR" ]]; then
  PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
  echo "Copying ${#NAMES[@]} skills into $PROJECT_DIR/{.claude,.github}/skills ..."
  for i in "${!NAMES[@]}"; do
    for base in "$PROJECT_DIR/.claude/skills" "$PROJECT_DIR/.github/skills"; do
      run "mkdir -p '$base'"
      run "rm -rf '$base/${NAMES[$i]}'"
      run "cp -R '${SOURCES[$i]}' '$base/${NAMES[$i]}'"
    done
  done
else
  echo "Linking ${#NAMES[@]} skills into $CLAUDE_DEST ..."
  run "mkdir -p '$CLAUDE_DEST'"
  for i in "${!NAMES[@]}"; do
    run "ln -sfn '${SOURCES[$i]}' '$CLAUDE_DEST/${NAMES[$i]}'"
  done
  echo
  echo "VS Code agent mode reads the same SKILL.md format — point it at $CLAUDE_DEST,"
  echo "or run with --project <dir> to drop copies into a repo's .github/skills."
fi

echo
echo "Not handled here (run once, manually):"
echo "  • global conventions:  ln -sf $REPO_ROOT/AGENTS.md ~/.codex/AGENTS.md"
echo "                         and reference $REPO_ROOT/AGENTS.md from ~/.claude/CLAUDE.md"
echo "  • MCP servers:          $REPO_ROOT/.mcp.json (or see $REPO_ROOT/.agents/mcp/)"
echo "  • Matt Pocock's skills: claude plugins install mattpocock-skills"
