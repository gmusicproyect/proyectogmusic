# T-UX-LESSON-01 — Ticket formal (D-UX-LAYOUT-01)

**Estado:** Handoff Cursor · **pendiente validación Fable (criterio binario)** · **NO implementar** hasta OK explícito post-validación.  
**Commit spec:** `a555f89` (revisión rúbrica Fable · 2026-08-06)  
**Frase de arranque (Juan · 2026-08-06):** `arrancar T-UX-LESSON-01`  
**Referencia visual:** `docs/ux/entregas/entrega-kimi-2026-08-05/paquete-a-leccion/` (v2 · delta 2026-08-06)  
**Propuesta insumo:** `docs/ux/propuesta-t-ux-lesson-01.md` v1.1 (Parte B pedagógica; layout = pestañas Kimi)

---

## Decisiones de arranque (plantilla Juan/Fable · 2026-08-06)

| # | Tema | Resolución |
|---|------|------------|
| ① | OK implementación | **SÍ** — autorizado tocar `src/` tras OK binario Fable |
| ② | Alcance | Ver § Alcance IN / OUT (completo, no implícito) |
| ③ | Backend | **Solo frontend** sobre APIs actuales; **cero** cambios Prisma/schema/migraciones |
| ④ | Diapasón | `contentPayload.answerInput?: "options" \| "fretboard"` — default `"options"` |
| ⑤ | `#4ADE80` (P-PALETA-01) | **NO en MVP** *(recomendación Fable; silencio Juan = adoptar)* |
| ⑥ | Entorno | **Local** (`scripts/dev/start-smoke-local.sh` + Docker `:5433`) **+ smoke final Render** cuenta QA alumno *(recomendación Fable; silencio Juan = adoptar)* |

---

## Objetivo

Entregar la **experiencia de lección en pestañas** (D-UX-LAYOUT-01) para suscriptor en `/mi-camino`, alineada al prototipo Kimi v2, **sin** prometer audio en vivo ni ampliar contratos backend.

---

## Alcance IN (completo)

1. **Tres pestañas** (shell principal; referencia `paquete-a-leccion/index.html`):
   - **Tarjetas (Mi Camino):** nodos/etapas del path con estados reales de `GET /me/path` (`completed` / `active` / `locked` / `available`); CTA a Práctica en nodo activo.
   - **Práctica:** `POST /lesson-sessions` → runner de ejercicios → `POST .../complete`.
   - **Resumen PDF:** lista expandible por etapa; PDFs privados vía signed URL.

2. **Un `videoUrl` por etapa (MVP):** renderizar el único `videoUrl` del nodo (YouTube embed **o** Supabase Storage vía signed URL). **No** tripleta Ⓡ/Ⓔ/Ⓣ; **no** migración multi-video; **no** campos nuevos en path.

3. **Diapasón permanente en Práctica:** siempre visible bajo el enunciado (como `engine.js` v2 Kimi).
   - Campo opcional en payload: `answerInput?: "options" | "fretboard"` — **default `"options"`** si ausente.
   - `"fretboard"`: cuerdas clicables = superficie de respuesta; `selectedAnswer` = identificador de cuerda **`"E" | "A" | "D" | "G" | "B" | "e"`** (string).
   - `"options"`: diapasón visible, **no** clicable; respuesta por opciones MCQ existentes.
   - **Prohibido** en producto: heurística `esDeCuerdas` (inferir fretboard por nombres de opciones).

4. **Panel gate Yousician (informacional):** visible en pestaña Práctica. Copy honesto: hoy = ejercicios de respuesta; modo «app escucha guitarra» = **D-GOV-AUDIO-01 fase 1 pendiente**. Sin micrófono, sin permisos, sin CTA que prometa audio.

5. **Parser (solo tolerancia cliente):** `parse-exercise-payload.ts` lee `answerInput` opcional del `contentPayload` ya entregado por sesión. **No** es cambio de contrato API: el servidor puede ignorar el campo; el cliente lo usa solo para UI. Ejercicios legacy sin el campo siguen en modo `"options"`.

6. **Paleta:** tokens verificados existentes (`#C9A84C`, etc.). **Sin** introducir `#4ADE80`.

