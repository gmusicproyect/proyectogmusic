# AGENTS.md — Gmusic Agent Workbench

Antes de actuar, lee en este orden:

1. `agent_state.json` — dónde quedó la última sesión
2. `task_board.json` — tarea activa y criterios de aceptación
3. `docs/agent-rules.md` — startup, forbidden, done, approval
4. `docs/reliability-policy.md` — modos de fallo que absorbemos
5. `docs/handoff-protocol.md` — qué debe producir el cierre
6. `docs/reviewer-rubric.md` — cómo se juzga el trabajo

Verificación: comando en `acceptance_criteria` de la tarea activa.

Pack version: ver `VERSION`.
Runtime: `python3 -m workbench run --demo`
