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

## Suite — desglose del delta (obligatorio)

### Conteos verificados en esta máquina (2026-08-07)

| Ref | Comando | Resultado |
|-----|---------|-----------|
| `main` (ee3072b, checkpoint 5) | `npm run app:test` | **652/652** |
| `fix/t-ux-lesson-01-f1-f2` | `npm run app:test` | **656/656** |
| Delta de esta rama | | **+4** tests (`it(...)`) |

**No es +15.** Si alguien ve 641→656, ese salto **no** viene de F1/F2: 641→652 ya estaba en `main` por checkpoints previos de T-UX-LESSON-01; F1/F2 solo aportan **+4** sobre 652.

### Los 4 tests nuevos — nombrados (evidencia de cierre)

| ID | Archivo | Nombre del `it(...)` | Criterio |
|----|---------|----------------------|----------|
| F1-a | `src/app/utils/path-student-entries.test.ts` | `5 nodos H1: mismo orden, stepNumber global y guidePdfUrl 1:1 en entries` | Aceptación F1: 5 PDFs, nodos 4–5 |
| F1-b | `src/app/utils/path-student-entries.test.ts` | `mapPathToViewModel expone entries alineadas con el carrusel` | Una sola fuente viewModel (multi-módulo) |
| F2-a | `src/app/components/gmusic/lesson/lesson-runner-shell.test.ts` | `footLabel no expone microExerciseId ni id de ejercicio al alumno` | UI sin ID interno |
| F2-b | mismo | `payload de attempts conserva microExerciseId (contrato intacto)` | No tocar contrato attempts |

Además (sin sumar `it` nuevo): `path-lesson-tabs.test.ts` actualizó aserciones CP3 para exigir `entries` / prohibir re-aplanar en Resumen.

### Regresión T-FLOW-04 (confirmación literal)

- Archivo: `src/app/pages/t-flow-04-fin-camino.test.ts`
- Diff vs `main`: **0 bytes** (archivo intacto)
- Sigue con **5** `it(...)`:
  1. `panel usa título y frase canónicos del mandato`
  2. `CTA primario → mi-estudio · CTA secundario → revisión`
  3. `panel vive en la pestaña Tarjetas cuando el camino está completo`
  4. `carrusel se remonta en revisión sin habilitar replay`
  5. `las 3 pestañas siguen visibles con camino completo (no se oculta el shell)`
- Ejecución aislada en esta rama: **5/5 PASS** (junto a F1/F2: 40/40 en el lote local)

`GmusicPath.tsx` sí se tocó (consume `viewModel.entries`), pero las aserciones de T-FLOW-04 sobre panel/carrusel/shell **siguen pasando**.

| Momento | Resultado |
|---------|-----------|
| Antes (`main`) | `app:test` **652/652** |
| Después (rama F1/F2) | `app:test` **656/656** (+4 nombrados arriba) |
| T-FLOW-04 | **5/5** PASS, archivo sin cambios |

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
