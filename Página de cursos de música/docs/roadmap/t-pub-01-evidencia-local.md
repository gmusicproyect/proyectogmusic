# T-PUB-01 — Evidencia LOCAL controlada

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-15 |
| **Entorno** | **LOCAL** — Docker Postgres `gmusic_postgres_local` + API `http://localhost:3001` |
| **Mandato** | OK Juan — ejecutar T-PUB-01 en LOCAL controlado |
| **Veredicto** | **`DONE LOCAL`** · **cierre formal Juan** · **D-TPUB-01** (2026-07-15) |
| **Fase 6** | **NO** · no iniciada · no autorizada |
| **Prod DB** | **NO** (refused) · sin launch staging |
| **Commit / push** | **NO** |
| **Código producto** | **NO** (solo docs + datos locales) |

---

## 1. Preflight DB-02 (antes de cualquier write)

| Archivo | Clasificador `db-env-guard` | Uso piloto |
|---------|----------------------------|------------|
| `.env` | **production** (`tosbwmqijmtxchvcgrkj` · us-east-1) | **PROHIBIDO** — sidebared durante API; restaurado al cierre |
| `.env.ci` | **ci** (`wdrrqbclhrzghcewygdj`) | No usado |
| `.env.docker` | **local** `localhost:5432/gmusic_learning_db` | OK |
| `.env.t-pub-01.local` | **local** (mismo host/DB) | Runtime API + seed (gitignored) |

Guard unitario: `npm run ops:test-db-guard` → **20/20 pass**.

Health API (local): `{"status":"ok","database":"connected"}` en `GET /api/v1/health`.

`VITE_USE_PATH_MOCK`: **false** (piloto vía API directa, sin mocks FE).

---

## 2. Setup schema local (ops only)

| Paso | Resultado |
|------|-----------|
| `docker compose` / start `gmusic_postgres_local` | healthy · `localhost:5432` |
| `prisma migrate deploy` fresh | **FALLÓ** en `20260622143000_onboarding_analytics` — FK `user_id` UUID vs `User.id` TEXT |
| Workaround **solo local** | `prisma db push` (sync `schema.prisma`) + `migrate resolve --applied` ×7 |
| Migraciones nuevas / fix SQL en repo | **NO** (fuera de T-PUB-01) |
| Prod / CI DB | **intacto** |

Deuda residual (no cierra T-PUB): cadena `migrate deploy` fresh local rota por tipado UUID — trackear aparte / Juan si quiere fix migración histórica.

---

## 3. Course (D1)

| Campo | Valor |
|-------|-------|
| Slug | `ruta-guitarra-12-meses` |
| **courseId** | `d6fdc6fe-3415-4cce-9480-9a9b9b18ea92` |
| **status** | **PUBLISHED** |
| Origen | seed local (`prisma/seed.ts`) — BRIDGE Course (sin UI Admin) |

---

## 4. Bloque piloto Admin R-008 (D2 / D4)

Pipeline **real**: Admin login → `POST /admin/modules` → `PUT .../slots/1..5` → `POST .../publish` → Postgres → `GET /me/path`.

| Campo | Valor |
|-------|-------|
| Título bloque | `Tu primer acorde: La menor` |
| **moduleId** | `f816fee7-2b72-4dea-af66-a5bbbe53ba29` |
| Module status post-publish | **PUBLISHED** |
| `canPublish` pre-publish | `true` (5/5 slots) |
| Umbral | D-F5-001 (título + `completionCriteria` + 5 StageType) — media/micro SHOULD no usados |

### PathNode IDs (PUBLISHED)

