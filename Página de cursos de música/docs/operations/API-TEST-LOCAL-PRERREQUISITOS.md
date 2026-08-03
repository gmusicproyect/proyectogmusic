# API test local — prerrequisitos (Postgres docker)

**Fecha:** 2026-08-02  
**Gate:** ejecutado tras `OK fix` (Juan) · runbook GAP-FIX Fable  
**Relacionado:** `GAP-API-TEST-ENOTFOUND-2026-08-02.md`

## Para qué

Correr la suite `server/tests/**/*.test.ts` **sin** depender del `DATABASE_URL` del `.env` local (p. ej. pooler Supabase con tenant ENOTFOUND).

## Variante F1 elegida: **F-ADITIVA**

| Evidencia CI | Decisión |
|---|---|
| Root `.github/workflows/ci.yml` inyecta `DATABASE_URL: ${{ secrets.DATABASE_URL }}` en el step API tests (skip graceful si el secret falta) | F-REPOINT *estaría* permitido |
| Juan pegó exactamente `OK fix` (no `OK fix repoint`); default del runbook = aditivo | **F-ADITIVA** |

**Qué implica:** script nuevo `npm run api:test:local`. El script `api:test` **queda intacto** (sigue leyendo `--env-file-if-exists=.env`) → riesgo CI cero.

## Requisitos

1. **Docker Desktop** (o engine compatible) en marcha.  
   En macOS el binario suele estar en `~/.docker/bin` / Docker.app — el script lo agrega al `PATH`.
2. Puerto **54329** libre en el host.
3. Node/npm del workspace `Página de cursos de música/`.

## Comandos

```bash
cd "Página de cursos de música"
npm run api:test:local          # up → db push → seed → fixtures → tests
npm run api:test:local:down     # down -v (efímero)
```

### Qué hace `api:test:local`

1. `docker compose -f docker-compose.test.yml up -d --wait`  
   - imagen `postgres:16-alpine`  
   - user/password/db triviales: `postgres` / `postgres` / `gmusic_test`  
   - **sin volumes persistentes**
2. Carga **solo** `.env.test` (nunca edita ni lee valores del `.env` real en el script).
3. `npx prisma db push --accept-data-loss --skip-generate`  
   - **No** `migrate deploy`: la migración histórica `20260622143000_onboarding_analytics` falla en Postgres vacío (`user_id` UUID vs `User.id` TEXT). El schema vigente se sincroniza desde `prisma/schema.prisma` sin crear migraciones nuevas.
4. `npm run db:seed` + `scripts/seed-api-test-local-fixtures.mjs` (suscripción ACTIVE del alumno ancla; la BD de CI ya viene preparada).
5. `NODE_ENV=test node --env-file=.env.test --import tsx --test --test-concurrency=1 server/tests/**/*.test.ts`

## `.env.test` (commiteable)

Credenciales **triviales** del contenedor + pines para que el auto-load de Prisma de `.env` no redirija el email del alumno ancla:

- `DATABASE_URL=…@localhost:54329/gmusic_test`
- `GMUSIC_DEV_USER_EMAIL=carlos@gmusic.academy`
- claves de test locales (`JWT_SECRET`, `ADMIN_*`, `GMUSIC_DEV_ACTIVATION_KEY`) — no son secretos de prod

## Residual conocido (fuera del GAP ENOTFOUND)

Tras el fix de entorno: **296/297** pass. Falla único:

- `dev-student-session`: «JWT de ADMIN responde 403» — el producto (T-FLOW-01) **permite** ADMIN en `GET /me/access` (`realStudentAuth`). El assert del test espera 403. **No** se tocó el test ni el middleware en este GAP (cuarentena).

## No hacer

- No apuntar `api:test` / `.env` a producción.
- No commitear el `.env` real.
- No usar `docker-compose.yml` de desarrollo (puerto 5432 + volume) para esta suite — usar `docker-compose.test.yml`.