7. **Tests nuevos obligatorios:**
   - Parsing `answerInput` (default, fretboard, valores inválidos → fallback seguro).
   - Guards de UI al estilo casa (tests estáticos o unitarios sobre componentes clave, patrón `path-lesson-start.test.ts` / `parse-exercise-payload.test.ts`).

---

## Alcance OUT (escrito — no implícito)

| Exclusión | Motivo |
|-----------|--------|
| **Chip / banner de racha dentro de la pantalla de lección** | Territorio **T-UX-STREAK-01**; fuente canónica pendiente; no se cuela por LESSON-01 |
| **`#4ADE80` (P-PALETA-01)** | Decisión de paleta aparte; aciertos/completados = dorado en lo shippeado |
| **Afinador en producto** | Prototipo aislado en `paquete-b-audio/afinador.html`; ticket/decisión propia |
| **Motor de audio fase 1** | Micrófono, pitch, filtros voz — gate D-GOV-AUDIO-01 |
| **Polifonía / UI lúdica Yousician** | Notas cayendo, combos calificadores, tempo game |
| **Tripleta Ⓡ/Ⓔ/Ⓣ por etapa** | Requiere schema/migración — fuera MVP |
| **Cambios server** | Prisma, routes, validación body sesión/complete, seed editorial |
| **Heurística `esDeCuerdas`** | Solo campo explícito `answerInput` |

*(El header global de la app puede seguir mostrando racha en Mi Estudio / nav — esto prohíbe chip **dentro** del shell de lección/pestañas.)*

---

## Contratos API (formas exactas — cero inventados)

Solo estos endpoints. **Ninguno nuevo.**

### `GET /api/v1/me/path`

Respuesta (formas usadas por UI):

```json
{
  "course": { "id": "uuid", "title": "string", "slug": "string", "badge": { "instrument": "string", "month": "string", "level": "string" } },
  "modules": [{
    "id": "uuid", "index": 1, "title": "string", "focus": "string",
    "nodesCompleted": 0, "nodesTotal": 5,
    "nodes": [{
      "id": "uuid", "title": "string", "order": 1,
      "status": "locked|available|active|completed",
      "duration": "string", "contentKind": "video|audio_lab|reward",
      "videoUrl": "string|null", "stageType": "FUNDAMENTO_UNO|…|TOCAR|null",
      "guideText": "string|null", "guidePdfUrl": "string|null",
      "completionCriteria": "string|null", "ctaLabel": "string|null"
    }]
  }],
  "activeNodeId": "uuid|null"
}
```

### `POST /api/v1/lesson-sessions`

Request: `{ "nodeId": "uuid" }`  
Response: `{ "sessionId", "nodeId", "status": "STARTED", "startedAt", "expiresAt", "exercises": PublicExercise[] }`  
`PublicExercise`: `{ "id", "type", "difficulty", "instruction", "contentPayload": object }` — sin secretos de calificación.

### `POST /api/v1/lesson-sessions/:sessionId/complete`

Request (**intocable**):

```json
{
  "attempts": [
    { "microExerciseId": "string", "selectedAnswer": "string", "responseTimeMs": 0 }
  ]
}
```

Response (T-PUB-02): `{ "sessionId", "status": "COMPLETED", "alreadyProcessed", "accuracy", "xpEarned", "streakUpdated", "currentStreak", "nodeCompleted", "completedAt" }`

**Regla:** este ticket **no** modifica keys, tipos ni semántica de `attempts`. `answerInput` es solo lectura UI en `contentPayload`; la calificación sigue en servidor.

### `POST /api/v1/me/media/signed-url`

Request: `{ "materialUrl": "https://…supabase.co/storage/v1/object/…" }`  
Response: `{ "signedUrl": "https://…", "expiresIn": 3600 }`  
Uso: `videoUrl` / `guidePdfUrl` en bucket privado Supabase (patrón T1 Storage).

### `GET /api/v1/me/dashboard`

**No** consumido por el shell de lección en este ticket (evita acoplar chip racha — STREAK-01).

---

## Parser `answerInput` — alcance técnico acotado

| Acción | Permitido |
|--------|-----------|
| Leer `contentPayload.answerInput` si presente y ∈ `{ "options", "fretboard" }` | Sí |
| Default `"options"` si ausente o inválido | Sí |
| Pasar a `ParsedExerciseView.interaction` (nuevo modo o flag) | Sí |
| Rechazar ejercicio por llevar `answerInput` | **No** |
| Añadir `answerInput` al schema Prisma / sanitización server | **No** |
| Cambiar forma de `attempts` en `complete` | **No** |

