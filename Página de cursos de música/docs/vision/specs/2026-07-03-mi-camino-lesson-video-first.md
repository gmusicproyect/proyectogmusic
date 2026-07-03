# Ticket R-009 — Mi Camino: lección video-first (suscriptor)

**Fecha:** 3 Jul 2026  
**Estado:** Borrador — pendiente registro D-GOV-18 + OK Juan  
**Track:** A (Vite + Express + Prisma)  
**Relacionado:** R-008 Admin · D-GOV-04 (5 etapas) · **No** es D-GOV-17  
**Skill Cursor:** `gmusic-path` + `gmusic-funnel-conversion` (referencia demo) + `gmusic-verification`

---

## Problema (validado Juan + código)

Al pulsar **Iniciar lección** en `/mi-camino`, el suscriptor entra directo a **Práctica guiada** (quiz), sin fase de video. La UI mezcla sensación de “camino + ejercicio” y muestra detalles técnicos (ID de sesión) no aptos para alumno.

**Referencia correcta ya existente:** `DemoLessonPage.tsx` y `FreeFundamentoLessonPage.tsx` → fases `video → exercise → success`.

**Gap técnico:** `PathNode.videoUrl` se guarda en admin pero **no llega** al flujo suscriptor (`GmusicPath` → `PathLessonRunner` → `LessonRunnerShell`).

---

## Objetivo (MVP acotado)

Una lección suscriptor debe sentirse como **clase**, no como panel de QA:

```text
Iniciar lección
  → [1] Video (pantalla dedicada, fullscreen)
  → [2] Práctica guiada (ejercicios actuales)
  → [3] Cierre mínimo (XP/resumen — reutilizar submission success existente)
  → Volver al camino (una sola salida clara)
```

**Fuera de alcance en este ticket:** rediseño completo del runner, broadcast, nuevas mecánicas de cierre gamificado, PDF en lección.

---

## Decisiones de producto (defaults — Juan puede ajustar)

| # | Decisión | Default propuesto |
|---|----------|-------------------|
| D1 | ¿Obligatorio ver video antes del quiz? | **Sí** — botón “Continuar al ejercicio” solo tras marcar visto (mismo patrón que demo) |
| D2 | ¿Sin `videoUrl` en la etapa? | Saltar fase video → ir directo a práctica (no bloquear lección legacy seed) |
| D3 | ¿Mostrar ID de sesión al alumno? | **No** — ocultar en UI suscriptor |
| D4 | ¿Camino visible durante la lección? | **No** — overlay/página dedicada ocupa 100% viewport; al salir, vuelve al carrusel |

---

## Rutina de implementación (Cursor)

### 1. Datos — exponer video al cliente suscriptor

**Opción preferida (mínimo diff):** extender `GET /api/v1/me/path` → cada nodo incluye `videoUrl: string | null` (desde `PathNode.videoUrl`, solo https).

Alternativa: incluir `videoUrl` en respuesta de `POST /api/v1/lesson-sessions`. Elegir **una** fuente; no duplicar.

Archivos probables:
- `server/services/meService.ts` (`buildPathResponse`)
- `src/app/services/gmusic-api/types.ts` (`PathNodeResponse`)
- `src/app/services/gmusic-api/map-path.ts`

Tests: ampliar `map-path.test.ts` o test server de path si existe.

### 2. UI — fases en suscriptor (reutilizar demo)

Crear componente compartido o adaptar patrón de `DemoLessonPage`:

- Nuevo wrapper p.ej. `SubscriberLessonFlow.tsx` **o** extender `PathLessonRunner.tsx`
- Fases: `"video" | "practice" | "complete"`
- Reutilizar `VideoPlayerLesson` (`src/app/components/dashboard/VideoPlayerLesson.tsx`)
- Fase practice: contenido actual de `LessonRunnerShell` (sin header “Práctica guiada” + session ID visible)
- Fase complete: mantener `LessonRunnerFinishedState` / submission existente

Archivos probables:
- `src/app/components/gmusic/path/PathLessonRunner.tsx`
- `src/app/pages/GmusicPath.tsx` (pasar `videoUrl` + `nodeTitle` al abrir runner)
- `src/app/components/gmusic/lesson/LessonRunnerShell.tsx` (props para ocultar chrome técnico en modo suscriptor)

### 3. UX — fixes obligatorios del ticket

- [ ] Fullscreen real: `fixed inset-0 z-50`, **sin** carrusel del camino visible detrás (scroll lock en body si hace falta)
- [ ] Quitar o acortar copy “Sesión 79afe525…” del header alumno
- [ ] Un solo CTA principal por fase (Video: “Continuar al ejercicio”; Practice: “Siguiente” / “Finalizar”)
- [ ] “Volver al camino” secundario (outline), no competir visualmente con el CTA dorado
- [ ] Stepper 3 fases (Video · Ejercicio · Éxito) — copiar patrón visual de `DemoLessonPage` stepper, tokens Obsidian & Gold

### 4. Legacy / seed

Nodos seed sin `videoUrl` → flujo **practice-only** (comportamiento actual), sin regresión.

Nodos admin con `videoUrl` YouTube → embed seguro (misma validación que admin `normalizeMaterialUrl` / `extractYoutubeId`).

---

## Verificación

```bash
npm run verify
```

**Smoke manual (obligatorio reportar en cierre):**

1. Activar alumno demo local → `/mi-camino`
2. Nodo **con** video en admin (cuando exista) → Iniciar lección → **video primero** → ejercicio → cierre → camino
3. Nodo seed **sin** video → Iniciar lección → ejercicio directo (sin pantalla vacía)
4. Durante lección: **no** se ve el carrusel de 5 tarjetas detrás
5. Tras “Volver al camino”: progreso refresca (`path.retry`)

---

## Criterio de salida

- Tests en verde + build OK
- Flujo video-first funcional para nodos con `videoUrl`
- Legacy seed sin video sin regresión
- Sin session ID visible en UI alumno
- Reporte con capturas o descripción de smoke manual

---

## Commits

Un commit lógico, mensaje sugerido:

```text
feat(path): lección suscriptor video-first antes de práctica guiada

Conecta PathNode.videoUrl al flujo Mi Camino; reutiliza patrón demo
video → ejercicio → cierre. Oculta chrome técnico del runner.
```

**Push:** solo con OK explícito de Juan.

---

## Registro gobernanza (Opus)

Registrar como **D-GOV-18** en `.agents/DECISIONS.md`:

> Mi Camino suscriptor sigue flujo demo: video obligatorio cuando hay URL; práctica después; cierre mínimo. Runner actual ejercicio-only es superseded para suscriptor.

---

## Handoff Opus → Cursor

```
Retomar Gmusic — Ticket R-009 video-first Mi Camino
Spec: docs/vision/specs/2026-07-03-mi-camino-lesson-video-first.md
Skill: gmusic-path
No tocar: admin, auth, routing global, D-GOV-17
Verificar: npm run verify + smoke manual § arriba
```
