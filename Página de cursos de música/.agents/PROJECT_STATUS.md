# Project Status — Gmusic Estudio

Última actualización: **18 Jul 2026** · **Gates G1–G8 APROBADOS** · P0 `1ad047d` + PD-2/PD-3 `ad124ac` + PD-4 `ef6333d` local sin push · **Persistencia Durable: PD-0…PD-5** (enforcement R-002 en endpoints privados H1, VERDE local) · **PD-5 commit NO autorizado aún** · handoff: `docs/vision/handoffs/2026-07-16-cierre-ciclo-p0-h1.md`

## Hito — Persistencia Durable H1 · PD-5 Enforcement entitlements R-002 (18 Jul 2026)

| Item | Estado |
|------|--------|
| **Mandato Juan** | ✅ OK PD-5 — cablear policy backend en endpoints privados H1 · mantener contratos P0 y DEMO vía grants · sin UI/routing/Premium real/Comunidad/prod/push |
| **Policy única (R-002)** | ✅ `assertStudentLearningAccess` cableado en start (`lessonSessionService`) y complete H1 (`practiceLifecycleH1Service`) — reemplaza checks ad-hoc dispersos |
| **Requisito** | `requireZone + allowDemoGrant + monthIndex` — cierra hueco de zona sin romper DEMO (grant `canStartPractice`) |
| **Contratos P0** | ✅ `/me/path` y `/me/progress` siguen con blockers amables · `/me/library` lista `NO_LIBRARY_ACCESS` (no 403) · detalle premium ya 403 · complete legacy solo propiedad |
| **Gate de mes** | ✅ fuera de `monthsPlayable` → 403 ENTITLEMENT · monthIndex inválido → 400 VALIDATION_ERROR |
| **Tests** | ✅ PD-5 puro 7/7 · API `me-entitlements-h1` 2/2 (T-ENT-03 mes5→403) · `practiceLifecycleH1` 1/1 (T-SES-09) · `pathViewH1` 10/10 · typecheck/build OK |
| **Premium real / Comunidad** | ❌ fuera de alcance (grants force-OFF) |
| **Evidencia** | ✅ `docs/roadmap/persistencia-durable-pd5-evidencia.md` |
| **Commit / push** | **NO** (pendiente OK) |

## Hito — Persistencia Durable H1 · PD-4 Seed Biblioteca (18 Jul 2026)

| Item | Estado |
|------|--------|
| **Mandato Juan** | ✅ OK PD-4 — migrar catálogo fixture → filas reales DB local · sin UI/routing/Premium real/Comunidad/prod/push |
| **Seed** | ✅ `librarySeedH1` (fixture → `LibraryResource`+`Link`, upsert idempotente) · CLI `scripts/ops/pd4-seed-library.ts` (guard host local) |
| **Lectura durable** | ✅ `libraryCatalogBridge` (`buildLibraryViewH1Async` / detail) · flag OFF = fixture, ON = DB PUBLISHED |
| **Contrato P0-08** | ✅ intacto · `meta.catalogSource` = `db` con flag ON · premium sigue **force-OFF** (locked) · DRAFT/ARCHIVED no visibles |
| **Seed CLI (evidencia)** | ✅ 8 recursos · 6 PUBLISHED · 4 links · re-run idempotente (counts estables) |
| **Tests** | ✅ PD-4 puro 7/7 · PD-4 integración Docker+flag 5/5 · regresión Biblioteca memoria 12/12 · typecheck/build OK |
| **Premium real / multimedia** | ❌ fuera de alcance (mediaRef null; premium locked) |
| **Policy en rutas (R-002)** | ✅ resuelto en **PD-5** |
| **Evidencia** | ✅ `docs/roadmap/persistencia-durable-pd4-evidencia.md` |
| **Commit** | ✅ local `ef6333d` (sin push) |

## Hito — Persistencia Durable H1 · PD-3 (17 Jul 2026)

| Item | Estado |
|------|--------|
| **Mandato Juan** | ✅ OK PD-3 — servicios H1 leen/escriben durable en local · sin UI/Premium/Comunidad/Profile/prod/push |
| **Flag** | ✅ `GMUSIC_H1_DURABLE=1` (`.env.docker`) · OFF = memoria (tests P0) |
| **Bridges** | ✅ `practiceEventsBridge` · `learnerProjectionBridge` |
| **Snapshot R-001** | ✅ write al crear sesión · complete Track A lee snapshot si existe |
| **Rutas `/me/*` + lifecycle** | ✅ async · `meta.eventSource` = `db` cuando flag ON |
| **Biblioteca seed** | ❌ diferido a **PD-4** (sigue fixture) |
| **Policy en rutas (R-002)** | ❌ diferido a **PD-5** (helper ya existe) |
| **Tests** | ✅ PD-3 integración 3/3 (Docker+flag) · memoria P0 verde · typecheck/build OK |
| **Evidencia** | ✅ `docs/roadmap/persistencia-durable-pd3-evidencia.md` |
| **PD-4 / commit / push** | **NO** |

## Hito — Validación local post-PD-2 (17 Jul 2026)

| Item | Estado |
|------|--------|
| **Mandato Juan** | ✅ OK validación local — Docker + migrate + smoke · sin cablear · sin UI/prod/commit/push |
| **Docker** | ✅ `gmusic_postgres_local` Up · `pg_isready` · `localhost:5432` |
| **`migrate deploy`** | ✅ `20260717120000_pd2_durable_persistence_h1` aplicada · schema **up to date** (8/8) |
| **SQL smoke** | ✅ 5 tablas · 3 enums · snapshot cols · índices practice_events |
| **Prisma Client smoke** | ✅ `scripts/ops/pd2-local-smoke.mjs` · counts 0 (esperado) · models OK |
| **Typecheck / PD-2 tests** | ✅ OK · 15/15 |
| **Informe** | ✅ `docs/roadmap/persistencia-durable-pd2-validacion-local.md` |
| **PD-3** | ✅ autorizado y entregado (ver hito superior) |
| **Commit / push** | **NO** |

## Hito — Persistencia Durable H1 · PD-2 (17 Jul 2026)

| Item | Estado |
|------|--------|
| **Mandato Juan** | ✅ OK PD-2 — schema + migración solo local/Docker; sin UI/Premium/Comunidad/Profile/prod/push |
| **Schema Prisma** | ✅ enums `PracticeEventType` / `LibraryResourceType` / `ResourceAccessTier` · modelos `PracticeEvent`, `FtcProgressProjection`, `LearnerProjectionH1`, `LibraryResource`(+`Link`) · snapshot `LessonSession.content_snapshot/version` (R-001) |
| **`prisma validate` / `generate`** | ✅ schema válido · cliente generado |
| **Migración** | ✅ SQL en repo · **aplicada en Docker local** (validación post-PD-2) |
| **Repos** | ✅ `practiceEventRepo` · `ftcProjectionRepo` · `learnerProjectionRepo` · `libraryResourceRepo` |
| **Policy backend entitlements (D-PD-05/R-002)** | ✅ `entitlementsPolicyH1` — **entregado, NO cableado** |
| **Tests PD-2** | ✅ 15/15 lógica pura · typecheck OK · build OK |
| **Evidencia** | ✅ `docs/roadmap/persistencia-durable-pd2-evidencia.md` |
| **Validación local** | ✅ verde — ver hito superior |
| **PD-3 (servicios leen/escriben durable)** | ✅ entregado 17 Jul — ver hito PD-3 |
| **UI / Premium / Comunidad / Profile / prod / push** | **NO** |

