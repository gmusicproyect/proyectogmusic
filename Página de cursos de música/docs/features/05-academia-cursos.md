# 05 — Academia / Cursos (Track A)

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-15 |
| **Autor** | Cursor (ejecutor) · supervisión Juan |
| **Versión** | 1.0 |
| **Estado** | **APROBADO / TERMINADA** — **D-F5-001** (2026-07-15) · canónico Academia/Cursos Track A |
| **SHA ref. auditoría** | `e5b161c` · rama `main` |
| **Prerreqs** | **D-F1-001** · **D-F2-001** · **D-F3-001** · **D-F4-001** · DoD `docs/quality/definition-of-done.md` |
| **Política producto** | **D-ROAD-005** · **D-007** Guitarra only · **R-008** Admin Creador · **D-017** ACTIVE |
| **Instrucción** | `docs/roadmap/fase-5-instruccion.md` |
| **Ticket núcleo** | **T-PUB-01** — **DONE LOCAL** (**D-TPUB-01**, 2026-07-15) · evidencia `docs/roadmap/t-pub-01-evidencia-local.md` · **no** prod/launch |
| **Decisión** | **D-F5-001** · **D-F5-WIP** supersedido |

---

## 1. Propósito y alcance

Documento **canónico** de Academia / Cursos Track A (Vite + React + Express + Prisma). Describe onboarding, modelo de contenido, Admin publish y visibilidad del alumno — **sin** inventar LMS greenfield.

| Cubre | No cubre (prohibido / fuera) |
|-------|------------------------------|
| Onboarding `/onboarding-academia` (instrumento → nivel) | **Fase 6** — Mi Camino UX completa (mapa profundo, VFX, serpiente) |
| Modelo `Course` → `Module` → `PathNode` → `MicroExercise` | **Fase 7** Mi Progreso (`T-MVP-PROGRESS`) |
| Admin R-008 create/slot/publish | **Fase 8** Comunidad launch · **Fase 9** pasarelas |
| Visibilidad alumno `GET /me/path` + filtros PUBLISHED | Track B · Next.js · Sanity · CourseLit producto |
| Contrato MVP **N=1** bloque usable + **T-PUB-01** | Currículo 6–75 completo · multi-instrumento activo |
| Matriz existe/parcial/gap · cómo probar futuro | Schema migrations · seeds prod · publish prod en esta pasada |
| Relación explícita con F6 / `T-UX-LESSON-01` | Mitigar R-001/R-002 · reabrir D-007 |

**Regla de oro:** el **modelo y Admin R-008 ya existen**. Fase 5 **no inventa academia desde cero**. Documenta la verdad del repo, declara el gap **dato/pipeline** de **T-PUB-01**, y **no** reabre el MVP congelado (**D-F1-001**).

**Alcance de esta ejecución (2026-07-15):** **solo documental**. Sin código producto · sin migraciones · sin Prisma changes · sin prod DB · sin publish prod · sin resolver T-PUB-01 en código · sin LessonRunner/`T-UX-LESSON` · sin Fase 6 · sin commit/push.

---

## 2. Política MVP Academia/Cursos

Fuente: `docs/product/01-mvp-gmusic.md` §6–§7.5 + **D-ROAD-005 D** + brief F5.

