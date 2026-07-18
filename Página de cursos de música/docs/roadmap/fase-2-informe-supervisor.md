# Informe de cierre Fase 2 — supervisor (arquitectura y diseño)

**Fecha:** 2026-07-14  
**Workspace:** `Página de cursos de música/`  
**Autor:** Cursor (ejecutor / supervisor documental)  
**Fuentes contrastadas:** `02-modelo-datos.md` · `02-arquitectura-sistema.md` · `01-mvp-gmusic.md` (D-F1-001) · `00-inventario-actual.md` · `definition-of-done.md` · `prisma/schema.prisma` · `decisiones.md` (D-F1-001, D-ROAD-005)  
**Alcance de esta pasada:** solo docs / auditoría. **Sin** código producto · **sin** Fase 3 · **sin** commit/push.

---

## 1. Arquitectura propuesta

Stack Track A **confirmado** (coincide MVP § Stack + schema + inventario):

| Capa | Tecnología | Rol MVP |
|------|------------|---------|
| Frontend | **Vite + React** (+ TS) | SPA: landing, funnel demo, zona alumno, admin |
| Navegación | `currentPage` + `student-zone-routing.ts` | Sync parcial URL (D-GOV-02/03 + alumno); **no** React Router global |
| Backend | **Express** modular monolith (`/api/v1/*`) | Auth, me/access, path/sessions, admin, community, onboarding |
| Persistencia | **Prisma + PostgreSQL** | Identidad, contenido publicado, progreso, comunidad |
| Auth | **JWT cookie** (+ bcrypt) | Registro/login/logout liviano; email verify **WON'T** |
| Multimedia | URLs en `PathNode` (`videoUrl`, `guidePdfUrl`) + payload ejercicios | Sin CMS Track B / Cloudflare Stream en este sistema |
| Acceso | `Subscription` ACTIVE + guards UI + `/me/access` | D-017; activación humana |
| Deploy | **Vercel** (SPA + rewrites + proxy API) → **Render** (API/DB) | Documentado en `02-arquitectura-sistema.md` |

**Capas / bounded contexts (ligero):** Identity · Acquisition · Academy Content · Learning Journey · Membership · Community · Administration. Billing = **fuera** del MVP.

**Extra = opcional / futura / bridge (no arquitectura definitiva):**

| Elemento | Clasificación |
|----------|---------------|
| WhatsApp `wa.me` + grant manual ACTIVE | **BRIDGE** (fuera del monolith) |
| PostHog funnel | Analítica auxiliar |
| `localStorage` demo anónima + catálogo TS demo | Acquisition (R-003 dual source aceptado) |
| Planes marketing en TS (`planId` string) | Bridge comercial hasta pasarela |
| Track B (Next/Sanity/Railway/Stream), Stripe, Elvis ERP, Discourse | **OUT** / futura — no mezclar |

Evidencia: `docs/architecture/02-arquitectura-sistema.md` §§2–4, 7.

---

## 2. Cobertura MVP

Matriz vs contrato congelado (MUST / BRIDGE). Estados = cobertura **estructural** (schema + arquitectura documentada), no “feature implementada al 100%”.

| Capacidad MVP | Entidad / componente | Relación principal | Estado | Decisión pendiente |
|---------------|----------------------|--------------------|--------|-------------------|
| Registro / login | `User` + `auth` routes + JWT cookie | Identity | **cubierto** | — |
| Academia | `/onboarding-academia` UI | Acquisition → demo/alumno | **cubierto** | — |
| Cursos / módulos / lecciones | `Course` → `Module` → `PathNode` | Academy Content | **cubierto** | — |
| Cinco tarjetas (bloque) | 5× `PathNode` (`StageType`) por `Module` | Module 1—N PathNode | **cubierto** (modelo) | T-PUB-01 = dato publicado (ops) |
| Publicación | `PublishStatus` + Admin R-008 (`admin` routes) | ADMIN muta DRAFT→PUBLISHED | **parcial** | Piloto/datos T-PUB-01 |
| Consumo lección | `LessonSession` + `ExerciseAttempt` + runner UI | User—PathNode | **parcial** | T-UX-LESSON-01 si umbral falla |
| Progreso real | `UserProgress` `(userId, nodeId)` | Learning Journey | **cubierto** (datos) | Superficie Mi Progreso = UI |
| Mi Camino | `GmusicPath` + path API | PathNode PUBLISHED | **parcial** | Depende T-PUB-01 |
| Mi Progreso mínimo | Agregados sobre `UserProgress` / sesiones | Lectura; **sin** página hoy | **parcial** (datos) / **no cubierto** (UI) | URL + ticket T-MVP-PROGRESS |
| Comunidad básica | `CommunityEnrollment` + `CommunityPost` | User 1:1 enrollment; posts | **parcial** | Comentarios; mocks launch |
| WhatsApp bridge | Gate `/inscripcion` + ops | Membership (humano) | **cubierto** como BRIDGE | Runbook ops |
| Admin mínima | `User.role=ADMIN` + `requireAdmin` | Administration | **parcial** | Credencial P0; piloto publish |