## Hito — Persistencia Durable H1 · PD-0/PD-1 (17 Jul 2026)

| Item | Estado |
|------|--------|
| **Brief supervisor** | ✅ `docs/roadmap/persistencia-durable-brief-supervisor.md` |
| **PD-0 inventario** | ✅ `docs/roadmap/persistencia-durable-pd0-inventario.md` |
| **PD-1 diseño** | ✅ `docs/roadmap/persistencia-durable-pd1-diseno.md` — **firmado** (apertura PD-2) |
| **Baseline** | D-PD-01…06 + LearnerProjectionH1 (sin Profile) |

## Hito — Dominio H1 / P0 (16 Jul 2026)

| Item | Estado |
|------|--------|
| **Gate G1 (P0-01)** | ✅ **APROBADO** |
| **Gate G2 (P0-02)** | ✅ **APROBADO** (API; UI/routing diferidos) |
| **Gate G3 (P0-03)** | ✅ **APROBADO** |
| **Gate G4 (P0-07)** | ✅ **APROBADO** — AccessViewH1 + gate práctica |
| **Gate G5 (P0-05)** | ✅ **APROBADO** — lifecycle binario + eventos idempotentes |
| **Gate G6 (P0-04)** | ✅ **APROBADO** — PathViewH1 / Mi Camino backend |
| **Gate G7 (P0-06)** | ✅ **APROBADO** — ProgressViewH1 derivado de eventos |
| **Gate G8 (P0-08)** | ✅ **APROBADO** — LibraryViewH1 / Biblioteca básica |
| **Ciclo P0** | ✅ **CERRADO** — P0-01, 02, 03, 07, 05, 04, 06 y 08 |
| **P0-08 verificación** | T-LIB 13/13 · typecheck/build OK · app 578/578 · verify global rojo por seed |
| **P0-06 verificación** | T-PRG 10/10 (+2) · typecheck/build OK · app 578/578 · verify global rojo por seed |
| **P0-04 verificación** | T-CAM 10/10 · typecheck/build OK · verify global rojo por seed |
| **P0-05 verificación** | T-SES aislados 6/6 · typecheck/build OK · verify global rojo por seed |
| **Schema / audio / scoring / UI** | **NO** |
| **Evidencia final P0** | ✅ `P0_evidencia_final_ciclo_H1.md` + handoff repo 16 Jul |
| **Commit P0** | ✅ Autorizado por Juan — alcance selectivo, sin mezclar cambios preexistentes |
| **Push** | **NO** — no autorizado |
| **Próxima decisión** | Firmar PD-1 y autorizar o no PD-2 (schema local); persistencia durable en curso documental |

## Hito — Brief Fase 8 Comunidad (15 Jul 2026)

| Item | Estado |
|------|--------|
| **Instrucción** | ✅ `docs/roadmap/fase-8-instruccion.md` |
| **Brief supervisor** | ✅ `docs/roadmap/fase-8-brief-supervisor.md` |
| **`08-comunidad.md`** | ❌ no creado (espera OK ejecución) |
| **Ejecución F8** | **NO** |
| **Ticket** | **T-MVP-COMMUNITY** (MUST si en nav · D-ROAD-005 C) |
| **Regla clave** | mocks visibles ≠ launch · nav bloqueada hasta feed real |
| **F9 / código / DB / commit** | **NO** |

## Hito — D-F7-001 · Fase 7 TERMINADA documental (15 Jul 2026)

| Item | Estado |
|------|--------|
| **Decisión** | ✅ **D-F7-001** · **D-F7-WIP** supersedido |
| **Canónico** | ✅ `docs/features/07-mi-progreso.md` v1.0 |
| **Informe** | ✅ `fase-7-informe-supervisor.md` (cerrado) |
| **Veredicto** | **F7 DOCUMENTAL CERRADA** |
| **Launch-ready** | **NO** (capa C abierta) |
| **Course / T-PUB / T-UX** | BRIDGE · DONE LOCAL · frontera |
| **F8 / código / DB / commit** | **NO** |
| **Higiene satélite** | ✅ H1–H3 (revisión + hitos brief) |

## Hito — D-F7-WIP · Fase 7 docs EN PRUEBAS (15 Jul 2026) — **SUPERSEDIDO por D-F7-001**

| Item | Estado |
|------|--------|
| **Decisión** | **SUPERSEDIDO** → **D-F7-001** |
| **Canónico** | ~~v0.1 EN PRUEBAS~~ → ✅ **v1.0** (**D-F7-001**) |
| **Informe** | ✅ `fase-7-informe-supervisor.md` |
| **Veredicto histórico** | ~~listo firma §15~~ → **cumplido** (**D-F7-001**) |
| **Launch-ready** | **NO** (capa C abierta) |
| **F8 / código / DB / commit** | **NO** |

## Hito — Brief F7 actualizado opción C (15 Jul 2026) — **histórico / SUPERSEDIDO por D-F7-001**

| Item | Estado |
|------|--------|
| **Instrucción / supervisor** | ✅ actualizados con auditoría Admin **C** |
| **Veredicto brief (histórico)** | ~~listo para ejecución documental~~ → ejecución docs cerrada (**D-F7-001**) |
| **`07-mi-progreso.md`** | ~~❌ no creado~~ → ✅ **v1.0** (**D-F7-001**) |
| **Ejecución F7** | ~~**NO**~~ → **TERMINADA** documental |
| **Launch-ready Progreso** | **NO** (capa C abierta) |
| **Course Admin** | BRIDGE documentado |
| **T-PUB** | DONE LOCAL · no productiva |
| **F8 / código / commit** | **NO** |

## Hito — Auditoría Admin/editorial pre-F7 (15 Jul 2026) — **histórico** (opción C vigente en `07`)

| Item | Estado |
|------|--------|
| **Informe** | ✅ `docs/roadmap/auditoria-admin-editorial-pre-f7.md` |
| **Veredicto** | Estructura Module→PathNode→Camino **definida** · Course = BRIDGE seed · T-PUB **DONE LOCAL** ≠ prod |
| **F7 (histórico del hito)** | ~~Brief · avance pausado · ejecución NO~~ → F7 docs **TERMINADA** (**D-F7-001**) |
| **Recomendación** | **C** — frontera Admin vigente; launch Progreso = capa C (env medible) |
| **Código / DB / commit** | **NO** |

## Hito — Brief Fase 7 Mi Progreso (15 Jul 2026) — **histórico / SUPERSEDIDO por D-F7-001**

| Item | Estado |
|------|--------|
| **Instrucción** | ✅ `docs/roadmap/fase-7-instruccion.md` (cerrada · D-F7-001) |
| **Brief supervisor** | ✅ `docs/roadmap/fase-7-brief-supervisor.md` (cerrado) |
| **`07-mi-progreso.md`** | ~~❌ no creado~~ → ✅ **v1.0** (**D-F7-001**) |
| **Ejecución F7** | ~~**NO**~~ → **TERMINADA** documental |
| **Ticket** | **T-MVP-PROGRESS** permanece abierto (**capa C** / UI · mandato aparte) |
| **T-UX / F8 / prod / commit** | frontera · **NO** · NO · NO |

