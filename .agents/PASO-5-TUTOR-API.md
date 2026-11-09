# Paso 5 — API tutor grounded (enchufe en la app)

Fecha: 2026-11-09  
Copia: `proyectogmusic-cursor`

## Intención (concreto)
Exponer en la API de la copia el mismo contrato del workbench:

`POST /api/v1/tutor/ask`  
→ respuesta con citas del corpus **o** abstain.  
Sin writes a DB, sin LLM, sin UI.

## Hecho

- [x] Corpus: `server/data/gmusic-tutor-corpus.json` (mismo set que workbench Paso 3)
- [x] `server/lib/tutorAsk.ts` + `parseTutorAskBody.ts`
- [x] `server/routes/tutor.ts` montado en `app.ts`
- [x] Tests `server/tests/tutor-ask.test.ts` — **10/10** (unit + HTTP)

## Contrato

Request:
```json
{ "question": "¿Necesito suscripción activa para entrar a Mi Camino?" }
```

Response `200`:
```json
{
  "question": "...",
  "status": "answered" | "abstain",
  "answer": "...",
  "citations": [{ "id", "title", "source_path", "excerpt" }],
  "refusal_reason": null | "empty_question" | "no_evidence"
}
```

`400` + `VALIDATION_ERROR` si falta `question` o no es string.

Público (solo lectura). No autentica; no muta.

## Comando

```bash
cd "Página de cursos de música"
NODE_ENV=test node --import tsx --test server/tests/tutor-ask.test.ts
```

## Riesgo residual
- Corpus duplicado vs `tools/.../fixtures/gmusic-corpus` (sincronizar a mano si cambia).
- Sin rate limit aún (OK en copia; antes de prod endurecer).
- UI alumno aún no llama este endpoint (Paso 5b).

## Siguiente

**Paso 5b** — ✅ hecho — ver `PASO-5B-TUTOR-UI.md`.
