# Gmusic Estudio — instrucciones para agentes

Academia de guitarra online. Stack: React + Vite. Navegación principal por `currentPage` en `App.tsx`, con sincronización parcial de URL (ver mapa de rutas).

---

## Gobernanza, roles y entorno de agentes

Para garantizar el orden y evitar conflictos en el desarrollo, el ecosistema de IA se divide en **tres roles estrictos**. Las herramientas deben respetar sus límites y el mapa de rutas oficial.

### Matriz de roles y funciones

| Rol | Herramienta | Función | Referencia |
|-----|-------------|---------|------------|
| **Claude (El Cerebro / Arquitecto)** | Claude Code / Opus | Diseña estrategia conceptual, lógica de negocio pesada y estructura pedagógica de la academia (12 meses). **No genera código de producción directo.** | `CLAUDE.md`, skill `gmusic-opus-architect` |
| **Codex (El Supervisor / Contexto)** | Codex | Mantiene orden de tareas, memoria de avance (`AGENTS.md`, `.agents/MEMORY.md`, `.agents/DECISIONS.md`) y valida cumplimiento de specs antes de sincronizar. | — |
| **Cursos (El Ejecutante / Cursor)** | Cursor | Único encargado técnico operativo en la Mac. Escribe, edita y aplica código local. **No decide diseño ni altera arquitectura de forma autónoma.** | skill `gmusic-agent-workflow` |

### Regla maestra — repositorio remoto (GitHub)

- **Exclusividad:** **Cursos (Cursor)** es el **único** agente autorizado para interactuar con el remoto (`gmusicproyect/proyectogmusic`).
- **Prohibido:** `git push`, `git commit` o subidas automáticas de forma autónoma.
- **Flujo obligatorio:** Tras compilar y validar localmente, Cursos detiene la ejecución y pregunta al Director (Juan): *"El código está listo y probado localmente. ¿Autoriza hacer el push a GitHub?"*
- **Solo proceder** ante respuesta explícita **"SÍ"** o **"OK"**.

---

### Arquitectura y decisiones (D-GOV-01)

Para decisiones de **arquitectura y dominio**, consultar en este orden:

1. `.agents/DECISIONS.md` (aprobadas)
2. `docs/architecture/gmusic-architecture-working-map.md` (Context Map v1.1 + Auditoría READ-ONLY v1.2)
3. Código + tests

No autoriza implementación, schema, reorganización de carpetas ni routing por sí solo.

**R-001 / R-002:** no mitigar sin decisión aprobada y fase explícita.

---

## Mapa de rutas de navegación autorizadas

Fuente de verdad para agentes. **Prohibido** agregar o inventar URLs o parámetros fuera de esta tabla sin fase de arquitectura global aprobada por **Claude (El Cerebro)**.

| Zona | Página (`currentPage`) | URL real / destino | Propósito |
|------|------------------------|--------------------|-----------|
| **Público / Funnel** | `home` (landing) | `/` | Inicio y captación |
| **Funnel Demo** | `mi-camino-demo` | `/mi-camino-demo` | Teaser B: 5 jugables + 10 bloqueadas + card +60 (D-GOV-06) |
| **Funnel Demo** | `demo-clase-1` … `demo-clase-5` | `/demo-clase-*` | Clases de prueba habilitadas |
| **Funnel Demo** | `inscripcion-gate` | `/inscripcion` | Cierre de conversión / pasarela |
| **Alumno suscriptor** | `mi-estudio` / `welcome` | `/alumno` | Dashboard principal del alumno |
| **Alumno suscriptor** | `mi-camino` | `/mi-camino` | Ruta de aprendizaje de guitarra |

### Estado de implementación URL (referencia técnica)

