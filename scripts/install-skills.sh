#!/usr/bin/env bash
#
# install-skills.sh — wire the skills in this repo into your agents.
#
# Each skills/<category>/<name>.md becomes a <name>/SKILL.md that Claude Code and
# VS Code agent mode can load. README.md files are skipped.
#
#   ./scripts/install-skills.sh                 link all skills into ~/.claude/skills
#   ./scripts/install-skills.sh --dry-run       show what would happen
#   ./scripts/install-skills.sh --list          list available skills
#   ./scripts/install-skills.sh --project DIR   copy skills into DIR/.claude/skills
#                                               and DIR/.github/skills (for a repo
#                                               on another machine, or to commit)
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
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) echo "unknown arg: $1" >&2; exit 2 ;;
  esac
done

run() { if [[ $DRY_RUN -eq 1 ]]; then echo "  would: $*"; else eval "$*"; fi; }

# collect skills: name -> source path
declare -a NAMES SOURCES
while IFS= read -r -d '' f; do
  base="$(basename "$f" .md)"
  [[ "$base" == "README" ]] && continue
  NAMES+=("$base")
  SOURCES+=("$f")
done < <(find "$SKILLS_DIR" -type f -name '*.md' -print0 | sort -z)

if [[ ${#NAMES[@]} -eq 0 ]]; then echo "no skills found under $SKILLS_DIR" >&2; exit 1; fi

if [[ $LIST_ONLY -eq 1 ]]; then
  for i in "${!NAMES[@]}"; do
    printf '  %-32s %s\n' "${NAMES[$i]}" "${SOURCES[$i]#$REPO_ROOT/}"
  done
  exit 0
fi

install_one() {  # $1=name $2=src $3=dest_root $4=mode(link|copy)
  local name="$1" src="$2" dest_root="$3" mode="$4"
  local dir="$dest_root/$name"
  run "mkdir -p '$dir'"
  if [[ "$mode" == "link" ]]; then
    run "ln -sfn '$src' '$dir/SKILL.md'"
  else
    run "cp '$src' '$dir/SKILL.md'"
  fi
}

if [[ -n "$PROJECT_DIR" ]]; then
  PROJECT_DIR="$(cd "$PROJECT_DIR" && pwd)"
  echo "Copying ${#NAMES[@]} skills into $PROJECT_DIR/{.claude,.github}/skills ..."
  for i in "${!NAMES[@]}"; do
    install_one "${NAMES[$i]}" "${SOURCES[$i]}" "$PROJECT_DIR/.claude/skills" copy
    install_one "${NAMES[$i]}" "${SOURCES[$i]}" "$PROJECT_DIR/.github/skills" copy
  done
else
  echo "Linking ${#NAMES[@]} skills into $CLAUDE_DEST ..."
  for i in "${!NAMES[@]}"; do
    install_one "${NAMES[$i]}" "${SOURCES[$i]}" "$CLAUDE_DEST" link
  done
  echo
  echo "VS Code agent mode reads the same SKILL.md format. Point it at"
  echo "  $CLAUDE_DEST"
  echo "or run with --project <dir> to drop copies into a repo's .github/skills."
fi

echo
echo "Not handled here (run once, manually):"
echo "  • global conventions:  ln -sf $REPO_ROOT/AGENTS.md ~/.codex/AGENTS.md"
echo "                         and reference $REPO_ROOT/AGENTS.md from ~/.claude/CLAUDE.md"
echo "  • MCP servers:          see $REPO_ROOT/.agents/mcp/"
echo "  • Matt Pocock's skills: claude plugins install mattpocock-skills"
echo "                         (or: npx skills@latest add mattpocock/skills)"