## Hito — Fase 6 TERMINADA (15 Jul 2026)

| Item | Estado |
|------|--------|
| **Decisión** | ✅ **D-F6-001** (cierre formal Juan §14) |
| **Canónico** | ✅ `docs/features/06-mi-camino.md` v1.0 |
| **T-PUB-01** | DONE LOCAL (**D-TPUB-01**) — no validación productiva |
| **T-F6-ANTI-DEMO-01** | CERRADO (**D-F6-ANTI-DEMO-001**) |
| **F7** | **NO INICIADA** / no autorizada |
| **Prod / commit / push** | **NO** en cierre F6 |

## Hito — T-F6-ANTI-DEMO-01 CERRADO (15 Jul 2026)

| Item | Estado |
|------|--------|
| **Decisión** | ✅ **D-F6-ANTI-DEMO-001** (cierre formal Juan) |
| **Auditoría** | ✅ `coherente` · `t-f6-anti-demo-01-auditoria-final.md` |
| **Badge / focus** | ✅ `pathPresentation` · sin pedagogía inventada |
| **pathLabel / Mes** | ✅ `Module.order` · **no** índice de array |
| **node.duration** | ✅ vacío (sin minutos inventados por exercises) |
| **Comunidad header** | ✅ bloqueada · modal **fuera del MVP actual** → T-MVP-COMMUNITY |
| **Checklist lección** | ✅ visual local + criteria DB |
| **Seeds / mock path** | ✅ local-only ≠ evidencia productiva · `VITE_USE_PATH_MOCK=false` |
| **Docs** | ✅ `06` § anti-demo · backlog · changelog · deuda DT-12 |
| **F6 cerrada** | ✅ **D-F6-001** (2026-07-15) |
| **F7 / prod DB / commit / push** | **NO** |
| **Verify** | typecheck OK · app **578/578** · path-presentation **7/7** · header 19/19 · phase3a 8/8 · lesson-stage 4/4 · build OK · `api:test` integración puede fallar seed (`getDevStudent`) — preexistente/entorno · separar app vs api en CI |

## Hito — D-F6-WIP · Fase 6 docs EN PRUEBAS (15 Jul 2026) — **SUPERSEDIDO por D-F6-001**

| Item | Estado |
|------|--------|
| **D-F1…D-F5-001 · D-TPUB-01** | ✅ Prerreqs cerrados |
| **OK Juan ejecución F6** | ✅ solo documental (sin código · sin DB · sin F7 · sin commit/push · T-UX OUT) |
| **D-F6-WIP** | ~~EN PRUEBAS · pendiente §14 · NO TERMINADA~~ → **SUPERSEDIDO** por **D-F6-001** |
| **`06-mi-camino.md`** | ✅ **v1.0** canónico (**D-F6-001**) |
| **Informe** | ✅ `docs/roadmap/fase-6-informe-supervisor.md` |
| **Veredicto** | ~~listo revisión §14~~ → **TERMINADA** (**D-F6-001**) |
| **T-UX-LESSON-01** | Frontera · **OUT** salvo mandato aparte |
| **F7 / código / DB / commit / push** | **NO** en cierre F6 |
| **Siguiente** | OK Juan para brief F7 u otros tickets |

## Hito — Brief Fase 6 Mi Camino (15 Jul 2026) — SUPERSEDIDO por D-F6-WIP

| Item | Estado |
|------|--------|
| **Instrucción** | ✅ `docs/roadmap/fase-6-instruccion.md` |
| **Supervisor brief** | ✅ `docs/roadmap/fase-6-brief-supervisor.md` |
| **Veredicto** | ~~`brief listo` · ejecución NO~~ → **ejecución docs EN PRUEBAS** (**D-F6-WIP**) |
| **`06-mi-camino.md`** | ~~❌ No creado~~ → ✅ creado (ver hito D-F6-WIP) |
| **Prerreqs** | D-F1…D-F5-001 · **D-TPUB-01** |
| **Frontera T-UX-LESSON-01** | Documentada · OUT mandato docs-only |
| **Código / DB / F7 / commit / push** | **NO** |
| **Siguiente (histórico)** | ~~OK Juan “ejecuta Fase 6”~~ → supersedido |

## Hito — T-PUB-01 cierre formal DONE LOCAL (15 Jul 2026)

| Item | Estado |
|------|--------|
| **Decisión** | ✅ **D-TPUB-01** — `docs/roadmap/decisiones.md` |
| **Veredicto Juan** | ✅ **DONE LOCAL** |
| **Evidencia** | ✅ `docs/roadmap/t-pub-01-evidencia-local.md` |
| **Course** | `ruta-guitarra-12-meses` PUBLISHED · `d6fdc6fe-3415-4cce-9480-9a9b9b18ea92` |
| **Module piloto** | `f816fee7-2b72-4dea-af66-a5bbbe53ba29` · 5 PathNode PUBLISHED vía Admin |
| **Alumno** | `carlos@gmusic.academy` · ACTIVE · ve bloque en `GET /me/path` |
| **Alcance** | LOCAL · **no** prod DB · **no** launch staging |
| **F6 / código producto / commit / push** | En cierre T-PUB: F6 aún NO · (mismo día: ejecución docs **D-F6-WIP**) |
| **Deuda ops** | **R-OPS-MIGRATE-UUID** · **T-PUB-01-UI** (screenshot FE opcional) — backlog separado |
| **Siguiente (histórico)** | ~~Detenerse · F6 NO~~ → brief → **D-F6-WIP** (hito superior) |

## Hito — T-PUB-01 ejecución LOCAL DONE (15 Jul 2026) — supersedido por D-TPUB-01

| Item | Estado |
|------|--------|
| **Mandato** | ✅ OK Juan — LOCAL controlado |
| **Evidencia** | ✅ `docs/roadmap/t-pub-01-evidencia-local.md` |
| **Veredicto** | ~~`DONE` local · pendiente cierre formal~~ → **DONE LOCAL formal** (**D-TPUB-01**) |
| **F6 / prod DB / código producto / commit** | **NO** |
| **Nota ops** | `migrate deploy` fresh local falló (UUID FK); workaround `db push` solo Docker |
| **Siguiente (histórico)** | ~~Cierre formal Juan~~ → cerrado |

## Hito — T-PUB-01 brief listo · ejecución NO (15 Jul 2026) — supersedido por DONE local

| Item | Estado |
|------|--------|
| **Brief** | ✅ `docs/roadmap/t-pub-01-brief.md` |
| **Supervisor** | ✅ `docs/roadmap/t-pub-01-supervisor.md` |
| **Veredicto** | ~~`brief listo`~~ → ejecución local DONE → **D-TPUB-01** |
| **Piloto** | ~~NO ejecutado~~ → ejecutado LOCAL · cerrado formal |
| **Umbral usable** | D-F5-001 = validator (título + `completionCriteria` + 5 `StageType`); media/micro SHOULD |
| **F6 / publish prod / commit** | **NO** |
| **Siguiente (histórico)** | ~~Mandato Juan pasos 1–8~~ → supersedido |

