# INC-2026-08-04 — Schema drift prod (PD-3 code · PD-2 migration ausente)

**Fecha detección:** 2026-08-04 (T-PUB-02 handoff)  
**Fecha remedio:** 2026-08-04 (Fase A autorizada por Juan)  
**Impacto usuario real:** **Cero** — ningún alumno había usado `POST /lesson-sessions` en prod  
**Relación:** desbloquea T-PUB-02 Fase B · enmienda D-500 § «Guarda PD-2» (2026-08-03)

---

## Resumen

Prod ejecutaba código que escribe `LessonSession.content_snapshot` (PD-3 R-001) desde ~17 Jul 2026, pero la migración Prisma `20260717120000_pd2_durable_persistence_h1` (PD-2, 17 Jul) **nunca se aplicó** en Supabase prod — bloqueada explícitamente por R-OPS-01.

**Síntoma:** `POST /api/v1/lesson-sessions` → **500** `INTERNAL_ERROR` (Prisma P2022: columna `content_snapshot` inexistente).

**Causa:** drift schema ↔ deploy — `deploy:verify-production` valida health/rutas/CORS, **no** alineación Prisma.

---

## Cronología

| Momento | Evento |
|---------|--------|
| 2026-07-17 | Migración PD-2 commiteada; cabecera SQL: «Prod bloqueado (R-OPS-01)» |
| 2026-07-17+ | API en Render desplegada con `captureLessonContentSnapshot` (lessonSessionService) |
| 2026-08-03 | D-500: PD-2 pendiente documentada como «por diseño»; re-QA register sin tocar lesson runner |
| 2026-08-04 | T-PUB-02 handoff: dry-run MicroExercise 6/6 OK; lesson-sessions 500 en B3 nodo 2 |
| 2026-08-04 | Juan: **OK migrate prod PD-2** (migración completa, no ALTER suelto) |
| 2026-08-04 | Backup `pg_dump` → `~/gmusic-prod-backups/gmusic-prod-full-20260804T173107Z.dump` (273 KiB) |
| 2026-08-04 | `prisma migrate deploy` → PD-2 aplicada · status **up to date** (8/8) |
| 2026-08-04 | Verificación: `POST /lesson-sessions` B3 nodo 2 → **201** · `exercises.length === 1` |

---

## Evidencia forense (pre-fix)

**Migraciones aplicadas en prod (7/8):**

1. `20260608213449_init_gmusic_tables`
2. `20260622143000_onboarding_analytics`
3. `20260623190000_onboarding_lead_email`
4. `20260624120000_auth_user_fields`
5. `20260702180000_community_posts_enrollment`
6. `20260702200000_pathnode_stage_fields`
7. `20260702210000_pathnode_guide_pdf_url`

**Pendiente:** `20260717120000_pd2_durable_persistence_h1` — única.

**Columnas `LessonSession` pre-fix (9):** id, userId, nodeId, status, accuracy, xpEarned, streakUpdated, startedAt, completedAt.

**Post-fix (11):** + `content_snapshot`, `content_version`.

**Objetos PD-2 adicionales creados:** enums `PracticeEventType`, `LibraryResourceType`, `ResourceAccessTier`; tablas `practice_events`, `ftc_progress_projections`, `learner_projections_h1`, `library_resources`, `library_resource_links`.

---

## Remedio aplicado

| Paso | Resultado |
|------|-----------|
| Backup | `pg_dump` PostgreSQL 17 · plan Free (sin snapshot dashboard) |
| `migrate status` | 1 pendiente, 100 % aditiva (ADD COLUMN nullable + CREATE TABLE) |
| `migrate deploy` | Exit 0 · 8/8 |
| Smoke API | Login 200 · session 201 · ejercicio CHORD_SHAPE Am digitación |

Evidencia JSON: `.agents/operations/t-pub-02-pd2-migrate-evidence/report.json`

---

## Hallazgos T-PUB-02 (no bloqueantes Fase A)

- Cuenta `qa-alumno-prod-001@gmusic.test`: B3 nodo 1 `completed` sin sesión documentada en este ticket — **registrado, no investigado**.
- Fase B: smoke UI nodo 2 B3 · Juan · sin reset progreso.

---

## Propuesta guard — ticket ops futuro (no implementado hoy)

**Objetivo:** que `deploy:verify-production` falle si prod tiene migraciones Prisma pendientes.

**Borrador de criterio:**

```bash
# En scripts/verify-production-t1.mjs (o paso previo en CI post-deploy):
DATABASE_URL="$PROD_READONLY_OR_DEPLOY_URL" npx prisma migrate status
# Exit ≠ 0 o stdout contiene "Following migration" → FAIL deploy verify
```

**Alternativa CI:** job Render post-deploy que ejecute `prisma migrate deploy` automáticamente (elimina drift manual) — requiere decisión R-OPS-01 / credenciales en pipeline.

**Ticket sugerido:** `T-OPS-MIGRATE-GUARD-01` — implementar guard tras OK Juan aparte.

---

## Lecciones

1. **Health 200 ≠ schema alineado** — register/login pasaron D-500 con PD-2 pendiente porque no tocaban columnas nuevas.
2. **R-OPS-01 bloqueó migrate pero no deploy de código** — el par code-first sin migrate-first creó deuda silenciosa.
3. **Free tier Supabase:** backup = `pg_dump` real, no asumir snapshots dashboard.

---

## Historial

| Fecha | Evento |
|-------|--------|
| 2026-08-04 | Incidente documentado · Fase A cerrada · T-PUB-02 Fase B pendiente smoke UI Juan |
