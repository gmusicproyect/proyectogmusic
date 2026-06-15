> ⚠️ **SUPERSEDED 14 Jun 2026.** Visual D Canva/Canvas descartado.
> Estado actual: **Visual A** (hero simplificado). Pipeline futuro: **Visual E** Illustrator/SVG.

# Visual D2 — Interior del Hero Umbral

**Fecha:** 13 Jun 2026  
**Autor:** Opus (arquitecto)  
**Estado:** pendiente aprobación Juan → brief para Cursor  
**Dependencia:** D1 Canvas zoom sin commit (autorizar D1 antes de D2)

---

## Contexto narrativo

El Hero "El Umbral" tiene tres actos:

| Acto | ScrollYProgress | Qué ve el usuario |
|------|----------------|-------------------|
| **Exterior** | 0 → 0.5 | Fachada de la academia. Canvas zoom entra por la puerta. |
| **Transición** | 0.42 → 0.62 | La fachada se disuelve. El interior emerge. |
| **Interior** | 0.62 → 1.0 | Estudio oscuro. Guitarra. Luz dorada. "Bienvenido." |

D2 diseña el **Acto 3**: la imagen que el usuario ve al cruzar la puerta.

---

## Mood

- **Tono:** intimidad + promesa. Como entrar por primera vez a un estudio de música profesional.
- **Referencia emocional:** esa sensación de "quiero aprender a tocar aquí".
- **No es:** sala de clases, escuela, biblioteca de videos. Es un estudio con carácter.

---

## Brief para Canva — imagen `interior.jpg`

### Dimensiones
**1920 × 1080 px** mínimo. Ideal: 3840 × 2160 (4K) si Canva lo permite a la calidad correcta.

### Composición
```
┌─────────────────────────────────────┐
│   sombra    │   GUITARRA    │ sombra │
│  izquierda  │   + luz       │derecha │
│  gradiente  │  golden spot  │gradual │
│             │               │        │
│    dark     │  FOCAL POINT  │  dark  │
│  bokeh bg   │  centro-bajo  │bokeh bg│
└─────────────────────────────────────┘
```

- Guitarra (acústica preferiblemente) como punto focal — centro o ligeramente a la derecha
- Punto de luz dorado/ámbar desde arriba-centro (como spotlight de estudio)
- Bordes oscuros — el texto blanco debe leerse encima sin sombra adicional
- Profundidad: fondo con bokeh suave (puede ser pared de madera, amplificador desenfocado, cuerdas)

### Paleta de color
| Elemento | Color |
|----------|-------|
| Fondo base | `#080808` — negro cálido |
| Luz focal | `#C9A84C` → `#F5D78E` — dorado Gmusic |
| Madera guitarra | ámbar natural / caoba |
| Ambiente | gradiente radial dorado muy suave (no agresivo) |
| Prohibido | azul, verde, blanco puro, rojo |

### Elementos permitidos
✅ Guitarra acústica (o clásica) en stand o apoyada  
✅ Amplificador pequeño desenfocado al fondo  
✅ Cuerdas o trastes en primer plano (macro, bokeh)  
✅ Luz suave tipo vela/farol ámbar  
✅ Textura de madera (pared, suelo)  

### Elementos prohibidos
❌ Personas o caras  
❌ Texto / logos  
❌ Instrumentos que no sean guitarra  
❌ Fondos blancos o brillantes  
❌ Efectos de neón / RGB gaming  
❌ Estética de escuela o sala de clases  

### Exportar como
`facade.jpg` → no. Este es **`interior.jpg`**  
- Formato: JPEG  
- Calidad: 85  
- Ruta final en repo: `public/hero/threshold/interior.jpg`  
- Archivo fuente Canva: guardar aparte (no al repo)

---

## Copy interior (ya codificado en HeroSection.tsx)

```
H1:       "Bienvenido a Gmusic Estudio"
Subtítulo: "Tu camino comienza aquí"
CTA:       "Ver clase gratuita"  →  navega a mi-camino-demo
```

La imagen debe soportar este texto blanco centrado encima. El contraste ya está resuelto en código con dos gradientes superpuestos.

---

## Cambio de código requerido (mínimo)

En `threshold-assets.ts`, cambiar:

```ts
// ANTES (placeholder Unsplash)
interior: "https://images.unsplash.com/photo-1579797990179-4ca11c8b47fd?w=1920&q=85&auto=format&fit=crop",

// DESPUÉS
interior: "/hero/threshold/interior.jpg",
```

Un cambio de 1 línea. Cursor lo ejecuta en < 5 minutos una vez Juan entregue el asset.

---

## Criterios de aceptación visual

1. Al cruzar la "puerta" (scroll completo), el interior se siente como **entrar a un espacio real**.
2. La imagen funciona con los gradientes actuales (oscuro arriba, oscuro abajo).
3. El texto blanco "Bienvenido a Gmusic Estudio" se lee sin sombra adicional.
4. En móvil (375px) la guitarra sigue siendo el elemento más visible.
5. La imagen carga en < 2s en una conexión 4G típica (JPEG 85, ≤ 600KB).

---

## Orden de trabajo

```
1. [Juan]   Aprobar esta spec
2. [Juan]   Diseñar interior.jpg en Canva según brief
3. [Juan]   Exportar → public/hero/threshold/interior.jpg
4. [Cursor] Autorizar commit D1 primero (facade.jpg + HeroSection Canvas)
5. [Cursor] Cambiar threshold-assets.ts: 1 línea
6. [Cursor] Commit: feat(landing): Visual D2 — interior real del estudio
7. [Juan]   Validar en browser: scroll hero completo, ver interior
```
