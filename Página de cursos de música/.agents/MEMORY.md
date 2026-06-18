# Gmusic Estudio — Memoria de Continuidad

Fable lee este archivo al inicio de cada sesión de trabajo en el proyecto Gmusic.
Última actualización: 18 Jun 2026 · `origin/main` = `e047ac3`

**Repo canónico:** `gmusicproyect/proyectogmusic` · legacy `estudiosgpt2024-crypto/paginawebgmusic` = **SUPERSEDED**

**Decisiones publicadas (`.agents/DECISIONS.md`):** D-GOV-01, D-GOV-02, D-GOV-03, D-GOV-05, D-GOV-06 · routing demo en remoto (`e047ac3`).

**Handoff operativo:** `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`

**Handoffs gobernanza 15 Jun** (`2026-06-15-gobernanza-*`, `INSTRUCCION-*`): **SUPERSEDED** — numeración D-GOV antigua (D-GOV-01 ≠ URLs). No usar como fuente activa. Renumeración pendiente (fase handoffs).

---

## Gobernanza de agentes (15 Jun 2026)

| Rol | Función | Git remoto |
|-----|---------|------------|
| **Claude** (Cerebro) | Specs, pedagogía, arquitectura — no codea prod | ❌ |
| **Codex** (Supervisor) | MEMORY, DECISIONS, validar specs | ❌ |
| **Cursos / Cursor** | Código local, tests, build | ✅ solo push con **SÍ/OK** de Juan |

Fuente de verdad: `AGENTS.md` (roles + mapa de rutas). No commit/push autónomo.

---

## Estado remoto y decisiones (18 Jun 2026)

| Item | Valor |
|------|-------|
| `origin/main` | `e047ac3` — feat(routing): sync demo funnel URLs |
| Docs / producto recientes | `4cdc911` D-GOV-02/03 aprobadas · `1bd2867` doc sync Academia · `f20e795` Academia 2 pasos |
| **Aprobadas e implementadas** | D-GOV-02 (URLs demo), D-GOV-03 (routing corto funnel), D-GOV-01, D-GOV-05, D-GOV-06, D-003 aclarado |
| **Pendientes** | D-GOV-04 pedagogía 6–75 |
| Tests app | **389/389** |
| **R-001 / R-002** | Documentados — no mitigar sin decisión explícita |
| Untracked local | `public/hero/threshold/logogmusic.png` — fase visual futura, no commitear en funnel/gobernanza |
| **Deploy** | Rutas SPA funnel (`/mi-camino-demo`, `/demo-clase-*`, `/inscripcion`) requieren rewrite a `index.html` en hosting |

---

## PROTOCOLO "Retomar Gmusic"

### Referencias obligatorias al retomar

1. `.agents/MEMORY.md` (este archivo)
2. `AGENTS.md` (gobernanza + mapa de rutas + CTA D-GOV-05)
3. `.agents/DECISIONS.md` + `docs/architecture/gmusic-architecture-working-map.md` (D-GOV-01)

Cuando Juan escriba **"Retomar Gmusic"**, Fable debe ejecutar exactamente estos pasos antes de hacer cualquier otra cosa:

1. Leer `.agents/MEMORY.md` (este archivo)
2. Leer `AGENTS.md` (roles y rutas)
3. Leer `.agents/skills/gmusic-agent-workflow/SKILL.md`
4. Leer `.agents/skills/gmusic-funnel-conversion/SKILL.md`
5. Ejecutar `git status` y `git log --oneline -5`
6. Confirmar si hay archivos staged o unstaged sin commit
7. Confirmar el hash y mensaje del último commit
8. **No implementar nada automáticamente** — ni un cambio de una línea
9. Resumir el estado actual en máximo 10 líneas
10. Recordar los pendientes inmediatos (ver sección "Pendientes inmediatos" más abajo)
11. Preguntar a Juan cuál paso quiere ejecutar primero

**Regla de oro:** Al recibir "Retomar Gmusic", cero código hasta leer memoria + git status + confirmación explícita de Juan.

---

## Estado del proyecto

### Publicado en remoto (18 Jun 2026)

- **Routing demo URL sync** (`e047ac3`): D-GOV-02/03 implementadas — `/mi-camino-demo`, `/demo-clase-1..5`, `/inscripcion`; `inscripcion-registro` sin URL pública
- **Academia 2 pasos** (`f20e795`): instrumento (Guitarra activa; Teclado/Canto próximamente) → punto de partida (D-007)
- Teaser B demo-path (`2bd1bdc`): 5 jugables + 10 bloqueadas + card “Más de 60”, catálogo 75 (D-GOV-06)
- CTA híbrido (D-GOV-05): clases 6–15 → planes; card +60 / banner / FAB → `inscripcion-gate`
- Gobernanza doc: D-GOV-02/03 aprobadas en `4cdc911`; ops en `1f04e7e`

