# Paso 4 — Tutor grounded (solo citas)

Fecha: 2026-11-09  
Workbench: **0.8.0**

## Intención
Asistente de lectura que responde preguntas de producto solo con citas del
corpus Gmusic. Sin evidencia fuerte → abstenerse. Sin writes (rol `tutor`).

## Hecho

- [x] `workbench/tutor.py` — `ask` + `run_tutor_demo`
- [x] Rol `tutor` en `policy/roles.json` (`catalog_search`, `get_document`)
- [x] CLI: `ask`, `tutor-demo`, `run --demo --with-tutor`
- [x] Tests `tests/test_tutor.py` (5)
- [x] VERSION / `__version__` / MCP `SERVER_INFO` → 0.8.0

## Comportamiento

| Pregunta | Esperado |
|----------|----------|
| Acceso Mi Camino / suscripción | `answered` + cita `doc-access-subscription` |
| Inscripción WhatsApp | `answered` + cita `doc-whatsapp-inscripcion` |
| Precio secreto / plan oculto | `abstain` (`no_evidence`) |

Umbral: solapamiento ≥2 tokens (stopwords filtradas) entre pregunta y documento.

## Comando

```bash
cd tools/gmusic-agent-workbench
python3 -m workbench ask "¿Necesito suscripción activa para entrar a Mi Camino?"
python3 -m workbench tutor-demo
python3 -m workbench run --demo --with-tutor
python3 -m unittest discover -s tests -v
```

Evidence: `outputs/evidence/tutor-demo.json`, `tutor-answer.json`, `tutor-audit.json`.

## Riesgo residual
- Offline: composición por excerpts citados, no LLM live (hook opcional después).
- Corpus = resúmenes con provenance; no copy legal.
- El producto (UI alumno) aún no consume este tutor.

## Siguiente (opcional)
Live LLM detrás del mismo contrato de citas + abstain; o superficie UI en la copia.
