# Gmusic Learning Engine — API Contract (MVP)

Contrato REST v1 para el motor de aprendizaje.  
**Estado:** Fase 3B.2 — lectura (`health`, `me/dashboard`, `me/path`, `me/access`), creación (`POST /lesson-sessions`) y cierre (`POST /lesson-sessions/:id/complete`) implementados. Pendientes: apoderados.

Referencias: `learning-engine.md`, `database-schema.md`, `backend-provider-options.md`.

---

## Autenticación (desarrollo — Fase 3A)

| Variable | Default | Uso |
|----------|---------|-----|
| `GMUSIC_DEV_USER_EMAIL` | `carlos@gmusic.academy` | Resuelve al alumno `STUDENT` sin JWT |

**Solo desarrollo local.** Reemplazar por `Authorization: Bearer <token>` antes de staging/producción.

---

## Convenciones

| Item | Valor |
|------|-------|
| Base URL | `/api/v1` |
| Formato | JSON (`Content-Type: application/json`) |
| Auth | `Authorization: Bearer <token>` (JWT o sesión — TBD en implementación) |
| IDs | UUID v4 (`User.id`, `PathNode.id`, etc.) |
| Fechas | ISO 8601 UTC en respuestas (`2026-06-08T15:30:00.000Z`) |
| Errores | Objeto `{ "error": { "code": string, "message": string } }` |

### Reglas de seguridad (obligatorias)

- El cliente **nunca** recibe `secureAnswer`.
- El cliente **no** envía `isCorrect`; el servidor lo calcula.
- XP, racha y progreso los decide **solo el servidor**.
- `POST .../complete` debe ser **idempotente** si la sesión ya está `COMPLETED`.
- Apoderado solo accede si existe `GuardianLink`.
- Ventana máxima de sesión: **3 horas** desde `startedAt`; luego → `ABANDONED`.

### Estados de nodo (path)

| Estado API | Significado |
|------------|-------------|
| `locked` | Nodo anterior no completado |
| `available` | Desbloqueado, no es el foco actual |
| `active` | Nodo en curso (próxima práctica) |
| `completed` | `UserProgress.isCompleted = true` |

---

## Endpoints — Alumno

### `GET /api/v1/me/dashboard`

Resumen para **Mi Estudio**. Equivalente server-side de datos hoy en `MOCK_USER` + `ACTIVE_NODE_PANEL`.

**Auth:** alumno (`Role.STUDENT`).

**Response 200**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Carlos",
    "timezone": "America/Santiago",
    "levelLabel": "Fundamento",
    "pathLabel": "Mes 2 · Nodo 3 de 6"
  },
  "streak": {
    "currentDays": 4,
    "activeToday": true
  },
  "xp": {
    "total": 1240,
    "earnedThisWeek": 180
  },
  "moduleProgress": {
    "moduleId": "mod-3-uuid",
    "moduleTitle": "Ritmo y rasgueo",
    "percentCompleted": 38,
    "currentNodeTitle": "Acordes abiertos",
    "completedNodes": 2,
    "totalNodes": 6
  },
  "nextPractice": {
    "nodeId": "m3-n3-uuid",
    "title": "Tu primer rasgueo en 4/4",
    "typeLabel": "Práctica guiada · 5 min",
    "description": "Trabaja el patrón base con calma y precisión. El objetivo es sentir el pulso antes de acelerar."
  }
}
```

**Errores**

| Código HTTP | `error.code` | Cuándo |
|-------------|--------------|--------|
| 401 | `UNAUTHORIZED` | Sin token o token inválido |
| 403 | `FORBIDDEN` | Rol no alumno |

---

### `GET /api/v1/me/access`

Fuente de verdad backend para **acceso a la zona privada del alumno** (Mi Estudio / Mi Camino).
No expone datos de pago ni suscripciones de otros usuarios.

**Auth:** alumno (`Role.STUDENT`). En desarrollo usa `GMUSIC_DEV_USER_EMAIL`; en producción `devStudentAuth` responde `401`.

**Reglas de acceso**

| Condición | `canAccessStudentZone` | `reason` |
|-----------|------------------------|----------|
| Al menos una `Subscription` con `status = ACTIVE` y `endsAt` null o futuro | `true` | `ACTIVE_SUBSCRIPTION` |
| Sin suscripción válida (incluye vencida, `CANCELED`, `PAST_DUE`) | `false` | `NO_ACTIVE_SUBSCRIPTION` |

Si hay varias suscripciones ACTIVE vigentes, el servidor elige **determinísticamente** la de `endsAt` válido más lejano (`endsAt = null` tiene prioridad sobre fechas finitas; desempate por `id`).

**Response 200 — acceso permitido**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Lizama",
    "email": "juan@gmusic.academy"
  },
  "access": {
    "canAccessStudentZone": true,
    "reason": "ACTIVE_SUBSCRIPTION"
  },
  "subscription": {
    "status": "ACTIVE",
    "planId": "gmusic-semester-6-months",
    "endsAt": "2026-12-09T22:01:13.367Z"
  }
}
```