---

## 3. Modelo de datos — entidades canónicas

Fuente de verdad: `prisma/schema.prisma`. Lenguaje protocolo mapeado en `02-modelo-datos.md` §2 (sin tablas duplicadas).

### 3.1 Existentes (Prisma)

| Entidad | Propósito | Campos esenciales | Relaciones | Estados | Borrado | Unicidad | Ownership / permisos |
|---------|-----------|-------------------|------------|---------|---------|----------|----------------------|
| **User** | Identidad login | email, name, role, accountTier, passwordHash? | → sessions, progress, subs, community… | role + tier | Cascade hijos identidad | `email` unique | STUDENT/GUARDIAN/ADMIN; ADMIN via `requireAdmin` |
| **Subscription** | Acceso comercial / Membership | userId, status, planId, endsAt? | User N | ACTIVE / PAST_DUE / CANCELED | Cascade←User | index userId | Solo ops/admin activan ACTIVE (MVP) |
| **Course** | Contenedor currículo | title, slug, status, version | → Module | PublishStatus | Restrict desde Module | `slug` unique | ADMIN publica |
| **Module** | Bloque (= unidad 5 etapas) | courseId, title, order, status | Course; → PathNode | PublishStatus | Restrict↔Course/PathNode | `(courseId, order)` | ADMIN |
| **PathNode** (= Lesson / tarjeta etapa) | Etapa jugable | moduleId, title, order, status, stageType?, media, criteria | Module; → MicroExercise, UserProgress, LessonSession | PublishStatus + StageType | Restrict←Module; progreso Restrict | `(moduleId, order)` | ADMIN escribe; alumno lee PUBLISHED |
| **MicroExercise** | Micro-práctica | nodeId, type, payload, secureAnswer, order | PathNode; → attempts | — | Cascade←PathNode | `(nodeId, order)` | `secureAnswer` solo servidor |
| **UserProgress** (= Progress) | Avance por etapa | userId, nodeId, isCompleted, unlockedAt, completedAt? | User↔PathNode | completed flag | Cascade←User; Restrict←PathNode | `(userId, nodeId)` | Alumno muta propio |
| **LessonSession** | Sesión de práctica | userId, nodeId, status, accuracy?, xp… | User↔PathNode; → attempts | STARTED/COMPLETED/ABANDONED | Cascade←User; Restrict←PathNode | indexes | Alumno propio; **R-001** sin snapshot |
| **ExerciseAttempt** | Intento evaluado | sessionId, microExerciseId, isCorrect… | Session↔MicroExercise | — | Cascade←Session; Restrict←exercise | `(sessionId, microExerciseId)` | Servidor valida |
| **XpEvent / StreakEvent** | Motor gamificación | amounts / streak | User (+ session opcional) | — | Cascade←User | unicidades por diseño | UI avanzada OUT Mi Progreso MVP |
| **CommunityEnrollment** | Contexto feed alumno | instrument, academicTierId, programLabel, currentLesson* | User 1:1 | — | Cascade←User | `userId` unique | Auth alumno |
| **CommunityPost** | Post feed | postType, level, instrument, content, external* | User N | CommunityLevel / PostType | Cascade←User | indexes level+fecha | Auth + moderación mínima ADMIN |
| **DemoProgress** | Demo por cuenta auth | userId, lessonNumber | User | — | Cascade←User | `(userId, lessonNumber)` | Complementa localStorage |
| **GuardianLink** | Capacidad latente familia | guardianId, studentId | User↔User | — | Cascade | `(guardianId, studentId)` | WON'T producto MVP |
| **OnboardingAnalytics** | Quiz/lead | temperament, scores, email?… | User? | — | SetNull user | `sessionId` unique | Lead; no núcleo lección |

