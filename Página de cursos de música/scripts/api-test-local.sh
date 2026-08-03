#!/usr/bin/env bash
# GAP-FIX (OK fix) · F-ADITIVA — local Postgres for api:test without touching .env
# Cite: Juan "OK fix". api:test script remains intact (CI risk zero).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

export PATH="${HOME}/.docker/bin:/Applications/Docker.app/Contents/Resources/bin:/usr/local/bin:/opt/homebrew/bin:${PATH}"

if ! command -v docker >/dev/null 2>&1; then
  echo "ERROR: docker no está en PATH. Instalá Docker Desktop o agregá ~/.docker/bin al PATH." >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "ERROR: docker daemon no responde. Abrí Docker Desktop y reintentá." >&2
  exit 1
fi

if [[ ! -f .env.test ]]; then
  echo "ERROR: falta .env.test (DATABASE_URL trivial hacia localhost:54329)." >&2
  exit 1
fi

echo "==> Levantando Postgres de test (docker-compose.test.yml, :54329)…"
docker compose -f docker-compose.test.yml up -d --wait

# Load keys from .env.test only (never source .env)
set -a
# shellcheck disable=SC1091
source .env.test
set +a

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "ERROR: DATABASE_URL vacía tras cargar .env.test" >&2
  exit 1
fi

# db push (not migrate deploy): historical migration onboarding_analytics uses UUID FK
# against User.id TEXT — fails on empty Postgres 16. Ephemeral test DB syncs schema from
# prisma/schema.prisma. No new migrations created (runbook F3).
echo "==> prisma db push --accept-data-loss (schema sync → DB de test efímera)…"
npx prisma db push --accept-data-loss --skip-generate

echo "==> db:seed (usuarios ancla para integración)…"
npm run db:seed

echo "==> fixtures api:test:local (ACTIVE sub para alumno ancla; CI DB ya viene preparada)…"
node --env-file=.env.test scripts/seed-api-test-local-fixtures.mjs

echo "==> api:test con --env-file=.env.test (api:test original intacto)…"
NODE_ENV=test node --env-file=.env.test --import tsx --test --test-concurrency=1 server/tests/**/*.test.ts