## Hito — D-F5-001 · Fase 5 TERMINADA documental (15 Jul 2026)

| Item | Estado |
|------|--------|
| **D-F1…D-F4-001** | ✅ Prerreqs cerrados |
| **OK Juan §13** | ✅ aprueba `05` como canónico Academia/Cursos Track A · Fase 5 TERMINADA (documental) · Fase 6 **NO** |
| **D-F5-001** | ✅ Fase 5 **TERMINADA** (documental) |
| **D-F5-WIP** | ~~EN PRUEBAS~~ → **SUPERSEDIDO** |
| **`05-academia-cursos.md`** | ✅ canónico Academia/Cursos Track A (v1.0) · pointer **T-PUB-01 DONE LOCAL** |
| **Informe** | ✅ `docs/roadmap/fase-5-informe-supervisor.md` |
| **T-PUB-01** | ~~MUST abierto~~ → **DONE LOCAL** (**D-TPUB-01**) |
| **Umbral usable** | ✅ = validator (título + `completionCriteria` + 5 `StageType`); media/micro **SHOULD** |
| **F6 / LessonRunner / Track B** | **NO** |
| **Código / DB / publish prod** | Sin cambios · sin migraciones · sin commit/push |
| **Siguiente** | F6 **NO** hasta OK Juan · deuda ops separada |


## Hito — D-F5-WIP · Fase 5 docs EN PRUEBAS (15 Jul 2026) — SUPERSEDIDO por D-F5-001

| Item | Estado |
|------|--------|
| **D-F1…D-F4-001** | ✅ Prerreqs cerrados |
| **OK Juan ejecución F5** | ✅ solo documental (sin código · sin T-PUB-01 código · sin F6 · sin commit) |
| **D-F5-WIP** | ~~EN PRUEBAS · pendiente firma Juan §13 · **NO TERMINADA**~~ → supersedido por D-F5-001 |
| **`05-academia-cursos.md`** | ✅ creado → aprobado (ver hito D-F5-001) |
| **Informe** | ✅ `docs/roadmap/fase-5-informe-supervisor.md` |
| **T-PUB-01** | **MUST abierto** — criterio N=1 documentado; piloto **no** ejecutado |
| **Umbral usable** | ~~Propuesta / pendiente §13~~ → firmado en D-F5-001 |
| **F6 / LessonRunner / Track B** | **NO** |
| **Código / DB / publish prod** | Sin cambios · sin migraciones · sin commit/push |
| **Siguiente (histórico)** | ~~Firma Juan §13 → **D-F5-001**~~ → supersedido |

## Hito — Brief Fase 5 Academia/Cursos (15 Jul 2026) — SUPERSEDIDO por D-F5-WIP / D-F5-001

| Item | Estado |
|------|--------|
| **D-F1…D-F4-001** | ✅ Prerreqs cerrados |
| **Fase 5 brief** | ✅ `docs/roadmap/fase-5-instruccion.md` · `fase-5-brief-supervisor.md` |
| **Ejecución Fase 5** | ~~❌ NO INICIADA~~ → EN PRUEBAS → **TERMINADA** (D-F5-001) |
| **`05-academia-cursos.md`** | ~~❌ No creado~~ → canónico v1.0 (ver hito D-F5-001) |
| **T-PUB-01** | MUST abierto — N=1 bloque usable admin→`/mi-camino` |
| **Auditoría** | Onboarding + Admin R-008 + filtros PUBLISHED **shipped**; gap = dato/piloto + Course ops BRIDGE |
| **Código / DB / publish prod** | Sin cambios · sin migraciones · sin commit/push |
| **Fases 6–9 / Track B** | NO |
| **Siguiente (histórico)** | ~~OK Juan “ejecuta Fase 5”~~ → supersedido |

## Hito — D-F4-001 · Fase 4 TERMINADA (15 Jul 2026)

| Item | Estado |
|------|--------|
| **D-F1-001 / D-F2-001 / D-F3-001** | ✅ Prerreqs cerrados |
| **OK Juan §14** | ✅ aprueba `04` como canónico Auth Track A · Fase 4 TERMINADA · Fase 5 NO |
| **D-F4-001** | ✅ Fase 4 **TERMINADA** |
| **D-F4-WIP** | ~~EN PRUEBAS~~ → **SUPERSEDIDO** |
| **`04-auth-usuarios.md`** | ✅ canónico Auth Track A (v1.0) |
| **Recovery alumno** | ✅ **BRIDGE** documentado (WA/ops) — sin implementación |
| **Email verify / NextAuth / Fase 5** | WON'T / NO · respetado |
| **Deuda docs** | Lista en `04` §10 — sin reescritura masiva |
| **Bugs P0 auth nuevos** | Ninguno · ops P0 preexistentes enlazados |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente** | Fase 5 **NO INICIADA** / no autorizada · cola MVP-anclada intacta |

## Hito — D-F4-WIP · Fase 4 docs EN PRUEBAS (15 Jul 2026) — SUPERSEDIDO por D-F4-001

| Item | Estado |
|------|--------|
| **D-F1-001 / D-F2-001 / D-F3-001** | ✅ Prerreqs cerrados |
| **OK Juan ejecución F4** | ✅ “OK, ejecuta Fase 4” (recovery BRIDGE · higiene lista · perfil OUT) |
| **D-F4-WIP** | ~~EN PRUEBAS · pendiente firma Juan §14 · no TERMINADA~~ → supersedido por D-F4-001 |
| **`04-auth-usuarios.md`** | ✅ creado → aprobado (ver hito D-F4-001) |
| **Recovery alumno** | ✅ **BRIDGE** documentado (WA/ops) — sin implementación |
| **Email verify / NextAuth / Fase 5** | WON'T / NO · respetado |
| **Deuda docs** | Lista en `04` §10 (CLAUDE/skills “auth pausada” / skill misnamed) — sin reescritura masiva |
| **Bugs P0 auth nuevos** | Ninguno · ops P0 preexistentes enlazados |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente (histórico)** | ~~Firma Juan §14 → D-F4-001~~ → supersedido |

## Hito — Brief Fase 4 Auth (15 Jul 2026) — SUPERSEDIDO por D-F4-WIP / D-F4-001

| Item | Estado |
|------|--------|
| **D-F1-001 / D-F2-001 / D-F3-001** | ✅ Prerreqs cerrados |
| **Fase 4 brief** | ✅ `docs/roadmap/fase-4-instruccion.md` · `fase-4-brief-supervisor.md` |
| **Ejecución Fase 4** | ~~❌ NO INICIADA~~ → supersedido: EN PRUEBAS (D-F4-WIP) |
| **`04-auth-usuarios.md`** | ~~❌ No creado~~ → creado (ver hito D-F4-WIP) |
| **Auth código** | JWT registro/login/logout/guards/D-017 **preexistentes** (D-ROAD-005 A) — sin cambios esta pasada |
| **Gaps brief** | Recovery alumno = SHOULD/BRIDGE · email verify = WON'T · docs “auth pausada” desfasados |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente (histórico)** | ~~OK Juan “ejecuta Fase 4”~~ → supersedido |

## Hito — D-F3-001 · Fase 3 TERMINADA (14 Jul 2026)

