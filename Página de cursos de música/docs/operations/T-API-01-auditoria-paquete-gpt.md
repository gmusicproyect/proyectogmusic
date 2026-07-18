# T-API-01 — Paquete para auditoría GPT (independiente del ejecutor)

> **JP:** copiar este archivo + prompt `04-prompt-auditor-gpt.md` (repo instruccionescursor)
> a un agente GPT **distinto** de Cursor. El ejecutor no emite veredicto de cierre.

---

## Prompt 04 — completado para este ticket

Actúa como auditor del ticket **T-API-01** (nivel **Medio-Alto**, área: **concurrencia server / datos / idempotencia API**).

Te entrego tres insumos: la spec, el diff, y el reporte del ejecutor.

Revisa SOLO tres cosas:

**(a) ¿El diff cumple la spec?** — Criterios de aceptación (literal):

- Fase 1 completada: hipótesis, 10× test, race en test vs server → Opción A recomendada.
- Fase 2: fix real en server (no quarantine, no `it.skip`).
- Test `es idempotente bajo concurrencia` pasa **10/10** en corridas repetidas.
- `npm run verify` verde **legítimo** — sin skips ocultos ni debilitamiento del test.
- Archivos declarados: `completeLessonSessionService.ts`, `advisoryLock.ts`, doc ticket, `PROJECT_STATUS.md`.

**(b) ¿Viola algún gate G1–G7?** — Sin schema/migration, sin secrets, sin push en el diff.
Archivos fuera de scope que **no deben** entrar al commit: `.env.example`, `checklist-seguridad-pre-lanzamiento.md`.
`phase3b2.test.ts` **no fue modificado** — verificar que eso sigue siendo verdad en el diff.

**(c) ¿Riesgo NO declarado?** — **Foco obligatorio del arquitecto:**

1. **Timeout 90s:** `COMPLETE_SESSION_TX_OPTIONS.timeout: 90_000` — ¿un doble-tap real puede esperar hasta 90s en cola de lock? ¿Debería existir un timeout de *espera* más corto con retry, distinto del timeout de transacción?
2. **Pooler Supabase (transaction mode):** advisory locks son frágiles con pooler. ¿`FOR UPDATE` por fila es suficiente? ¿La transacción completa (advisory lock + `FOR UPDATE` + `updateMany` + upserts) viaja en la **misma conexión** bajo Prisma interactive transaction?
3. **Deadlock:** ¿`FOR UPDATE` en `LessonSession` + upsert en `UserProgress`/`XpEvent` puede crear deadlock con otras rutas?

Deuda ya declarada por el ejecutor (nota, no DEVUELVE por sí sola): sin métrica p95 de `complete`; retry máximo 2 intentos.

Reglas del veredicto: **APRUEBA** o **DEVUELVE** (binario). Si DEVUELVE: archivo + línea.

---

## Spec (resumen Fase 1 + 2)

Ver `docs/operations/T-API-01-phase3b2-flaky-concurrency.md`.

**Síntoma:** 10 `POST /lesson-sessions/:id/complete` paralelos → esperado 1× `alreadyProcessed:false` + 9× `true`; fallos `2≠9`, `500`, timeout Prisma 5s.

**Diagnóstico Fase 1:** race en **server** (no en test). Bug producción.

**Fix Fase 2 aplicado:**

| Cambio | Archivo |
|--------|---------|
| Tx `maxWait` 30s · `timeout` 90s | `completeLessonSessionService.ts` |
| Retry 2× + fallback `loadAlreadyCompletedResponse` en P2002/P2028 | idem |
| `SELECT … FOR UPDATE` por `sessionId` | `advisoryLock.ts` |
| `updateMany` solo si `status = STARTED` | `completeLessonSessionService.ts` |
| Swallow P2002 en `xpEvent.create` (unique sessionId+reason) | idem |

---

## Reporte ejecutor (no es veredicto auditor)

| Verificación | Resultado |
|--------------|-----------|
| Test concurrencia ×10 (aislado) | 10/10 pass |
| Test secuencial idempotencia | pass |
| `npm run verify` (noche 6 Jul) | 563 app + 160 api · 0 fail |
| Test modificado | **No** |

---

## Diff (referencia — verificar en git)

```bash
cd "Página de cursos de música"
git diff server/services/completeLessonSessionService.ts server/lib/advisoryLock.ts
```

**Resumen diff:**

- `advisoryLock.ts`: +`lockLessonSessionForComplete()` — `SELECT id FROM "LessonSession" WHERE id::text = ${sessionId} FOR UPDATE`
- `completeLessonSessionService.ts`: extrae `executeCompleteLessonSessionTransaction`; loop retry; `updateMany` condicional; helpers `loadAlreadyCompletedResponse`, `isCompleteContentionError`, `loadCompletedTransactionResult`

**Test sin cambios** (`phase3b2.test.ts` líneas 397–416):

```typescript
assert.equal(responses.filter((r) => r.body.alreadyProcessed === false).length, 1);
assert.equal(responses.filter((r) => r.body.alreadyProcessed === true).length, 9);
assert.equal(await countXpEventsForSession(sessionId), 1);
```

---

## Tras veredicto

- **APRUEBA** → JP autoriza a Cursor: commit 4 archivos + `npm run verify` + push.
- **DEVUELVE** → JP pasa texto a Cursor; corrección; re-auditoría GPT.
