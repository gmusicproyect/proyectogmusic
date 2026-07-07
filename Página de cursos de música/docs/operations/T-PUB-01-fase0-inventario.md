# T-PUB-01 — Fase 0 inventario admin → alumno

**Ticket:** T-PUB-01 — Piloto Publicación  
**Fecha:** 7 Jul 2026  
**Estado:** Fase 0 completada (read-only) · **sin implementación**  
**Prerequisito:** T-API-01 cerrado · verify verde (`d54ea18`)  
**Decisión arquitecto:** Bloque 1 pedagógico (`piloto-bloque-1-admin.md`) · Fase 0 incluye inventario biblioteca admin (labels B1/B2/B3 vs mapa)

---

## 1. Archivos revisados

| Área | Archivos |
|------|----------|
| **Admin UI** | `src/app/pages/AdminPage.tsx`, `AdminLayout.tsx`, `admin-utils.ts`, `admin-page.css` |
| **Admin API client** | `src/app/services/gmusic-api/admin.ts` |
| **Admin API server** | `server/routes/admin.ts`, `server/services/curriculum.ts`, `server/services/adminReports.ts` |
| **Alumno path** | `src/app/pages/GmusicPath.tsx`, `hooks/usePath.ts`, `path-load.ts`, `path.ts`, `map-path.ts` |
| **Alumno runner** | `PathLessonRunner.tsx`, `LessonRunnerShell.tsx`, `useStartLessonSession.ts`, `complete-lesson-session.ts` |
| **Alumno access** | `StudentZoneGuard.tsx`, `useStudentAccess.ts`, `accessService.ts` |
| **Path API** | `server/routes/me.ts`, `server/services/meService.ts`, `server/services/coursePath.ts`, `server/lib/nodeStatus.ts` |
| **Sessions / progreso** | `server/routes/lessonSessions.ts`, `lessonSessionService.ts`, `completeLessonSessionService.ts` |
| **Schema** | `prisma/schema.prisma` |
| **Seed** | `prisma/seed.ts` |
| **Docs** | `docs/operations/piloto-bloque-1-admin.md`, `docs/flows/03-admin-contenido.md`, `docs/product/mapa-bloques-nivel-1.md` |
| **Gobernanza** | `.agents/DECISIONS.md` (D-GOV-04, D-GOV-17) |

---

## 2. Mapa admin actual

| Item | Estado |
|------|--------|
| **URL** | `/admin` (`currentPage: admin`) |
| **Auth** | JWT cookie · `User.role === ADMIN` · seed `admin@gmusic.academy` |
| **Curso** | Hardcoded `ruta-guitarra-12-meses` (sin selector multi-curso) |

### API admin (`/api/v1/admin/*`)

| Método | Endpoint | Acción |
|--------|----------|--------|
| GET | `/modules?courseSlug=` | Lista bloques (Module) |
| POST | `/modules` | Crea bloque DRAFT + 5 PathNodes (microciclo) |
| GET | `/modules/:id` | Detalle slots + `canPublish` |
| PUT | `/modules/:id/slots/:slotOrder` | Guarda etapa 1–5 |
| POST | `/modules/:id/publish` | Publica Module + PathNodes |
| DELETE | `/modules/:id` | Borra solo DRAFT sin actividad |
| GET | `/nodes/:nodeId/attempts` | Intentos read-only (max 200) |

### Qué puede crear/editar hoy

| Acción | Persistido | Notas |
|--------|------------|-------|
| Crear bloque | ✅ Prisma | Título + 5 slots vacíos |
| Editar etapa | ✅ | título, video URL, PDF URL, guideText, completionCriteria, ctaLabel |
| Publicar | ✅ | Requiere 5 etapas con título + criterio |
| Eliminar borrador | ✅ | Sin UserProgress / LessonSession / attempts |
| Editar bloque publicado | ⚠️ | Editar slot **degrada** Module a DRAFT → re-publish manual |
| Crear MicroExercise | ❌ | Solo seed / DB manual |
| Crear/editar Course | ❌ | |
| Archivar (ARCHIVED) | ❌ | Enum existe, no expuesto en API |

### Mock vs persistido (admin)

| | Mock | Persistido |
|---|------|------------|
| Admin CRUD | — | ✅ PostgreSQL |
| Comunidad admin panel | mock-community | — (fuera T-PUB-01) |

