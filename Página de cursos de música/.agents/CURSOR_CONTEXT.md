# Cursor Context — Gmusic Estudio

Leer antes de cualquier tarea. Actualizar cuando cambie algo relevante en el repo.

Fuente canónica extendida (verificadas en disco, 10 Jun 2026):

- `.cursorrules` — existe
- `docs/CURSOR-CONTEXT.md` — existe
- `.agents/MEMORY.md` — memoria de continuidad Fable

---

## Stack técnico

- **Frontend:** React 18 + TypeScript strict + Vite 6 + Tailwind v4 + `motion/react` (Framer Motion)
- **Routing:** string-based SPA (`currentPage` + `handlePageChange` en `App.tsx`) — **NO** React Router como eje principal
- **Backend:** Express + Prisma 6 + PostgreSQL (Docker local; Supabase opcional staging)
- **Tests:** Node test runner (`node --import tsx --test`) — **NO** Jest/Vitest
- **Typecheck:** `npm run app:typecheck` / `npm run api:typecheck`

---

## Comandos esenciales

```bash
npm run app:test        # tests frontend
npm run app:typecheck   # TypeScript frontend
npm run api:typecheck   # TypeScript backend
npm run api:test        # tests backend
npm run dev             # Vite :5173
npm run api:dev         # Express :3001
npm run build           # build producción
```

**Última ejecución auditada:** `npm run app:test` → **358 pass / 0 fail** (128 suites), post-`cf3343c`.

---

## Rutas activas — funnel principal

| Ruta (`currentPage`) | Componente | Navbar | Notas |
|----------------------|------------|--------|-------|
| `home` | `GmusicLanding` | ✅ | Landing embudo |
| `mi-camino-demo` | `PathDemoPage` | ❌ | 5 nodos demo |
| `demo-clase-1` … `demo-clase-5` | `DemoLessonPage` | ❌ | Regex en App |
| `inscripcion-gate` | `InscripcionGatePage` | ❌ | Selector período + 3 tiers CLP (`cf3343c`; default `plus`/`semester`) |
| `inscripcion-registro` | `InscripcionRegistroPage` | ❌ | Bridge WhatsApp; `planId` tier-período; fallback `plus-semester` |
| `mi-estudio` / `welcome` | `GmusicWelcome` | ❌ | `StudentZoneGuard` + `/alumno` |
| `mi-camino` | `GmusicPath` | ❌ | `StudentZoneGuard` + `/mi-camino` |

Exclusiones Navbar/MusicPlayer definidas en `App.tsx` (~L229 y ~L380).

---

## Rutas legacy / paralelas activas

| Ruta | Componente | Por qué existe |
|------|------------|----------------|
| `fundamento-free-lesson` | `FreeFundamentoLessonPage` | Clase gratuita legacy; Hero/Planes aún navegan aquí |
| `probar` | `ProbarPage` | Sandbox histórico |
| `checkout` | `CheckoutPage` | Funnel Semestral directo (AuthModal → pago dev) |
| `course-detail`, `album`, `courses`, … | `legacy/*` | Catálogo música legacy |

---

## Rutas DEV_LEGACY (solo `import.meta.env.DEV`)

| Ruta | Componente |
|------|------------|
| `dashboard` | `DashboardPage` |
| `lesson` | `LessonPage` + `ExerciseEngine` |
| `curriculum` | `CurriculumPage` |

---

## localStorage keys

| Clave | Shape | Propietario |
|-------|-------|-------------|
| `gmusic:demo_v1` | `{ completed: number[] }` | `useDemoProgress` |
| `gmusic:selected_plan_v1` | `{ planId: "basico-monthly" \| "plus-semester" \| … }` (9 combinaciones) | `InscripcionGatePage` → leído en `InscripcionRegistroPage` |

---

## Ejercicios — demo vs. zona alumno

| Ejercicio | Demo | Zona alumno |
|-----------|------|-------------|
| MCQ (`MultipleChoiceExercise`) | Clases 1, 3 | — |
| `Ex1Cuerdas` | Clase 2 | `ExerciseEngine` #1 |
| `Ex2NotasAm` | — | `ExerciseEngine` #2 |
| `Ex3NotasEm` | — | `ExerciseEngine` #3 |
| `Ex4CalidadAcorde` | Clase 4 | `ExerciseEngine` #4 |
| `Ex5Secuencia` | Clase 5 | `ExerciseEngine` #5 |

---

## Variables de entorno (`.env.example`)

