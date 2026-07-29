# T-FLOW-05 — Receta de repro runtime (para Juan)

**Base:** análisis estático en `t-flow-05-no-repro-estatico-2026-07-28.md` (candidato único: oscilación stage-fit ↔ ResizeObserver).
**Objetivo:** confirmar o descartar «Maximum update depth exceeded» en `GmusicPath`.

## Pasos (5 min)

1. `scripts/dev/start-smoke-local.sh` · login ACTIVE con path de **≤ 8 nodos** publicados → `/mi-camino`.
2. Abrir DevTools (consola visible) — StrictMode ya activo en dev.
3. Pegar el snippet de abajo en la consola y observar la consola por 30–60 s.
4. Repro positivo = error «Maximum update depth exceeded» con stack en `PathCarouselCards` (effect stage-fit).
5. Resultado → anotar en `t-flow-05-no-repro-estatico-2026-07-28.md`: **«repro confirmado <fecha>»** (y aplicar el fix propuesto ahí) o **«no repro runtime <fecha>»** y cerrar ticket.

## Snippet consola (cero dependencias)

```js
// Oscila el ancho de la ventana alrededor del umbral de fit y navega rápido el carrusel.
(async () => {
  const arrows = () => [...document.querySelectorAll("button")].filter(b => b.querySelector("svg"));
  const base = window.innerWidth;
  for (let i = 0; i < 120; i++) {
    // navegación rápida
    const [prev, next] = arrows();
    (i % 2 ? prev : next)?.click();
    // oscilación de resize (dispara ResizeObserver del contenedor)
    window.dispatchEvent(new Event("resize"));
    document.querySelector("main, #root > div")?.style.setProperty("padding-right", `${(i % 2) * 15}px`);
    await new Promise(r => setTimeout(r, 50));
  }
  console.log("T-FLOW-05: secuencia terminada sin crash =", true);
})();
```

*(Si tu ventana no está cerca del umbral, redimensiónala manualmente mientras corre el snippet: el punto crítico es el ancho donde el carrusel alterna entre fila fija y scroll.)*
