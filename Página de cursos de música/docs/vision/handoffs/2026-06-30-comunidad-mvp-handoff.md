# Handoff Comunidad MVP — Gmusic Estudio
**Fecha:** 2026-06-30 · **Addendum B+:** 2026-08-02  
**Rama:** `preview/d022b2-canva-structure` (histórico) · estado B+ en working tree  
**Estado producto:** UI parcial en nav · **NO LANZADO** (no narrar como «Comunidad lanzada»)  
**Stack:** Vite + React · Express + Prisma (Track A)

---

## Addendum B+ (2 Ago 2026) — formalizar abierta

**Frase Juan:** `OK Comunidad: formalizar abierta` → implementar **B+** (no B puro).  
**Decisión:** **D-COMM-BPLUS-001**.

| Ítem | Estado post-B+ |
|---|---|
| Header / nav | Tab Comunidad **sin candado** (ya abierta; **no** re-lock) |
| `MOCK_ADMIN_CURATED` | **Vacío** — cero «Canción del mes» / URLs `example` |
| Peers | Vacío + copy honesto (sin perfiles demo) |
| Mentoría | «Próximamente» hasta actividad real |
| Feed posts | Vacío de producción (`MOCK_COMMUNITY_POSTS = []`); API real cuando hay enrollment |
| `communityAccess` / backend | **No tocado** |
| Narrativa | Nav habilitada + UI parcial ≠ **producto lanzado** |

Flows canónicos: `docs/flows/05-comunidad-resumen.md`. Dictamen: `docs/operations/dictamen-ws2-comunidad-a-vs-b-2026-08-02.md`.

---

## 1. Comunidad por nivel — dominio (C1)

**Archivos nuevos / clave:**
- `src/app/data/community-level.ts` — `BASIC | INTERMEDIATE | ADVANCED`
- `src/app/data/community-post-types.ts` — tipos post, filtros feed, `filterCommunityPostsForFeed`
- `src/app/data/community-sectors.ts` — 3 sectores internos (basic / intermediate / advanced)
- `src/app/data/mock-community-posts.ts` — `MOCK_COMMUNITY_POSTS = []` (vacío producción) + `SAMPLE_COMMUNITY_POSTS` (solo tests)
- `src/app/data/mock-community-data.ts` — peers vacíos, **curado admin vacío (B+)**, mentoría, conduct rules
- `src/app/utils/community-enrollment.ts` — resuelve enrollment desde inscripción
- `src/app/utils/get-student-community-level.ts`
- `src/app/hooks/useCommunityEnrollment.ts`
- `src/app/utils/community-external-link.ts` — CTAs por plataforma
- `src/app/utils/community-access.ts` — nivel autorizado, `buildCommunityPostCreateContext`
- `server/lib/communityAccess.ts` — validación backend (no confiar en `level` del cliente)
- Componentes en `src/app/components/gmusic/community/`

**Analytics:** eventos comunidad en `src/app/utils/analytics.ts` (PostHog centralizado).

---

## 2. Acceso por nivel — regla final (NO selector libre)

- El alumno **solo ve su sector** según enrollment activo (`studentLevel`).
- **Eliminado** `viewLevel` / exploración read-only de otros niveles.
- UI: `CommunityLevelBadge` — muestra `Guitarra Básico` + **TU NIVEL** + descripción del sector.
- Feed, compañeros, curado y publicaciones filtrados **solo** por `studentLevel`.
- Crear publicación: metadatos automáticos vía `buildCommunityPostCreateContext`.
- **Integración Academia:** `persistCommunityEnrollmentFromAcademiaSelection` en `InteractiveLevelSelector`.
- **Backend preparado:** `assertAuthorizedCommunityLevel`, `buildCommunityRequestScope`.

**Dev override:**
```js
localStorage.setItem('gmusic:community_enrollment_v1', JSON.stringify({ programLabel: 'Guitarra Intermedio' }))
```

---

## 3. Ajustes UI/UX (feedback Juan)

**Reto semanal — ELIMINADO del MVP**
- Razón: cada alumno avanza a su ritmo; no imponer clase/semana fija.
- `resolveWeeklyChallenge()` → `null`. Componente existe pero no montado.

