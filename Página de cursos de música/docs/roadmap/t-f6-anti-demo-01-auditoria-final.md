# Auditoría final — T-F6-ANTI-DEMO-01

**Fecha:** 2026-07-15  
**Rol:** auditor (solo lectura · sin implementación · sin DB · sin commit/push)  
**Mandato:** verificar corrección post-ejecutor · **no** cerrar Fase 6  

---

## 1. Veredicto

**`coherente`**

La corrección anti-demo en path suscriptor (`GET /me/path` + `/mi-camino`) elimina hardcodes engañosos de badge/focus/duration; el mock FE es opt-in explícito; Comunidad nav está bloqueada OUT MVP; estados loading/error/vacío/activo quedan cableados; F7 no abierta; worktree local sin commit/push de este ticket a remoto.

---

## 2. Evidencia por archivo

| Path | Hallazgo | OK/FAIL |
|------|----------|---------|
| `server/lib/pathPresentation.ts` | Contrato editorial: instrument mapa; level=`Module.title`; month=`Module.order`; focus=`""`; duration=`""`. Comentarios anti-demo explícitos. | **OK** |
| `server/services/meService.ts` (`buildPathResponse`) | Badge/focus/duration vía `pathPresentation`; sin `"Fundamento"` / minutos inventados. | **OK** |
| `server/services/dashboardAssembly.ts` | `pathLabel` con `moduleOrder` (Prisma), no índice de array. | **OK** |
| `server/services/coursePath.ts` | Carga PUBLISHED ordenada por `order`; sin mock. | **OK** |
| `server/tests/path-presentation.test.ts` | Cubre instrument, order→Mes, level DB, focus vacío, pathLabel, duration vacío (7 asserts de contrato). | **OK** |
| `src/app/pages/GmusicPath.tsx` | Suscriptor: `usePath` → API; estados error/vacío/loading/completo/activo; no importa `gmusic-path-data`. | **OK** |
| `src/app/hooks/usePath.ts` + `path-load.ts` | Mock **solo** si `isPathMockEnabled()`; sin fallback silencioso a mock. | **OK** |
| `src/app/services/gmusic-api/config.ts` | `VITE_USE_PATH_MOCK === "true"` estricto. | **OK** |
| `src/app/services/gmusic-api/mock-path.ts` + `gmusic-path-data.ts` | Mock residual intencional; solo flag `true`. | **OK** (residual doc.) |
| `.env.example` / `.env.ci` / `.env.t-pub-01.local` | `VITE_USE_PATH_MOCK=false` (+ comentario opt-in). | **OK** |
| `src/app/components/gmusic/GmusicInternalHeader.tsx` | Comunidad `locked: true`; modal «fuera del MVP actual»; sin `page: "community"`. | **OK** |
| `src/app/components/gmusic/path/PathModuleDivider.tsx` | Focus oculto si vacío (`focus.trim() ? … : null`). | **OK** |
| `src/app/components/gmusic/lesson/lesson-stage.ts` | `buildVisualPracticeChecklist`: prefiere `completionCriteria`; hints genéricos si no. | **OK** |
| `src/app/components/gmusic/lesson/LessonPracticeChecklist.tsx` | Copy UI: «Ayuda visual local… No se guarda ni sustituye el currículo». | **OK** |
| `docs/features/06-mi-camino.md` § Anti-demo | Contrato, mocks OFF, Comunidad, seeds, residuales; F6 no cerrada (§14). | **OK** |
| `docs/roadmap/decisiones.md` **D-F6-ANTI-DEMO** | Implementado local · no cierra D-F6-001 · F7/prod/commit autónomo = NO. | **OK** |
| `docs/roadmap/backlog.md` / `etapa-actual.md` | Ticket anti-demo CERRADO · F6 hoy **TERMINADA** (**D-F6-001**) · F7 NO. | **OK** |
| Funnel `PathDemoPage` / `mi-camino-demo` | Separado del path suscriptor (demo público ≠ producto ACTIVE). | **OK** |
| `src/app/components/gmusic/DemoPathLevelBar.tsx` | Default `levelLabel="Fundamento"` — **no** usado sin override en `GmusicPath` (pasa `viewModel.badge.level`). Residual cosmética / naming. | **OK** (riesgo bajo) |
| `server/lib/contentKind.ts` `deriveTypeLabel` | Sigue estimando minutos en **dashboard** nextPractice — documentado en `06` como residual Mi Estudio, fuera del path. | **OK** (scope documentado) |
| Git / prod | HEAD remoto sin anti-demo; cambios **locales uncommitted**; sin push/prod de este ticket. | **OK** |
| F7 | Roadmap/control: F7 **NO** abierta. | **OK** |

