# Veredicto spike de audio — fase 0 (D-GOV-AUDIO-01)

**Fecha:** 2026-08-06 · **Ejecutor:** Juan (prueba manual) · **Prototipo:** `index.html` + `js/pitch.js` (Paquete B) · **Entorno:** localhost:8000, Mac, navegador (sin instalar nada).

---

## Criterios binarios

| # | Criterio | Umbral | Resultado | Evidencia |
|---|---|---|---|---|
| 1 | Precisión cuerda al aire | ≥ 90% aciertos | **Pase** | 6 cuerdas tocadas; la mayoría detectadas dentro del rango de la nota |
| 2 | Latencia percibida | < 100 ms (Mac) | **Pase** | Sin demora notable; la nota se reconoce al tocar |
| 3 | Falsos positivos | < 10% | **No pase** | Al hablar, el micrófono detecta tono de voz como nota |
| 4 | Solo navegador | Sí/No | **Pase** | Chrome/Safari en Mac, sin instalaciones adicionales |

---

## Resolución

**Fase 0 — pase con reserva.** La detección monofónica de cuerdas al aire en browser es **viable** en Mac (precisión + latencia). El bloqueo principal es **discriminación voz/ruido**, no la identificación de pitch en guitarra.

**Gate siguiente (fase 1):** prototipo con filtros (umbral de energía, ventana de escucha, exclusión de banda de voz) antes de comprometer schema, un ejercicio real o UI lúdica. Tablet **sin probar** en esta sesión — criterio <150 ms pendiente de evidencia.

**Explícitamente fuera de alcance de este veredicto:** afinador de producto, calificación de afinación, polifonía, Modo Práctica integrado.

---

*Registrado en docs (G1). Decisión matriz: `D-GOV-AUDIO-01` · `docs/ux/PROPUESTA-D-GOV-MOTOR-AUDIO.md` §7.*