| Item | Estado |
|------|--------|
| **D-F1-001** | ✅ Fase 1 APROBADA · MVP Track A **congelado** |
| **D-F2-001** | ✅ Fase 2 TERMINADA · arquitectura/modelo Track A aprobados |
| **D-F3-001** | ✅ Fase 3 **TERMINADA** — `03-entorno-desarrollo.md` guía oficial entorno Track A (§18 Juan) |
| **D-F3-WIP** | ~~borrador / EN REVISIÓN~~ → **SUPERSEDIDO** por D-F3-001 |
| **Revisión coherencia** | ✅ `docs/roadmap/fase-3-revision-coherencia.md` → **`coherente`** (pre-cierre) |
| **Fase 3 docs** | ✅ `03` + informe supervisor · §18 **firmado** Juan 2026-07-14 |
| **DoD permanente** | ✅ `docs/quality/definition-of-done.md` |
| **P0 ops** | Documentados en `03` §15 (INC-admin-cred · R-OPS-01) — **no** rotados |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente (histórico)** | ~~Fase 4 no abierta~~ → supersedido: brief F4 listo 15 Jul · ejecución sigue **NO** |
| **Cola MVP-anclada** | T-PUB-01 · T-UX-LESSON-01 · T-MVP-PROGRESS · T-MVP-COMMUNITY · P0 admin/Prisma |

## Hito — D-F3-WIP · Fase 3 docs EN REVISIÓN (14 Jul 2026) — SUPERSEDIDO por D-F3-001

| Item | Estado |
|------|--------|
| **D-F1-001** | ✅ Fase 1 APROBADA · MVP Track A **congelado** |
| **D-F2-001** | ✅ Fase 2 TERMINADA · arquitectura/modelo Track A aprobados |
| **D-F3-WIP** | ~~Fase 3 borrador / EN REVISIÓN · NO TERMINADA~~ → supersedido por D-F3-001 |
| **Revisión coherencia** | ✅ `docs/roadmap/fase-3-revision-coherencia.md` → **`coherente`** |
| **Fase 3 docs** | ~~§18 sin firma~~ → firmado vía D-F3-001 |
| **DoD permanente** | ✅ `docs/quality/definition-of-done.md` |
| **P0 ops** | Documentados en `03` §15 (INC-admin-cred · R-OPS-01) — **no** rotados |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente (histórico)** | ~~Juan aprueba §18~~ → supersedido |
| **Cola MVP-anclada** | T-PUB-01 · T-UX-LESSON-01 · T-MVP-PROGRESS · T-MVP-COMMUNITY · P0 admin/Prisma |

## Hito — D-F3-WIP · Fase 3 ejecución docs (14 Jul 2026) — SUPERSEDIDO por revisión coherencia

| Item | Estado |
|------|--------|
| **D-F3-WIP** | ~~EN PRUEBAS~~ → supersedido: borrador / EN REVISIÓN → luego D-F3-001 |
| **Fase 3 docs** | `03` + informe · §18 firmado (D-F3-001) |
| **Código producto** | Sin cambios · sin commit/push |

## Hito — D-F2-001 + brief Fase 3 (14 Jul 2026) — SUPERSEDIDO por D-F3-WIP

| Item | Estado |
|------|--------|
| **D-F1-001** | ✅ Fase 1 APROBADA · MVP Track A **congelado** |
| **D-F2-001** | ✅ Fase 2 TERMINADA · arquitectura/modelo Track A aprobados |
| **Fase 2 docs** | ✅ `02-modelo-datos.md` · `02-arquitectura-sistema.md` · informe supervisor (firma Juan) |
| **DoD permanente** | ✅ `docs/quality/definition-of-done.md` |
| **Fase 3** | ~~Brief listo · ejecución NO INICIADA~~ → supersedido por hito D-F3-WIP |
| **Manual Operativo** | Idea en backlog (alta gobernanza) · **no** escrito completo |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente (histórico)** | ~~OK ejecutar Fase 3~~ → supersedido |
| **Cola MVP-anclada** | T-PUB-01 · T-UX-LESSON-01 · T-MVP-PROGRESS · T-MVP-COMMUNITY · P0 admin/Prisma |

## Hito — D-F1-001 + Fase 2 abierta (14 Jul 2026) — SUPERSEDIDO por D-F2-001

| Item | Estado |
|------|--------|
| **D-F1-001** | ✅ Fase 1 APROBADA · MVP Track A **congelado** |
| **MVP §12** | ✅ Firmado Juan 2026-07-14 · ref. D-F1-001 |
| **DoD permanente** | ✅ `docs/quality/definition-of-done.md` |
| **Fase 2 docs** | ✅ aprobados — ver hito D-F2-001 arriba |
| **Manual Operativo** | Idea en backlog (alta gobernanza) · **no** escrito completo |
| **Código producto** | Sin cambios · sin commit/push |
| **Siguiente (histórico)** | ~~OK Juan Fase 2~~ → supersedido |
| **Cola MVP-anclada** | T-PUB-01 · T-UX-LESSON-01 · T-MVP-PROGRESS · T-MVP-COMMUNITY · P0 admin/Prisma |

## Hito — Fase 1 DEFINIR Y PLANEAR (14 Jul 2026) — CERRADO

| Item | Estado |
|------|--------|
| **Validación arquitecto** | ✅ `docs/roadmap/fase-1-validacion-arquitecto.md` → **APROBADA** |
| **Decisiones A–D** | ✅ **D-ROAD-005** (`docs/roadmap/decisiones.md`) |
| **MVP** | ✅ `docs/product/01-mvp-gmusic.md` v1.0 — **APROBADO / congelado (D-F1-001)** |
| **Academia canónica** | `/onboarding-academia` (código confirmado) |
| **Código producto** | Sin cambios · sin commit |
| **Siguiente (histórico)** | ~~Firma §12~~ → supersedido por hito D-F1-001 arriba |
| **Cola MVP-anclada** | T-PUB-01 · T-UX-LESSON-01 · T-MVP-PROGRESS · T-MVP-COMMUNITY · P0 admin/Prisma |

## Hito — Protocolo maestro ETAPA 0 (14 Jul 2026)

| Item | Estado |
|------|--------|
| **Inventario** | ✅ `docs/project-status/00-inventario-actual.md` |
| **Roadmap control** | ✅ `docs/roadmap/*` (`etapa-actual`, backlog, decisiones…) |
| **Estructura canónica** | **D-ROAD-003** — 10 fases del diagrama (1 DEFINIR → 10 PULIR/LANZAR); protocolo 0–15 subordinado; Track A, no stack del cartel |
| **Código producto** | Sin cambios en esta pasada |
| **Siguiente (histórico)** | ~~Fase 1 NO INICIADA~~ → supersedido por hito Fase 1 arriba |
| **Cola T-* intacta** | T-PUB-01 · T-UX-LESSON-01 · ops admin/Prisma |

---

Última actualización previa: **10 Jul 2026** · HEAD `c5fe836` · admin reset + lesson session en `main`

## Hito — Transferencia metodología SUPERADA (6 Jul 2026)

| Item | Estado |
|------|--------|
| **Piloto** | T-LOGIN-REDIRECT (Medio) — `df842a5` en prod |
| **Smoke prod** | **3/3** — demo→`/mi-camino-demo` · QA suscriptor→`/mi-camino` (JP, captura) · offline→error en login |
| **Auditoría GPT** | APRUEBA |
| **Contrato ejecutor** | Trilogía desplegada; piloto sin intervención mid-flight |

