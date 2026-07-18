# Persistencia Durable H1 — PD-5 Enforcement entitlements R-002 · Evidencia

Fecha: 18 Jul 2026
Rama / HEAD: `main` (P0 `1ad047d` + PD-2/PD-3 `ad124ac` + PD-4 `ef6333d`), **sin push**
Mandato Juan: *"OK, abre PD-5 Persistencia Durable H1 — Enforcement entitlements
R-002. Alcance: cablear policy backend en endpoints privados H1, mantener
contratos P0 y DEMO vía grants, tests de autorización y evidencia. Sin
UI/routing, sin Premium real, sin Comunidad, sin prod ni push."*

---

## Problema (R-002)

`/me/access` no basta como única capa de authz. Los endpoints privados de
práctica resolvían entitlements con checks **ad-hoc dispersos**
(`assertMonthPlayableForPractice` en dos servicios), sin una policy única. Riesgo:
inconsistencia y bypass silencioso (PD-1 §6.2).

## Solución (alcance PD-5)

Cablear el helper puro `entitlementsPolicyH1` (entregado en PD-2) como **fuente
única** de decisión de acceso en los endpoints privados de práctica H1,
preservando el comportamiento DEMO vía grants.

### Endpoints cableados

| Endpoint | Servicio | Requisito policy | Antes |
|----------|----------|------------------|-------|
| `POST /lesson-sessions` (start) | `lessonSessionService.createOrReuseLessonSession` | `requireZone + allowDemoGrant + monthIndex` | `assertMonthPlayableForPractice` |
| `POST /lesson-sessions/:id/complete` (H1) | `practiceLifecycleH1Service.completePracticeH1` → `assertCurrentEntitlement` | `requireZone + allowDemoGrant + monthIndex` | `assertMonthPlayableForPractice` |

- **`requireZone: true`** cierra el hueco R-002 (antes no se exigía zona).
- **`allowDemoGrant: true`** preserva DEMO: una cuenta sin ACTIVE pero con
  `grants.canStartPractice` (mes 1 del catálogo demo) sigue practicando.
- **`monthIndex`** mantiene el gate de mes: fuera de `monthsPlayable` → 403 ENTITLEMENT.

### No tocado (por diseño, contratos P0)

- **Endpoints de lectura/proyección** (`/me/path`, `/me/progress`): siguen
  devolviendo *blockers ENTITLEMENT amables* dentro del payload, no 403 duro.
- **`/me/library`**: lista sigue con `emptyState NO_LIBRARY_ACCESS` (no 403);
  el detalle ya devolvía 403 ENTITLEMENT en la capa de vista (P0-08).
- **Complete legacy con scoring** (`completeLessonSessionService`): mantiene
  gate de propiedad (403 FORBIDDEN); no se le añade gate de mes (fuera de H1).
- **abandon / progress**: operaciones sobre sesión propia; sin gate de mes.
- Sin Premium real, sin Comunidad, sin multimedia, sin UI/routing.

---

## Semántica de autorización (matriz)

| Cuenta | Zona (ACTIVE) | `canStartPractice` | Mes 1 | Mes 2 | Mes 5 |
|--------|---------------|--------------------|-------|-------|-------|
| DEMO (sin ACTIVE) | ❌ | ✅ (demo) | ✅ allow | ❌ 403 ENTITLEMENT | ❌ 403 ENTITLEMENT |
| Suscriptor ACTIVE | ✅ | ✅ | ✅ | ✅ | ❌ 403 ENTITLEMENT |
| (hipotético) sin grant ni zona | ❌ | ❌ | ❌ 403 (NO_ZONE) | — | — |

`monthIndex` inválido (0 / 13 / no entero) → **400 VALIDATION_ERROR** (no ENTITLEMENT).

---

## Verificación

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | ✅ OK |
| `npm run build` | ✅ OK (solo warnings preexistentes) |
| PD-5 autorización pura (`pd5EntitlementsEnforcementH1.test.ts`) | ✅ 7/7 |
| Policy pura PD-2 (`pd2DurablePersistenceH1.test.ts`) | ✅ 15/15 |
| Entitlements P0-07 (`entitlementsH1.test.ts`) | ✅ (verde) |
| API gate (`me-entitlements-h1.test.ts`, Docker) | ✅ 2/2 — T-ENT-03 mes 5 → 403 ENTITLEMENT |
| API lifecycle (`practiceLifecycleH1.integration.test.ts`, Docker) | ✅ 1/1 — T-SES-09 mes 5 → ENTITLEMENT, start mes 1 DEMO OK |
| Path backend (`pathViewH1.test.ts`) | ✅ 10/10 |

> Nota de entorno: `me-entitlements-h1` y demás tests que usan el dev student
> requieren `GMUSIC_DEV_USER_EMAIL` alineado al seed (`carlos@gmusic.academy`).
> Con un valor ambiente no sembrado, `getDevStudent` falla antes de la lógica
> (deuda de entorno/seed conocida, no de PD-5).

---

## Archivos

- `server/services/lessonSessionService.ts` — start usa `assertStudentLearningAccess`.
- `server/services/practiceLifecycleH1Service.ts` — `assertCurrentEntitlement` usa la policy.
- `server/tests/pd5EntitlementsEnforcementH1.test.ts` — matriz de autorización (pura).

Sin cambios de schema, migración, UI, Premium, Comunidad ni prod.

---

## Cómo reproducir (local)

```bash
# Pura (sin DB)
node --import tsx --test server/tests/pd5EntitlementsEnforcementH1.test.ts

# API (Docker local + dev student seed)
docker start gmusic_postgres_local
DATABASE_URL="...localhost..." NODE_ENV=test GMUSIC_DEV_USER_EMAIL=carlos@gmusic.academy \
  node --import tsx --test server/tests/me-entitlements-h1.test.ts \
  server/tests/practiceLifecycleH1.integration.test.ts
```

---

## Siguiente decisión (para Juan)

- Autorizar o no **commit local selectivo PD-5** (wiring + test + evidencia).
- Con PD-5, la serie **PD-0…PD-5** de Persistencia Durable H1 queda completa en
  local (eventos, proyecciones, catálogo, snapshot, entitlements enforcement).
- Push a `origin/main`: sigue **NO** hasta OK explícito.
