# Instrucción Maestra — Estructura de Clases Gmusic Estudio
**Versión:** 1.0 · **Fecha:** 2026-06-30  
**Estado:** APROBADA POR JUAN — fuente de verdad para PathLessonRunner y carrusel Mi Camino

---

## Regla superior — función de las 5 etapas

Cada bloque de Mi Camino se compone de **5 etapas fijas** (1 microciclo):

| # | Etapa | Verbo | Función |
|---|-------|-------|---------|
| 1 | Fundamento uno | Entender | Introducir el propósito del bloque |
| 2 | Fundamento dos | Preparar | Base conceptual/técnica mínima |
| 3 | Técnica | Entrenar | Habilidad principal con ejercicio medible |
| 4 | Práctica | Aplicar | Secciones parciales, modo ensayo sin presión |
| 5 | Tocar | Demostrar | Ejecución completa — checkpoint del microciclo |

**Cada etapa debe tener:**
- Propósito visible
- Acción mínima clara
- Criterio de completado
- Estado: `locked` → `available` → `active` → `completed`

**El alumno debe entender siempre:**
- Qué está haciendo
- Por qué lo está haciendo
- Qué debe lograr
- Qué se desbloquea después

---

## Decisiones canónicas

### 1. Tamaño de bloque
**1 bloque = exactamente 5 nodos.** Siempre. El carrusel visual asume esto (`index % 5`). No hay bloques de 4 o 6 nodos.

### 2. Copy: demo vs suscriptor
- **Demo / marketing:** `"5 clases gratis"` (simple, conversión)
- **Mi Camino suscriptor:** `"etapas completadas"` en barra de progreso

### 3. Semana vs bloque
**Bloque = unidad pedagógica. Semana = guía opcional, nunca gate.**  
El alumno completa un bloque en 3 días o en 2 semanas — avanza cuando completa, no cuando pasa el calendario.

### 4. Nomenclatura oficial
- **Barra de progreso:** `"X de 5 etapas completadas"`
- **Carrusel navegación:** `"Paso N de 5"` (en cards)
- **Etiqueta de etapa en card:** Fundamento uno / Fundamento dos / Técnica / Práctica / Tocar

### 5. Video
MVP Track A: toda etapa incluye video. El campo `videoUrl` debe ser nullable para que Track B soporte etapas de ejercicio puro sin video.

---

## Criterio de completado por etapa

Una etapa **NO** se completa solo por abrirla.

| Etapa | Criterio |
|-------|----------|
| Fundamento uno | Video visto + confirmación del alumno |
| Fundamento dos | Video visto + confirmación o mini pregunta |
| Técnica | Instrucción leída + ejercicio completado |
| Práctica | Práctica guiada realizada + confirmación o ejercicio por partes |
| Tocar | Ejecución final declarada (autoevaluación) + cierre del bloque |

**MVP Track A (solo video YouTube):**
- Usar `videoEnded` si está disponible, o botón "Marcar como visto" tras el contenido
- No exigir mínimo de intentos
- Permitir intentos ilimitados
- Guardar `attemptsCount` solo para analítica futura, no como bloqueo

**Principio:** la etapa se completa cuando el alumno realiza la **acción pedagógica mínima**, no solo cuando consume contenido.

---

## Contenido mínimo por slot (MVP)

### Fundamento uno
- Video
- Texto breve: "Qué aprenderás"
- Texto breve: "Por qué importa"
- CTA: "Entendido, continuar"

### Fundamento dos
- Video
- Texto breve: "Qué debes observar"
- Pregunta o confirmación simple
- CTA: "Estoy listo para practicar"

### Técnica
- Video o demostración
- **Instrucción escrita obligatoria**
- Criterio de éxito claro
- Ejercicio o confirmación práctica

### Práctica
- **Instrucción escrita obligatoria**
- Práctica por secciones (el alumno sabe qué parte está practicando)
- CTA: "Practiqué esta sección"

### Tocar
- Instrucción final
- Ejecución completa del resultado del bloque
- Autoevaluación simple (ver § Práctica vs Tocar)
- CTA: "Lo logré / Terminar bloque"

**Principio:** nunca dejar una etapa como "solo video". El video enseña; el texto guía la intención y reduce confusión.

---

## Diferencia plataforma: Práctica vs Tocar

| Dimensión | Práctica | Tocar |
|-----------|----------|-------|
| Modo | Ensayo | Demostración |
| Alcance | Por partes / secciones | Ejecución completa |
| Presión | Sin presión, repetir libremente | Checkpoint emocional y técnico |
| Feedback | Formativo | Cierre de bloque |
| Completion | Progreso parcial | Completion real del bloque |
| XP / badge | No | Sí |
| Desbloqueo | No desbloquea siguiente bloque | Desbloquea siguiente bloque |

**MVP — sin grabación, sin micrófono, sin subida de audio.**  
Usar **autoevaluación guiada** en Tocar:
- "Toqué la secuencia completa."
- "Mantuve el pulso."
- "Pude terminar sin detenerme."

Si el alumno marca las condiciones mínimas → bloque completado.

**Decisión estratégica de Juan:** Práctica = entrenamiento sin presión. Tocar = checkpoint emocional y técnico donde la ruta se siente como progreso real, no como lista de videos.

---

## Cierre del microciclo (Tocar completado)

Al completar la etapa 5, debe aparecer pantalla/modal de logro:

**Título:** "Bloque completado"

**Contenido:**
- Mensaje específico del bloque
- Resumen de lo logrado
- XP ganado
- Racha actual (si aplica)
- Botón primario: "Continuar al siguiente bloque"
- Botón secundario (opcional): "Compartir progreso en Comunidad"

**Badge:** Liviano por bloque completado (no por etapa). Ejemplos: "Primer paso completado", "Pulso inicial", "Primer acorde".

**Principio:** el cierre debe dar sensación de logro. El alumno necesita sentir que avanzó, no solo que se desbloqueó otra tarjeta.

---

## Alineación con demo actual (sanity check)

Las 5 clases demo **ya siguen el microciclo** aunque no estén etiquetadas así:

| Slot | Etapa | Demo actual |
|------|-------|-------------|
| 1 | Fundamento uno | Conoce tu guitarra |
| 2 | Fundamento dos | Afinación |
| 3 | Técnica | Cuerdas al aire |
| 4 | Práctica | Pulso cuerda 6 |
| 5 | Tocar | Mini canción 6-5-4 |

El primer bloque ya está escrito así — solo falta nombrarlo y extenderlo al camino largo.

---

## Pendiente — PathLessonRunner (Track A Fase futura)

El interior de cada etapa (lo que el alumno ve al hacer clic en "Iniciar lección") requiere diseñar:
1. Shell de etapa con `stageType` (F1/F2/Técnica/Práctica/Tocar)
2. Bloque de video + texto según slot
3. Lógica de completion por tipo
4. Modal de cierre de microciclo
5. Autoevaluación guiada para Tocar

**No implementar hasta autorización explícita de Juan.** Esta instrucción es la fuente de verdad para cuando se autorice.
