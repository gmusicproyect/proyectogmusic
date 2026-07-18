# 03 — Entorno de desarrollo GMusic (Track A)

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-14 |
| **Autor** | Cursor (ejecutor Fase 3) |
| **Versión** | 1.0 |
| **Estado** | **APROBADA** — guía oficial de entorno Track A (**D-F3-001**, 2026-07-14) |
| **SHA / rama de referencia** | `e5b161c` · `main` (cwd app: `Página de cursos de música/`) |
| **Track** | **A** — Vite + React + Express + Prisma (no Track B) |
| **Prerrequisitos** | **D-F1-001** (MVP congelado) · **D-F2-001** (arquitectura/modelo) · DoD `docs/quality/definition-of-done.md` |
| **Instrucción origen** | `docs/roadmap/fase-3-instruccion.md` |
| **Decisión** | **D-F3-001** — Fase 3 TERMINADA (supersede **D-F3-WIP**) |

---

## 1. Propósito y alcance

**Cubre:** cómo un desarrollador nuevo (o Juan en máquina limpia) instala dependencias, configura env **sin secretos en git**, levanta Postgres local (Docker Compose), migra/seed de forma segura, arranca frontend + API, corre typecheck/test/build/verify, entiende local vs preview vs prod a alto nivel, y conoce P0 ops documentados (INC-admin-cred, R-OPS-01).

**Audiencia:** desarrollador onboarding Track A; ops local.

**No cubre:**

| Fuera | Destino |
|-------|---------|
| Features producto (Mi Progreso UI, Comment schema, T-PUB, Lesson UX) | Fases / tickets propios |
| Stripe / Mercado Pago / pasarela | WON'T MVP |
| Track B (Next.js / Sanity / Railway / Cloudflare Stream) | Diseño aparte |
| Rotar secretos en prod desde este doc | Ops humano (runbooks) |
| Dockerizar SPA+API | No existe Dockerfile de app; no se crea aquí |
| Añadir ESLint/Prettier (`lint`) | Gap documentado; requiere OK Juan separado |

Este documento **supersede** el README raíz (hoy mínimo Figma) como guía de onboarding técnico.

---

## 2. Prerrequisitos de máquina

| Requisito | Detalle (evidencia repo) |
|-----------|--------------------------|
| **Node.js** | Sin campo `engines` en `package.json`. Entorno de referencia de auditoría: **Node v24.x** (p. ej. v24.12.0). Usar Node **≥ 20** recomendado (Prisma 6 / Vite 6). |
| **npm** | Scripts usan npm (`package-lock.json` presente). pnpm aparece en overrides del lock; flujo canónico documentado = **npm**. |
| **Docker Desktop** | Solo para **Postgres local** vía `docker-compose.yml`. **No** hay Dockerfile de la app. |
| **Git** | Repo canónico: `gmusicproyect/proyectogmusic`. App path: `Página de cursos de música/`. |
| **Accesos ops (no bloquean local)** | Vercel (frontend) · Render servicio `gmusic-api` · Supabase (prod/CI según rol). Solo necesarios para preview/prod / rotaciones. |

---

## 3. Estructura del monorepo app

Raíz de trabajo = carpeta de la app (no el parent `gmusic/` solo):

| Path | Rol |
|------|-----|
| `src/` | Frontend Vite + React (`App.tsx`, pages, components, services) |
| `server/` | API Express (`index.ts`, `app.ts`, `routes/`, `services/`, `middleware/`) |
| `prisma/` | `schema.prisma`, `migrations/`, `seed.ts`, `seed-new-student.ts` |
| `scripts/` | Ops: DB guard, deploy verify, `test-db-connection.mjs`, rotate-admin, etc. |
| `public/` | Assets estáticos Vite |
| `docs/` | Arquitectura, ops, deploy, setup (este doc), roadmap |
| `.agents/` | DECISIONS, PROJECT_STATUS, skills |
| `docker-compose.yml` | Solo servicio Postgres 15 |
| `vercel.json` | Rewrites SPA + proxy `/api/v1/*` → Render |
| `sentry.server.instrument.ts` | Cargado por `api:dev` |

---

## 4. Instalación

Desde la raíz de la app:

```bash
cd "Página de cursos de música"
npm install
```

