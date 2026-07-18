# Instrucción Fase 3 — Infraestructura base

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de ops/docs — **no** es el documento `03` final.  
> **Duración poster Fase 3:** ~1 semana (docs + higiene infra; sin features producto).  
> **Estado de esta instrucción:** lista · **Fase 3 TERMINADA** (**D-F3-001**, 2026-07-14) — `docs/setup/03-entorno-desarrollo.md` = guía oficial Track A · §18 firmado.  
> **Gate inicio:** cumplido (OK Juan ejecutar Fase 3). **Gate cierre:** cumplido (OK Juan §18 · **D-F3-001**). Fase 4 **no** autorizada.
---

## Propósito de esta instrucción

Esta instrucción es el **contrato de trabajo** para producir el documento de entorno:

`docs/setup/03-entorno-desarrollo.md`

| Es | No es |
|----|--------|
| Guía profunda para documentar install, env, DB, Docker local, scripts, seeds, logging, entornos | Un rediseño de arquitectura o schema |
| Auditoría de lo que **ya existe** en el repo vs lo que falta documentar | Dockerizar / migrar a Track B / adoptar el cartel |
| Plantilla exacta que `03-*` debe rellenar | Features de producto (Mi Progreso, Comment, lección UX) |
| Puente entre arquitectura aprobada (Fase 2) y “otro dev levanta el proyecto” | Autorización para Fase 4 auth code o Stripe |
| Clasificación P0 ops (documentar vs bloquear launch) | Rotar secretos en código o commit de `.env` real |

**Regla de oro:** Fase 3 documenta y, solo si Juan autoriza en la misma pasada de ejecución, **ajusta scripts/docs de setup**. No inventa infraestructura greenfield ni resuelve gaps de producto disfrazados de “infra”.

### Qué NO es Fase 3

- Features MVP / tickets T-PUB · T-UX-LESSON · T-MVP-PROGRESS · Community Comment.  
- Schema redesign / nuevas tablas (incl. **Comment** — ver ambigüedades).  
- Pasarela Stripe / Mercado Pago.  
- Mitigar R-001 / R-002 sin decisión nueva.  
- Reescribir `02-*` o reabrir **D-F2-001**.  
- “Login nuevo”, email verify, Track B.

---

## Prerrequisitos

Antes de que el ejecutor redacte `03-entorno-desarrollo.md`, deben cumplirse:

| # | Prerrequisito | Estado (al escribir esta instrucción) |
|---|---------------|----------------------------------------|
| 1 | **D-F1-001** — MVP congelado | ✅ |
| 2 | **D-F2-001** — Fase 2 arquitectura/modelo aprobados | ✅ |
| 3 | DoD permanente `docs/quality/definition-of-done.md` | ✅ |
| 4 | Esta instrucción leída y aceptada como método | ✅ |
| 5 | **OK Juan para iniciar ejecución Fase 3** | ✅ (2026-07-14) |

Gate de **cierre** (distinto): firma Juan en §18 del `03` — **cumplido** (**D-F3-001**, 2026-07-14). Fase 3 **TERMINADA**.

---

## Objetivo de la Fase 3

Lograr que **otro desarrollador** (o el mismo Juan en máquina limpia) pueda:

1. Instalar dependencias.  
2. Configurar variables de entorno **sin pegar secretos de prod en git**.  
3. Levantar Postgres local (Docker Compose ya existe) y/o apuntar a DB de desarrollo documentada.  
4. Correr migraciones / seeds en el entorno correcto (nunca prod por error).  
5. Arrancar frontend + API en local.  
6. Ejecutar `typecheck`, `test`, `build`, `verify`.  
7. Entender diferencias **local / preview (Vercel) / producción** (Vercel SPA + Render API).  
8. Saber dónde mirar errores y logging (API console + Sentry opcional).  
9. Configurar el **bridge WhatsApp** (URL/`wa.me` / número canónico) solo a nivel de documentación — **no** pasarela.