| Capacidad | Clasificación | Estado repo | Nota |
|-----------|---------------|-------------|------|
| Onboarding `/onboarding-academia` | **MUST** | existe (completa) | Solo Guitarra (**D-007**) |
| Landing CTA `#academia` | **MUST** marketing | existe | **No** es el wizard |
| Instrumento Teclado/Canto activo | **WON'T** MVP | UI “próximamente” | No reabrir D-007 |
| Modelo Course/Module/PathNode | **MUST** dominio | existe | Fase 2 canónico |
| Admin crear bloque + 5 etapas | **MUST** soporte | existe | R-008 |
| Admin publicar bloque (validación) | **MUST** | existe | `validateModuleForPublish` |
| Course default PUBLISHED en entorno launch | **MUST** dato | parcial (seed local ≠ prod) | Gap T-PUB-01 ops |
| ≥1 Module PUBLISHED usable en `/mi-camino` | **MUST** | parcial / entorno-dependiente | **T-PUB-01** |
| Create/publish Course vía Admin UI | **BRIDGE** | inexistente | Seed/ops |
| Media video/PDF por etapa | **SHOULD** contenido | opcional en validator | Juan umbral |
| MicroExercise en nodo publish | Frontera | seed/ops parcial | **T-UX-LESSON-01** |
| Currículo 6–75 / multi-instrumento DB | **WON'T** / post-MVP | incompleto | |
| CourseLit / Track B Sanity | **WON'T** | análisis only | |

### Contrato MVP — N=1

> **Launch / T-PUB-01 DONE** (criterio documental) cuando, en el **entorno acordado** por Juan:  
> 1. Course default `ruta-guitarra-12-meses` está **PUBLISHED**;  
> 2. existe **≥1 Module** con exactamente **5 PathNode** **PUBLISHED** que pasan `validateModuleForPublish`;  
> 3. un alumno con **Subscription ACTIVE** ve ese bloque en `/mi-camino` (no empty state);  
> 4. evidencia capturada (pasos + IDs o screenshots).

**Estado al cierre documental F5:** criterio **documentado**; piloto aún no ejecutado en esa pasada.  
**Estado posterior (2026-07-15):** piloto LOCAL ejecutado → **T-PUB-01 DONE LOCAL** (**D-TPUB-01**) · evidencia `docs/roadmap/t-pub-01-evidencia-local.md` · **no** prod / **no** launch staging · F6 **NO**.

**Umbral “usable” (firmado §13 / D-F5-001):** default técnico = validator actual (título + `completionCriteria` + 5 `StageType`). Media/video y MicroExercise = **SHOULD** / frontera consumo — elevar a MUST solo si Juan lo autoriza en mandato aparte (p. ej. al ejecutar piloto T-PUB-01).

---

## 3. Onboarding Academia

### URL canónica

| Pieza | Valor |
|-------|-------|
| `currentPage` | `onboarding-academia` |
| Pathname | `/onboarding-academia` |
| Página | `OnboardingAcademiaPage` → `AcademiaOnboardingWizard` |
| Routing | `student-zone-routing.ts` + `App.tsx` |
| Guard | `DemoAuthGuard` (cuenta requerida — D-GOV-11 / flow demo) |

### Dos pasos

| Paso | UI | Regla |
|------|-----|-------|
| **1** | “Elige tu instrumento” — `AcademiaInstrumentSelector` + `academia-instruments.ts` | Solo **Guitarra** `available: true`; Teclado/Canto `false` (**D-007**) |
| **2** | “Elige tu punto de partida” — `InteractiveLevelSelector` (Fundamento / Técnica / Crea × niveles) | CTA dinámico; “← Cambiar instrumento” |

### Destino post-nivel

```text
/onboarding-academia
        │
        ├─ (opcional) onboarding-quiz  si temperamento pendiente
        └─ mi-camino-demo               destino principal del funnel
```

**No** navega automáticamente a `/mi-camino` suscriptor. Entrada alumno ACTIVE: login post-auth → `/mi-camino` o nav Mi Estudio / Mi Camino (`StudentZoneGuard` + D-017).

### Landing `#academia` vs wizard

| Superficie | Rol |
|------------|-----|
| Landing `#academia` (`AcademiaPublicSection`) | CTA marketing → onboarding / demo según sesión |
| `/onboarding-academia` | Wizard canónico 2 pasos |

**Docs desfasados:** `AGENTS.md` / copy histórico que describe wizard in-place en `#academia` / `AcademiaSection.tsx` — ese archivo **no** es la canónica actual. Ver §9.

---

## 4. Modelo de contenido