| Paso | Nota |
|------|------|
| Postinstall | No hay script `postinstall` en `package.json`. Tras install, generar cliente Prisma explícitamente: `npm run prisma:generate`. |
| Peer React | `react` / `react-dom` son peerDependencies; el bundle Figma/Make puede traerlos — si faltan, instalar peers según aviso de npm. |

```bash
npm run prisma:generate
```

---

## 5. Variables de entorno

**Fuente plantilla:** `.env.example`  
**Regla de oro:** **prohibido** commitear valores reales. **No** hacer `cp .env.example .env` a ciegas si ops ya tiene `.env` de producción en la máquina.

### Matriz de archivos env (DB-02)

| Archivo | Rol | ¿Tests API? |
|---------|-----|-------------|
| `.env` | Ops / producción en máquina ops — **NO sobrescribir** desde example | **PROHIBIDO** para `api:test` |
| `.env.ci` | URI CI/staging de tests (Supabase CI) | Sí — solo `DATABASE_URL` |
| `.env.docker` | Docker local `localhost:5432/gmusic_learning_db` | Sí — `api:test:docker` |
| `.env.example` | Placeholders documentales | No |

Doc detalle: `docs/operations/DB-02-blindaje-entorno-pruebas.md`.

### Tabla de variables (nombres — sin valores secretos)

| Variable | Local | Preview (Vercel) | Prod | ¿Secreto? | Dónde se setea |
|----------|-------|------------------|------|-----------|----------------|
| `DATABASE_URL` | Docker o DB dev | N/A en Vite; API (Render/staging) | Supabase/prod en Render | **Sí** | `.env` / `.env.docker` / `.env.ci` / Render |
| `JWT_SECRET` | Placeholder ≥32 chars o fallback solo `development` | — | Render | **Sí** | `.env` / Render |
| `API_PORT` | `3001` (default) | — | Render usa `PORT` | No | `.env` local |
| `PORT` | — | — | Inyectado por Render | No | Hosting |
| `CORS_ORIGINS` | Incluir `http://localhost:5173` | Preview URL(s) | Prod origins Vercel | No | API env |
| `GMUSIC_DEV_USER_EMAIL` | Solo dev | — | **No usar** | Sensible | `.env` local |
| `GMUSIC_DEV_ACTIVATION_KEY` | Solo dev (≥24 chars) | — | **No usar** | **Sí** | `.env` local (nunca `VITE_*`) |
| `ADMIN_SEED_PASSWORD` | Seed local/staging | — | Ops seed/rotate | **Sí** | Env ops; nunca git |
| `CARLOS_SEED_PASSWORD` | Seed alumno QA | — | Ops | **Sí** | Env ops |
| `ADMIN_PASSWORD_RESET_KEY` | — | — | Render recovery | **Sí** | Render; nunca Vite |
| `VITE_API_BASE_URL` | `/api/v1` (proxy Vite) | `/api/v1` o URL absoluta API | Prod: relative + rewrite o absolute Render | No | Vercel / `.env` |
| `VITE_DEV_API_PROXY_TARGET` | Opcional; default `http://localhost:3001` | N/A (build) | N/A | No | `.env` local |
| `VITE_POSTHOG_*` | Opcional | Opcional | Opcional | Parcial | Vercel |
| `SENTRY_DSN` / `VITE_SENTRY_DSN` | Opcional | Opcional | Opcional | Parcial | Env / Vercel / Render |
| `SENTRY_AUTH_TOKEN` (+ ORG/PROJECT) | Solo upload sourcemaps build | — | CI/build | **Sí** | Build secrets |

**Conflicto docs vs código:** `.env.example` menciona `VITE_API_PROXY_TARGET`; el código real en `vite.config.ts` lee **`VITE_DEV_API_PROXY_TARGET`**. Gana el código.

**Reglas DB-02:** nunca mezclar `.env` prod con `npm run api:test`. Guard: `npm run ops:test-db-guard`.

---

## 6. Base de datos

### Docker Compose local (solo Postgres)

```bash
docker compose up -d
```

