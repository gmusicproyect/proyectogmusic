# Handoff — cierre ciclo P0 H1

Fecha: 16 Jul 2026
Rama / HEAD: `main` @ `1ad047d` (P0) · base previa `e5b161c`
Estado Git: commit único P0 creado con alcance selectivo; push no autorizado

## Dictamen

Juan aprobó Gates G1–G8. El ciclo P0 H1 queda cerrado:

1. P0-01 — Identidad / Perfil H1
2. P0-02 — Onboarding diagnóstico
3. P0-03 — Ruta 12 meses + FTC
4. P0-07 — Pagos conceptuales + Entitlements
5. P0-05 — Sesión + Eventos
6. P0-04 — Mi Camino
7. P0-06 — Mi Progreso
8. P0-08 — Biblioteca básica

## Contratos H1 vigentes

- `profileId = userId` mediante `LearnerContextH1`; es un puente temporal, no
  autoriza tabla Profile ni migraciones.
- `/me/path` conserva payload legacy y agrega `pathViewH1`.
- `/me/progress` expone progreso derivado de eventos P0-05.
- `/me/library` expone catálogo básico filtrado por Entitlements.
- `/me/access` es la fuente única de autorización.
- Premium y Comunidad permanecen deshabilitados.
- Audio, pitch, accuracy y scoring están fuera del alcance.

## Puentes temporales aceptados

- Eventos y proyección de práctica: memoria de proceso
  (`memory_bridge_h1`).
- Onboarding / perfil implícito: proyección H1 en memoria.
- Catálogo Biblioteca: fixture de metadatos en memoria
  (`memory_fixture_h1`), sin seeds ni multimedia real.

Estos puentes no son persistencia productiva. Persistencia durable de eventos,
progreso y catálogo requiere un mandato arquitectónico separado.

## Verificación de cierre

- P0-01: H1 13/13.
- P0-03: dominio Ruta/FTC aprobado en G3.
- P0-05: T-SES 6/6.
- P0-04: T-CAM 10/10.
- P0-06: T-PRG 12/12.
- P0-08: T-LIB 13/13.
- P0-04 + P0-06 + P0-08 + timezone: 39/39.
- App: 578/578.
- Typecheck: OK.
- Build: OK; warnings preexistentes de chunks/imports.
- `npm run verify`: rojo por deuda seed/DB aceptada por Juan; no se atribuye a
  regresión P0.
- `prisma/`: sin cambios P0; no schema ni migraciones.

## Decisión de secuencia

Juan eligió:

1. cerrar documentación/evidencia final;
2. luego revisar y autorizar explícitamente un commit único P0;
3. después evaluar persistencia durable como mandato separado.

## Cierre Git

- Juan revisó y autorizó la lista exacta de 41 rutas P0.
- El commit usa staging selectivo; no incluye trabajo ajeno del árbol sucio.
- No se autoriza push.
- No iniciar persistencia durable, UI nueva, routing, premium ni Comunidad.

---

## Handoff para retomar (17 Jul 2026)

**Rama / HEAD:** `main` @ `1ad047d` — commit P0 local, **sin push**.

**Hecho hoy (16 Jul):**
- Gates G6, G7 y G8 aprobados por Juan.
- Implementados P0-06 (Mi Progreso `progressViewH1`), P0-08 (Biblioteca
  `libraryH1`) sobre lo ya cerrado (P0-01..05, 07, 04).
- Cierre documental: evidencias por paquete + `P0_evidencia_final_ciclo_H1.md`
  (viven en el volumen externo de análisis, no en el repo).
- Commit único P0 `1ad047d` (41 rutas, staging selectivo).

**Verificación:** app 578/578 · P0 suites 39/39 · typecheck OK · build OK ·
`npm run verify` global rojo por deuda seed/DB (aceptada).

**Pendiente / decisiones abiertas:**
1. ¿Autorizar `git push` de `1ad047d` a `origin/main`? (hoy NO).
2. Abrir o no mandato de **persistencia durable** (eventos, progreso, catálogo)
   — hoy en memoria (`memory_bridge_h1`, `memory_fixture_h1`).
3. UI/routing de Mi Camino, Mi Progreso y Biblioteca siguen sin abrir.

**No tocar sin OK Juan/Opus:** schema/Prisma, migraciones, auth, pagos reales,
premium, Comunidad, push a remoto, tabla Profile (H1 `profileId = userId` es
puente temporal).

**Árbol de trabajo:** quedan cambios preexistentes ajenos a P0 sin commitear
(UI lesson, CI, `pathPresentation`, docs de roadmap, etc.) — no forman parte
del paquete P0 y no deben mezclarse.

---

## Continuación 17 Jul 2026 — Persistencia Durable (PD-0 + PD-1)