### 3.2 Conceptos protocolo sin tabla propia (mapeo justificado)

| Concepto pedido | Realidad | Justificación |
|-----------------|----------|---------------|
| **Profile** | Campos en `User` | Evita tabla 1:1 vacía; OK MVP |
| **Role** (tabla) | Enum `User.role` | Tres roles bastan; sin RBAC tabla |
| **Instrument** | String / UI | D-007 Guitarra; tabla solo si multi-instrumento |
| **Level** | `StageType` + `CommunityLevel` + `academicTierId` | Dominios distintos; no unificar en una tabla Level |
| **Lesson** | `PathNode` | Nombre pedagógico ≠ nombre schema; **no** crear `Lesson` |
| **LessonCard** | UI sobre `PathNode` (×5) | Cinco tarjetas = cinco etapas del bloque |
| **Resource** | `videoUrl` / `guidePdfUrl` / payload | Suficiente MVP; CMS = Track B OUT |
| **Enrollment** (curso) | Acceso = `Subscription` ACTIVE | No enrollment de curso separado |
| **Plan** | `planId` string + TS marketing | Stripe OUT; Plan tabla post-pasarela |
| **Access** | Resolución Membership (`/me/access`) | No entidad aparte |
| **Comment** | **Gap** — no modelo | Ver §6; stub API `comments: 0` |

Detalle ampliado: `02-modelo-datos.md` §§4–7.

---

## 4. Decisiones críticas

| Tema | Decisión documentada / estado | Impacto |
|------|-------------------------------|---------|
| Inscripción vs acceso comercial | Gate `/inscripcion` = conversión; acceso zona alumno = `Subscription` ACTIVE (D-017), no “enrollment de curso” | Mantener separación Acquisition vs Membership |
| Progreso lección vs tarjeta | Progreso canónico por **`PathNode`** (`UserProgress`); demo usa lessonNumber aparte (R-003) | No mezclar demo TS con path Postgres |
| Orden | `Module.order` / `PathNode.order` / `MicroExercise.order` + `@@unique` padre | Publish y camino respetan orden |
| Publish / draft | `PublishStatus` DRAFT \| PUBLISHED \| ARCHIVED en Course/Module/PathNode | T-PUB-01 = pipeline real |
| Bloqueo | Demo teaser D-GOV-05/06; alumno sin ACTIVE → guard; nodos no publicados no en path usable | R-002 = enforcement API incompleto (documentado) |
| Roles | Enum en User; ADMIN + `requireAdmin` | GUARDIAN sin UI MVP |
| Comunidad nivel | `CommunityPost.level` + enrollment `academicTierId` | Filtro “si viable” — SHOULD de precisión |
| WhatsApp grant | BRIDGE: humano/ops pone ACTIVE | No fingir Stripe |
| Revocación | Status PAST_DUE / CANCELED (+ endsAt) | Modelo listo; runbook ops |
| Multimedia | URLs en PathNode; sin blob store propio MVP | Track B Stream OUT |
| Delete user vs progress | Cascade progreso/sesiones/community con User; Restrict borrar PathNode con historial | Integridad OK |
| Mock vs real | DoD: mocks ≠ verdad launch; path/community/dashboard deben API/DB en launch | T-MVP-COMMUNITY / quitar mocks nav |

---

## 5. Seguridad e integridad

Checklist (auditoría documental Fase 2 — no implementación):

