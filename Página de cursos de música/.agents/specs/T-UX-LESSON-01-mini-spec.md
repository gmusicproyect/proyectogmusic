# T-UX-LESSON-01 — Ticket formal (D-UX-LAYOUT-01)

**Estado:** Handoff Cursor · **pendiente validación Fable (criterio binario)** · **NO implementar** hasta OK explícito post-validación.  
**Frase de arranque recibida (Juan · 2026-08-06):** `arrancar T-UX-LESSON-01`  
**Referencia visual:** `docs/ux/entregas/entrega-kimi-2026-08-05/paquete-a-leccion/` (v2 delta 06/08)  
**Propuesta insumo:** `docs/ux/propuesta-t-ux-lesson-01.md` v1.1 (Parte B pedagógica; layout = pestañas Kimi)

---

## Decisiones de arranque (plantilla Juan/Fable · 2026-08-06)

| # | Tema | Resolución |
|---|------|------------|
| ① | OK implementación | **SÍ** — autorizado tocar `src/` vía ritual handoff → validación Fable → implementación → evidencia → smoke Juan → cierre |
| ② | Alcance | Pestañas **Tarjetas · Práctica · Resumen PDF** · diapasón permanente · 1 `videoUrl`/etapa (sin tripleta Ⓡ/Ⓔ/Ⓣ) · gate Yousician visible · **fuera:** audio fase 1, afinador producto, polifonía, chip racha en lección |
| ③ | Backend | **Solo frontend** sobre APIs actuales; cero schema. Parser tolera `answerInput` (④) |
| ④ | Diapasón | `contentPayload.answerInput?: "options" \| "fretboard"` — default `"options"`. `"fretboard"` → respuesta en diapasón; `selectedAnswer` = `"E"\|"A"\|"D"\|"G"\|"B"\|"e"` |
| ⑤ | `#4ADE80` (P-PALETA-01) | **NO en MVP** *(recomendación Fable; Juan no tachó — aplicar salvo corrección)* |
| ⑥ | Entorno | **Local** (`start-smoke-local.sh` + Docker :5433) **+ smoke final Render** cuenta QA *(recomendación Fable)* |

---

## Situación actual en `src/` (baseline)

| Superficie | Hoy | Gap vs Kimi v2 |
|------------|-----|----------------|
| `GmusicPath` | Carrusel `PathCarouselCards` + overlay `PathLessonRunner` | Falta shell de **3 pestañas** a nivel experiencia de bloque/lección |
| `PathLessonRunner` | Stepper Video → Ejercicio → Éxito (`SubscriberLessonStepper`) | Sustituir/evolucionar hacia pestañas D-UX-LAYOUT-01; no chip racha |
| `LessonPrepareScreen` | Video + materiales (`LessonMaterialTabs`: video/tablatura/pdf) | MVP: **un video** (`videoUrl` + signed URL); tablatura sigue «Próximamente» |
| `LessonRunnerShell` | MCQ + `RhythmTapExercise`; sin diapasón | Falta diapasón permanente + modo `fretboard` |
| `parse-exercise-payload.ts` | `interaction.mode`: `mcq` \| `tap` | Extender parser (tolerante, no rompe ejercicios existentes) |

---

## Objetivo del ticket

Entregar la **experiencia de lección en pestañas** (D-UX-LAYOUT-01) para el suscriptor en `/mi-camino`, alineada al prototipo Kimi v2, **sin** prometer audio en vivo ni ampliar schema backend.

---

## Alcance IN

1. **Shell de pestañas** (referencia `paquete-a-leccion/index.html`):
   - **Tarjetas (Mi Camino):** etapas/nodos del bloque activo con estados API (`done` / `current` / `locked`); CTA a Práctica en etapa activa.
   - **Práctica:** flujo `POST /lesson-sessions` → runner → `complete` (contratos actuales).
   - **Resumen PDF:** lista expandible por etapa con `guidePdfUrl` vía `POST /me/media/signed-url` cuando aplique.

2. **Tarjeta MVP = 1 video:** renderizar el `videoUrl` del nodo (YouTube embed o Storage firmado). **No** implementar tripleta Ⓡ/Ⓔ/Ⓣ ni migración multi-video.

3. **Diapasón permanente en Práctica:** siempre visible debajo del enunciado (como `engine.js` v2). Si `answerInput === "fretboard"`, las cuerdas son superficie de respuesta; si `"options"`, diapasón informativo/no clicable.

4. **Gate Yousician (informacional):** panel/candado en pestaña Práctica — copy honesto: ejercicios de **respuesta** hoy; modo «la app escucha tu guitarra» = **D-GOV-AUDIO-01 fase 1 pendiente**. Sin micrófono, sin CTA falso.