Verificar: `findForbiddenLessonSessionKey` **no** lista `answerInput` (no es secreto).

---

## Copy — gate Yousician (Práctica)

> **Modo escucha — próximamente**  
> Hoy practicas respondiendo en pantalla; el servidor califica al finalizar.  
> La app escuchando tu guitarra en vivo está en evaluación (D-GOV-AUDIO-01 · fase 1).  
> *No se activa el micrófono en esta versión.*

*(Fable puede ajustar tono; debe permanecer honesto.)*

---

## Proceso de implementación

1. **Validación Fable** de este spec (OK binario) → recién entonces código.
2. **Commits separados:**
   - **Código:** `feat(lesson): …` — solo `src/`, tests, estilos de producto.
   - **Docs/evidencia:** commit G1 aparte (`docs/operations/…` cierre) **solo después** del smoke humano Juan — *la lección que ya costó una vez*.
3. **Checkpoints Cursor → Juan/Fable:** tras parser+tests; tras shell pestañas; tras Práctica+complete; antes de pedir smoke.
4. **Orden sugerido:** parser → diapasón → shell 3 pestañas → Práctica+gate → integración `GmusicPath` → suite verde → smoke Juan → doc cierre G1.

---

## Criterios binarios de cierre (6/6 — sí/no + evidencia)

| # | Criterio | ¿Pasa? | Evidencia requerida |
|---|----------|--------|---------------------|
| **1** | Suscriptor ACTIVE en `/mi-camino` ve **exactamente 3 pestañas**: Tarjetas (Mi Camino) · Práctica · Resumen PDF | ☐ | Captura + test UI/guard si aplica |
| **2** | **Video MVP:** nodo con `videoUrl` YouTube → embed reproduce; nodo con `videoUrl` Supabase privado → UI llama `POST /me/media/signed-url` con `{ materialUrl }` → reproduce con `signedUrl` (o error honesto si falla firma) | ☐ | Captura + network log o test con mock de signed-url |
| **3** | **Práctica T-PUB-02:** `POST /lesson-sessions` → ejercicios → `POST .../complete` con `attempts[]` sin cambio de forma → respuesta con `accuracy`, `xpEarned`, `nodeCompleted` | ☐ | Flujo manual alumno + `app:test` verde |
| **4** | **Diapasón:** siempre visible en Práctica; ejercicio con `answerInput: "fretboard"` envía `selectedAnswer` ∈ `{E,A,D,G,B,e}`; sin `answerInput` comportamiento legacy MCQ | ☐ | Test parser + captura interacción |
| **5** | **Gate Yousician** visible en Práctica; sin micrófono; copy no promete audio | ☐ | Captura |
| **6** | **Sin regresiones operacionalizadas:** `npm run app:test` **614/614** (o total vigente en `main`) **verde**; `npm run api:test` verde si tocó proxy tipos; smokes nombrados PASS: **(a)** login ADMIN → redirige `/admin`; **(b)** alumno ACTIVE completa nodo por camino actual (mismo flujo T-PUB-02); **(c)** funnel demo `/clase-gratuita` intacto (sin rotura routing). Además: diff sin `#4ADE80`; **sin** chip racha en shell lección; **sin** cambios en `server/` | ☐ | Log CI local + checklist smoke Juan |

---

## Frases de control

**Arranque (recibida):** `arrancar T-UX-LESSON-01`  
**Cierre (Juan):** `OK T-UX-LESSON-01 — cierre con evidencia 6/6 y smoke Render PASS.`

---

## Archivos probables (orientación — no exhaustivo)

- `src/app/components/gmusic/lesson/` — shell pestañas, diapasón, gate
- `src/app/components/gmusic/path/GmusicPath.tsx`, `PathLessonRunner.tsx`
- `src/app/components/gmusic/lesson/parse-exercise-payload.ts` + `.test.ts`
- `src/app/components/gmusic/lesson/LessonRunnerShell.tsx`

**No tocar:** `server/**`, `prisma/**`, entrega Kimi en `docs/ux/entregas/`.

---

*Handoff Cursor · revisión rúbrica Fable · 2026-08-06 · Pendiente OK binario.*
