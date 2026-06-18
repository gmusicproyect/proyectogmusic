# Handoff Cloud — Auditoría READ-ONLY · Repo nuevo Gmusic

**Fecha:** 18 Jun 2026  
**De:** Juan Pablo (Director) + Cursor (Cursos)  
**Para:** Claude / Cloud (El Cerebro / Auditor)  
**Palabra clave:** Retomar Gmusic  
**Modo:** READ-ONLY — no codear, no commit, no push, no Git remoto

---

## 1. Resumen ejecutivo

**Estado:** `origin/main = HEAD = f20e795` (18 Jun 2026, post-push Academia).

Gmusic Estudio migró de un repo personal legacy a un **repo canónico nuevo**. Gobernanza, teaser B demo-path, Academia 2 pasos y decisiones D-GOV están **publicados en remoto**. Pendientes: D-GOV-02/03/04, sync doc operativo, fase visual `logogmusic.png`.

Tu misión: **auditar coherencia** entre docs, decisiones, código publicado y estado local — reportar desfases, no implementar.

---

## 2. Repositorio canónico (NUEVO)

| Campo | Valor |
|-------|-------|
| **GitHub** | https://github.com/gmusicproyect/proyectogmusic |
| **Org / cuenta** | `gmusicproyect` |
| **Rama** | `main` |
| **`origin/main` (remoto, 18 Jun 2026)** | **`f20e795`** |
| **App path** | `Página de cursos de música/` (dentro del monorepo) |
| **Stack** | React 18 + Vite · Express + Prisma + PostgreSQL |

### Repo anterior (LEGACY — no usar como fuente activa)

| Campo | Valor |
|-------|-------|
| Cuenta | `estudiosgpt2024-crypto` |
| Repo | `paginawebgmusic` |
| Estado | **Supersedido** — el remoto local ya apunta solo a `gmusicproyect/proyectogmusic` |

---

## 3. Commits publicados en `origin/main` (orden reciente)

| Hash | Mensaje | Qué incluye |
|------|---------|-------------|
| **`f20e795`** | feat(academia): two-step instrument then starting point funnel | Academia 2 pasos + handoffs operativos |
| `1f04e7e` | docs(governance): align agent ops with D-GOV-01 and published funnel | MEMORY, AGENTS, `.cursorrules`, `skills.manifest.yaml` |
| `2bd1bdc` | feat(demo-path): teaser B funnel with hybrid CTA | 5 jugables + 10 bloqueadas + card +60, CTA híbrido |
| `024cc42` | docs(architecture): approve demo teaser and CTA decisions | D-GOV-05, D-GOV-06, D-003 aclarado |
| `9701e4d` | docs(architecture): add Gmusic working architecture map | Context Map v1.1 + Auditoría READ-ONLY v1.2 |
| `b276d80` | docs(architecture): approve D-GOV-01 governance baseline | Jerarquía documental |

---

## 4. Gobernanza de agentes (obligatoria)

| Rol | Herramienta | Puede codear | Puede Git remoto |
|-----|-------------|--------------|------------------|
| **Claude / Cloud** | Claude | No (prod) | No |
| **Codex** | Codex | No | No |
| **Cursos** | Cursor | Sí (local) | Solo push con **SÍ/OK** de Juan |

**Protocolo Git:** Cursor es el único que toca remoto. Commit/push **prohibidos** sin autorización explícita de Juan.

---

## 5. Jerarquía documental (D-GOV-01)

Leer en este orden para decisiones de arquitectura/dominio:

1. `.agents/DECISIONS.md` (aprobadas)
2. `docs/architecture/gmusic-architecture-working-map.md`
3. Código + tests
4. `.agents/MEMORY.md` / `.agents/PROJECT_STATUS.md` (operativo)
5. Handoffs en `docs/vision/handoffs/` si no contradicen lo anterior
6. Legacy / SUPERSEDED → no referencia activa

**⚠️ Numeración D-GOV antigua:** handoffs del 15 Jun con D-GOV-01=URLs fueron **eliminados del working tree** (SUPERSEDED). La numeración vigente está en DECISIONS.

---

## 6. Decisiones vigentes vs pendientes

### Aprobadas (publicadas)

| ID | Tema |
|----|------|
| **D-GOV-01** | Jerarquía doc; working map = base arquitectónica |
| **D-GOV-05** | CTA híbrido C (6–15 → planes; +60/banner/FAB → inscripcion-gate) |
| **D-GOV-06** | Teaser B: 5 gratis + 10 bloqueadas + card +60; catálogo 75 |
| **D-003** | Solo 5 clases jugables gratuitas; 6–15 = teaser comercial |

### Pendientes (requieren Juan / Claude)

| ID | Tema |
|----|------|
| **D-GOV-02** | URLs funnel demo como destino final |
| **D-GOV-03** | Fase routing URL (corta demo vs global) |
| **D-GOV-04** | Pedagogía 6–75 / skill-graph guitarra |

### No tocar sin decisión explícita

