# Tools — Gmusic cursor copy

Herramientas de ingeniería para trabajar en esta copia sin tocar el producto
original (`proyectogmusic`).

## gmusic-agent-workbench

Portfolio del curso *AI Engineering from Scratch* (v0.8.0): agent loop,
firewall/approvals, RAG NDCG gate, trace debugger, planner offline/live,
MCP-subset, durable jobs y tutor grounded (citas + abstain).

```bash
cd tools/gmusic-agent-workbench
python3 -m workbench run --demo --with-rag-gate --with-trace-debug --with-mcp --with-jobs --with-tutor
python3 -m workbench ask "¿Necesito suscripción activa para entrar a Mi Camino?"
python3 -m unittest discover -s tests -v
```

No es una feature de la app alumno. Es el método + laboratorio local.

Corpus producto (Paso 3): `gmusic-agent-workbench/fixtures/gmusic-corpus/`.  
Tutor (Paso 4): `python3 -m workbench tutor-demo`.
