# 02 — Arquitectura del sistema (Track A)

**Fase:** 2 — ARQUITECTURA Y DISEÑO  
**Fecha:** 2026-07-14  
**Contrato producto:** `docs/product/01-mvp-gmusic.md` + **D-F1-001**  
**DoD entrega:** `docs/quality/definition-of-done.md`  
**Working map (riesgos/contexto):** `gmusic-architecture-working-map.md`  
**Modelo de datos:** `02-modelo-datos.md`

---

## 1. Objetivo

Describir cómo está montada la plataforma Track A **hoy**, con límites de contexto claros, flujos MVP a nivel componentes/APIs, y qué **no** mezclar — para crecer sin desorden.

---

## 2. Stack y deploy (observado)

| Capa | Tecnología | Rol |
|------|------------|-----|
| Frontend | **Vite + React** (`src/`) | SPA: landing, funnel demo, zona alumno, admin UI |
| Navegación | `currentPage` en `App.tsx` + `student-zone-routing.ts` | Sync parcial URL (D-GOV-02/03 + zona alumno) — **no** React Router global |
| API | **Express** (`server/`) | `/api/v1/*` — auth, me, path/sessions, admin, community, onboarding |
| Persistencia | **Prisma + PostgreSQL** | Fuente de verdad de identidad, contenido publicado, progreso, community |
| Auth | **JWT en cookie** (+ bcrypt) | Registro/login/logout liviano; email verify **WON'T** (D-ROAD-005 A) |
| Frontend hosting | **Vercel** | SPA + `vercel.json` rewrites → `index.html`; proxy `/api/v1/*` → backend |
| Backend hosting | **Render** (típico Track A) | API + DB connection |

Track B (Next.js / Sanity / Railway / Cloudflare Stream) = **fuera de este sistema**. No mezclar código ni stack.

---

## 3. Diagrama de capas

```text
┌─────────────────────────────────────────────────────────────┐
│  Browser (Vite SPA)                                         │
│  Landing · Onboarding Academia · Demo · Gate WA · Alumno    │
│  Guards: StudentZoneGuard / DemoAuthGuard / Admin           │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS + cookie JWT
┌───────────────────────────▼─────────────────────────────────┐
│  Vercel  ──rewrite SPA──► index.html                        │
│          ──proxy /api/v1──► Render (Express)                │
└───────────────────────────┬─────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────┐
│  Express Modular Monolith                                   │
│  routes: auth · me · lessonSessions · admin · community ·…  │
│  middleware: realStudentAuth · requireAdmin · access        │
│  services: learning / community / subscription resolution   │
└───────────────────────────┬─────────────────────────────────┘
                            │ Prisma
┌───────────────────────────▼─────────────────────────────────┐
│  PostgreSQL                                                 │
└─────────────────────────────────────────────────────────────┘

Fuera del monolith (MVP):
  · WhatsApp humano (bridge conversión / activación sub)
  · PostHog (analítica funnel)
  · localStorage demo anónima
  · Planes marketing en TS frontend
```

---

## 4. Contextos / límites (Bounded Contexts ligero)

Alineado al working map; nombres operativos Track A:

| Contexto | Responsabilidad | Fuentes de verdad | No mezclar con |
|----------|-----------------|-------------------|----------------|
| **Identity** | Quién eres: User, role, cookie JWT | Postgres `User` | Billing Stripe; NextAuth |
| **Acquisition** | Landing, academia onboarding, demo 5 clases, gate, WA | Frontend + `localStorage` demo + PostHog; `DemoProgress` si auth | Academy Content Postgres como única fuente demo (**R-003**) |
| **Academy Content** | Course / Module / PathNode / MicroExercise + publish | Postgres + Admin R-008 | Catálogo demo TS; Track B Sanity |
| **Learning Journey** | Sesiones, intentos, UserProgress, XP, racha | Postgres; validación server | UI Mi Progreso OUT (rachas avanzadas) |
| **Membership** | Subscription ACTIVE → acceso zona alumno | Postgres `Subscription` + `/me/access` + guards | Pasarela; ERP Elvis |
| **Community** | Enrollment + posts | Postgres + API community | Mocks peers launch; Discourse |
| **Administration** | Publicar bloques/etapas | Admin API + role ADMIN | Dueño de reglas de dominio ajenas |
| **Billing** | — | **No** en MVP | Stripe / MP implementación |

Principio: **Modular Monolith** — un deploy API, fronteras por carpetas/servicios, no microservicios.

---

## 5. Happy path MVP (componentes → APIs)

Contrato núcleo (D-ROAD-005 / MVP §4):

```text
Registro/Login → Academia → (Demo y/o zona alumno) → Camino → Lección
  → completa → progreso persistido → siguiente lección visible
```