### Fases completadas (histórico)

| Fase | Descripción | Commit |
|------|-------------|--------|
| Fase 1 | Landing limpia + CTA dinámico en AcademiaSection | `5ad9517` |
| Fase 2 | Demo de 5 clases (PathDemoPage + DemoLessonPage) | `2e41d9f` |
| Fase 3 | InscripcionGatePage videojuego + selector de planes | `2e41d9f` |
| Pre-Fase 4 | Bridge WhatsApp + videos YouTube temporales | `8ca6228` |
| Fase Precios | Modelo 3×3 tiers × períodos + CLP en gate/registro | `cf3343c` |

### Fase Precios — commiteada y pusheada en `cf3343c`

- **`subscription-plans.ts`:** `PlanTier` (`basico`/`plus`/`familiar`) × `BillingPeriod` (`monthly`/`semester`/`annual`); `PRICE_TABLE` CLP; 9 `flowPlanIds`
- **Defaults UI gate:** período `semester`, tier `plus` (recomendado)
- **Familiar:** 3 perfiles (decisión producto)
- **Selector período:** etiquetas con ahorro — Semestral · Ahorra 17%, Anual · Ahorra 25%
- **`InscripcionGatePage`:** toggle período + 3 tarjetas tier con precio/mes y total del período
- **`InscripcionRegistroPage`:** `planId` compuesto (`plus-semester` fallback); WhatsApp incluye tier + período
- **Tests:** 358 pass / 0 fail

### Pre-Fase 4 — commiteada en `8ca6228`

- **Videos YouTube reales** en las 5 clases demo (marcados `isPlaceholderVideo: true`):
  - Clase 1: `https://www.youtube.com/embed/0GImi8l53q0`
  - Clase 2: `https://www.youtube.com/embed/s-XnaDpYXw4`
  - Clase 3: `https://www.youtube.com/embed/wsnqgfaqYEE`
  - Clase 4: `https://www.youtube.com/embed/FRp9OgW2HhI`
  - Clase 5: `https://www.youtube.com/embed/uZZsSol656w`
- **VideoPlayerLesson.tsx** — nueva prop `videoUrl?`: iframe YouTube + botón "He terminado de ver este video →"; modo simulado intacto cuando `videoUrl` está ausente
- **InscripcionRegistroPage.tsx** — bridge WhatsApp: badge "Tu lugar está reservado", card del plan, CTA verde WhatsApp, formulario nombre/email/WhatsApp. Sin campos de contraseña. `WHATSAPP_NUMBER = "56953429676"` (commit `8ca6228`).
- **InscripcionGatePage.tsx** — puerta gamificada + selector de plan (actualizado en `cf3343c` a tier×período)

### Archivos Fase Precios (commiteados en `cf3343c`)

```
src/app/data/subscription-plans.ts
src/app/pages/InscripcionGatePage.tsx
src/app/pages/InscripcionRegistroPage.tsx
src/app/pages/inscripcion-gate.test.ts
```

### Archivos Pre-Fase 4 (commiteados en `8ca6228`)

```
src/app/data/demo-lessons.ts
src/app/components/dashboard/VideoPlayerLesson.tsx
src/app/pages/DemoLessonPage.tsx
src/app/pages/InscripcionGatePage.tsx
src/app/pages/InscripcionRegistroPage.tsx
src/app/pages/inscripcion-gate.test.ts
```

---

## Pendientes inmediatos

| # | Pendiente | Urgencia | Impacto |
|---|-----------|----------|---------|
| **G1** | **Cerrar D-GOV-04** (pedagogía 6–75 / skill-graph guitarra) | Alta | Juan / Claude |
| **G2** | **Deploy rewrites SPA** — funnel demo URLs → `index.html` | Media | Juan / hosting |
| C | **Decisión Clase 4 — `Ex2NotasAm`** | Antes de producción | `ex4-calidad-acorde` vs. video notas |
| D | **Skills curriculares** | Antes currículum 6–75 | Repo YAML vs. Notion |
| F | **DEV_LEGACY en producción** | Post-Fase 4 | Links build prod |
| H | **Fase 4 Auth real** | Pausada | Autorización explícita Juan |
| I | **Fase 5 Flow + webhooks** | Tras Fase 4 | `flowPlanIds` listos |

---

## Fases pausadas (requieren autorización explícita)

### Fase 4 — Auth real (PAUSADA)

No iniciar sin autorización explícita de Juan. El diseño está listo en `.agents/skills/gmusic-auth-email-verification/SKILL.md`.