**Response 200 — acceso denegado**

```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Carlos",
    "email": "carlos@gmusic.academy"
  },
  "access": {
    "canAccessStudentZone": false,
    "reason": "NO_ACTIVE_SUBSCRIPTION"
  },
  "subscription": null
}
```

**Campos prohibidos en la respuesta:** montos, métodos de pago, IDs de transacción, credenciales, `secureAnswer`, datos de otros usuarios.

**Errores**

| Código HTTP | `error.code` | Cuándo |
|-------------|--------------|--------|
| 401 | `UNAUTHORIZED` | Sin auth / producción sin JWT |
| 403 | `FORBIDDEN` | Rol no alumno |

---

### `POST /api/v1/dev/activate-semestral` *(temporal — solo desarrollo local)*

Simula registro + compra semestral creando/actualizando un alumno y **exactamente una** suscripción `ACTIVE`.
**Eliminar este endpoint antes de producción.** En `NODE_ENV=production` responde `404` (como si no existiera).

**Alcance:** exclusivamente desarrollo local en el servidor API. La clave vive en `GMUSIC_DEV_ACTIVATION_KEY` del `.env` del backend.

**Prohibido en frontend:**

- Nunca definir ni leer esta clave en variables `VITE_*`.
- Nunca incluir la clave en el bundle del cliente ni enviarla desde el navegador en producción.
- R3.3B u otros flujos públicos deben invocar este endpoint solo desde entorno de desarrollo controlado, sin exponer el secreto al bundle.

**Auth:** header `X-Gmusic-Dev-Activation-Key` igual a `GMUSIC_DEV_ACTIVATION_KEY` (solo `.env` local del API; ver `.env.example`).
La clave debe tener **mínimo 24 caracteres** y no puede ser el placeholder `change-me-in-local-env`.
Configuración inválida, clave ausente o incorrecta → `404` (no revelar el endpoint).
La respuesta incluye `Cache-Control: no-store`.

**Request**

```json
{
  "name": "Juan Lizama",
  "email": "juan@gmusic.academy",
  "planId": "gmusic-semester-6-months"
}
```

| Campo | Reglas |
|-------|--------|
| `name` | Requerido, no vacío, máx. 100 caracteres |
| `email` | Requerido, normalizado a minúsculas, formato válido |
| `planId` | Solo `gmusic-semester-6-months` |

Campos prohibidos en el body: `role`, `status`, `endsAt`, XP, progreso, IDs, etc.

**Comportamiento**

- Upsert de `User` con `Role.STUDENT`.
- Rechaza si el email pertenece a `ADMIN` o `GUARDIAN` (`403 FORBIDDEN`).
- Elimina suscripciones previas del usuario y crea una `ACTIVE` con `endsAt = now + 6 meses calendario`.
- No crea progreso, XP, racha ni sesiones.
- Idempotente: primera activación `201`, reactivaciones `200`.
- Concurrencia serializada por email (advisory lock).

**Response 201 / 200**

```json
{
  "user": { "id": "...", "name": "...", "email": "..." },
  "subscription": {
    "status": "ACTIVE",
    "planId": "gmusic-semester-6-months",
    "endsAt": "2026-12-09T22:01:13.367Z"
  },
  "access": {
    "canAccessStudentZone": true,
    "reason": "ACTIVE_SUBSCRIPTION"
  }
}
```

