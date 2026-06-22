# Gmusic — Quiz de temperamento (onboarding)
**Decisión:** D-PROD-01
**Fecha:** 2026-06-22
**Estado:** Aprobado

---

## Objetivo

Detectar el temperamento predominante del visitante **antes** del demo de 5 clases gratuitas, para segmentación conductual a 6–12 meses. No personaliza la experiencia de forma inmediata en esta fase.

## Temperamentos

| ID interno | Nombre | Tag en BD |
|------------|--------|-----------|
| `sanguine` | Sanguíneo | `sanguine` |
| `choleric` | Colérico | `choleric` |
| `melancholic` | Melancólico | `melancholic` |
| `phlegmatic` | Flemático | `phlegmatic` |

## Flujo

```
Landing → Academia (instrumento) → Quiz 6 preguntas → /mi-camino-demo
```

- El quiz aparece **una sola vez** por sesión anónima (localStorage + backend cuando exista auth).
- Si abandona a mitad: guardar progreso parcial en telemetría; no asignar temperamento hasta completar las 6.
- Al completar: calcular `calculated_temperament` y persistir en `onboarding_analytics`.

## Algoritmo de scoring

1. Cada respuesta suma +1 al temperamento asociado.
2. `calculated_temperament` = temperamento con mayor conteo.
3. Empate → prioridad de desempate: `sanguine` > `choleric` > `melancholic` > `phlegmatic` (solo para MVP; registrar empates en telemetría).

## Telemetría obligatoria

Por pregunta:
- `question_id` (1–6)
- `selected_option` (a–d)
- `temperament_tag` asignado a esa opción
- `time_ms` desde que se muestra la pregunta hasta confirmar
- `answer_changes` (cuántas veces cambió antes de confirmar)

Globales:
- `total_duration_ms`
- `completed_at`
- `session_id` (anónimo, UUID en localStorage)
- `scores` JSON: `{ sanguine, choleric, melancholic, phlegmatic }`

## Las 6 preguntas (español chileno)

### Pregunta 1 — Primera impresión
**Situación:** Llegas a una clase nueva de guitarra. ¿Qué haces primero?

| Opción | Texto | Temperamento |
|--------|-------|--------------|
| a | Saludo a todos y pregunto cuándo empezamos a tocar | `sanguine` |
| b | Pregunto cuál es el plan de la clase y qué voy a lograr hoy | `choleric` |
| c | Observo el espacio, la guitarra del profe y cómo están organizados | `melancholic` |
| d | Me siento, respiro y espero que el profe explique con calma | `phlegmatic` |

### Pregunta 2 — Dificultad
**Situación:** Un ejercicio te cuesta más de lo esperado. ¿Cómo reaccionas?

| Opción | Texto | Temperamento |
|--------|-------|--------------|
| a | Lo intento de nuevo al tiro, con otra energía | `sanguine` |
| b | Lo repito hasta dominarlo, sin importar el tiempo | `choleric` |
| c | Busco entender por qué no me sale antes de seguir | `melancholic` |
| d | Bajo el ritmo y practico despacio, sin presión | `phlegmatic` |

### Pregunta 3 — Motivación
**Situación:** ¿Qué te empuja más a seguir aprendiendo guitarra?

| Opción | Texto | Temperamento |
|--------|-------|--------------|
| a | Tocar algo que suene bien y compartirlo con otros | `sanguine` |
| b | Ver que avanzo y cumplo mis metas semana a semana | `choleric` |
| c | Entender la música y sentir que mejoro de verdad | `melancholic` |
| d | Tener una rutina tranquila que pueda sostener en el tiempo | `phlegmatic` |

### Pregunta 4 — Práctica en casa
**Situación:** Tienes 20 minutos libres para practicar. ¿Qué haces?

| Opción | Texto | Temperamento |
|--------|-------|--------------|
| a | Toco lo que más me divierte, aunque no sea lo del curso | `sanguine` |
| b | Sigo el plan del curso, punto por punto | `choleric` |
| c | Repaso lo que me costó y anoto qué mejorar | `melancholic` |
| d | Practico lo mismo de siempre, sin apuro | `phlegmatic` |

### Pregunta 5 — Feedback
**Situación:** El profe te corrige algo que haces mal. ¿Cómo lo vives?

| Opción | Texto | Temperamento |
|--------|-------|--------------|
| a | Me río, lo intento de nuevo y sigo con buena onda | `sanguine` |
| b | Lo tomo como reto y lo corrijo en el acto | `choleric` |
| c | Me quedo pensando en el detalle hasta entenderlo | `melancholic` |
| d | Escucho, agradezco y lo aplico sin drama | `phlegmatic` |

### Pregunta 6 — Meta a 3 meses
**Situación:** ¿Qué te gustaría poder decir en 3 meses?

| Opción | Texto | Temperamento |
|--------|-------|--------------|
| a | "Toco canciones que me gustan y se lo muestro a mi familia" | `sanguine` |
| b | "Completé mi primer módulo y sé exactamente qué sigue" | `choleric` |
| c | "Entiendo lo que toco y por qué suena así" | `melancholic` |
| d | "Practico seguido y no abandoné" | `phlegmatic` |

## UI / copy

- Título: "Conócete en 1 minuto"
- Subtítulo: "6 preguntas rápidas para acompañarte mejor en tu camino"
- Progreso: "Pregunta {n} de 6"
- CTA confirmar: "Siguiente" / en la última: "Comenzar mi demo"
- Tono: cercano, chileno, sin jerga técnica de temperamentos

## Lo que NO hace este quiz (fase actual)

- No cambia el orden del demo según resultado (ver D-PROD-02 para excepción CTA sanguíneo post-clase 2)
- No muestra al usuario su temperamento
- No bloquea el acceso al demo si no completa el quiz (soft gate con recordatorio)

## Referencias

- Schema: `docs/architecture/onboarding-analytics.sql`
- Validación: `docs/product/query-validacion-temperamento.sql`
- Demo sanguíneo: D-PROD-02
