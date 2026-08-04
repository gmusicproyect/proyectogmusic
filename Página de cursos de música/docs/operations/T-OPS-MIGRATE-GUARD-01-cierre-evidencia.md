# T-OPS-MIGRATE-GUARD-01 — Cierre PROD · migrate guard en verify

**Fecha cierre:** 4 Ago 2026  
**Autorización:** OK handoff + OK cierre Juan  
**Origen:** `INC-2026-08-04-schema-drift-pd2.md`  
**Veredicto:** **CERRADO 6/6**

---

## Criterio binario 6/6

| # | Ítem | Evidencia | Estado |
|---|------|-----------|--------|
| 1 | Módulo guard + tests unitarios | `scripts/lib/prisma-migrate-status-guard.mjs` · **7/7** pass | ✅ |
| 2 | Integrado en `deploy:verify-production` | `scripts/verify-production-t1.mjs` — tras health, antes rutas | ✅ |
| 3 | Prod verde hoy | `node --env-file=.env scripts/verify-production-t1.mjs` → **OK** · schema **8/8** | ✅ |
| 4 | Evidencia **negativa** (mock, no prod) | § negativo abajo | ✅ |
| 5 | Suite intacta | `npm run app:test` → **614/614** | ✅ |
| 6 | Doc + PROJECT_STATUS + push | Este archivo · OK cierre Juan | ✅ |

---

## Evidencia negativa (mandato Juan)

### A) `DATABASE_URL` ausente — fail-closed

```bash
env -u DATABASE_URL node scripts/verify-production-t1.mjs
# exit 1
```

```text
✖ DATABASE_URL ausente — verify prod requiere conexión prod para migrate guard (fail-closed)
verify-production-t1: FALLÓ
```

Unit test: `FAIL — DATABASE_URL ausente (fail-closed)`

### B) Migración pendiente — solo mock (jamás contra prod)

Unit test re-actúa el incidente PD-2:

```text
Following migration have not yet been applied:
20260717120000_pd2_durable_persistence_h1
```

→ `MIGRATE_PENDING` · exit lógico fail.

---

## Evidencia positiva

```bash
node --env-file=.env npm run deploy:verify-production
```

```text
✔ API health — status ok, database connected
✔ Prisma migrate status — schema alineado (up to date) (postgresql://***@…)
✔ Frontend … → 200 (6 rutas)
✔ CORS preflight quiz …
verify-production-t1: OK
```

JSON: `.agents/operations/t-ops-migrate-guard-evidence/report.json`

---

## Archivos

| Archivo | Cambio |
|---------|--------|
| `scripts/lib/prisma-migrate-status-guard.mjs` | Guard + parser + redacción URL |
| `scripts/lib/prisma-migrate-status-guard.test.mjs` | 7 tests (verde + rojo mock PD-2) |
| `scripts/verify-production-t1.mjs` | Integración guard |
| `docs/deploy/checklist-track-a.md` | `--env-file=.env` + fail-closed |

**Escape hatch:** `SKIP_PROD_MIGRATE_GUARD=1` — warning only · no flujo normal.

---

## Lazo incidente 4 Ago — cerrado

drift → detección → migración PD-2 → documentación INC → **vacuna verify**

---

## Historial

| Fecha | Evento |
|-------|--------|
| 4 Ago 2026 | Handoff · implementación · evidencia · OK cierre · push |
