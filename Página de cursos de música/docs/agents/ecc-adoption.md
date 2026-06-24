# ECC → Gmusic — adopción curada

**Fuente externa:** [affaan-m/ECC](https://github.com/affaan-m/ECC) (MIT)  
**Decisión:** D-GOV-12  
**Estado:** Adoptado de forma **selectiva** — no es dependencia npm ni plugin completo.

ECC es un ecosistema masivo (~260 skills). Gmusic **no** instala ECC entero. Solo importa patrones que complementan `.agents/skills/` sin reemplazar gobernanza de producto.

---

## ✅ Adoptado en Gmusic

| Patrón ECC | Implementación Gmusic | Dónde |
|------------|----------------------|--------|
| Verificación antes de declarar “listo” | Skill `gmusic-verification` | `.agents/skills/gmusic-verification/` |
| CI: typecheck + tests + build en PR | Workflow `ci.yml` | `.github/workflows/ci.yml` |
| Comando único de verificación | `npm run verify` | `package.json` |
| Deploy/funnel smoke en producción | Skill `gmusic-ci-deploy` + scripts existentes | `scripts/verify-*.mjs` |
| Handoff de sesión / memoria operativa | Skill `gmusic-session-handoff` + `scripts/agent-status.sh` | `.agents/MEMORY.md` |
| Skills portables cross-harness | Manifest + `sync-skills.sh` (ya existía; reforzado) | `skills.manifest.yaml` |
| Ciclo cerrado ejecutor | `loop.mdc` canónico versionado | `.agents/cursor-rules/loop.mdc` |
| Debugging sistemático (executor) | Superpowers `systematic-debugging` (opcional `--executor`) | `install-superpowers-opus.sh` |

---

## ⛔ Separado — no integrar

| Pieza ECC | Motivo de exclusión |
|-----------|---------------------|
| Instalar plugin `ecc@ecc` o `ecc-universal` completo | Scope masivo; contradice skills Gmusic y tickets congelados |
| Catálogo 260+ skills genéricos | Ruido, conflictos con D-GOV-* y funnel Track A |
| ECC 2.0 Rust (`ecc2/`) daemon / control plane | Alpha; no aporta a stack Vite+Express actual |
| Hermes operator shell | Herramienta personal del maintainer ECC; fuera de scope |
| Skills de prediction markets, social graph, billing ops | Dominio ajeno a academia de guitarra |
| Copiar `rules/` ECC enteras a repo | Duplican y pueden anular `DECISIONS.md` / `AGENTS.md` |
| ECC Pro GitHub App ($19/seat) | Evaluar solo si Juan lo pide; no es prerequisito técnico |
| Mirrors / forks no oficiales de ECC | Riesgo de malware (advertencia del propio ECC) |
| Memoria automática que escribe sobre progreso alumno | Conflicto con backend como fuente de verdad (D-GOV-11 futuro) |
| Hooks que resetean funnel sin distinguir lead vs alumno | Rompe T3.5 y progreso real |

---

## ⚠️ Usar con precaución (referencia externa)

Consultar ECC como **biblioteca de ideas**, no como fuente de verdad:

- Patrones TypeScript/React genéricos en `rules/typescript` (adaptar, no copiar)
- AgentShield — ya cubierto parcialmente por `security-scan.yml` + gitleaks
- Token optimization guides — leer guías ECC; no cambiar stack SPA

---

## Jerarquía cuando ECC y Gmusic discrepan

1. `.agents/DECISIONS.md` (D-GOV-01)
2. Skills `gmusic-*`
3. `AGENTS.md` / `CLAUDE.md`
4. Patrones genéricos ECC (solo si no contradicen lo anterior)

---

## Mantenimiento

- Nuevos skills ECC: evaluar uno a uno; crear `gmusic-*` adaptado, no symlink masivo.
- Tras cambiar `.agents/skills/`: `./scripts/sync-skills.sh`
- Tras cambiar reglas Cursor: `./scripts/sync-cursor-rules.sh`
- T3/T3.5 y Ticket 4: **no** mezclar con rollout ECC.

**Paralelo pedagógico:** inspiración freeCodeCamp (contenido/escala) → `docs/agents/fcc-inspiration.md` (D-GOV-13). ECC y FCC son referencias distintas.
