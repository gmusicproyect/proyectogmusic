# Gmusic Learning Engine — API Contract (MVP)

Contrato REST v1 para el motor de aprendizaje.  
**Estado:** Fase 3A — backend Express con PostgreSQL real para endpoints de **solo lectura** (`health`, `me/dashboard`, `me/path`). Sesiones y apoderados pendientes.

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

Inicia una sesión de práctica en un nodo. Crea `LessonSession` con `status: STARTED`.

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

**Response 201**

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
- El nodo debe estar `available` o `active` para el alumno.
- Una sesión `STARTED` previa en el mismo nodo puede reutilizarse o rechazarse — implementación TBD; MVP mock: siempre crear nueva.

**Errores**

| HTTP | `error.code` | Cuándo |
|------|--------------|--------|
| 400 | `INVALID_NODE` | Nodo inexistente o `locked` |
| 401 | `UNAUTHORIZED` | — |
| 409 | `SESSION_ALREADY_ACTIVE` | Opcional: ya hay sesión abierta en ventana válida |

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

1. Verificar `session.userId === auth.userId`.
2. Si `status === COMPLETED` → devolver snapshot sin re-procesar.
3. Si ventana > 3h → `ABANDONED` + error `SESSION_EXPIRED`.
4. Comparar cada `selectedAnswer` con `MicroExercise.secureAnswer`.
5. `accuracy = correctos / total ejercicios del nodo`.
6. Si `accuracy >= 0.7` → marcar `UserProgress.isCompleted`.
7. Si `accuracy >= 0.7` y no hay `StreakEvent` hoy (timezone alumno) → crear/actualizar racha.
8. Crear `XpEvent` con `reason: SESSION_COMPLETED` (único por sesión).
9. Actualizar `LessonSession` → `COMPLETED`.

**Errores**

| HTTP | `error.code` | Cuándo |
|------|--------------|--------|
| 400 | `INVALID_ATTEMPT` | Ejercicio no pertenece al nodo/sesión |
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

**Obsoleto para Fase 3A+.** Los endpoints `GET /me/dashboard` y `GET /me/path` leen PostgreSQL vía Prisma. Los POST de sesión pueden seguir en fixture hasta Fase 3B.

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
| 2026-06-08 | Contrato inicial MVP — 6 endpoints alumnos + apoderados |
