# Gmusic Estudio — Memoria de Continuidad

Fable lee este archivo al inicio de cada sesión de trabajo en el proyecto Gmusic.
Última actualización: 10 Jun 2026 (post-`cf3343c`, remoto sincronizado).

---

## PROTOCOLO "Retomar Gmusic"

Cuando Juan escriba **"Retomar Gmusic"**, Fable debe ejecutar exactamente estos pasos antes de hacer cualquier otra cosa:

1. Leer `.agents/MEMORY.md` (este archivo)
2. Leer `.agents/skills/gmusic-agent-workflow/SKILL.md`
3. Leer `.agents/skills/gmusic-funnel-conversion/SKILL.md`
4. Ejecutar `git status` y `git log --oneline -5`
5. Confirmar si hay archivos staged o unstaged sin commit
6. Confirmar el hash y mensaje del último commit
7. **No implementar nada automáticamente** — ni un cambio de una línea
8. Resumir el estado actual en máximo 10 líneas
9. Recordar los pendientes inmediatos (ver sección "Pendientes inmediatos" más abajo)
10. Preguntar a Juan cuál paso quiere ejecutar primero

**Regla de oro:** Al recibir "Retomar Gmusic", cero código hasta leer memoria + git status + confirmación explícita de Juan.

---

## Estado del proyecto (10 Jun 2026)

### Fases completadas

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
| C | **Decisión sobre Clase 4 — `Ex2NotasAm`** | Antes de producción | `ex4-calidad-acorde` vs. video de notas/sostenidos |
| D | **Decisión sobre Skills curriculares** | Antes del próximo commit | ¿Skills en repo git o Notion/Drive? |
| F | **DEV_LEGACY en producción** | Limpieza post-Fase 4 | Verificar links públicos en build prod |
| H | **Fase 4 Auth real** | Pausada | Requiere autorización explícita de Juan |
| I | **Fase 5 Flow + webhooks** | Tras Fase 4 | `flowPlanIds` listos en código; integración pendiente |

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
Landing (home)
  └── AcademiaSection [CTA dinámico — useDemoUserState]
        └── mi-camino-demo → PathDemoPage (5 nodos serpentinos)
              └── demo-clase-1..5 → DemoLessonPage (iframe YouTube → ejercicio → éxito)
                    └── [clase 5 completa] → inscripcion-gate → InscripcionGatePage
                          └── selector de planes → inscripcion-registro
                                └── InscripcionRegistroPage (bridge WhatsApp — temporal)
                                      └── [Fase 4] formulario real → registered_no_sub
                                            └── [Fase 5] Flow pago → subscribed_active → mi-estudio
```

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
| `gmusic-agent-workflow` | Inicio de cada sesión — protocolo de trabajo |
| `gmusic-funnel-conversion` | Toda tarea que toque rutas públicas, CTA, demo, inscripción |
| `gmusic-game-progression-architecture` | Mecánicas, progresión, funnel macro, matriz 3×3 |
| `gmusic-auth-email-verification` | Antes de implementar cualquier cosa de Fase 4 |
| `gmusic-edu-gamified-design` | Tokens de diseño, gamificación, WCAG |
| `gmusic-visual-vfx` | Efectos visuales, animaciones, partículas |
| `gmusic-welcome` | Dashboard Mi Estudio, cofre, XP, racha |
| `gmusic-path` | Camino del alumno, mapa serpenteante, nodos |
| `gmusic-learning-engine` | Backend: ejercicios, evaluación — solo zona alumno |
