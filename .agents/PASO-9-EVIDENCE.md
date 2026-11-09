# Paso 9 — Evidence / traces del tutor en admin

Fecha: 2026-11-09

## Intención
Traer la idea de **traces** del curso a ops: el admin ve qué preguntó la gente
al tutor, si hubo citas o abstain.

## Hecho

- [x] Audit append-only: `server/data/tutor-audit.jsonl` (gitignored)
- [x] Cada `POST /api/v1/tutor/ask` registra evento
- [x] `GET /api/v1/admin/tutor/evidence` (solo ADMIN)
- [x] Admin sidebar **Evidence tutor** → tabla de eventos
- [x] Tests `server/tests/tutor-audit.test.ts`

## Cómo verlo

1. API + Vite locales (reiniciar API para cargar el código nuevo).
2. Preguntá algo en `/tutor`.
3. Login admin → `/admin` → **Evidence tutor**.

## Contrato evento

```json
{
  "ts": "ISO",
  "question": "...",
  "status": "answered|abstain",
  "refusal_reason": null,
  "citation_ids": ["doc-..."],
  "answer_preview": "..."
}
```

## Riesgo residual
- Log por instancia de API (en Render free no es multi-nodo durable).
- Health DB 500 no afecta este log (filesystem).

## Siguiente
Paso 10 — repair agent acotado (opcional).
