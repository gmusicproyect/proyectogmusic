# 02 — Modelo de datos (Track A)

**Fase:** 2 — ARQUITECTURA Y DISEÑO  
**Fecha:** 2026-07-14  
**Fuente canónica de código:** `prisma/schema.prisma`  
**Contrato producto:** `docs/product/01-mvp-gmusic.md` + **D-F1-001** (congelado)  
**Docs relacionados:** `database-schema.md` (histórico/principios), `gmusic-architecture-working-map.md` (riesgos R-001/R-002), `learning-engine.md`  
**Regla de esta fase:** documentación + auditoría. **Sin** aplicar migraciones ni cambiar schema.

---

## 1. Objetivo

Declarar el modelo de datos **real** del repo (nombres Prisma), mapearlo al lenguaje del protocolo/MVP, listar gaps vs MVP congelado y señalar migraciones/seeds existentes vs faltantes — para que la plataforma crezca sin desorden.

---

## 2. Mapa protocolo / MVP → schema real

| Concepto protocolo / MVP | Entidad real Prisma | Notas |
|--------------------------|---------------------|--------|
| User | `User` | Email único, `passwordHash`, `role`, `accountTier` |
| Profile | **No hay `Profile`** | Datos de perfil viven en `User` (name, phone, timezone…) |
| Role (tabla) | **No hay tabla `Role`** | Enum `Role` en `User.role` (`STUDENT` \| `GUARDIAN` \| `ADMIN`) |
| Instrument | **No hay tabla `Instrument`** | String en UI / `CommunityEnrollment.instrument` / onboarding analytics; producto D-007 = Guitarra activa |
| Level | **No hay tabla `Level`** | Pedagógico: `StageType` + matriz UI; comunidad: enum `CommunityLevel` + `CommunityEnrollment.academicTierId` |
| Course | `Course` | `slug` único, `PublishStatus` |
| Module (bloque) | `Module` | Hijo de `Course`; orden único por curso; bloque usable = 5 `PathNode` |
| Lesson | `PathNode` | **Nombre canónico schema = etapa**; no inventar tabla `Lesson` duplicada |
| LessonCard / “cinco tarjetas” | `PathNode` ×5 por `Module` | UI de las 5 etapas fijas (`FUNDAMENTO_UNO`…`TOCAR`); no modelo `LessonCard` |
| Resource (media/guía) | Campos en `PathNode` + `MicroExercise.contentPayload` | `videoUrl`, `guidePdfUrl`, `guideText`; sin tabla `Resource` |
| Enrollment (acceso curso) | **No hay `Enrollment` de curso** | Acceso zona alumno = `Subscription` ACTIVE (D-017); contexto feed = `CommunityEnrollment` |
| Progress | `UserProgress` | Por `(userId, nodeId)` |
| Lesson session | `LessonSession` + `ExerciseAttempt` | Estados `STARTED` / `COMPLETED` / `ABANDONED` |
| Micro-ejercicio | `MicroExercise` | `secureAnswer` **solo servidor** |
| XP / racha | `XpEvent` / `StreakEvent` | Motor; UI Mi Progreso avanzada = OUT MVP |
| Plan | **No hay tabla `Plan`** | `Subscription.planId` string + planes marketing en TS frontend |
| Access / Subscription | `Subscription` | `status` + `planId`; gate `/me/access` |
| Comment | **Gap — no hay modelo** | MVP IN “comentar”; API stub `comments: 0` — ver §7 |
| Community* | `CommunityEnrollment` + `CommunityPost` | Posts tipados; sin comentarios persistidos |
| Demo progress (cuenta) | `DemoProgress` | Por `userId` + `lessonNumber`; demo anónima sigue en `localStorage` (`gmusic:demo_v1`) |
| Guardian / ERP | `GuardianLink` | Schema existe; UI familias ERP = WON'T MVP |
| Onboarding quiz | `OnboardingAnalytics` | Temperamento / lead; no es núcleo happy path lección |

---

## 3. Enums relevantes

| Enum | Valores | Uso MVP |
|------|---------|---------|
| `Role` | STUDENT, GUARDIAN, ADMIN | Auth + `requireAdmin` |
| `AccountTier` | DEMO, SUBSCRIBER | Identidad comercial ligera (junto a Subscription) |
| `PublishStatus` | DRAFT, PUBLISHED, ARCHIVED | T-PUB-01 / Admin |
| `StageType` | FUNDAMENTO_UNO… TOCAR | Pedagoga bloque (D-GOV-04) |
| `SessionStatus` | STARTED, COMPLETED, ABANDONED | Sesiones de lección |
| `SubscriptionStatus` | ACTIVE, PAST_DUE, CANCELED | Gate zona alumno (D-017): típico **ACTIVE** |
| `ExerciseType` | IDENTIFY_NOTE, RHYTHM_TAP, EAR_TRAINING, CHORD_SHAPE | Motor |
| `CommunityLevel` / `CommunityPostType` / `ExternalLinkProvider` | ver schema | Feed comunidad |

---

## 4. Entidades principales (campos y reglas)

### 4.1 Identity — `User`

