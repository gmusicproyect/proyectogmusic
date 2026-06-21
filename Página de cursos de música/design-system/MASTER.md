# Gmusic Estudio — Sistema visual (landing)

**CSS:** `design-system/tokens.css` (importado en `src/styles/index.css`)  
**Arquitectura:** `docs/arquitectura/MIGRACION-2026-06-05.md`

## Grid
- Desktop: 12 cols, gutter 24px, max-width **1280px**, padding lateral **80px**
- Mobile: 4 cols, gutter 16px, padding lateral **20px**
- Espaciado base: **8px** (múltiplos de 8)

## Tokens
| Token | Valor |
|-------|-------|
| `--bg-base` | `#080808` |
| `--bg-surface` | `#111111` |
| `--bg-elevated` | `#1A1A1A` |
| `--bg-mid` | `#0D0D0D` |
| `--gold-primary` | `#C9A84C` |
| `--gold-soft` | `#E8C97A` |
| `--text-primary` | `#F5F0E8` |
| `--text-secondary` | `#8A8A8A` |
| `--text-muted` | `rgba(255, 255, 255, 0.28)` |
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` |
| `--blue-accent` | `#4A6FA5` |

## Tipografía
- H1: Playfair 64–72px, weight 400, `--text-primary`, tracking -1px
- H2: Playfair 44–52px, weight 400
- Eyebrow: Inter 11px, 500, tracking 3px, uppercase, `--gold-primary`
- Body: Inter 16–18px, 1.7, `--text-secondary`
- CTA: Inter 13–14px, 600, tracking 1.5px, uppercase

## Botones
- Primario: bg `--gold-primary`, radius 2px, padding 14px 32px, texto `var(--bg-base)`
- Secundario: transparente, border `rgba(201,168,76,0.4)`, texto dorado

## Secciones
1. Hero (55/45)
2. Academia (#academia) — mapa de ruta + card programa
3. Comunidad (#comunidad) — fondo `--bg-mid`
4. Planes (#planes) — 3 cards próximamente
5. Contacto (#contacto)
6. CTA final (#cta-final)

## Nav
Inicio · Academia · Comunidad · Ver planes · Contacto · Iniciar sesión

## Animación
Solo `fade-in` + `translateY(20px)` en viewport. Sin parallax ni autoplay.

---

## Tokens de gamificación — solo dashboard
| Token | Uso |
|---|---|
| `--edu-success` | Logros, clases completadas |
| `--edu-error` | Errores, intentos fallidos |
| `--edu-warning` | Advertencias, tiempo límite |
| `--edu-reward` | Recompensas, XP ganado |
| `--edu-achievement` | Badges, logros especiales |
| `--edu-locked` | Contenido bloqueado |

**Regla:** estos tokens son exclusivos del dashboard y sistema de progreso. Nunca usar en landing pública.

---

## Botón premium completo
```css
background:     var(--btn-premium-bg)
color:          var(--btn-premium-text)
box-shadow:     var(--btn-premium-shadow-rest)
border-radius:  var(--radius-sm)
font-family:    var(--font-body)
font-size:      13px
font-weight:    700
text-transform: uppercase
letter-spacing: 1px
height:         50px
padding:        0 36px
```

Hover: background `var(--btn-premium-bg-hover)`

---

## Transiciones
| Token | Valor | Uso |
|---|---|---|
| `--transition-fast` | 150ms ease | Hover de iconos |
| `--transition-normal` | 200ms ease | Hover de botones |
| `--transition-slow` | 300ms ease | Modales, animaciones |

---

## Reglas para agentes
1. Nunca crear colores nuevos sin agregarlos a tokens.css
2. Nunca usar hex directamente — siempre var(--token)
3. Nunca usar #fff ni #000 puros
4. El dorado es acento, no fondo
5. Playfair Display solo para títulos de impacto
6. Inter para todo lo demás
7. Botones CTA: uppercase, 13px, weight 700, radius 2px
8. En móvil: padding clamp(20px, 5vw, 80px)
9. Colores edu-* solo en dashboard y gamificación
10. Antes de crear componente: verificar si el token existe

---

## Archivos del sistema
| Archivo | Contenido |
|---|---|
| `design-system/tokens.css` | Variables CSS — fuente de verdad |
| `design-system/MASTER.md` | Este documento |
| `src/app/components/marketing/tokens.ts` | Tokens JS para Framer Motion |
| `src/styles/theme.css` | Integración Tailwind v4 + shadcn |
| `src/styles/responsive.css` | Breakpoints |
| `docs/skills/design/design-system-skill.md` | Skill compacto para agentes |