**Errores**

| Código HTTP | `error.code` | Cuándo |
|-------------|--------------|--------|
| 404 | `INTERNAL_ERROR` | Producción, clave ausente/incorrecta |
| 400 | `VALIDATION_ERROR` | Body inválido o campos desconocidos |
| 403 | `FORBIDDEN` | Email de usuario ADMIN o GUARDIAN |

**Nota:** no altera `GET /me/access`; el guardián frontend sigue usando ese endpoint como fuente de verdad.

---

### `GET /api/v1/me/path`

Camino pedagógico para **Mi Camino**. Módulos y nodos con estado calculado en servidor.

**Auth:** alumno.

**Query (opcional)**

| Param | Tipo | Descripción |
|-------|------|-------------|
| `courseSlug` | string | Default: `ruta-guitarra-12-meses` |

**Response 200**

```json
{
  "course": {
    "id": "course-uuid",
    "title": "Guitarra · Fundamento",
    "slug": "guitarra-fundamento",
    "badge": {
      "instrument": "Guitarra",
      "month": "Mes 2",
      "level": "Fundamento"
    }
  },
  "modules": [
    {
      "id": "mod-3-uuid",
      "index": 3,
      "title": "Ritmo y rasgueo",
      "focus": "Pulso estable, patrones básicos y continuidad en la práctica",
      "nodesCompleted": 2,
      "nodesTotal": 6,
      "nodes": [
        {
          "id": "m3-n1-uuid",
          "title": "Patrón down-down-up",
          "order": 1,
          "status": "completed",
          "duration": "8 min",
          "contentKind": "video"
        },
        {
          "id": "m3-n3-uuid",
          "title": "Tu primer rasgueo en 4/4",
          "order": 3,
          "status": "active",
          "duration": "5 min",
          "contentKind": "audio_lab"
        },
        {
          "id": "m3-n4-uuid",
          "title": "Rasgueo con acordes",
          "order": 4,
          "status": "locked",
          "duration": "10 min",
          "contentKind": "video"
        }
      ]
    }
  ],
  "activeNodeId": "m3-n3-uuid"
}
```

**Notas**

- `contentKind` es vista pública; en DB el nodo tiene ejercicios `MicroExercise` con `ExerciseType`.
- Solo nodos `PUBLISHED` en contenido editorial; el alumno ve estados derivados de `UserProgress` + reglas de desbloqueo.

**Errores:** `401`, `403`, `404` (`COURSE_NOT_FOUND`).

---

### `POST /api/v1/lesson-sessions`

Inicia o reutiliza una sesión de práctica en un nodo. Crea `LessonSession` con `status: STARTED` cuando no hay sesión activa válida.

**Auth:** alumno.

**Request body**

