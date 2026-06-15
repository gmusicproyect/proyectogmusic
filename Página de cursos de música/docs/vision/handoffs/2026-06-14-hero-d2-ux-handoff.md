> ⚠️ **SUPERSEDED 14 Jun 2026.** Visual D Canva/Canvas descartado.
> Estado actual: **Visual A** (hero simplificado + fondos PNG landing). Pipeline futuro: **Visual E** Illustrator/SVG.

# Handoff Opus — Hero Visual D (D1 + D2 + UX scroll)

**Fecha:** 14 Jun 2026  
**De:** Cursor (ejecutor)  
**Para:** Opus / Claude (arquitecto) + Juan (PO)  
**Palabra clave:** Retomar Gmusic

---

## Resumen ejecutivo

El hero umbral de la landing (**Visual D**) está **funcional en local** con assets reales de Juan, pero **sin commit**. Se corrigió un bug crítico de scroll que producía pantalla negra y desorden narrativo (Academia antes que interior).

**Tests:** 372/372 (`npm run app:test`)  
**Último commit en main:** `0f7415a` (infra Opus) — el hero D1+D2 vive en working tree.

---

## Assets entregados (Juan → Canva)

| Archivo | Ruta | Dimensiones | Tamaño | Estado |
|---------|------|-------------|--------|--------|
| Fachada | `public/hero/threshold/facade.png` | 1920×1080 | ~702 KB | ✅ Conectado (untracked) |
| Interior | `public/hero/threshold/interior.png` | 1920×1080 | ~918 KB | ✅ Conectado (untracked) |
| Puerta PNG | `doortransparente.png` | — | — | ❌ Eliminado del folder (Canvas basta; Opción A Opus) |

**Nota:** La spec D2 pedía `interior.jpg`; Juan entregó **`interior.png`**. Código apunta a PNG.

El interior incluye texto **“Bienvenido a Gmusic Estudio”** en la pared (parte del arte). El overlay HTML ya **no duplica** ese H1.

---

## Secuencia UX acordada (4 actos)

| Acto | Scroll progress | Qué ve el usuario |
|------|-----------------|-------------------|
| **1 Exterior** | 0 → ~24 % | Fachada + “Estás a un paso de dominar la guitarra.” |
| **2 Umbral** | ~14 → ~50 % | Canvas zoom hacia la puerta; crossfade a interior |
| **3 Interior** | ~50 → ~62 % | Recepción (bienvenida en imagen) + “Tu camino comienza aquí” + CTA |
| **4 Salida** | ~62 → 100 % | Interior **fijo arriba** (sticky); al terminar el hero, sube y aparece Academia |

**Sin fade a negro** entre actos. Academia (“Elige tu punto de partida”) solo entra cuando el sticky suelta.

---

## Bug crítico resuelto (14 Jun)

### Síntoma (reportado por Juan)
- Al hacer scroll: pantalla negra
- Aparece “Elige tu punto de partida” (Academia) antes/desordenado
- La imagen de bienvenida no se quedaba arriba; no había sensación de “entrar y luego bajar”

### Causa raíz
`useScroll` de Framer Motion **no actualizaba `scrollYProgress`** con el contenedor sticky. En scroll real:
- `intOpacity` permanecía en 0 (interior invisible)
- Gradiente de fachada en opacidad 1 (capa oscura encima)
- Canvas se apagaba → fondo `#080808` = negro

Verificado en browser: a scrollY=1400 px, interior layer opacity=0 pese a imagen cargada.

### Fix aplicado
- Reemplazar `useScroll` por tracking nativo: `getBoundingClientRect()` + `scrollYProgress.set(p)`
- Crossfade más temprano fachada → interior; ocultar canvas cuando interior > 35 %
- Eliminar `heroExitOpacity` (generaba pantalla negra antes de Academia)
- Hero height: **250vh** (dwell del interior sticky)
- Restaurar `useDemoProgress.ts` (archivo faltaba; rompía Vite al reiniciar)

---

## Archivos modificados (sin commit)

```
src/app/components/marketing/sections/HeroSection.tsx      — scroll nativo, UX 4 actos
src/app/components/marketing/sections/threshold-assets.ts    — facade.png + interior.png
src/app/components/marketing/sections/threshold-hero.test.ts — 372 tests
src/app/hooks/useDemoProgress.ts                           — restaurado desde git
public/hero/threshold/facade.png                             — untracked
public/hero/threshold/interior.png                           — untracked
public/hero/threshold/facade.jpg                           — deleted
public/hero/threshold/doortransparente.png                 — deleted
```

---

## Criterios de cierre hero (checklist Opus)

| # | Criterio | Estado |
|---|----------|--------|
| 1 | D1 Canvas zoom + facade real | ✅ código listo |
| 2 | D2 interior real conectado | ✅ `interior.png` |
| 3 | Scroll UX: interior sticky → suelta → Academia | ✅ fix 14 Jun |
| 4 | Validación Juan desktop + móvil | ⬜ pendiente |
| 5 | `prefers-reduced-motion` | ✅ zoom 1× / 6× touch / 12× desktop |
| 6 | Commit autorizado Juan | ⬜ pendiente |

---

## Copy en hero (estado actual)

| Capa | Texto | Destino |
|------|-------|---------|
| Exterior | “Estás a un paso de dominar la guitarra.” | — |
| Interior (imagen) | “Bienvenido a Gmusic Estudio” | — |
| Interior (overlay) | “Tu camino comienza aquí” | — |
| CTA | “Ver clase gratuita” | `mi-camino-demo` |
| SEO | `h1.sr-only` “Gmusic Estudio — Academia online de guitarra” | — |

---

## Para Opus — decisiones abiertas

1. **¿Aprobar commit D1+D2+UX** con `facade.png` + `interior.png` en repo (~1.6 MB total)?
2. **¿Ajustar timing scroll?** (250vh, rangos 0.14–0.62) tras validación Juan.
3. **¿Interior.png vs exportar JPEG** por peso (<600 KB spec D2)?
4. **Hero “cerrado”** → ¿siguiente prioridad Track A? (validación WhatsApp, no Fase 4/5)

---

## NO TOCAR (sin Opus + Juan)

Auth, pagos, Fase 4/5, zona alumno, Track B (Next.js/Sanity).

---

## Brief sugerido post-validación Juan

```
Objetivo: commit feat(landing): Visual D1+D2 — hero umbral con assets Canva y scroll UX
Archivos: HeroSection, threshold-assets, threshold-hero.test, facade.png, interior.png
Tests: 372/372
Criterio: Juan OK desktop + móvil scroll completo
NO TOCAR: resto del funnel
Autorizado Juan: [pendiente]
```
