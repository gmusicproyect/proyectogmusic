# ESTADO — proyectogmusic-cursor (copia aislada)

Última actualización: 2026-11-09

## En curso
- Paso 5 cerrado (API). Siguiente opcional: **Paso 5b** UI mínima.

## Hecho (ruta gradual)
- Paso 0 — base copia · `PASO-0-BASE.md`
- Paso 1 — workbench en `tools/` · `PASO-1-WORKBENCH.md`
- Paso 2 — smoke Track A · `PASO-2-SMOKE.md`
- Paso 3 — corpus RAG Gmusic · `PASO-3-RAG.md` · workbench 0.7.0
- Paso 4 — tutor grounded lab · `PASO-4-TUTOR.md` · workbench **0.8.0**
- Paso 5 — API `POST /api/v1/tutor/ask` · `PASO-5-TUTOR-API.md`

## Bloqueado / Pendiente
- `npm run api:test` completo (Paso 0b) — Postgres local/CI
- Push commit workbench — solo con OK JP
- Paso 5b — UI que consuma el tutor
- Opcional: LLM live detrás del mismo contrato

## Decisiones vigentes
- Copia aislada: no tocar `proyectogmusic` original
- Tutor: solo citas + abstain; sin writes
- API tutor pública de solo lectura (sin auth en Paso 5)

## Reglas duras activas
- G1: cero commit/push sin OK explícito
- G4–G6: sin secrets; sin tocar auth/pagos/DB prod

## Última verificación conocida
- Workbench: **44/44** · commit `1f86828`
- Tutor API: `server/tests/tutor-ask.test.ts` **10/10** · Fecha: 2026-11-09
