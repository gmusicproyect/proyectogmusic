# Gmusic Estudio — instrucciones para Claude / Opus

Proyecto: academia online de guitarra gamificada. **Opus = arquitecto. Cursor = ejecutor del repo.**

---

## ⚠️ ESTRATEGIA DUAL-TRACK — leer primero

| Track | Stack | Estado | Regla |
|-------|-------|--------|-------|
| **A (este repo)** | Vite + React + Express + Prisma | ✅ Live — MVP validación | Fixes acotados + decisiones D-GOV antes de routing/auth |
| **B (futuro)** | Next.js + Sanity + Railway + Cloudflare Stream | 🗂 Diseño en papel | No iniciar hasta primera conversión WhatsApp |

**Nunca mezclar código de Track B en Track A.** Los **377 tests** de Vite son referencia lógica de reglas de negocio para Track B, no migración.

---

## Repositorio canónico

| Campo | Valor |
|-------|-------|
| **GitHub** | https://github.com/gmusicproyect/proyectogmusic |
| **Repo anterior** | `estudiosgpt2024-crypto/paginawebgmusic` — **SUPERSEDED** |
| **Rama** | `main` |
| **`origin/main`** | **`f20e795`** (18 Jun 2026) |
| **App path** | `Página de cursos de música/` |

**Handoff operativo:** `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`

---

## Estado actual del repo (18 Jun 2026)

| Item | Estado |
|------|--------|
| **HEAD / origin/main** | `f20e795` — feat(academia): two-step instrument then starting point funnel |
| Commits recientes | `1f04e7e` gobernanza · `2bd1bdc` teaser B demo-path · `024cc42` D-GOV-05/06 |
| **Tests app** | **377/377** |
| **Landing hero** | **Visual A** simplificado — validado Juan (scroll Apple → Academia) |
| **Visual D** Canva/Canvas | ❌ **SUPERSEDED** — no reabrir |
| **Academia 2 pasos** | ✅ **publicado** — instrumento → punto de partida (solo Guitarra activa; D-007) |
| **Teaser B + CTA híbrido** | ✅ publicado (`2bd1bdc`, D-GOV-05/06) |
| **Gobernanza doc** | ✅ D-GOV-01, working map, MEMORY/AGENTS alineados en `1f04e7e` |
| **Pendiente doc sync** | Commit documental post-`f20e795` (MEMORY, este archivo, handoffs) |
| **Asset local sin commit** | `public/hero/threshold/logogmusic.png` — fase visual futura |
| **Fase 4 Auth / Fase 5 Pagos** | ⏸ pausadas hasta conversión WhatsApp (+56953429676) |
| **D-GOV pendientes** | D-GOV-02 URLs demo · D-GOV-03 routing · D-GOV-04 pedagogía 6–75 |
| **R-001 / R-002** | Documentados — **no mitigar** sin decisión explícita |

---

## Academia — flujo publicado (`f20e795`)

| Paso | UI | Regla |
|------|-----|-------|
| **1** | “Elige tu instrumento” — Guitarra, Teclado, Canto | Solo **Guitarra** navega (D-007) |
| **2** | “Elige tu punto de partida” — Fundamento / Técnica / Crea × niveles | `InteractiveLevelSelector` → `mi-camino-demo` |

Mismo landing (`#academia`); botón “← Cambiar instrumento”. Sin nueva URL (D-GOV-02/03 pendiente).

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

1. **Cerrar D-GOV-02/03/04** con Juan/Opus antes de sync URL demo.
2. **Fase visual hero** — `logogmusic.png` en ciclo aparte (cuando Juan autorice).
3. **Fase 4 Auth** — pausada hasta conversión WhatsApp real.

**NO TOCAR sin autorización Opus + Juan:** auth, pagos, schema, routing URL global, R-001, R-002, Track B.

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
