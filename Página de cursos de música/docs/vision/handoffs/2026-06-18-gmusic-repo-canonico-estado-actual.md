# Handoff operativo — Repo canónico Gmusic · Estado actual

**Fecha:** 18 Jun 2026  
**De:** Juan Pablo (Director) + Cursor (Cursos)  
**Para:** Claude · Codex · ChatGPT (Ser Digital)  
**Palabra clave:** Retomar Gmusic  
**Tipo:** Handoff operativo — **no** fuente superior a `.agents/DECISIONS.md`

> **Jerarquía documental (D-GOV-01):** este handoff resume estado operativo para onboarding de agentes. Ante conflicto, prevalece `.agents/DECISIONS.md` → `docs/architecture/gmusic-architecture-working-map.md` → código + tests.

---

## 1. Repositorio canónico

| Campo | Valor |
|-------|-------|
| **Repo canónico actual** | **`gmusicproyect/proyectogmusic`** |
| **URL** | https://github.com/gmusicproyect/proyectogmusic |
| **Rama** | `main` |
| **`origin/main`** | **`e047ac3`** (18 Jun 2026, post-routing demo) |
| **App path** | `Página de cursos de música/` |
| **Stack** | React 18 + Vite · Express + Prisma + PostgreSQL |

### Repo anterior — SUPERSEDED

| Campo | Valor |
|-------|-------|
| Cuenta / org | `estudiosgpt2024-crypto` |
| Repo | `paginawebgmusic` |
| Estado | **SUPERSEDED** — no usar como fuente activa ni remoto de trabajo |

El remoto local (`origin`) apunta exclusivamente a `gmusicproyect/proyectogmusic`.

---

## 2. Gobernanza de agentes

| Rol | Herramienta | Función | Git remoto |
|-----|-------------|---------|------------|
| **Juan** | — | Product Owner; autoriza commits, push y decisiones | — |
| **Claude / Cloud** | Claude | Arquitecto — diseña y decide; no codea producción | ❌ |
| **Codex** | Codex | Supervisor — memoria, specs, validación | ❌ |
| **Cursos** | Cursor | Ejecutor — código, tests, build local | ✅ push solo con **SÍ/OK** de Juan |
| **ChatGPT** | Ser Digital | Cuestionador producto/UX; no decide arquitectura técnica | ❌ |

**Protocolo Git:** commit y push **prohibidos** sin autorización explícita de Juan. Cursor es el único agente autorizado en remoto.

---

## 3. Cómo organizamos la documentación

Orden de lectura para decisiones de arquitectura/dominio (**D-GOV-01**):

1. `.agents/DECISIONS.md` — decisiones aprobadas (**fuente superior**)
2. `docs/architecture/gmusic-architecture-working-map.md` — Context Map v1.1 + Auditoría READ-ONLY v1.2
3. Código + tests
4. `AGENTS.md`, `.agents/MEMORY.md` — operativo para agentes
5. `.agents/skills/` + `skills.manifest.yaml` — skills por dominio
6. `docs/vision/handoffs/` — briefs por fase (este documento incluido)
7. Legacy / SUPERSEDED — no referencia activa

Handoffs gobernanza **15 Jun** con numeración D-GOV antigua (D-GOV-01 = URLs): **eliminados del working tree** — SUPERSEDED.

---

## 4. Decisiones publicadas vs pendientes

### Publicadas e implementadas en remoto

| ID | Tema | Commit / nota |
|----|------|---------------|
| **D-GOV-01** | Jerarquía documental; working map = base arquitectónica (**≠ URLs demo**) | `b276d80`, `9701e4d` |
| **D-GOV-02** | URLs funnel demo canónicas | Aprobada `4cdc911` · implementada `e047ac3` |
| **D-GOV-03** | Fase routing URL corta — solo funnel demo | Aprobada `4cdc911` · implementada `e047ac3` |
| **D-GOV-05** | CTA híbrido C: 6–15 → planes; +60 / banner / FAB → `inscripcion-gate` | `024cc42` |
| **D-GOV-06** | Teaser B: 5 jugables + 10 bloqueadas + card +60; catálogo 75 | `024cc42`, código `2bd1bdc` |
| **D-003** | Solo 5 clases gratuitas jugables; 6–15 = teaser comercial | aclarado en `024cc42` |

### Pendientes (requieren Juan / Claude)

| ID | Tema |
|----|------|
| **D-GOV-04** | Pedagogía lecciones 6–75 / skill-graph guitarra |

### Restricciones explícitas

- **R-001** y **R-002**: **no se tocan** sin decisión aprobada y fase explícita.
- No expandir routing URL global (legacy), backend, schema, auth ni pagos desde este handoff.

