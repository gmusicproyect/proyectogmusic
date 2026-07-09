#!/usr/bin/env bash
# Copia reglas canónicas versionadas → .cursor/rules/ (local, gitignored).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/.agents/cursor-rules"
DEST="$ROOT/.cursor/rules"

mkdir -p "$DEST"

for file in "$SRC"/*; do
  [[ -f "$file" ]] || continue
  name="$(basename "$file")"
  cp "$file" "$DEST/$name"
  echo "  ✓ $name → .cursor/rules/$name"
done

for file in "$DEST"/*; do
  [[ -f "$file" ]] || continue
  name="$(basename "$file")"
  if [[ ! -f "$SRC/$name" ]]; then
    rm "$file"
    echo "  ✗ eliminado obsoleto: $name"
  fi
done

echo "Listo. Reinicia Cursor si no detecta reglas nuevas."