Evidencia: `prisma/schema.prisma` · `docs/architecture/02-modelo-datos.md`.

```text
Course (1) ──< Module (N) ──< PathNode (N) ──< MicroExercise (N)
                      │              │
                   bloque         etapa (×5 por bloque usable)
```

### Enums

| Enum | Valores |
|------|---------|
| `PublishStatus` | `DRAFT` · `PUBLISHED` · `ARCHIVED` |
| `StageType` | `FUNDAMENTO_UNO` · `FUNDAMENTO_DOS` · `TECNICA` · `PRACTICA` · `TOCAR` |
| `ExerciseType` | `IDENTIFY_NOTE` · `RHYTHM_TAP` · `EAR_TRAINING` · `CHORD_SHAPE` |

### Tablas

| Modelo | Rol producto | Campos clave |
|--------|--------------|--------------|
| **Course** | Curso / ruta | `slug` único · `status` (default DRAFT) · `version` |
| **Module** | Bloque editorial | `courseId` · `order` · `status` · `@@unique(courseId, order)` |
| **PathNode** | Etapa / “lección” canónica schema | `moduleId` · `order` · `stageType?` · media (`videoUrl`, `guidePdfUrl`, `guideText`) · `completionCriteria` · `status` |
| **MicroExercise** | Práctica interactiva del nodo | `type` · `contentPayload` · **`secureAnswer` (nunca al cliente)** · `@@unique(nodeId, order)` |

### Curso default

| Config | Valor |
|--------|-------|
| `server/config.ts` → `defaultCourseSlug` | `ruta-guitarra-12-meses` |
| Uso | Admin list/create · `GET /me/path` · lesson sessions |

**Seed local** (`prisma/seed.ts`): puede dejar Course+Module+nodes PUBLISHED en **dev** — **≠** piloto launch / **≠** cierre T-PUB-01 en prod.

### Regla editorial publish (R-008 / D-GOV-04)

Un bloque publicable = **exactamente 5** PathNode con los **5** `StageType` (orden fijo en `STAGE_TYPES_BY_ORDER`) y cada uno con **título + completionCriteria** (`validateModuleForPublish` en `server/services/curriculum.ts`). **Media y MicroExercise no** son requeridos por el validator actual.

---

## 5. Admin Creador (R-008)

| Pieza | Path / endpoint | Estado |
|-------|-----------------|--------|
| UI | `/admin` · `AdminPage.tsx` | existe |
| Cliente FE | `src/app/services/gmusic-api/admin.ts` | existe |
| API | `server/routes/admin.ts` + `curriculum.ts` | existe |
| Guard | `requireAdmin` | existe |
| Tests | `server/tests/admin-routes.test.ts` · `curriculum.test.ts` | existen |

### Flujos API

| Método | Ruta | Acción |
|--------|------|--------|
| `GET` | `/api/v1/admin/modules` | Lista bloques del curso (default slug) |
| `POST` | `/api/v1/admin/modules` | Crea bloque DRAFT + 5 slots stageType |
| `GET` | `/api/v1/admin/modules/:moduleId` | Detalle + slots + validación |
| `PUT` | `/api/v1/admin/modules/:moduleId/slots/:slotOrder` | Edita título/criterio/media slot |
| `POST` | `/api/v1/admin/modules/:moduleId/publish` | `publishAdminModule` → Module + nodes **PUBLISHED** |
| `DELETE` | `/api/v1/admin/modules/:moduleId` | Solo borradores (rechaza publicados) |

### Límites documentados

| Capacidad | Estado |
|-----------|--------|
| Create Course desde Admin | **inexistente** → **BRIDGE** seed/ops |
| Publish Course desde Admin | **inexistente** → Course debe estar PUBLISHED por seed/ops |
| Unpublish / ARCHIVE UX completa | **parcial** (enum existe; flujo ops limitado) |
| Credencial admin prod | **P0 ops** — INC-admin-cred (mandato ops propio; no “hecho por F5”) |

---

