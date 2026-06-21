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