| Ítem | Valor |
|------|-------|
| Imagen | `postgres:15-alpine` |
| Contenedor | `gmusic_postgres_local` |
| DB | `gmusic_learning_db` |
| User / pass (local compose) | `gmusic_admin` / `gmusic_secure_password` (solo local; ver `.env.example`) |
| Puerto | `5432` |
| App Dockerfile | **No existe** — no dockerizar SPA/API en esta fase |

Crear `.env.docker` con **únicamente** `DATABASE_URL` apuntando a ese Postgres (plantilla en `.env.example`).

### Connection check

```bash
# Usa --env-file=.env (máquina ops). Para Docker puro, ajustar env file acorde.
npm run db:test-connection
```

### Migraciones

Migraciones presentes (auditoría):

- `20260608213449_init_gmusic_tables`
- `20260622143000_onboarding_analytics`
- `20260623190000_onboarding_lead_email`
- `20260624120000_auth_user_fields`
- `20260702180000_community_posts_enrollment`
- `20260702200000_pathnode_stage_fields`
- `20260702210000_pathnode_guide_pdf_url`

| Script | Qué hace | Cuándo |
|--------|----------|--------|
| `npm run db:migrate` | `prisma migrate dev` | **Solo** DB local/dev |
| `npm run db:migrate:deploy` | `prisma migrate deploy` | Staging/prod controlado — **ver R-OPS-01** |
| `npm run db:migrate:status` | Estado migraciones | Antes de deploy ciego |
| `npm run prisma:generate` | Cliente Prisma | Tras install / cambio schema |

### Seeds (**local-only** — T-F6-ANTI-DEMO-01)

| Script | Archivo | Cuándo |
|--------|---------|--------|
| `npm run db:seed` | `prisma/seed.ts` | **Solo local** (y staging si Juan lo autoriza): curso demo, nodos, usuario seed. Admin **omitido** si falta `ADMIN_SEED_PASSWORD`. Passwords por env. |
| `npm run db:seed:new-student` | `prisma/seed-new-student.ts` | Alta alumno QA puntual (**local**) |

**Regla anti-demo:** seed **≠** contenido de launch · **≠** piloto prod · **≠** verdad visible al alumno en producción. Course/Module/PathNode PUBLISHED vía seed sirve para desarrollo y T-PUB LOCAL; launch exige ops/admin del entorno real.

**Prohibido:** seed contra producción salvo runbook explícito autorizado por Juan.

### Flags mock FE (launch)

| Variable | Valor launch / CI / piloto |
|----------|----------------------------|
| `VITE_USE_PATH_MOCK` | **`false`** o **ausente** (nunca `true` en preview/prod/launch) |
| `VITE_USE_DASHBOARD_MOCK` | **`false`** o ausente |

Referencia: `.env.ci` · checklist deploy · **D-F6-ANTI-DEMO**.

### R-OPS-01 — baseline Prisma prod (P3005)

| Campo | Estado documentado |
|-------|--------------------|
| Síntoma | DB Supabase creada manualmente → `prisma migrate deploy` puede fallar **P3005** (DB no vacía / sin baseline). |
| Impacto | Migraciones futuras no reproducibles vía Prisma CI/prod hasta baseline. |
| Workaround histórico | SQL idempotente en `scripts/` (ej. `supabase-t3-lead-email.sql`) para cambios puntuales. |
| Qué NO hacer | `db:migrate:deploy` ciego en prod; “arreglar” baseline sin OK ops Juan. |
| Guía | [Prisma baselining](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining) · `.agents/DECISIONS.md` → **R-OPS-01** |
| ¿Bloquea cerrar Fase 3 docs? | **No** (si queda documentado). |
| ¿Bloquea launch MVP? | **Sí** si impide persistir / migraciones críticas (MVP §7.9). |

---

## 7. Scripts canónicos

Fuente: `package.json` (2026-07-14). **No existe script `lint`.**  
Alias protocolo “develop” = **`dev`** (Vite) + **`api:dev`** (API) — no hay script npm llamado `develop`.