| Campo | Tipo | Notas |
|-------|------|--------|
| `id` | UUID | PK |
| `email` | unique | Login |
| `name` | string | |
| `role` | Role | Default STUDENT |
| `accountTier` | AccountTier | Default DEMO |
| `passwordHash` | string? | JWT liviana IN MVP; VERIFY email OUT |
| `phone`, `timezone` | opc. / default Santiago | |
| `createdAt` / `updatedAt` | timestamps | |

**Permisos (modelo):** `ADMIN` opera admin API; `STUDENT` zona alumno (UI + APIs alumno); `GUARDIAN` sin producto ERP en MVP.

**Borrado:** cascade a progreso, sesiones, subs, comunidad del usuario, etc. (ver §5).

### 4.2 Membership — `Subscription`

| Campo | Notas |
|-------|--------|
| `userId` | FK User |
| `status` | ACTIVE / PAST_DUE / CANCELED |
| `planId` | String (tiers marketing `basico`/`plus`/`familiar` × período — **sin** tabla Plan) |
| `endsAt` | opcional |
| timestamps | |

**Regla producto (D-017):** sin `Subscription` **ACTIVE**, no acceso zona alumno. Activación MVP = ops/admin + WhatsApp BRIDGE (no Stripe).

### 4.3 Academy Content — `Course` → `Module` → `PathNode` → `MicroExercise`

```text
Course (1) ──< Module (N) ──< PathNode (N) ──< MicroExercise (N)
```

| Entidad | IDs / orden | Estados | Borrado |
|---------|-------------|---------|---------|
| Course | `id`, `slug` unique | `PublishStatus` | Restrict desde Module |
| Module | `@@unique(courseId, order)` | idem | Restrict desde PathNode; Restrict←Course |
| PathNode | `@@unique(moduleId, order)` | idem + `stageType?`, media, criterios | Restrict←Module; progreso/sesiones Restrict |
| MicroExercise | `@@unique(nodeId, order)` | payload + `secureAnswer` | Cascade desde PathNode |

**Regla editorial (D-GOV-04 / R-008):** publicar bloque usable = 5 etapas con criterios; contenido vía Admin Creador. **T-PUB-01** = pipeline publish→alumno visible.

### 4.4 Learning Journey — progreso y sesiones

| Entidad | Clave | Regla |
|---------|-------|--------|
| `UserProgress` | `(userId, nodeId)` unique | `isCompleted`, `unlockedAt`, `completedAt?` |
| `LessonSession` | por user+node | Sesión de práctica; no versiona snapshot de contenido (**R-001**) |
| `ExerciseAttempt` | `(sessionId, microExerciseId)` | Respuesta validada servidor |
| `XpEvent` / `StreakEvent` | eventos | Idempotencia por diseño; UI avanzada OUT Mi Progreso MVP |

### 4.5 Acquisition / demo

| Fuente | Persistencia | MVP |
|--------|--------------|-----|
| Demo 5 clases (anónimo / local) | `localStorage` `gmusic:demo_v1` + TS `demo-lessons` | MUST funnel; **fuente pedagógica distinta** de Postgres (**R-003**) |
| Demo por usuario autenticado | `DemoProgress` | Complementa; no sustituye path suscriptor |
| Planes marketing | frontend `subscription-plans.ts` | MUST precios; no tabla Plan |

### 4.6 Comunidad

| Entidad | Capacidad |
|---------|-----------|
| `CommunityEnrollment` | 1:1 User — instrumento, tier académico, lección actual (contexto feed) |
| `CommunityPost` | Posts tipados por nivel/instrumento; links externos opcionales |

**Gap duro vs MVP §6 C:** “comentar” está IN, pero **no existe** `CommunityComment` ni rutas `POST/GET …/comments` (solo enrollment + posts). Ver §7.

Mocks peers/mentorship en frontend (`mock-community-*`) ≠ contrato launch (D-ROAD-005 C).

### 4.7 Admin / Guardian

- Admin = `User.role = ADMIN` + middleware `requireAdmin` (no tabla Profile).  
- `GuardianLink` = schema listo; producto familias = WON'T.

---

## 5. Reglas de borrado (resumen)

| Relación | onDelete | Motivo |
|----------|----------|--------|
| User → sessions, progress, xp, streak, subs, demo, community | Cascade | Limpieza identidad |
| Module → Course / PathNode → Module / Session→PathNode / Progress→PathNode | Restrict | No borrar contenido con historial |
| MicroExercise → PathNode / Attempts → Session | Cascade (hijos directos) | Contenido de nodo / sesión |
| XpEvent.sessionId | SetNull | Mantenimiento de sesión |
| OnboardingAnalytics.userId | SetNull | Lead puede quedar huérfano |

Detalle ampliado: `docs/architecture/database-schema.md` § integridad (puede estar desfasado vs enums nuevos — **priorizar schema.prisma**).

---

## 6. Permisos de datos (modelo)

