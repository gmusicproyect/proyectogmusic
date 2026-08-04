# T-PUB-02 — Cierre PROD · MicroExercise B3 practicable

**Fecha cierre:** 4 Ago 2026  
**Entorno:** prod — `proyectogmusic.vercel.app` → Render `gmusic-api` → Supabase prod  
**Smoke:** Juan «hazlo tu» 4 Ago 2026 — delegado Cursor · **API E2E** + verificación de estado en browser (ver § alcance abajo)  
**Veredicto:** **CERRADO 6/6** (no reabre por pendiente UI no bloqueante)

**Prerequisito Fase A:** `INC-2026-08-04-schema-drift-pd2.md` — PD-2 migrate prod aplicada el mismo día.

---

## Criterio binario

| # | Ítem | Evidencia |
|---|------|-----------|
| 1 | Script `seed-b3-microexercises.mjs` + `--dry-run` prod OK | 6/6 ejercicios · `WOULD_SKIP (matches spec)` · tests **13/13** |
| 2 | 6 `MicroExercise` en B3 «Tu primer acorde: La menor» | Prod pre-aplicados · catálogo `seed-b3-microexercises-catalog.mjs` |
| 3 | Smoke E2E B3 **nodo 2** · flujo practicable (datos) | **API E2E** · **CHORD_SHAPE** · sesión · complete · `xpEarned: 100` — *no* runner UI humano (§ alcance) |
| 4 | `POST /complete` → progreso + XP sin duplicados | `nodeCompleted: true` · `accuracy: 1` · path nodo 2 → **completed** |
| 5 | Re-complete idempotente | `alreadyProcessed: true` · session `662b88ec-d28f-491c-8e2b-fc866418d481` |
| 6 | Doc + PROJECT_STATUS **6/6** | Este archivo · evidencia JSON abajo |

---

## Fase A — schema drift (mismo día)

| Paso | Resultado |
|------|-----------|
| Backup | `~/gmusic-prod-backups/gmusic-prod-full-20260804T173107Z.dump` |
| `migrate deploy` | PD-2 · 8/8 migraciones |
| Verificación | `POST /lesson-sessions` → **201** · `exercises.length >= 1` |

→ `docs/operations/INC-2026-08-04-schema-drift-pd2.md`

---

## Fase B — smoke B3 nodo 2

### Alcance del smoke (registro honesto)

| Qué se probó | Cómo |
|--------------|------|
| Login · sesión · complete · XP · path `completed` · re-complete idempotente | **API E2E** prod (`scripts/ops/t-pub-02-prod-smoke-b3-node2.mjs`) |
| Carga de `/mi-camino` autenticado | Browser — verificación de estado (nodo 2 visible en camino post-complete) |

**Delegación:** Juan autorizó **«hazlo tú»** (4 Ago 2026). El flujo API es **equivalente en datos** al del runner; **no** sustituye una pasada humana de la UI (render del ejercicio, botones, feedback visual de XP).

**Pendiente no bloqueante:** primera pasada humana del **runner UI** en prod — no ticket; se cierra con uso normal del producto (p. ej. jugar B3 nodo 3 como alumno antes de invitar a un alumno real). Si el runner no renderiza o el feedback XP no se muestra, este cierre **no** lo habría atrapado.

### Resultado API

| Campo | Valor |
|-------|-------|
| Cuenta | `qa-alumno-prod-001@gmusic.test` |
| Módulo | Tu primer acorde: La menor (B3) |
| Nodo | 2 · «Diagrama de Am: dedos, trastes, cuerdas» |
| `nodeId` | `d367555e-ba3e-4bb7-a096-ddd5ca6e1d6b` |
| Tipo ejercicio | **CHORD_SHAPE** (no MC genérico) |
| Respuesta | `X-0-2-2-1-0` (`correctOptionId: a`) |
| Estado antes | `active` |
| Estado después | **completed** |
| XP | **100** |

**Hallazgo registrado (no investigado):** nodo 1 B3 `completed` en QA antes de este smoke — anomalía histórica.

**Sin reset de progreso** — según mandato Juan.

---

## Contenido MicroExercise B3 (6 ejercicios)

| Nodo | stageType | Título | Ejercicios |
|------|-----------|--------|------------|
| 1 | FUNDAMENTO_UNO | Qué es un acorde y por qué Am es la puerta | 1 × CHORD_SHAPE |
| 2 | FUNDAMENTO_DOS | Diagrama de Am: dedos, trastes, cuerdas | 1 × CHORD_SHAPE |
| 3 | TECNICA | Presión limpia sin trasteo | 1 × CHORD_SHAPE |
| 4 | PRACTICA | Armar el acorde por cuerdas | 1 × RHYTHM_TAP (5 beats) |
| 5 | TOCAR | Am al pulso | 1 × RHYTHM_TAP + 1 × CHORD_SHAPE (6ª cuerda) |

Canon Am abierto: **X-0-2-2-1-0**. Nodo 5 `order=2` = CHORD_SHAPE piloto (sin EAR_TRAINING — CDN audio no resuelve).

---

## Evidencia

| Artefacto | Ruta |
|-----------|------|
| Smoke Fase B JSON | `.agents/operations/t-pub-02-prod-smoke-evidence/report.json` |
| PD-2 migrate JSON | `.agents/operations/t-pub-02-pd2-migrate-evidence/report.json` |
| Runner ops | `scripts/ops/t-pub-02-prod-smoke-b3-node2.mjs` |
| Seed ops | `scripts/ops/seed-b3-microexercises.mjs` |

---

## Fuera de alcance (cumplido)

- Admin CRUD ejercicios · limpieza B1/B2 · schema changes post-PD-2
- Guard `T-OPS-MIGRATE-GUARD-01` — solo propuesto en incidente

---

## Cola

| Item | Nota |
|------|------|
| Material real | Upload `/admin` reemplaza placeholders — sin código |
| `ADMIN_PASSWORD_RESET_KEY` | Render · ops Juan · aparte |
| `T-OPS-MIGRATE-GUARD-01` | Guard migrate en `deploy:verify-production` · OK aparte |

---

## Historial

| Fecha | Evento |
|-------|--------|
| 8 Jul 2026 | Brief + spec Fase 2A · vía B script ops |
| 4 Ago 2026 | Fase A PD-2 prod · incidente drift |
| 4 Ago 2026 | Fase B smoke API · **CERRADO 6/6** |
| 4 Ago 2026 | Ajuste registro: smoke = API E2E + browser estado · runner UI humano pendiente no bloqueante |