## 6. Visibilidad alumno

| Pieza | Evidencia | Estado |
|-------|-----------|--------|
| Ruta UI | `/mi-camino` · `GmusicPath.tsx` tras `StudentZoneGuard` | existe |
| Acceso | Subscription **ACTIVE** (**D-017** / `04-auth`) | completa |
| API | `GET /api/v1/me/path` (`me.ts` → `buildPathResponse`) | existe |
| Fuente path | `loadPublishedCoursePath` (`coursePath.ts`) | existe |
| Cliente FE | `gmusic-api/path.ts` · `path-load.ts` | existe |
| Empty state | Copy: *“Tu camino todavía no tiene módulos publicados…”* | existe |

### Filtros PUBLISHED (contrato)

```text
Course.status === PUBLISHED          (si no → 404 COURSE_NOT_FOUND)
  Module.status === PUBLISHED       (where)
    PathNode.status === PUBLISHED   (where)
```

DRAFT/ARCHIVED **no** aparecen al alumno.

### Frontera lesson sessions (consumo)

| Endpoint | Rol |
|----------|-----|
| `POST /api/v1/lesson-sessions` | Abrir / reusar sesión sobre nodo publicado |
| `POST /api/v1/lesson-sessions/:id/complete` | Completar + persistir progreso |

Pulido UX LessonRunner / video-first = **`T-UX-LESSON-01`** — **OUT de alcance código de esta pasada F5**; etapa 5/6 adyacente. Ver §10 y §12 (relación F6).

### Demo ≠ catálogo suscriptor

| Superficie | Fuente | ≠ Launch |
|------------|--------|----------|
| `/mi-camino-demo` + `demo-clase-*` | Catálogo TS / localStorage demo | Teaser funnel |
| `/mi-camino` | Postgres PUBLISHED + progreso real | Contrato MVP |

**Mocks FE** (`mock-path`, etc.) = desarrollo; DoD: **no** mock oculto como fuente de verdad de launch.

---

## 7. T-PUB-01 — piloto publicación

| Campo | Valor |
|-------|-------|
| **ID** | **T-PUB-01** |
| **Prioridad** | **MUST** pre-launch (histórico F5) |
| **Estado** | **DONE LOCAL** · **D-TPUB-01** (2026-07-15) |
| **Evidencia** | `docs/roadmap/t-pub-01-evidencia-local.md` |
| **Alcance cierre** | LOCAL controlado · **no** prod · **no** launch staging · F6 **NO** |
| **Nota histórica F5** | En la pasada documental F5 el ticket seguía abierto (piloto no ejecutado); cierre formal = pasada ops posterior |

### Criterio DONE (N=1)

Repite §2: Course default PUBLISHED + ≥1 Module con 5 PathNode PUBLISHED válidos + alumno ACTIVE ve bloque en `/mi-camino` + evidencia.

### Qué falta (gap residual)

| Gap | Tipo | Acción futura |
|-----|------|---------------|
| Course PUBLISHED en entorno launch | Dato / ops | Verificar o seed documentado (**BRIDGE** sin UI Course) |
| ≥1 bloque completo PUBLISHED usable | Dato + piloto | Ejecutar admin→alumno en entorno Juan autorice |
| Umbral “usable” firmado | Producto | ✅ §13 / D-F5-001 = validator; media/micro SHOULD |
| Evidencia ticket | Ops | Screenshots / IDs en cierre |
| Consumo lección frágil | `T-UX-LESSON-01` | No asumir dentro de T-PUB-01 |

**Prohibido en F5 docs:** pretendizar T-PUB-01 cerrado; seeds/migrate/publish prod a ciegas.

---

## 8. Matriz audit (existe / parcial / gap)

Revalidado HEAD `e5b161c` (2026-07-15).

