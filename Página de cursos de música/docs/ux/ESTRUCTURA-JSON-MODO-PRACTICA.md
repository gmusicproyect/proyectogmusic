# Estructura JSON — Motor de Práctica (Academia GMusic)

**Fecha:** agosto 2026 · **Versión:** v2 (corrige v1)
**Estado:** Propuesta-insumo
**Correcciones aplicadas:** evaluación de Fable (El Cerebro), 2026-08-05 — 7 discrepancias registradas y resueltas en §7.
**Léxico unificado:** Tema → **Bloque** · Clase/Tarjeta → **Etapa** (`PathNode`, `StageType`) · exerciseId → **microExerciseId**.

---

## 1. Principio rector (intacto)

> **Actualizar un ejercicio = reemplazar datos, nunca tocar UI.**

Pedagogía edita contenido; desarrollo no toca la pantalla. Este principio no era nuevo en el repo — ya existe en embrión: cada `MicroExercise` lleva un **payload** que el cliente parsea (`parse-exercise-payload.ts`). Este documento le pone nombre, schema y disciplina a esa arquitectura existente.

**Lo que cambia respecto a v1:** el canal de distribución y la publicación. No hay CDN público ni carpetas subidas a mano:

| Pieza | Qué es en realidad | Cómo se actualiza |
|---|---|---|
| **JSON de ejercicio** | El **payload** del `MicroExercise`, guardado en Postgres | Alta/edición por **`/admin`** (pipeline T-PUB-01), como todo el material |
| **Entrega al cliente** | Dentro de `exercises[]` en la respuesta de **`POST /lesson-sessions`** (real, certificado) | Automático al iniciar sesión de la etapa |
| **Congelamiento** | `LessonSession.contentSnapshot` congela el contenido por sesión | Ya existe — el ejercicio jugado no cambia a mitad de sesión |
| **Motor de renderizado** | Cliente que interpreta el payload (`parse-exercise-payload.ts` existe) | Solo si cambia el *schema* |
| **Schema** | Contrato de campos del payload, con `schemaVersion` | Desarrollo + Pedagogía |

**Por qué no CDN:** contenido pago protegido — «URLs públicas para contenido pago: prohibido». El payload viaja dentro de la sesión autenticada (cookie + snapshot). El principio rector se conserva íntegro con el pipeline existente.

---

## 2. Schema v1 del payload de ejercicio

> Forma del `payload` de `MicroExercise`. Solo campos que el runner **real** puede honrar hoy: ejercicios de **respuesta** (`selectedAnswer`, `responseTimeMs`), calificados por el servidor en el `complete`.

```json
{
  "schemaVersion": 1,
  "microExerciseId": "t1-e3-cuerdas-al-aire",
  "stageType": "PRACTICE",
  "title": "Cuerdas al aire",
  "instructions": "Selecciona la cuerda que suena / que se indica",

  "content": {
    "strings": ["E", "A", "D", "G", "B", "e"],
    "items": [
      { "prompt": "Cuerda 6 al aire", "options": ["E", "A", "D", "G"], "answer": "E" },
      { "prompt": "Cuerda 5 al aire", "options": ["E", "A", "D", "G"], "answer": "A" }
    ]
  },

  "display": {
    "fretboard": true,
    "highlightString": true
  }
}
```

### Reglas duras del schema

1. **El cliente nunca decide solo si aprobó.** La aprobación la emite únicamente el `complete` del servidor (umbral real: `accuracy ≥ 0.7` **por etapa**, fijo en backend).
2. **No existe `passAccuracy` por ejercicio.** Un umbral por ejercicio implicaría cambio de backend — es decisión de backend, no un campo que el JSON pueda prometer.
3. **No hay campos de audio en v1.** `toleranceCents`, `listenWindowMs`, `engine: pitch-detection|tuner`, `bpm` de notas cayendo, `pointsPerHit`, combos — todo eso depende de una **capacidad que no existe** (motor de audio). Vive ahora en `PROPUESTA-D-GOV-MOTOR-AUDIO.md` y solo entra al schema si esa decisión y su spike lo validan.
4. **`engine: "none"`** (etapa de solo lectura, sin ejercicio calificable) conecta con la decisión abierta del marco de clases: mínimo de ejercicios por slot para que `accuracy` signifique algo.

---

## 3. Pipeline real (verificado contra repo)

```
┌─────────────┐  /admin (T-PUB-01)  ┌──────────────────┐
│  Pedagogía  │ ──────────────────► │ Postgres:        │
│  (publica)  │   alta del payload  │ MicroExercise    │
└─────────────┘                     │ .payload (JSON)  │
                                    └────────┬─────────┘
                                             │ POST /lesson-sessions  [REAL]
                                             │ → { exercises[], expiresAt,
                                             │     contentSnapshot }
                                             ▼
                                    ┌──────────────────┐
                                    │ Cliente:         │
                                    │ parse-exercise-  │
                                    │ payload.ts       │
                                    │ → renderiza      │
                                    └────────┬─────────┘
                                             │ alumno responde
                                             │ (selectedAnswer, responseTimeMs)
                                             ▼
                                    POST /lesson-sessions/:id/complete  [REAL]
                                    → accuracy, nodeCompleted,
                                      xpEarned, currentStreak, streakUpdated
```