| Paso | UI / página (orientativo) | API / dato |
|------|---------------------------|------------|
| 1. Registro / login | Login / registro páginas | `server/routes/auth.ts` → JWT cookie |
| 2. Academia | `/onboarding-academia` | Estado local + navegación; instrumento Guitarra (D-007) |
| 3a. Demo | `PathDemoPage` / `DemoLessonPage` | Datos TS + `useDemoProgress` / localStorage; opcional `DemoProgress` |
| 3b. Conversión | `InscripcionGatePage` → registro WA | Planes TS; bridge `wa.me`; **no** cobro |
| 4. Activación acceso | Ops / admin | `Subscription` ACTIVE (manual) |
| 5. Zona alumno | `GmusicWelcome` `/alumno`, `GmusicPath` `/mi-camino` | Dashboard/path load vía `gmusic-api` → Express me/path |
| 6. Lección | Runner / session UI (T-UX-LESSON si gap) | `lessonSessions` + attempts; `UserProgress` |
| 7. Siguiente | Path + **Mi Progreso** (gap UI) | Agregaciones sobre progreso publicado |
| Acompañan | Comunidad (si nav), WhatsApp | `community` routes; mocks ≠ launch |

**Guards:** `StudentZoneGuard` (UI) + resolución acceso backend. Riesgo **R-002:** no asumir que todos los endpoints Learning re-validan entitlement — documentado, no mitigar sin decisión.

---

## 6. Superficies API (mapa)

| Router (`server/routes`) | Dominio |
|--------------------------|---------|
| `auth.ts` | Registro, login, logout, sesión |
| `me.ts` | Perfil / access |
| `lessonSessions.ts` | Sesiones y evaluación |
| `admin.ts` | R-008 publish (requireAdmin) |
| `community.ts` | Enrollment + posts (auth alumno) |
| `onboarding.ts` | Analytics temperamento / lead |
| `health.ts` / `dev.ts` | Ops / dev |

Contrato detallado legado: `docs/architecture/api-contract.md` (puede desfasar — contrastar con código).

Cliente SPA: `src/app/services/gmusic-api/*` — con **mocks de desarrollo** (`mock-path`, `mock-dashboard`); DoD exige no usar mock oculto en launch.

---

## 7. Qué NO mezclar

| Prohibido en Track A / Fase 2+ sin decisión | Por qué |
|---------------------------------------------|---------|
| Código / stack **Track B** | Dual-track; greenfield distinto |
| **Elvis ERP** / familias UI | WON'T MVP; GuardianLink ≠ producto |
| NextAuth, Stripe, Discourse, Docker-as-must | Cartel ≠ stack (D-ROAD-003) |
| React Router global / sync URL legacy completo | Fuera D-GOV-03; R-001/R-002 no vía routing |
| Mitigar **R-001** / **R-002** por iniciativa | Requiere decisión + fase explícita |
| Ampliar MVP congelado | **D-F1-001** → backlog + gobernanza |
| Mocks como verdad de launch | DoD + MVP §7.6c |

### R-001 / R-002 (recordatorio)

| ID | Qué es | Tratamiento Fase 2 |
|----|--------|--------------------|
| **R-001** | `LessonSession` no snapshot del contenido; evalúa ejercicios actuales al completar | Documentado; **no** mitigar aquí |
| **R-002** | UI/access valida sub; varios endpoints Learning solo autentican STUDENT | Documentado; plan = middleware entitlement en fase auth/ops/launch |

---

## 8. Criterio de cierre Fase 2 (documental)

La arquitectura documentada **soporta** el MVP sin depender de datos hardcodeados en componentes como **fuente de verdad de launch**, con salvedades explícitas:

| Área | Soporte estructural | Gap restante (plan, no código aquí) |
|------|---------------------|-------------------------------------|
| Auth JWT | Sí | Docs agentes “pausada” desfasados |
| Contenido + publish | Sí (schema + admin) | **T-PUB-01** datos publicados |
| Progreso persistido | Sí (`UserProgress` / sessions) | UI **Mi Progreso** |
| Comunidad posts | Sí | Comentarios schema/API; mocks UI |
| Membresía | Sí (`Subscription`) | Activación humana BRIDGE; enforcement R-002 |
| Demo | Sí como producto Acquisition | Dual source R-003 aceptado con decisión implícita de separación |

**Estado de etapa:** **D-F2-001** — Fase 2 **APROBADA / TERMINADA** (2026-07-14).

---

## 9. Referencias

- MVP: `docs/product/01-mvp-gmusic.md`  
- DoD: `docs/quality/definition-of-done.md`  
- Datos: `docs/architecture/02-modelo-datos.md`  
- Working map: `docs/architecture/gmusic-architecture-working-map.md`  
- Rutas navegación: `AGENTS.md`  
- Deploy SPA: `vercel.json` + checklist ops

---

*Documento Fase 2 — sin código producto · sin commit autónomo.*