| Capacidad | Estado | ¿Bloquea MVP? | Política |
|-----------|--------|---------------|----------|
| Onboarding `/onboarding-academia` | **existe** | No (si happy path opera) | MUST |
| Guitarra only D-007 | **existe** | No | MUST |
| Teclado/Canto | “próximamente” | No | WON'T |
| Landing `#academia` CTA | **existe** | No | MUST marketing |
| Schema Course/Module/PathNode/MicroExercise | **existe** | No | MUST |
| Admin create + 5 slots + publish | **existe** | Si roto → Sí | MUST |
| Course PUBLISHED launch env | **parcial** | **Sí** si ausente/DRAFT | MUST / T-PUB-01 |
| ≥1 Module PUBLISHED visible alumno | **parcial** | **Sí** | **T-PUB-01 MUST** |
| Media por etapa | opcional validator | No (default usable) | SHOULD |
| MicroExercise en publish | parcial | No para “visible”; Sí si umbral = práctica | frontera UX |
| API create/publish Course | **inexistente** | No si seed/ops | BRIDGE |
| Empty state path | **existe** | — | MUST UX |
| Lesson sessions API | **existe** | Si no completa+guarda → Sí | T-UX-LESSON |
| LessonRunner UX pulido | **parcial** | Depende umbral | F6 / T-UX |
| AGENTS wizard `#academia` | docs desfasados | Claridad | higiene |
| CourseLit / Track B | OUT | N/A | WON'T |

---

## 9. Docs desfasados y reconciliación

| Doc / claim | Realidad código | Acción |
|-------------|-----------------|--------|
| `AGENTS.md` — wizard en `#academia` / `AcademiaSection.tsx` | Wizard en `/onboarding-academia` · landing = CTA | Listar aquí; rewrite mínimo solo con OK Juan (`T-PUB-DOCS-ALIGN` tentativo) |
| CLAUDE / skills “Fase 5 = Flow + Resend” (histórico product table) | F5 roadmap = **Academia/Cursos**; pagos = F9 | No reescritura masiva en esta pasada |
| Seed local = “contenido listo prod” | Seed ≠ launch | Declarado §4 / §7 |
| Conflicto: gana **código + tests + MVP** | — | Esta regla |

---

## 10. Tickets derivados

| ID | Rol | Prioridad | Estado / nota |
|----|-----|-----------|---------------|
| **T-PUB-01** | Núcleo F5 — admin→alumno N=1 | **MUST** | **DONE LOCAL** (**D-TPUB-01**) · evidencia local · no prod |
| `T-UX-LESSON-01` | Consumo lección completa+persiste | MUST **si** bloquea consumo | Adyacente · **OUT código F5** · puede vivir en F5/F6 según Juan |
| `T-PUB-COURSE-OPS` (tentativo) | Documentar/automatizar Course PUBLISHED seed/ops | Solo si falta | BRIDGE elevado |
| `T-PUB-DOCS-ALIGN` (tentativo) | Higiene AGENTS Academia | Docs | Lista §9 basta hasta OK |
| INC-admin-cred / R-OPS-01 | Credencial / Prisma prod | P0 ops | Mandato ops **separado** |

---

## 11. Cómo probar (futuro — no ejecutado aquí)

### Smoke publish → alumno (entorno autorizado)

1. **Precondición:** Course `ruta-guitarra-12-meses` **PUBLISHED** (seed/ops).  
2. **Admin:** login ADMIN → `/admin` → crear bloque → completar 5 slots (título + criterio) → **Publicar**.  
3. **Alumno:** cuenta con Subscription **ACTIVE** → `/mi-camino` → ve el bloque (no empty state).  
4. **Abrir lección:** iniciar sesión vía lesson-sessions (happy path mínimo); pulido UI = `T-UX-LESSON-01`.  
5. **Evidencia:** IDs module/nodes + screenshot empty→lleno.

### Verify

- Si hubo **código**: `npm run verify` verde · sin warnings nuevos (DoD).  
- Esta pasada F5 = **docs-only** → verify completo **N/A** para cierre documental.

### Mocks ≠ launch

