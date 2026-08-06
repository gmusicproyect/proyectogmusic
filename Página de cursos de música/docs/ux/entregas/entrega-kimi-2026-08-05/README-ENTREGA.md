# README-ENTREGA — Paquete Academia GMusic (2026-08-05 · delta 2026-08-06)

**«Todo lo afirmado en este README está en el código de este ZIP.»**

**Qué es esto:** prototipo de referencia, navegable y autónomo, de la experiencia de lección mostrada en el preview. **No es código para pegar en `src/`** — si se aprueba, entra al producto por el canal del repo con su propio ticket.

---

## 1 · Cómo abrirlo

**Paquete A** (`paquete-a-leccion/`): doble click en `index.html`. Sin build, sin servidor, sin llamadas de red. Los datos MOCK van embebidos en `js/api-mock.js` (espejo de `data/*.json`, embebido para que funcione desde `file://`).

**Paquete B** (`paquete-b-audio/`): necesita localhost por el micrófono — ver `PRUEBA-EN-5-PASOS.md`. Incluye dos prototipos: `index.html` (spike de detección por cuerda) y `afinador.html` (afinador guiado E→A→D→G→B→e).

**Dependencias:** cero. Sin CDNs, sin frameworks, sin código minificado ni ofuscado.

---

## 2 · Tabla de funcionalidades (REAL / SIMULADO / NO INCLUIDO)

| Funcionalidad | Estado | Dónde está en el código |
|---|---|---|
| 3 pestañas: Tarjetas · Práctica · Resumen PDF | **REAL** | `paquete-a-leccion/index.html`; navegación en `js/app.js` → `bindTabs()` |
| Tarjetas = etapas con videos Ⓡ Ⓔ Ⓣ, estados DONE/CURRENT/LOCKED | **REAL** (sobre datos MOCK) | `js/app.js` → `renderCards()` |
| Resumen PDF expandible por etapa (`guidePdfUrl`) | **REAL** (sobre datos MOCK) | `js/app.js` → `renderPdfList()` |
| Chip de racha leyendo `streak.currentDays` de `/me/dashboard` | **REAL** (contra ApiMock) | `js/app.js` → `refreshDashboard()` |
| Práctica: sesión creada con la forma `POST /lesson-sessions {nodeId}` → `{sessionId, expiresAt, exercises[]}` | **REAL** (contra ApiMock) | `js/engine.js` → `start()`; contrato en `js/api-mock.js` → `createSession()` |
| Ejercicios llegan por sesión autenticada (nunca CDN público) | **REAL** (diseño aplicado) | los ejercicios viven dentro de la sesión: `js/api-mock.js` → `createSession()` |
| 5 ejercicios de respuesta en el mismo cuadro (selección, diapasón, ordenar, audio pregrabado, tocar cuerda) | **REAL** | `js/engine.js` → `renderExercise()` y los `render*` por tipo |
| Guitarra interactiva (diapasón) SIEMPRE visible en Práctica; si el ejercicio pregunta por una cuerda, se responde tocándola en pantalla | **REAL** (ajuste 2026-08-06 a solicitud de Juan) | `js/engine.js` → `renderExercise()` (diapasón permanente) y `renderDiapason()` (modo clicable) |
| Registro de respuestas `{microExerciseId, selectedAnswer, responseTimeMs}` | **REAL** | `js/engine.js` → `answer()` |
| `complete` con la forma real; el "servidor" (ApiMock) calcula accuracy, umbral 0.7, XP, racha | **REAL** (contra ApiMock) | `js/api-mock.js` → `complete()` |
| Celebración de racha SOLO si `streakUpdated === true`; `alreadyProcessed` no re-suma | **REAL** (contra ApiMock) | `js/engine.js` → `showResult()`; lógica en `api-mock.js` → `complete()` |
| Puntos y combo durante el juego | **SIMULADO** (fórmula visual de utilería: +20 por acierto visual; no califica ni es XP) | `js/engine.js` → `answer()` (comentario en código) |
| Audio del ejercicio 4 («escucha y elige») | **SIMULADO** (placeholder sin archivo; en producción: audio pregrabado por enlace firmado) | `js/engine.js` → `renderAudioFake()` |
| Videos de las tarjetas y PDFs | **SIMULADO** (se muestran como «enlace firmado (1 h)», sin archivos reales) | `data/bloque-1.json` |
| Detección de pitch por micrófono (monofónica, spike fase 0) | **REAL en paquete B** (prototipo aislado; NO integrado al Paquete A ni al producto) | `paquete-b-audio/js/pitch.js` → `autoCorrelate()` |
| Afinador guiado por cuerda: empieza en E (6ª), aprueba con ±10 cents sostenidos 1 s, avanza solo A→D→G→B→e | **REAL en paquete B** (agregado 2026-08-06 a solicitud de Juan; mismo motor monofónico del spike; NO califica, NO guarda datos, NO integrado al Paquete A ni al producto — poner «1 afinador por habilidad» en producción requeriría su propio ticket/decisión) | `paquete-b-audio/afinador.html` (reusa `js/pitch.js`) |
| Detección de acordes (polifonía), notas cayendo a tempo | **NO INCLUIDO** (fuera del alcance del spike fase 0 — decisión D-GOV) | — |
| Conexión al backend real | **NO INCLUIDO** (toda la API es MOCK con las formas de contrato) | `js/api-mock.js` |

