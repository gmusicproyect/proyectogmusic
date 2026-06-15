# Handoff Opus — Hero simplificado validado (Ciclo 1)

**Fecha:** 14 Jun 2026  
**De:** Juan Pablo (PO) + Cursor (ejecutor)  
**Para:** Opus (arquitecto)  
**Palabra clave:** Retomar Gmusic  
**Estado:** ✅ Juan validó UX scroll hero — listo para siguiente ciclo Opus

---

## Resumen ejecutivo

El hero landing quedó **simplificado y aprobado por Juan** tras iteración de scroll. Se descartó Visual D (Canva + Canvas + fachada/interior). El baseline acordado es **Hero A**: atmósfera CSS + frase de bienvenida + logo centrado con zoom tipo Apple → handoff inmediato a **AcademiaSection** (CTA demo vive ahí, no en hero).

**Working tree sin commit.** Rama `main`, ahead 3 vs `origin/main`.

---

## Decisiones de producto cerradas (no reabrir sin Juan)

| Decisión | Estado |
|----------|--------|
| Hero sin fachada, sin fotos, sin Canvas | ✅ Baseline |
| Sin subtítulo ni CTA en hero | ✅ CTA demo en Academia |
| Logo navbar separado del momento hero | ✅ |
| Scroll Apple: logo crece hacia adelante, fade al final | ✅ |
| Canva fuera del pipeline | ❌ Descartado — assets futuros Illustrator → SVG (Visual E, fase 2) |
| Commit ciclo hero | ⬜ Pendiente autorización explícita de Juan |

---

## Parámetros UX hero (validados por Juan — 14 Jun)

Archivo: `src/app/components/marketing/sections/HeroSection.tsx`

| Parámetro | Valor | Nota |
|-----------|-------|------|
| Altura hero | `160vh` | Rango Apple; sticky 100vh |
| Zoom logo | progreso `0.06 → 0.82` | escala `1 → 2.75` |
| Fade logo | progreso `0.82 → 0.96` | último ~14% del scroll |
| Glow / backdrop | apagan en `0.96` | evita pantalla negra post-logo |
| Overlap Academia | `-12vh` en wrapper | `GmusicLanding.tsx` |
| Copy bienvenida | *"Bienvenidos a esta nueva experiencia de academia"* | human-in-the-loop si se cambia |
| Logo | `BrandLogo` + `public/assets/brand/logo-gmusic.svg` | — |

**Criterio UX logrado:** al iniciar fade del logo, Academia ya asoma; ~0vh de pantalla negra vacía; ~10vh de Academia visible al terminar fade.

Handoff anterior superseded: `docs/vision/handoffs/2026-06-14-hero-d2-ux-handoff.md` (Visual D Canva).

---

## Archivos tocados (working tree, sin commit)

| Archivo | Cambio |
|---------|--------|
| `HeroSection.tsx` | Hero simplificado + scroll tuning |
| `GmusicLanding.tsx` | Wrapper Academia `-12vh` |
| `threshold-hero.test.ts` | Asserts sin fotos/CTA; `160vh` |
| `Navbar.tsx` | Grid 3 cols; auth degrade; nav desktop >640px |
| `BrandLogo.tsx` + `logo-gmusic.svg` | Logo corporativo |
| `FooterSection.tsx` | Usa BrandLogo |
| `fundamento-funnel.test.ts` | CTA demo ya no en hero |
| `responsive.css` | Breakpoint nav 640px |
| Eliminados | `threshold-assets.ts`, `facade.jpg`, `doortransparente.png` |

Assets nuevos sin commit: `public/assets/brand/`, `public/hero/threshold/logogmusic.png`

---

## Verificación real (Cursor — no hardcodear en specs)

```bash
npm run app:typecheck && npm run app:test && npm run build
```

- **app:test:** 372/372 PASS (última corrida post-tuning)
- **api:test:** requiere Postgres local — puede fallar sin DB
- **build:** OK en sesiones previas del ciclo

---

## Protocolo Opus ↔ Cursor

Regla persistente: `.cursor/rules/loop.mdc` + handoff `docs/vision/handoffs/2026-06-14-ciclo-cerrado-cursor-opus.md`

Cada spec para Cursor debe incluir: **ESTADO → RUTINA → VERIFICACIÓN → CRITERIO DE SALIDA**

Cursor se congela tras 3 reintentos o si falta OK de Juan en producto/estética/pagos/seguridad.

---

## Próximos ciclos sugeridos para Opus

### Ciclo 1 — Cierre documental + commit (requiere OK Juan)

1. Marcar superseded: `2026-06-14-hero-d2-ux-handoff.md` y specs Canva obsoletas
2. Actualizar `.agents/PROJECT_STATUS.md` (aún dice Visual D1/D2 Canva — desactualizado)
3. Actualizar `CLAUDE.md` / `CURSOR-CONTEXT.md` si aplica
4. **Commit** working tree hero + navbar + brand — solo con autorización explícita de Juan

### Ciclo 2 — Visual E (cuando Juan suba assets)

- Pipeline: Illustrator → SVG en `public/assets/hero/`
- Sin Canva, sin Canvas en hero
- Spec modular cuando existan vectores

### Fuera de scope inmediato

- Fase 4 Auth / Fase 5 Flow+Resend — pausadas (condicionadas a conversión WhatsApp)
- Rutas URL nuevas — requiere fase explícita de routing global (`AGENTS.md`)

---

## Human-in-the-loop pendiente (Juan)

- [ ] Autorizar commit del ciclo hero
- [ ] Copy final frase bienvenida (si cambia)
- [ ] Tamaño/escala logo en estado inicial (si ajuste fino)
- [ ] Subir vectores Illustrator para Visual E (fase 2)

---

## Skills por dominio

| Tarea | Skill |
|-------|-------|
| Hero / landing funnel | `gmusic-funnel-conversion` |
| Scroll / gamificación visual | `gmusic-edu-gamified-design`, `gmusic-visual-vfx` |
| Protocolo trabajo | `gmusic-agent-workflow` |

Índice: `AGENTS.md` · Diseño local: `DESIGN.md`

---

## ACK solicitado a Opus

1. Confirmar baseline Hero A como línea oficial (Visual D superseded)
2. Emitir spec Ciclo 1 documental + criterio de commit message
3. Definir spec Visual E cuando Juan entregue SVGs