**Entregable principal:** `docs/setup/03-entorno-desarrollo.md`  
**Entregables opcionales (solo si la auditoría lo justifica):**  
- `docs/setup/03-checklist-env.md` (checklist de variables por entorno)  
- `docs/setup/03-runbook-db.md` (migrate/seed/baseline — enlace a R-OPS-01)  

**Entregables de control al cierre:** actualizar `etapa-actual.md`, `changelog.md`, línea en `.agents/PROJECT_STATUS.md`.

---

## Entradas (fuentes de verdad)

Leer en este orden. Extraer solo lo indicado. **No** inventar scripts ni Docker “obligatorio app”.

| Path | Qué extraer |
|------|-------------|
| `docs/architecture/02-arquitectura-sistema.md` | Stack deploy (Vercel/Render), CORS, proxy API, capas |
| `docs/architecture/02-modelo-datos.md` | Prisma + Postgres como verdad; no inventar storage blob |
| `docs/project-status/00-inventario-actual.md` | Estado ops/infra parcial; riesgos B* |
| `package.json` → `scripts` | **Scripts reales** (ver auditoría abajo — revalidar al ejecutar) |
| `.env.example` | Plantilla env + gates DB-02; **no** copiar a `.env` de prod |
| `.env.docker` / `.env.ci` (si existen localmente) | Solo patrón; no commitear secretos |
| `docker-compose.yml` | Postgres 15 local (`gmusic_learning_db`) — **sí existe** |
| `vercel.json` | Rewrites SPA + proxy `/api/v1/*` |
| `prisma/schema.prisma` + `prisma/migrations/` | Migraciones existentes; seeds en `prisma/seed*.ts` |
| `docs/operations/DB-02-blindaje-entorno-pruebas.md` | Aislamiento CI/Docker/prod |
| `docs/operations/checklist-seguridad-pre-lanzamiento.md` | P0 admin / R-OPS-01 |
| `docs/operations/incident-2026-07-02-admin-credential.md` | INC admin (documentar estado, **no** rotar en código) |
| `docs/operations/manual-student-activation.md` | Bridge ops ACTIVE |
| `docs/deploy/checklist-track-a*.md` | Deploy / smoke |
| `.agents/DECISIONS.md` → **R-OPS-01** | Baseline Prisma prod bloqueado P3005 |
| `docs/roadmap/backlog.md` | R-OPS-01, INC-admin-cred vs tickets producto |
| `docs/product/01-mvp-gmusic.md` §7.9 | P0 ops = bloqueo launch |
| `docs/quality/definition-of-done.md` | Criterios Done aplicados a docs/ops |
| `sentry.server.instrument.ts` / API error handler | Logging/errores reales |
| `README.md` | Hoy mínimo — `03` lo supersede como guía onboarding |

**Conflicto docs vs código:** gana `package.json` + archivos en repo. El `03` debe citar la contradicción si README o AGENTS dicen otra cosa.

---

## Salida

Crear **solo tras OK Juan de ejecución**:

`docs/setup/03-entorno-desarrollo.md`

### Outline EXACTO (plantilla a rellenar — no dejar secciones vacías sin “N/A justificado”)

