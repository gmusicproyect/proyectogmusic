# Persistencia Durable H1 — PD-4 Seed Biblioteca · Evidencia

Fecha: 18 Jul 2026
Rama / HEAD: `main` (P0 `1ad047d` + PD-2/PD-3 `ad124ac`), **sin push**
Mandato Juan: *"OK, abre PD-4 Persistencia Durable H1 — Seed Biblioteca. Alcance:
migrar catálogo fixture `memory_fixture_h1` a filas reales en DB local, seed
controlado, lectura compatible con contratos libraryH1 y evidencia. Sin
UI/routing, sin Premium real, sin Comunidad, sin prod ni push."*

---

## Alcance cumplido

- ✅ Migración del catálogo fixture P0-08 (`buildMvpLibraryCatalogFixtureH1`) a
  filas reales `LibraryResource` (+ `LibraryResourceLink`) en Postgres **local/Docker**.
- ✅ Seed **controlado e idempotente** (upsert por id + reemplazo total de links).
- ✅ Lectura durable compatible con el contrato `libraryH1` (mismo `LibraryViewH1`),
  conmutada por el flag `GMUSIC_H1_DURABLE`.
- ✅ Evidencia + tests.

## Fuera de alcance (respetado)

- ❌ Sin UI ni routing nuevos.
- ❌ Sin Premium real: `premium` se persiste como metadato pero la vista lo mantiene
  **force-OFF** (`viewState: "locked"` + blocker `ENTITLEMENT`).
- ❌ Sin Comunidad.
- ❌ Sin multimedia real: `mediaRef` siempre `null`.
- ❌ Sin prod, sin commit de este mandato aún, sin push.
- ❌ Policy de entitlements en rutas (R-002) sigue diferida a PD-5 (helper ya existe).

---

## Cambios

### Seed (fixture → filas)
- `server/lib/librarySeedH1.ts`
  - `libraryCatalogSeedRows()` — mapeo **puro** fixture → filas de seed.
    Cada `tarjetaId` y cada `unidadId` se persiste como un `LibraryResourceLink`
    (tarjeta XOR unidad) para reconstruir exactamente los sets del contrato.
  - `seedLibraryCatalogH1(db, rows?)` — upsert idempotente + reemplazo de links.
- `scripts/ops/pd4-seed-library.ts` — CLI (tsx) con **guard host local**
  (rechaza cualquier `DATABASE_URL` que no sea `localhost`/`127.0.0.1`).

### Lectura durable (bridge)
- `server/lib/libraryCatalogBridge.ts`
  - `resolveLibraryCatalogH1(instrument)` — flag OFF → fixture (`memory_fixture_h1`),
    flag ON → filas `LibraryResource` **PUBLISHED** (`db`).
  - `buildLibraryViewH1Async` / `buildLibraryItemDetailH1Async` — arman la vista
    con el catálogo del bridge, sin duplicar reglas P0-08.
- `server/lib/libraryH1.ts`
  - `meta.catalogSource` pasa a unión `"memory_fixture_h1" | "db"` (tipo
    `LibraryCatalogSourceH1`); `buildLibraryViewH1` acepta override `catalogSource`.
- `server/routes/me.ts`
  - `GET /me/library` y `GET /me/library/:id` usan los builders async del bridge.

---

## Verificación

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` | ✅ OK |
| `npm run build` | ✅ OK (solo warnings preexistentes de chunk size / dynamic import) |
| PD-4 puro (`pd4LibrarySeedH1.test.ts`) | ✅ 7/7 |
| Regresión Biblioteca memoria (`libraryH1.test.ts`, flag OFF) | ✅ 12/12 |
| PD-4 integración Docker + `GMUSIC_H1_DURABLE=1` (`pd4LibraryDurable.integration.test.ts`) | ✅ 5/5 |
| Seed CLI (evidencia) | ✅ ver abajo |

### Salida seed CLI (Docker local)

```json
{
  "host": "localhost",
  "seeded": {
    "resourcesUpserted": 8,
    "linksWritten": 4,
    "statusBreakdown": { "DRAFT": 1, "PUBLISHED": 6, "ARCHIVED": 1 }
  },
  "dbCounts": { "publishedResources": 6, "links": 4 }
}
```

Re-ejecución → mismos counts (`resourcesUpserted: 8`, `publishedResources: 6`,
`links: 4`): **idempotente**.

### Cobertura de invariantes P0-08 en modo durable

- `meta.catalogSource === "db"` con flag ON.
- `premiumEnabled === false`; recursos premium → `locked` + blocker `ENTITLEMENT`.
- DRAFT/ARCHIVED nunca listados; detalle de DRAFT → `404 RESOURCE_NOT_FOUND`.
- `tarjetaIds`/`unitIds` reconstruidos idénticos al fixture publicado.

---

## Cómo reproducir (local)

```bash
# 1. Postgres local (Docker) arriba + migración PD-2 aplicada
docker start gmusic_postgres_local

# 2. Seed controlado (guard host local)
DATABASE_URL="postgresql://gmusic_admin:...@localhost:5432/gmusic_learning_db?schema=public" \
  node --import tsx scripts/ops/pd4-seed-library.ts

# 3. Tests durable (flag ON)
DATABASE_URL="...localhost..." GMUSIC_H1_DURABLE=1 NODE_ENV=test \
  node --import tsx --test server/tests/pd4LibraryDurable.integration.test.ts

# 4. Tests memoria (flag OFF)
node --import tsx --test server/tests/pd4LibrarySeedH1.test.ts server/tests/libraryH1.test.ts
```

---

## Siguiente decisión (para Juan)

- Autorizar o no **commit local selectivo PD-4** (seed/bridge/rutas/tests/docs).
- Abrir o no **PD-5** (enforcement de entitlements en rutas de learning — R-002,
  helper `entitlementsPolicyH1` ya entregado en PD-2).
- Push a `origin/main`: sigue **NO** hasta OK explícito.