---

## 3 · Contratos respetados

- **Léxico oficial** en modelo de datos: `Bloque` → 5 `Etapas` (`stageType`: FUNDAMENTO_UNO, FUNDAMENTO_DOS, TECNICA, PRACTICA, TOCAR) → `PathNode` con `videoUrl`/`guidePdfUrl` → `MicroExercise[]` con `microExerciseId`. «Tarjeta» solo como palabra visual de UI.
- **El cliente nunca califica:** `accuracy`, `xpEarned`, `nodeCompleted`, umbral 0.7 y racha se calculan en `api-mock.js` (que simula el servidor). El cliente solo envía `attempts` y muestra.
- **Sin lógica de día en cliente:** el incremento de racha (1 vez por día) vive en `api-mock.js` → `complete()`.
- **Contenido pago:** todo video/PDF/audio se muestra como «enlace firmado (1 h)». Ninguna URL pública.
- **Tokens de color:** solo los verificados (`#080808`, `#111111`, `rgba(255,255,255,0.06)`, `#C9A84C` + alphas, `#F5F0E8`, `#8A8A8A`). Tipografía mínima 11px.

### Propuesta de paleta — pendiente decisión (declarada, no mezclada en silencio)

| Color | Uso en el prototipo |
|---|---|
| `#4ADE80` (verde) | Combo/aciertos del feedback visual, checks de ejercicios completados y zona «afinada» del afinador (`afinador.html`) |

---

## 4 · Endpoints propuestos (marcados, no presentados como existentes)

Ninguno. Todo el prototipo usa únicamente los cuatro contratos reales listados en la instrucción (`POST /lesson-sessions`, `POST .../complete`, `GET /me/path`, `GET /me/dashboard`).

## 5 · Estructura del ZIP

```
entrega-kimi-2026-08-05/
├── README-ENTREGA.md            ← este archivo
├── paquete-a-leccion/
│   ├── index.html               ← autónomo, doble click
│   ├── css/styles.css           ← tokens verificados + 1 excepción declarada
│   ├── js/api-mock.js           ← "servidor" MOCK con las formas de contrato reales
│   ├── js/engine.js             ← flujo de Práctica: sesión → 5 ejercicios → complete
│   ├── js/app.js                ← pestañas, tarjetas, hero, Resumen PDF
│   └── data/                    ← datos MOCK rotulados (_MOCK en cada archivo)
│       ├── bloque-1.json
│       ├── dashboard.json
│       └── ejercicios-etapa-3.json
└── paquete-b-audio/             ← spike fase 0, aislado del Paquete A
    ├── index.html               ← spike: detección por cuerda
    ├── afinador.html            ← afinador guiado E→A→D→G→B→e (reusa pitch.js)
    ├── js/pitch.js              ← autocorrelación monofónica (real)
    └── PRUEBA-EN-5-PASOS.md
```

---

## 6 · Discrepancias registradas (no bloquean el archivo; alinear en implementación)

| # | Discrepancia | Nota |
|---|---|---|
| 1 | `api-mock.js` → `complete()` pone `xpEarned = 0` si `nodeCompleted = false` | Contrato certificado T-PUB-02: `xpEarned = round(accuracy · 100)` **sin** ese gate. Alinear cuando nazca el ticket de implementación. |
| 2 | `#4ADE80` (verde acierto) | Propuesta de paleta — pendiente decisión de Juan (ver §3). |
| 3 | `engine.js` → heurística `esDeCuerdas` (guitarra clicable inferida si las opciones son nombres de cuerda) | Válida en prototipo. En **producto** debe ser un **campo explícito del payload del ejercicio** (p. ej. `interactiveFretboard: true`), no una inferencia — anotar en T-UX-LESSON-01 / schema cuando «arrancar». |

---
