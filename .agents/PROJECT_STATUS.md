# ESTADO — proyectogmusic-cursor (copia aislada)

Última actualización: 2026-11-09

## En curso
- Paso 6 harden en curso / recién implementado (sin commit hasta OK JP).

## Hecho (ruta gradual)
- Paso 0 — base copia · `PASO-0-BASE.md`
- Paso 1 — workbench · `PASO-1-WORKBENCH.md`
- Paso 2 — smoke Track A · `PASO-2-SMOKE.md`
- Paso 3 — corpus RAG · `PASO-3-RAG.md`
- Paso 4 — tutor lab · `PASO-4-TUTOR.md` · workbench 0.8.0
- Paso 5 — API `POST /api/v1/tutor/ask` · `PASO-5-TUTOR-API.md` · `b1170a2`
- Paso 5b — UI `/tutor` · `PASO-5B-TUTOR-UI.md`
- Push `main@2237d74` · smoke humano API+UI PASS
- Paso 6 — harden · `PASO-6-HARDEN.md` (rate limit, max len, auth opcional, link admin)

## Bloqueado / Pendiente
- `npm run api:test` completo (Postgres)
- Desplegar API tutor a Render (si se quiere usar desde Vercel)

## Decisiones vigentes
- Copia aislada: no tocar original
- Tutor: citas + abstain; sin writes
- UI lab en `/tutor` (pública, mínima)

## Reglas duras activas
- G1: cero commit/push sin OK explícito
- G4–G6: sin secrets; sin auth/pagos/DB prod

## Última verificación conocida
- Workbench 44/44 · Tutor API 10/10
- Paso 5b: routing + ask-tutor **23/23** · Fecha: 2026-11-09