| OK en dev | No OK como evidencia T-PUB-01 |
|-----------|-------------------------------|
| `mock-path` / fixtures tests | Path vacío en staging/prod con “mock en verde” |
| Seed local Docker | Asumir prod idéntico sin verificar |

---

## 12. Fuera de alcance / riesgos · relación Fase 6

### Relación Fase 6 (explícita)

| Fase | Scope | Relación con F5 |
|------|-------|-----------------|
| **Fase 5** | Academia/onboarding + modelo + Admin publish + **visibilidad** catálogo PUBLISHED + T-PUB-01 | **Esta** |
| **Fase 6 — Mi Camino** | UX completa del mapa suscriptor (serpiente, VFX, refinamiento pedagógico path) | **OUT de F5** — consume path **ya publicado**; no se abre sin OK Juan |
| `T-UX-LESSON-01` | Pantalla lección video-first / consumo | Frontera 5/6 — **no** implementado en esta pasada |

**Frase canónica:** *Mi Camino UX completo = Fase 6. Fase 5 asegura que exista materia PUBLISHED visible; no rediseña el mapa.*

### Riesgos / OUT

| Ítem | Tratamiento |
|------|-------------|
| INC-admin-cred | P0 ops — no “resolver F5” |
| R-OPS-01 | Ops Prisma prod |
| Prod DB / publish prod | Prohibido sin OK ops explícito |
| F7 / F8 / F9 | Fuera |
| Track B / CourseLit | WON'T |
| Reabrir D-007 / descongelar MVP | Prohibido |
| Commit / push autónomo | Regla Director |

---

## 13. Aprobación (cierre Fase 5 → D-F5-001)

Fase 5 **TERMINADA** (fase **documental**). `docs/features/05-academia-cursos.md` es el documento **canónico Academia/Cursos Track A**. **D-F5-001**.

| Campo | Valor |
|-------|-------|
| Lectura `05` completa | ✅ |
| Matriz Academia/publish coherente con código | ✅ |
| T-PUB-01: criterio N=1 claro · histórico MUST abierto en firma F5 | ✅ (piloto **no** en fase docs; **DONE LOCAL** posterior · **D-TPUB-01**) |
| Umbral “usable” confirmado | ✅ default = validator (título + `completionCriteria` + 5 `StageType`); media/microejercicios **SHOULD** |
| F6 / LessonRunner / Track B **no** mezclados | ✅ |
| Aprobado como canónico Academia/Cursos Track A | ✅ → **D-F5-001** |

```text
OK Juan §13.
Apruebo docs/features/05-academia-cursos.md como documento canónico Academia/Cursos Track A.
Declaro Fase 5 TERMINADA (D-F5-001) como fase documental.
T-PUB-01 sigue abierto como MUST para piloto real.
Fase 6 NO queda autorizada.
Sin código, sin publish prod, sin commit/push.
Fecha: 2026-07-15
Firma / mensaje: OK Juan §13 (autorización Director)
Decisión: D-F5-001

Umbral usable (firmado): validator actual (título + completionCriteria + 5 StageType).
Media/microejercicios: SHOULD salvo Juan eleve a MUST en mandato aparte.
```

**Nota posterior (no altera la firma §13):** 2026-07-15 · **D-TPUB-01** · T-PUB-01 **DONE LOCAL** · evidencia `docs/roadmap/t-pub-01-evidencia-local.md` · no prod · F6 sigue **NO**.

Control roadmap: Fase 5 **TERMINADA** (documental) · Fase 6 **NO INICIADA** / no autorizada · **T-PUB-01** → **DONE LOCAL** (**D-TPUB-01**, 2026-07-15) · evidencia `t-pub-01-evidencia-local.md` · no prod/launch.


---

*Fin `05-academia-cursos.md` · v1.0 · APROBADO (**D-F5-001**) · 2026-07-15 · sin código producto · sin commit/push · F6 NO · T-PUB-01 **DONE LOCAL** (**D-TPUB-01**).*