---

## 3. Mapa alumno actual

| Item | Estado |
|------|--------|
| **URLs** | `/alumno` (dashboard), `/mi-camino` (path + runner) |
| **Guard** | `StudentZoneGuard` → `GET /me/access` → suscripción ACTIVE |
| **Demo (fuera piloto)** | `/mi-camino-demo`, `/demo-clase-*` · localStorage · **no usa publish admin** |

### Fuente de datos Mi Camino

```
usePath → loadPathOnce (path-load.ts)
  → if VITE_USE_PATH_MOCK=true → gmusic-path-data.ts (static)
  → else GET /me/path
  → if modules.length === 0 → fallback silencioso a mock ⚠️
```

| Flag | Default | Efecto |
|------|---------|--------|
| `VITE_USE_PATH_MOCK` | `false` | Fuerza mock estático |
| `VITE_USE_DASHBOARD_MOCK` | `false` | Dashboard mock (no path) |

### API alumno relevante

| Endpoint | Uso |
|----------|-----|
| `GET /me/access` | Gate suscriptor |
| `GET /me/path` | Carrusel Mi Camino — **solo PUBLISHED** |
| `GET /me/dashboard` | Panel `/alumno` |
| `POST /lesson-sessions` | Iniciar práctica en nodo activo |
| `POST /lesson-sessions/:id/complete` | Registrar intentos + progreso |

### Campos admin NO expuestos al alumno hoy

En `buildPathResponse` el alumno recibe por nodo: `id`, `title`, `order`, `status`, `duration`, `contentKind`, `videoUrl`.

**No llegan:** `guideText`, `guidePdfUrl`, `completionCriteria`, `ctaLabel`, `stageType`.

---

## 4. Pipeline actual admin → alumno (diagrama textual)

```
[Admin /admin]
  login ADMIN
  → POST /admin/modules { title }
  → Module DRAFT + 5× PathNode DRAFT (stageType fijo 1–5)
  → PUT /admin/modules/:id/slots/:n { title, completionCriteria, videoUrl, ... }
  → POST /admin/modules/:id/publish
       → validateModuleForPublish (5 slots, título+criterio cada uno)
       → Module.status = PUBLISHED
       → PathNode.status = PUBLISHED

[Alumno suscriptor]
  StudentZoneGuard (ACTIVE sub)
  → GET /me/path?courseSlug=ruta-guitarra-12-meses
       → loadPublishedCoursePath (solo PUBLISHED modules/nodes)
       → deriveNodeStatuses (locked/active/available/completed)
  → GmusicPath carousel (nodos visibles)

[Práctica — opcional según MicroExercise]
  → POST /lesson-sessions { nodeId }  (solo nodo active|available)
  → PathLessonRunner + LessonRunnerShell
  → POST /lesson-sessions/:id/complete { attempts }
       → ExerciseAttempt, UserProgress, XpEvent, StreakEvent
  → path.retry() → refresh GET /me/path
```

### Qué existe vs qué falta en el pipeline

| Paso | ¿Existe? | Nota |
|------|----------|------|
| Admin crea/edita materia | ✅ | Module + 5 PathNodes |
| Materia persistida | ✅ | PostgreSQL |
| Materia se publica | ✅ | PublishStatus |
| Alumno la ve | ✅ | Si PUBLISHED + sub ACTIVE |
| Alumno inicia sesión/clase | ⚠️ | Requiere MicroExercise en nodo |
| Progreso se registra | ✅ | Si complete con ejercicios |

---

## 5. Gaps (piloto real Bloque 1)

| # | Gap | Severidad piloto | Detalle |
|---|-----|------------------|---------|
| G1 | **Sin MicroExercise en bloques admin-nuevos** | Alta | Admin publish no crea ejercicios → runner vacío (`exercises: []`) |
| G2 | **Seed legacy 3 nodos vs admin 5 etapas** | Media | D-GOV-17 Opción B: coexisten; badge legacy pendiente (T-FLOW-03) |
| G3 | **Fallback mock si path vacío** | Media | `path-load.ts` L42–45 oculta “nada publicado” en dev |
| G4 | **Campos pedagógicos admin no en alumno** | Baja piloto | Criterio/PDF/guía no en API path — piloto B1 valida visibilidad + títulos |
| G5 | **Biblioteca admin: labels B1/B2/B3** | Media Fase 0 | Orden interno admin ≠ Bloque pedagógico mapa — **inventario manual JP** |
| G6 | **Un solo curso hardcoded** | Baja | OK para Bloque 1 |
| G7 | **Re-edit published → DRAFT** | Media ops | Riesgo despublicar sin re-publish consciente |

