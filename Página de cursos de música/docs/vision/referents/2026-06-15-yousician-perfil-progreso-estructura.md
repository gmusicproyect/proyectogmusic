# Referente estructural — Perfil / Progreso Yousician → evaluación Gmusic

**Fecha:** 15 Jun 2026  
**De:** Juan Pablo (PO) + Cursor  
**Para:** Opus + Juan (evaluación conjunta)  
**Tipo:** Referente UX — **no es spec de implementación**  
**Relacionado pero distinto:** `handoffs/2026-06-15-demo-path-yousician-gmusic-opus.md` (solo camino demo 5 clases)

---

## Por qué existe este documento

Juan compartió capturas del **área de perfil y progreso** de Yousician (Cuenta, Insignias, Rachas, Actividad, Seguidores, Siguiendo). Quiere la **estructura** como referente de producto, adaptada a identidad Gmusic — **no** copiar verde neón, logo ni assets protegidos.

Este doc evalúa **cada pantalla por separado**: qué contiene, qué problema resuelve, qué tiene Gmusic hoy y qué habría que decidir antes de construir.

---

## Mapa general Yousician (capas)

```
┌─────────────────────────────────────────────────────────────┐
│ NAV GLOBAL: escudo · estrella · racha 🔥 · Inicio · Aprender │
│             · Canciones · Afinador · ⚙ · 🔍                  │
├─────────────────────────────────────────────────────────────┤
│ SUB-NAV PERFIL (tabs horizontales):                          │
│   Cuenta | Insignias | Rachas | Actividad | Seguidores | Siguiendo │
├─────────────────────────────────────────────────────────────┤
│ CONTENIDO DE LA TAB ACTIVA                                   │
└─────────────────────────────────────────────────────────────┘
```

### Equivalente Gmusic hoy (demo / zona alumno)

| Yousician | Gmusic actual | Gap |
|-----------|---------------|-----|
| Nav global 4 ítems + stats | `DemoAcademyNav`: Inicio · Mi Camino · Mi Estudio · Mi Progreso | Parcial — no hay escudo/estrella/racha en header |
| Sub-nav perfil 6 tabs | **No existe** página perfil con tabs | Grande |
| Aprender → Ruta | Mi Camino (`PathDemoPage` demo / `GmusicPath` suscriptor) | En progreso (demo rediseñado) |
| Mi Estudio suscriptor | `GmusicWelcome` dashboard | Distinto layout (grid cards, no tabs perfil) |
| Legacy dashboard | `DashboardPage` mock Carlos M. | Prototipo antiguo, no cableado al funnel |

**Decisión D-008:** Sin auth real, no hay XP/racha/logros persistidos en servidor. Referente válido para **diseño futuro**, no para implementar todo ya.

---

## Pantalla 1 — Cuenta (Account)

### Estructura Yousician

| Zona | Elementos |
|------|-----------|
| Sub-nav | Tab **Cuenta** activa + campana notificaciones |
| Columna izq | Avatar circular grande · username · botón **Modificar información** |
| Columna der | Título **Nivel de guitarra** + grid 2×2 métricas |
| Métricas | Tiempo total tocando · Notas/acordes interpretados · Tiempo en escena · Tiempo de práctica |

### Qué resuelve

- Identidad del alumno en un solo lugar
- Resumen cuantitativo de práctica (no gamificación social)
- Punto de edición de perfil

### Gmusic hoy

- `GmusicWelcome`: hero con nombre, fase, métricas sueltas (racha/XP en mock `DashboardPage` / `ProfileHeader`)
- `mock-user.ts` + API dashboard: nombre, nivel, mes — sin pantalla “Cuenta” dedicada
- Sin avatar editable ni grid de tiempo de práctica real

### Evaluación para Gmusic

| Adaptar | Posponer | Omitir |
|---------|----------|--------|
| Avatar + nombre + “Editar perfil” | Métricas reales (requiere learning engine + sesiones) | Username público tipo red social |
| Grid 2×2 “Tu práctica” con placeholders mock | Tiempo en escena (concepto Yousician específico) | — |
| Label **Nivel de guitarra** → **Fundamento / Mes N** (identidad Gmusic) | — | — |

**Identidad Gmusic:** Playfair en título, dorado en acentos, charcoal `#111`, botón editar outline dorado (no pill gris genérico).

---

## Pantalla 2 y 3 — Insignias (Badges)

### Estructura Yousician