| Actor | Lectura contenido PUBLISHED | Mutar progreso | Publicar Course/Module/Node | Feed community | Activar Subscription |
|-------|----------------------------|----------------|-----------------------------|----------------|----------------------|
| Anónimo | No zona alumno | Demo localStorage | No | No (API community exige auth) | No |
| STUDENT sin ACTIVE | Limitado (guard UI; **R-002** en API) | Depende enforcement API | No | Enrollment/posts si auth | No self-serve Stripe |
| STUDENT + ACTIVE | Sí (path/dashboard) | Sí | No | Sí posts | No (ops) |
| ADMIN | Sí + DRAFT | Ops | Sí (R-008) | Moderación mínima esperada | Sí (ops / seed) |

---

## 7. Gaps vs MVP congelado (solo plan — no implementar aquí)

| Gap | Evidencia | Plan sugerido (fases posteriores) |
|-----|-----------|-----------------------------------|
| **Mi Progreso UI** | Sin página; datos en `UserProgress` / sesiones / path API | Ticket **T-MVP-PROGRESS** — agregar superficie; **sin** modelo nuevo si se agregan lecturas agregadas |
| **Comunidad comentarios** | MVP IN “comentar”; schema/API solo posts | Decidir: (a) modelo `CommunityComment` + migración **o** (b) acotar copy a “publicar/ver” vía gobernanza — hoy es **gap contrato↔schema** |
| **Mocks comunidad launch** | `mock-community-*`, paneles peers/mentorship | **T-MVP-COMMUNITY** — API real o quitar de nav/launch |
| **T-PUB-01 / path vacío** | Seeds parciales; prod necesita ≥1 bloque PUBLISHED usable | Piloto admin→alumno; seeds staging documentados |
| **Plan como entidad** | `planId` string suelto | Aceptable MVP BRIDGE WhatsApp; tabla Plan post-pasarela |
| **Instrument entity** | No tabla | OK MVP D-007 (Guitarra); tabla solo si multi-instrumento |
| **Profile separado** | No | OK; roles en User |
| **Demo vs Academy dual source** | TS demo + Postgres path | Documentar R-003; unificar solo con decisión |
| **R-001** | Session sin version snapshot | No mitigar sin decisión; activador = edición prod con sesiones |
| **R-002** | Entitlements no en todos endpoints Learning | Gate producto prep-launch; middleware shared — fase auth/ops |
| **Agregar % / siguiente lección** | Calculable desde `UserProgress` + PathNode order | Capa servicio/API de lectura para Mi Progreso — sin inventar tablas si no hace falta |

**Criterio arquitectura (cierre Fase 2):** el schema **puede** soportar el núcleo MVP (User, Subscription, Course/Module/PathNode, UserProgress, LessonSession, CommunityPost) **sin** mocks como fuente de verdad de launch; los gaps anteriores son de **producto/APIs/migración puntual (comments)**, listados con plan.

---

## 8. Migraciones existentes vs faltantes

### Ya existen (`prisma/migrations/`)

| Migración | Aporte |
|-----------|--------|
| `20260608213449_init_gmusic_tables` | Núcleo learning + users |
| `20260622143000_onboarding_analytics` | Quiz temperamento |
| `20260623190000_onboarding_lead_email` | Lead email |
| `20260624120000_auth_user_fields` | Auth liviana (`passwordHash`, etc.) |
| `20260702180000_community_posts_enrollment` | Comunidad enrollment + posts |
| `20260702200000_pathnode_stage_fields` | StageType / campos etapa |
| `20260702210000_pathnode_guide_pdf_url` | Guía PDF |

### Seeds

| Artefacto | Rol |
|-----------|-----|
| `prisma/seed.ts` | Users demo + curso/módulos/nodos/ejercicios de ejemplo |
| `prisma/seed-new-student.ts` | Alumno nuevo / ops |

### Faltantes (plan — **no aplicar en Fase 2**)

1. Migración **comentarios comunidad** (si se confirma MUST “comentar” sin enmienda MVP).  
2. Seeds/piloto **T-PUB-01** en entorno prod/staging con bloque PUBLISHED completo (dato, no necesariamente migración).  
3. Cualquier tabla `Plan` / billing — **post** decisión pasarela (OUT MVP).  
4. Versionado contenido para **R-001** — solo tras decisión arquitectura.  
5. Índices/agregados dedicados a Mi Progreso — solo si medición lo exige.

---

## 9. Diagrama ER (resumido)

```text
User ──< Subscription
User ──< UserProgress >── PathNode
User ──< LessonSession >── PathNode
LessonSession ──< ExerciseAttempt >── MicroExercise
PathNode ──< MicroExercise
Module ──< PathNode
Course ──< Module
User ── CommunityEnrollment
User ──< CommunityPost
User ──< DemoProgress
User ──< GuardianLink >── User
```

---

## 10. Criterio de cierre Fase 2 (este documento)

- [x] Entidades reales nombradas y mapeadas al MVP  
- [x] Relaciones, estados, borrado y permisos resumidos  
- [x] Gaps vs MVP listados con plan (sin implementar)  
- [x] Migraciones/seeds inventariados  
- [ ] **OK Juan** de lectura (junto a `02-arquitectura-sistema.md`)

---

*Documento Fase 2 — sin migraciones aplicadas · sin código producto.*
