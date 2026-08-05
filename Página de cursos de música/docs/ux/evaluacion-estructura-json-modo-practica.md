# EVALUACIÓN — Estructura JSON del Modo Práctica + paquete de lección (agosto 2026)

**Fecha:** 2026-08-05 · **Evalúa:** Fable (El Cerebro) · **Estado del insumo:** propuesta-insumo, sin código de producción
**Piezas evaluadas:** `ESTRUCTURA-JSON-MODO-PRACTICA.md` · `PROPUESTA-T-UX-LESSON-01__1_.md` (Kimi) · `plan.md` · mockups `index.html` / `index_app.html`
**Destino:** `docs/ux/` (pasada G1) junto a las piezas.

---

## 1 · Veredicto en tres líneas

La idea rectora — «actualizar un ejercicio = reemplazar datos, nunca tocar UI» — es **correcta, valiosa, y ya existe a medio construir en el repo**. El paquete tiene **una suposición estructural falsa** (un runner que escucha la guitarra) atribuida a un ticket certificado, y esa suposición carga la mitad del diseño. Se salva casi todo: separando lo que es *dirección adoptable hoy* de lo que es *una capacidad nueva de producto* que merece su propia decisión.

## 2 · Lo que converge con lo que YA existe (el corazón está bien puesto)

1. **«Motor que lee JSON y renderiza»** — es la arquitectura real: cada `MicroExercise` lleva un **payload** que el cliente parsea (`parse-exercise-payload.ts`). El «motor de renderizado» del doc ya existe en embrión; la propuesta le pone nombre y disciplina de schema. Eso es mérito, no invento.
2. **Pendiente #5 del doc («¿los ejercicios jugados se congelan?») — ya resuelto:** `LessonSession.contentSnapshot` congela el contenido por sesión en el servidor. Respuesta: sí, hoy, sin trabajo nuevo.
3. **«El cliente nunca decide solo si aprobó»** — coincide con la regla dura y con el contrato real (`accuracy`/`nodeCompleted` del `complete`). La regla de gobernanza del §2 del doc está bien escrita.
4. **Un PDF de materia por tarjeta** — coincide 1:1 con `guidePdfUrl` por `PathNode`. La tabla del §5 es directamente usable.
5. **5 ejercicios del Tema 1 mapeados a las 5 etapas** — respeta el modelo de bloques (D-GOV-04).
6. **Disciplina de evidencia de Kimi:** el LESSON-01 marca «propuesto vs real» explícitamente en cada endpoint — el formato de gobernanza viajó bien y se honró.

## 3 · El hallazgo fundamental (ordena todo lo demás)

El doc afirma: *«Runner (T-PUB-02): escucha la guitarra, emite accuracy — Backend (certificado)»*. **Eso es falso.** Lo que T-PUB-02 certificó es: sesión → `exercises[]` → el alumno **responde** (`selectedAnswer`, `responseTimeMs`) → el `complete` califica en servidor. **No existe captura de audio, ni pitch detection, ni afinador, ni detección polifónica — ni en cliente ni en backend.** El pendiente #1 del doc («¿soporta acordes o solo nota única?») está mal planteado: la respuesta real es *ninguna de las dos — no hay detección de audio de ningún tipo*.

Consecuencia: los modos `escucha-y-repite` / `toca-conmigo` / `desafio-precision`, `runner.engine: pitch-detection|tuner`, `toleranceCents`, `listenWindowMs`, las notas que caen a `bpm` y los combos en vivo **no son una extensión del runner: son una capacidad nueva de producto** (motor de audio en cliente — micrófono, análisis de pitch en tiempo real; la polifonía de acordes es genuinamente difícil). Eso merece su propia decisión D-GOV y un spike técnico **antes** de comprometer un solo campo del schema que dependa de ella. Atribuir capacidades inventadas a un ticket certificado es exactamente la trampa registrada en la gobernanza («campos inventados en secciones tituladas dato real») — se registra, se corrige, y se sigue.

## 4 · Correcciones de arquitectura (adoptables ya, sin perder el principio rector)