| Zona | Elementos |
|------|-----------|
| Fila destacada (top 3) | **Días de musicalidad** (desbloqueada, número grande) · **Riff del día** · **Desafíos semanales** (bloqueadas, gris) |
| Grid 3 columnas | Tarjetas insignia: icono en escudo/pua · título · barra progreso verde · texto requisito |
| Estados | Desbloqueada = color · Bloqueada = monocromo gris + barra parcial |
| Ejemplos | Aprendiz pro (5h) · Músico constante (racha 1 sem) · Rockstar (5 canciones) · Supernova (100 estrellas) |

### Qué resuelve

- Metas de largo plazo visibles
- Progreso parcial hacia logros (barras)
- Jerarquía: logros “hero” arriba, catálogo abajo

### Gmusic hoy

- Milestones decorativos en demo path (`Award` / `Music2` entre clases) — **no** sistema de insignias
- `LockedFeatureCard`, cofre semanal en `GmusicWelcome` — recompensa distinta
- D-008: no logros persistidos

### Evaluación para Gmusic

| Adaptar | Posponer | Omitir |
|---------|----------|--------|
| Concepto **3 hero + grid** para insignias guitarra/academia | Catálogo completo hasta learning engine | Insignias por género (Metalero, Popstar) — no es foco Gmusic MVP |
| Insignias alineadas a currículum: “Fundamento completo”, “5 días de racha”, “Primera canción” | Barras de progreso reales | Copiar formas escudo Yousician 1:1 |
| Gris bloqueado + dorado desbloqueado (no verde) | — | — |

**Pregunta Opus:** ¿Insignias viven en **Mi Progreso** tab o en modal desde Mi Estudio?

---

## Pantalla 4 y 5 — Rachas (Streaks)

### Estructura Yousician

| Zona | Elementos |
|------|-----------|
| Header racha | “Racha más larga: N semanas” con 🔥 |
| Card principal | Gradiente azul/morado · icono llama · copy “Toca esta semana…” · **7 círculos DO–SA** (días cumplidos / fallidos) |
| Sidebar izq | Línea vertical progreso · icono confeti · número nivel racha |
| Chip flotante | “Viajero del tiempo” 0/2 (token de freeze) |
| Carrusel derecho | Cards **Siguiente logro**: calendario+llama · cohete · bandera “en N semanas” |
| Scroll horizontal | Más metas: 8 semanas, Top 10%, etc. |

### Qué resuelve

- Hábito semanal explícito (qué días practicó)
- Motivación con próximo hito visible
- Mecánica anti-abandono (streak freeze = “viajero del tiempo”)

### Gmusic hoy

- Racha en mock (`ProfileHeader`, `CurriculumPage` props) — no persistida en demo
- `MetricCard` / quote en `GmusicWelcome` — mención racha sin UI dedicada
- Learning engine doc: rachas en servidor, idempotencia — **backend listo en spec**, UI no

### Evaluación para Gmusic

| Adaptar | Posponer | Omitir |
|---------|----------|--------|
| Card racha semanal con 7 días (L–D, locale ES) | Streak freeze / tokens | Comparación “Top 10% usuarios” (social/competitivo Yousician) |
| “Siguiente logro” con 1–2 cards (cofre semanal Gmusic ya existe) | Carrusel largo de metas | Gradiente espacial azul/morado — usar atmósfera dorada Gmusic |
| Copy premium: “Mantén tu práctica esta semana” | — | — |

**Pregunta Opus:** ¿Racha = días con **cualquier práctica** o solo **lección del camino**? (learning-engine.md debe mandar)

---

## Pantalla 6 — Actividad (Activity)

### Estructura Yousician

| Zona | Elementos |
|------|-----------|
| Izquierda | **Esta semana** · “0/3 días activos” · gráfico líneas lun–dom · toggle vertical estrella/reloj |
| Toggle inferior | **Diario** / **Semanal** (pill) |
| Derecha | **Hoy** · anillo circular · meta “10 min” · “Mejor: 1 min” |

### Qué resuelve

- Visualización temporal de hábito (semana + día)
- Meta diaria de minutos (time-on-instrument)
- Alternar vista agregada vs detalle

### Gmusic hoy

- Sin gráfico de actividad
- `ProgressBlock` lista módulos con % — progreso de **currículum**, no tiempo
- PostHog funnel — analytics producto, no UI alumno

### Evaluación para Gmusic

| Adaptar | Posponer | Omitir |
|---------|----------|--------|
| Anillo “Hoy” + meta minutos (alineado a microejercicios cortos) | Gráfico semanal real (requiere `lesson_sessions`) | Toggle estrella/reloj si no hay dos métricas claras |
| “X/3 días activos esta semana” simplificado | — | — |

**Identidad Gmusic:** anillo con stroke dorado + LED progreso (skill `gmusic-visual-vfx`), no verde Yousician.

