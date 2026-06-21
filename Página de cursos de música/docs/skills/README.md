# Gmusic — Mapa de Skills por Área

> Una página que se sustenta sola necesita más que buen código.
> Necesita mensaje claro, experiencia que genera deseo, marketing que
> atrae sin depender de pauta, y operación que escala.
>
> Este mapa define qué skills cubren cada área y cuáles están
> listos para usar desde `docs/skills/`.

---

## Estado actual

| Carpeta | Skills descargados | Estado |
|---|---|---|
| `docs/skills/ux/` | 11 skills | ✅ Listo |
| `docs/skills/architecture/` | 7 skills | ✅ Listo |
| `docs/skills/marketing/` | 6 skills | ✅ Listo |
| `docs/skills/product/` | 6 skills | ✅ Listo |
| `docs/skills/growth/` | 3 skills | ✅ Listo |
| `docs/skills/design/` | design-system-skill.md | ✅ |

---

## Área 1 — Experiencia y Conversión ✅
> Ya descargada en `docs/skills/ux/`
> Instrucción maestra: `docs/skills/instruccion-maestra-ux.md`

| Skill | Propósito en Gmusic |
|---|---|
| `obviously-awesome` | Posicionamiento: qué es Gmusic y para quién |
| `storybrand-messaging` | Mensaje de landing: el alumno es el héroe |
| `cro-methodology` | Por qué la gente abandona sin inscribirse |
| `mom-test` | Validar con personas reales |
| `hundred-million-offers` | Hacer la oferta irresistible |
| `hooked-ux` | Que el alumno quiera volver solo |
| `contagious` | Boca a boca sin pauta publicitaria |
| `improve-retention` | Por qué alguien entra pero no completa el demo |
| `ux-heuristics` | Usabilidad: dónde se pierde el visitante |
| `microinteractions` | Detalles que generan confianza y deleite |
| `refactoring-ui` | Diseño visual sin diseñador |

---

## Área 2 — Arquitectura de Software ✅
> Ya descargada en `docs/skills/architecture/`

| Skill | Propósito en Gmusic |
|---|---|
| `domain-driven-design` | Modelar los dominios: Academia, Comunidad, Pagos |
| `clean-architecture` | Organización interna del código |
| `ddia-systems` | Decisiones de base de datos y datos |
| `system-design` | Escalabilidad futura |
| `software-design-philosophy` | Complejidad y módulos |
| `pragmatic-programmer` | Principios de desarrollo |
| `refactoring-patterns` | Mejorar código existente sin romper |

---

## Área 3 — Marketing y Adquisición 🔜
> Para descargar en `docs/skills/marketing/`
> Responde: ¿cómo llega gente a la página sin depender de pauta?

| Skill | Propósito en Gmusic |
|---|---|
| `one-page-marketing` | Plan de marketing completo en una página |
| `scorecard-marketing` | Quiz/funnel de captación de leads |
| `made-to-stick` | Mensajes memorables que la gente repite |
| `influence-psychology` | Psicología de persuasión ética en la página |
| `crossing-the-chasm` | Cómo pasar de primeros alumnos a mercado masivo |
| `blue-ocean-strategy` | Diferenciarse en un mercado con competencia |

---

## Área 4 — Producto y Validación 🔜
> Para descargar en `docs/skills/product/`
> Responde: ¿cómo saber qué construir y en qué orden?

| Skill | Propósito en Gmusic |
|---|---|
| `jobs-to-be-done` | Por qué el alumno realmente "contrata" a Gmusic |
| `lean-startup` | Validar antes de construir completo |
| `design-sprint` | Resolver dudas de producto en 5 días |
| `inspired-product` | Estructura de equipo y descubrimiento de producto |
| `continuous-discovery` | Hablar con alumnos cada semana |
| `lean-ux` | Diseño basado en hipótesis, no suposiciones |

---

## Área 5 — Crecimiento y Operación 🔜
> Para descargar en `docs/skills/growth/`
> Responde: ¿cómo escalar y operar sin que todo dependa del fundador?

| Skill | Propósito en Gmusic |
|---|---|
| `drive-motivation` | Motivación intrínseca: que el alumno aprenda por deseo |
| `traction-eos` | Sistema operativo del negocio cuando hay tracción |
| `predictable-revenue` | Proceso de ventas escalable |

---

## SEO — Área pendiente de evaluar
> wondelai/skills no tiene un skill de SEO técnico.
> Para Gmusic en esta etapa, el SEO más efectivo no es técnico —
> es contenido y posicionamiento. Los skills que más aportan al SEO
> indirectamente son:

| Skill | Conexión con SEO |
|---|---|
| `storybrand-messaging` | Copy claro = mejor indexación semántica |
| `made-to-stick` | Contenido memorable = más tiempo en página |
| `one-page-marketing` | Define los canales correctos incluyendo orgánico |
| `contagious` | Contenido compartible = backlinks naturales |

> Si se necesita SEO técnico en el futuro, se busca un skill
> externo o se crea uno propio en `docs/skills/seo/`.

---

## Orden de descarga recomendado

```
Fase actual (ya lista):
✅ ux/          → experiencia y conversión
✅ architecture/ → estructura del sistema

Próximo paso:
🔜 marketing/   → adquisición orgánica y mensaje
   skills: one-page-marketing, scorecard-marketing,
           made-to-stick, influence-psychology,
           crossing-the-chasm, blue-ocean-strategy

Después cuando haya tracción:
🔜 product/     → validación y descubrimiento
🔜 growth/      → escala y operación
```

---

## Instrucciones maestras por área

| Área | Archivo |
|---|---|
| UX / Experiencia | `docs/skills/instruccion-maestra-ux.md` ✅ |
| Arquitectura | `docs/skills/instruccion-maestra-arquitectura.md` ✅ |
| Marketing | `docs/skills/instruccion-maestra-marketing.md` ✅ |
| Producto | `docs/skills/instruccion-maestra-producto.md` 🔜 |

---

## Regla general

> Cada área tiene su propio proyecto GPT, su propia instrucción
> maestra y sus propios skills. Todos conectados al mismo repositorio.
> Ninguno toca el área del otro.
>
> El repositorio es la fuente de verdad compartida.
> Los proyectos GPT son los consultores especializados.
> Cursor es el ejecutor.
> Claude es el arquitecto que conecta todo.