**Publicar un ejercicio nuevo** = alta por `/admin`. **La página no se modifica.**

---

## 4. Los 5 ejercicios de la Etapa 3 del Bloque 1 (inventario)

| # | microExerciseId | Tipo de ejercicio (runner real: respuesta) |
|---|---|---|
| 1 | `t1-e3-01-nombres-cuerdas` | Seleccionar el nombre de la cuerda señalada en el diapasón |
| 2 | `t1-e3-02-orden-cuerdas` | Ordenar las 6 cuerdas de grave a aguda |
| 3 | `t1-e3-03-identifica-sonido` | Escuchar (audio pregrabado) y elegir qué cuerda sonó |
| 4 | `t1-e3-04-memoria` | Secuencia mostrada → reproducirla eligiendo en orden |
| 5 | `t1-e3-05-repaso-mixto` | Mixto de los anteriores, contrarreloj suave (`responseTimeMs`) |

> **Nota:** «la app escucha tu guitarra» NO existe hoy. Los ejercicios son de respuesta (selección/ordenación), calificados en servidor. La variante con micrófono queda en la decisión D-GOV del motor de audio.

---

## 5. PDF de materia por tarjeta

Coincide 1:1 con lo que existe: **`guidePdfUrl` por `PathNode`**. La tabla de materias del Bloque 1 (5 PDFs, uno por etapa) es directamente usable. El PDF es **materia de estudio** (se lee fuera del ejercicio); el payload es **configuración del ejercicio** (invisible). No se mezclan.

---

## 6. Léxico unificado (obligatorio antes de cualquier ticket)

| Vocabulario de los mockups (evitar) | Modelo real del repo (usar) |
|---|---|
| Tema | **Bloque** |
| Clase / Tarjeta | **Etapa** (`PathNode`) |
| Tipo de tarjeta (Fundamento/Técnica/Práctica) | **`StageType`** |
| exerciseId (string) | **microExerciseId** |
| "El runner escucha" | El alumno responde; el servidor califica en `complete` |

---

## 7. Errata de v1 — discrepancias registradas y su resolución

| # | Discrepancia (v1) | Resolución en v2 |
|---|---|---|
| 1 | «Runner escucha la guitarra» atribuido a T-PUB-02 | **Falso — corregido.** No hay captura de audio en ninguna capa. Motor de audio → decisión D-GOV propia (`PROPUESTA-D-GOV-MOTOR-AUDIO.md`) |
| 2 | JSONs en CDN público | **Corregido.** Canal: payload por sesión autenticada; publicación por `/admin` |
| 3 | `POST /lesson-sessions` marcado como propuesto | **Corregido.** Es real y certificado; devuelve `exercises[]`, `expiresAt`, snapshot |
| 4 | `GET /lessons/:id`, `tablatureUrl`, `durationSec` | **No existen en contrato — eliminados.** La info de etapa vive entre `/me/path` y la sesión |
| 5 | `passAccuracy` por ejercicio | **Eliminado.** Umbral real del servidor: 0.7 fijo por etapa |
| 6 | Léxico Tema/Clase/Tarjeta | **Unificado** (§6) |
| 7 | Hex fuera del set verificado y tipografías <11px en mockups | Mockups quedan como referencia visual (estatus `Classroom.jsx`); no son spec de producción |

### Pendientes del doc v1 — respuestas con datos reales

| # | Pendiente | Respuesta |
|---|---|---|
| 1 | ¿Runner soporta acordes o nota única? | **Ninguna: no hay detección de audio.** Reformulado como D-GOV + spike |
| 2 | ¿Dónde viven los JSONs? | Postgres, payload de `MicroExercise`, entregado por sesión |
| 3 | ¿Quién publica? | `/admin` (pipeline certificado); flujo de revisión pedagógica = decisión de Juan |
| 4 | Validar `passAccuracy` | Pedagogía valida contra el umbral real (0.7 por etapa) |
| 5 | ¿Se congelan los ejercicios jugados? | **Ya congelados:** `contentSnapshot` por sesión |

---

## 8. Decisión abierta (no resuelta en este doc)

**Arquitectura de la pantalla de lección.** Hay tres layouts sobre la mesa: (a) tarjetas-video + pestaña Práctica (lo que existe en producción), (b) layout de 3 zonas (LESSON-01), (c) fusión CAMINO-01. Juan no ha marcado preferencia — **registrada como decisión abierta; ningún mockup nuevo debe proponer un cuarto layout.** Los mockups actuales son referencia visual, no spec.

---

*Documento de propuesta-insumo v2. Corrige v1 según dictamen de Fable (2026-08-05). Si algo aquí contradice el repo, manda el repo. Nombre del producto: Academia GMusic.*
