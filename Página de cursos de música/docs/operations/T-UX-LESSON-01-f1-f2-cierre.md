# T-UX-LESSON-01 — Cierre F1 + F2 (Cursor)

**Fecha:** 7 Ago 2026  
**Rama:** `fix/t-ux-lesson-01-f1-f2`  
**Autorizada por:** Juan · Supervisión Fable  

---

## F1 — Mapeo Resumen PDF

### Causa raíz
Dos derivaciones del path del alumno: el carrusel (**Tarjetas**) tomaba nodos con `flattenPathNodes(modules)` y el **Resumen PDF** volvía a aplanar con `flattenPathNodesWithStep(modules)` en el componente. Aunque el orden coincidía en el caso simple, no había **una sola fuente** en el viewModel; el Resumen podía desalinear `stepNumber` vs `node.order` local (hipótesis del ticket: nodos 4–5 al final del array en H1 multi-módulo o con `order` local reiniciado).

**Escritura (/admin):** verificado en `curriculum.ts` — `updateAdminSlot` hace upsert por `{ moduleId, order: slotOrder }`; cada `guidePdfUrl` se persiste en el PathNode correcto. Bug de lectura/derivación, no de escritura.

### Archivos tocados
| Archivo | Cambio |
|---------|--------|
| `src/app/utils/path-student-entries.ts` | **Nuevo** — `flattenPathNodesWithStep`, `pathNodesFromEntries` |
| `src/app/services/gmusic-api/map-path.ts` | `PathViewModel.entries` — derivación única |
| `src/app/pages/GmusicPath.tsx` | Carrusel y Resumen consumen `viewModel.entries` |
| `src/app/components/gmusic/path/PathResumenPdfTab.tsx` | Recibe `entries` (no re-aplana) |
| `src/app/components/gmusic/path/path-node-step.ts` | Re-export desde utils |
| `src/app/components/gmusic/subscriber-path-carousel.ts` | `flattenPathNodes` delega a utils |
| `src/app/utils/path-student-entries.test.ts` | **Nuevo** — regresión 5 PDFs, nodos 4–5 |

### Evidencia
- Test regresión: `path-student-entries.test.ts` — 2 casos PASS (5 nodos H1 + viewModel).
- Verificación manual 5 PDFs: **pendiente Juan** (subir PDFs distinguibles por /admin).

---

## F2 — Fuga ID gobernanza

### Causa raíz
`LessonRunnerShell` renderizaba `footLabel` con `· id: ${currentExercise.id}` — UUID/expuesto al alumno en pestaña Práctica embebida.

### Archivos tocados
| Archivo | Cambio |
|---------|--------|
| `src/app/components/gmusic/lesson/LessonRunnerShell.tsx` | `footLabel` solo «Ejercicio N de M» |
| `src/app/components/gmusic/lesson/lesson-runner-shell.test.ts` | Guard F2 + contrato `microExerciseId` intacto |

### Evidencia grep (código renderizado al alumno)
```bash
grep -rn "D-GOV-\|T-UX-\|fase 1" src/ --include="*.tsx" --include="*.ts" --include="*.html" \
  | grep -iv "test\|spec\|__mocks__"
```
**Resultado:** 0 coincidencias en strings renderizados — solo comentarios JSDoc en routing/admin.

```bash
grep -rn "· id:" src/app/components/gmusic/lesson/LessonRunnerShell.tsx
```
**Resultado:** 0 coincidencias tras el fix.

- Recorrido manual H1: **pendiente Juan**.
- `microExerciseId` **no tocado** en payload (`lesson-runner-state.ts` intacto).

---

## Suite

| Momento | Resultado |
|---------|-----------|
| Antes | `app:test` **652/652** |
| Después | `app:test` **656/656** (+4 tests F1/F2) |
| Typecheck | OK |

---

## Confirmaciones

- [x] No mergeé a `main`
- [x] No desplegué a producción
- [x] No modifiqué contratos API ni `microExerciseId` en attempts
- [x] No toqué Prisma/schema/backend
- [x] No corrí smokes Render (coordina Juan)

## Hallazgos fuera de alcance (no tocados)

- Archivos untracked previos en `docs/roadmap/`, análisis courselit/elvis, `pathPresentation.ts` server.
- `LessonPrepareScreen` sigue usando `node.order` para stage slot en flujo overlay legacy (fuera pestaña Resumen).
