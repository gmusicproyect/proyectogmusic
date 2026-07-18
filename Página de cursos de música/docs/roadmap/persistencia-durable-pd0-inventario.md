# PD-0 — Inventario técnico Persistencia Durable H1

**Fecha:** 2026-07-17  
**Mandato:** Persistencia Durable H1 — solo PD-0 + PD-1 (autorizado Juan)  
**Estado:** inventario cerrado · **sin schema · sin migraciones · sin código productivo**  
**HEAD referencia:** `1ad047d` (P0 H1 local)  
**Brief:** `docs/roadmap/persistencia-durable-brief-supervisor.md`

---

## 1. Propósito

Mapear (a) tablas Prisma existentes, (b) endpoints H1, (c) stores en memoria y (d) huecos vs. el mandato durable, antes de cualquier diseño de migraciones (PD-1 / PD-2).

---

## 2. Tablas Prisma existentes (relevantes)

| Modelo | Rol actual | Relación con mandato PD |
|--------|------------|-------------------------|
| `User` | Cuenta; `timezone`; H1 `profileId = userId` | Clave de perfil implícito; **no** tabla Profile |
| `Subscription` | Membership Track A (`status`, `planId`, `endsAt`) | Fuente de grants vía `resolveEntitlementsH1` |
| `Course` / `Module` / `PathNode` / `MicroExercise` | Academia Track A (camino legacy) | Contenido evaluable; **R-001** afecta sesiones sobre nodos |
| `LessonSession` | Sesión de práctica durable (STARTED/COMPLETED/…) | Ya durable; **sin** snapshot de contenido (R-001) |
| `ExerciseAttempt` | Intentos por microejercicio en sesión | Durable; ligado a `MicroExercise` actual |
| `UserProgress` | Completitud por `userId` + `nodeId` | Progreso **nodos** Track A, no proyección FTC H1 |
| `XpEvent` / `StreakEvent` | XP y racha (timezone alumno) | Parcialmente solapan métricas H1 (minutos/racha); fuentes distintas |
| `DemoProgress` | Demo funnel por lección | Fuera de Camino H1 |
| `OnboardingAnalytics` | Quiz temperamento (analytics) | **No** es onboarding pedagógico H1 P0-02 |
| `CommunityEnrollment` / `CommunityPost` | Comunidad | **Fuera de alcance** PD |

**No existen hoy:** `PracticeEvent`, proyección FTC durable, tablas de catálogo Biblioteca, snapshot de sesión, tabla Profile.

---

## 3. Stores / fixtures en memoria (puentes H1)

| Store / módulo | Persistencia | Contenido | Consumidores |
|----------------|--------------|-----------|--------------|
| `practiceEventsH1.ts` | Memoria proceso (`memory_bridge_h1`) | Eventos append-only + proyección cards/units/slots + metadata sesión FTC | PathView, ProgressView, lifecycle H1 |
| `profileProjectionH1Store.ts` | Memoria proceso | Onboarding status/result + overrides meta | `LearnerContextH1`, onboarding routes |
| `libraryH1.ts` fixture | Fixture código (`memory_fixture_h1`) | Metadatos `RecursoBibliotecaH1` (mediaRef null) | `GET /me/library` |
| `rutaFtcDomainH1.ts` fixture | Fixture código | Ruta 12m + FTC (sin seed DB) | Path/Progress/Library vínculos |
| `entitlementsH1.ts` | Derivado de DB `Subscription` + catálogo en código | Grants; premium OFF; community OFF | `/me/access`, start practice, vistas H1 |

---

## 4. Endpoints H1 / Learning (inventario)

### 4.1 Zona `/api/v1/me` (`realStudentAuth`)

| Método | Ruta | Fuente de verdad hoy | Entitlement |
|--------|------|----------------------|-------------|
| GET | `/me` | User + proyección onboarding memoria | Solo auth STUDENT |
| GET | `/me/profiles`, `/:id`, activate | H1 implícito | Solo auth |
| GET/PUT | `/me/onboarding` | Memoria proyección | Solo auth |
| POST | `/me/onboarding/complete` | Memoria proyección | Solo auth |
| PATCH | `/me/profile` | Memoria proyección | Solo auth |
| GET | `/me/access` | `Subscription` + `entitlementsH1` | Expone grants |
| GET | `/me/dashboard` | DB Track A (progress/streak/XP) | Solo auth (**R-002**) |
| GET | `/me/path` | Legacy DB path + `pathViewH1` (eventos memoria + entitlements) | Auth; blockers ENTITLEMENT en vista; **no** middleware zone global |
| GET | `/me/progress` | Eventos memoria → `progressViewH1` | Auth + grants leídos; **no** bloquea lectura por zone |
| GET | `/me/library`, `/:id` | Fixture + `libraryTier` grants | Auth; tier en proyección; grant `none` vacía |

