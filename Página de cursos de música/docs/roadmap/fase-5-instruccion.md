# Instrucción Fase 5 — Academia / Cursos

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de producto/docs — **no** es el documento `05` final ni autorización de código, migraciones, datos prod o publicación de contenido.  
> **Duración poster Fase 5:** ~2–3 semanas (docs de feature + cierre T-PUB-01 acotado tras OK ejecución).  
> **Estado de esta instrucción:** lista · **Fase 5 TERMINADA** (**D-F5-001**, 2026-07-15) — fase **documental** · `docs/features/05-academia-cursos.md` = canónico Academia/Cursos Track A · §13 firmado · **D-F5-WIP** supersedido.  
> **Gate inicio ejecución:** cumplido (OK Juan docs-only). **Gate cierre:** cumplido (OK Juan §13 · **D-F5-001**). Fase 6 **no** autorizada. **T-PUB-01** MUST abierto.  
> **SHA referencia auditoría:** `e5b161c` · rama `main`.

---

## Propósito de esta instrucción

Esta instrucción es el **contrato de trabajo** para, cuando Juan autorice ejecución, producir el documento de feature:

`docs/features/05-academia-cursos.md`

y cerrar (o ticketeear con aceptación verificable) el piloto de publicación:

**T-PUB-01** — admin crea/completa/publica → alumno suscriptor ve bloque usable en Mi Camino.

| Es | No es |
|----|--------|
| Guía profunda para auditar Academia + pipeline Course/Module/PathNode + Admin R-008 | Autorización a migrar schema, tocar prod DB o publicar contenido live ahora |
| Matriz existe / parcial / bloquea MVP / post-MVP anclada a D-ROAD-005 + MVP congelado | Implementación de código en esta pasada de brief |
| Plantilla exacta que `05-*` debe rellenar en la **ejecución** | Crear `05-academia-cursos.md` ahora (este brief) |
| Puente entre F1–F4 cerradas y “catálogo publicable usable” | Fase 6 Mi Camino completo · 7 Progreso · 8 Comunidad · 9 Pagos |
| Lista de tickets (T-PUB-01 + derivados opcionales) | Inventar greenfield LMS / CourseLit / Track B |

**Regla de oro:** el **modelo y Admin R-008 ya existen** en Track A. Fase 5 **no inventa academia desde cero**. Documenta la verdad del repo, cierra el gap **dato/pipeline** T-PUB-01 (mínimo N=1 bloque usable PUBLISHED visible al alumno), declara BRIDGE/WON'T, y **no** reabre el MVP congelado (**D-F1-001**).

### Qué NO es Fase 5

- Fase 6 — Mi Camino suscriptor “completo” (UX mapa profunda, serpiente, VFX, etc.).  
- Fase 7 — Mi Progreso (`T-MVP-PROGRESS`).  
- Fase 8 — Comunidad feed launch (`T-MVP-COMMUNITY`).  
- Fase 9 — Stripe / Mercado Pago UI / pasarela.  
- Rediseño visual hero / Visual D / landing Atmospheric overhaul.  
- Track B · Next.js · Sanity · CourseLit producto · AlphaTab · Elvis ERP.  
- Currículo 6–75 completo jugable (publicación por bloques; teaser ≠ currículo).  
- Reabrir D-007 (solo Guitarra), R-001 / R-002 sin decisión.  
- Email verify / NextAuth (cerrados en F4).  
- Commit / push autónomo · migraciones no autorizadas · seeds ciegos en prod.

---

## Prerrequisitos

Antes de que el ejecutor redacte `05-academia-cursos.md` (o toque código/contenido), deben cumplirse:

| # | Prerrequisito | Estado (al escribir esta instrucción) |
|---|---------------|----------------------------------------|
| 1 | **D-F1-001** — MVP Track A congelado | ✅ |
| 2 | **D-F2-001** — arquitectura / modelo aprobados | ✅ |
| 3 | **D-F3-001** — entorno `03` guía oficial Track A | ✅ |
| 4 | **D-F4-001** — Auth Track A canónico (`04`) | ✅ |
| 5 | DoD permanente `docs/quality/definition-of-done.md` | ✅ |
| 6 | Decisiones A–D (**D-ROAD-005**); D-007 Guitarra; D-017 ACTIVE | ✅ |
| 7 | Esta instrucción leída y aceptada como método | ✅ |
| 8 | **OK Juan para iniciar ejecución Fase 5** | ✅ (docs-only 2026-07-15) |
| 9 | Firma Juan §13 / **D-F5-001** (cierre) | ✅ 2026-07-15 · **D-F5-001** |

Gates docs cumplidos (**D-F5-001**). **T-PUB-01** piloto / código / publish prod siguen prohibidos sin mandato aparte. Fase 6 **NO**.

---

## Objetivo de la Fase 5

Lograr **Academia + catálogo publicable usable** para el MVP Track A, con este mapa mental:

```text
  Landing #academia (CTA) ──► /onboarding-academia
                                    │
                    instrumento (solo Guitarra D-007)
                                    │
                         punto de partida (nivel)
                                    │
              ┌─────────────────────┴─────────────────────┐
              ▼                                           ▼
     Demo funnel (/mi-camino-demo)              Zona alumno (ACTIVE)
     + demo-clase-1..5                          /alumno · /mi-camino
                                                       │
                                                       ▼
                                              GET /me/path
                                          Course PUBLISHED +
                                        Module/PathNode PUBLISHED
                                                       │
                              ┌────────────────────────┘
                              ▼
                     Admin /admin (R-008)
              create bloque → 5 slots → publish
                              │
                              ▼
                         T-PUB-01 ✅
                   ≥1 bloque usable visible
```

Entregables de **ejecución** (futuro, tras OK Juan):

| Entregable | Rol |
|------------|-----|
| **`docs/features/05-academia-cursos.md`** | Canónico Academia/Cursos Track A (onboarding + modelo + publish + gaps) |
| **T-PUB-01** cerrado o con plan aceptable + evidencia | Piloto admin→alumno; N=1 bloque usable PUBLISHED en entorno acordado |
| Tickets opcionales `T-PUB-*` / mención `T-UX-LESSON-01` | Solo si el `05` demuestra gap verificable — **no** inventar vacío |
| Ajustes de código **mínimos** y autorizados | Solo gaps MUST del pipeline publish→visibilidad; **no** rediseño F6–F9 |
| Control roadmap | `etapa-actual` · `changelog` · `PROJECT_STATUS` · opcional `D-F5-*` al cierre |

**Pasada brief (histórico):** instrucción + brief + “ejecución NO”.  
**Pasada ejecución + cierre docs (2026-07-15):** `docs/features/05-academia-cursos.md` **canónico v1.0** · **D-F5-001** · §13 firmado · sin código · T-PUB-01 **MUST abierto** (piloto no ejecutado).

---

## Entradas (fuentes de verdad)

Leer en este orden. Extraer solo lo indicado. **No** inventar endpoints ni modelos.

