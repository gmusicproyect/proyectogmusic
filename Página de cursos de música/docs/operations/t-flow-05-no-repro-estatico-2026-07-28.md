# T-FLOW-05 — Análisis estático sin repro (28 Jul 2026)

**Ticket:** Maximum update depth `GmusicPath` (R-009 A2) · **Base:** `main@7f70cfd`
**Método:** revisión exhaustiva de effects/memos/callbacks en `GmusicPath.tsx`, `usePath.ts`, `PathCarouselCards.tsx` (entorno cloud sin runtime React — repro de navegador imposible aquí).

## Effects auditados — veredicto

| Ubicación | Effect | Veredicto |
|-----------|--------|-----------|
| GmusicPath | cleanup abort `[]` | Seguro (sin setState) |
| GmusicPath | `handleStartNode` | Seguro — guard `lessonStartInFlightRef` + AbortController |
| usePath | `load` `[load]` con `useCallback([])` | Seguro — generation manager + dispose |
| PathCarouselCards L116 | sync `focusedIdx` ← `initialFocusIndex` | Seguro — deps del padre son `useMemo` estables; `goTo` no las altera |
| PathCarouselCards L120 | **stage-fit + ResizeObserver → `setStageDesktopFit`** | **CANDIDATO CONDICIONAL** (ver abajo) |
| PathCarouselCards L149 | `useLayoutEffect` scrollTo | Seguro (sin setState) |
| PathCarouselCards L165 | scrollIntoView | Seguro (sin setState) |
| PathCarouselCards L173 | matchMedia reduced-motion `[]` | Seguro |

## Candidato único: oscilación stage-fit ↔ ResizeObserver

`setStageDesktopFit(shouldStageContainerFit(...))` corre en cada resize del contenedor.
React descarta setState de igual valor, así que el loop **solo** es posible si el toggle
de fit **cambia el ancho del contenedor** cruzando el umbral (`estimateStageRowWidth + 14px`)
→ RO dispara → vuelve a togglear. Depende de viewport/nº de nodos: consistente con que
R-009 A2 solo aparezca en runtime y no en revisión estática.

## Receta de repro para dev (Juan)

1. `npm run dev` + React StrictMode · path con ≤ 8 nodos (`STAGE_FIT_MAX_NODES`).
2. Viewport desktop cerca del umbral de fit (~ancho fila estimada): redimensionar ventana
   lentamente alrededor de ese punto y/o abrir DevTools (cambia el ancho).
3. Navegación rápida de nodos (flechas del carrusel) mientras se redimensiona.
4. Si aparece «Maximum update depth exceeded», el stack debería señalar el effect L120.

## Fix propuesto SOLO si se confirma repro (no aplicado — mandato: fix solo con repro)

En `updateFit`: comparar contra el valor actual antes de `setStageDesktopFit`
(functional update con bail explícito) y/o desacoplar con `requestAnimationFrame`
+ histéresis de ±14px en el umbral para impedir el cruce oscilante.

**Estado:** ABIERTO · sin repro estático 28 Jul 2026 · runtime pendiente.
