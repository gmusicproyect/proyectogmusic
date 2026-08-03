# T-FLOW-05 — Maximum update depth en `GmusicPath.tsx` (post R-009)

**Estado:** **Cerrado** — **no repro runtime 2026-08-02** (snippet v2 aria-label en `/mi-camino`; 2 pasadas; sin Maximum update depth) · sin repro estático 28 Jul · fix PathCarouselCards no aplicado  
**Prioridad:** Baja (runtime UX / estabilidad consola)  
**Fecha:** 6 Jul 2026  
**Detectado en:** Validación R-009 punto A2 — warnings en consola reproducidos en pantalla

---

## Síntoma

Al usar `/mi-camino` (carrusel + iniciar lección / volver al camino), la consola del browser reporta:

```text
Warning: Maximum update depth exceeded. This can happen when a component
calls setState inside useEffect, but useEffect either doesn't have a
dependency array, or one of the dependencies changes on every render.
```

Asociado al flujo post **R-009** (video-first + `PathLessonRunner`).

---

## Impacto

- Ruido en consola y riesgo de degradación de rendimiento en dispositivos lentos.
- No bloquea piloto materia ni deploy; sí afecta confianza en QA visual.
- Diagrama: `docs/flows/02-mi-camino-suscriptor.md`.

---

## Hipótesis

1. `useEffect` en `GmusicPath.tsx` que sincroniza `lessonSession` → `setActiveRunner` con dependencias inestables (`viewModel?.modules`).
2. Ciclo refresh path (`usePath`) + estado runner al cerrar sesión.
3. Interacción carrusel focus index + re-fetch tras `complete`.

---

## Criterio de cierre

- [x] Repro documentado: **no repro runtime 2026-08-02** (snippet v2 aria-label; 2 pasadas; sin Maximum update depth) — ver `t-flow-05-no-repro-estatico-2026-07-28.md`.
- [x] Fix acotado: **N/A** — sin repro; PathCarouselCards no tocado (mandato).
- [x] Diagrama 02: **N/A** en cierre por no-repro (sin cambio de código).

---

## Archivos probables

| Archivo | Rol |
|---------|-----|
| `src/app/pages/GmusicPath.tsx` | `useEffect` líneas ~105–117 (`setActiveRunner`) |
| `src/app/hooks/usePath.ts` | Refresh tras complete |
| `src/app/components/gmusic/path/PathLessonRunner.tsx` | Callback `onSessionCompleted` |

---

## Asignación sugerida

**Cursor** — ciclo bugfix acotado post-piloto materia.  
**No mezclar** con T-FLOW-02 (PDF) ni Fase F.
