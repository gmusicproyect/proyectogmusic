# Handoff Comunidad MVP — Gmusic Estudio
**Fecha:** 2026-06-30  
**Rama:** `preview/d022b2-canva-structure`  
**Estado:** working tree dirty, sin commit ni push (pendiente OK Juan)  
**Tests:** 550/550 app · typecheck OK  
**Stack:** Vite + React · Express + Prisma (Track A)

---

## 1. Comunidad por nivel — dominio (C1)

**Archivos nuevos / clave:**
- `src/app/data/community-level.ts` — `BASIC | INTERMEDIATE | ADVANCED`
- `src/app/data/community-post-types.ts` — tipos post, filtros feed, `filterCommunityPostsForFeed`
- `src/app/data/community-sectors.ts` — 3 sectores internos (basic / intermediate / advanced)
- `src/app/data/mock-community-posts.ts` — `MOCK_COMMUNITY_POSTS = []` (vacío producción) + `SAMPLE_COMMUNITY_POSTS` (solo tests)
- `src/app/data/mock-community-data.ts` — peers vacíos, curado admin, mentoría, conduct rules
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

**Feed "Todo":** Preguntas → Progresos → Música → Feedback. Canción del mes al final.

**Canción del mes (curado Gmusic):**
- Título: `Canción del mes — nivel Básico`
- Copy: `Referencia curada por Gmusic para escuchar, aprender y practicar.`
- Enlace: Referencia en YouTube · botón Escuchar referencia

**CTAs por plataforma:** Drive → Ver archivo · YouTube → Ver video/Escuchar referencia · SoundCloud → Escuchar audio · Spotify → Escuchar canción

**Acciones en posts:** Pregunta → Responder · Progreso → Dar feedback · Música → Comentar

**Panel derecho:** Compañeros en {nivel} · Progreso hacia mentoría (0/3 progresos, 0/5 feedbacks)

---

## 4. Estado vacío — plataforma sin usuarios

| Elemento | Estado |
|---|---|
| Feed | Vacío (`MOCK_COMMUNITY_POSTS = []`) |
| Compañeros | Vacío (`MOCK_COMMUNITY_PEERS = []`) |
| Mentoría | 0/3 · 0/5 |
| Mensaje empty | *"Sé el primero en compartir una pregunta, tu progreso o música"* |
| Crear publicación | Activo (formulario placeholder — C2 pendiente) |
| Canción del mes | Sí — contenido curado Gmusic |

---

## 5. Bug scroll toolbar (parcialmente resuelto)

**Fix aplicado:** quitado `position: sticky` de `.community-toolbar` en `src/styles/index.css`.  
**Pendiente:** validación visual en Safari/Chrome por Juan.

---

## 6. Restricciones respetadas

- No auth / pagos / schema / routing global
- No subida nativa audio/video — solo enlaces externos
- No chat privado, ranking público, lanzamientos sin curaduría
- No commit/push sin OK explícito Juan

---

## 7. Pendiente próximos ciclos

| ID | Tarea |
|---|---|
| **C2** | Formulario crear publicación real (persistencia + validación enlaces) |
| **API** | Rutas community con `communityAccess.ts` (enrollment desde sesión, no body) |
| **Enrollment real** | `useCommunityEnrollment` → API (hoy: mock + localStorage Academia) |
| **Deploy** | SPA rewrites funnel |
| **Visual** | Confirmar scroll Comunidad en Safari/Chrome |

---

## 8. Archivos tocados

**Modificados:** `CommunityPage.tsx`, `App.tsx`, `GmusicInternalHeader.tsx`, `StudioAtmosphere.tsx`, `InteractiveLevelSelector.tsx`, `AcademiaOnboardingWizard.tsx`, `analytics.ts`, `index.css`

**Nuevos:** `GmusicCommunity.tsx`, `community/` (componentes), `data/community-*.ts`, `data/mock-community-*.ts`, `hooks/useCommunityEnrollment.ts`, `utils/community-*.ts`, `utils/get-student-community-level.ts`, `server/lib/communityAccess.ts`, tests varios

**Eliminado:** `CommunityLevelSelector.tsx`

---

## 9. Verificación

```bash
cd "Página de cursos de música" && npm run app:typecheck && npm run app:test
# 550/550
node --import tsx --test server/tests/community-access.test.ts
# 4/4
```

---

## 10. Criterios aceptación

1. Alumno Básico solo ve Comunidad Básico ✅
2. No accede feed Intermedio/Avanzado ✅
3. Sin reto semanal impuesto ✅
4. Compañeros vacíos hasta actividad real ✅
5. Plataforma operativa para primer usuario ✅
