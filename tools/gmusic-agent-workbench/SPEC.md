# SPEC — Gmusic Agent Workbench (MVP)

## Intención
Un workbench de agentes reproducible para Gmusic Academy: propone un cambio
acotado en un workspace desechable, exige aprobación, verifica con tests y
deja un evidence bundle que un revisor puede auditar sin chat.

## Restricciones
- Python 3.10+ stdlib only (sin deps nuevas).
- Sin API keys en el demo offline.
- Sin tocar auth/pagos/DB de producción (G2–G6).
- Alcance de archivos: solo `learning-artifacts/gmusic-agent-workbench/`.
- Push solo con OK explícito (G1).

## Criterios de aceptación
- [x] `python3 -m workbench run --demo` exit 0
- [x] `python3 -m unittest discover -s tests -v` todo verde (44/44 @ 0.8.0)
- [x] Sin aprobación, el write se rechaza y queda en el audit
- [x] Con aprobación, el patch aplica, tests del fixture pasan
- [x] Evidence bundle en `outputs/evidence/` con trace, audit, cost, handoff
- [x] Tutor grounded: `ask` / `tutor-demo` — citas o abstain; rol sin writes (Paso 4)

## Definición de hecho
Demo verde + tests verdes + README con comandos + estado actualizado. **CUMPLIDO 2026-11-09 (0.8.0 tutor).**