| Path | Qué extraer |
|------|-------------|
| `docs/product/01-mvp-gmusic.md` | Academia MUST §6; contenido §7.5 + T-PUB-01; D-007; happy path |
| `docs/roadmap/decisiones.md` | D-F1…D-F4-001 · D-ROAD-005 · refs MVP |
| `.agents/DECISIONS.md` | **D-007** Guitarra · **D-017** ACTIVE · R-008 Admin creador |
| `docs/quality/definition-of-done.md` | Verify / E2E / permisos al cerrar ejecución |
| `docs/architecture/02-modelo-datos.md` | Course → Module → PathNode; bloque = 5 etapas; PublishStatus |
| `docs/architecture/02-arquitectura-sistema.md` | Dominio Academy Content + Administration |
| `docs/project-status/00-inventario-actual.md` | Academia completa onboarding; Admin parcial; B1 T-PUB-01 |
| `docs/roadmap/backlog.md` | T-PUB-01 · T-UX-LESSON-01 (adyacente) |
| `docs/features/04-auth-usuarios.md` | Guards / ACTIVE — no reabrir auth |
| `prisma/schema.prisma` | `Course` · `Module` · `PathNode` · `PublishStatus` · `StageType` |
| `server/services/curriculum.ts` | Admin create/slot/publish; `validateModuleForPublish` |
| `server/services/coursePath.ts` | Alumno solo ve PUBLISHED (course + modules + nodes) |
| `server/routes/admin.ts` | API R-008 |
| `server/routes/me.ts` | `GET /me/path` + `defaultCourseSlug` |
| `server/routes/lessonSessions.ts` | Sesión/completado (límite con T-UX-LESSON) |
| `src/app/pages/OnboardingAcademiaPage.tsx` | Wizard URL canónica |
| `src/app/components/marketing/AcademiaOnboardingWizard.tsx` | 2 pasos instrumento→nivel |
| `src/app/data/academia-instruments.ts` | Guitarra `available: true`; resto false |
| `src/app/pages/AdminPage.tsx` | UI creador/publicación |
| `src/app/pages/GmusicPath.tsx` | Empty state path sin módulos publicados |
| `src/app/services/gmusic-api/admin.ts` · `path.ts` · `path-load.ts` | Cliente FE |
| `prisma/seed.ts` | Curso seed `ruta-guitarra-12-meses` PUBLISHED (dev/local — ≠ piloto prod) |
| Skill `gmusic-path` · `gmusic-learning-engine` · `gmusic-game-progression-architecture` | Dominio path/currículo — no rediseñar F6 |

**Conflicto docs vs código:** gana código + tests + MVP. El `05` debe citar contradicciones (p. ej. AGENTS “wizard `#academia`”) y cómo se resuelven — **sin** reescritura masiva sin OK Juan.

---

## Evidencia de auditoría (snapshot 2026-07-15 · HEAD `e5b161c`)

Revalidar rutas y comportamientos al **ejecutar**. Snapshot de este brief:

### Onboarding Academia (superficie alumno/público)

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| URL canónica | `onboarding-academia` → `/onboarding-academia` (`student-zone-routing` + `App`) | **existe** |
| Página | `OnboardingAcademiaPage` monta `AcademiaOnboardingWizard` | **existe** |
| Paso 1 instrumento | `AcademiaInstrumentSelector` + `academia-instruments.ts` | **existe** |
| Solo Guitarra (D-007) | Guitarra `available: true`; Teclado/Canto `false` | **existe** |
| Paso 2 nivel | `InteractiveLevelSelector` (Fundamento/Técnica/Crea × niveles) | **existe** |
| Destino post-nivel | → quiz opcional o **`mi-camino-demo`** (no auto `/mi-camino` suscriptor) | **existe** (funnel) |
| Landing `#academia` | CTA marketing (`AcademiaPublicSection`) — **no** wizard | **existe** (separado) |
| Docs AGENTS “wizard `#academia`” | Desfasado vs URL dedicada | **docs desfasados** |

### Modelo / schema

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| `Course` | slug único, `PublishStatus` default DRAFT | **existe** |
| `Module` (bloque) | order por curso; status; hijos PathNode | **existe** |
| `PathNode` (etapa) | order; stageType; media; completionCriteria | **existe** |
| `PublishStatus` | DRAFT \| PUBLISHED \| ARCHIVED | **existe** |
| `StageType` ×5 | FUNDAMENTO_UNO…TOCAR | **existe** |
| Curso default | `config.defaultCourseSlug` = `ruta-guitarra-12-meses` | **existe** |
| Seed local | `prisma/seed.ts` publica Course+Module+nodes | **existe** (dev) ≠ piloto prod |

