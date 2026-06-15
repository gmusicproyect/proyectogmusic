# Gmusic Estudio — instrucciones para Claude / Opus

Proyecto: academia online de guitarra gamificada. **Opus = arquitecto. Cursor = ejecutor del repo.**

---

## ⚠️ ESTRATEGIA DUAL-TRACK — leer primero

| Track | Stack | Estado | Regla |
|-------|-------|--------|-------|
| **A (este repo)** | Vite + React + Express + Prisma | ✅ Live — MVP validación | Solo fixes críticos + cerrar hero visual |
| **B (futuro)** | Next.js + Sanity + Railway + Cloudflare Stream | 🗂 Diseño en papel | No iniciar hasta primera conversión WhatsApp |

**Nunca mezclar código de Track B en Track A.** Los 371 tests de Vite son referencia lógica de reglas de negocio para Track B, no migración.

---

## Estado actual del repo (14 Jun 2026)

| Item | Estado |
|------|--------|
| Último commit | `0f7415a` — Opus infra |
| Commit previo hero | `15e3433` — Visual D1 Canvas (facade.jpg en repo) |
| Tests | **372/372** |
| Hero D1+D2+UX | ✅ **código listo en working tree — sin commit** |
| Assets Juan | `facade.png` + `interior.png` en `public/hero/threshold/` (untracked) |
| Validación Juan | ⬜ desktop + móvil scroll completo |
| Infra Opus | ✅ commitado (`0f7415a`) |
| Fase 4 Auth / Fase 5 Pagos | ⏸ pausadas hasta conversión WhatsApp (+56953429676) |

**Handoff detallado hero:** `docs/vision/handoffs/2026-06-14-hero-d2-ux-handoff.md`  
**Protocolo ciclo cerrado Cursor↔Opus:** `docs/vision/handoffs/2026-06-14-ciclo-cerrado-cursor-opus.md` · regla `.cursor/rules/loop.mdc`

---

## Hero Visual D — estado técnico (14 Jun)

| Acto | Qué pasa |
|------|----------|
| Exterior | Fachada `facade.png` + copy |
| Umbral | Canvas zoom puerta → crossfade |
| Interior | `interior.png` sticky arriba + CTA |
| Salida | Sticky suelta → Academia |

**Bug resuelto:** `useScroll` no funcionaba con sticky → pantalla negra. Fix: scroll nativo con `getBoundingClientRect()`.

**Pendiente commit (autorización Juan):** `HeroSection.tsx`, `threshold-assets.ts`, assets PNG, `useDemoProgress.ts` restaurado.

---

## Para Cursor — próximas tareas

### Tarea 1 — Commit hero D1+D2+UX (cuando Juan autorice)

```
Archivos:
  src/app/components/marketing/sections/HeroSection.tsx
  src/app/components/marketing/sections/threshold-assets.ts
  src/app/components/marketing/sections/threshold-hero.test.ts
  src/app/hooks/useDemoProgress.ts
  public/hero/threshold/facade.png
  public/hero/threshold/interior.png

Mensaje sugerido:
  feat(landing): Visual D1+D2 — hero umbral Canva + scroll UX sticky
```

### Tarea 2 — Validación visual Juan

1. Recarga dura Cmd+Shift+R en `http://localhost:5173/`
2. Scroll completo: fachada → puerta → interior fijo → Academia
3. Probar móvil (375px) y desktop
4. Reportar a Opus si timing necesita ajuste

**NO TOCAR sin autorización Opus + Juan:** auth, pagos, Fase 4, Fase 5, zona alumno, Track B.

---

## Al iniciar sesión (Opus)

1. Leer este archivo + `.agents/PROJECT_STATUS.md`
2. Activar skill **`gmusic-opus-architect`** (`.agents/skills/gmusic-opus-architect/SKILL.md`)
3. Usar Superpowers: `brainstorming` antes de diseñar, `writing-plans` tras spec aprobada
4. **No implementar código** — generar spec/plan/brief para Cursor
5. Juan autoriza fases y commits

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
- Web Track A = embudo + demo + hero | App futura Track B = micrófono, afinador
- Fase 4 Auth / Fase 5 pagos: **pausadas** hasta conversión WhatsApp

## Más contexto

- Protocolo Cursor: `.agents/skills/gmusic-agent-workflow/SKILL.md`
- Skills disponibles: `AGENTS.md` + `skills.manifest.yaml`
- Estado operativo: `.agents/PROJECT_STATUS.md`
- Specs Track B: `docs/vision/specs/`
