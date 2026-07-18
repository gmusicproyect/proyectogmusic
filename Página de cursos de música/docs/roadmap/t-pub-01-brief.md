# T-PUB-01 — Brief ejecutable · Piloto publicación admin → alumno

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| **ID** | **T-PUB-01** |
| **Fecha brief** | 2026-07-15 |
| **Autor** | Cursor (ejecutor) · supervisión Juan |
| **Estado de este brief** | **LISTO** · **ejecución LOCAL DONE** · **cierre formal Juan: DONE LOCAL** · **D-TPUB-01** |
| **Evidencia local** | `docs/roadmap/t-pub-01-evidencia-local.md` (2026-07-15) |
| **Prioridad** | **MUST** pre-launch |
| **Prerreqs docs** | **D-F1-001** · **D-F2-001** · **D-F3-001** · **D-F4-001** · **D-F5-001** · DoD |
| **Canónico producto** | `docs/features/05-academia-cursos.md` §2 / §7 · `docs/product/01-mvp-gmusic.md` §7.5 |
| **Runbook histórico** | `docs/operations/piloto-bloque-1-admin.md` (contenido sugerido; no sustituye este brief) |
| **Umbral usable** | **D-F5-001** = `validateModuleForPublish`: título + `completionCriteria` + 5 `StageType`; media/micro **SHOULD** |
| **Fase 6** | **NO** · no autorizada |

---

## 1. Propósito

Cerrar el gap **dato/pipeline** (no greenfield LMS): en el **entorno acordado por Juan**, un ADMIN publica **N=1** bloque usable vía Admin R-008 y un alumno **STUDENT** con Subscription **ACTIVE** lo ve en `/mi-camino`.

**Histórico:** este archivo nació como briefing (sin autorización de ejecución). **2026-07-15:** Juan autorizó LOCAL → piloto ejecutado → ver evidencia. Sigue **sin** autorizar prod / F6 / código producto / commit.

---

## 2. Gate de ejecución (obligatorio)

```text
Ejecución del piloto T-PUB-01 = NO
hasta OK explícito de Juan que nombre:
  (a) entorno autorizado (local | staging controlado | prod),
  (b) si aplica: OK ops para prod / rotación admin,
  (c) cuenta alumno de prueba autorizada.
```

| Pregunta | Estado |
|----------|--------|
| ¿Brief T-PUB-01 listo? | **Sí** (este archivo) |
| ¿Ejecución piloto LOCAL? | **DONE** — mandato Juan 2026-07-15 · ver `t-pub-01-evidencia-local.md` |
| ¿Cierre formal ticket? | ✅ **DONE LOCAL** · **D-TPUB-01** (2026-07-15) — **no** = launch prod/staging |
| ¿Publish prod / seed prod / migraciones? | **NO** |
| ¿Código / Fase 6 / pagos / Comunidad? | **NO** |
| ¿Commit / push? | **NO** (salvo Juan lo pida aparte) |

---

## 3. Entorno recomendado

| Preferencia | Entorno | Cuándo | Notas ops |
|-------------|---------|--------|-----------|
| **1 — Recomendado** | **Local** (Docker Postgres + `api:dev` + `npm run dev`) | Smoke pipeline sin riesgo prod | DB via `.env.docker` / compose · ver `03-entorno-desarrollo.md` |
| **2 — Alternativa** | **Staging controlado** (DB ≠ prod) si Juan lo define | Paridad API remota sin prod | Hoy **no** hay staging DB dedicada documentada como servicio propio (`03` §11: previews suelen pegar a misma API Render) |
| **3 — Solo con OK ops** | **Producción** (Vercel + Render `gmusic-api` + Supabase prod) | Launch real | Requiere OK ops explícito + checklist A8/A9 + INC-admin-cred cerrado o riesgo aceptado |

### Reglas de entorno

| Regla | Detalle |
|-------|---------|
| **Prod** | Solo si Juan dice “OK ops prod” (o equivalente inequívoco). |
| **DB-02** | `.env` prod **prohibido** para tests; `api:test` solo `.env.ci` / `.env.docker` — ver `docs/operations/DB-02-blindaje-entorno-pruebas.md`. |
| **Seed local ≠ DONE** | `npm run db:seed` puede dejar Course PUBLISHED en local — **no** cuenta como cierre T-PUB-01 ni evidencia de launch. |
| **Mocks FE** | `VITE_USE_PATH_MOCK` / `mock-path` **off** en el entorno del piloto. DoD: no mock como fuente de verdad. |

---

## 4. Datos mínimos (contrato N=1)

### 4.1 Course (BRIDGE — sin UI Admin)

