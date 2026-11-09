# Paso 6 — Mejoras tutor (harden + acceso admin)

Fecha: 2026-11-09

## Intención
Endurecer el enchufe del tutor sin cambiar el contrato de citas/abstain.

## Hecho

- [x] Rate limit in-memory: 20 req / 60s por IP → `429 RATE_LIMITED`
- [x] Tope de pregunta: 500 caracteres
- [x] Auth opcional: `TUTOR_REQUIRE_AUTH=1` exige cookie JWT
- [x] Respuesta sin excerpt duplicado
- [x] Link **Tutor corpus** en sidebar Admin → `/tutor`

## Comando

```bash
cd "Página de cursos de música"
NODE_ENV=test node --import tsx --test server/tests/tutor-ask.test.ts
```

## Notas
- Default sigue público (lab). Activar auth solo cuando se exponga más.
- Rate limit es por proceso (no distribuido). Suficiente para copia/local.
