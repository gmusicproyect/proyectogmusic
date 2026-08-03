# GAP — api:test ENOTFOUND (diagnóstico · sin fix)

**Fecha:** 2026-08-02  
**Runbook:** GAP-A (Fable) · **Ejecutor:** Cursor  
**Tip canónico al diagnóstico:** `HEAD` = `origin/main` = `cff182a`  
**Alcance:** evidencia + clasificación + plan propuesto. **Cero fix** hasta frase `OK fix` de Juan.  
**Relación:** desarrolla el GAP-V4-API del informe de cierre `cff182a` — **no** edita ese informe.

## Higiene de secretos

- Se documenta **hostname** y forma del error.
- **No** se incluyen connection strings, usuarios con password, ni valores de `.env`.
- Archivo de origen local (`.env`) está gitignored.

## D0 — Precondiciones

| Check | Resultado |
|---|---|
| `git rev-parse HEAD` | `cff182ab0e9df7e8737710af7c7f400ad053dff6` |
| `git rev-parse origin/main` | `cff182ab0e9df7e8737710af7c7f400ad053dff6` |
| `status --porcelain` (antes de este doc) | Solo untracked: `docs/operations/BRIEF-FABLE-MAX-ZONA-ESTUDIANTE-2026-08-02.md` |

## D1 — Reproducción

**Script:** `package.json` → `api:test` =

`NODE_ENV=test node --env-file-if-exists=.env --import tsx --test --test-concurrency=1 server/tests/**/*.test.ts`

**Ejecución:** `npm run api:test` desde `Página de cursos de música/` (2026-08-02). Log capturado en `/tmp/gap-api-test.log`. Tras evidencia ENOTFOUND (~7s) se cortó el runner (SIN FIX / sin levantar DB).

**Error exacto (sin credenciales):**

```text
Error querying the database: FATAL: (ENOTFOUND) tenant/user postgres.tosbwmqijmtxchvcgrkj not found
```

**Contexto:** falla en Prisma (`prisma.user.findUniqueOrThrow` en `server/tests/admin-password-reset.test.ts`); tests posteriores marcan `# DATABASE_URL no disponible` / fallan por init DB. Exit ≠ 0.

**Hostname (pooler):** `aws-1-us-east-1.pooler.supabase.com`  
**Señal de tenant en el mensaje FATAL:** `postgres.tosbwmqijmtxchvcgrkj` (ref de proyecto; no es DNS `getaddrinfo` clásico — es ENOTFOUND de tenant/usuario en el pooler).

## D2 — Origen del host (archivo + variable; sin valores)

| Ítem | Hallazgo |
|---|---|
| Variable | `DATABASE_URL` |
| Lectura en runtime de tests | `--env-file-if-exists=.env` en script `api:test` |
| Archivo local (no versionado) | `Página de cursos de música/.env` (gitignored vía `.gitignore`) — contiene `DATABASE_URL` apuntando al pooler anterior |
| Prisma | `prisma/schema.prisma` → `url = env("DATABASE_URL")` |
| Cliente | `server/lib/prisma.ts` / helpers `server/tests/helpers/db.ts` (`hasDatabase = Boolean(process.env.DATABASE_URL)`) |
| Host hardcodeado en repo | **No** (0 matches del hostname en fuentes versionadas excl. `.env*`) |
| Alternativa local documentada | `docker-compose.yml` → `postgres:15-alpine` puerto local; `.env.docker` → host `localhost` |
| CI | `.github/workflows/ci.yml` — `DATABASE_URL: ${{ secrets.DATABASE_URL }}`; skip graceful si secret ausente |
| `.env.example` | Comenta patrones localhost / Supabase pooler; **no** fija el host fallido |

Conclusión D2: el host viene de **config local no commiteada** (`.env` → `DATABASE_URL`), no de un string roto versionado.

## D3 — ¿Regresión de la misión (`eb8605e..cff182a`) o preexistente?

**Commits en el rango:**

```text
cff182a docs(ops): informe de cierre verificado del brief Zona Estudiante …
3928d1c docs(status): corregir referencias rotas a features 06/07 …
2311295 fix(comunidad): B+ formalizar abierta y sanear mocks demo
d558e6d docs(ops): archivar dictamen WS2 Comunidad A vs B+ …
e9e70ed fix(demo-nav): honest Inscribirme CTA; drop dead Mi Progreso tab
6803f0e docs(ops): anotar no-repro runtime T-FLOW-05 …
```

**`diff --stat eb8605e..cff182a`:** docs + Comunidad UI + DemoAcademyNav / PathDemo — **sin** cambios en `server/`, `prisma/`, `docker-compose`, workflows CI, ni `package.json` scripts de api.

