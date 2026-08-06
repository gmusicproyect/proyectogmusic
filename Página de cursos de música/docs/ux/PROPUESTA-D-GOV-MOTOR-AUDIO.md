# Decisión D-GOV — Motor de Audio (experiencia tipo Yousician)

**Producto:** Academia GMusic
**Fecha:** agosto 2026
**Estado:** Fase 0 **completada** (2026-08-06) — **pase con reserva** (falsos positivos voz). Resolución spike emitida por Juan 2026-08-05; veredicto manual 2026-08-06. Nota de procedencia: una versión previa de este doc traía la resolución pre-escrita antes de ser emitida; queda registrado como discrepancia corregida.
**Origen:** Evaluación de Fable sobre `ESTRUCTURA-JSON-MODO-PRACTICA.md` — el doc asumió un runner que «escucha la guitarra»; esa capacidad **no existe** en ninguna capa del producto. Esta decisión la crea como proyecto propio, con expectativas honestas.

---

## 1. La decisión

> **¿Academia GMusic construye un motor de audio en cliente** (micrófono + análisis de pitch en tiempo real) **que permita ejercicios donde la app escucha la guitarra del alumno?**

**Resolución de Juan:** Sí, se abre como proyecto — con **spike de viabilidad primero**, antes de comprometer un solo campo de schema, un solo ejercicio o una sola promesa de UI.

---

## 2. Por qué es un proyecto y no una extensión

Lo que existe hoy (certificado, T-PUB-02): el alumno **responde** ejercicios (`selectedAnswer`, `responseTimeMs`) y el servidor califica en el `complete`. No hay micrófono, ni pitch detection, ni afinador, ni detección de acordes.

Lo que la experiencia tipo Yousician requiere construir desde cero:

| Capacidad | Dificultad honesta |
|---|---|
| Permiso y captura de micrófono (Web Audio API) | Baja — estándar de navegador |
| Pitch detection **monofónica** (una cuerda a la vez) | Media — algoritmos conocidos (autocorrelación, YIN); viable en browser |
| Latencia suficiente para juego rítmico (<100 ms) | Media — depende del dispositivo; tablets son el riesgo |
| Detección **polifónica** (acordes completos: Em, Am…) | **Alta** — problema genuinamente difícil, incluso para productos dedicados |
| Robustez con ruido ambiente / guitarra desafinada | Media-alta — trabajo de filtrado y umbrales |

---

## 3. Alcance del spike (fase 0 — antes de cualquier compromiso)

**Objetivo:** responder con evidencia si la detección monofónica en browser es suficientemente buena para sostener UN ejercicio real.

**Construir:** prototipo mínimo, fuera del producto:

1. Captura de micrófono con Web Audio API.
2. Pitch detection monofónica (YIN o autocorrelación).
3. Una sola pantalla de prueba: «toca la cuerda E al aire» → detecta y confirma.
4. Probar en los dispositivos reales del alumno objetivo: **Mac y tablet** (el setup conocido de Juan).

**Criterios de éxito (binarios — pasa o no pasa):**

| Criterio | Umbral |
|---|---|
| Precisión de detección en cuerda al aire | ≥ 90% de aciertos en ambiente casero normal |
| Latencia percibida | < 100 ms en Mac; < 150 ms en tablet |
| Tasa de falsos positivos (ruido ambiente tomado como nota) | < 10% |
| Funciona sin instalar nada (solo navegador) | Sí/No |

**Explícitamente FUERA del spike:** polifonía (acordes), tempo/juego rítmico de notas cayendo, combos, afinador. Si el spike pasa, eso se evalúa como fase 2 con sus propios criterios.

---

## 4. Fases (stage-gate — cada fase requiere la anterior aprobada)

| Fase | Qué | Gate |
|---|---|---|
| **0 · Spike** | Prototipo de detección monofónica (§3) | ¿Pasa los 4 criterios? Si no → se archiva con dignidad, el producto sigue con ejercicios de respuesta |
| **1 · Un ejercicio real** | Un `StageType` nuevo («escucha») con 1 ejercicio de cuerdas al aire, dentro del flujo `complete` real | ¿Un alumno real lo completa sin frustración? |
| **2 · Expansión** | Afinador interactivo, más etapas | Decisión con métricas de fase 1 |
| **3 · Polifonía / juego rítmico** | Acordes, notas cayendo, combos | Solo si 1 y 2 lo justifican — expectativas honestas: puede que nunca sea viable en browser |

---

## 5. Reglas de gobernanza mientras tanto

1. **Nada de audio entra al schema v1 del payload.** Los campos `toleranceCents`, `listenWindowMs`, `engine`, `bpm` de juego, `pointsPerHit`, combos — todos quedan congelados hasta que el spike los valide.
2. **El `complete` sigue siendo el único que califica.** Aunque exista el motor de audio, el juego da *feedback*; la aprobación y el XP los emite el servidor.
3. **Los mockups con notas cayendo y combos** quedan como referencia visual de la ambición — no como spec. No se implementa UI lúdica antes de la fase 1.
4. **Los documentos ya corregidos** (`ESTRUCTURA-JSON-MODO-PRACTICA.md` v2, `PROPUESTA-T-UX-LESSON-01.md` v1.1) reflejan la realidad: ejercicios de respuesta. Esta decisión no los reabre.

---

## 6. Riesgos

| Riesgo | Mitigación |
|---|---|
| El spike falla y se perdió tiempo | El spike es barato (días, no semanas) y binario; si falla, el producto no pierde nada — ya funciona con ejercicios de respuesta |
| Polifonía prometida antes de tiempo | Fase 3 explícitamente condicionada; ningún material de marketing menciona «toca y la app te escucha» hasta fase 2 aprobada |
| Latencia mala en tablets | Criterio de spike específico por dispositivo (§3) |
| El alumno desafinado «falla» ejercicios injustamente | Fase 1 incluye tolerancia y mensaje de «afina primero» (conecta con la tarjeta 2: Afina y posturea) |

---

## 7. Veredicto fase 0 (2026-08-06)

**Prueba:** Juan · Mac · localhost:8000 · Paquete B (`PRUEBA-EN-5-PASOS.md`).

| Criterio | Resultado |
|---|---|
| Precisión cuerda al aire (≥90%) | **Pase** — 6 cuerdas; mayoría en rango |
| Latencia (<100 ms Mac) | **Pase** — reconocimiento inmediato al tocar |
| Falsos positivos (<10%) | **No pase** — voz humana dispara detección de tono |
| Solo navegador | **Pase** |

**Conclusión:** detección monofónica **viable**; filtrado voz/ruido **requerido** antes de fase 1. Tablet sin evidencia en esta sesión.

**Evidencia:** `docs/ux/entregas/entrega-kimi-2026-08-05/paquete-b-audio/VEREDICTO-SPIKE-2026-08-06.md`

---

*Decisión D-GOV registrada. Fase 0 completada 2026-08-06 (pase con reserva). Nombre del producto: Academia GMusic.*
