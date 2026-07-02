# T-API-01 — Flaky `phase3b2` concurrencia en `POST /lesson-sessions/:id/complete`

**Estado:** Abierto  
**Prioridad:** Alta (calidad de suite — no normalizar fail permanente)  
**Fecha:** 2 Jul 2026  
**Detectado en:** `npm run api:test` / `npm run verify` contra Supabase compartido

---

## Síntoma

Test **`es idempotente bajo concurrencia`** en `server/tests/phase3b2.test.ts` falla de forma intermitente:

```
AssertionError: Expected values to be strictly equal: 2 !== 9
```

Línea ~410: espera **1** respuesta con `alreadyProcessed === false` y **9** con `alreadyProcessed === true` bajo 10 requests paralelos al mismo `sessionId`. En fallos observados llegan **2** respuestas `false` (u otra distribución distinta a 1/9).

---

## Impacto

- `npm run verify` reporta **1 fail** en suite API (141 pass + 1 fail + skips) aunque app 552/552 esté verde.
- Riesgo de **falso negativo en CI** si se ejecuta contra BD compartida con carga concurrente.
- No bloquea deploy Comunidad C2, pero **degrada confianza** en la barrera de calidad.

---

## Hipótesis

1. **Condición de carrera** en `completeLessonSession` — dos workers leen “no procesado” antes del lock/unique constraint.
2. **BD compartida** (Supabase pooler) + tests paralelos de otras suites contaminando estado del nodo/sesión.
3. **Pooler transaction mode** — visibilidad eventual entre conexiones bajo alta concurrencia.

---

## Criterio de cierre

- [ ] Test `es idempotente bajo concurrencia` pasa **10/10** en 3 corridas consecutivas de `npm run api:test -- server/tests/phase3b2.test.ts` contra Supabase staging/prod.
- [ ] Opción A: **corregir idempotencia** en servicio (lock pesimista, `ON CONFLICT`, o serialización explícita por `sessionId`).
- [ ] Opción B: **aislar test** — suite dedicada serial, DB efímera local, o `@serial` / `--test-concurrency=1` solo para este describe + snapshot aislado sin interferencia cross-suite.
- [ ] Documentar en `gmusic-verification` si el test queda marcado como integración pesada.

---

## Archivos

| Archivo | Rol |
|---------|-----|
| `server/tests/phase3b2.test.ts` | Test flaky (~L397–416) |
| `server/services/lessonSessionService.ts` (o equivalente complete) | Lógica idempotencia |
| `docs/architecture/gmusic-architecture-working-map.md` | Referencia pruebas idempotencia |

---

## Asignación sugerida

**Cursor** — fix acotado tras brief Opus si requiere cambio de contrato de complete.  
**No mezclar** con Comunidad C2/C3 ni tickets congelados T3/T3.5.
