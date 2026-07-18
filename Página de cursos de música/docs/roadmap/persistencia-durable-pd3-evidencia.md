# PD-3 — Evidencia Persistencia Durable H1 (servicios leen/escriben)

**Fecha:** 2026-07-17  
**Mandato:** OK Juan — validación post-PD-2 cerrada; abrir PD-3  
**Alcance:** Servicios H1 leen/escriben durable en **local** (`GMUSIC_H1_DURABLE=1`)  
**Prohibido (respetado):** UI · Premium · Comunidad · Profile · prod · push · seed Biblioteca (PD-4)

---

## 1. Qué se hizo

| Pieza | Entrega |
|-------|---------|
| Flag | `GMUSIC_H1_DURABLE` (`h1DurableFlag.ts` + `config.h1Durable`) · documentado en `.env.docker` / `.env.example` |
| Bridge eventos | `practiceEventsBridge.ts` — append/list/projection/sequence/session metadata → DB o memoria |
| Bridge onboarding | `learnerProjectionBridge.ts` — get/upsert `LearnerProjectionH1` |
| Snapshot R-001 | `lessonContentSnapshot.ts` · write en `createOrReuseLessonSession` · complete Track A usa snapshot si existe |
| Cableado | `practiceLifecycleH1Service`, `lessonSessionService`, `onboardingH1` (async), `resolveLearnerContext` (async), `me.ts` rutas |
| Vistas | `buildPathViewH1Async` / `buildProgressViewH1Async` · `meta.eventSource` = `db` \| `memory_bridge_h1` |
| Biblioteca | **sin seed** — sigue `memory_fixture_h1` (PD-4) |
| Policy entitlements en rutas | **no** cableada aún (PD-5) |

---

## 2. Comportamiento del flag

| `GMUSIC_H1_DURABLE` | Lectura/escritura H1 |
|---------------------|----------------------|
| OFF / ausente (default tests) | Store memoria P0 (contratos intactos) |
| `1` / `true` / `on` | `PracticeEvent` + `FtcProgressProjection` + `LearnerProjectionH1` |

Prod: **no** activar sin mandato (R-OPS-01).

---

## 3. Verificación

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | ✅ OK |
| `npm run build` | ✅ OK |
| PD-2 lógica pura | ✅ 15/15 |
| Unit memoria (flag OFF): learnerContext, practiceEvents, path, progress, onboarding, library | ✅ 51+13 verdes (muestras corridas) |
| PD-3 integración Docker (`GMUSIC_H1_DURABLE=1`) | ✅ **3/3** (`pd3DurableBridge.integration.test.ts`) |
| UI / Premium / Comunidad / Profile / prod / push | ❌ no tocados |

Comando PD-3 local:

```bash
export DATABASE_URL='postgresql://gmusic_admin:***@localhost:5432/gmusic_learning_db?schema=public'
export GMUSIC_H1_DURABLE=1
NODE_ENV=test node --import tsx --test server/tests/pd3DurableBridge.integration.test.ts
```

---

## 4. Invariantes

- Sin tabla Profile · `profileId = userId`
- Contratos P0 de shape: sin cambios de items; solo `meta.eventSource` puede ser `db`
- Append-only PracticeEvent + rebuild proyección tras insert
- Snapshot: `secureAnswer` solo en DB; API pública de sesión sigue sin exponerlo
- Biblioteca fixture hasta PD-4

---

## 5. Frontera

| Fase | Estado |
|------|--------|
| **PD-4** seed Biblioteca DB | ❌ no autorizado |
| **PD-5** enforcement entitlements en rutas + hardening | ❌ no |
| Commit / push | ❌ no |

### Frase sugerida para PD-4

```text
OK, PD-3 cerrado. Abro PD-4 Persistencia Durable H1.
Seed Biblioteca controlado desde fixture H1 en local/Docker.
Sin UI, Premium, Comunidad, Profile, prod ni push.
```

---

*PD-3 evidencia · 2026-07-17 · local durable ON · sin commit/push*
