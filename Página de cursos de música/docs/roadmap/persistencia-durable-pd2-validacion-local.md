# Validación local post-PD-2

**Fecha:** 2026-07-17  
**Mandato:** OK Juan — levantar Docker Postgres, aplicar migración PD-2 en local, verificar Prisma Client/schema, smoke mínimo, documentar.  
**Prohibido (respetado):** cablear servicios · UI · Premium · Comunidad · Profile · prod · commit · push  
**PD-3:** **BLOQUEADO** hasta cierre de esta validación (y autorización explícita posterior).

---

## 1. Resultado

| Check | Estado |
|-------|--------|
| Docker Postgres `gmusic_postgres_local` | ✅ Up · `pg_isready` OK · `localhost:5432` |
| `prisma migrate deploy` (PD-2) | ✅ aplicada `20260717120000_pd2_durable_persistence_h1` |
| `prisma migrate status` | ✅ **Database schema is up to date!** (8/8) |
| `prisma validate` / `generate` | ✅ schema válido · cliente regenerado |
| SQL smoke tablas/enums/índices/snapshot | ✅ ver §3 |
| Prisma Client smoke (COUNT + select snapshot) | ✅ `scripts/ops/pd2-local-smoke.mjs` · host `localhost` |
| Typecheck | ✅ OK |
| Tests PD-2 lógica pura | ✅ **15/15** |
| Servicios cableados / UI / prod / commit / push | ❌ no tocados |

**Veredicto:** validación local post-PD-2 **CERRADA EN VERDE**. Schema durable existe en DB local. Listo para que Juan decida abrir PD-3 (aún no autorizado).

---

## 2. Entorno (blindaje)

| Item | Valor |
|------|--------|
| Contenedor | `gmusic_postgres_local` (`postgres:15-alpine`) |
| DB | `gmusic_learning_db` |
| Host efectivo | **`localhost:5432`** (confirmado en migrate status + smoke) |
| Fuente URL usada | `DATABASE_URL` exportada = contenido de `.env.docker` |
| Prod | **no** contactado · R-OPS-01 respetado |

Nota: Prisma imprime `Environment variables loaded from .env`, pero el datasource reportado fue `localhost:5432` porque la variable de entorno exportada prevalece. El smoke se niega a correr si el host no es `localhost`/`127.0.0.1`.

---

## 3. Smoke SQL

### Tablas nuevas (5/5)

`ftc_progress_projections` · `learner_projections_h1` · `library_resource_links` · `library_resources` · `practice_events`

### Enums

| Enum | Labels |
|------|--------|
| `PracticeEventType` | practice_started, practice_completed, practice_abandoned, ftc_card_completed, unit_completed |
| `LibraryResourceType` | song_simple, exercise, video_guide, backing_track, support_material |
| `ResourceAccessTier` | basic, premium |

### `LessonSession` (R-001)

| Columna | Tipo |
|---------|------|
| `content_snapshot` | jsonb |
| `content_version` | integer |

### Índices `practice_events`

- PK · `natural_key` UNIQUE · `(user_id, event_type, causation_command_id)` UNIQUE  
- `(user_id, occurred_at)` · `(session_id)`

### `_prisma_migrations`

`20260717120000_pd2_durable_persistence_h1` · `applied = true` · sin rollback.

---

## 4. Smoke Prisma Client

Comando:

```bash
export DATABASE_URL='postgresql://gmusic_admin:***@localhost:5432/gmusic_learning_db?schema=public'
npx tsx scripts/ops/pd2-local-smoke.mjs
```

Salida (resumen):

```json
{
  "host": "localhost",
  "counts": {
    "practiceEvents": 0,
    "ftcProjections": 0,
    "learnerProjections": 0,
    "libraryResources": 0,
    "libraryLinks": 0
  },
  "lessonSessionSnapshotFields": { "selectOk": true, "sampleFound": false },
  "clientModelsPresent": true
}
```

Conteos en 0 esperados: sin seed (PD-4) y sin dual-write (PD-3). `selectOk` confirma que el Client conoce `contentSnapshot` / `contentVersion`.

---

## 5. Comandos de reproducción

```bash
export PATH="/Applications/Docker.app/Contents/Resources/bin:$HOME/.docker/bin:$PATH"
docker start gmusic_postgres_local   # o: docker compose up -d
docker exec gmusic_postgres_local pg_isready -U gmusic_admin -d gmusic_learning_db

export DATABASE_URL='postgresql://gmusic_admin:gmusic_secure_password@localhost:5432/gmusic_learning_db?schema=public'
npx prisma migrate status
npx prisma migrate deploy            # ya aplicada; idempotente
npx prisma validate && npx prisma generate
npx tsx scripts/ops/pd2-local-smoke.mjs
NODE_ENV=test node --import tsx --test server/tests/pd2DurablePersistenceH1.test.ts
```

---

## 6. Frontera

| Siguiente | Estado |
|-----------|--------|
| **PD-3** (servicios H1 escriben/leen durable + flag) | ❌ **BLOQUEADO** — requiere OK Juan post esta validación |
| PD-4 seed Biblioteca | ❌ no |
| PD-5 enforcement entitlements en rutas | ❌ no |
| Commit / push | ❌ no |

### Frase sugerida para abrir PD-3

```text
OK, validación local post-PD-2 cerrada. Abro PD-3 Persistencia Durable H1.
Servicios H1 leen/escriben durable en local. Sin UI, Premium, Comunidad,
Profile, prod ni push.
```

---

*Validación local post-PD-2 · 2026-07-17 · verde · PD-3 bloqueado · sin commit/push*
