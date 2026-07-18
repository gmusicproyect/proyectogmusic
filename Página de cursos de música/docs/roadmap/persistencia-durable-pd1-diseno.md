# PD-1 — Diseño Persistencia Durable H1

**Fecha:** 2026-07-17  
**Mandato:** Persistencia Durable H1 — solo PD-0 + PD-1 (autorizado Juan)  
**Estado:** **diseño propuesto para aprobación** · **sin schema · sin migraciones · sin código productivo**  
**Baseline:** D-PD-01…06 del brief (ajustables aquí antes de PD-2)  
**Inventario:** `docs/roadmap/persistencia-durable-pd0-inventario.md`  
**Brief:** `docs/roadmap/persistencia-durable-brief-supervisor.md`

---

## 1. Una línea

Diseñar persistencia durable local para eventos H1, proyecciones de progreso, catálogo Biblioteca, snapshot de sesión (R-001) y policy de entitlements backend (R-002), sin romper contratos P0 y sin abrir UI/Premium/Comunidad/Profile/prod.

---

## 2. Decisiones baseline (D-PD-01…06) — diseño propuesto

| ID | Decisión brief | Diseño PD-1 (propuesto) | ¿Ajuste? |
|----|----------------|-------------------------|----------|
| **D-PD-01** | Tabla append-only `PracticeEvent` + proyecciones | Confirmar: tabla `PracticeEvent` (nombre Prisma tentativo); **no** mapear a `XpEvent`/`UserProgress` | Ninguno |
| **D-PD-02** | Eventos = evidencia; proyecciones = lectura | Confirmar: write-path solo append eventos; proyecciones actualizadas en la misma tx o rebuild job; `progressViewH1`/`pathViewH1` leen proyección o rebuild on-read | Ninguno |
| **D-PD-03** | Tablas propias Biblioteca | Confirmar: `LibraryResource` (+ opcional join tables); **no** reutilizar `PathNode` como recurso | Ninguno |
| **D-PD-04** | Snapshot mínimo por `LessonSession` | Confirmar: campo(s) en `LessonSession` al start; complete valida contra snapshot | Detalle §5 |
| **D-PD-05** | Policy entitlements en endpoints privados | Confirmar: helper/middleware compartido; `/me/access` no basta | Detalle §6 |
| **D-PD-06** | Local/Docker primero; prod bloqueado | Confirmar: migraciones solo entorno test/local; prod OUT | Ninguno |

**Onboarding H1 (descubierto en PD-0, implícito en mandato “progreso/contexto”):**  
Propuesta PD-1-extra: persistir proyección onboarding en tabla `LearnerProjectionH1` (o nombre equivalente) keyed por `userId`, **sin** tabla Profile. Si Juan/Opus prefieren diferirlo a un PD posterior, documentar como **fase PD-2b** opcional; Path/Progress siguen necesitando `currentMonth` / `onboardingCompleted` durables para no perder estado al reiniciar.

---

## 3. Modelo conceptual (sin Prisma aún)

### 3.1 PracticeEvent (append-only)

```text
PracticeEvent {
  id              UUID PK                    // = eventId
  userId          UUID FK → User             // profileId H1
  eventType       enum PracticeEventTypeH1
  occurredAt      DateTime
  sessionId       UUID? FK → LessonSession
  tarjetaId       String?                    // id dominio FTC
  unidadId        String?
  monthIndex      Int?
  slot            Int?
  payload         Json                       // effectiveMinutes, binaryComplete, source
  causationCommandId String?
  naturalKey      String?                    // denormalizado para UNIQUE parcial
  createdAt       DateTime
}
```

**Uniques / índices (diseño):**

| Constraint | Objetivo |
|------------|----------|
| UNIQUE(`id`) | Idempotencia eventId |
| UNIQUE(`userId`, `eventType`, `causationCommandId`) WHERE causation NOT NULL | Retry comando |
| UNIQUE(`naturalKey`) WHERE naturalKey NOT NULL | card/unit/session+type |
| INDEX(`userId`, `occurredAt`) | Rebuild / listado |

**Reglas:** no UPDATE de filas de hecho (solo append); correcciones = eventos compensatorios o rebuild de proyección.

### 3.2 Proyecciones de progreso

Opción recomendada (simple, auditable):

```text
FtcProgressProjection {
  userId              UUID PK FK → User
  completedCardIds    Json   // string[]
  completedUnitIds    Json
  slotsByUnit         Json   // Record<unidadId, slot[]>
  rebuiltAt           DateTime
  rebuildSource       "events" | "migration"
  schemaVersion       Int
}
```

**Alternativa** (más normalizada): tablas `FtcCardCompletion` / `FtcUnitCompletion` con UNIQUE(userId, tarjetaId|unidadId) — preferible si se consulta mucho por card; ambas válidas. **Recomendación PD-1:** empezar con proyección JSON + UNIQUE completions opcionales en PD-2 si hace falta índice.