| Script npm | Qué hace | Cuándo usarlo |
|------------|----------|---------------|
| *(ninguno)* `npm install` | Instala deps | Primera vez / lock cambio |
| `dev` | Vite frontend | Arranque UI local |
| `api:dev` | API Express + `.env` + Sentry instrument | Arranque API local |
| `build` | `vite build` | Build SPA / pre-deploy |
| `typecheck` | `app:typecheck` + `api:typecheck` | Gate tipado |
| `app:typecheck` | `tsc -p tsconfig.app.json --noEmit` | Solo frontend |
| `api:typecheck` | `tsc -p tsconfig.server.json --noEmit` | Solo API |
| `test` | `app:test` + `api:test` | Suite completa local/CI |
| `app:test` | Node test runner sobre `src/**/*.test.ts` | Tests UI/utils |
| `api:test` | Guard DB + suite API (`.env.ci`) | Tests backend CI-like |
| `api:test:docker` | Igual con `GMUSIC_API_TEST_DB=docker` | Tests API vs Compose |
| `verify` | `typecheck && test && build` | Gate canónico cierre técnico |
| `prisma:generate` | Cliente Prisma | Tras install/schema |
| `db:migrate` | `prisma migrate dev` | Dev local |
| `db:migrate:deploy` | `prisma migrate deploy` | Deploy controlado |
| `db:migrate:status` | Status | Diagnóstico |
| `db:seed` | Seed principal | Local/staging |
| `db:seed:new-student` | Seed alumno | QA |
| `db:test-connection` | Ping DB con `.env` | Setup |
| `ops:test-db-guard` | Unitarios guard DB (sin BD) | Validar aislamiento |
| `deploy:verify-config` | `scripts/verify-deploy-track-a.mjs` | Pre-deploy config |
| `deploy:verify-production` | Smoke T1 prod | Post-deploy |
| `deploy:verify-funnel` | Smoke funnel | Post-deploy |
| **`lint`** | **AUSENTE** | Gap DX — no inventar ESLint sin OK Juan |

---

## 8. Arranque local (happy path setup)

Orden recomendado:

```bash
# 1) Postgres local
docker compose up -d

# 2) Env: crear .env.docker (solo DATABASE_URL local) y/o .env de desarrollo
#    Nunca pegar secretos de prod en git. Ver §5 + .env.example.

# 3) Dependencias + Prisma
npm install
npm run prisma:generate

# 4) Migrar + seed SOLO sobre DB local/dev
#    Apuntar DATABASE_URL a Docker antes de migrate/seed.
npm run db:migrate
# opcional: ADMIN_SEED_PASSWORD / CARLOS_SEED_PASSWORD en env
npm run db:seed

# 5) Terminal 1 — API
npm run api:dev
# Health: GET http://localhost:3001/api/v1/health → status ok + database connected

# 6) Terminal 2 — frontend
npm run dev
# Vite suele servir en http://localhost:5173
# Proxy /api → VITE_DEV_API_PROXY_TARGET o http://localhost:3001
```

**Verificación rápida UI:** landing `/` responde; con CORS/proxy correctos, llamadas `/api/v1/*` no fallan por red.

---

## 9. Verificación

```bash
npm run typecheck
npm run test          # requiere env test correcto (DB-02) para api:test
npm run build
npm run verify        # typecheck && test && build
npm run ops:test-db-guard
# opcional:
npm run api:test:docker
```

| Criterio | Nota |
|----------|------|
| Conteos de tests | **No** hardcodear cifras de docs viejos. Correr y leer salida real. |
| Esta pasada Fase 3 | Solo markdown/docs → **`npm run verify` N/A justificado** (sin cambios ejecutables). Typecheck observado al iniciar sesión: OK vía `agent-status.sh`. |
| Gap lint | No hay `npm run lint` — no es gate de verify. |

---

## 10. Errores y logging

### API

| Mecanismo | Dónde |
|-----------|-------|
| Health | `GET /api/v1/health` — `server/routes/health.ts` (ping Prisma) |
| Error handler | `server/app.ts` — `Sentry.setupExpressErrorHandler` + `Sentry.captureException` si DSN |
| Instrumentación | `api:dev` carga `--import ./sentry.server.instrument.ts` → `sentry.server.config.ts` |
| Logs locales | Salida terminal de `api:dev` (`console` / errores Express) |
| Logs prod | Dashboard **Render** del servicio `gmusic-api` |

### Frontend

| Mecanismo | Dónde |
|-----------|-------|
| Sentry opcional | `VITE_SENTRY_DSN` · `sentry.client.config.ts` |
| Consola navegador | DevTools en Vite |