**`diff --stat` acotado a rutas api/prisma/config/test:** **vacío**.

### Veredicto D3

**PREEXISTENTE / entorno** — el FAIL de `api:test` **no** lo introdujo la misión Zona Estudiante. El rango solo tocó nav demo, Comunidad UI y docs.

## D4 — Clasificación

| Caso | ¿Aplica? |
|---|---|
| **(a) Entorno local:** `api:test` requiere DB alcanzable; aquí `.env` apunta a pooler Supabase cuyo tenant responde ENOTFOUND; existe camino local (`docker-compose` / `.env.docker`) y CI vía secret — **no levantado / no re-apuntado en este runbook** | **SÍ** |
| (b) Config rota **commiteada** (host inválido en archivo versionado) | **NO** — host solo en `.env` gitignored |
| (c) Regresión de la misión | **NO** — D3 vacío en rutas api |

**Clasificación: (a).**

## Plan propuesto (NO ejecutado — requiere `OK fix`)

Propuesta únicamente; orden sugerido tras `OK fix`:

1. **No** commitear `.env`. Tratar credenciales/URI solo en gestor de secretos.
2. Para `api:test` local: apuntar `DATABASE_URL` a Postgres local vía `docker-compose` + `.env.docker` (o export explícito a `localhost`), **o** renovar URI del proyecto CI/staging válido si se insiste en remoto.
3. Documentar prerrequisito breve en ops/README (levantar DB local **antes** de `npm run api:test`) y/o script opcional `api:test:local` que falle claro si no hay DB — sin mezclar prod.
4. Re-correr `npm run api:test` y anexar cifras pass/fail al cierre V4 / este GAP.
5. Fuera de alcance de este GAP: no revertir commits de la misión; no tocar informe `cff182a` salvo referencia cruzada.

## Nota de control

**Sin fix hasta `OK fix` de Juan.**  
**Sin commit/push** de este doc hasta `OK commit` / `OK push`.  
Cuarentena y `src`/API **intactos** en este runbook.

## DoD runbook GAP-A

- [x] Host identificado + origen (archivo+variable) sin credenciales
- [x] Veredicto preexistente vs regresión con evidencia `eb8605e..cff182a`
- [x] Clasificación (a) + plan marcado como propuesta
- [x] Único archivo nuevo de diagnóstico; informe de cierre no editado

---

## Resolución 2026-08-02 (tras `OK fix`)

**Ejecutor:** Cursor · **Cita:** Juan pegó exactamente `OK fix`.  
**Variante F1:** **F-ADITIVA** — CI sí inyecta `secrets.DATABASE_URL`, pero el default del runbook + frase sin `repoint` → script nuevo; `api:test` intacto.

### Cambios (sin tocar `src`/misión/tests existentes)

- `docker-compose.test.yml` — Postgres 16 efímero `:54329`
- `.env.test` — URI trivial local + pines de alumno ancla
- `scripts/api-test-local.sh` + `npm run api:test:local` / `:down`
- `scripts/seed-api-test-local-fixtures.mjs` — ACTIVE sub para fixtures
- `docs/operations/API-TEST-LOCAL-PRERREQUISITOS.md`
- `.gitignore` — excepción `!.env.test` (y `!.env.example`)

### Evidencia re-run

| Check | Resultado |
|---|---|
| ENOTFOUND / tenant pooler | **0** menciones |
| `npm run api:test:local` | **297** tests · **296** pass · **1** fail · 0 cancelled |
| Fail residual | `JWT de ADMIN responde 403` vs producto T-FLOW-01 (ADMIN permitido en `/me/access`) — fuera de alcance GAP |
| `app:test` | **619/619** |
| `build` | exit **0** |
| Guards focales lesson-runner / student-zone | **75/75** |
| `.env` real | **no tocado** (mtime/size invariantes) |

**Schema sync:** `prisma db push` (no `migrate deploy`) por FK UUID/TEXT en migración histórica — documentado en prerrequisitos.

**Commit:** pendiente de `OK commit` / `OK push`.

---

## Nota al pie 2026-08-03 (D-500-REGISTER)

El `ENOTFOUND tenant/user postgres.tosbwmqijmtxchvcgrkj not found` de este GAP era el mismo síntoma del incidente **D-500-REGISTER** (`docs/operations/D-500-REGISTER-2026-08-03.md`): el proyecto Supabase de prod estaba **pausado** (free tier), no un problema exclusivo de la config local. La clasificación (a) «entorno local» queda **incompleta en la causa** — el tenant no respondía para nadie, tampoco para Render en prod. El veredicto D3 (**no regresión de la misión**) permanece **intacto**, y el fix F-ADITIVA `api:test:local` sigue siendo válido y recomendado para tests locales.
