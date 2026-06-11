# Project Status — Gmusic Estudio

Última actualización: 10 Jun 2026 (post-`cf3343c` — precios 3×3 en remoto)

## Fases

| Fase | Descripción | Estado | Commit | Tests |
|------|-------------|--------|--------|-------|
| Fase 1 | Landing limpia + CTA dinámico en AcademiaSection | ✅ Completo | `5ad9517` | `fundamento-funnel.test.ts` |
| Fase 2 | Demo 5 clases (PathDemoPage + DemoLessonPage) | ✅ Completo | `2e41d9f` | `path-demo-page.test.ts`, `fundamento-funnel.test.ts` |
| Fase 3 | InscripcionGatePage gamificada + selector de planes | ✅ Completo | `2e41d9f` | `inscripcion-gate.test.ts` |
| Pre-Fase 4 | Bridge WhatsApp + videos YouTube en demo | ✅ Completo | `8ca6228` | `inscripcion-gate.test.ts` |
| Fase Precios | Modelo 3 tiers × 3 períodos + CLP en gate/registro | ✅ Completo | `cf3343c` | `inscripcion-gate.test.ts` (358 tests totales app) |
| R3 / zona alumno | Acceso, funnel Semestral dev, cofre Fase 6, R3.3E redirect | ✅ Completo (remoto) | `30e310b`…`6088dc5` | `public-session-flow.test.ts`, `map-dashboard.test.ts`, etc. |
| Fase 4 | Auth real (JWT/bcrypt/Prisma) | ⏸ Pausada | — | — |
| Fase 5 | Flow + Resend + Webhooks | ⏸ Pausada | — | — |

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
| `CommunityPage.tsx` | `community` | 🔴 Placeholder | Montada; alcance producto no verificado en esta auditoría |

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

## Inventario de ejercicios del demo

| Componente | Demo (`DemoLessonPage`) | Zona alumno (`ExerciseEngine` / `LessonPage`) | Clase demo |
|------------|-------------------------|-----------------------------------------------|------------|
| `MultipleChoiceExercise` | ✅ Clases 1 y 3 (MCQ en `demo-lessons.ts`) | ❌ | demo-clase-1, demo-clase-3 |
| `Ex1Cuerdas.tsx` | ✅ Clase 2 (`ex1-cuerdas`) | ✅ `ExerciseEngine` paso 0 | demo-clase-2 |
| `Ex2NotasAm.tsx` | ❌ | ✅ `ExerciseEngine` paso 1 | — |
| `Ex3NotasEm.tsx` | ❌ | ✅ `ExerciseEngine` paso 2 | — |
| `Ex4CalidadAcorde.tsx` | ✅ Clase 4 (`ex4-calidad-acorde`) | ✅ `ExerciseEngine` paso 3 | demo-clase-4 |
| `Ex5Secuencia.tsx` | ✅ Clase 5 (`ex5-secuencia`) | ✅ `ExerciseEngine` paso 4 | demo-clase-5 |

**Gap curricular documentado:** Clase 4 (video: notas y sostenidos) usa `ex4-calidad-acorde` (calidad mayor/menor). `Ex2NotasAm` no está cableado al demo.

## Archivos sin commit (working tree)

Según `git status` post-push `cf3343c`: **working tree limpio** en `src/`. Pendiente solo sincronización documental `.agents/` (Paso B).

**Modelo de precios activo** (`subscription-plans.ts`, commit `cf3343c`):

- Tiers: `basico`, `plus` (recomendado), `familiar` (3 perfiles)
- Períodos: `monthly`, `semester` (default UI), `annual`
- 9 `planId`: p. ej. `plus-semester`
- `PRICE_TABLE` CLP completo; ahorro en selector: Semestral 17%, Anual 25% (referencia Plus)

**WHATSAPP_NUMBER:** `56953429676` (formato wa.me correcto, commit `8ca6228`).

**Nota git:** `main` sincronizado con `origin/main` en `cf3343c`.

## Pendientes inmediatos

- [ ] Decisión Clase 4: ejercicio curricular (`ex4-calidad-acorde` vs. `Ex2NotasAm` / contenido del video)
- [ ] Decisión Skills curriculares: ¿repo git o Notion/Drive?
- [ ] Probar accesible en producción sin DEV_LEGACY guard (bajo impacto — sin links públicos conocidos). Resolver en limpieza post-Fase 4.
- [ ] Fase 4 Auth real — pausada hasta autorización explícita de Juan
- [ ] Integración Flow real (Fase 5) — `flowPlanIds` definidos en código; webhook pendiente