**Regla D-PD-02:**  
- Escritura canónica = `PracticeEvent`.  
- Tras append exitoso → actualizar proyección en la misma transacción.  
- `rebuildProgress(userId)` relee eventos ordenados y reemplaza proyección (idempotente).

`UserProgress` / `XpEvent` / `StreakEvent` **siguen** para Track A nodos; no son la fuente de `pathViewH1`/`progressViewH1`. Streak H1 (días con `practice_completed`) se deriva de eventos o se alinea a `StreakEvent` en fase posterior — **MVP PD:** derivar de eventos en lectura como hoy.

### 3.3 LearnerProjectionH1 (onboarding / contexto)

```text
LearnerProjectionH1 {
  userId                 UUID PK FK → User
  onboardingStatus       enum
  partialAnswers         Json?
  result                 Json?          // OnboardingResultH1
  learningGoalOverride   String?
  weeklyGoalMinutesOverride Int?
  updatedAt              DateTime
}
```

Reemplaza `profileProjectionH1Store` en memoria. H1: no Profile table.

### 3.4 LibraryResource (catálogo)

```text
LibraryResource {
  id                 String PK           // id estable editorial
  titleInternal      String
  titlePublic        String?
  instrument         String              // MVP guitarra
  level              String
  suggestedMonth     Int?
  skillKey           String?
  type               enum ResourceType
  estimatedMinutes   Int
  accessTier         enum basic|premium
  status             enum DRAFT|PUBLISHED|ARCHIVED
  mediaRef           String?             // null hasta multimedia
  createdAt / updatedAt
}

LibraryResourceLink {                 // opcional N:M
  resourceId
  tarjetaId? / unidadId? / monthIndex?
}
```

Seed local controlado (fixture → filas) en PD-4; **no** multimedia real.

### 3.5 LessonSession snapshot (R-001 / D-PD-04)

Extensión conceptual de `LessonSession` (campos nuevos en PD-2):

```text
contentSnapshot   Json?     // al STARTED: lista de { microExerciseId, type, contentPayloadHash, secureAnswerHash o secureAnswer copia }
contentVersion    Int?      // Course.version o hash de nodo al iniciar
```

**Política:**

| Momento | Comportamiento |
|---------|----------------|
| `POST start` | Persistir snapshot mínimo de ejercicios del nodo (payload público + secureAnswer **solo en DB**, nunca en response API) |
| `complete` Track A | Validar `selectedAnswer` contra snapshot de la sesión, no contra `MicroExercise` actual |
| Complete H1 binario | No depende de secureAnswer; snapshot opcional pero recomendado si la sesión toca nodo con exercises |
| Edición PathNode/MicroExercise | No altera sesiones ya STARTED |

**Fuera de PD:** CMS versionado completo; basta snapshot por sesión.

---

## 4. Contratos API — política de no ruptura

| Endpoint | Cambio permitido en PD-2/3 | Prohibido |
|----------|----------------------------|-----------|
| `pathViewH1` / `progressViewH1` / `libraryViewH1` | `meta.eventSource` / `catalogSource` → `db` o `db_with_rebuild` | Cambiar shape de items sin versión |
| Legacy `/me/path` modules/nodes | Intactos | Mezclar Biblioteca en path |
| `/me/access` | Puede seguir exponiendo entitlements | Ser la única capa de authz |

Durante transición: feature flag `GMUSIC_H1_DURABLE=1` (local) — lectura única DB cuando ON; memoria solo tests unitarios del store legacy o retirado al cerrar PD-5.

---

## 5. R-001 — estrategia snapshot (resumen)

1. Al crear `LessonSession`, cargar ejercicios del `nodeId` y guardar snapshot JSON.  
2. `secureAnswer` permanece en snapshot servidor; API pública solo `contentPayload` del snapshot.  
3. `ExerciseAttempt` referencia `microExerciseId` histórico; validación usa snapshot.  
4. Si el ejercicio fue borrado después: sesión sigue completable vía snapshot.  
5. Activador de prioridad: cualquier mutación editorial con sesiones abiertas (Admin/seed/SQL).

**Gate producto:** sin snapshot, **no** promover edición de contenido prod con alumnos activos.

---

## 6. R-002 — policy entitlements backend (D-PD-05)

### 6.1 Helper propuesto (código futuro, no ahora)

```text
assertStudentLearningAccess(student, {
  requireZone?: boolean,      // Subscription ACTIVE / canAccessStudentZone
  monthIndex?: number,        // monthsPlayable
  library?: "read" | "none",
})
```

### 6.2 Matriz de enforcement (diseño)