### 4.2 Lesson sessions (`realStudentAuth`)

| Método | Ruta | Durable DB | H1 / Entitlement |
|--------|------|------------|------------------|
| POST | `/lesson-sessions` | Crea `LessonSession` | Gate `assertMonthPlayableForPractice` si metadata FTC H1 |
| POST | `/:id/progress` | (flujo H1) | Lifecycle H1 + eventos memoria |
| POST | `/:id/complete` | `completeLessonSession` Track A **o** complete binario H1 | H1: eventos memoria; Track A: XP/streak/progress DB |
| (abandon) | vía lifecycle H1 | — | Eventos memoria |

### 4.3 Auth middleware observado

- `realStudentAuth`: identidad STUDENT + sesión cookie/JWT.
- **No** exige `Subscription ACTIVE` en middleware de `me` ni `lessonSessions` → brecha **R-002** documentada.
- Mitigación parcial P0-07: gate de **mes jugable** en start practice H1; `/me/access` informa UI.

---

## 5. Contratos H1 a preservar (sin ruptura)

| Contrato | Serialización clave | Dependencias |
|----------|---------------------|--------------|
| `LearnerContextH1` | `profileId = userId` | Onboarding proyección |
| `pathViewH1` | months, activeUnit, cards, nextPractice, blockers | Eventos + entitlements + ruta fixture |
| `progressViewH1` | métricas MVP + `meta.eventSource` | Eventos + PathView nextPractice |
| `libraryViewH1` | items + viewState + `meta.catalogSource` | Fixture + grants |
| `AccessViewH1` | grants, premiumLibrary false, community false | Subscription |

---

## 6. Idempotencia y claves naturales (memoria hoy)

De `practiceEventsH1`:

| Clave | Uso |
|-------|-----|
| `eventId` | Idempotencia explícita |
| `profileId:eventType:causationCommandId` | Retry de comando |
| `profileId:card:tarjetaId` | `ftc_card_completed` único |
| `profileId:unit:unidadId` | `unit_completed` único |
| `profileId:session:sessionId:eventType` | started/completed/abandoned por sesión |

Estas claves deben sobrevivir en el diseño durable (PD-1).

---

## 7. Huecos vs. objetivo durable

| Necesidad mandato | Estado PD-0 |
|-------------------|-------------|
| Eventos H1 auditable entre reinicios | ❌ Solo memoria |
| Proyección FTC durable / rebuild | ❌ Solo memoria / on-read |
| Onboarding pedagógico durable | ❌ Solo memoria (analytics temperamento es otra cosa) |
| Catálogo Biblioteca en DB | ❌ Solo fixture código |
| Snapshot contenido en `LessonSession` | ❌ Ausente (R-001) |
| Entitlements en todos endpoints privados | ⚠️ Parcial (start H1 sí; me/path/progress/library/dashboard no middleware) |
| Feature flag transición memoria→DB | ❌ No existe |
| Migraciones locales planificadas | ❌ Pendiente PD-1/PD-2 |

---

## 8. Reuso vs. tablas nuevas (señal para PD-1)

| Área | Recomienda inventario |
|------|------------------------|
| Sesiones / intentos / XP / streak nodos | **Reusar** `LessonSession`, `ExerciseAttempt`, `XpEvent`, `StreakEvent`, `UserProgress` |
| Eventos FTC H1 | **Nueva** tabla append-only (no forzar en `XpEvent`/`UserProgress`) |
| Proyección Camino/Progreso H1 | **Nueva** proyección (o tablas de estado card/unit) + rebuild desde eventos |
| Onboarding H1 | **Nueva** fila/proyección por user (sin Profile) o columnas/JSON en User — decidir en PD-1 |
| Biblioteca | **Nuevas** tablas catálogo (no reusar PathNode como recurso) |
| Snapshot R-001 | **Extender** `LessonSession` (JSON/version ref) — diseño en PD-1 |
| Entitlements R-002 | **Código** policy compartida; sin schema Plan obligatorio en PD |

---

## 9. Entorno y ops

| Item | Nota |
|------|------|
| Local / Docker | Entorno autorizado para PD futuro |
| Prod migraciones | Bloqueadas por **R-OPS-01** hasta plan ops |
| Árbol dirty ajeno a P0 | Staging selectivo obligatorio si hay commit futuro |
| Push `1ad047d` | **No** parte de este mandato |

---

## 10. Criterio de salida PD-0

- [x] Tablas existentes mapeadas  
- [x] Endpoints H1 + lesson-sessions inventariados  
- [x] Stores memoria / fixtures listados  
- [x] R-001 / R-002 ubicados en código/docs  
- [x] Huecos vs. mandato listados  
- [x] Sin cambios de código productivo ni schema  

**Siguiente:** PD-1 diseño (este mismo ciclo de mandato).

---

*PD-0 inventario · Persistencia Durable H1 · 2026-07-17*
