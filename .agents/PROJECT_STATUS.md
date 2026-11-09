# ESTADO — proyectogmusic-cursor (copia aislada)

Última actualización: 2026-11-09

## En curso
- Pasos 0–4 del workbench **cerrados**. Sin ticket activo de producto UI.

## Hecho (ruta gradual)
- Paso 0 — base copia · `PASO-0-BASE.md`
- Paso 1 — workbench en `tools/` · `PASO-1-WORKBENCH.md`
- Paso 2 — smoke Track A · `PASO-2-SMOKE.md`
- Paso 3 — corpus RAG Gmusic · `PASO-3-RAG.md` · workbench 0.7.0
- Paso 4 — tutor grounded · `PASO-4-TUTOR.md` · workbench **0.8.0**

## Bloqueado / Pendiente
- `npm run api:test` (Paso 0b) — Postgres local/CI
- Commit/push workbench — **G1**: esperar OK de JP
- Opcional: LLM live detrás del mismo contrato de citas; UI alumno

## Decisiones vigentes
- Copia aislada: no tocar `proyectogmusic` original
- Tutor: solo citas + abstain; rol sin writes
- Stdlib Python only en workbench

## Reglas duras activas
- G1: cero commit/push sin OK explícito
- G4–G6: sin secrets; sin tocar auth/pagos/DB prod

## Última verificación conocida
- Workbench tests: **44/44** · tutor-demo pass · ask exit 0 · Fecha: 2026-11-09
- App smoke Track A: ver `PASO-2-SMOKE.md` (656 tests en esa corrida)