---

## 6. Inventario biblioteca admin (Fase 0 — acción humana)

**Pendiente JP en `/admin` antes de Fase 1:**

Registrar por cada fila en biblioteca:

| Campo | Ejemplo |
|-------|---------|
| Label admin (B1, B2, B3…) | |
| Título en UI | |
| Status (DRAFT/PUBLISHED) | |
| ¿Coincide con Bloque N del mapa D-GOV-04? | |
| ¿Tiene 3 o 5 nodos? | |
| ¿Tiene MicroExercise? | |

**Hipótesis a validar:** fila “B3” con título de Bloque 1 = label admin, no Bloque 3 pedagógico.

---

## 7. Propuesta Fase 1 (mínima — pendiente aprobación)

**Objetivo Fase 1:** smoke E2E Bloque 1 — admin publish → alumno ve bloque → (opcional) una etapa con práctica.

| Opción | Alcance | Código | Riesgo |
|--------|---------|--------|--------|
| **1A — Smoke contenido (recomendada)** | JP carga Bloque 1 vía admin (`piloto-bloque-1-admin.md`); Cursor solo checklist + browser smoke | **Cero código** | Bajo |
| **1B — Fix observabilidad** | Desactivar fallback mock silencioso cuando API devuelve `modules: []` | 1 archivo `path-load.ts` | Bajo |
| **1C — Badge legacy** | T-FLOW-03 UI “Publicado legacy” en admin | UI acotada | Bajo |
| **1D — MicroExercise mínimo** | Seed 1 exercise por nodo admin-nuevo O admin UI crear exercise | Schema/API **NO** — seed script acotado | Medio |

**Recomendación:** **Fase 1 = 1A + 1B** (smoke humano + fix fallback para no falsear piloto). **No** 1D hasta decisión D-GOV sobre ejercicios en admin.

**Criterio done Fase 1 (1A):**

1. Bloque 1 publicado en admin (título mapa D-GOV-04)
2. `VITE_USE_PATH_MOCK=false` en prod/preview smoke
3. Alumno ACTIVE ve bloque en `/mi-camino`
4. 5 etapas con título visible en carousel
5. Reporte smoke (capturas + API `GET /me/path` snippet)

---

## 8. Riesgos

| Riesgo | Mitigación Fase 1 |
|--------|-------------------|
| Mock fallback enmascara path vacío | 1B + verificar env prod |
| Publicar bloque mal etiquetado (G5) | Inventario JP Fase 0 |
| Alumno ve bloque pero no puede practicar (G1) | Aceptar para piloto pipeline-only; documentar |
| Re-edit despublica sin aviso (G7) | JP no editar post-publish en piloto |
| Mezclar demo funnel con suscriptor | Smoke solo `/mi-camino`, no demo |

---

## 9. ¿Requiere D-GOV nueva?

| Tema | D-GOV existente | ¿Nueva decisión? |
|------|-----------------|------------------|
| Unidad 5 etapas | D-GOV-04 ✅ | No |
| Legacy seed vs admin | D-GOV-17 ✅ | No |
| MicroExercise en admin | — | **Sí, antes de Fase 1D** — “¿piloto valida solo visibilidad o práctica jugable?” |
| Fallback mock path vacío | — | **Opcional** — producto: ¿empty state vs mock? (1B) |
| Bloque 1 contenido | mapa + `piloto-bloque-1-admin.md` | No — copy congelado |

**Conclusión:** Fase 1A (smoke pipeline Bloque 1) **no requiere D-GOV nueva**. Fase 1D (ejercicios) **sí**.

---

## 10. Próximo paso

1. **JP:** completar tabla inventario biblioteca admin (§6)
2. **JP:** aprobar Fase 1 propuesta (1A ± 1B)
3. **Cursor:** no implementar hasta OK explícito

---

*Fase 0 · read-only · 7 Jul 2026 · post T-API-01 `d54ea18`*
