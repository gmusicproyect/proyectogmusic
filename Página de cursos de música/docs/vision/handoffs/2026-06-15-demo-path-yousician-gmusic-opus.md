# Handoff Opus — Camino demo estilo Yousician + identidad Gmusic

**Fecha:** 15 Jun 2026  
**De:** Juan Pablo (PO) + Cursor  
**Para:** Opus (arquitecto / diseño)  
**Palabra clave:** Retomar Gmusic  
**Estado:** Implementado en working tree · **sin commit** · tests 372/372

---

## Contexto PO (por qué existe este cambio)

Juan completó las 5 clases demo en su navegador (`localStorage`). Al volver a **Mi Camino demo** siempre veía el estado “camino completado” y no podía revisar la **experiencia de primera visita** (clase 1 activa, 2–5 bloqueadas).

Además compartió capturas de **Yousician** como referencia estructural: panel de bienvenida + carrusel horizontal de tarjetas + barra de nivel abajo. Quiere **esa UX**, no la marca verde de Yousician.

---

## Qué se implementó (resumen ejecutivo)

| Área | Antes | Ahora |
|------|-------|-------|
| Layout | Intro arriba + tarjetas sueltas | Dashboard `#111`: sidebar izq + carrusel + barra inferior |
| Tarjetas | Cards verticales simples | Carrusel Yousician-like: thumbnail, categoría, 3 estrellas, CTA |
| Progreso visual | Solo estado nodo | Barra **Fundamento · Clase 1–5** + % completado |
| Primera visita | Solo borrar localStorage | **“Ver como primera vez”** (preview sin borrar progreso) |
| Identidad | Gmusic tokens | Dorado `#C9A84C`, charcoal, Playfair/Inter; CTA éxito `--edu-success` |

---

## Archivos tocados (working tree, no commitados)

```
M  src/app/pages/PathDemoPage.tsx              (+250/-~120 líneas aprox.)
M  src/app/components/gmusic/DemoPathCards.tsx (+532 refactor)
M  src/app/components/gmusic/path/PathPageIntro.tsx  (props title/description/compact)
M  src/app/hooks/useDemoProgress.ts            (+ resetProgress)
M  src/app/pages/path-demo-page.test.ts        (asserts preview + reset)
A  src/app/components/gmusic/DemoPathLevelBar.tsx    (nuevo)
?? public/hero/threshold/logogmusic.png        (untracked, no relacionado)
```

**Ruta de entrada:** `currentPage === "mi-camino-demo"` · Landing → Academia → **Ver clase gratuita** · URL pathname no sincronizada (sigue regla AGENTS.md).

---

## Arquitectura UI (layout)

```
┌─────────────────────────────────────────────────────────────┐
│ DemoAcademyNav (Mi Camino activo)                           │
├─────────────────────────────────────────────────────────────┤
│ [Banner preview] — solo si "Ver como primera vez"           │
│ [Celebración 5/5 + botones] — solo si demoFinished          │
├──────────────────┬──────────────────────────────────────────┤
│ PathPageIntro    │ DemoPathCards (carrusel horizontal)      │
│ compact sidebar  │  ← → flechas · dots · milestones           │
│ copy dinámico    │  tarjetas 240px · snap scroll              │
├──────────────────┴──────────────────────────────────────────┤
│ DemoPathLevelBar — Fundamento · barra % · Clase 1–5         │
└─────────────────────────────────────────────────────────────┘
│ LockedDemoNodePanel — debajo si clic en tarjeta bloqueada   │
```

### Copy sidebar (`getWelcomeCopy`)

| Estado | Título |
|--------|--------|
| 0 clases | “¡Bienvenido! Tu camino con la guitarra empieza aquí” |
| 1–4 clases | “Sigue tu camino musical” |
| 5/5 completado | “Tu camino completado” |

Badge fijo: `Guitarra · Mes 1 · Fundamento`.

---

## DemoPathCards — decisiones de producto

- **5 tarjetas** mapeadas desde `DEMO_LESSONS` vía `buildDemoModules()`
- **Thumbnail:** gradientes por clase (`CARD_GRADIENTS`) — placeholder hasta fotos reales
- **Estrellas:** 3 doradas si `completed`; vacías si activa/bloqueada
- **CTA en tarjeta enfocada:**
  - Activa → **Continuar** (verde `--edu-success`, sombra tipo chunky)
  - Completada → **Repetir** (outline verde)
  - Bloqueada → **Bloqueada** (disabled)