### Admin creador / publicación (R-008)

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| UI `/admin` | `AdminPage.tsx` — login ADMIN, listado, 5 slots, publish | **existe** |
| API list/create/detail | `GET/POST /api/v1/admin/modules` | **existe** |
| API slot update | `PUT …/modules/:id/slots/:order` | **existe** |
| API publish | `POST …/modules/:id/publish` → `publishAdminModule` | **existe** |
| Criterio publish | Exactamente 5 nodos; 5 stageTypes; cada uno title + completionCriteria | **existe** |
| Media (video/PDF) | Opcional para validación publish | **parcial** vs “lección rica” |
| Publish Course desde Admin | No hay endpoint/UI “publicar curso” | **inexistente** (depende seed/ops) |
| Create Course desde Admin | No | **inexistente** |
| Unpublish / ARCHIVE UX | Schema tiene ARCHIVED; flujo ops limitado | **parcial** |
| Credencial admin prod | INC-admin-cred | **P0 ops** (enlace; no “resolver” solo por F5) |

### Visibilidad alumno (Mi Camino)

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| `GET /me/path` | `me.ts` + `buildPathResponse` / `loadPublishedCoursePath` | **existe** |
| Filtro PUBLISHED | Course debe PUBLISHED; modules/nodes `where: PUBLISHED` | **existe** |
| Empty state UI | `GmusicPath` — “Tu camino todavía no tiene módulos publicados…” | **existe** |
| Sesión lección | `POST /api/v1/lesson-sessions` (+ complete) | **existe** (consumo = frontera T-UX-LESSON) |
| Demo path | `/mi-camino-demo` + catálogo demo TS | **completa** (funnel ≠ catálogo suscriptor) |

---

## Matriz canónica (existe / parcial / bloquea MVP / post-MVP)

Leyenda: **bloquea MVP** = sin esto no launch según §7 MVP. **post-MVP** = no bloquea launch.

| Capacidad | Estado repo | ¿Bloquea MVP? | Política | Notas |
|-----------|-------------|---------------|----------|--------|
| Onboarding `/onboarding-academia` | **existe** (completa) | **No** si happy path opera | MUST | Solo Guitarra D-007 |
| Instrumento Teclado/Canto | UI “próximamente” | **No** | WON'T MVP | No reabrir D-007 |
| Landing CTA `#academia` | **existe** | **No** | MUST marketing | No confundir con wizard |
| Modelo Course/Module/PathNode | **existe** | **No** | MUST dominio | Schema Fase 2 |
| Admin crear bloque + 5 etapas | **existe** | **No** (pipeline) | MUST soporte | R-008 |
| Admin publicar bloque (validación) | **existe** | Si roto → **Sí** | MUST | Tests admin-routes |
| Curso `ruta-guitarra-12-meses` PUBLISHED en **entorno launch** | **parcial** (seed local; prod no verificado aquí) | **Sí** si Course DRAFT/ausente | MUST dato | Gap T-PUB-01 ops |
| ≥1 Module PUBLISHED usable visible en `/mi-camino` | **parcial** / entorno-dependiente | **Sí** | **T-PUB-01 MUST** | N=1 bloque de 5 etapas |
| Media/video en cada etapa | Opcional en validator | **No** si umbral “usable” acordado | SHOULD contenido | Juan define umbral en ticket |
| MicroExercise en nodos publish | Seed/ops parcial | **No** para “visible”; **Sí** si umbral = práctica interactiva | Frontera T-UX-LESSON | Documentar en `05` |
| API publish Course / create Course | **inexistente** | **No** si seed/ops deja Course PUBLISHED | BRIDGE ops | Gap documentar; no CourseLit |
| Destino onboarding → `/mi-camino` suscriptor | No (va a demo) | **No** | Funnel | Entrada alumno vía nav `/alumno` |
| LessonRunner consumo pulido | Parcial | Si impide completa+guarda → **Sí** | **T-UX-LESSON-01** | Ticket adyacente 5/6 — no rediseñar F6 |
| AGENTS wizard `#academia` | Docs desfasados | Claridad agentes | Higiene | Lista en `05`; rewrite con OK |
| Currículo 6–75 / multi-instrumento DB | Incompleto / OUT | **No** | post-MVP / WON'T | |
| CourseLit / Track B Sanity | Análisis only | N/A | WON'T | Prohibido mezclar |

---

## Gaps vs MVP — foco T-PUB-01

### Qué falta para admin → alumno (mínimo launch)

