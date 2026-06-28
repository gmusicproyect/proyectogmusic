# Runbook ops — Activación manual de alumnos (D-019)

> **Alcance:** procedimiento operativo temporal hasta Fase 5 (webhook de pagos).
> **Relacionado:** matriz de estados en [`student-access-states.md`](./student-access-states.md) (D-017 cerrado).
> **Última validación prod:** Jun 2026 — acceso real con `User` + `passwordHash` + `Subscription ACTIVE` vigente.

Este documento describe cómo **activar, verificar, revocar y limpiar** cuentas de alumno **sin modificar código productivo**. No sustituye decisiones de producto ni de pagos; cada activación real requiere **confirmación explícita de Juan** (pago externo acordado o caso QA autorizado).

---

## 1. Requisitos previos

| Requisito | Detalle |
|-----------|---------|
| **Autorización** | Juan confirma que el alumno debe tener acceso (pago manual, beca, QA, etc.). |
| **Acceso ops a BD prod** | Cuenta con permiso de lectura/escritura en Supabase (Table Editor o SQL Editor **solo por personal autorizado**). |
| **Sin secretos en este doc** | No copiar `DATABASE_URL`, `JWT_SECRET`, contraseñas ni cookies de sesión en tickets o chats. |
| **Frontend prod desplegado** | App pública en Vercel; API en Render (`/api/v1`). Build en verde antes de validar alumnos nuevos. |
| **Conocer la regla de negocio** | El registro **no** crea suscripción activa (D-015). Sin fila `Subscription` válida el alumno queda en `registered_no_sub`. |
| **Plan ID coherente** | Usar un `planId` acordado con producto (p. ej. `gmusic-semester-6-months` para semestral). Debe ser **string consistente** con planes publicados; no inventar IDs ad hoc sin acuerdo. |

**Roles en BD (referencia):** el alumno debe ser `User.role = STUDENT`. No activar suscripciones semestrales sobre usuarios `ADMIN` o `GUARDIAN` (el servicio de activación dev los rechaza; en manual, evitar el error desde el inicio).

---

## 2. Estados de acceso (resumen)

Fuente canónica: [`student-access-states.md`](./student-access-states.md).

| Estado frontend | Condición `GET /me/access` | Zona alumno (`/alumno`, `/mi-camino`) |
|-----------------|----------------------------|----------------------------------------|
| **`anonymous`** | HTTP **401** (sin cookie JWT válida) | Bloqueada — redirect a landing / registro. |
| **`registered_no_sub`** | HTTP **200**, usuario presente, `canAccessStudentZone: false`, `reason: NO_ACTIVE_SUBSCRIPTION` | Bloqueada — demo funnel (5 clases) sí; suscriptor no. |
| **`authenticated`** | HTTP **200**, `canAccessStudentZone: true`, `reason: ACTIVE_SUBSCRIPTION`, objeto `subscription` con `status: ACTIVE` | Permitida — `StudentZoneGuard` deja pasar. |

**Regla backend (`resolveStudentAccess`):** cuenta como activa una fila `Subscription` con `status = ACTIVE` y `endsAt` **null** o **fecha futura**. `CANCELED`, `PAST_DUE` o `ACTIVE` con `endsAt` vencido → sin acceso suscriptor.

---

## 3. Flujo de activación manual

### Paso A — Crear cuenta por registro normal

1. El alumno (o ops en su nombre, con autorización) completa **`/registro-cuenta`** en producción.
2. El backend ejecuta `POST /auth/register` → crea `User` con **`passwordHash`** (bcrypt; nunca se expone por API — D-014).
3. Tras registro exitoso, el frontend debe quedar en **`registered_no_sub`** (cookie `gmusic_session` presente, sin suscripción).

**Verificación rápida sin BD:** iniciar sesión en prod → navbar muestra bienvenida con nombre → intentar `/alumno` → debe **redirigir/bloquear** (comportamiento esperado pre-activación).

### Paso B — Verificar fila `User` en BD

En Supabase → tabla **`User`**:

| Campo | Qué comprobar |
|-------|----------------|
| `email` | Coincide con el registro (minúsculas/normalización según registro). |
| `name` | Presente. |
| `role` | `STUDENT`. |
| `passwordHash` | **No null** — confirma que puede iniciar sesión con contraseña. |
| `id` | UUID — anotar para la suscripción (`userId`). |

> **No** leer ni pegar el valor de `passwordHash` fuera del panel seguro. Solo confirmar que existe.

Si el usuario ya existía sin `passwordHash`, **no** seguir este runbook como activación estándar — escalar a Juan (flujo de recuperación / re-registro).

### Paso C — Crear `Subscription ACTIVE` (pago externo / manual)