| URL autorizada | Sincronizada en código |
|----------------|------------------------|
| `/`, `/alumno`, `/mi-camino` | **Sí** — zona suscriptor (sin cambio de contrato) |
| `/mi-camino-demo` | **Sí** — `e047ac3`, D-GOV-02/03 |
| `/demo-clase-1` … `/demo-clase-5` | **Sí** — `e047ac3`, D-GOV-02/03 |
| `/inscripcion` | **Sí** — `inscripcion-gate`; `e047ac3`, D-GOV-02/03 |
| `inscripcion-registro` | **Sin URL pública** — sub-estado interno; gate → registro mantiene `/inscripcion` |
| Legacy / resto de `currentPage` | **No** — fuera de alcance D-GOV-03 |

Reglas de navegación (zona suscriptor + funnel demo):

- Entrar o moverse dentro de zona alumno → `pushState` a `/alumno` o `/mi-camino`.
- Entrar o moverse dentro del funnel demo → `pushState` a la ruta D-GOV-02 correspondiente.
- Salir de zona suscriptor o funnel demo hacia páginas no mapeadas → `replaceState("/")` + `setPage`.
- `popstate` reconoce `/`, `/alumno`, `/mi-camino` y rutas funnel D-GOV-02; pathname desconocido → `home`.

**Deploy:** las rutas SPA del funnel necesitan rewrite a `index.html` en el host de producción (documentar en deploy; no incluido en el commit de routing).

Implementación: `src/app/utils/student-zone-routing.ts` + wrapper `handlePageChange` en `App.tsx`.

---

### CTA demo bloqueado (D-GOV-05 — híbrido C)

| Momento | Acción | Destino |
|---------|--------|---------|
| Cualquier estado | Clases 6–15 bloqueadas | Panel + “Ver planes” → sección planes en `home` |
| Cualquier estado | Card “Más de 60” | `inscripcion-gate` |
| Post 5/5 | Banner + FAB “Inscribirse” | `inscripcion-gate` |

Navegación vía `currentPage`. No sustituye D-024 ni D-025.

---

### Academia — flujo 2 pasos (`f20e795`)

En `#academia` del landing, **mismo `currentPage` (`home`)** — wizard in-place, sin URL nueva (landing `#academia` fuera de alcance D-GOV-02):

| Paso | Copy | Comportamiento |
|------|------|----------------|
| **1** | “Elige tu instrumento” | 3 tarjetas: **Guitarra** (disponible), **Teclado** y **Canto** (próximamente) |
| **2** | “Elige tu punto de partida” | `InteractiveLevelSelector` — Fundamento / Técnica / Crea × Nivel 1–3 |

- Solo **Guitarra** avanza al paso 2 — coherente con **D-007** (validar guitarra primero).
- “← Cambiar instrumento” vuelve al paso 1.
- CTA dinámico (`useDemoUserState`) permanece en el paso 2.
- Archivos: `AcademiaSection.tsx`, `AcademiaInstrumentSelector.tsx`, `academia-instruments.ts`.

---

## Skills unificados

Fuente de verdad: **`.agents/skills/`**

| Skill | Cuándo usarlo |
|-------|---------------|
| `gmusic-welcome` | Mi Estudio, `GmusicWelcome.tsx` |
| `gmusic-path` | Mi Camino, `GmusicPath.tsx` |
| `gmusic-funnel-conversion` | Landing → demo → gate → registro; `PathDemoPage`, `InscripcionGatePage` |
| `gmusic-edu-gamified-design` | Diseño gamificado de cursos, progreso, XP, racha y estilo tipo Duolingo adaptado a Gmusic |
| `gmusic-game-progression-architecture` | Matriz Academia 3×3, funnel de conversión, estados de bloqueo y progresión de juego |
| `gmusic-visual-vfx` | LED de progreso, ChunkyButton, sombras de volumen, overlay del cofre y atmósfera CSS |
| `gmusic-learning-engine` | Backend/motor de aprendizaje, microejercicios, Prisma, XP, rachas y apoderados |
| `gmusic-auth-email-verification` | Auth, sesión, cookies, estados anonymous / registered / authenticated |
| `gmusic-opus-architect` | **Claude / Opus** — specs, planes, Superpowers brainstorming (no codea) |
| `gmusic-agent-workflow` | **Cursor / Cursos** — protocolo ejecutor: tests, reportes, commits con autorización |
| `gmusic-verification` | Antes de declarar “listo” — `npm run verify`, checklist por área |
| `gmusic-ci-deploy` | Push/deploy, smoke producción, checklist T3 E2E |
| `gmusic-session-handoff` | Inicio/fin de sesión, `agent-status.sh`, handoff explícito |