- **R-001** — contenido de sesión no versionado
- **R-002** — entitlements no exigidos en API privada

---

## 7. Mapa de rutas (estado código vs objetivo)

| Zona | `currentPage` | URL objetivo | Sync URL hoy |
|------|---------------|--------------|--------------|
| Landing | `home` | `/` | ✅ |
| Funnel demo | `mi-camino-demo`, `demo-clase-*`, `inscripcion-gate` | `/mi-camino-demo`, `/demo-clase-*`, `/inscripcion` | ❌ `currentPage` only |
| Suscriptor | `mi-estudio`, `mi-camino` | `/alumno`, `/mi-camino` | ✅ |

Implementación suscriptor: `src/app/utils/student-zone-routing.ts` + `handlePageChange` en `App.tsx`.

---

## 8. Funnel público (canónico)

```
GmusicLanding (home)
  └── AcademiaSection [2 pasos — f20e795]
        · Paso 1: instrumento (Guitarra activa)
        · Paso 2: punto de partida + CTA dinámico
        └── mi-camino-demo → PathDemoPage (teaser B D-GOV-06)
              └── demo-clase-1..5 → DemoLessonPage
                    └── [5/5] → inscripcion-gate → InscripcionGatePage
```

CTA híbrido (D-GOV-05): clases 6–15 → planes en home; card +60 / banner / FAB → inscripcion-gate.

---

## 9. Working tree local (18 Jun 2026)

| Estado | Archivo | Notas |
|--------|---------|-------|
| **Publicado** | Academia 2 pasos (`f20e795`) | En remoto |
| Untracked | `public/hero/threshold/logogmusic.png` | Asset visual hero — fase futura |
| **Pendiente commit doc** | MEMORY, CLAUDE, AGENTS, handoffs, PROJECT_STATUS, `.cursorrules`, funnel skill | Sync post-`f20e795` |

**Tests app:** **377/377** pass · typecheck OK.

**Desfase MEMORY (pre-sync doc):** resuelto en commit documental pendiente — target `f20e795`, 377 tests.

---

## 10. Skills y docs operativos

| Tarea | Leer |
|-------|------|
| Gobernanza / roles | `AGENTS.md`, `.cursorrules` |
| Funnel / conversión | `.agents/skills/gmusic-funnel-conversion/SKILL.md` |
| Progresión / bloqueos | `.agents/skills/gmusic-game-progression-architecture/SKILL.md` |
| API / motor | `.agents/skills/gmusic-learning-engine/SKILL.md` + `docs/architecture/` |
| Registro skills | `skills.manifest.yaml` → espejo `.cursor/skills/` vía `./scripts/sync-skills.sh` |

---

## 11. Checklist de auditoría READ-ONLY (entregable esperado)

Marca y reporta hallazgos — **sin proponer código** salvo brechas críticas:

### A. Repositorio y migración
- [x] Confirmar que `gmusicproyect/proyectogmusic` es el único remoto activo
- [x] Confirmar que no hay referencias activas al repo legacy en docs publicados (pendiente sync doc local)
- [x] Listar commits en `origin/main` — HEAD `f20e795`

### B. Gobernanza documental
- [ ] DECISIONS vs MEMORY vs AGENTS vs working map — sync doc pendiente post-Academia
- [x] D-GOV-01/05/06 coherentes con código publicado
- [x] Pendientes D-GOV-02/03/04 claramente acotados

### C. Funnel y producto
- [x] Teaser B (5+10+card) alineado con D-GOV-06 y D-003
- [x] CTA híbrido alineado con D-GOV-05
- [x] Academia 2 pasos publicada — coherente con D-007 (solo guitarra activa)

### D. Riesgos técnicos (solo reportar)
- [x] R-001 / R-002 — documentados, no mitigados
- [x] URL sync parcial — riesgo documentado en AGENTS
- [x] Tests: **377/377**

### E. Limpieza y orden
- [x] Handoffs SUPERSEDED 15 Jun eliminados
- [x] `logogmusic.png` untracked — fuera de commits producto
- [ ] Commit documental post-`f20e795` — pendiente autorización Juan

---

## 12. Formato de respuesta esperado de Cloud

1. **Estado general** (1 párrafo): ¿repo nuevo ordenado? ¿qué falta?
2. **Tabla de desfases** (doc vs código vs remoto)
3. **Riesgos** (P0 / P1 / P2)
4. **Recomendaciones** (máx. 5 bullets, sin implementar)
5. **Próximo paso sugerido para Juan** (una sola prioridad)

---

## 13. Prohibiciones en esta auditoría

- No escribir código de producción
- No modificar `.agents/DECISIONS.md` sin aprobación Juan
- No commit / push / PR
- No reabrir Visual D (Canva/Canvas) — baseline = Visual A hero simplificado
- No expandir routing URL sin D-GOV-02/03
- No tocar R-001 / R-002

---

*Documento vivo · Auditoría Jun 2026 · Post-push Academia `f20e795` · checklist §11 actualizado.*