5. **Parser `answerInput`:** en `parse-exercise-payload.ts` — leer campo opcional; ignorar si ausente (default `options`); **no** rechazar ejercicios legacy por claves extra en payload (verificar `findForbiddenLessonSessionKey` no bloquea `answerInput`).

6. **Tokens:** dorado verificado `#C9A84C` / paleta existente — **sin** `#4ADE80` en este ticket.

7. **Tests:** extender tests de parser + layout/runner según convención existente (`parse-exercise-payload.test.ts`, tests de path/lesson).

8. **Evidencia:** capturas local + checklist binario; smoke Render post-merge con OK Juan.

---

## Alcance OUT (explícito)

- Motor de audio fase 1, micrófono, pitch en producto
- Afinador en producto (`afinador.html` queda en entrega docs)
- Polifonía / notas cayendo / combos como calificador
- Chip de racha dentro de la lección (T-UX-STREAK-01)
- Tripleta de videos por etapa / cambios Prisma o seed de contenido
- `#4ADE80` (P-PALETA-01 abierta)
- Heurística `esDeCuerdas` — prohibida en producto; solo `answerInput`

---

## APIs (sin cambios de contrato)

| Endpoint | Uso |
|----------|-----|
| `GET /api/v1/me/path` | Tarjetas, estados, `videoUrl`, `guidePdfUrl` |
| `POST /api/v1/lesson-sessions` | Crear sesión al entrar Práctica |
| `POST /api/v1/lesson-sessions/:id/complete` | Calificación servidor |
| `POST /api/v1/me/media/signed-url` | Video/PDF privados |

`attempts[]`: sin cambio — `{ microExerciseId, selectedAnswer, responseTimeMs }`.

---

## Copy sugerido — gate Yousician (Práctica)

> **Modo escucha — próximamente**  
> Hoy practicas respondiendo en pantalla; el servidor califica al finalizar.  
> La app escuchando tu guitarra en vivo está en evaluación (decisión D-GOV-AUDIO-01 · fase 1).  
> *No se activa el micrófono en esta versión.*

*(Fable puede ajustar tono; debe permanecer honesto y no prometer audio.)*

---

## Archivos probables

**Nuevos / refactor:**
- Shell pestañas lección (componente bajo `src/app/components/gmusic/lesson/` o `path/`)
- `FretboardExercise` (o equivalente) + integración en `LessonRunnerShell`
- Gate panel Yousician (componente estático)

**Modificar:**
- `GmusicPath.tsx` — integrar shell pestañas vs solo modal runner
- `PathLessonRunner.tsx` — alinear o delegar al shell de pestañas
- `parse-exercise-payload.ts` + types + tests
- `LessonRunnerShell.tsx` — diapasón permanente
- Estilos/tokens existentes (sin verde P-PALETA)

**No tocar:** server routes, Prisma, streak UI en header global, Paquete B en docs.

---

## Orden de implementación sugerido

1. Parser `answerInput` + tests (base segura)
2. Componente diapasón + wire en runner
3. Shell 3 pestañas (estructura + Tarjetas + PDF)
4. Práctica + gate Yousician + sesión/complete
5. Integración `GmusicPath` / salida del runner legacy
6. Suite `app:test` + evidencia local
7. Smoke Render (Juan)

---

## Criterios binarios de cierre (6/6)

| # | Criterio | Verificación |
|---|----------|--------------|
| 1 | Suscriptor ACTIVE en `/mi-camino` ve **3 pestañas** Tarjetas · Práctica · Resumen PDF | Smoke manual o test de integración UI |
| 2 | Etapa activa: **un video** reproduce (YouTube o signed Storage) o estado vacío honesto | Nodo con `videoUrl` en path |
| 3 | Práctica: sesión → ejercicios → `complete` sin regresión T-PUB-02 | `app:test` + flujo manual |
| 4 | Diapasón **siempre visible** en Práctica; con `answerInput: "fretboard"` la cuerda tocada envía `selectedAnswer` válido | Payload de prueba en seed o fixture |
| 5 | Panel gate Yousician visible en Práctica; **sin** micrófono ni copy engañoso | Inspección UI |
| 6 | **Sin** `#4ADE80` nuevo · **sin** chip racha en lección · **sin** cambios API/schema | Diff + grep |

---

## Frase de control post-implementación (Juan → cierre)

> OK T-UX-LESSON-01 — cierre con evidencia 6/6 y smoke Render PASS.

---

*Handoff generado por Cursor · 2026-08-06 · Pendiente dictamen Fable.*
