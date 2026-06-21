# SKILL — Sistema de Diseño Gmusic
> Usa este skill cuando necesites construir, modificar o evaluar
> cualquier componente visual de Gmusic.
> La fuente de verdad completa está en `design-system/MASTER.md`.
---
## Identidad en una frase
**Obsidiana y Oro** — premium, oscuro, cálido, serio pero accesible.
---
## Los 5 tokens que más vas a usar
```css
--gold-primary   → #C9A84C  /* CTAs, acentos */
--bg-base        → #080808  /* Fondo global */
--bg-surface     → #111111  /* Cards */
--text-primary   → #F5F0E8  /* Títulos */
--text-secondary → #8A8A8A  /* Body */
```
---
## Tipografía en 2 reglas
```
Playfair Display → títulos de impacto (h1, h2)
Inter            → todo lo demás (body, botones, labels)
```
---
## Botón CTA principal — siempre igual
```css
background:     var(--gold-primary)
color:          var(--bg-base)
font-size:      13px
font-weight:    700
text-transform: uppercase
letter-spacing: 1px
border-radius:  var(--radius-sm)  /* 2px */
height:         50px
padding:        0 36px
```
---
## Responsive — regla principal
```css
/* En vez de padding fijo: */
padding: 0 80px;  /* ❌ */
/* Usar siempre: */
padding: 0 clamp(20px, 5vw, 80px);  /* ✅ */
```
---
## Lo que NUNCA hacer
```
❌ Colores hex directos en componentes — usar var(--token)
❌ Blanco puro (#fff) o negro puro (#000)
❌ Dorado como fondo de sección
❌ Playfair Display en body text
❌ Botones CTA sin uppercase
❌ Colores edu-* fuera del dashboard
❌ Crear tokens nuevos sin agregarlos a tokens.css
```
---
## Archivos a consultar
```
design-system/tokens.css    → todas las variables CSS
design-system/MASTER.md     → guía completa de uso
src/styles/responsive.css   → breakpoints
src/styles/theme.css        → integración Tailwind
```