**Feed "Todo":** Preguntas → Progresos → Música → Feedback. Slot curado al final (contenido real o «próximamente»).

**Canción del mes / curado Gmusic (B+):**
- **Sin** contenido simulado en producción.
- Panel muestra «próximamente» hasta selecciones reales.
- Tipos/`CommunityAdminCuratedPanel` listos para datos reales futuros.

**CTAs por plataforma:** Drive → Ver archivo · YouTube → Ver video/Escuchar referencia · SoundCloud → Escuchar audio · Spotify → Escuchar canción

**Acciones en posts:** Pregunta → Responder · Progreso → Dar feedback · Música → Comentar

**Panel derecho:** Compañeros en {nivel} (vacío honesto) · Mentoría «próximamente»

---

## 4. Estado vacío — plataforma sin usuarios

| Elemento | Estado |
|---|---|
| Feed | Vacío (`MOCK_COMMUNITY_POSTS = []`) |
| Compañeros | Vacío (`MOCK_COMMUNITY_PEERS = []`) |
| Mentoría | «Próximamente» (sin contadores inventados) |
| Mensaje empty | *"Sé el primero en compartir una pregunta, tu progreso o música"* |
| Crear publicación | Activo (formulario + API C2 según enrollment) |
| Canción del mes | **No** — curado vacío / «próximamente» (B+) |

---

## 5. Bug scroll toolbar (parcialmente resuelto)

**Fix aplicado:** quitado `position: sticky` de `.community-toolbar` en `src/styles/index.css`.  
**Pendiente:** validación visual en Safari/Chrome por Juan.

---

## 6. Restricciones respetadas

- No auth / pagos / schema / routing global (en ciclo MVP original)
- B+: no `communityAccess`/backend; no inventar feed
- No subida nativa audio/video — solo enlaces externos
- No chat privado, ranking público, lanzamientos sin curaduría
- No commit/push sin OK explícito Juan

---

## 7. Pendiente próximos ciclos

| ID | Tarea |
|---|---|
| **Feed real** | Contenido / curado real (sin mocks demo) |
| **API** | Rutas community con `communityAccess.ts` (enrollment desde sesión) |
| **Enrollment real** | `useCommunityEnrollment` → API |
| **Deploy** | SPA rewrites funnel |
| **Visual** | Confirmar scroll Comunidad en Safari/Chrome |

---

## 8. Archivos tocados

**Modificados (histórico MVP):** `CommunityPage.tsx`, `App.tsx`, `GmusicInternalHeader.tsx`, `StudioAtmosphere.tsx`, `InteractiveLevelSelector.tsx`, `AcademiaOnboardingWizard.tsx`, `analytics.ts`, `index.css`

**Nuevos (histórico MVP):** `GmusicCommunity.tsx`, `community/` (componentes), `data/community-*.ts`, `data/mock-community-*.ts`, `hooks/useCommunityEnrollment.ts`, `utils/community-*.ts`, `utils/get-student-community-level.ts`, `server/lib/communityAccess.ts`, tests varios

**B+ (2026-08-02):** `mock-community-data.ts`, `CommunityAdminCuratedPanel.tsx`, `CommunityPeersPanel.tsx`, `CommunityMentorshipPanel.tsx`, `CommunityPage.tsx`, tests refinement, docs flows/status/handoff/DECISIONS

**Eliminado:** `CommunityLevelSelector.tsx`

---

## 9. Verificación

```bash
cd "Página de cursos de música" && npm run app:typecheck && npm run app:test
node --import tsx --test src/app/utils/community-refinement.test.ts src/app/components/gmusic/gmusic-internal-header.test.ts
```

---

## 10. Criterios aceptación

1. Alumno Básico solo ve Comunidad Básico ✅
2. No accede feed Intermedio/Avanzado ✅
3. Sin reto semanal impuesto ✅
4. Compañeros vacíos hasta actividad real ✅
5. Cero curado simulado / URLs example (B+) ✅
6. Nav abierta ≠ producto lanzado (B+) ✅
