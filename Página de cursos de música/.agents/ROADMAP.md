# Roadmap — Gmusic Estudio

## Visión

Web embudo gamificada → validación de conversión → auth real → pagos → (eventualmente) app nativa.
**No** es app de escritorio ni móvil todavía. **No** tiene motor musical avanzado todavía.

Estrategia actual: **web embudo primero**.

---

## Fases completadas

### Fase 1 — Landing limpia + CTA dinámico

- `AcademiaSection` + `useDemoUserState` según progreso demo y sesión pública
- Matriz Academia 3×3 (`InteractiveLevelSelector`)
- Commit: `5ad9517`

### Fase 2 — Demo de 5 clases

- `PathDemoPage`: mapa serpentino con 5 nodos (`demo-node-1` … `demo-node-5`) derivados de `DEMO_LESSONS`
- `DemoLessonPage`: estaciones Video → Ejercicio → Éxito por clase
- Progreso en `localStorage` (`gmusic:demo_v1`)
- Commit: `2e41d9f` (junto con Fase 3)

### Fase 3 — InscripcionGate videojuego

- Puerta bloqueada si demo incompleto (`LockedGate`)
- Selector de planes → `inscripcion-registro`
- Copy gamificado
- Commit: `2e41d9f`

### Pre-Fase 4 — Bridge WhatsApp

- **Propósito:** validar conversión real antes de invertir en Fase 4
- `InscripcionRegistroPage`: CTA WhatsApp + formulario nombre/email/teléfono (sin contraseña)
- Videos YouTube temporales en `demo-lessons.ts` (`isPlaceholderVideo: true`)
- `VideoPlayerLesson`: prop `videoUrl` para iframe YouTube
- Commit: `8ca6228`

### Fase Precios — Modelo 3×3 CLP

- **Tiers:** Básico, Plus (recomendado), Familiar (3 perfiles)
- **Períodos:** Mensual, Semestral (default UI), Anual — con etiquetas de ahorro 17% / 25%
- `subscription-plans.ts`: `PRICE_TABLE`, 9 `flowPlanIds`, helpers `parsePlanId` / `formatCLP`
- Gate: selector período + tarjetas tier; registro: precios reales + WhatsApp con tier/período
- Commit: `cf3343c` (en remoto)

### Trabajo R3 / zona alumno (completado en remoto, commits previos al funnel)

- Acceso `GET /me/access`, guard, funnel Semestral dev, sesión pública, cofre Fase 6, redirect R3.3E
- Commits referencia: `356f175` … `30e310b`, `6088dc5`

---

## Próxima fase

### Fase 4 — Auth real

**Estado:** pausada. Diseño en `.agents/skills/gmusic-auth-email-verification/SKILL.md`.

**Prerequisito acordado:** WhatsApp real configurado + al menos 1 conversión vía bridge.

**Scope exacto (8 pasos):**

1. Prisma: campos en `User` + modelo `DemoProgress`
2. `server/lib/jwtSession.ts` — JWT sign/verify, cookie `gmusic_session`
3. `server/middleware/realStudentAuth.ts`
4. `server/routes/auth.ts` — `POST /auth/register`, `POST /auth/logout`
5. `server/routes/dev.ts` — `POST /dev/login` (Carlos en dev)
6. `server/routes/me.ts` — middleware `devStudentAuth` → `realStudentAuth` en rutas alumno
7. Frontend: estado `registered_no_sub` en `public-student-session.ts` + `useDemoUserState`
8. `InscripcionRegistroPage`: reemplazar bridge WhatsApp por registro real; `InscripcionPendientePage` (nuevo)

---

## Fases futuras

### Fase 5 — Flow + Resend + Webhooks

**Prerequisito:** Fase 4 completa. Precios CLP definidos en UI (`cf3343c`); integración Flow pendiente.

- Webhook Flow → `Subscription` ACTIVE
- Resend email bienvenida
- `InscripcionPendientePage` con CTA de pago real
- Estado frontend `subscribed_active`

### Mini-fase Analytics

PostHog — ~8 eventos de funnel. No bloqueante.

---

## Evolución conceptual del demo (visión)

| Hoy | Objetivo |
|-----|----------|
| Video → Ejercicio (por clase) | Mira/Video → Fundamento → Técnica → Crea → Logro |

---

## Fuera de scope actual (documentado para no re-debatir)

- App móvil
- App de escritorio
- Afinador con micrófono real
- Motor musical avanzado (Tonal.js)
- OAuth / Supabase Auth como proveedor principal
- Rediseño completo de landing ya funcional
- Eliminar rutas legacy (`fundamento-free-lesson`, `probar`) sin plan de migración explícito

### Limpieza rutas legacy (post-Fase 4)

No eliminar sin plan de migración explícito y autorización de Juan.

| Ruta | Estado | Dependencia activa |
|------|--------|--------------------|
| fundamento-free-lesson | Activa — HeroSection/PlanesSection la referencian | Verificar si AcademiaSection ya la reemplaza completamente |
| probar | Activa en producción sin DEV_LEGACY guard | Sin referencias de usuario conocidas |
| fundamento-preview | Inerte — no montada en App.tsx | — |