| Variable | Uso |
|----------|-----|
| `DATABASE_URL` | Postgres local / staging |
| `API_PORT` | Express (default 3001) |
| `GMUSIC_DEV_USER_EMAIL` | Auth dev fallback |
| `GMUSIC_DEV_ACTIVATION_KEY` | Dev activate-semestral (nunca `VITE_*`) |
| `VITE_API_BASE_URL` | Cliente API frontend |
| `VITE_USE_DASHBOARD_MOCK` | Mock dashboard UI |
| `VITE_USE_PATH_MOCK` | Mock path UI |

Fase 4 añadirá `JWT_SECRET` (ver skill auth).

---

## Skills en `.agents/skills/`

| Skill | Una línea |
|-------|-----------|
| `gmusic-agent-workflow` | Protocolo Fable/Cursor: leer skills, auditar, test, no commit sin OK |
| `gmusic-funnel-conversion` | Funnel público: demo 5 clases, gate, planes, CTA, localStorage |
| `gmusic-game-progression-architecture` | Progresión, matriz 3×3, funnel Semestral, bloqueos WCAG |
| `gmusic-auth-email-verification` | Auth JWT Fase 4: cookies, bcrypt, estados sesión |
| `gmusic-welcome` | Mi Estudio: dashboard, cofre, métricas |
| `gmusic-path` | Mi Camino: mapa serpentino, sesiones |
| `gmusic-learning-engine` | Backend REST: XP, racha, lesson sessions |
| `gmusic-edu-gamified-design` | Tokens gamificación, UI tipo Duolingo adaptada |
| `gmusic-visual-vfx` | LED, ChunkyButton, overlay cofre, atmósfera |

---

## Archivos que Cursor NO debe tocar

Ver `.agents/DO_NOT_TOUCH.md`.

---

## Protocolo antes de cualquier cambio

1. Leer `.agents/MEMORY.md`
2. Leer el Skill que gobierna la tarea
3. Verificar `.agents/DO_NOT_TOUCH.md`
4. Correr validación: `app:typecheck`, `app:test`, `build` (y api si aplica)
5. **No commitear** sin autorización de Juan
6. **No push a `main`** sin acuerdo del arquitecto

---

## Troubleshooting TS (falso positivo LSP)

**Estado actual (post-`cf3343c`):** `npm run app:typecheck` está **limpio**. Los archivos raíz `CURSOR-INSTRUCTIONS.md` y `TODO-fix-ts-errors.md` fueron **absorbidos aquí y eliminados** — no buscarlos en la raíz del repo.

### Síntoma habitual (panel de problemas VS Code / Cursor)

Errores que **no** reproducen en CLI:

- `Cannot find name 'process'` (ts **2591**)
- `Cannot find name 'global'` (ts **2304**)

**Causa más probable:** cache stale del **TS server del IDE**, no código roto. Verificar con:

```bash
grep -rn "process\." src/    # no debe encontrar usages reales en frontend
grep -rn "^global\." src/
npm run app:typecheck         # fuente de verdad — debe pasar sin errores
```

### Fix (orden recomendado)

1. `Cmd+Shift+P` → **TypeScript: Restart TS Server**
2. Esperar barra de estado: "Restarting TS Server" → "Ready"
3. Confirmar que el panel de problemas se vacía
4. Validar en terminal: `npm run app:typecheck`

### No modificar por este falso positivo

- **`tsconfig.app.json`** — `"types": ["node"]` es intencional para el build; no quitarlo por estos avisos del LSP
- **No** buscar/reemplazar `process` ni `global` en `src/` si `grep` y `app:typecheck` están limpios

### Si aparecen errores TS reales en `src/` (frontend Vite)

Solo aplicar si `npm run app:typecheck` **falla** (no solo el panel del IDE):

| Patrón | Reemplazar por |
|--------|----------------|
| `process.env.VARIABLE` | `import.meta.env.VARIABLE` |
| `process.env.VITE_*` | `import.meta.env.VITE_*` |
| `global` (Node) en código browser | Eliminar o reimplementar con equivalente browser |
| `globalThis` | Válido en browser — verificar uso concreto |

Variables de entorno nuevas → documentar en `.env.example` (no hardcodear secretos en `VITE_*`).

---

## Dónde buscar qué

| Necesito… | Archivo |
|-----------|---------|
| Estado por fase | `.agents/PROJECT_STATUS.md` |
| Roadmap | `.agents/ROADMAP.md` |
| Zonas protegidas | `.agents/DO_NOT_TOUCH.md` |
| Endpoints REST | `docs/architecture/api-contract.md` |
| Funnel canónico | `.agents/skills/gmusic-funnel-conversion/SKILL.md` |
| Decisiones estratégicas | `.agents/decisions/` |