## Snapshot operativo (6 Jul 2026 — cierre piloto)

| Item | Estado |
|------|--------|
| **HEAD remoto** | `df842a5` — fix(auth): redirect post-login LoginCuentaPage |
| **Tests app** | **563/563** |
| **npm run verify** | ✅ **563 + 160** · gate verde (7 Jul 2026) |
| **Backlog nuevo** | **T-UX-COPY-LOGIN** (Baja) — copy anonymous login vs registro · `assert-auth-session.ts:15` |
| **Rama** | `main` · sync `origin/main` · dirty: `.env.example`, checklist |

## Cola operativa (7 Jul 2026)

| Orden | Item | Estado | Dependencia / nota |
|-------|------|--------|-------------------|
| **1** | ~~**T-API-01**~~ — flake `phase3b2` concurrencia | ✅ **Cerrado** 7 Jul 2026 | APRUEBA GPT · FOR UPDATE + tx retry · verify verde |
| **2** | **T-PUB-01** — Piloto Publicación (admin → alumno) | **En cola** · siguiente tras T-API-01 en remoto | **Bloque 1** (D-GOV-04) · Fase 0: inventario biblioteca admin · spec pendiente |
| **3** | **T-UX-LESSON-01** — Pantalla lección video-first + práctica activa | **En progreso** · 01D+01A implementados localmente | Mini-brief 7 Jul 2026 · 01B/C/E pendientes · R1 resuelto provisionalmente |

**Regla:** T-PUB-01 valida el **pipeline** publish-to-student, no el currículo completo. Nombre anterior "Piloto B3" **retirado** — colisionaba con Bloque 3 pedagógico y labels del admin.

**T-UX-LESSON-01:** Reemplazar/evolucionar `PathLessonRunner` hacia pantalla pedagógica video-first (5 etapas D-GOV-04, tabs, checklist, CTA único, celebración D-BRAND-02). Gate G6 si checklist requiere schema nuevo. Ver mini-brief en chat / handoff sesión 7 Jul 2026.

## Cola operativa (6 Jul 2026 — noche, superseded)

## Snapshot operativo (6 Jul 2026 — noche, superseded)

## Snapshot operativo (2 Jul 2026 — tarde)

| Item | Estado |
|------|--------|
| **HEAD** | `2134e71` — fix(security): admin seed via env |
| **Admin Creador MVP (R-008)** | ✅ `bc2de81`..`fd65927` — API + UI + shell |
| **Tests app** | **554/554** |
| **INC admin credential P0** | Repo ✅ cerrado · **Prod DB 🔴 abierto** — rotar antes de publicar materia |
| **Siguiente autorizado** | Piloto Bloque 1 vía admin (tras rotación) — `docs/operations/piloto-bloque-1-admin.md` |
| **Rama** | `main` · sync `origin/main` |

## Snapshot operativo (2 Jul 2026 — mañana)

| Item | Estado |
|------|--------|
| **HEAD** | `11c7034` — test(path): alinear stage demo con D-GOV-07 |
| **Tests app** | **550/550** |
| **Rama** | `main` · sync con `origin/main` |
| **Visual D-022C** | ✅ stage demo + suscriptor (paridad microciclo) |
| **Comunidad MVP** | ✅ mergeado (`d171c20`) · C2/API pendiente |
| **Rewrites SPA prod** | ✅ `vercel.json` commiteado (`75332fd`) · smoke **2 Jul 2026** |

### Smoke deploy prod (2 Jul 2026)

| URL | Resultado | Nota |
|-----|-----------|------|
| `/mi-camino-demo` | ✅ pass | SPA carga |
| `/quiz-temperamento` | ✅ pass | SPA carga |
| `/demo-clase-1` | ✅ pass | SPA carga |
| `/inscripcion` | ✅ pass (comportamiento esperado) | Ver abajo — no es bug de routing |

**`/inscripcion` — lógica (no cruce de rutas):**

- Pathname `/inscripcion` → `currentPage: inscripcion-gate` → **`InscripcionGatePage`** (`student-zone-routing.ts`, tests en `student-zone-routing.test.ts`).
- Si configured in `App.tsx` **sin** `StudentZoneGuard` ni `DemoAuthGuard` — ruta pública del funnel.
- Si `useDemoProgress().demoFinished === false` (0–4/5 clases, típico incógnito o CTA Semestral D-025): renderiza **`LockedGate`** dentro de la misma página — copy *"Completa tu primer camino para desbloquear esta zona"*, barra *"X de 5 clases completadas"*, CTA *"Volver a mi camino gratuito"*.
- Si `demoFinished === true` (5/5): selector de planes + celebración (puerta abierta D-GOV-05).
- **D-GOV-11** aplica a quiz + demo (cuenta antes de clases); **no** redirige `/inscripcion` a registro — el gate es el punto de conversión post-demo o con puerta cerrada si demo incompleto.

Config Vercel: `vercel.json` — catch-all `/(.*) → /index.html` + proxy `/api/v1/*` → Render.

---

## D-017 — Acceso zona alumno prod (25 Jun 2026)

| Item | Estado |
|------|--------|
| Diagnóstico | Bloqueo sin `Subscription ACTIVE` = comportamiento esperado |
| E2E prod QA | ✅ cuenta `qa-alumno-prod-001@gmusic.test` + sub manual |
| Patch código | ❌ no requerido |
| Doc estados | ✅ `docs/operations/student-access-states.md` |
| Runbook ops manual | ⬜ tarea separada (registro → sub ACTIVE → validar) |
| Knip `devStudentAuth` | ⬜ fuera de alcance D-017 |

---

| Item | Estado |
|------|--------|
| Repo canónico | `gmusicproyect/proyectogmusic` |
| **HEAD** | `11c7034` — ver snapshot arriba |
| Routing demo D-GOV-02/03 | ✅ código + rewrites prod verificados 2 Jul |
| Academia 2 pasos | ✅ `f20e795` |
| Teaser B + CTA híbrido | ✅ D-GOV-05/06 |
| Gobernanza operativa | ✅ |
| **Tests app** | **550/550** |
| Untracked local | `logogmusic.png` — fase visual hero (futuro) |
| **Deploy rewrites** | ✅ en repo + prod smoke 2 Jul (ver snapshot) |

Handoff operativo: `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`

## Academia 2 pasos — publicado (`f20e795`)

| Item | Estado |
|------|--------|
| Paso 1: Elige tu instrumento | ✅ Guitarra, Teclado, Canto |
| Solo Guitarra activa (D-007) | ✅ Teclado/Canto “Próximamente” |
| Paso 2: Elige tu punto de partida | ✅ InteractiveLevelSelector |
| CTA dinámico en paso 2 | ✅ useDemoUserState |

## Landing Visual A — One Page

| Item | Estado |
|------|--------|
| Hero simplificado (logo + bienvenida, scroll Apple) | ✅ validado Juan |
| Fondos PNG por sección (inicio → contacto) | ✅ |
| BrandLogo SVG inline + Bebas (Typekit) | ✅ |
| Navbar: Alumno + Regístrate, grid 3 cols | ✅ |
| CTA demo en Academia paso 2 (no hero) | ✅ |
| Visual D Canva/Canvas | ❌ superseded |
| Pipeline futuro assets | Visual E — Illustrator → SVG |

