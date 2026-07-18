# Handoff final — Persistencia Durable H1 (PD-0 … PD-5)

Fecha: 18 Jul 2026
Autor: Cursor (ejecutor)
Rama: `main` · **4 commits locales ahead de `origin/main`** · **sin push**
Mandato: *"Prepara handoff final Persistencia Durable H1. Resumir commits
1ad047d, ad124ac, ef6333d y d48d163, estado de verificación, riesgos pendientes,
árbol dirty ajeno y recomendación de push. Sin cambios de código, sin commit ni push."*

> Documento de estado únicamente. No toca código, no commitea, no pushea.

---

## 1. Resumen ejecutivo

La serie **Persistencia Durable H1 (PD-0…PD-5)** está **completa y verde en
local**. Migra los puentes en memoria del ciclo P0 a almacenamiento durable
(Postgres/Prisma) detrás de un flag (`GMUSIC_H1_DURABLE`), sin romper contratos
P0 ni abrir Premium/Comunidad/UI. Todo bajo un flujo controlado, local-first,
con evidencia por fase.

**Falta una sola decisión humana: autorizar (o no) el push de los 4 commits.**

---

## 2. Commits a subir (orden cronológico)

### `1ad047d` — feat(domain): complete P0 H1 learning backend (16 Jul)
Cierre del ciclo P0 (Gates G1–G8): Identidad/Perfil, Onboarding, Ruta 12m+FTC,
Pagos+Entitlements, Sesión+Eventos, Mi Camino, Mi Progreso, Biblioteca — todo
como backend H1 (`profileId = userId`), con puentes **en memoria** declarados
temporales. Incluye docs de arquitectura de bridges.

### `ad124ac` — feat(persistence): durable H1 persistence PD-2 + PD-3 (18 Jul)
**32 archivos, +3518/-172.** El corazón de la persistencia durable:
- **Schema + migración** (`prisma/schema.prisma`, `migration.sql`): enums
  `PracticeEventType`/`LibraryResourceType`/`ResourceAccessTier`; modelos
  `PracticeEvent`, `FtcProgressProjection`, `LearnerProjectionH1`,
  `LibraryResource`, `LibraryResourceLink`; `LessonSession.contentSnapshot` +
  `contentVersion` (R-001).
- **Repos durables**: `practiceEventRepo`, `ftcProjectionRepo`,
  `learnerProjectionRepo`, `libraryResourceRepo`.
- **Policy R-002 (helper puro)**: `entitlementsPolicyH1` (entregado, sin cablear aún).
- **Flag + bridges (PD-3)**: `h1DurableFlag`, `practiceEventsBridge`,
  `learnerProjectionBridge` — servicios/rutas `/me/*` async, `meta.eventSource`
  = `db` | `memory_bridge_h1`.
- **R-001**: `lessonContentSnapshot` (snapshot de contenido al iniciar sesión).
- Tests PD-2 puro 15/15 · PD-3 integración 3/3 · validación local Docker.

### `ef6333d` — feat(persistence): PD-4 seed Biblioteca durable H1 (18 Jul)
**10 archivos, +737/-11.** Catálogo Biblioteca fixture → filas reales:
- `librarySeedH1` (mapeo puro + upsert idempotente), CLI `pd4-seed-library.ts`
  (guard host local), `libraryCatalogBridge` (fixture OFF / DB PUBLISHED ON).
- Contrato P0-08 intacto (`catalogSource`, premium force-OFF, DRAFT/ARCHIVED
  no visibles). Tests PD-4 puro 7/7 · integración 5/5 · regresión memoria 12/12.

### `d48d163` — feat(persistence): PD-5 enforcement entitlements R-002 (18 Jul)
**6 archivos, +299/-17.** Cierra R-002:
- `assertStudentLearningAccess` cableado en start (`lessonSessionService`) y
  complete H1 (`practiceLifecycleH1Service`) — reemplaza `assertMonthPlayableForPractice`.
- Requisito `requireZone + allowDemoGrant + monthIndex`: exige zona (cierra hueco),
  preserva DEMO vía grant, mantiene gate de mes. Tests PD-5 puro 7/7.

---

## 3. Estado de verificación

| Check | Resultado |
|-------|-----------|
| `npm run typecheck` (app + api) | ✅ OK |
| `npm run build` | ✅ OK (solo warnings preexistentes de chunk size) |
| **Tests puros (sin DB)** | ✅ PD-2 15/15 · PD-4 7/7 · PD-5 7/7 · entitlements/policy verde |
| **Tests integración (Docker + flag)** | ✅ PD-3 3/3 · PD-4 5/5 · `practiceLifecycleH1` 1/1 · `me-entitlements-h1` 2/2 |
| **Regresión P0** | ✅ `pathViewH1` 10/10 · Biblioteca memoria 12/12 · lifecycle P0-05 verde |
| **Migración PD-2 en Docker local** | ✅ aplicada y smoke de tablas/columnas OK |
| **Seed Biblioteca PD-4 (CLI)** | ✅ 8 recursos · 6 PUBLISHED · 4 links · idempotente |

