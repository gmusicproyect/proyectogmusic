# PD-2 — Evidencia Persistencia Durable H1

**Fecha:** 2026-07-17
**Mandato:** Persistencia Durable H1 — PD-2 (autorizado Juan)
**Alcance autorizado:** Schema + migración **solo local/Docker** · `PracticeEvent`, proyecciones H1, `LibraryResource`, snapshot/version de `LessonSession`, policy backend de entitlements
**Prohibido (respetado):** UI · Premium · Comunidad · Profile · prod · push
**Diseño base:** `persistencia-durable-pd1-diseno.md` (D-PD-01…06)

---

## 1. Qué se hizo

Se materializó el diseño PD-1 en la capa de datos, sin cablear servicios ni endpoints (eso es PD-3):

1. **Schema Prisma** — nuevas enums, modelos durables y snapshot de sesión.
2. **Migración local/Docker** — SQL incremental con DDL canónico de Prisma.
3. **Repositorios** — data-access + helpers puros (idempotencia, rebuild).
4. **Policy backend de entitlements** — helper puro reutilizable (D-PD-05 / R-002), **no** cableado aún.
5. **Tests de lógica pura** — 15/15 sin DB.

---

## 2. Cambios de schema (`prisma/schema.prisma`)

| Objeto | Tipo | Notas |
|--------|------|-------|
| `PracticeEventType` | enum | practice_started/completed/abandoned · ftc_card_completed · unit_completed |
| `LibraryResourceType` | enum | song_simple · exercise · video_guide · backing_track · support_material |
| `ResourceAccessTier` | enum | basic · premium (premium force-OFF en vista) |
| `PracticeEvent` | model | append-only; UNIQUE `natural_key` y `(user_id,event_type,causation_command_id)`; INDEX `(user_id,occurred_at)`, `(session_id)` |
| `FtcProgressProjection` | model | PK `user_id`; JSON completedCards/Units/slotsByUnit; `rebuilt_at`/`rebuild_source`/`schema_version` |
| `LearnerProjectionH1` | model | PK `user_id`; onboarding status/partial/result + overrides; **sin tabla Profile** |
| `LibraryResource` (+`LibraryResourceLink`) | model | catálogo propio; `status` reutiliza `PublishStatus`; INDEX `(status,instrument,suggested_month)` |
| `LessonSession.content_snapshot` / `content_version` | column | R-001 snapshot al start; complete valida contra snapshot |
| `User.practiceEvents` / `ftcProjection` / `learnerProjection` | relation | back-relations |

**Convención:** tablas nuevas en snake_case vía `@map` (coherente con `community_*` / `onboarding_analytics`). `profileId` H1 = `userId` (D-DOM-001).

---

## 3. Migración

`prisma/migrations/20260717120000_pd2_durable_persistence_h1/migration.sql`

- DDL generado con `prisma migrate diff --from-empty --to-schema-datamodel` (canónico Prisma) y recortado a los objetos nuevos + `ALTER "LessonSession" ADD COLUMN`.
- `npx prisma validate` → **schema válido**.
- `npx prisma generate` → **cliente generado** (offline).
- **Aplicación local:** ✅ validada 17 Jul 2026 en Docker (`gmusic_postgres_local`,
  `localhost:5432`) — ver `persistencia-durable-pd2-validacion-local.md`.
  R-OPS-01: **cero** migraciones en prod en este mandato.

---

## 4. Repositorios (data-access, NO cableados)

| Archivo | Responsabilidad |
|---------|-----------------|
| `server/lib/practiceEventRepo.ts` | `appendPracticeEventDurable` (idempotente vía id/command/naturalKey, retry P2002) · `listPracticeEventsDurable` · **puro:** `buildPracticeEventNaturalKeyH1`, `rebuildFtcProjectionFromEvents` |
| `server/lib/ftcProjectionRepo.ts` | `getFtcProjectionDurable` · `rebuildFtcProjectionDurable` (relee eventos → upsert proyección, `rebuild_source`) |
| `server/lib/learnerProjectionRepo.ts` | `getLearnerProjectionDurable` · `upsertLearnerProjectionDurable` (patch parcial; reemplazo durable de `profileProjectionH1Store`) |
| `server/lib/libraryResourceRepo.ts` | `listPublishedLibraryResources` · `getPublishedLibraryResourceById` (solo PUBLISHED; DRAFT/ARCHIVED nunca salen) |

**D-PD-02:** escritura canónica = `PracticeEvent`; proyección recalculable e idempotente desde eventos. Los repos aceptan `PrismaClient | Prisma.TransactionClient` para uso en transacción en PD-3.

---

## 5. Policy backend de entitlements (D-PD-05 / R-002)

`server/lib/entitlementsPolicyH1.ts`

- `evaluateStudentLearningAccess(view, req)` — decisión pura (zona → mes → biblioteca).
- `assertStudentLearningAccess(view, req)` — lanza `ApiError` 403 ENTITLEMENT / 400 VALIDATION_ERROR.
- `allowDemoGrant` evita bypass silencioso de DEMO (PD-1 §6.2).
- **Entregado como helper reutilizable pero NO cableado** a endpoints: endurecer `requireZone` cambia comportamiento (cuentas DEMO de QA) y requiere matriz de tests → **PD-3/PD-5**. Premium sigue locked.

---

## 6. Verificación

| Check | Resultado |
|-------|-----------|
| `prisma validate` | ✅ válido |
| `prisma generate` | ✅ cliente generado |
| `npm run typecheck` (app + api) | ✅ OK |
| Tests PD-2 (`server/tests/pd2DurablePersistenceH1.test.ts`) | ✅ **15/15** (naturalKey 4 · rebuild 4 · policy 7) — corridos offline sin DB |
| `npm run build` | ✅ OK |
| `npm run verify` global | 🔴 sigue rojo por seed/DB (deuda preexistente `api:test` exige Postgres) — **no** introducido por PD-2 |

**Por qué los tests PD-2 corren fuera del runner `api:test`:** el runner exige `DATABASE_URL` y conecta a Postgres. Los tests PD-2 son de lógica pura (no importan Prisma), por lo que se ejecutan con `node --import tsx --test` directo. Los tests de integración de repos con DB llegan en PD-3.

---

## 7. Invariantes respetadas

- Sin UI · sin routing nuevo · sin Premium · sin Comunidad · sin Profile · sin prod · sin push.
- `profileId` H1 = `userId`; sin tabla Profile.
- Append-only: `PracticeEvent` no se actualiza; correcciones = eventos compensatorios / rebuild.
- Contratos P0 intactos: no se tocaron servicios ni endpoints existentes.
- Sin score/accuracy/audio en eventos ni proyecciones.

---

## 8. Frontera / siguiente (NO autorizado)

| Fase | Entrega | Gate |
|------|---------|------|
| **PD-3** | Servicios H1 escriben/leen durable (flag lectura única) + cableado policy | OK Juan |
| **PD-4** | Seed Biblioteca desde fixture H1 | Reglas H1 library |
| **PD-5** | Hardening idempotencia/concurrencia/R-002 (enforcement en rutas) | Suites T-PD |
| **PD-6** | Evidencia + handoff + commit/push | OK Juan |

**Acción humana pendiente:** revisar PD-2 y decidir si (a) aplicar la migración en Docker local y abrir PD-3, o (b) ajustar schema antes de aplicar.

---

*PD-2 evidencia · Persistencia Durable H1 · 2026-07-17 · aplicación de migración y PD-3 sin autorizar · sin push*
