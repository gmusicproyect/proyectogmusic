# P0-05 — Sesión + Eventos H1

- Cuenta y Perfil: `accountId = profileId = userId` (puente temporal D-DOM-001).
- Sesión operativa: `LessonSession`; progreso de tarjeta: `UserProgress`.
- Eventos append-only: store H1 en memoria, idempotente durante la vida del proceso.
- Sin schema/migraciones: el event store **no es durable entre reinicios**.
- StartPractice conserva el gate `monthsPlayable` de P0-07.
- CompletePractice H1 usa `binaryComplete=true`; no calcula score, accuracy, pitch, audio ni estrellas.
- Flujo legacy de cierre con intentos permanece separado por compatibilidad.

Eventos MVP:

`practice_started` · `practice_completed` · `practice_abandoned` ·
`ftc_card_completed` · `unit_completed`

Idempotencia:

- `eventId`
- `clientRequestId`/causation
- clave natural por sesión
- `(profileId, tarjetaId)` para tarjeta completada
- `(profileId, unidadId)` para unidad completada

Código: `server/lib/practiceEventsH1.ts`,
`server/services/practiceLifecycleH1Service.ts`.