### Errores comunes de setup

| Síntoma | Causa probable | Qué hacer |
|---------|----------------|-----------|
| EADDRINUSE `:3001` / `:5173` | Puerto ocupado | Liberar proceso o cambiar `API_PORT` |
| Health `database` error | `DATABASE_URL` mala / Postgres no up | `docker compose up -d` · revisar URL |
| `JWT_SECRET no configurada` | Prod/test sin secret | Setear `JWT_SECRET` (≥32) |
| CORS blocked | Origen no listado | Añadir a `CORS_ORIGINS` |
| `api:test` exit 1 | Guard DB-02 rechazó URL | Usar `.env.ci` / `.env.docker` correctos — **nunca** prod |
| Proxy API 502 en Vite | API no corriendo / target incorrecto | Arrancar `api:dev`; revisar `VITE_DEV_API_PROXY_TARGET` |

---

## 11. Matriz de entornos

| Tema | Local | Preview (Vercel) | Producción |
|------|-------|------------------|------------|
| Frontend | `npm run dev` · Vite `:5173` | Deploy preview Vercel | `proyectogmusic.vercel.app` (origin canónico ops) |
| API | `npm run api:dev` · `API_PORT`/`PORT` default **3001** | Vite preview no hostea API; SPA usa proxy rewrite o `VITE_API_*` hacia API staging/prod | Render **`gmusic-api`** + `vercel.json` proxy `/api/v1/*` → `https://gmusic-api.onrender.com/api/v1/*` |
| DB | Docker Compose `localhost:5432/gmusic_learning_db` **o** DB dev documentada | **Reality:** no hay staging DB dedicada documentada como servicio propio; previews suelen pegar a la misma API Render → DB atrás de esa API. **No** asumir DB aislada por preview. | Supabase/prod (ref ops) — **nunca** para tests |
| Env files | `.env` ops local · `.env.docker` tests | Dashboard Vercel (vars `VITE_*`) | Render + Vercel secrets |
| Migrate | `db:migrate` en DB local | Solo si hay staging controlado (hoy: aclarar con Juan antes) | `db:migrate:deploy` **solo** tras resolver R-OPS-01 / process ops |
| Seed | Local/staging con passwords env | Evitar semillas accidentales | **Prohibido** salvo runbook + OK Juan |
| Verify | `npm run verify` en máquina | CI GitHub si aplica (secret `DATABASE_URL` = CI) | Smoke `deploy:verify-*` + `docs/deploy/*` |
| CORS | `http://localhost:5173` | Preview URL en `CORS_ORIGINS` | Prod origins |
| WhatsApp | Mismo bridge; número canónico | Idem | Idem — bridge humano |
| Auth cookies | HTTP local (quirks `secure`) | HTTPS preview | HTTPS prod `secure` |

---

## 12. Storage / media

| Hecho | Detalle |
|-------|---------|
| Blob store propio MVP | **No** (Fase 2 / modelo). |
| Campos | `PathNode.videoUrl`, `PathNode.guidePdfUrl` (URLs externas; provider video enum incluye `youtube`) |
| Local | Usar URLs públicas (YouTube / CDN / static hosting) en seed o admin; archivos en `public/` solo para assets SPA. |
| Prod | Mismas URLs absolutas en filas publicadas; no hay upload pipeline propio documentado en Track A MVP. |

---

## 13. Bridge WhatsApp (solo configuración)

| Ítem | Valor / dónde |
|------|----------------|
| Rol | Bridge humano post-gate (D-024 / pagos diferidos) — **no** pasarela |
| Número canónico | `56953429676` (formato `wa.me` sin `+`) |
| Construcción URL | `src/app/pages/InscripcionRegistroPage.tsx` — constante `WHATSAPP_NUMBER` → `https://wa.me/${WHATSAPP_NUMBER}?text=...` · helper lead en `inscripcion-registro-lead.ts` |
| Tests | `inscripcion-gate.test.ts` aserta `wa.me` + número |
| Ops grant ACTIVE | Tras conversación/pago acordado: `docs/operations/manual-student-activation.md` (Subscription `ACTIVE`) |
| Fuera de este doc | Stripe, Mercado Pago UI, cobro automático |

---

## 14. Deploy y smoke (puntero)

