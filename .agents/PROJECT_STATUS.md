# ESTADO — proyectogmusic-cursor (copia aislada)

Última actualización: 2026-11-09

## En curso
- Sin ticket activo. Camino tutor **0–8** cerrado (prod smoke PASS).

## Hecho (ruta gradual)
- Paso 0 — base copia · `PASO-0-BASE.md`
- Paso 1 — workbench · `PASO-1-WORKBENCH.md`
- Paso 2 — smoke Track A · `PASO-2-SMOKE.md`
- Paso 3 — corpus RAG · `PASO-3-RAG.md`
- Paso 4 — tutor lab · `PASO-4-TUTOR.md` · workbench 0.8.0
- Paso 5 — API tutor · `PASO-5-TUTOR-API.md`
- Paso 5b — UI `/tutor` · `PASO-5B-TUTOR-UI.md`
- Paso 6 — harden · `PASO-6-HARDEN.md`
- Paso 7 — entradas producto · `PASO-7-PRODUCTO.md` · `44618c8`
- Paso 8 — deploy prod verificado · `PASO-8-DEPLOY.md`

## Bloqueado / Pendiente
- `npm run api:test` completo (Postgres)
- Paso 9+ del camino (evidence admin, repair, LLM…)

## Decisiones vigentes
- Copia aislada: no tocar original
- Tutor: citas + abstain; sin writes
- Prod: Vercel SPA + Render API (auto-deploy desde `main`)

## Reglas duras activas
- G1: cero commit/push sin OK explícito
- G4–G6: sin secrets; sin tocar auth/pagos/DB prod a mano

## Última verificación conocida
- Prod tutor: answered + abstain PASS · Vercel `/tutor` + proxy PASS · 2026-11-09
- Ver: https://proyectogmusic.vercel.app/tutor
