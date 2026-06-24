#!/usr/bin/env bash
# Snapshot operativo para inicio de sesión de agente (patrón ECC operator status, adaptado Gmusic).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Gmusic agent status"
echo "    $(date -u +"%Y-%m-%dT%H:%M:%SZ") UTC"
echo ""

if git -C "$(git -C "$ROOT" rev-parse --show-toplevel 2>/dev/null)" rev-parse --is-inside-work-tree &>/dev/null; then
  GIT_ROOT="$(git -C "$ROOT" rev-parse --show-toplevel)"
  echo "Git root: $GIT_ROOT"
  echo "Branch:   $(git -C "$GIT_ROOT" branch --show-current 2>/dev/null || echo '?')"
  echo "HEAD:     $(git -C "$GIT_ROOT" rev-parse --short HEAD 2>/dev/null || echo '?')"
  if [[ -n "$(git -C "$GIT_ROOT" status --porcelain 2>/dev/null)" ]]; then
    echo "Working tree: DIRTY (uncommitted changes)"
  else
    echo "Working tree: clean"
  fi
else
  echo "Git: not a repository"
fi

echo ""
echo "Skills canonical: .agents/skills ($(find .agents/skills -mindepth 1 -maxdepth 1 -type d,l 2>/dev/null | wc -l | tr -d ' ') entries)"
if [[ -d .cursor/skills ]]; then
  echo "Cursor mirror:    .cursor/skills ($(find .cursor/skills -mindepth 1 -maxdepth 1 2>/dev/null | wc -l | tr -d ' ') entries)"
else
  echo "Cursor mirror:    missing — run ./scripts/sync-skills.sh"
fi

echo ""
echo "==> Quick verify (typecheck only; full: npm run verify)"
if npm run typecheck --silent 2>/dev/null; then
  echo "typecheck: OK"
else
  echo "typecheck: FAIL or script missing"
fi