Pipeline **código** (mayormente OK en `e5b161c`):

1. ADMIN autentica → `/admin`.  
2. Crea bloque en curso default (Course debe existir).  
3. Completa 5 slots (título + criterio; stageTypes fijos).  
4. `POST …/publish` → Module + PathNodes → PUBLISHED.  
5. Alumno con Subscription ACTIVE → `GET /me/path` → ve el bloque.  
6. Empty state si cero modules PUBLISHED.

Gaps residuales que **T-PUB-01** debe cerrar o declarar BRIDGE:

| Gap | Tipo | Acción en ejecución F5 |
|-----|------|------------------------|
| Course PUBLISHED presente en staging/prod launch | **Dato / ops** | Verificar o seed/ops documentado; Admin no publica Course hoy |
| ≥1 bloque completo (5 etapas) PUBLISHED usable | **Dato + piloto** | Ejecutar piloto real Admin→alumno; evidencia en ticket |
| Definición “usable” (¿solo título+criterio, o video/guía/ejercicios?) | **Producto** | Juan confirma en OK ejecución o en T-PUB-01; default brief = validator actual (título+criterio) **más** al menos un medio de consumo acordado |
| Course create/publish UI | Código ausente | **BRIDGE** ops/seed salvo Juan eleve a ticket |
| Credencial admin / Prisma prod | P0 ops | Enlazar INC-admin-cred / R-OPS-01 — **no** “resolver F5” sin mandato ops |
| Consumo lección frágil | T-UX-LESSON-01 | Mencionar dependencia; implementar solo si Juan mete el ticket en el mismo mandato F5 |

### Mínimo launch propuesto (N=1)

> **T-PUB-01 DONE** cuando en el entorno acordado (staging o prod controlado):  
> (1) Course default `ruta-guitarra-12-meses` está **PUBLISHED**;  
> (2) existe **≥1 Module** con exactamente **5 PathNode** **PUBLISHED** que pasan `validateModuleForPublish`;  
> (3) un alumno **ACTIVE** ve ese bloque en `/mi-camino` (no empty state);  
> (4) evidencia capturada (pasos + IDs o screenshots) en el cierre del ticket / § del `05`.

Equivalente acordado con Juan (MVP §7.5) permitido si documenta paridad (mismo umbral usable).

### MUST / SHOULD / WON'T / BRIDGE (resumen F5)

| Clase | Ítems |
|-------|--------|
| **MUST** | Onboarding canónico OK · pipeline Admin publish · T-PUB-01 N=1 bloque usable visible · Course PUBLISHED en entorno launch |
| **SHOULD** | Media en etapas · criterios D-GOV-04 pedagógicos alineados · higiene docs AGENTS |
| **BRIDGE** | Create/publish Course vía seed/ops si no hay UI; activación suscripción sigue F4/F9 WhatsApp |
| **WON'T** | Multi-instrumento activo · CourseLit · Track B · Stripe · Mi Progreso/Comunidad features · currículo 6–75 completo |

---

## Entregable futuro: `docs/features/05-academia-cursos.md`

**No crear en esta pasada.** Outline EXACTO a rellenar **tras OK ejecución**:

```markdown
# 05 — Academia / Cursos (Track A)

## 0. Metadatos
Fecha · autor · versión · estado · SHA · prerreqs D-F1…D-F4-001 · D-007 · R-008

## 1. Propósito y alcance
Qué cubre · audiencia · qué NO (F6–F9, Track B, CourseLit, rediseño visual)

## 2. Política MVP Academia/Cursos
Tabla MUST / SHOULD / WON'T / BRIDGE citando 01-mvp + T-PUB-01

## 3. Onboarding Academia
URL canónica · 2 pasos · D-007 · vs landing `#academia` · destino demo vs alumno

## 4. Modelo de contenido
Course → Module (bloque) → PathNode (etapa ×5) → MicroExercise (opcional)
PublishStatus · StageType · slug default

## 5. Admin Creador (R-008)
Flujos UI/API · validación publish · límites (no Course UI)