No repetir checklists enteros — resumir y enlazar:

| Recurso | Path |
|---------|------|
| Rewrites + proxy API | `vercel.json` — `/api/v1/:path*` → Render; `/(.*)` → `index.html` |
| Checklist deploy T1 | `docs/deploy/checklist-track-a.md` |
| E2E / T3 | `docs/deploy/checklist-track-a-t3-e2e.md` |
| Verify scripts | `npm run deploy:verify-config` · `deploy:verify-production` · `deploy:verify-funnel` |
| Arquitectura stack | `docs/architecture/02-arquitectura-sistema.md` §2 |
| Skill | `gmusic-ci-deploy` |

---

## 15. P0 ops (clasificación)

| Ítem | Estado | En Fase 3 | ¿Bloquea docs Fase 3? | ¿Bloquea launch MVP? | Dueño |
|------|--------|-----------|------------------------|----------------------|-------|
| **INC-admin-cred** | Repo ✅ cerrado (`2134e71`); **prod DB 🔴 abierto** hasta rotar/login OK | **Documentar** + link incidente | **No** | **Sí** hasta resuelto o riesgo aceptado por Juan (§7.9) | Juan / ops |
| **R-OPS-01** | Activo — P3005 / sin baseline | **Documentar** síntoma + prohibiciones + link Prisma | **No** | **Sí** si impide persistir / migraciones críticas | Juan / ops |
| Rotar secretos en código / commit `.env` | — | **Prohibido** | — | — | — |

**Incidente:** `docs/operations/incident-2026-07-02-admin-credential.md`  
**Checklist seguridad:** `docs/operations/checklist-seguridad-pre-lanzamiento.md` (A8/A9 rotación = verificación manual Juan)  
**Fase 3 no rota secretos** ni aplica baseline en prod.

---

## 16. Checklist “otro dev en 30–60 min”

1. Clonar repo y `cd` a `Página de cursos de música/`.
2. Instalar Node (≥20) + Docker Desktop + Git.
3. `npm install` → `npm run prisma:generate`.
4. `docker compose up -d` y crear `.env.docker` con `DATABASE_URL` local (plantilla `.env.example`).
5. Configurar `.env` de **desarrollo** (JWT, API_PORT, seeds) **sin** pegar secretos de prod en git.
6. Apuntando a DB local: `npm run db:migrate` → (opcional) `npm run db:seed` con passwords por env.
7. Terminal 1: `npm run api:dev` → abrir `http://localhost:3001/api/v1/health`.
8. Terminal 2: `npm run dev` → abrir `http://localhost:5173`.
9. `npm run typecheck` (y, con env test correcto, `npm run test` / `npm run verify`).
10. Leer §11 (preview/prod) y §15 (P0) antes de tocar Render/Supabase.
11. WhatsApp: conocer número canónico y runbook `manual-student-activation.md` — no implementar pagos.
12. Confirmar gap: **no hay `npm run lint`**.

---

## 17. Fuera de alcance / deuda conocida

| Ítem | Tratamiento |
|------|-------------|
| Script `lint` ausente | Documentado; no añadir ESLint sin OK Juan |
| Baseline Prisma prod (R-OPS-01) | Documentado; ejecución = ops + OK Juan |
| INC-admin prod abierto | Documentado; rotación fuera del repo |
| Comment schema / Mi Progreso UI / Stripe / Track B | **No** esta fase |
| Preview vs staging DB dedicada | Matriz §11: reality sin staging aislado documentado |
| README Figma mínimo | Este `03` es la guía onboarding |
| Contraseña compose local en example | Solo local; no reutilizar en prod |

---

## 18. Aprobación

| Casilla | Firma |
|---------|-------|
| ☑ Juan aprueba `docs/setup/03-entorno-desarrollo.md` como guía onboarding Track A | **OK Juan §18** · ref. **D-F3-001** |
| Fecha aprobación | **2026-07-14** |
| Restricciones | Fase 3 **TERMINADA**. Fase 4 **NO INICIADA** / no autorizada. Sin commit/push en esta autorización. Sin rotar secretos / features en esta aprobación documental. |

**Estado actual del artefacto:** **APROBADA** · guía oficial de entorno Track A · **Fase 3 TERMINADA** (**D-F3-001**).
