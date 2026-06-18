# Gmusic Estudio — instrucciones para Claude / Opus

Proyecto: academia online de guitarra gamificada. **Opus = arquitecto. Cursor = ejecutor del repo.**

---

## ⚠️ ESTRATEGIA DUAL-TRACK — leer primero

| Track | Stack | Estado | Regla |
|-------|-------|--------|-------|
| **A (este repo)** | Vite + React + Express + Prisma | ✅ Live — MVP validación | Fixes acotados + decisiones D-GOV antes de routing/auth |
| **B (futuro)** | Next.js + Sanity + Railway + Cloudflare Stream | 🗂 Diseño en papel | No iniciar hasta primera conversión WhatsApp |

**Nunca mezclar código de Track B en Track A.** Los **389 tests** de Vite son referencia lógica de reglas de negocio para Track B, no migración.

---

## Repositorio canónico

| Campo | Valor |
|-------|-------|
| **GitHub** | https://github.com/gmusicproyect/proyectogmusic |
| **Repo anterior** | `estudiosgpt2024-crypto/paginawebgmusic` — **SUPERSEDED** |
| **Rama** | `main` |
| **`origin/main`** | **`e047ac3`** (18 Jun 2026) |
| **App path** | `Página de cursos de música/` |

**Handoff operativo:** `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`

---

## Estado actual del repo (18 Jun 2026)

| Item | Estado |
|------|--------|
| **HEAD / origin/main** | `e047ac3` — feat(routing): sync demo funnel URLs |
| Commits recientes | `4cdc911` D-GOV-02/03 aprobadas · `1bd2867` doc sync · `f20e795` Academia 2 pasos |
| **Tests app** | **389/389** |
| **Landing hero** | **Visual A** simplificado — validado Juan (scroll Apple → Academia) |
| **Visual D** Canva/Canvas | ❌ **SUPERSEDED** — no reabrir |
| **Academia 2 pasos** | ✅ **publicado** — instrumento → punto de partida (solo Guitarra activa; D-007) |
| **Routing demo URL** | ✅ **publicado** — D-GOV-02/03 implementadas (`e047ac3`) |
| **Teaser B + CTA híbrido** | ✅ publicado (`2bd1bdc`, D-GOV-05/06) |
| **Gobernanza doc** | ✅ D-GOV-01, working map, D-GOV-02/03 en `4cdc911` |
| **Asset local sin commit** | `public/hero/threshold/logogmusic.png` — fase visual futura |
| **Fase 4 Auth / Fase 5 Pagos** | ⏸ pausadas hasta conversión WhatsApp (+56953429676) |
| **D-GOV pendiente** | D-GOV-04 pedagogía 6–75 |
| **Deploy pendiente** | Rewrites SPA funnel → `index.html` |
| **R-001 / R-002** | Documentados — **no mitigar** sin decisión explícita |

---

## Academia — flujo publicado (`f20e795`)

| Paso | UI | Regla |
|------|-----|-------|
| **1** | “Elige tu instrumento” — Guitarra, Teclado, Canto | Solo **Guitarra** navega (D-007) |
| **2** | “Elige tu punto de partida” — Fundamento / Técnica / Crea × niveles | `InteractiveLevelSelector` → `mi-camino-demo` |

Mismo landing (`#academia`); botón “← Cambiar instrumento”. Landing `#academia` sin URL propia (fuera de D-GOV-02). Navegación al demo → `/mi-camino-demo`.

Archivos clave: `AcademiaSection.tsx`, `AcademiaInstrumentSelector.tsx`, `academia-instruments.ts`.

---

## Landing Visual A — baseline (no Visual D)

| Sección | Estado |
|---------|--------|
| Hero | Logo + bienvenida, scroll hacia Academia |
| Academia | 2 pasos instrumento → programa + CTA dinámico |
| Planes / Comunidad / Contacto | Fondos PNG por sección |

Handoff histórico hero: `docs/vision/handoffs/2026-06-14-hero-simplificado-handoff-opus.md`  
Visual D obsoleto: `docs/vision/handoffs/2026-06-14-hero-d2-ux-handoff.md` (SUPERSEDED)

---

## Para Cursor — prioridades actuales

1. **Cerrar D-GOV-04** (pedagogía 6–75) con Juan/Opus.
2. **Deploy rewrites SPA** — rutas funnel en hosting.
3. **Fase visual hero** — `logogmusic.png` en ciclo aparte (cuando Juan autorice).
4. **Fase 4 Auth** — pausada hasta conversión WhatsApp real.

**NO TOCAR sin autorización Opus + Juan:** auth, pagos, schema, routing URL global (legacy), R-001, R-002, Track B.

---

## Al iniciar sesión (Opus)

1. Leer este archivo + `.agents/MEMORY.md` + `.agents/DECISIONS.md`
2. Handoff operativo: `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`
3. Activar skill **`gmusic-opus-architect`**
4. Usar Superpowers: `brainstorming` antes de diseñar, `writing-plans` tras spec aprobada
5. **No implementar código** — generar spec/plan/brief para Cursor
6. Juan autoriza fases y commits

## Superpowers (plugin)

```text
/plugin install superpowers@claude-plugins-official
```

Opus usa solo: brainstorming, writing-plans, verification-before-completion.
El resto (TDD, executing-plans, debugging) es para **Cursor**.

## Handoff Opus → Cursor

Palabra clave: **Retomar Gmusic**

Brief ≤15 líneas usando plantilla en `.agents/skills/gmusic-opus-architect/SKILL.md`

## Visión producto

- Metodología: **Fundamento → Técnica → Crea** (microciclos)
- Web Track A = embudo + demo + landing | App futura Track B = micrófono, afinador
- Fase 4 Auth / Fase 5 pagos: **pausadas** hasta conversión WhatsApp

## Más contexto

- Protocolo Cursor: `.agents/skills/gmusic-agent-workflow/SKILL.md`
- Skills disponibles: `AGENTS.md` + `skills.manifest.yaml`
- Estado operativo: `.agents/PROJECT_STATUS.md`
- Arquitectura: `docs/architecture/gmusic-architecture-working-map.md` (D-GOV-01)
- Specs Track B: `docs/vision/specs/`
