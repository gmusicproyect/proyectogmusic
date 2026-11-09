# Paso 3 — RAG gate con corpus real de Gmusic

Fecha: 2026-11-09  
Workbench: **0.7.0**

## Intención
Sustituir el corpus demo del curso por documentos derivados del repo Gmusic,
con provenance, queries en español y gate NDCG que falla ante regresión.

## Hecho

- [x] `fixtures/gmusic-corpus/documents.json` + `SOURCES.md`
- [x] Judgments/baseline/candidates actualizados (4 queries de producto)
- [x] MCP `catalog_search` lee el corpus Gmusic
- [x] `rag-eval` pass · `candidate_regress` exit 1
- [x] Tests workbench **39/39** (incluye `test_gmusic_corpus`)

## Queries

- `acceso-zona-alumno`
- `completar-mi-camino`
- `inscripcion-whatsapp`
- `garantia-reembolso`

## Comando

```bash
cd tools/gmusic-agent-workbench
python3 -m workbench rag-eval
python3 -m unittest discover -s tests -v
```

## Riesgo residual
- Textos son resúmenes con provenance, no copy legal oficial.

## Siguiente

**Paso 4** — ✅ hecho — ver `PASO-4-TUTOR.md`.