Registro completo: `skills.manifest.yaml`

**Adopción ECC (curada):** ver `docs/agents/ecc-adoption.md` — D-GOV-12. No instalar plugin ECC completo.

**Inspiración freeCodeCamp (pedagogía/escala):** ver `docs/agents/fcc-inspiration.md` — D-GOV-13. No fork FCC; no implementar FCC-A2+ hasta T3/T3.5 cerrados.

**Claude + Superpowers:** `./scripts/install-superpowers-opus.sh` → luego en Claude Code: `/plugin install superpowers@claude-plugins-official`. Ver `CLAUDE.md`.

Guía visual local: `DESIGN.md`

### Índice de lectura por tarea

| Tipo de Tarea | Documentos obligatorios | Skill a activar |
| :--- | :--- | :--- |
| **Ciclo cerrado (Cursor)** | `.agents/cursor-rules/loop.mdc` | `gmusic-agent-workflow` + `gmusic-verification` |
| **Deploy / E2E producción** | `docs/deploy/checklist-track-a-t3-e2e.md` | `gmusic-ci-deploy` |
| **Retomar sesión / handoff** | `.agents/MEMORY.md`, `DECISIONS.md` | `gmusic-session-handoff` |
| **Currículo 6–75 / motor path largo** | `docs/agents/fcc-inspiration.md`, `learning-engine.md`, D-GOV-04 | `gmusic-learning-engine` |
| **Arquitectura / dominio** | `DECISIONS.md`, `gmusic-architecture-working-map.md` | — (D-GOV-01) |
| **Funnel demo / conversión** | `AGENTS.md`, `.agents/DECISIONS.md` | `gmusic-funnel-conversion` |
| **Cambios estructura o layout** | `AGENTS.md`, `DESIGN.md` | `gmusic-welcome` / `gmusic-path` |
| **UI, luces, VFX o CSS** | `AGENTS.md`, `gmusic-visual-vfx/SKILL.md` | El del módulo activo |
| **Mecánicas de juego, XP o niveles** | `AGENTS.md`, `gmusic-game-progression-architecture/SKILL.md` | `gmusic-edu-gamified-design` |
| **API o base de datos** | `AGENTS.md`, `docs/architecture/` | `gmusic-learning-engine` |

### Sincronizar entre Cursor, Codex y Antigravity

```bash
./scripts/sync-skills.sh           # espejo → .cursor/skills/
./scripts/sync-skills.sh --global  # además → ~/.codex/skills y ~/.gemini/skills
./scripts/sync-cursor-rules.sh     # .agents/cursor-rules/ → .cursor/rules/
./scripts/agent-status.sh          # estado real al iniciar sesión
```

Convención de nombre: carpeta = `name:` en frontmatter = kebab-case (`gmusic-welcome`).

---

## Reglas generales

- No commit ni push salvo autorización explícita del Director.
- Etapas por scope: no mezclar funcionalidad futura en la etapa activa.
- Datos mock centralizados en `src/app/data/mock-user.ts`; progreso demo en `localStorage` (`gmusic:demo_v1`).
- UI gamificada: `DESIGN.md` + skill `gmusic-edu-gamified-design` (inspiración Duolingo, sin copiar marca ni assets protegidos).
- Backend, progreso, microejercicios, XP, rachas: `docs/architecture/learning-engine.md`, `database-schema.md` + skill `gmusic-learning-engine`.
- Decisiones de producto registradas: `.agents/DECISIONS.md`.