1. **CDN público → canal de sesión.** JSONs de ejercicios de contenido pago en un CDN público chocan con «URLs públicas para contenido pago: prohibido» y con el diseño de URLs firmadas. El canal correcto **ya existe**: el JSON de ejercicio *es* el payload del `MicroExercise` y viaja dentro de `exercises[]` de `POST /lesson-sessions` (cookie + snapshot). Publicar un ejercicio nuevo = alta por `/admin` como todo el material (pipeline T-PUB-01), no subir un archivo a mano a ningún lado. **El principio rector se conserva íntegro** — pedagogía edita datos, desarrollo no toca UI — con el pipeline existente.
2. **Endpoints «propuestos» de Kimi que ya existen distinto:** `POST /lesson-sessions` es **real y certificado** (y más rico que lo propuesto: devuelve `exercises[]`, `expiresAt`, snapshot). `GET /lessons/:id` no existe — su información vive repartida entre `/me/path` y la sesión. Corregir el doc con los contratos reales antes de cualquier ticket; no es culpa de Kimi (marcó todo como propuesto), es la pasada de verificación que toca ahora.
3. **Frontera del scoring.** `pointsPerHit` / `comboResetOnMiss` son *feedback del juego* — solo pueden existir si algún día existe la capa lúdica (decisión del §3). XP y aprobación siguen siendo únicamente del `complete`. Y `passAccuracy` por ejercicio implicaría cambiar el umbral del servidor (hoy fijo: `accuracy ≥ 0.7` a nivel de etapa) — es **decisión de backend**, no un campo que el JSON pueda prometer.
4. **Léxico.** Tema/Clase/Tarjeta deben mapearse al modelo real — Bloque / Etapa (`PathNode`) / `StageType` — y `exerciseId` string al `microExerciseId` real, antes de que dos vocabularios se instalen en paralelo. Mismo problema ya registrado en CAMINO-01.
5. **`engine: "none"` (etapa de solo lectura)** conecta con la decisión ya abierta del marco de clases: mínimo de ejercicios por slot para que `accuracy` signifique algo.

## 5 · Respuestas a los pendientes del doc, con datos reales

| # | Pendiente del doc | Respuesta |
|---|---|---|
| 1 | ¿Runner soporta acordes o solo nota única? | **Ninguna: no hay detección de audio.** Reformular como decisión D-GOV «motor de audio» + spike |
| 2 | ¿Dónde viven los JSONs? | En Postgres como payload de `MicroExercise`, entregados por la sesión — no CDN, no CMS nuevo |
| 3 | ¿Quién publica ejercicios? | Quien publica todo: `/admin` (pipeline certificado). El flujo de revisión pedagógica es decisión de Juan |
| 4 | Validar `passAccuracy` por dificultad | Pedagogía valida — pero contra el umbral real del servidor (0.7 por etapa); umbral por ejercicio = cambio de backend |
| 5 | ¿Se congelan los ejercicios jugados? | **Ya congelados:** `contentSnapshot` por sesión |

## 6 · Qué es adoptable YA vs qué espera decisión

**Adoptable como dirección (cero código hasta «arrancar»):** el schema v1 *como forma del payload* de `MicroExercise` (el `schemaVersion` es buena idea y barata); el inventario de 5 ejercicios del Tema 1 mapeado a etapas reales; la tabla PDF-por-tarjeta; la separación materia (PDF) / configuración (payload).

**Espera D-GOV + spike:** todo el motor de audio (los 3 modos, afinador, polifonía, juego rítmico de notas cayendo). Es una ambición legítima — experiencia tipo Yousician — pero es **un proyecto**, no un campo de schema. Si Juan la quiere, nace como decisión propia con su spike de viabilidad (Web Audio + pitch detection monofónica primero; polifonía después, con expectativas honestas).

**Los mockups (`index.html`, `index_app.html`):** referencia visual, mismo estatus que `Classroom.jsx`. Notas: hex nuevos fuera del set verificado (verde de acierto), tipografías bajo 11px, y —lo importante— proponen una **tercera arquitectura de lección** (tarjetas-video + pestaña Práctica), que se suma a las dos ya sobre la mesa (LESSON-01 de 3 zonas, CAMINO-01 fusionado). **Ya hay tres layouts compitiendo por la misma pantalla: la decisión de arquitectura de lección de Juan es ahora el cuello de botella real** — cada mockup nuevo sin esa decisión diverge más.

## 7 · Discrepancias registradas

1. «Runner escucha la guitarra» atribuido a T-PUB-02 — falso; capacidad inexistente.
2. JSONs de ejercicios en CDN público — choca con protección de contenido; canal correcto: payload por sesión.
3. `POST /lesson-sessions` marcado como propuesto — es real y certificado, con contrato más rico.
4. `GET /lessons/:id`, `tablatureUrl`, `durationSec` — no existen en contrato.
5. `passAccuracy` por ejercicio — el umbral real es del servidor, fijo por etapa.
6. Léxico Tema/Clase/Tarjeta vs Bloque/Etapa/StageType — unificar.
7. Hex fuera del set verificado y tipografías <11px en los mockups.

---

*Dictamen de propuesta-insumo. Si algo de aquí contradice el repo, manda el repo — y la discrepancia se registra.*