| Campo | Valor |
|-------|-------|
| Slug | `ruta-guitarra-12-meses` (`server/config.ts` → `defaultCourseSlug`) |
| Status | **`PUBLISHED`** (si falta → alumno: `COURSE_NOT_FOUND` / path vacío) |
| Cómo asegurarlo | Seed local (`prisma/seed.ts`) **o** ops SQL/Table Editor en entorno autorizado — **no** hay create/publish Course en `/admin` |

### 4.2 Module + PathNodes (vía Admin R-008)

| Pieza | Requisito |
|-------|-----------|
| Modules | **≥1** Module creado en Admin (`POST /api/v1/admin/modules`) |
| PathNodes | Exactamente **5** slots (auto al crear) |
| `StageType` | Los 5: `FUNDAMENTO_UNO` · `FUNDAMENTO_DOS` · `TECNICA` · `PRACTICA` · `TOCAR` (`STAGE_TYPES_BY_ORDER`) |
| Por slot | **título** no vacío + **`completionCriteria`** no vacío |
| Validator | `validateModuleForPublish` en `server/services/curriculum.ts` → `{ ok: true }` antes de publish |
| Post-publish | `Module.status = PUBLISHED` **y** todos los `PathNode.status = PUBLISHED` (`publishAdminModule`) |
| Media (`videoUrl` / PDF / guía) | **SHOULD** — no bloquea validator |
| `MicroExercise` | **SHOULD** / frontera **T-UX-LESSON-01** — no bloquea T-PUB-01 |

### 4.3 Contenido sugerido (reutilizable)

Fuente: `docs/operations/piloto-bloque-1-admin.md` · Bloque 1 pedagógico.

| # | Etapa | Título | Criterio de completado |
|---|--------|--------|------------------------|
| 1 | Fundamento uno | Qué es un acorde y por qué Am es la puerta | El alumno puede explicar con sus palabras qué es un acorde |
| 2 | Fundamento dos | Diagrama de Am: dedos, trastes, cuerdas | Identifica dedos y trastes del diagrama Am |
| 3 | Técnica | Presión limpia sin trasteo | Cada cuerda suena clara al pulsar el acorde |
| 4 | Práctica | Armar el acorde por cuerdas | Arma Am 3 veces seguidas sin ayuda visual |
| 5 | Tocar | Am al pulso | Am suena limpio 4 tiempos al pulso |

Título de bloque sugerido: `Tu primer acorde: La menor` (o el que Juan autorice). Video opcional.

---

## 5. Alumno de prueba

| Campo | Valor |
|-------|-------|
| Rol | `User.role = STUDENT` |
| Acceso | Subscription **`ACTIVE`** con `endsAt` null o futuro (**D-017**) |
| Runbook | `docs/operations/manual-student-activation.md` |
| Local/seed | Alumno seed (p. ej. `carlos@…` si env de password) **solo** en DB local/staging — no reutilizar like prod real sin OK |
| Prod / alumnos reales | **Prohibido** activar o usar cuenta de alumno real **sin OK Juan** |
| QA prod conocido (histórico) | Solo si Juan reautoriza en el mandato de ejecución |

**Guards esperados en el happy path:**

| Guard | Expectativa |
|-------|-------------|
| `requireAdmin` | Admin publica; STUDENT no puede `/admin` API |
| `StudentZoneGuard` / acceso ACTIVE | Alumno sin sub → zona bloqueada; con ACTIVE → `/mi-camino` |
| Filtros PUBLISHED | Solo Course/Module/PathNode **PUBLISHED** en `loadPublishedCoursePath` (`coursePath.ts`) |

---

## 6. Pasos del piloto (1–8)

Ejecutar **solo** tras gate §2.

### Paso 1 — Preflight entorno

1. Confirmar entorno autorizado (local / staging / prod).  
2. Confirmar **no** usar `.env` prod en tests (DB-02).  
3. API + frontend apuntando al mismo backend del entorno.  
4. `VITE_USE_PATH_MOCK` desactivado (o ausente).  
5. Anotar URLs (FE / API) en la evidencia.

### Paso 2 — Precondición Course PUBLISHED

1. Verificar que existe Course `ruta-guitarra-12-meses` con `status = PUBLISHED`.  
2. Si falta en local: seed documentado (`npm run db:seed`) **solo** para crear Course (el piloto aún exige publish vía Admin del bloque bajo prueba).  
3. Si falta en prod: **STOP** — ops + OK Juan (BRIDGE); no inventar UI Course.

### Paso 3 — Login ADMIN

1. Ir a `/admin`.  
2. Login con usuario `role = ADMIN` del entorno.  
3. **Prod:** credencial rotada (INC-admin-cred / checklist A9); no usar password quemada.  
4. Confirmar lista de módulos del curso default (`GET /api/v1/admin/modules`).