| Endpoint | requireZone | month / library |
|----------|-------------|-----------------|
| `POST /lesson-sessions` | sí (recomendado) | monthIndex H1 si metadata FTC |
| progress/complete/abandon sesión | sí | coherente con sesión |
| `GET /me/path` | sí (recomendado) o soft + blockers | ya hay blockers mes |
| `GET /me/progress` | sí (recomendado) | — |
| `GET /me/library` | sí + `libraryTier ≠ none` | tier en items |
| `GET /me/dashboard` | sí (recomendado) | — |
| `GET /me` onboarding/profiles | auth only (pre-zone OK) | — |
| `GET /me/access` | auth only | — |

**Nota:** endurecer `requireZone` puede romper cuentas DEMO sin sub usadas en QA. PD-2 debe incluir matriz de tests y, si hace falta, excepción explícita `accountTier=DEMO` + grant demo (ya modelada en entitlementsH1) en lugar de saltarse el check.

Premium library: sigue **locked** aunque grant diga premium (MVP force OFF).

---

## 7. Plan de migración local (solo diseño; ejecución = PD-2+)

| Paso | Acción | Entorno |
|------|--------|---------|
| M0 | Aprobar este PD-1 | — |
| M1 | Redactar `schema.prisma` + migración **local/docker** | Local |
| M2 | `migrate deploy` / `migrate dev` solo DB CI/docker | Local |
| M3 | Repositorios: `PracticeEventRepo`, proyección, library, learner projection | Local |
| M4 | Dual-write o cutover con flag | Local |
| M5 | Seed Biblioteca desde fixture H1 | Local |
| M6 | Suites T-PD + regresión P0 | Local |
| M7 | **No** prod (R-OPS-01) | Bloqueado |

**Datos en memoria:** no hay migración de datos de proceso; entornos reiniciados empiezan vacíos salvo seed editorial.

---

## 8. Fases de implementación posteriores (recordatorio; **no autorizadas**)

| Fase | Entrega | Gate |
|------|---------|------|
| **PD-2** | Schema + migración local + repos | OK Juan post PD-1 |
| **PD-3** | Servicios H1 escriben/leen durable | Contratos P0 |
| **PD-4** | Biblioteca DB + seed controlado | Reglas H1 library |
| **PD-5** | Hardening idempotencia/concurrencia/R-002 | Suites T-PD |
| **PD-6** | Evidencia + handoff | Commit/push solo con OK |

---

## 9. Tests mínimos (para PD-2+)

Hereda brief § Tests + PD-0:

- Idempotencia PracticeEvent (eventId, commandId, naturalKey).  
- Rebuild proyección = mismo snapshot que proyección incremental.  
- Complete sesión usa snapshot aunque MicroExercise cambie.  
- Library: DRAFT/ARCHIVED ocultos; premium locked.  
- Entitlements: sin zone / sin mes → 403 ENTITLEMENT.  
- Regresión: pathViewH1 / progressViewH1 / libraryViewH1 shape.  
- Timezone streak/semana en servidor.

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Doble verdad memoria + DB | Flag de lectura única; retirar store memoria al cerrar PD-5 |
| Mezclar UI | Prohibido hasta contratos durables estables |
| Profile table creep | `userId` only; H1 explícito en docs |
| R-OPS-01 prod | Cero migraciones prod en este mandato |
| Árbol dirty | Staging selectivo en cualquier commit futuro |
| DEMO vs zone gate | Usar grants demo del catálogo H1, no bypass silencioso |

---

## 11. Entregables PD-1 / qué debe aprobar Juan

- [x] Diseño alineado a D-PD-01…06  
- [x] Modelo conceptual PracticeEvent + proyección + Library + LearnerProjection + snapshot  
- [x] Estrategia R-001 / R-002  
- [x] Plan migración **local** sin prod  
- [x] Lista de fases PD-2…6 **sin autorización de ejecución**  
- [ ] **Firma Juan/Opus** para abrir PD-2 (schema/migraciones locales)

### Frase sugerida para abrir PD-2

```text
OK, apruebo PD-1 y abro PD-2 Persistencia Durable H1.
Schema + migración solo local/Docker.
Sin UI, Premium, Comunidad, Profile, prod ni push.
```

---

## 12. Criterio de salida PD-0+PD-1 (este mandato)

| Entrega | Estado |
|---------|--------|
| PD-0 inventario | ✅ `persistencia-durable-pd0-inventario.md` |
| PD-1 diseño | ✅ este documento |
| Schema / migraciones / código productivo | ❌ no tocados |
| Commit / push | ❌ no |

**Siguiente acción humana:** revisar y firmar PD-1 (o pedir ajustes D-PD / LearnerProjection) antes de PD-2.

---

*PD-1 diseño · Persistencia Durable H1 · 2026-07-17 · ejecución PD-2 NO autorizada*