> **Deuda de entorno conocida (no de esta serie):** `npm run verify` global sigue
> en rojo por seed/DB (aceptado desde Gates P0). Los tests que usan el dev student
> requieren `GMUSIC_DEV_USER_EMAIL=carlos@gmusic.academy` alineado al seed; con un
> valor ambiente no sembrado, `getDevStudent` falla **antes** de la lógica.

---

## 4. Riesgos pendientes

| Riesgo | Estado | Nota |
|--------|--------|------|
| **R-001** Snapshot de contenido de sesión | ✅ Mitigado (PD-3) | `LessonSession.contentSnapshot`; complete valida contra snapshot. |
| **R-002** Enforcement entitlements consistente | ✅ Mitigado (PD-5) | Policy única en start + complete H1. |
| **Doble fuente de verdad (flag)** | ⚠️ Aceptado | Memoria (OFF) vs DB (ON) coexisten; producción deberá fijar `GMUSIC_H1_DURABLE=1` y retirar memoria en fase futura. |
| **Backfill/migración de datos memoria→DB** | ⏸ No aplica | En memoria no hay datos productivos que migrar (MVP sin usuarios reales durables). |
| **Recalculo de proyecciones a escala** | ⚠️ Vigilar | `rebuildFtcProjectionFromEvents` es O(eventos); revisar en volumen real (post-conversión). |
| **`npm run verify` global rojo** | ⚠️ Deuda | Seed/DB de entorno; no bloquea la lógica de negocio verificada por tests dirigidos. |
| **Deploy: flag + migración en prod** | ⏸ Pendiente decisión | La migración PD-2 y `GMUSIC_H1_DURABLE` no están en prod. Requiere fase de deploy aprobada. |

---

## 5. Árbol dirty AJENO (excluido de los 4 commits)

Los commits se hicieron **selectivos**. Lo siguiente sigue sin versionar y **no
forma parte** de Persistencia Durable H1. No subir junto con esta serie sin
revisión propia.

**Modificados (M) ajenos:**
- `.github/workflows/ci.yml`
- `.agents/DECISIONS.md`
- `.agents/skills/gmusic-path/SKILL.md`
- `.env.example`
- `.gitignore`
- `docs/operations/checklist-seguridad-pre-lanzamiento.md`
- `package.json`
- `server/services/dashboardAssembly.ts`
- `server/services/meService.ts`
- `server/tests/phase3a.test.ts`
- `src/app/components/gmusic/GmusicInternalHeader.tsx` (+ test)
- `src/app/components/gmusic/lesson/LessonPracticeChecklist.tsx`
- `src/app/components/gmusic/lesson/LessonPrepareScreen.tsx` (+ test)
- `src/app/components/gmusic/lesson/lesson-stage.ts` (+ test)
- `src/app/components/gmusic/path/PathModuleDivider.tsx`

**Untracked:** ~62 rutas (docs de análisis, `docs/architecture/*`,
`docs/roadmap/fase-*`, `docs/features/`, `docs/quality/`, `.claude/`, imágenes,
patches `.patch`, etc.). Mezcla de documentación exploratoria y trabajo de otras
líneas; requieren su propia decisión de versionado.

> ⚠️ Un `git add -A` subiría todo esto. **No usar `-A`.** Cualquier push futuro
> de esta serie debe ser explícito sobre los 4 commits ya creados.

---

## 6. Recomendación de push

**Recomendación: aprobar el push de los 4 commits `1ad047d..d48d163` a `origin/main`.**

Motivos:
- Serie completa, coherente y verde en local (typecheck, build, tests dirigidos).
- Commits atómicos por fase con evidencia documental adjunta.
- No toca prod: la migración/flag no se despliegan por el solo hecho de pushear
  (el deploy es una fase aparte y aún no aprobada).

Condiciones antes de pushear:
1. **Confirmar que el árbol dirty ajeno NO se incluye** (push de commits ya
   existentes; no re-stagear).
2. Push directo a `main` autónomo está **prohibido por protocolo** → requiere tu
   **"SÍ/OK"** explícito.
3. Tras el push, **no** disparar deploy de la migración sin una fase de deploy
   aprobada (flag `GMUSIC_H1_DURABLE` sigue OFF en cualquier entorno no local).

Comando previsto (solo tras tu OK):
```bash
git push origin main   # sube 1ad047d, ad124ac, ef6333d, d48d163
```

Alternativa conservadora: abrir rama `feat/persistencia-durable-h1` desde
`d48d163` y PR hacia `main` para revisión antes de integrar.

---

## 7. Siguiente decisión para Juan

1. **Push** de los 4 commits a `origin/main` (directo) **o** vía rama/PR.
2. Posterior: ¿abrir **fase de deploy** (migración + flag ON en un entorno) o
   mantener durable solo en local hasta primera conversión WhatsApp?
3. Limpieza del **árbol dirty ajeno** (decidir qué versionar en líneas separadas).