```json
{
  "nodeId": "m3-n3-uuid"
}
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `nodeId` | UUID | Sí |

**Response 201** — sesión nueva creada.

**Response 200** — sesión `STARTED` existente reutilizada (mismo alumno, mismo nodo, iniciada hace menos de 3 horas).

```json
{
  "sessionId": "sess-uuid",
  "nodeId": "m3-n3-uuid",
  "status": "STARTED",
  "startedAt": "2026-06-08T15:00:00.000Z",
  "expiresAt": "2026-06-08T18:00:00.000Z",
  "exercises": [
    {
      "id": "ex-001-uuid",
      "type": "IDENTIFY_NOTE",
      "difficulty": 1,
      "instruction": "Escucha el audio e identifica qué cuerda suena al aire.",
      "contentPayload": {
        "audioUrl": "https://cdn.gmusic.academy/audio/samples/6th-string-e.mp3",
        "imageUrl": null,
        "options": [
          { "id": "a", "text": "1a cuerda (Mi)" },
          { "id": "b", "text": "5a cuerda (La)" },
          { "id": "c", "text": "6a cuerda (Mi grave)" },
          { "id": "d", "text": "4a cuerda (Re)" }
        ]
      }
    }
  ]
}
```

**Reglas**

- No incluir `secureAnswer`, `correctOptionId` ni explicaciones post-respuesta en payloads previos a responder.
- El nodo debe pertenecer al curso publicado configurado y estar `available` o `active` para el alumno.
- Una sesión `STARTED` previa del mismo alumno/nodo con menos de 3 horas se **reutiliza** (200); no se duplica.
- Sesiones `STARTED` vencidas (>3 h) del mismo alumno/nodo se marcan `ABANDONED` antes de crear una nueva (201).
- Concurrencia: advisory lock transaccional PostgreSQL por alumno+nodo evita sesiones STARTED duplicadas en peticiones simultáneas.

**Errores**

| HTTP | `error.code` | Cuándo |
|------|--------------|--------|
| 400 | `VALIDATION_ERROR` | Body inválido o `nodeId` no UUID |
| 400 | `INVALID_NODE` | Nodo inexistente, no publicado, `locked` o `completed` |
| 401 | `UNAUTHORIZED` | — |

---

### `POST /api/v1/lesson-sessions/:id/complete`

Cierra la sesión. Valida intentos, persiste `ExerciseAttempt`, actualiza XP, racha y progreso en **transacción**.

**Auth:** alumno dueño de la sesión.

**Path params:** `id` = `LessonSession.id`

**Request body**

```json
{
  "attempts": [
    {
      "microExerciseId": "ex-001-uuid",
      "selectedAnswer": "c",
      "responseTimeMs": 4200
    }
  ]
}
```

| Campo | Tipo | Requerido |
|-------|------|-----------|
| `attempts` | array | Sí, ≥1 |
| `attempts[].microExerciseId` | UUID | Sí |
| `attempts[].selectedAnswer` | string | Sí |
| `attempts[].responseTimeMs` | integer | Sí, ≥0 |

**Prohibido en request:** `isCorrect`, `xpEarned`, `accuracy`.

**Response 200 — primera vez procesada**

```json
{
  "sessionId": "sess-uuid",
  "status": "COMPLETED",
  "alreadyProcessed": false,
  "accuracy": 0.85,
  "xpEarned": 85,
  "streakUpdated": true,
  "currentStreak": 5,
  "nodeCompleted": true,
  "completedAt": "2026-06-08T15:12:00.000Z",
  "attemptsSummary": [
    {
      "microExerciseId": "ex-001-uuid",
      "isCorrect": true,
      "selectedAnswer": "c"
    }
  ]
}
```

**Response 200 — idempotente (sesión ya `COMPLETED`)**

```json
{
  "sessionId": "sess-uuid",
  "status": "COMPLETED",
  "alreadyProcessed": true,
  "accuracy": 0.85,
  "xpEarned": 85,
  "streakUpdated": true,
  "currentStreak": 5,
  "nodeCompleted": true,
  "completedAt": "2026-06-08T15:12:00.000Z"
}
```

**Lógica servidor (resumen)**

1. Advisory lock transaccional por `sessionId` (idempotencia bajo concurrencia).
2. Verificar `session.userId === auth.userId`.
3. Si `status === COMPLETED` → devolver snapshot sin re-procesar (`alreadyProcessed: true`, sin `attemptsSummary`).
4. Si ventana > 3h → `ABANDONED` + error `SESSION_EXPIRED`.
5. Si `status !== STARTED` → `SESSION_NOT_STARTABLE`.
6. Comparar cada `selectedAnswer` con `MicroExercise.secureAnswer` (solo servidor).
7. `accuracy = correctos / total ejercicios del nodo`.
8. Si `accuracy >= 0.7` → marcar `UserProgress.isCompleted`.
9. Si `accuracy >= 0.7` y no hay `StreakEvent` hoy (timezone alumno) → crear/continuar racha (ayer +1 o 1).
10. Crear `XpEvent` con `reason: SESSION_COMPLETED` (único por sesión).
11. Actualizar `LessonSession` → `COMPLETED`.

**Errores**

| HTTP | `error.code` | Cuándo |
|------|--------------|--------|
| 400 | `INVALID_ATTEMPT` | Ejercicio no pertenece al nodo/sesión |
| 400 | `VALIDATION_ERROR` | Body/`attempts` inválido, campos prohibidos o `microExerciseId` duplicado |
| 401 | `UNAUTHORIZED` | — |
| 403 | `FORBIDDEN` | Sesión de otro usuario |
| 404 | `SESSION_NOT_FOUND` | — |
| 410 | `SESSION_EXPIRED` | Ventana excedida → `ABANDONED` |
| 422 | `SESSION_NOT_STARTABLE` | Estado no `STARTED` |

---

## Endpoints — Apoderado

### `GET /api/v1/guardian/students`

Lista alumnos vinculados al apoderado autenticado vía `GuardianLink`.

**Auth:** apoderado (`Role.GUARDIAN`).

**Response 200**

```json
{
  "students": [
    {
      "id": "student-uuid",
      "name": "Carlos",
      "linkedAt": "2026-01-15T10:00:00.000Z",
      "summary": {
        "currentStreak": 4,
        "totalXp": 1240,
        "activeNodeTitle": "Tu primer rasgueo en 4/4",
        "lastPracticeAt": "2026-06-07T20:30:00.000Z"
      }
    }
  ]
}
```

**Errores:** `401`, `403` (rol no apoderado).

---

### `GET /api/v1/guardian/students/:id/report`

Reporte de actividad de un alumno. **Requiere** `GuardianLink` entre apoderado y `:id`.

**Auth:** apoderado.

**Path params:** `id` = `User.id` del alumno.

**Query (opcional)**

| Param | Default | Descripción |
|-------|---------|-------------|
| `days` | `7` | Ventana de días para actividad |

**Response 200**

```json
{
  "student": {
    "id": "student-uuid",
    "name": "Carlos",
    "timezone": "America/Santiago"
  },
  "periodDays": 7,
  "activeDays": 5,
  "currentStreak": 4,
  "totalXp": 1240,
  "xpThisPeriod": 180,
  "averageAccuracy": 0.82,
  "moduleProgress": {
    "moduleTitle": "Ritmo y rasgueo",
    "percentCompleted": 38
  },
  "recentSessions": [
    {
      "sessionId": "sess-uuid",
      "nodeTitle": "Tu primer rasgueo en 4/4",
      "status": "COMPLETED",
      "accuracy": 0.85,
      "xpEarned": 85,
      "completedAt": "2026-06-07T20:30:00.000Z"
    }
  ]
}
```

**Errores**

| HTTP | `error.code` | Cuándo |
|------|--------------|--------|
| 401 | `UNAUTHORIZED` | — |
| 403 | `GUARDIAN_LINK_REQUIRED` | No existe vínculo |
| 404 | `STUDENT_NOT_FOUND` | Alumno inexistente |

---

## Mapa endpoint → modelos Prisma

| Endpoint | Modelos principales |
|----------|---------------------|
| `GET /me/dashboard` | `User`, `StreakEvent`, `XpEvent`, `UserProgress`, `PathNode`, `Module` |
| `GET /me/path` | `Course`, `Module`, `PathNode`, `UserProgress` |
| `POST /lesson-sessions` | `LessonSession`, `MicroExercise`, `PathNode` |
| `POST /lesson-sessions/:id/complete` | `LessonSession`, `ExerciseAttempt`, `UserProgress`, `XpEvent`, `StreakEvent` |
| `GET /guardian/students` | `GuardianLink`, `User`, agregados |
| `GET /guardian/students/:id/report` | `GuardianLink`, `LessonSession`, `XpEvent`, `StreakEvent` |

---

## Implementación mock (sin DB)

**Obsoleto para Fase 3A+.** Los endpoints `GET /me/dashboard`, `GET /me/path`, `POST /lesson-sessions` y `POST /lesson-sessions/:id/complete` leen/escriben PostgreSQL vía Prisma. Pendiente: apoderados.

---

## Fuera de alcance MVP (v1)

- GraphQL
- WebSockets / Realtime
- Sync offline (`outbox`) — fase 4 en `learning-engine.md`
- Pagos / webhooks de suscripción (`Subscription` en schema, endpoints TBD)
- Admin CMS de contenido

---

## Changelog

| Fecha | Cambio |
|-------|--------|
| 2026-06-10 | `POST /dev/activate-semestral` — activación simulada de suscripción (solo desarrollo) |
| 2026-06-09 | `GET /me/access` — contrato de acceso a zona privada del alumno |
| 2026-06-08 | Contrato inicial MVP — 6 endpoints alumnos + apoderados |