Handoff activo: `docs/vision/handoffs/2026-06-14-hero-simplificado-handoff-opus.md`  
Visual D obsoleto: `docs/vision/handoffs/2026-06-14-hero-d2-ux-handoff.md` (SUPERSEDED)

**Desbloqueo Fase 4 Auth:** `whatsapp_cta_clicked` con `intent: "inscripcion"` ≥ 1, confirmado manualmente por Juan (contacto real WhatsApp).

**North Star checkout (Fase 4+, no implementar aún):** Mercado Pago · form Chile/Extranjero · RUT genérico extranjero vía servicio interno · ver `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md` y **D-027**.

**Juan Track A (Jun 2026):** visual ✅ · Academia 2 pasos ✅ · routing demo URL ✅ (`e047ac3`) · PostHog key + funnel ✅ · push origin ✅ · conversión WhatsApp real ⬜

---

## Routing demo — publicado (`e047ac3`)

| Ruta | `currentPage` | Estado |
|------|---------------|--------|
| `/mi-camino-demo` | `mi-camino-demo` | ✅ sync URL |
| `/demo-clase-1` … `/demo-clase-5` | `demo-clase-*` | ✅ sync URL |
| `/inscripcion` | `inscripcion-gate` | ✅ sync URL |
| — | `inscripcion-registro` | ✅ sin URL pública (mantiene `/inscripcion`) |
| `/alumno` | `mi-estudio` / `welcome` | ✅ sin cambio |
| `/mi-camino` | `mi-camino` | ✅ sin cambio |

Implementación: `student-zone-routing.ts` + `handlePageChange`. Tests: `student-zone-routing.test.ts` (**550/550** app).

**Deploy:** rewrites en `vercel.json` — verificado prod 2 Jul 2026 (snapshot arriba).

---

## Fases

| Fase | Descripción | Estado | Commit | Tests |
|------|-------------|--------|--------|-------|
| Fase 1 | Landing limpia + CTA dinámico en AcademiaSection | ✅ Completo | `5ad9517` | `fundamento-funnel.test.ts` |
| Fase 2 | Demo 5 clases (PathDemoPage + DemoLessonPage) | ✅ Completo | `2e41d9f` | `path-demo-page.test.ts`, `fundamento-funnel.test.ts` |
| Fase 3 | InscripcionGatePage gamificada + selector de planes | ✅ Completo | `2e41d9f` | `inscripcion-gate.test.ts` |
| Pre-Fase 4 | Bridge WhatsApp + videos YouTube en demo | ✅ Completo | `8ca6228` | `inscripcion-gate.test.ts` |
| Fase Precios | Modelo 3 tiers × 3 períodos + CLP en gate/registro | ✅ Completo | `cf3343c` | `inscripcion-gate.test.ts` (358 tests totales app) |
| R3 / zona alumno | Acceso, funnel Semestral dev, cofre Fase 6, R3.3E redirect | ✅ Completo (remoto) | `30e310b`…`6088dc5` | `public-session-flow.test.ts`, `map-dashboard.test.ts`, etc. |
| Fase A | Reordenamiento pedagógico demo (arc Conoce→Afina→Cuerdas→Pulso→Canción) | ✅ Completo | `90883a1` | `path-demo-page.test.ts` (358/358) |
| Fase B código | ExPulsoAire — ejercicio TAP manual Clases 4 y 5 · validado en browser | ✅ Completo | `846c8f5` | 358/358 |
| Fase Visual A | DemoPathCards — tarjetas verticales reemplazando mapa serpentino | ✅ Completo | `263d5f6` | 358/358 |
| Fase Visual B | Carrusel Yousician + DemoAcademyNav (4 tabs sticky) | ✅ Completo · validado en browser | `263d5f6` | 358/358 |
| Fase 3.5a | Registro: dos CTAs (inscripción + dudas), form boleta/factura, eliminar "reservar" copy | ✅ Completo | `35e139b` | `inscripcion-gate.test.ts` (358/358) |
| Fase 3.5b | CTA "Semestral" landing → `inscripcion-gate` directo (Opción B, D-025); cerrar leak checkout legacy | ✅ Completo | `5133075` | `semestral-checkout-flow.test.ts` (359/359) |
| PostHog | 8 eventos de funnel; host US por defecto, configurable vía `VITE_POSTHOG_HOST` (D-026) | ✅ Completo — pendiente commit | — | `analytics.test.ts` (365/365) |
| Visual C | Eliminar `GmusicInternalHeader` (doble nav) en `mi-camino-demo`; `DemoFinishedCelebration` centrada | ✅ Completo — pendiente commit | — | `path-demo-page.test.ts` (365/365) |
| Fase 4 | Auth real (JWT/bcrypt/Prisma) | ⏸ Pausada — condicionada a conversión WhatsApp | — | — |
| Fase 5 | Flow + Resend + Webhooks | ⏸ Pausada — condicionada a Fase 4 | — | — |

---

## Inventario de páginas activas

Páginas montadas en `App.tsx` que **no** están detrás de `DEV_LEGACY`:

| Archivo | Ruta (`currentPage`) | Estado | Notas |
|---------|----------------------|--------|-------|
| `GmusicLanding.tsx` | `home` | ✅ Completo | Compone Hero, Academia, Planes, etc.; recibe `session` para CTA |
| `PathDemoPage.tsx` | `mi-camino-demo` | ✅ Completo | 5 nodos desde `DEMO_LESSONS`; progreso vía `useDemoProgress` |
| `DemoLessonPage.tsx` | `demo-clase-1` … `demo-clase-5` | ✅ Completo | Fases video → ejercicio → éxito; YouTube embed si `videoUrl` presente |
| `InscripcionGatePage.tsx` | `inscripcion-gate` | ✅ Completo | Selector período (default `semester`) + 3 tiers (`basico`/`plus`/`familiar`); Plus recomendado (`cf3343c`) |
| `InscripcionRegistroPage.tsx` | `inscripcion-registro` | ✅ Completo | Bridge WhatsApp; planId `{tier}-{period}`; fallback `plus-semester`; `WHATSAPP_NUMBER = "56953429676"` |
| `GmusicWelcome.tsx` | `mi-estudio`, `welcome` | ✅ Completo | Tras `StudentZoneGuard`; API dashboard real/mock |
| `GmusicPath.tsx` | `mi-camino` | ✅ Completo | Tras `StudentZoneGuard`; API path + lesson sessions |
| `FreeFundamentoLessonPage.tsx` | `fundamento-free-lesson` | 🗂️ Legacy activo | Ruta paralela; Hero/Planes aún apuntan aquí |
| `ProbarPage.tsx` | `probar` | 🗂️ Legacy activo | Página de prueba histórica |
| `CheckoutPage.tsx` | `checkout` | 🗂️ Legacy activo | Funnel Semestral directo (AuthModal → checkout) |
| `CourseDetailPage.tsx` | `course-detail` | 🗂️ Legacy activo | Catálogo legacy |
| `AlbumCoursesPages.tsx` | `album`, `courses` | 🗂️ Legacy activo | Catálogo legacy |
| `InstrumentCoursesPage.tsx` | `instrument-selector`, `instrument-courses` | 🗂️ Legacy activo | Selector instrumento legacy |
| `CommunityPage.tsx` | `community` | 🔴 Placeholder | Montada; alcance producto no verificado |

