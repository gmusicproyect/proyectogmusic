#!/bin/zsh
# Smoke local estable (Terminal.app). Ctrl+C detiene ambos.
set -euo pipefail
export PATH="/Applications/Docker.app/Contents/Resources/bin:$HOME/.docker/bin:/opt/homebrew/bin:$PATH"

# Autolocalizado desde la posición del script; override: export GMUSIC_APP_DIR=/ruta/a/la/app
SCRIPT_DIR="${0:A:h}"
APP="${GMUSIC_APP_DIR:-${SCRIPT_DIR}/../..}"
cd "$APP"

echo "==> Postgres Docker"
docker start gmusic_postgres_local >/dev/null 2>&1 || \
  docker run -d --name gmusic_postgres_local \
    -e POSTGRES_USER=gmusic_admin \
    -e POSTGRES_PASSWORD=gmusic_secure_password \
    -e POSTGRES_DB=gmusic_learning_db \
    -p 5433:5432 \
    -v gmusic_pg_smoke_data:/var/lib/postgresql/data \
    postgres:15-alpine

for i in {1..20}; do
  docker exec gmusic_postgres_local pg_isready -U gmusic_admin -d gmusic_learning_db >/dev/null 2>&1 && break
  sleep 0.5
done

# Liberar puertos si quedaron zombies
for p in 3001 5173; do
  for pid in $(/usr/sbin/lsof -nP -iTCP:$p -sTCP:LISTEN -t 2>/dev/null); do
    kill -9 "$pid" 2>/dev/null || true
  done
done

# Env smoke (DB local) — no imprime secretos
if [[ -f .env.smoke.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -E '^[A-Z0-9_]+=' .env.smoke.local | sed 's/\r$//')
  set +a
fi
export NODE_ENV=development
export VITE_API_BASE_URL=/api/v1
export VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:3001
# Asegura host IPv4 del compose smoke
export DATABASE_URL="${DATABASE_URL:-postgresql://gmusic_admin:gmusic_secure_password@127.0.0.1:5433/gmusic_learning_db?schema=public}"
export JWT_SECRET="${JWT_SECRET:-local-smoke-jwt-secret-min-32-characters-xx}"
export CORS_ALLOWED_ORIGINS="${CORS_ALLOWED_ORIGINS:-http://localhost:5173,http://127.0.0.1:5173}"

cat > .env.development.local <<'EOF'
VITE_API_BASE_URL=/api/v1
VITE_DEV_API_PROXY_TARGET=http://127.0.0.1:3001
EOF

cleanup() {
  echo ""
  echo "==> Deteniendo API y Vite..."
  [[ -n "${API_PID:-}" ]] && kill "$API_PID" 2>/dev/null || true
  [[ -n "${VITE_PID:-}" ]] && kill "$VITE_PID" 2>/dev/null || true
  exit 0
}
trap cleanup INT TERM

echo "==> API :3001"
npx tsx --import ./sentry.server.instrument.ts server/index.ts > /tmp/gmusic-api-smoke.log 2>&1 &
API_PID=$!

for i in {1..40}; do
  if curl -sf http://127.0.0.1:3001/api/v1/health >/dev/null 2>&1; then
    echo "    API OK"
    break
  fi
  sleep 0.25
done

echo "==> Vite :5173 (proxy → API local)"
npm run dev -- --host 127.0.0.1 --port 5173 > /tmp/gmusic-vite-smoke.log 2>&1 &
VITE_PID=$!

for i in {1..40}; do
  if curl -sf http://127.0.0.1:5173/api/v1/health >/dev/null 2>&1; then
    echo "    PROXY OK"
    break
  fi
  sleep 0.25
done

echo ""
echo "Listo. Abre: http://127.0.0.1:5173/login-cuenta"
echo "ADMIN: admin@gmusic.academy  (clave en .env.smoke.local → ADMIN_SEED_PASSWORD)"
echo "Deja ESTA ventana abierta. Ctrl+C para parar."
echo ""
/usr/bin/open "http://127.0.0.1:5173/login-cuenta" >/dev/null 2>&1 || true

# Mantener vivos: si alguno muere, avisar
while true; do
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "API se detuvo. Ver /tmp/gmusic-api-smoke.log"
    cleanup
  fi
  if ! kill -0 "$VITE_PID" 2>/dev/null; then
    echo "Vite se detuvo. Ver /tmp/gmusic-vite-smoke.log"
    cleanup
  fi
  sleep 2
done

echo ""
echo "==> Smoke checklist: docs/operations/smoke-track-a.md"
echo "    1) ADMIN login publico -> /admin   2) ACTIVE -> completar nodo"
echo "    3) DEMO clase -> upsell WhatsApp   4) Fin de camino (T-FLOW-04)"
echo "    5) Badge Publicado legacy (T-FLOW-03)"