## 6. Visibilidad alumno
GET /me/path · filtros PUBLISHED · empty state · frontera lesson-sessions

## 7. T-PUB-01 — piloto publicación
Criterio N=1 · entorno · evidencia · umbral “usable” firmado Juan

## 8. Matriz audit (existe/parcial/gap)
Tabla actualizada vs esta instrucción

## 9. Docs desfasados y reconciliación
AGENTS wizard `#academia` · etc. — lista + acciones mínimas

## 10. Tickets derivados
T-PUB-01 (estado) · T-UX-LESSON-01 (relación) · T-PUB-* opcionales

## 11. Cómo probar
Smoke admin publish → alumno path · DoD · `npm run verify` si hubo código

## 12. Fuera de alcance / riesgos
INC-admin-cred · R-OPS-01 · prod DB · F6–F9

## 13. Aprobación
Casilla Juan · fecha · restricciones
```

### Tickets (nombres — **no implementar en brief**)

| ID | Rol en F5 | Prioridad |
|----|-----------|-----------|
| **T-PUB-01** | Cierre piloto admin→alumno (núcleo F5) | **MUST** pre-launch |
| `T-UX-LESSON-01` | Consumo lección completa+persiste | MUST **si** bloquea; etapa 5/6 — solo con mandato |
| `T-PUB-COURSE-OPS` (tentativo) | Documentar/automatizar Course PUBLISHED seed/ops | Solo si `05` lo exige |
| `T-PUB-DOCS-ALIGN` (tentativo) | Higiene AGENTS Academia | Docs |

---

## Criterios de aceptación — separar brief vs ejecución

### A) Criterios de **este brief** (pasada actual — 2026-07-15)

- [x] Existe `docs/roadmap/fase-5-instruccion.md` (este archivo).  
- [x] Opcional: `docs/roadmap/fase-5-brief-supervisor.md` (1 página gate).  
- [x] `etapa-actual.md` · `changelog.md` · `PROJECT_STATUS.md` · fila F5 en `roadmap-general.md` actualizados.  
- [x] **Ejecución Fase 5 = NO INICIADA** · sin `05-academia-cursos.md` · sin código academia · sin migraciones · sin prod DB · sin publicar contenido prod · sin commit/push.  
- [x] No reabre MVP · no F6–F9 · no Track B/CourseLit.

### B) Criterios de **ejecución Fase 5** (cerrados · **D-F5-001**)

Fase 5 **cerrada** (**D-F5-001**, 2026-07-15) como fase documental:

- [x] Existe `docs/features/05-academia-cursos.md` con secciones de la plantilla.  
- [x] Matriz Academia/publish revalidada contra código (SHA `e5b161c`).  
- [x] **T-PUB-01:** criterio N=1 documentado · estado **MUST abierto** (piloto no ejecutado).  
- [x] Umbral “bloque usable” **firmado** (= validator; media/micro SHOULD).  
- [x] Cero CourseLit / Track B / schema greenfield.  
- [x] Sin tocar F7/F8/F9 / F6 under etiqueta “academia”.  
- [x] Sin código → verify N/A.  
- [x] Juan marca aprobado §13 del `05` (→ **D-F5-001**).  
- [x] Control roadmap: Fase 5 TERMINADA · Fase 6 **NO** abierta sin OK.

---

## Método — pasos cuando Juan diga OK ejecuta

1. **Releer** esta instrucción + MVP Academia/contenido §6–§7 + D-007 + R-008 + `02-modelo`.  
2. **Re-auditar** archivos de la tabla Entradas (HEAD actual).  
3. **Crear** `docs/features/05-academia-cursos.md` con plantilla §§0–13.  
4. **Ejecutar piloto T-PUB-01** solo en entorno que Juan autorice (staging preferido; prod solo con OK ops explícito).  
5. **Confirmar con Juan** umbral “usable” si no vino en el OK.  
6. **Solo si OK en el mismo mandato:** código mínimo para gaps MUST del pipeline (p. ej. publish Course) o arrancar T-UX-LESSON si lo incluye.  
7. **No** migraciones schema sin decisión · **no** seeds/migrate prod a ciegas · **no** F6 rediseño path · **no** F9 pagos.  
8. Tests del área tocada + `npm run verify` si hay código.  
9. Cierre control + pedir firma Juan §13.  
10. **No** abrir Fase 6 sin OK explícito.

**Tope reintentos verify:** protocolo loop (máx 3; 4.º congela).

---

## Prohibidos (ejecución y brief)

| Prohibido | Por qué |
|-----------|---------|
| Crear `05-academia-cursos.md` en esta pasada brief | Solo tras OK ejecución |
| Migraciones Prisma / schema greenfield sin decisión | D-F2 + gobernanza |
| Seeds/migrate/publish contra **prod DB** sin OK ops Juan | R-OPS-01 / DB-02 |
| Publicar contenido prod “de pasada” en el brief | Fuera de autorización |
| CourseLit / Sanity / Next.js Track B | Dual-track / WON'T |
| Rediseño Mi Camino completo (Fase 6) | Fase distinta |
| Mi Progreso / Comunidad / Pagos (F7–F9) | Fase distinta |
| Reactivar Teclado/Canto | D-007 |
| Reabrir A–D / descongelar MVP | D-F1-001 |
| Commit/push autónomo | Regla Director |
| Tratar INC-admin-cred como “hecho porque F5” | Ops P0 con mandato propio |

---

## Preguntas mínimas a Juan (no reabrir MVP)

Solo si el OK de ejecución no las responde:

1. **Entorno del piloto T-PUB-01:** ¿staging, prod controlado, o ambos?  
2. **Umbral “usable”:** ¿basta título+criterio (validator), o exige video/guía y/o MicroExercise?  
3. **T-UX-LESSON-01:** ¿dentro del mismo mandato F5 o queda para F6?  
4. **Higiene AGENTS Academia:** ¿lista en `05` basta, o toque mínimo al mismo tiempo?

No preguntar Stripe, email verify, Track B, ni currículo 6–75 completo.

---

## Relación con otras fases / T-*

| Ítem | Relación |
|------|----------|
| F1–F4 | Prerreqs cerrados |
| **Fase 5** | Cerrada documental (**D-F5-001**) · T-PUB-01 piloto pendiente mandato |
| Fase 6 Mi Camino | Consume path publicado; UX completa **fuera** |
| Fase 7–9 | **Fuera** |
| T-PUB-01 | Núcleo F5 |
| T-UX-LESSON-01 | Adyacente; no asumir inclusión |
| INC-admin-cred / R-OPS-01 | Enlace; mandato ops separado |
| DoD | Aplica a cualquier cambio de ejecución |
| Skills | `gmusic-agent-workflow` · `gmusic-verification` · `gmusic-path` · `gmusic-learning-engine` |

---

## Formato de cierre Fase 5 — **cumplido** (**D-F5-001**)

1. ✅ `etapa-actual.md` → Fase 5 TERMINADA · Fase 6 NO INICIADA.  
2. ✅ `changelog.md` — link a `05` / D-F5-001.  
3. ✅ `.agents/PROJECT_STATUS.md` — hito corto.  
4. ✅ `D-F5-001` en `decisiones.md` · **D-F5-WIP** supersedido.  
5. ✅ No iniciar Fase 6 sin OK.

---

## Estado post-cierre docs (2026-07-15)

### Hecho

- F1 / F2 / F3 / F4 / F5 (documental) cerradas.  
- Brief + instrucción Fase 5.  
- `05-academia-cursos.md` canónico v1.0 · informe · **D-F5-001** · §13 firmado.  
- Control: F5 **TERMINADA** · F6 **NO** · T-PUB-01 MUST abierto · sin código · sin commit.

### Pendiente (fuera de cierre F5 docs)

**T-PUB-01** — MUST abierto (piloto requiere mandato entorno aparte).  
Fase 6 — **NO** abierta / no autorizada.

---

*Fin de la instrucción. Fase 5 docs **TERMINADA** (**D-F5-001**). Sin código · sin commit/push.*