```markdown
# 03 — Entorno de desarrollo GMusic (Track A)

## 0. Metadatos
- Fecha · autor · versión · estado (borrador / aprobado Juan)
- SHA / rama de referencia
- Track: A (Vite+React+Express+Prisma) — explícito
- Prerrequisitos: D-F1-001 · D-F2-001 · DoD

## 1. Propósito y alcance
Qué cubre este doc · audiencia (dev nuevo) · qué NO cubre (features, Stripe, Track B).

## 2. Prerrequisitos de máquina
Node (versión del repo / engines si hay) · npm · Docker Desktop (solo para Postgres local) · Git · accesos Vercel/Render (ops).

## 3. Estructura del monorepo app
Paths canónicos: frontend `src/` · API `server/` · Prisma · scripts · docs.

## 4. Instalación
```bash
npm install
```
Notas postinstall / `prisma generate` si aplica.

## 5. Variables de entorno
Tabla: variable · local · preview · prod · secreto? · dónde se setea.
Reglas DB-02: nunca mezclar `.env` prod con `api:test`.
Referencia a `.env.example` — **prohibido** commitear valores reales.

## 6. Base de datos
- Docker Compose local (`docker compose up -d`)
- Connection check: `npm run db:test-connection`
- Migrate: `db:migrate` (dev) vs `db:migrate:deploy` / status
- Seeds: `db:seed` · `db:seed:new-student` · cuándo usar cada uno
- **R-OPS-01:** estado baseline prod · qué documentar · qué NO hacer (`migrate deploy` ciego)

## 7. Scripts canónicos
Tabla completa (nombre npm · qué hace · cuándo usarlo). Incluir alias “develop” = `dev` / `api:dev`.

## 8. Arranque local (happy path setup)
Orden: Docker DB → env → migrate/seed seguro → `api:dev` → `dev` (Vite) → verificar health.

## 9. Verificación
`typecheck` · `test` · `build` · `verify` · `ops:test-db-guard` · tests Docker opcional.
Criterio: cifrar conteos con salida real, no docs viejos.

## 10. Errores y logging
- Errores API (handler Express + Sentry opcional)
- Dónde mirar logs local / Render
- Errores comunes de setup (puerto, DATABASE_URL, JWT_SECRET, CORS)

## 11. Matriz de entornos
Ver sección “Matriz entorno” de la instrucción Fase 3 (local / preview / prod).

## 12. Storage / media
URLs en PathNode (video/PDF) — sin blob store propio MVP. Cómo apuntar assets en local vs prod.

## 13. Bridge WhatsApp (solo configuración)
Número canónico · `wa.me` · dónde vive en código/config · ops grant ACTIVE.
**No** implementar pasarela.

## 14. Deploy y smoke (puntero)
Links a `docs/deploy/*` · `vercel.json` · no repetir checklists enteros si ya existen — resumir + link.

## 15. P0 ops (clasificación)
INC-admin-cred · R-OPS-01: documentar estado, impacto launch, dueño ops.
**No** rotar secretos desde esta fase en el repo.

## 16. Checklist “otro dev en 30–60 min”
Lista numerada verificable de punta a punta.

## 17. Fuera de alcance / deuda conocida
Lint ausente · baseline prod · etc. (sin “arreglar” salvo OK Juan).

## 18. Aprobación
Casilla: Juan aprueba `03` · fecha · restricciones.
```

**Densidad:** actionable; preferir tablas y comandos copiables. Cero vaguedades (“configurar bien la DB”).

---

## Auditoría previa obligatoria (snapshot 2026-07-14)

Revalidar contra `package.json` al **ejecutar**. Snapshot de esta instrucción:

### Scripts que YA existen

| Expectativa protocolo | Script real | Notas |
|----------------------|-------------|--------|
| install | `npm install` (no script npm) | Estándar |
| develop | `dev` (Vite) · `api:dev` (API) | **No** hay script llamado `develop` — documentar alias |
| build | `build` | `vite build` |
| lint | **AUSENTE** | No hay `"lint"` en `package.json` — documentar gap; **no** inventar ESLint sin OK Juan |
| typecheck | `typecheck` (+ `app:typecheck` · `api:typecheck`) | Gate verify |
| test | `test` (`app:test` + `api:test`) | API tests con guard DB |
| verify | `verify` | `typecheck && test && build` |
| migrate | `db:migrate` · `db:migrate:deploy` · `db:migrate:status` | + `prisma:generate` |
| seed | `db:seed` · `db:seed:new-student` | |
| extras ops | `db:test-connection` · `api:test:docker` · `ops:test-db-guard` · `deploy:verify-*` | Incluir en §7 del `03` |

### Docker

| Pregunta | Respuesta real |
|----------|----------------|
| ¿Hay Dockerfile de app? | **No** (búsqueda vacía) |
| ¿Hay `docker-compose.yml`? | **Sí** — solo servicio **Postgres 15** local |
| ¿Docker es obligación del cartel? | **No** (D-ROAD-003) — Compose = herramienta local DB |
| ¿Fase 3 debe dockerizar la app? | **NO** |

### Seeds / migraciones

- Migraciones Prisma presentes bajo `prisma/migrations/` (init + auth + onboarding + community + pathnode…).  
- Seeds: `prisma/seed.ts`, `prisma/seed-new-student.ts`.  
- Prod: **R-OPS-01** — `migrate deploy` puede fallar P3005 hasta baseline; documentar, no “arreglar” solo en Fase 3 sin OK ops.

### Logging / errores

- API: `console.error` + `Sentry.setupExpressErrorHandler` / capture si DSN.  
- Instrumentación: `sentry.server.instrument.ts` cargada en `api:dev`.  
- Frontend: DSN Vite opcional en `.env.example`.  
- Fase 3: **documentar** comportamiento; no rearmar observability stack.

### Docs setup

- Carpeta `docs/setup/` — **existe**; entregable `03-entorno-desarrollo.md` en **borrador / EN REVISIÓN**.  
- README raíz: mínimo Figma — insuficiente como onboarding (`03` lo supersede).

---

## Matriz entorno (qué documentar en `03` §11)

| Tema | Local | Preview (Vercel) | Producción |
|------|-------|------------------|------------|
| Frontend | `npm run dev` · Vite | Deploy preview Vercel | `proyectogmusic.vercel.app` (u origin canónico) |
| API | `npm run api:dev` · puerto `API_PORT` | Proxy/`VITE_API_*` según preview | Render `gmusic-api` + proxy `vercel.json` |
| DB | Docker Compose `localhost:5432/gmusic_learning_db` **o** DB de desarrollo documentada | Normalmente API apunta a staging/CI — **aclarar reality** | Supabase/prod — **nunca** tests |
| Env files | `.env` ops local (no regenerar desde example a ciegas) · `.env.docker` tests | Dashboard Vercel | Render + Vercel secrets |
| Migrate | `db:migrate` en DB local | Solo si hay staging controlado | `db:migrate:deploy` **solo** tras resolver R-OPS-01 / process ops |
| Seed | Local/staging con passwords de env | Evitar seed accidentales | **Prohibido** seed prod salvo runbook explícito Juan |
| Verify | `npm run verify` en máquina | CI si aplica | Smoke `deploy:verify-*` / checklists deploy |
| CORS | `localhost:5173` | Preview URL en `CORS_ORIGINS` | Prod origins |
| WhatsApp | Mismo bridge; número canónico | Idem | Idem — bridge humano |
| Auth cookies | HTTP local quirks | HTTPS preview | HTTPS prod `secure` |

---

## Relación con P0 ops

| Ítem | En Fase 3 | ¿Bloquea cerrar Fase 3 docs? | ¿Bloquea launch MVP? |
|------|-----------|------------------------------|----------------------|
| **INC-admin-cred** (credencial admin prod) | **Documentar** estado + link incidente + que la rotación es **ops humano fuera del repo** | **No** (si el doc es claro) | **Sí** (MVP §7.9 / D-ROAD-005 D) hasta resuelto o riesgo aceptado por Juan |
| **R-OPS-01** (Prisma baseline prod / P3005) | **Documentar** síntoma, workaround SQL idempotente histórico, pasos baseline (link Prisma), prohibiciones | **No** si queda runbook honesto | **Sí** si impide persistir / corrupción / migraciones críticas |
| Rotar secretos en código / commit `.env` | **Prohibido** | — | — |
| Inventar script `lint` | Solo documentar ausencia; añadir lint = **OK Juan** separado | No | No |

**Clasificar vs bloquear:** Fase 3 cierra cuando el `03` permite onboarding y deja P0 **visibles**. No “cierra” INC ni baseline por arte de magia documental.

---

## Bridge WhatsApp (solo setup)

Documentar en `03` §13:

- Canal = bridge humano post-gate (D-024 / D-027 diferido).  
- Dónde se construye el `wa.me` / número canónico (buscar en código al ejecutar; no hardcodear número nuevo).  
- Ops: grant `Subscription ACTIVE` (`manual-student-activation.md`).  
- **Fuera:** Stripe, Mercado Pago UI, simular cobro automático.

---

## Criterios de aceptación Fase 3 (verificables)

Fase 3 se declara **cerrada** solo si:

- [x] Existe `docs/setup/03-entorno-desarrollo.md` con **todas** las secciones de la plantilla.  
- [x] Un lector puede seguir §16 (checklist) sin preguntar “¿qué script uso?”.  
- [x] Tabla de scripts coincide con `package.json` real (incluye gap **lint**).  
- [x] Docker documentado como **solo Postgres** local; app no dockerizada.  
- [x] Matriz local / preview / prod completa y honesta.  
- [x] R-OPS-01 e INC-admin-cred clasificados (documentar vs bloqueo launch).  
- [x] WhatsApp solo configuración/docs — sin pasarela.  
- [x] Cero features producto · cero schema Comment · cero Track B.  
- [x] Sin secretos reales nuevos en git.  
- [x] Juan marca aprobado en §18 del `03` (**D-F3-001**, 2026-07-14).  
- [x] `etapa-actual.md` → Fase 3 TERMINADA · Fase 4 **NO INICIADA** sin OK.  
- [ ] Si se tocó código (scripts/docs only): `npm run verify` verde — o justificado N/A si fue solo markdown.

---

## Fuera de alcance

| Ítem | Por qué |
|------|---------|
| Features MVP / UI | Fases 4–10 + tickets |
| **Comment schema / migración CommunityComment** | Producto/gobernanza — **NO Fase 3** |
| Mi Progreso página | T-MVP-PROGRESS / Fase 7 |
| T-PUB-01 / T-UX-LESSON-01 implementación | Tickets propios |
| Email verify · Fase 4 auth rewrite | WON'T / fase posterior |
| Stripe / MP | WON'T MVP |
| Dockerizar SPA+API | No requerido; Compose DB basta |
| ESLint/Prettier greenfield | Gap documentado; no scope default |
| Mitigar R-001 / R-002 | Sin decisión |
| Reabrir arquitectura D-F2-001 | Gobernanza nueva |
| Commit/push autónomo | Autorización Juan |

---

## Ambigüedades Fase 2 → ¿Fase 3 o backlog?

| Ambigüedad (informe F2 §6) | ¿En Fase 3? | Destino |
|----------------------------|-------------|---------|
| **Comment** (MVP “comentar” vs stub) | **NO** | Backlog / ticket comunidad o enmienda MVP — **no** migración en Fase 3 |
| Mi Progreso UI | **NO** | T-MVP-PROGRESS / Fase 7 |
| T-PUB-01 contenido | **NO** | Fase contenido/ops |
| T-UX-LESSON-01 | **NO** | Ticket UX |
| R-002 entitlements API | **NO** (solo mencionar si afecta setup) | Backlog auth/ops |
| R-001 session snapshot | **NO** | Backlog arquitectura |
| Mocks comunidad launch | **NO** | Pre-launch producto |
| Password recovery | **NO** | Backlog |
| Plan como tabla | **NO** | Post-pasarela |
| “¿Dónde va lint?” | **SÍ documentar gap** | Opcional ticket DX post-OK |
| “¿Cómo baseline Prisma?” | **SÍ documentar** | Ejecución baseline = ops + OK Juan (puede ser anexo, no feature) |
| Preview vs staging DB real | **SÍ aclarar** en matriz | — |

Corrección al informe F2: filas “resuelve en Fase 3+” para Comment/Mi Progreso significaban “después de cerrar arquitectura”, **no** “dentro del trabajo de INFRAESTRUCTURA”. Esta instrucción lo fija.

---

## Método — pasos 1–N (Cursor, tras OK ejecución)

1. **Releer** esta instrucción + `02-arquitectura-sistema.md` + `.env.example` + `package.json` scripts (re-auditoría).  
2. **Crear** carpeta `docs/setup/` si no existe.  
3. **Copiar plantilla** → `docs/setup/03-entorno-desarrollo.md`.  
4. **Rellenar §0–4** (metadatos, propósito, máquina, estructura, install).  
5. **Rellenar §5–6** env + DB (DB-02, Compose, migrate/seed, R-OPS-01).  
6. **Rellenar §7–9** scripts + arranque + verify (comandos probados o citados con evidencia).  
7. **Rellenar §10–12** logging, matriz entornos, storage URLs.  
8. **Rellenar §13–15** WhatsApp config, deploy pointers, P0 ops.  
9. **Rellenar §16–18** checklist otro-dev + fuera de alcance + casilla aprobación.  
10. **Anexos opcionales** solo si §6/15 se vuelven ilegibles sin ellos.  
11. **No** implementar features · **no** migrar Comment · **no** rotar secretos en repo.  
12. Si Juan pidió ajustes menores de scripts docs-only y autorizó: tocar mínimo + `npm run verify`.  
13. **Cierre control:** `etapa-actual` · `changelog` · `PROJECT_STATUS` · pedir firma Juan §18.  
14. **No** abrir Fase 4 sin OK explícito.

**Tope reintentos verify:** protocolo loop (máx 3; 4.º congela).

---

## Relación T-* / verify

| Ítem | Relación Fase 3 |
|------|-----------------|
| `npm run verify` | Gate técnico si hay cambio ejecutables; docs-only → N/A justificado |
| T-PUB-01 · T-UX-LESSON-01 · T-MVP-* | **Fuera** — solo menciones de dependencia ops |
| R-OPS-01 · INC-admin-cred | **Dentro** como documentación/clasificación |
| DoD `definition-of-done.md` | Aplica a la calidad del doc `03` y a cualquier cambio de script |
| Skill | `gmusic-verification` · `gmusic-ci-deploy` (punteros) · `gmusic-agent-workflow` |

**Regla:** documentar un ticket en `03` **no autoriza** implementarlo.

---

## Formato de cierre Fase 3

Cuando `03` esté **aprobado por Juan**:

1. **`docs/roadmap/etapa-actual.md`**  
   - Fase 3 INFRAESTRUCTURA — **TERMINADA**.  
   - Próxima: Fase 4 AUTENTICACIÓN — **NO INICIADA** hasta OK.  

2. **`docs/roadmap/changelog.md`** — entrada con link a `03`.  

3. **`.agents/PROJECT_STATUS.md`** — hito corto.  

4. **`decisiones.md`** — opcional `D-F3-001` si Juan formaliza cierre igual que F1/F2.  

5. **No** iniciar Fase 4 ni features hasta OK explícito.

---

## Qué necesita Juan aprobar (estado 2026-07-14)

### Ya hecho

- Lectura Fase 2 → **D-F2-001**.  
- Autorización a preparar esta instrucción.  
- **OK Juan ejecutar Fase 3** → `03` redactado (**D-F3-WIP**).  
- Revisión de coherencia: `docs/roadmap/fase-3-revision-coherencia.md` (veredicto `coherente`).

### Pendiente para **cerrar** Fase 3

~~Mensaje tipo OK §18~~ → **cumplido 2026-07-14** (**D-F3-001**).

Fase 3 **TERMINADA**. Fase 4 permanece **NO INICIADA** hasta OK Juan explícito.
---

## Anexo A — Gate de inicio (histórico)

Cumplido 2026-07-14 (“OK, ejecuta Fase 3”). Conservado como referencia; no reabrir ejecución greenfield del `03`.

---

## Anexo B — Mapa rápido comandos (referencia ejecutor)

```bash
npm install
docker compose up -d
# crear .env.docker según .env.example (solo DATABASE_URL local)
npm run prisma:generate
npm run db:migrate          # solo DB local/dev
npm run db:seed             # con cuidado; passwords por env
npm run api:dev             # terminal 1
npm run dev                 # terminal 2
npm run typecheck
npm run test
npm run build
npm run verify
```

---

*Fin de la instrucción. Entregable `docs/setup/03-entorno-desarrollo.md` ya redactado (borrador). Cierre formal: firma Juan §18 · ver `fase-3-revision-coherencia.md`.*