Solo **después** de confirmar pago (o calendario acordado) o caso QA autorizado.

En Supabase → tabla **`Subscription`** → **Insert row**:

| Campo | Valor orientativo |
|-------|-------------------|
| `id` | Dejar que Supabase genere UUID, o UUID nuevo válido. |
| `userId` | UUID del `User` del paso B. |
| `status` | `ACTIVE` |
| `planId` | p. ej. `gmusic-semester-6-months` |
| `endsAt` | Fecha fin acordada (UTC) **o** `null` si el plan no tiene vencimiento fijo. |
| `createdAt` / `updatedAt` | Default automático o «now». |

**Vigencia:**

- `endsAt = null` → acceso sin fecha de fin (válido según tests de acceso).
- `endsAt` futuro → acceso hasta esa fecha inclusive (vencida si `endsAt <= now`).
- Si hay **varias** filas `ACTIVE` vigentes, el backend elige la de **`endsAt` más lejana** (`null` tiene prioridad).

**Duplicados:** evitar dos `ACTIVE` vigentes sin necesidad; si existen por error, el sistema elige una determinísticamente, pero ops debe dejar **una** fuente de verdad clara.

### Paso D — Validar `GET /me/access`

Con sesión del alumno (login en prod o herramienta autorizada con cookie de sesión — **no documentar la cookie**):

**Respuesta esperada (200):**

```json
{
  "user": {
    "id": "<uuid-usuario>",
    "name": "<nombre>",
    "email": "<email-alumno>"
  },
  "access": {
    "canAccessStudentZone": true,
    "reason": "ACTIVE_SUBSCRIPTION"
  },
  "subscription": {
    "status": "ACTIVE",
    "planId": "gmusic-semester-6-months",
    "endsAt": "2026-12-31T23:59:59.000Z"
  }
}
```

Campos ausentes o `canAccessStudentZone: false` → **no** dar por cerrada la activación; volver al paso C.

### Paso E — Validar frontend suscriptor

Checklist mínimo en producción (misma sesión):

1. **`/alumno`** (Mi Estudio) — carga sin redirect a landing.
2. **`/mi-camino`** — carrusel suscriptor (no bloqueo `StudentZoneGuard`).
3. Navbar coherente con **`authenticated`** (acceso a zona alumno, no solo demo).
4. **`POST /auth/logout`** → tras logout, **`/alumno`** debe bloquear de nuevo (`anonymous`).

---

## 4. Checklist post-activación

Marcar todos antes de informar al alumno que «ya está activo»:

- [ ] Juan autorizó la activación (referencia interna: fecha / medio de pago / nota).
- [ ] `User` existe con `passwordHash` no null y `role = STUDENT`.
- [ ] `Subscription` con `status = ACTIVE` y vigencia correcta (`endsAt` null o futuro).
- [ ] `GET /me/access` → `canAccessStudentZone: true`, `reason: ACTIVE_SUBSCRIPTION`.
- [ ] Login real con email + contraseña del alumno funciona.
- [ ] `/alumno` y `/mi-camino` accesibles con sesión activa.
- [ ] Logout revierte bloqueo de zona suscriptor.
- [ ] No se compartieron secretos ni hashes en el ticket de ops.

---

## 5. Checklist de desactivación / revocación

Cuando el acceso debe cortarse (reembolso, fin de plan, fraude, fin de prueba QA):

**Opción recomendada — cambiar estado:**

1. Localizar fila(s) `Subscription` del `userId`.
2. Setear `status` a **`CANCELED`** (o `PAST_DUE` si aplica política de mora).
3. Guardar; opcionalmente setear `updatedAt` implícito.

**Opción alternativa — vencimiento:**

1. Mantener `ACTIVE` pero setear `endsAt` a **fecha pasada** (p. ej. ayer UTC).
2. El backend trata la suscripción como no vigente.

**Verificación post-revocación:**

- [ ] `GET /me/access` → `canAccessStudentZone: false`, `reason: NO_ACTIVE_SUBSCRIPTION`.
- [ ] Frontend → `registered_no_sub` (usuario sigue logueado) o flujo demo según guard.
- [ ] `/alumno` y `/mi-camino` **bloqueados** para suscriptor.
- [ ] Juan informado si es alumno real (comunicación externa fuera de este doc).

**Eliminar filas:** borrar `Subscription` también revoca acceso. Borrar `User` elimina en cascada suscripciones (`onDelete: Cascade`) — **solo** para cleanup QA o baja definitiva acordada; **nunca** en caliente sin backup/convenio.

---

## 6. Limpieza de cuentas QA

Para entornos de prueba controlados (dominio `@gmusic.test`, cuentas E2E):