---

## 5. Qué está publicado en GitHub (`origin/main = e047ac3`)

| Hash | Contenido |
|------|-----------|
| **`e047ac3`** | **Routing demo URL sync** — D-GOV-02/03 implementadas |
| **`4cdc911`** | D-GOV-02/03 aprobadas en `.agents/DECISIONS.md` |
| **`f20e795`** | **Academia 2 pasos** — instrumento → punto de partida |
| `1f04e7e` | Gobernanza operativa: `.agents/MEMORY.md`, `AGENTS.md`, `.cursorrules`, `skills.manifest.yaml` |
| `2bd1bdc` | **Teaser B publicado** — demo-path: 5+10+card, CTA híbrido en UI |

**Tests app:** **389/389**.

---

## 6. Funnel público (canónico)

```
GmusicLanding (home)  →  /
  └── AcademiaSection [2 pasos — f20e795, wizard in-place sin URL propia]
        · Paso 1: Elige tu instrumento (Guitarra activa; Teclado/Canto próximamente)
        · Paso 2: Elige tu punto de partida + CTA dinámico
        └── mi-camino-demo  →  /mi-camino-demo → PathDemoPage (teaser B, D-GOV-06)
              └── demo-clase-1..5  →  /demo-clase-* → DemoLessonPage
                    └── [5/5] → inscripcion-gate  →  /inscripcion → InscripcionGatePage
                          └── inscripcion-registro (sin URL pública) → WhatsApp bridge
```

**CTA híbrido (D-GOV-05):** clases 6–15 → sección planes en `home`; card “Más de 60”, banner y FAB → `inscripcion-gate` → `/inscripcion`.

**URL sync implementado (`e047ac3`):** `/`, `/alumno`, `/mi-camino`, `/mi-camino-demo`, `/demo-clase-1..5`, `/inscripcion`. **`inscripcion-registro` sin pathname.** Implementación: `student-zone-routing.ts` + `handlePageChange`.

**Deploy:** rutas SPA del funnel requieren rewrite a `index.html` en el host de producción.

---

## 7. Solo local / untracked (18 Jun 2026)

| Archivo | Estado | Notas |
|---------|--------|-------|
| `public/hero/threshold/logogmusic.png` | **untracked** | Asset visual hero — **fase futura**; no incluir en commits funnel/gobernanza |

### Academia 2 pasos — **publicado** (`f20e795`)

| Paso | Contenido |
|------|-----------|
| **1** | “Elige tu instrumento” — Guitarra (activa), Teclado y Canto (próximamente) |
| **2** | “Elige tu punto de partida” — Fundamento / Técnica / Crea × niveles |

Archivos en remoto: `AcademiaSection.tsx`, `AcademiaInstrumentSelector.tsx`, `academia-instruments.ts`, `fundamento-funnel.test.ts`.

---

## 8. Limpieza realizada (18 Jun 2026)

Eliminados del working tree (untracked obsoletos):

- `README.md` accidental en raíz del monorepo
- Handoffs gobernanza 15 Jun con numeración D-GOV antigua (3 archivos)

Conservado sin commit: `logogmusic.png` (ver §7).

---

## 9. Skills de referencia rápida

| Dominio | Skill |
|---------|-------|
| Funnel / conversión | `gmusic-funnel-conversion` |
| Mi Estudio | `gmusic-welcome` |
| Mi Camino | `gmusic-path` |
| Progresión / bloqueos | `gmusic-game-progression-architecture` |
| API / motor | `gmusic-learning-engine` |
| Protocolo Cursor | `gmusic-agent-workflow` |

Registro: `skills.manifest.yaml` · espejo: `./scripts/sync-skills.sh`

---

## 10. Próximos pasos sugeridos (orden)

1. **Commit documental** — sync MEMORY, CLAUDE, AGENTS, handoffs post-routing (cuando Juan autorice).
2. Claude/Codex: cerrar **D-GOV-04** (pedagogía 6–75).
3. **Deploy rewrites SPA** — funnel demo URLs en hosting.
4. Fase visual hero: `logogmusic.png` en ciclo aparte.
5. Fase 4 Auth — pausada hasta conversión WhatsApp real.

---

## 11. Prohibiciones al usar este handoff

- No tratar este documento como override de `.agents/DECISIONS.md`
- No codear, commitear ni pushear desde Claude/Codex/ChatGPT
- No tocar R-001 / R-002
- No reabrir Visual D (Canva/Canvas) — baseline landing = Visual A hero simplificado
- No incluir `logogmusic.png` en commits de producto/funnel/gobernanza

---

*Handoff operativo · Actualizado post-routing demo `e047ac3` (18 Jun 2026).*
