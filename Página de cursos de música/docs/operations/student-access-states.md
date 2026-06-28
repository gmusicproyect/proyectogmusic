# Estados de acceso — sesión pública y zona alumno

> **D-017 cerrado (25 Jun 2026)** — comportamiento validado en producción sin patch.
> Fuente de verdad en código: `public-student-session.ts`, `StudentZoneGuard`, `accessService`.

---

## Matriz canónica

| Estado frontend | Condición API (`GET /me/access`) | Experiencia usuario |
|-----------------|----------------------------------|---------------------|
| **`anonymous`** | 401 (sin cookie JWT válida) | Landing, registro e inicio de sesión. Demo funnel **bloqueado** (T4B) → redirect a `/registro-cuenta`. Navbar: *Iniciar sesión* / *Regístrate*. |
| **`registered_no_sub`** | 200 + usuario autenticado + `canAccessStudentZone: false` (sin `Subscription ACTIVE`) | Demo **5 clases** jugables + funnel teaser (6–15 bloqueadas). Navbar: *Bienvenido, {nombre}* → camino demo. **No** entra a `/alumno` ni `/mi-camino` suscriptor. |
| **`authenticated`** | 200 + `canAccessStudentZone: true` + `subscription.status: ACTIVE` | Academia completa: `/alumno` (Mi Estudio), `/mi-camino`, progreso, lecciones suscriptor. `StudentZoneGuard` permite. Post-login redirect automático a zona alumno. |

---

## Backend (prod)

- Rutas `/me/*` usan **`realStudentAuth`** (JWT cookie `gmusic_session`).
- **`devStudentAuth`** no está montado en routers de producción (legacy; referencia en tests).
- `registerService` **no** crea `Subscription ACTIVE` (D-015) — activación manual ops o webhook Fase 5.

---

## Validación E2E prod (D-017)

Cuenta QA controlada (no correos personales):

| Campo | Valor |
|-------|-------|
| Email | `qa-alumno-prod-001@gmusic.test` |
| User ID | `1a14fcc6-29d7-4477-b21a-1bab55f35da0` |
| Subscription ID | `0750f8b6-9d36-478e-a026-77dd617036dd` |
| Plan | `gmusic-semester-6-months` · `ACTIVE` · `endsAt` 2026-12-27 |

Checks pasados: login · `/me/access` · `/alumno` · `/mi-camino` · logout · post-logout bloqueo.

---

## Tarea pendiente (ops, separada de D-017)

**Runbook temporal — activar alumnos manualmente** (hasta Fase 5 pagos):

1. Usuario se registra (`POST /auth/register`) o ya existe en BD.
2. Verificar fila `User` (email, `passwordHash` presente).
3. Crear `Subscription` con `status: ACTIVE`, `planId` válido, `endsAt` futuro.
4. Validar `GET /me/access` → `canAccessStudentZone: true`.
5. Validar en prod: login → `/alumno` entra; logout → `/alumno` bloquea.

Documento runbook detallado: **pendiente** (ticket ops separado).

**Fuera de alcance D-017:** cleanup Knip de `devStudentAuth.ts`.