- **Focus:** escala 1 vs 0.88; locked opacity 0.35; no-focus 0.55
- **Borde activo:** dorado + glow; completada borde verde suave
- **Milestones:** iconos `Award` / `Music2` entre clases 2↔3 y 4↔5
- **Navegación:** flechas laterales, dots inferiores, click tarjeta = focus, doble acción = entrar lección

---

## DemoPathLevelBar — barra inferior

- Label **Nivel / Fundamento**
- Barra de progreso dorada (`completedCount / 5`)
- 5 círculos numerados; activo = anillo dorado + glow
- Completados = relleno dorado sólido

---

## Preview “primera visita” (fix del bug PO)

```tsx
// PathDemoPage.tsx
const displayCompleted = previewAsFirstVisit ? [] : completedLessons;
const showCompletedState = demoFinished && !previewAsFirstVisit;
```

| Acción | Efecto |
|--------|--------|
| **Ver como primera vez** | UI 0/5; localStorage intacto |
| **Volver a mi progreso** | Restaura estado real |
| **Reiniciar y borrar progreso** | `resetProgress()` → borra `gmusic:demo_v1` |

Storage key: `gmusic:demo_v1` · hook: `useDemoProgress.ts`.

---

## Referencia Yousician vs Gmusic (para revisión Opus)

| Yousician | Gmusic (implementado) | ¿Opus valida? |
|-----------|----------------------|---------------|
| Verde neón activo | Dorado `#C9A84C` activo + verde solo CTA acción | ☐ |
| Logo U watermark | Sin watermark de marca ajena | ☐ |
| Sub-nav Ruta/Ejercicios/Metallica | Solo `DemoAcademyNav` (Inicio / Mi Camino / Mi Estudio) | ☐ |
| Nivel 1–10 | Clase 1–5 (demo acotado) | ☐ |
| Fotos reales en cards | Gradientes placeholder | ☐ pendiente assets |
| Stars parciales por score | 0 o 3 estrellas (binario por ahora) | ☐ ¿futuro micro-score? |

---

## Cómo probar (Juan / Opus)

```bash
cd "Página de cursos de música"
npm run dev
# Landing → Academia → Ver clase gratuita
# O selector dev → mi-camino-demo
```

| Escenario | Cómo |
|-----------|------|
| Primera visita real | Reiniciar progreso o `localStorage.removeItem('gmusic:demo_v1')` |
| Simular primera visita con 5/5 | Botón **Ver como primera vez** |
| Completado | Terminar clase 5 o tener `[1,2,3,4,5]` en storage |
| Mobile | Validar carrusel 375px — **no QA visual formal aún** |

Tests: `npm run app:test` → **372/372** (incl. `path-demo-page.test.ts`).

---

## Fuera de scope de este PR

- **Mi Camino suscriptor** (`GmusicPath.tsx` / `/mi-camino`) — distinto del demo 5 clases
- Thumbnails reales / frames de video
- PostHog events nuevos para preview mode
- Commit / deploy — esperar OK Juan + Opus

---

## Preguntas para Opus (revisión)

1. ¿El verde `--edu-success` en CTA “Continuar” convive bien con dorado Gmusic o conviene CTA dorado sólido?
2. ¿Milestones entre clases 2 y 4 son suficientes para el demo de 5, o sobran?
3. ¿Extender este patrón carrusel a **Mi Camino suscriptor** (`GmusicPath`) en fase posterior?
4. ¿Stars binarias (0/3) vs progreso parcial por ejercicio — alineado con learning engine futuro?
5. ¿Aprobar commit como `feat(demo-path): layout Yousician-style con identidad Gmusic`?

---

## Relación con Track A / Fase 4

- Funnel intacto: demo → gate → registro → WhatsApp
- Este cambio es **solo UX demo público**; no toca auth, MP, PostHog ni Prisma
- Umbral Fase 4 sigue: evento PostHog real + lead WhatsApp confirmado por Juan

Ver handoff previo: `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md`