**Pregunta Opus:** ¿Meta diaria fija 10 min o configurable por nivel?

---

## Pantalla 7 — Seguidores (Followers)

### Estructura Yousician

| Zona | Elementos |
|------|-----------|
| Tab activa | Seguidores |
| Empty state | “Aquí aparecerán tus seguidores” · iconos siluetas + flecha · CTA seguir para ver puntajes en tabla |

### Qué resuelve

- Red social / competencia amistosa
- Loop: seguir → ver leaderboard

### Gmusic hoy

- `RankingWidget` en `DashboardPage` mock (posición 4/38) — sin grafo social
- No hay followers/following en schema MVP

### Evaluación para Gmusic

| Adaptar | Posponer | Omitir (MVP) |
|---------|----------|--------------|
| — | Tab Seguidores entera | Grafo social completo |
| Ranking académico **anónimo/agregado** (opcional futuro) | — | Seguir usuarios, tabla pública de puntajes |

**Recomendación Cursor:** **Fuera de scope Track A / Fase 4.** Documentar como “Fase social” si Juan la quiere explícitamente.

---

## Pantalla 8 — Siguiendo (Following)

### Estructura Yousician

| Zona | Elementos |
|------|-----------|
| Tab activa | Siguiendo |
| Empty state | “¿Todavía no sigues a nadie?” · 3 trofeos · copy motivacional leaderboard |

### Evaluación

Misma conclusión que Seguidores — **referente válido**, **no prioridad Gmusic MVP**.

---

## Síntesis: dos mundos Yousician vs dos mundos Gmusic

```
YOUSICIAN                          GMUSIC (propuesto)
─────────────────────────────────────────────────────────
Aprender → Ruta (carrusel clases)  Mi Camino (demo 5 + path suscriptor)  ← EN CURSO
Nav global + stats                 DemoAcademyNav + header stats futuro
Perfil → 6 tabs                    Mi Progreso → ¿sub-tabs?               ← ESTE REFERENTE
Insignias / Rachas / Actividad     Cofre semanal + métricas + logros     ← FASE POST-AUTH
Seguidores / Siguiendo             Omitir MVP                             ← NO AHORA
```

---

## Propuesta de información architecture Gmusic (para evaluar con Opus)

No implementada — solo borrador para discusión:

```
Mi Progreso (tab en DemoAcademyNav / GmusicInternalHeader)
├── Resumen        ← fusiona “Cuenta” + métricas clave Gmusic
├── Insignias      ← grid logros currículum
├── Rachas         ← card semanal + próximo cofre
└── Actividad      ← anillo hoy + semana
    (Sin Seguidores / Siguiendo en v1)
```

Alternativa: **Mi Estudio** = dashboard acción · **Mi Progreso** = tabs estilo Yousician.

---

## Checklist evaluación Juan + Opus

Marcar en revisión:

- [ ] ¿Aprobamos sub-nav 4 tabs (sin social) bajo **Mi Progreso**?
- [ ] ¿Cuenta/Resumen vive aparte en ajustes de usuario post-auth?
- [ ] ¿Insignias Gmusic = currículum + racha + cofre, no géneros?
- [ ] ¿Racha semanal 7 días es north star hábito?
- [ ] ¿Actividad con meta minutos/día entra en Fase 4 o Fase 5?
- [ ] ¿Seguidores/Siguiendo explícitamente **out of scope** documentado?
- [ ] ¿Identidad visual: dorado + charcoal en todas las tabs (cero verde marca ajena)?

---

## Archivos Gmusic relevantes (estado código)

| Área | Archivo |
|------|---------|
| Nav demo | `src/app/components/gmusic/DemoAcademyNav.tsx` |
| Mi Estudio | `src/app/pages/GmusicWelcome.tsx` |
| Camino demo | `src/app/pages/PathDemoPage.tsx` |
| Camino suscriptor | `src/app/pages/GmusicPath.tsx` |
| Mock progreso | `src/app/data/mock-user.ts`, `DashboardPage.tsx` |
| Motor futuro | `docs/architecture/learning-engine.md`, D-008/D-011 |
| Decisión gamificación | `.agents/DECISIONS.md` D-008 |

---

## Próximo paso sugerido (sin código)

1. Juan + Opus leen este referente + handoff camino demo
2. Deciden IA de **Mi Progreso** (tabs sí/no, cuáles v1)
3. Opus escribe spec corta **Visual B — Perfil alumno** si aprueban
4. Cursor implementa solo después de umbral auth (Fase 4) o mock acotado en demo

**No mezclar** este referente con la respuesta del rediseño carrusel demo — son dos superficies distintas del producto.