| # | Control | Estado / evidencia |
|---|---------|-------------------|
| 1 | Passwords hasheados (bcrypt), no plaintext | Schema `passwordHash` + auth service (inventario) |
| 2 | JWT en cookie de sesión; rutas protegidas | Arquitectura §2; MVP auth MUST |
| 3 | `secureAnswer` nunca en API pública | Comentario schema + MicroExercise |
| 4 | ADMIN solo vía `requireAdmin` | `server/middleware/requireAdmin.ts` |
| 5 | Zona alumno exige Subscription ACTIVE (UI + `/me/access`) | D-017; tests `me-access` |
| 6 | Entitlements en **todos** endpoints Learning | **R-002** — gap documentado; no mitigar sin fase |
| 7 | Borrado Restrict en contenido con historial | Schema PathNode/Module/Course |
| 8 | Cascade limpieza identidad al borrar User | Schema User relations |
| 9 | Email verification | **WON'T** MVP (aceptado) |
| 10 | Credencial admin prod | **P0** launch (MVP §7.9) — ops, no rediseño schema |
| 11 | Mocks no como contrato launch | DoD + MVP §7.6c |
| 12 | R-001 session sin snapshot de contenido | Documentado; no mitigar aquí |

---

## 6. Ambigüedades

| Ambigüedad | Clasificación | Nota |
|------------|---------------|------|
| **Comment:** MVP IN “comentar” vs sin modelo/API real (stub `comments: 0`) | **backlog producto / ticket** (post-arquitectura; **NO** Fase 3 infra) | No rediseña stack; opciones: (a) `CommunityComment` + migración **o** (b) enmienda alcance copy “publicar/ver”. **No bloquea** cerrar arquitectura ni arrancar infra |
| **Mi Progreso UI** inexistente; datos sí en `UserProgress` | **backlog / Fase 7** (T-MVP-PROGRESS) — **NO** Fase 3 infra | URL exacta aún “a definir”; campos IN/OUT ya cerrados en MVP |
| **T-PUB-01** dato publicado usable | **resuelve en fase contenido/ops** | Modelo listo; bloquea **launch**, no cierre Fase 2 docs |
| **T-UX-LESSON-01** umbral consumo | **resuelve en ticket UX** | Condicional MUST si runner falla |
| **R-002** entitlements parciales API | **backlog** con decisión fase auth/ops | Documentado; no mitigar por iniciativa |
| **R-001** sin versionado sesión | **backlog** | Solo tras decisión arquitectura explícita |
| **Mocks comunidad** peers/mentorship | **resuelve pre-launch** si en nav | Arquitectura feed real ya existe |
| **Password recovery** SHOULD/BRIDGE | **backlog** | No bloquea núcleo |
| **Plan como tabla** | **backlog** post-pasarela | String `planId` OK MVP BRIDGE |

**Ninguna ambigüedad de esta lista es decisión de producto dura que impida cerrar el modelo Track A** (veredicto no BLOQUEADA). La de Comment es la más sensible al contrato MVP C, pero ya tiene fork de resolución documentado sin rebuild.

---

## 7. Cambios vs sistema actual

| Área | Existe hoy | Acción Fase 2 → fases siguientes |
|------|------------|----------------------------------|
| Stack Vite/React/Express/Prisma/JWT | Sí | **mantener** |
| Course/Module/PathNode/UserProgress/Sessions | Sí | **mantener**; poblar/publish (T-PUB) |
| Auth JWT + guards | Sí (parcial UX) | **mantener**; docs agentes “pausada” = **docs desfasados** |
| Subscription + `/me/access` | Sí | **mantener**; runbook WhatsApp grant |
| Community posts + enrollment | Sí | **mantener**; **corregir** mocks launch; **migrar** comments si se elige (a) |
| Mi Progreso página | No | **evolucionar** UI sobre datos existentes — no tabla nueva por defecto |
| Demo localStorage + TS | Sí | **mantener** separado de Academy Postgres (R-003) |
| Admin R-008 | Parcial | **mantener** + ops P0 credencial |
| Track B / Stripe / Profile/Lesson/Plan tables | No / OUT | **no inventar** en Track A |
| `02-*` docs vs `database-schema.md` histórico | Docs nuevos anclan schema | **priorizar** `schema.prisma` + `02-modelo-datos.md` |
| AGENTS `#academia` wizard | Obsoleto vs `/onboarding-academia` | **docs desfasados** (lista MVP) — sync posterior |

