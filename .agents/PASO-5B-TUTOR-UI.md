# Paso 5b — UI mínima del tutor

Fecha: 2026-11-09  
Copia: `proyectogmusic-cursor`

## Intención (concreto)
Pantalla pública `/tutor` que llama a `POST /api/v1/tutor/ask` y muestra
respuesta con citas o abstención. Sin writes, sin auth, sin LLM.

## Hecho

- [x] `TutorAskPage` + cliente `ask-tutor.ts`
- [x] Routing `tutor` ↔ `/tutor` en `student-zone-routing.ts`
- [x] Montaje en `App.tsx` (sin Navbar / MusicPlayer)
- [x] Tests routing + contrato de montaje

## Cómo probar

1. API local (o proxy Vite → API con el endpoint Paso 5).
2. Abrir `http://localhost:…/tutor`
3. Preguntar p.ej. acceso a Mi Camino → citas; precio secreto → abstain.

```bash
cd "Página de cursos de música"
node --import ./scripts/app-test-import.mjs --import tsx --test \
  src/app/utils/student-zone-routing.test.ts \
  src/app/services/gmusic-api/ask-tutor.test.ts
NODE_ENV=test node --import tsx --test server/tests/tutor-ask.test.ts
```

## Riesgo residual
- En prod Vercel el rewrite `/api/v1` apunta a Render; el endpoint tutor
  solo existe en esta copia hasta que se despliegue esa API.
- No está en el smoke Track A (lab interno).

## Siguiente (opcional)
Push de commits locales · rate limit · o meter el tutor en una zona alumno.
