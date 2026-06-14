#!/usr/bin/env bash
# Genera instrucción para Claude/Opus — mostrar cómo piensa como arquitecto Gmusic.
# Usa Superpowers (brainstorming) + gmusic-opus-architect. NO pide código.
#
# Uso:
#   ./scripts/claude-think-brief.sh
#   ./scripts/claude-think-brief.sh --copy
#   ./scripts/claude-think-brief.sh "Visual D2 interior hero"
#   ./scripts/claude-think-brief.sh -c "Demo microtarjetas estilo Yousician"

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
COPY=false
TOPIC="Próxima fase prioritaria de Gmusic (tú recomiendas cuál)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --copy | -c)
      COPY=true
      shift
      ;;
    --help | -h)
      sed -n '2,12p' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *)
      TOPIC="$*"
      break
      ;;
  esac
done

# Estado mínimo desde repo (si existe)
GIT_HEAD="(sin git)"
GIT_DIRTY=""
if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  GIT_HEAD="$(git -C "$ROOT" log -1 --oneline 2>/dev/null || echo '?')"
  GIT_DIRTY="$(git -C "$ROOT" status --short 2>/dev/null | head -8)"
  [[ -z "$GIT_DIRTY" ]] && GIT_DIRTY="(working tree limpio)"
fi

SUPERPOWERS_OK="no verificado"
[[ -d "$ROOT/.agents/vendor/superpowers/skills/brainstorming" ]] && SUPERPOWERS_OK="instalado local (.agents/vendor/superpowers)"
[[ -L "$ROOT/.agents/skills/superpowers-brainstorming" ]] && SUPERPOWERS_OK="instalado + symlinks en .agents/skills/"

INSTRUCTION="$(cat <<EOF
# Claude / Opus — sesión arquitecto Gmusic (mostrar cómo piensas)

## Tu rol

Eres **Opus, arquitecto de producto** de Gmusic Estudio. **NO escribes código.**
El ejecutor del repo es **Cursor**. Juan es Product Owner.

**Skills activos (decláralos al inicio):**
1. \`gmusic-opus-architect\` — rol y handoff
2. \`superpowers:brainstorming\` — diseño antes de implementar (HARD-GATE: sin código)
3. \`superpowers:writing-plans\` — solo si ya hay spec aprobada (hoy probablemente no)

Si tienes el plugin Superpowers instalado, invócalo explícitamente.
Si no, simula su checklist de brainstorming.

## Contexto repo (Cursor verificó; marca dudas)

- Proyecto: \`$ROOT\`
- Último commit: \`$GIT_HEAD\`
- Working tree:
\`\`\`
$GIT_DIRTY
\`\`\`
- Superpowers local: **$SUPERPOWERS_OK**
- Stack: React + Vite, \`currentPage\` en App.tsx, tests Node (\`npm run app:test\`)
- Metodología: **Fundamento → Técnica → Crea** (microciclos)
- Web = embudo + demo | App futura = micrófono/afinador
- Fase 4 Auth / Fase 5 pagos: **PAUSADAS** hasta conversión WhatsApp
- Referencia: \`CLAUDE.md\`, \`.agents/DO_NOT_TOUCH.md\`, \`.agents/ROADMAP.md\`

## Tema de esta sesión

**$TOPIC**

## Lo que necesito de ti (una respuesta)

Quiero **ver tu razonamiento**, no un muro de texto genérico.
Responde en **español**, estructurado así:

### 0. Skills y lente
- Qué skill(s) activaste y por qué (solo 1–2, no los seis a la vez)
- Qué **NO** activaste y por qué

### 1. Comprensión (≤5 bullets)
- Qué crees que Juan pide
- Qué restricciones aplican (DO_NOT_TOUCH, fases pausadas, web vs app)

### 2. Preguntas (máximo 2)
- Solo si bloquean el diseño; preferir opción múltiple
- Si puedes avanzar sin preguntar, dilo y sigue

### 3. Enfoques (2–3 opciones)
- Tabla: opción | pros | contras | esfuerzo | recomendación
- Marca cuál recomiendas para **web demo ahora** vs **app futura**

### 4. Diseño propuesto (borrador spec)
- Secciones cortas: objetivo, alcance sí/no, usuario, flujo, riesgos
- Pedagogía FTC si aplica
- **Sin código** — paths de archivos solo si estás razonablemente seguro

### 5. Handoff a Cursor
- Brief ≤15 líneas con palabra clave **Retomar Gmusic**
- Qué debe leer Cursor primero
- Qué Juan debe autorizar antes de implementar

### 6. Meta-reflexión (esto es lo importante)
- ¿Dónde dudaste?
- ¿Qué confirmarías con Cursor vs con Juan?
- ¿Algo de tu respuesta contradice \`DO_NOT_TOUCH\` o Fase 4 pausada?

## Reglas

- NO generes código, diffs ni commits
- NO propongas auth, Flow, app nativa ni micrófono como MVP inmediato salvo que el tema lo exija explícitamente
- NO reescribas el Resumen Maestro entero
- Si el estado del repo te parece desactualizado, escribe "confirmar con Cursor"

Empieza declarando: **"Activo skill: …"** y luego sigue las secciones 1–6.
EOF
)"

if $COPY; then
  if command -v pbcopy >/dev/null 2>&1; then
    printf '%s' "$INSTRUCTION" | pbcopy
    echo "✓ Instrucción copiada. Pégala en Claude Code / Opus."
    echo "  Tema: $TOPIC"
  else
    echo "$INSTRUCTION"
    echo ""
    echo "⚠ pbcopy no disponible." >&2
  fi
else
  echo "$INSTRUCTION"
fi