Scope de Fase 4:
- Prisma migration: 6 campos en `User` + modelo `DemoProgress`
- `server/lib/jwtSession.ts` — JWT sign/verify (httpOnly cookie `gmusic_session`)
- `server/middleware/realStudentAuth.ts`
- `server/routes/auth.ts` — `POST /auth/register`, `POST /auth/logout`
- `server/routes/dev.ts` — `POST /dev/login` para Carlos
- `meRouter`: cambiar `devStudentAuth` → `realStudentAuth`
- Frontend: estado `registered_no_sub` en `publicSession`
- InscripcionRegistroPage: reemplazar bridge WhatsApp por formulario real

### Fase 5 — Pagos / Email (PAUSADA)

- Flow payment integration + webhook
- Resend email
- `InscripcionPendientePage.tsx`

### Analytics PostHog (PENDIENTE mini-fase)

8 eventos de funnel. No autorizado todavía.

---

## Reglas de seguridad permanentes

Estas reglas nunca cambian sin instrucción explícita de Juan:

1. **Frontend nunca activa suscripciones** — solo guarda `planId` en localStorage. El backend activa vía webhook.
2. **JWT en cookie httpOnly** — nunca en localStorage ni en respuesta JSON visible al cliente.
3. **Payload JWT usa `userId`**, nunca email.
4. **`JWT_SECRET` es obligatorio** — servidor lanza si está ausente.
5. **bcrypt mínimo 10 rounds**.
6. **`passwordHash` nunca en ninguna respuesta de API**.
7. **`registerService` nunca crea una `Subscription` activa**.
8. **`StudentZoneGuard` no desbloquea sin pago confirmado**.
9. **`devStudentAuth` bloqueado en producción** — no tocar hasta que `realStudentAuth` esté listo.
10. **No commit sin autorización explícita de Juan**.

---

## Funnel canónico (referencia rápida)

```
Landing (home)  →  /
  └── AcademiaSection [2 pasos — f20e795]
        · Paso 1: Elige tu instrumento (Guitarra | Teclado | Canto) — solo Guitarra activa (D-007)
        · Paso 2: Elige tu punto de partida (Fundamento/Técnica/Crea × niveles) + CTA dinámico
        └── mi-camino-demo  →  /mi-camino-demo
              PathDemoPage — teaser B: 5 gratis + 10 candado + card +60 (D-GOV-06)
              · clases 6–15 bloqueadas → panel + “Ver planes” → home/planes (D-GOV-05)
              · card “Más de 60” → inscripcion-gate (D-GOV-05)
              └── demo-clase-1..5  →  /demo-clase-1..5
                    DemoLessonPage (YouTube → ejercicio → éxito)
                    └── [5/5] banner + FAB → inscripcion-gate  →  /inscripcion (D-GOV-05)
                          InscripcionGatePage (tier×período)
                          └── inscripcion-registro (sin URL pública) → WhatsApp bridge
                                └── [Fase 4] auth real → [Fase 5] Flow → mi-estudio (/alumno)
```

**URL sync implementado (`e047ac3`, D-GOV-02/03):** `/`, `/alumno`, `/mi-camino`, `/mi-camino-demo`, `/demo-clase-1..5`, `/inscripcion`. Implementación: `student-zone-routing.ts` + `handlePageChange` en `App.tsx`. **`inscripcion-registro` sin pathname.** Legacy y resto de `currentPage` siguen sin sync URL global.

**Deploy:** refresh directo en rutas funnel requiere rewrite SPA en el host (fuera del código).

**Progreso demo:** 5/5 gratuitas (D-003); clases 6–15 visibles no jugables — teaser comercial (D-GOV-06).

---

## localStorage keys activas

| Clave | Shape | Propietario |
|-------|-------|-------------|
| `gmusic:demo_v1` | `{ completed: number[] }` | `useDemoProgress` |
| `gmusic:selected_plan_v1` | `{ planId: "basico-monthly" \| "plus-semester" \| … }` (9 combinaciones) | `InscripcionGatePage` |

---

## Skills del agente

| Skill | Cuándo leerlo |
|-------|--------------|
| `gmusic-agent-workflow` | Inicio de cada sesión — protocolo ejecutor Cursor |
| `gmusic-opus-architect` | Claude — specs/planes, no codea |
| `gmusic-funnel-conversion` | Rutas públicas, CTA, demo teaser, inscripción |
| `gmusic-auth-email-verification` | Antes de Fase 4 auth |
| `gmusic-game-progression-architecture` | Mecánicas, progresión, funnel macro, matriz 3×3 |
| `gmusic-edu-gamified-design` | Tokens de diseño, gamificación, WCAG |
| `gmusic-visual-vfx` | Efectos visuales, animaciones, partículas |
| `gmusic-welcome` | Dashboard Mi Estudio, cofre, XP, racha |
| `gmusic-path` | Camino del alumno, mapa serpenteante, nodos |
| `gmusic-learning-engine` | Backend: ejercicios, evaluación — solo zona alumno |