Principio: **evolución del monolith Track A**, no rebuild total.

---

## 8. Criterios cierre Fase 2

Fuente: `etapa-actual.md` criterios Fase 2 + criterios de docs `02-*` + DoD/MVP ancla.

| Criterio | ¿Sí? | Evidencia |
|----------|------|-----------|
| Existen `02-modelo-datos.md` y `02-arquitectura-sistema.md` anclados a Track A real | **Sí** | Paths en `docs/architecture/` |
| Entidades reales nombradas y mapeadas al lenguaje MVP/protocolo (sin tablas inventadas) | **Sí** | §2 modelo + contraste `schema.prisma` (esta pasada amplió aliases LessonCard/Resource/Enrollment/Level/Access/Comment) |
| Relaciones, estados, borrado, permisos resumidos | **Sí** | Modelo §§4–6 |
| Gaps vs MVP listados con plan (sin implementar) | **Sí** | Modelo §7; arquitectura §8 |
| Arquitectura soporta núcleo MVP sin mocks como fuente de verdad de launch (salvedades explícitas) | **Sí** | Arquitectura §8 tabla |
| Stack Track A intacto; Track B / Stripe no mezclados como definitivos | **Sí** | Arquitectura §§2, 7; WhatsApp = BRIDGE |
| Cero código producto / cero migraciones aplicadas en Fase 2 | **Sí** | Solo docs en esta pasada |
| Fase 3 **no** abierta | **Sí** | Este informe + `etapa-actual.md` |
| Ambigüedades no bloqueantes clasificadas | **Sí** | §6 de este informe |
| Coherencia doc ↔ schema (sin contradicción material) | **Sí** | Auditoría 2026-07-14 |
| **OK Juan** de lectura (cierra Fase 2 TERMINADA) | **Sí** | **D-F2-001** · 2026-07-14 |

---

## 9. Veredicto

### **APROBADA / CERRADA — D-F2-001**

**Por qué LISTA (histórico — no REQUIERE CORRECCIONES / no BLOQUEADA):**

- Docs Fase 2 + `schema.prisma` son **coherentes** con el MVP MUST (D-F1-001 / D-ROAD-005).
- Conceptos protocolo (Lesson, LessonCard, Profile, Plan, Enrollment, Access…) están **mapeados** a nombres reales o gaps explícitos — sin entidades duplicadas injustificadas.
- WhatsApp / planes TS / localStorage demo quedan como **bridge/auxiliar**, no como arquitectura definitiva.
- Gaps (Comment, Mi Progreso UI, T-PUB, mocks, R-001/R-002) están documentados y clasificados; **ninguno exige rediseñar** el stack antes de Fase 3 (infra).
- La decisión Comment (a) migración vs (b) acotar MVP es **producto posterior**, no condicionante de cerrar el modelo Track A.

### Firma / aprobación

| Campo | Valor |
|-------|--------|
| **Decisión** | **D-F2-001** — Fase 2 aprobada/cerrada |
| **Fecha** | 2026-07-14 |
| **Aprobador** | Juan (lectura OK de `02-modelo-datos.md` + `02-arquitectura-sistema.md` + este informe) |
| **Estado Fase 2** | **TERMINADA** |
| **Fase 3** | Puede **briefarse**; **ejecución** requiere OK Juan separado |

---

### Corrección menor en esta pasada (pre-firma)

- Ampliado mapa protocolo→schema en `02-modelo-datos.md` §2 (aliases LessonCard, Resource, Enrollment, Level, Access, Comment, Profile/Role tabla, Lesson≡PathNode) para alinear checklist del supervisor con el schema real.

### Confirmaciones de control (al cierre D-F2-001)

| Control | |
|---------|--|
| Fase 2 TERMINADA | **Sí** (D-F2-001) |
| Ejecución Fase 3 | **No** (solo brief autorizado) |
| Código producto | **No** |
| Commit / push | **No** (pasada de gobierno/brief) |

---

*Informe supervisor Fase 2 · 2026-07-14 · veredicto original LISTA → **APROBADA Juan D-F2-001**.*