### Paso 4 — Crear bloque DRAFT

1. En Admin UI: **Crear bloque** (título del §4.3 o acordado).  
2. API: `POST /api/v1/admin/modules` → Module DRAFT + 5 slots con `stageType`.  
3. Anotar **`moduleId`**.

### Paso 5 — Completar 5 slots (umbral usable)

1. Para orders 1–5: editar título + `completionCriteria` (`PUT .../slots/:slotOrder`).  
2. Media/micro **opcionales** (SHOULD).  
3. En detalle Admin: `canPublish === true` / sin `publishBlockReason`.  
4. Equivale a `validateModuleForPublish(nodes).ok === true`.

### Paso 6 — Publicar bloque

1. Acción **Publicar** en UI → `POST /api/v1/admin/modules/:moduleId/publish`.  
2. Esperado: Module + 5 PathNodes **PUBLISHED**.  
3. Error 400 `MODULE_INCOMPLETE` → volver al paso 5.  
4. Anotar IDs de los **5 pathNode**.

### Paso 7 — Alumno ACTIVE ve el bloque

1. Logout admin (o sesión aparte).  
2. Login alumno STUDENT con Subscription ACTIVE.  
3. Abrir `/mi-camino` (`GmusicPath` + `GET /api/v1/me/path`).  
4. **Éxito:** bloque visible (no empty state *“Tu camino todavía no tiene módulos publicados…”*).  
5. **Fallo típico:** Course DRAFT · Module/nodes DRAFT · sub no ACTIVE · mock path · API wrong env.

### Paso 8 — Evidencia y cierre ticket

1. Capturar screenshots: Admin published + `/mi-camino` con bloque.  
2. Registrar en cierre: `courseId` / `moduleId` / 5 `pathNodeId` / email alumno prueba (sin passwords).  
3. Smoke opcional (SHOULD, no MUST T-PUB): abrir lección / `lesson-sessions` — fallas UX → ticket **T-UX-LESSON-01**, no reabrir umbral usable.  
4. Declarar **T-PUB-01 DONE** solo si §7 se cumple en el entorno acordado.

---

## 7. Criterios DONE T-PUB-01

Todos deben cumplirse en el **entorno del mandato Juan**:

| # | Criterio | Evidencia |
|---|----------|-----------|
| D1 | Course default `ruta-guitarra-12-meses` **PUBLISHED** | ID + status (query/ops o Admin course header) |
| D2 | ≥1 Module con exactamente **5** PathNode **PUBLISHED** que pasan `validateModuleForPublish` | `moduleId` + 5 node IDs |
| D3 | Alumno STUDENT + Subscription **ACTIVE** ve el bloque en `/mi-camino` (no empty state) | Screenshot + email QA |
| D4 | Pipeline real Admin → API → Postgres → `GET /me/path` | Sin mocks FE; sin “solo seed local” como sustituto de publish Admin del bloque bajo prueba |
| D5 | Guards OK | Admin: publish con `requireAdmin`; alumno sin ACTIVE no accede zona; DRAFT no visible |
| D6 | Umbral = D-F5-001 | Título + criterio + 5 StageType; media/micro no requeridos salvo Juan eleve en mandato |

### No cuentan como DONE

| Sustituto inválido | Por qué |
|--------------------|---------|
| Seed local completo sin pasos Admin del bloque piloto | No valida pipeline R-008 |
| Tests unitarios / fixtures `curriculum.test.ts` solos | Sin dato en entorno acordado |
| Path mock / `mock-path` verde | DoD: no mock de launch |
| Demo `/mi-camino-demo` | Catálogo TS ≠ suscriptor |
| Solo Admin publish sin login alumno ACTIVE | No cierra visibilidad |

---

## 8. OUT de alcance (prohibido en este ticket)

| OUT | Motivo |
|-----|--------|
| **T-UX-LESSON-01** (LessonRunner video-first, consumo completo) | Ticket adyacente |
| **Fase 6** Mi Camino UX (mapa, VFX, serpiente) | Requiere OK Juan nuevo |
| **T-MVP-PROGRESS** (F7) · **T-MVP-COMMUNITY** (F8) | Fuera |
| **Pagos / pasarelas** (F9) | Fuera |
| **Prod** sin OK ops | Riesgo datos / INC / R-OPS |
| **Migraciones schema** / cambios Prisma producto | Fuera |
| **Código** feature / refactor “de paso” | Fuera salvo bug P0 bloqueante con OK |
| **Commit / push** autónomo | Regla Director |
| Multi-instrumento · currículo 6–75 · Track B / CourseLit | WON'T / post-MVP |
| Crear/publicar Course desde Admin UI | BRIDGE — no inventar en T-PUB-01 |
| Alumnos reales sin OK Juan | Ops |

