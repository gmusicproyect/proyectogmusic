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

## Estado actual del repo (13 Jun 2026)

| Item | Estado |
|------|--------|
| Último commit | `15e3433` — Visual D1 Canvas hero |
| Tests | 371/371 |
| Hero D1 | ✅ commitado — Canvas zoom, facade.jpg, copy exterior/interior, CTA |
| Hero D2 | ⬜ esperando `public/hero/threshold/interior.jpg` de Juan (diseño Canva) |
| Infra Opus | ⬜ sin commit — ver Tarea 1 abajo |
| Fase 4 Auth / Fase 5 Pagos | ⏸ pausadas hasta conversión WhatsApp (+56953429676) |

---

## Para Cursor — próximas tareas

### Tarea 1 — Commit infra Opus (lista para ejecutar, autorizada)

```
Archivos a commitear:
  CLAUDE.md
  AGENTS.md
  skills.manifest.yaml
  .gitignore
  scripts/claude-onboard.sh
  scripts/claude-intro-completa.sh
  scripts/claude-sync.sh
  scripts/claude-think-brief.sh
  scripts/install-superpowers-opus.sh
  scripts/opus-team-brief.sh
  .agents/skills/gmusic-opus-architect/
  .agents/skills/superpowers-brainstorming
  .agents/skills/superpowers-using-superpowers
  .agents/skills/superpowers-verification-before-completion
  .agents/skills/superpowers-writing-plans
  docs/vision/
  docs/plans/   (si tiene contenido)

Excluir siempre:
  public/hero/threshold/facade.png   (7MB — fuente Canva, no va al repo)

Mensaje de commit:
  chore(agents): Opus infra — skills, scripts, docs/vision, dual-track strategy
```

### Tarea 2 — Hero D2 interior (bloqueada — esperando asset Juan)

Cuando Juan entregue `public/hero/threshold/interior.jpg`:
1. Cambiar 1 línea en `src/app/components/marketing/sections/threshold-assets.ts`:
   ```ts
   // antes:
   interior: "https://images.unsplash.com/...",
   // después:
   interior: "/hero/threshold/interior.jpg",
   ```
2. `npm run app:test` → debe pasar 371/371
3. Commit: `feat(landing): Visual D2 — interior real del estudio`
4. Reportar resultado a Opus para validación visual

**NO TOCAR sin autorización Opus + Juan:** auth, pagos, Fase 4, Fase 5, zona alumno, cualquier cosa de Track B.

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