**Mandato autorizado:** solo inventario + diseño. Sin schema, migraciones, código
productivo, UI, Premium, Comunidad, Profile, prod ni push.

**Entregado:**
- `docs/roadmap/persistencia-durable-pd0-inventario.md`
- `docs/roadmap/persistencia-durable-pd1-diseno.md`

**Pendiente humano:** firmar PD-1 (o ajustar D-PD / LearnerProjection) y, si
corresponde, autorizar PD-2 con frase explícita.

---

## Continuación 17 Jul 2026 — Persistencia Durable (PD-2)

**Mandato autorizado:** schema + migración **solo local/Docker** (`PracticeEvent`,
proyecciones H1, `LibraryResource`, snapshot/version de `LessonSession`, policy
backend de entitlements). Sin UI, Premium, Comunidad, Profile, prod ni push.

**Entregado:**
- `prisma/schema.prisma` — enums + modelos durables + snapshot `LessonSession`.
- `prisma/migrations/20260717120000_pd2_durable_persistence_h1/migration.sql`
  (DDL canónico Prisma; **aplicación pendiente** de `docker compose up` +
  `npm run db:migrate:deploy`, nunca prod).
- Repos: `practiceEventRepo`, `ftcProjectionRepo`, `learnerProjectionRepo`,
  `libraryResourceRepo`.
- Policy: `entitlementsPolicyH1` (helper puro, **NO cableado** a endpoints).
- Tests: `server/tests/pd2DurablePersistenceH1.test.ts` — **15/15** lógica pura.
- Evidencia: `docs/roadmap/persistencia-durable-pd2-evidencia.md`.

**Verificación:** `prisma validate` OK · `prisma generate` OK · typecheck OK ·
build OK · PD-2 15/15 (offline) · `verify` global sigue rojo por seed/DB.

**No hecho (fuera de PD-2):** aplicar la migración (no hay Postgres local
levantado en la sesión), cablear repos/policy a servicios (PD-3), seed Biblioteca
(PD-4), enforcement de entitlements en rutas (PD-5), commit y push.

**Pendiente humano:** decidir (a) levantar Docker + aplicar migración y abrir
PD-3, o (b) ajustar schema antes de aplicar. Push sigue **sin autorizar**.

---

## Continuación 17 Jul 2026 — Validación local post-PD-2

**Mandato autorizado:** Docker Postgres + `migrate deploy` local + smoke mínimo +
documentar. Sin cablear servicios, sin UI, sin prod, sin commit ni push.
**PD-3 queda bloqueado** hasta cierre de esta validación.

**Hecho:**
- Contenedor `gmusic_postgres_local` Up · `pg_isready` OK.
- Migración `20260717120000_pd2_durable_persistence_h1` **aplicada** en
  `localhost:5432` / `gmusic_learning_db` · schema **up to date** (8/8).
- SQL smoke: 5 tablas · 3 enums · `LessonSession.content_snapshot/version` ·
  índices `practice_events`.
- Prisma Client smoke: `scripts/ops/pd2-local-smoke.mjs` (host guard localhost;
  counts 0 esperados; models presentes).
- Typecheck OK · PD-2 tests 15/15.
- Informe: `docs/roadmap/persistencia-durable-pd2-validacion-local.md`.

**Veredicto:** validación local **VERDE**. PD-3 sigue **BLOQUEADO** hasta OK
Juan con frase explícita. Commit/push **no** autorizados.

---

## Continuación 17 Jul 2026 — PD-3 servicios durable

**Mandato autorizado:** servicios H1 leen/escriben durable en local
(`GMUSIC_H1_DURABLE=1`). Sin UI, Premium, Comunidad, Profile, prod ni push.

**Entregado:**
- Flag + bridges: `h1DurableFlag`, `practiceEventsBridge`, `learnerProjectionBridge`.
- Snapshot R-001 al crear `LessonSession`; complete Track A usa snapshot si hay.
- Cableado: lifecycle práctica, start sesión, onboarding async, `resolveLearnerContext`
  async, rutas `/me/*` path/progress/onboarding/context.
- `meta.eventSource`: `db` con flag ON · `memory_bridge_h1` con flag OFF.
- Biblioteca sigue fixture (PD-4). Policy en rutas sigue sin cablear (PD-5).
- Tests: PD-3 integración **3/3** (Docker+flag) · regresión memoria P0 verde.
- Evidencia: `docs/roadmap/persistencia-durable-pd3-evidencia.md`.
- `.env.docker` incluye `GMUSIC_H1_DURABLE=1`.

**Pendiente humano:** autorizar PD-4 (seed Biblioteca) o commit PD-2/PD-3.
Push sigue **sin autorizar**.