### Grep (señales)

| Señal | Interpretación |
|-------|----------------|
| `"Fundamento"` / `"Mes 1"` en tests / demo funnel / seeds / stage labels | Pedagógica/DB/test o demo público — **no** hardcode de badge path API real. |
| `gmusic-path-data` / `mock-path` / `usePathMock` | Solo mock FE + type import; gate `VITE_USE_PATH_MOCK`. |
| Focus hardcode en API | `resolveModuleFocus` → `""`. |

---

## 3. Riesgos pendientes

1. **Mock FE residual** — si alguien pone `VITE_USE_PATH_MOCK=true` en preview/prod, resurge verdad inventada (focus, duración, Fundamento). Mitigación: env CI/example = false + DoD deploy.  
2. **`DemoPathLevelBar` default `"Fundamento"`** — solecismo si se reusa sin `levelLabel`; path actual pasa badge real.  
3. **`deriveTypeLabel` minutos** en Mi Estudio (DT/cosmético) — no path; no reabrir under “anti-demo path” sin mandato.  
4. **`resolvePathBadgeMonth(null)` → `"Mes 1"`** — fallback seguro; UI vacío no muestra intro.  
5. **Seeds locales** con título «Fundamentos» → badge.level = título DB (verdad seed, no hardcode FE). Seeds ≠ launch.  
6. **Fase 6** al momento de esta auditoría: **D-F6-WIP / PAUSADA** — cerrar este ticket **≠** cerrar F6. **Post D-F6-001 (2026-07-15):** F6 **TERMINADA**; F7 **NO**.  
7. **Commit/push** de la corrección anti-demo aún pendientes de OK Juan (local only).

---

## 4. Recomendación

**Cerrar T-F6-ANTI-DEMO-01** (DONE LOCAL verificado).

**No** cerrar Fase 6 (`D-F6-001`).  
**No** abrir F7.  
**No** commit/push/prod en este mandato de auditoría.  

**Detenerse.**

---

## 5. Cierre formal Juan (2026-07-15)

| Campo | Valor |
|-------|-------|
| **Decisión** | **D-F6-ANTI-DEMO-001** |
| **Veredicto final** | **`coherente`** |
| **Estado ticket** | **CERRADO** (DONE LOCAL verificado) |
| **Fase 6 (al cierre ticket)** | Estaba **PAUSADA** — este ticket **≠** D-F6-001 |
| **Fase 6 (hoy)** | **TERMINADA** (**D-F6-001**, 2026-07-15) — higiene post-cierre |
| **Fase 7** | **NO** iniciada |
| **Prod / commit / push** | **NO** |

---

## Criterios de validación (checklist)

| Criterio | Resultado |
|----------|-----------|
| No tarjetas demo como producto real en path suscriptor | PASS |
| No hardcodes engañosos badge/focus/duration en API path | PASS |
| Mocks opt-in o fuera launch | PASS |
| Estados loading/error/vacío/activo | PASS |
| F7 no abierta | PASS |
| Sin señales prod/commit de este ticket | PASS (local dirty, no pushed) |
