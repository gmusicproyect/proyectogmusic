# Paso 8 — Deploy API tutor (prod)

Fecha: 2026-11-09  
Veredicto: **PASS** — ya en prod vía push a `main` (auto-deploy Render + Vercel).

## Intención
Que `/api/v1/tutor/ask` exista fuera del Mac: Render (API) y proxy Vercel.

## Evidencia (smoke 2026-11-09)

### Render directo
```bash
curl -sS -X POST "https://gmusic-api.onrender.com/api/v1/tutor/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question":"¿Necesito suscripción activa para entrar a Mi Camino?"}'
# → 200 answered + doc-access-subscription

curl -sS -X POST "https://gmusic-api.onrender.com/api/v1/tutor/ask" \
  -H 'Content-Type: application/json' \
  -d '{"question":"¿Cuál es el precio secreto del plan oculto en dólares?"}'
# → 200 abstain no_evidence
```

### Vercel (SPA + rewrite /api/v1 → Render)
- `https://proyectogmusic.vercel.app/tutor` → 200  
- `POST https://proyectogmusic.vercel.app/api/v1/tutor/ask` → 200 answered  

## Nota
`GET /api/v1/health` en Render puede devolver 500 (DB/cold) mientras el tutor
sigue OK: el tutor **no usa Postgres**.

## Cómo verlo vos
Abrí: **https://proyectogmusic.vercel.app/tutor**  
o **https://proyectogmusic.vercel.app/clase-gratuita** → *Preguntas con citas*.

## Siguiente
Paso 9 del camino: evidence/traces en admin (opcional).