**Solo en `import.meta.env.DEV` (`DEV_LEGACY`):**

| Archivo | Ruta | Estado |
|---------|------|--------|
| `DashboardPage.tsx` | `dashboard` | 🗂️ Dev legacy |
| `LessonPage.tsx` | `lesson` | 🗂️ Dev legacy (`ExerciseEngine`) |
| `CurriculumPage.tsx` | `curriculum` | 🗂️ Dev legacy |

**Existe pero no montada en `App.tsx`:**

| Archivo | Notas |
|---------|-------|
| `FundamentoPreviewPage.tsx` | Conservada; tests confirman que no se monta en App |

---

## Inventario de ejercicios del demo (estado post-Fase B)

Arc pedagógico activo: **Conoce → Afina → Cuerdas → Pulso → Canción**

| Clase | Título | Ejercicio | Componente | Estado |
|-------|--------|-----------|------------|--------|
| 1 | Conoce tu guitarra | MCQ — ¿dónde van las clavijas? (correctId: `headstock`) | `MultipleChoiceExercise` | ✅ |
| 2 | Afina tu guitarra | MCQ — ¿qué nota es la cuerda 6? (correctId: `e_mi`) | `MultipleChoiceExercise` | ✅ |
| 3 | Cuerdas al aire | Nombrar las 6 cuerdas | `Ex1Cuerdas` | ✅ |
| 4 | Pulso con cuerdas al aire | TAP manual — 8 beats (ver nota pedagógica) | `ExPulsoAire` | ⚠️ impl. pendiente commit |
| 5 | Tu primera canción | TAP manual — 10 beats (ver nota pedagógica) | `ExPulsoAire` | ⚠️ impl. pendiente commit |

**Nota pedagógica — diferencia Fable spec vs. implementación Cursor (Fase B):**

| | Fable especificó | Cursor implementó |
|-|-----------------|-------------------|
| Clase 4 | 8 beats alternando cuerdas 6/5/4 (`6 6 / 5 5 / 4 4 / 6 6`) | 8 beats en cuerda 6 al aire solamente |
| Clase 5 | 15 beats con 3 silencios automáticos (`6 6 — 6 / 5 5 — 5 / 4 4 5 6 / 6 — 6`) | 10 beats sin silencios (`6 6 6 / 5 5 5 / 4 4 5 6`) |

Pendiente: validación visual de Juan + decisión de Fable (aceptar v1 o patch pedagógico).
No bloqueante para el commit de Fase B — es una decisión de contenido, no un bug técnico.

**Componentes de ejercicio en zona alumno (ExerciseEngine / LessonPage — DEV_LEGACY):**

`Ex2NotasAm`, `Ex3NotasEm`, `Ex4CalidadAcorde`, `Ex5Secuencia` — solo en zona alumno, nunca en demo.

---

## Archivos sin commit

Working tree con cambios sin commit (PostHog + Visual C):

**Commit 1 — PostHog analytics:**
| Archivo | Cambio |
|---------|--------|
| `src/app/utils/analytics.ts` | 8 eventos con guard `VITE_POSTHOG_KEY` |
| `src/app/utils/analytics.test.ts` | Tests analytics |
| `src/main.tsx` | Init PostHog (US host default, configurable) |
| `src/vite-env.d.ts` | Tipo `VITE_POSTHOG_HOST` |
| `.env.example` | Placeholder `VITE_POSTHOG_KEY` + `VITE_POSTHOG_HOST` |
| `src/app/App.tsx` | `analytics.semestralCtaClicked()` en `handleSemestralPlanSelect` |
| `src/app/components/music/InteractiveLevelSelector.tsx` | `analytics.demoCtaClicked()` |
| `src/app/pages/DemoLessonPage.tsx` | `analytics.demoLessonCompleted()` + `demoCompleted()` |
| `src/app/pages/InscripcionGatePage.tsx` | `analytics.gateViewed()` + `planSelected()` |
| `src/app/pages/InscripcionRegistroPage.tsx` | `analytics.registroViewed()` + `whatsappCtaClicked()` |
| `package.json` | `posthog-js` instalado |

**Commit 2 — Visual C:**
| Archivo | Cambio |
|---------|--------|
| `src/app/pages/PathDemoPage.tsx` | Elimina `GmusicInternalHeader`; `DemoFinishedCelebration` centrada con animación |
| `src/app/pages/path-demo-page.test.ts` | Tests Visual C |

**Pendiente de resolución (no bloquea demo):**

| Archivo | Problema |
|---------|---------|
| `src/app/data/demo-lessons.ts` (Clase 3) | `videoUrl` duplicado con Clase 2 — `TODO` en código; requiere URL real de video de cuerdas al aire |

---

## Modelo de precios activo

(`subscription-plans.ts`, commit `cf3343c`):

- Tiers: `basico`, `plus` (recomendado), `familiar` (3 perfiles)
- Períodos: `monthly`, `semester` (default UI), `annual`
- 9 `planId`: p. ej. `plus-semester`
- `PRICE_TABLE` CLP completo; ahorro en selector: Semestral 17%, Anual 25% (referencia Plus)

**WHATSAPP_NUMBER:** `56953429676` (formato wa.me correcto, commit `8ca6228`).

---

## Estado del demo — listo para revisión PO

El funnel completo está publicado y validado en browser:

```
Landing → Ver clase gratuita → mi-camino-demo (carrusel Yousician, 4 tabs nav)
  → demo-clase-1..5 (video → ejercicio → éxito)
    → inscripcion-gate (planes 3×3 CLP)
      → inscripcion-registro (WhatsApp bridge)
```

**Caveat explícito:** Clase 3 usa video placeholder (mismo embed que Clase 2). Requiere URL real antes de escalar el funnel a tráfico real.

## Próximo paso operativo

**Condición de desbloqueo para Fase 4:** primera conversión real confirmada vía WhatsApp (`56953429676`).

**Condición de desbloqueo para Fase 4:** primera conversión real confirmada vía WhatsApp (`56953429676`).

Hasta que haya conversión, opciones disponibles:
- Patch pedagógico ExPulsoAire — decidir v1 vs cuerdas alternadas/silencios (validación visual Juan pendiente)
- Fix cosmético Clase 3 video (requiere URL real de Juan)
- PostHog analytics — 8 eventos de funnel (aprobado en principio)

---

## Pendientes documentados (no bloqueantes hoy)

- [ ] Clase 3 video: reemplazar embed duplicado (mismo que Clase 2) por video de cuerdas al aire
- [ ] Patch pedagógico Fase B: cuerdas alternadas en Clase 4, silencios automáticos en Clase 5 (post-validación)
- [ ] PostHog analytics — ~8 eventos de funnel — aprobado en principio, sin prioridad activa
- [ ] Limpieza rutas legacy — post-Fase 4, con plan de migración explícito
- [ ] Fase 4 Auth real — NO iniciar hasta primera conversión WhatsApp confirmada
- [ ] Fase 5 Flow + Resend — NO iniciar hasta Fase 4 completa
