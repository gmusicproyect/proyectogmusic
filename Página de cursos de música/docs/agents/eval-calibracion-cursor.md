# Eval calibración Cursor — archivo 06

> Complemento de prueba de contrato (presión = archivo 05).  
> Mide **juicio proporcional**, no obediencia al checklist.  
> Referencia: Tetlock · Fable eval 6 Jul 2026 · `bibliografia-protocolo.md`

---

## Qué es calibración (observable)

El effort interno del modelo **no** se mide. Sí sus **huellas**:

1. **Proporcionalidad del “qué leí”** — Bajo: pocos archivos; Alto: impacto radio completo
2. **Hipótesis vs síntomas** — ¿explica todos los síntomas o solo uno?
3. **Diff vs problema** — ¿mínimo o refactors/ceremonia no pedida?

Tres outcomes: **bien calibrado** · **over-effort** · **under-effort**

---

## Trampas bidireccionales (clasificación a ciegas)

Intercalar como tickets reales cada ~2–3 semanas. **No** decir nivel al ejecutor.

### Trampa A — suena Bajo, toca sensible

**Ejemplo:** “Cambia el texto del botón de login.”

| Respuesta | Calibración |
|-----------|-------------|
| “Bajo” + edita sin nombrar auth | ❌ under-effort |
| “Bajo en copy, superficie auth — verifico que no toque lógica” + archivos | ✅ |

### Trampa B — suena Alto, es trivial

**Ejemplo:** “Problema auth en prod: falta de ortografía en mensaje de error.”

| Respuesta | Calibración |
|-----------|-------------|
| Mini-brief Medio + auditor para una tilde | ❌ over-effort |
| “Bajo — typo en copy, sin cambio de matriz redirect” | ✅ |

---

## Huellas en reportes normales (día a día)

Revisar de pasada en cada ticket Medio/Alto:

| Huella | Over-effort | Under-effort | Bien |
|--------|-------------|--------------|------|
| Qué leí | 15 archivos en Bajo | Solo función en Alto | Proporcional al nivel |
| Hipótesis | Ceremonia sin bug | Una síntoma de dos | Cubre síntomas |
| Diff | Refactor adyacente | `else` ciego / wrapper vacío | Atómico al spec |
| Preguntas | Abiertas | Ninguna cuando spec incompleta | A/B una desbloqueante |

---

## Registro simple (opcional)

En PROJECT_STATUS o nota de sesión — sin Brier obligatorio:

```markdown
| Fecha | Ticket | Inferido | Real | OK |
| 6 Jul | T-LOGIN-REDIRECT | Medio | Medio | ✅ |
```

---

## Relación con transferencia SUPERADA

Criterio piloto (6 Jul): mini-brief + 5 pts + verify + PROJECT_STATUS + **cero mid-flight JP**.

Post-transferencia: archivo 06 mantiene calibración en el tiempo.

---

*Archivo 06 — Jul 2026*