1. **Autorización explícita** — no borrar `qa-alumno-prod-001@gmusic.test` ni cuentas referenciadas en D-017 sin re-validar E2E.
2. Orden seguro: revocar o borrar **`Subscription`** del usuario QA → verificar `/me/access` → si se requiere eliminar rastro, borrar **`User`** (solo si no hay datos de progreso que conservar).
3. Documentar en ticket interno qué UUID se eliminó (sin passwords).
4. Preferir **revocar** (`CANCELED`) frente a borrar si la cuenta se reutilizará en la misma semana de QA.

---

## 7. Riesgos y errores comunes

| Síntoma | Causa probable | Acción |
|---------|----------------|--------|
| Login OK pero `/alumno` bloquea | Sin `Subscription ACTIVE` vigente | Paso C — crear o corregir suscripción. |
| `/me/access` 401 | Cookie ausente / JWT expirado / logout | Login de nuevo; no confundir con falta de sub. |
| `/me/access` 200 pero `canAccessStudentZone: false` | Sin sub, sub `CANCELED`, `PAST_DUE`, o `endsAt` vencido | Revisar tabla `Subscription`. |
| `passwordHash` null | Registro incompleto o usuario legacy | No activar; escalar — alumno debe completar registro válido. |
| Activó pero sigue en demo | Caché de sesión / pestaña antigua | Logout + login; hard refresh. |
| Dos `ACTIVE` vigentes | Ops insertó duplicado | Dejar una vigente coherente; cancelar la sobrante. |
| `planId` arbitrario | Typo o plan inexistente en catálogo | Corregir `planId` acordado con producto. |
| Usuario no STUDENT | Cuenta admin/guardian | No usar este runbook; corregir rol solo con decisión explícita. |

---

## 8. Qué NO hacer

- **No** activar suscripciones desde el frontend ni `localStorage` (D-010).
- **No** usar `devStudentAuth` ni asumir que rutas `/api/v1/dev/*` están habilitadas en prod para alumnos reales sin política explícita.
- **No** insertar `Subscription ACTIVE` en el mismo paso que el registro público — el producto separa registro (lead) de pago confirmado (D-015, D-016).
- **No** exponer `passwordHash`, cookies de sesión, `JWT_SECRET` ni `DATABASE_URL` en Slack, email o tickets.
- **No** ejecutar scripts SQL sueltos del repo ni migraciones no aprobadas como atajo ops.
- **No** modificar guards, auth, Prisma schema o API para «arreglar» un alumno — corregir datos en BD según este runbook.
- **No** crear alumnos reales en prod desde agentes automatizados (Cursor/CI) sin autorización Juan.
- **No** confundir **`registered_no_sub`** (demo permitido) con bug — es el estado esperado **antes** de la activación manual.

---

## 9. Ejemplo genérico (sin datos sensibles)

**Escenario:** Alumno pagó semestre por transferencia; Juan autorizó activación.

| Paso | Acción | Valor ejemplo |
|------|--------|---------------|
| Registro | Alumno completa `/registro-cuenta` | `email`: `maria.garcia.ejemplo@cliente-demo.cl` |
| Verificar User | Table Editor | `id`: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`, `passwordHash`: *(presente, no copiar)* |
| Insert Subscription | Table Editor | `userId`: *(uuid anterior)*, `status`: `ACTIVE`, `planId`: `gmusic-semester-6-months`, `endsAt`: `2026-12-31T23:59:59.000Z` |
| API | Tras login | `/me/access` → `canAccessStudentZone: true` |
| UI | Navegación | `/alumno` ✓ · `/mi-camino` ✓ · logout → `/alumno` bloqueado ✓ |

**Revocación ejemplo:** mismo `userId` → `Subscription.status` = `CANCELED` → `/me/access` → `canAccessStudentZone: false` → alumno vuelve a experiencia `registered_no_sub`.

---

## 10. Relación con `student-access-states.md`

| Documento | Propósito |
|-----------|-----------|
| [`student-access-states.md`](./student-access-states.md) | **Qué** significa cada estado (`anonymous`, `registered_no_sub`, `authenticated`) y **por qué** el sistema se comporta así (D-017). |
| **Este runbook** | **Cómo** ops activa o revoca acceso manualmente en BD hasta Fase 5, con checklists y anti-patrones. |

Cuando Fase 5 (webhook de pagos) esté activa, la creación de `Subscription ACTIVE` debería ser automática post-pago; este runbook quedará como **contingencia** (becas, excepciones, QA, incidentes).

---

## Historial

| Fecha | Nota |
|-------|------|
| Jun 2026 | D-019 — Runbook inicial post cierre D-017 y validación prod carrusel `/mi-camino`. |
