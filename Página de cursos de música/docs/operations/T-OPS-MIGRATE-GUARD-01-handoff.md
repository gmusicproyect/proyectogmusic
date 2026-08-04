# T-OPS-MIGRATE-GUARD-01 — Handoff para validación

**Ticket:** T-OPS-MIGRATE-GUARD-01  
**Origen:** `INC-2026-08-04-schema-drift-pd2.md` · propuesta guard §  
**Estado:** ⏸ Handoff — **no autoriza implementar** hasta OK Juan  
**Prioridad:** chico · paralelo a dirección B (material real) · **contenido gana si hay conflicto**

---

## 1. Propósito (una frase)

Evitar repetir el drift de julio: que `npm run deploy:verify-production` **falle** si la BD prod tiene migraciones Prisma pendientes respecto al repo desplegado.

---

## 2. Problema que cierra

| Hecho | Consecuencia |
|-------|----------------|
| Jul–Ago 2026: código PD-3 desplegado sin PD-2 en prod | `POST /lesson-sessions` → 500 silencioso |
| `deploy:verify-production` validaba health + rutas + CORS | **No** detectaba schema desalineado |
| Tráfico alumno ≈ 0 | Bug dormido hasta T-PUB-02 |

**Vacuna:** un paso más en el smoke post-deploy — `prisma migrate status` contra prod.

---

## 3. Alcance

### In scope

| Item | Detalle |
|------|---------|
| Parser + guard | Módulo reutilizable que interpreta salida de `prisma migrate status` |
| Integración | Llamado desde `scripts/verify-production-t1.mjs` **después** de health, **antes** de rutas frontend (fallar rápido en schema) |
| Tests unitarios | Strings sintéticos «up to date» vs «Following migration» — sin BD |
| Docs | Una línea en `docs/deploy/checklist-track-a.md` + referencia en INC |
| Smoke prod | Con `.env` prod: verify completo en verde hoy (8/8) |

### Out of scope

- `prisma migrate deploy` automático en CI/Render (decisión R-OPS-01 aparte)
- Lista blanca de migraciones «bloqueadas» (R-OPS-01 obsoleto post-PD-2 aplicada)
- Cambios en `server/` ni contratos API
- T-SEC-RATE-LIMIT-01 (backlog hasta alumnos reales)

---

## 4. Diseño propuesto

### 4.1 Archivos

| Archivo | Acción |
|---------|--------|
| `scripts/lib/prisma-migrate-status-guard.mjs` | **Nuevo** — `checkMigrateStatusClean({ databaseUrl?, spawnFn? })` |
| `scripts/lib/prisma-migrate-status-guard.test.mjs` | **Nuevo** — unitarios parser + exit codes |
| `scripts/verify-production-t1.mjs` | **Editar** — invocar guard |
| `package.json` | Opcional: `"ops:verify-prod-migrate": "node --env-file=.env scripts/lib/..."` solo debug |
| `docs/deploy/checklist-track-a.md` | Nota: verify requiere `DATABASE_URL` prod |

### 4.2 Comportamiento

```
deploy:verify-production
  ├─ health API                    (existente)
  ├─ prisma migrate status guard   (NUEVO)
  ├─ rutas frontend                (existente)
  └─ CORS preflight                (existente)
```

**Reglas del guard:**

| Condición | Resultado |
|-----------|-----------|
| `DATABASE_URL` ausente | **FAIL** con mensaje: «Configure DATABASE_URL prod para verify con migrate guard» |
| `migrate status` exit 0 + «Database schema is up to date!» | **PASS** |
| stdout contiene «Following migration have not yet been applied» (o variantes Prisma 6) | **FAIL** — listar nombres pendientes (sin URL/password) |
| `migrate status` exit ≠ 0 (ENOTFOUND, auth, paused Supabase) | **FAIL** — mensaje genérico + hint «proyecto pausado / URL» |
| Log | Host redactado (`postgresql://***@pooler...`) — nunca password |

**Escape hatch (solo local debug):**

- `SKIP_PROD_MIGRATE_GUARD=1` → omitir paso con **warning** explícito en stdout  
- No documentar como flujo normal; solo emergencia dev

### 4.3 Implementación técnica

- `spawnSync('npx', ['prisma', 'migrate', 'status'], { env: { ...process.env, DATABASE_URL }, cwd: prismaRoot })`
- Parser puro exportado para tests: `parseMigrateStatusOutput(stdout, exitCode)`
- Cwd = raíz app (`prisma/schema.prisma`)

---

## 5. Criterio binario done (6/6)

| # | Ítem | Evidencia |
|---|------|-----------|
| 1 | Módulo guard + tests unitarios | `node --test scripts/lib/prisma-migrate-status-guard.test.mjs` PASS |
| 2 | Integrado en `deploy:verify-production` | Código en `verify-production-t1.mjs` |
| 3 | Prod hoy limpio | `node --env-file=.env scripts/verify-production-t1.mjs` → OK migrate + OK smoke |
| 4 | Parser detecta pendiente | Test sintético con stdout «Following migration…» → FAIL |
| 5 | Sin regresión suite | `npm run app:test` verde (sin cambios producto) |
| 6 | Doc + PROJECT_STATUS | Nota checklist · ticket cerrado en status |

**Smoke Juan:** no requerido — verificación agente + prod migrate status limpio post-PD-2.

---

## 6. Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Verify prod deja de correr sin `.env` | Documentar en checklist; mensaje FAIL claro |
| Falso positivo por pooler | Mismo pooler que ya usa `migrate deploy` (validado 4 Ago) |
| Supabase pausado | FAIL es deseable — mismo síntoma que D-500 |
| Ralentiza verify ~3–5 s | Aceptable post-deploy |

---

## 7. Plan de ejecución (post-OK)

1. Implementar módulo + tests  
2. Integrar en verify-production  
3. Correr verify con `.env` prod → PASS  
4. Commit + push (código ops — OK implícito en «arrancar» tras validar handoff)  
5. Doc cierre breve en `docs/operations/T-OPS-MIGRATE-GUARD-01-cierre.md`

**Estimado:** ~30–45 min Cursor · cero tiempo Juan salvo OK.

---

## 8. Contexto semana (Juan — no bloquea ticket)

| Hoy Juan | Dirección semana |
|----------|------------------|
| **A** `ADMIN_PASSWORD_RESET_KEY` Render (~2 min) | **B** Video real Fundamento 1 «Tu guitarra y postura» vía `/admin` |
| **C** B3 nodo 3 — runner UI humano (~2 min) | Piloto **50 MB** Free — evidencia decide Pro vs formato |

---

## 9. Autorización

| Acción | Estado |
|--------|--------|
| Este handoff | ⏸ Pendiente OK Juan |
| Implementar | ⛔ No |
| Push | ⛔ No hasta cierre |

**Frase sugerida:** `OK handoff T-OPS-MIGRATE-GUARD-01`

---

## Referencias

- `docs/operations/INC-2026-08-04-schema-drift-pd2.md`
- `scripts/verify-production-t1.mjs`
- `docs/deploy/checklist-track-a.md`
- `docs/operations/DB-02-blindaje-entorno-pruebas.md` (patrón fail-closed)