| Order | StageType | pathNodeId | Título |
|------:|-----------|------------|--------|
| 1 | FUNDAMENTO_UNO | `b828f465-65cd-4d0c-9105-b5c0ec74a99d` | Qué es un acorde y por qué Am es la puerta |
| 2 | FUNDAMENTO_DOS | `8fe25635-6351-40d7-9192-5cc3f9d3aeff` | Diagrama de Am: dedos, trastes, cuerdas |
| 3 | TECNICA | `b74cfbce-f3de-47e8-9e9a-08e4c02b0604` | Presión limpia sin trasteo |
| 4 | PRACTICA | `9e423455-d729-44c9-af87-6820269ad146` | Armar el acorde por cuerdas |
| 5 | TOCAR | `9aea39eb-c50c-4a6d-95a1-61c2829aba40` | Am al pulso |

Nota: seed dejó módulos “Fundamentos” / “Acordes abiertos” PUBLISHED; el bloque bajo prueba es el **order 3** creado y publicado **vía Admin** (no sustituido por seed).

---

## 5. Alumno ACTIVE (D3 / D5)

| Campo | Valor |
|-------|-------|
| Email | `carlos@gmusic.academy` (seed local QA — **no** usuario real prod) |
| **userId** | `14147a41-d7f7-4b4b-9839-97c064b09679` |
| Role | STUDENT |
| Subscription | **ACTIVE** · planId `gmusic-semester-6-months` · `endsAt` null |
| **subscriptionId** | `81ea71b8-b93b-4c76-b079-5ecfc4a186e2` |
| Admin | `admin@gmusic.academy` · id `154f3bff-e222-49fb-b4c7-7dcecb95d250` |

### `GET /api/v1/me/access`

```json
{
  "access": { "canAccessStudentZone": true, "reason": "ACTIVE_SUBSCRIPTION" },
  "subscription": { "status": "ACTIVE", "planId": "gmusic-semester-6-months", "endsAt": null }
}
```

### `GET /api/v1/me/path` (fuente de `/mi-camino`)

- `moduleCount`: **3**
- Piloto visible: **sí** — `Tu primer acorde: La menor` (`f816fee7-…`) con **5** nodos
- Empty state *"Tu camino todavía no tiene módulos publicados…"*: **no**

### Guards

| Check | Resultado |
|-------|-----------|
| `requireAdmin` — STUDENT → `GET /admin/modules` | **HTTP 403** `FORBIDDEN` |
| Admin publish incompleto | **400** `MODULE_INCOMPLETE` (reproducido antes de completar slots) |
| Mocks FE path | off |

Screenshot UI Vite `/mi-camino`: **no capturada** en esta corrida; evidencia canónica = respuesta `/me/path` + IDs (mismo contrato que consume `GmusicPath`).

---

## 6. Criterios DONE (§7 brief)

| # | Criterio | Estado local |
|---|----------|--------------|
| D1 | Course PUBLISHED | ✅ |
| D2 | Module + 5 PathNode PUBLISHED vía validator | ✅ |
| D3 | Alumno ACTIVE ve bloque | ✅ vía `/me/path` |
| D4 | Pipeline Admin → API → Postgres → `/me/path` | ✅ (no solo seed del bloque piloto) |
| D5 | Guards OK | ✅ 403 alumno admin · MODULE_INCOMPLETE |
| D6 | Umbral D-F5-001 | ✅ |

---

## 7. OUT respetado

- Fase 6 · T-UX-LESSON · F7/F8/F9 · prod DB · commit/push · migraciones producto en repo · features nuevas · Next/Stripe: **NO**.

---

## 8. Cierre

| Ítem | Valor |
|------|-------|
| **Veredicto ejecución** | **`DONE`** (local controlado) |
| **Cierre formal Juan** | ✅ **DONE LOCAL** · **D-TPUB-01** (2026-07-15) |
| Launch / prod / staging | **NO** — fuera de alcance del cierre |
| Evidencia path | este archivo |
| Deuda ops | **R-OPS-MIGRATE-UUID** · **T-PUB-01-UI** (screenshot FE opcional) — backlog; **no** bloquean cierre |
| Siguiente | **Detenerse** · **no** abrir F6 · sin commit/push |

*Fin evidencia T-PUB-01 local · 2026-07-15 · cierre formal DONE LOCAL (D-TPUB-01).*