---

## 9. Riesgos y bloqueos ops

| ID | Riesgo | Impacto en T-PUB-01 | Tratamiento |
|----|--------|---------------------|-------------|
| **INC-admin-cred** | Password admin prod histórica / no rotada | **Bloquea prod** hasta rotación + login OK (checklist A9 · `incident-2026-07-02-admin-credential.md`) | Local/staging puede avanzar; **prod** exige cierre o aceptación Juan |
| **R-OPS-01** | Baseline Prisma prod (P3005) | `migrate deploy` ciego peligroso; no requerido para solo datos Admin si schema ya aplica | No migrar; no “arreglar baseline” dentro de T-PUB-01 |
| **DB-02** | Contaminar / usar prod en tests | Pérdida/corrupción | Fail-closed: tests solo CI/docker; piloto prod solo con OK + runbook |
| Staging ausente | Preview ≠ DB aislada | Falsa sensación de aislamiento | Preferir **local**; prod solo con mandato |
| Course DRAFT en launch | Path 404 / vacío | Bloquea D1 | BRIDGE ops antes de pasos 4–7 |
| Seed ≠ publish | Evidencia falsa | Rechazar cierre | Exigir Admin publish del bloque N=1 |

### ¿Bloquea el brief?

**No.** El brief queda listo.  
**¿Puede bloquear la ejecución en prod?** **Sí** — INC-admin-cred / falta OK ops / Course PUBLISHED ausente / sin alumno QA autorizado.

---

## 10. Superficies técnicas (referencia)

| Capa | Path / endpoint |
|------|-----------------|
| Admin UI | `/admin` · `AdminPage.tsx` |
| Admin API cliente | `src/app/services/gmusic-api/admin.ts` |
| Admin routes | `server/routes/admin.ts` + `requireAdmin` |
| Validator / publish | `server/services/curriculum.ts` |
| Alumno path UI | `/mi-camino` · `GmusicPath.tsx` |
| Alumno API | `GET /api/v1/me/path` · `me.ts` → `coursePath.ts` |
| FE path | `src/app/services/gmusic-api/path.ts` |
| Schema / seed | `prisma/schema.prisma` · `prisma/seed.ts` |
| Seguridad pre-lanzamiento | `docs/operations/checklist-seguridad-pre-lanzamiento.md` (A8/A9) |

---

## 11. Relación con Fase 6 y tickets vecinos

| Ticket / fase | Relación |
|---------------|----------|
| **T-PUB-01** | Visibilidad catálogo PUBLISHED N=1 |
| **T-UX-LESSON-01** | Consumo lección usable (completa + persiste) — **después o paralelo con mandato**, no confiar dentro de DONE T-PUB |
| **Fase 6** | UX Mi Camino completa — **OUT**; consume path ya publicado |
| F7 / F8 / F9 | OUT |

Frase canónica (`05`): *Fase 5 asegura materia PUBLISHED visible; no rediseña el mapa. Mi Camino UX completo = Fase 6.*

---

## 12. Checklist de autorización Juan (copiar al mandar ejecutar)

```text
OK Juan — ejecutar T-PUB-01
Entorno: [ local | staging:___ | prod ]
OK ops prod (si prod): [ sí / no aplica ]
Alumno prueba autorizado: [ email ]
Umbral: validator D-F5-001 (media/micro SHOULD)  — o elevar: [ ]
INC-admin-cred: [ cerrado | riesgo aceptado | N/A local ]
F6 / código / migraciones / commit: NO
Fecha:
```

---

## 13. Veredicto de este brief

| Veredicto | Valor |
|-----------|-------|
| **Estado brief** | **listo** |
| **Ejecución LOCAL** | **`DONE`** (2026-07-15) · evidencia `t-pub-01-evidencia-local.md` |
| **Cierre formal** | ✅ **DONE LOCAL** · **D-TPUB-01** (2026-07-15) · **no** prod/launch |
| F6 | **NO INICIADA** / no autorizada |
| Prod / commit / push / código producto | **NO** |

Justificación ejecución local: Course PUBLISHED + Module N=1 con 5 PathNode PUBLISHED vía Admin R-008 + alumno STUDENT ACTIVE ve bloque en `GET /me/path`. Seed ≠ sustituto del publish Admin del bloque piloto. Prod no tocado.

---

*Fin `t-pub-01-brief.md` · 2026-07-15 · brief listo · ejecución LOCAL DONE · cierre formal Juan **DONE LOCAL** (**D-TPUB-01**) · F6 NO · sin prod · sin commit.*

