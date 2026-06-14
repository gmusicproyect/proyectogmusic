#!/usr/bin/env bash
# Instala Superpowers para Opus (arquitecto Gmusic) + skill gmusic-opus-architect.
#
# Uso:
#   ./scripts/install-superpowers-opus.sh
#   ./scripts/install-superpowers-opus.sh --sync   # además corre sync-skills.sh
#
# Claude Code (Opus): después de este script, en el chat de Claude Code:
#   /plugin install superpowers@claude-plugins-official

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENDOR="$ROOT/.agents/vendor/superpowers"
SKILLS="$ROOT/.agents/skills"
REPO="https://github.com/obra/superpowers.git"
SYNC=false

if [[ "${1:-}" == "--sync" ]]; then
  SYNC=true
fi

link_skill() {
  local src_name="$1"
  local dest_name="$2"
  local src="$VENDOR/skills/$src_name"
  local dest="$SKILLS/$dest_name"

  if [[ ! -d "$src" ]]; then
    echo "  ✗ falta skill upstream: $src_name" >&2
    return 1
  fi

  rm -f "$dest"
  ln -sf "$src" "$dest"
  echo "  ✓ $dest_name → vendor/superpowers/skills/$src_name"
}

echo "==> Gmusic — install Superpowers para Opus"
echo "    Raíz: $ROOT"
echo ""

mkdir -p "$ROOT/.agents/vendor" "$ROOT/docs/vision/specs" "$ROOT/docs/plans"

if [[ -d "$VENDOR/.git" ]]; then
  echo "==> Actualizando vendor (git pull)…"
  git -C "$VENDOR" pull --ff-only
elif [[ -d "$VENDOR/skills/brainstorming" ]]; then
  echo "==> Vendor ya presente (sin .git), omitiendo clone"
else
  echo "==> Clonando Superpowers (shallow)…"
  git clone --depth 1 "$REPO" "$VENDOR"
fi

echo ""
echo "==> Enlazando skills de arquitecto en .agents/skills/"
link_skill "using-superpowers" "superpowers-using-superpowers"
link_skill "brainstorming" "superpowers-brainstorming"
link_skill "writing-plans" "superpowers-writing-plans"
link_skill "verification-before-completion" "superpowers-verification-before-completion"

echo ""
echo "==> gmusic-opus-architect"
if [[ -f "$SKILLS/gmusic-opus-architect/SKILL.md" ]]; then
  echo "  ✓ ya presente"
else
  echo "  ✗ falta $SKILLS/gmusic-opus-architect/SKILL.md — créalo en el repo" >&2
  exit 1
fi

if $SYNC; then
  echo ""
  echo "==> sync-skills.sh"
  "$ROOT/scripts/sync-skills.sh" || true
fi

echo ""
echo "════════════════════════════════════════════════════════"
echo "  Instalación local lista."
echo ""
echo "  Claude Code (Opus) — paso manual en el chat:"
echo "    /plugin install superpowers@claude-plugins-official"
echo ""
echo "  Al abrir Opus en este proyecto, decir:"
echo "    Retomar Gmusic — rol arquitecto Opus"
echo "    Skill: gmusic-opus-architect"
echo ""
echo "  Specs  → docs/vision/specs/"
echo "  Plans  → docs/plans/"
echo "  Cursor ejecuta — Opus NO commitea."
echo "════════════════════════════════════════════════════════"
