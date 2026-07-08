# T-PUB-02 Fase 2A — Spec ejecutable script MicroExercise B3

**Ticket:** T-PUB-02 · Fase 2A  
**Prerequisito:** `T-PUB-02-mini-brief.md` (commit `ba29a02`)  
**Estado:** §4 corregido pedagógicamente · pendiente OK JP para commit — **no autoriza implementar ni `--apply`**  
**Brief padre:** `docs/operations/T-PUB-02-mini-brief.md`  
**Digitación canon Am abierto (6ª→1ª):** `X-0-2-2-1-0` — 6ª no se toca

---

## 0. Autorización actual

| Acción | Estado |
|--------|--------|
| Versionar mini-brief | ✅ Hecho (`ba29a02`) |
| Dirección vía B (script ops idempotente) | ✅ Aprobada |
| Este spec (copy final ejercicios) | ⏸ §4 corregido · pendiente OK JP post-revisión |
| Implementar script | ⛔ No autorizado |
| `--dry-run` / `--apply` local o prod | ⛔ No autorizado |

---

## 1. Script — identidad

| Campo | Valor |
|-------|-------|
| **Ruta** | `scripts/ops/seed-b3-microexercises.mjs` |
| **Runtime** | Node ≥ 20 · ESM (`.mjs`) |
| **Dependencias** | `@prisma/client` (misma `DATABASE_URL` que API) |
| **npm script sugerido** | `"ops:seed-b3-exercises": "node scripts/ops/seed-b3-microexercises.mjs"` |

### 1.1 Argumentos CLI

| Flag | Obligatorio | Comportamiento |
|------|-------------|----------------|
| `--dry-run` | Sí (uno de los dos) | Resuelve curso/módulo/nodos; imprime plan; **cero writes** |
| `--apply` | Sí (uno de los dos) | Ejecuta `upsert` por `(nodeId, order)`; imprime resumen |
| `--verbose` | No | Log JSON de cada `contentPayload` / ids resueltos |
| `--help` | No | Muestra uso y sale 0 |

**Reglas:**

- `--dry-run` y `--apply` son mutuamente excluyentes; si faltan ambos → exit 1 + mensaje.
- Sin `--apply` explícito nunca escribe en BD (defensa en profundidad).
- Exit 0 solo si resolución OK y (en apply) todos los upserts OK.
- Exit 1 si curso/módulo/nodo no encontrado, ambigüedad, o error Prisma.

### 1.2 Ejemplos de invocación (futuro — no ejecutar sin autorización)

```bash
# Revisión plan (obligatorio primero)
DATABASE_URL="..." node scripts/ops/seed-b3-microexercises.mjs --dry-run

# Aplicar (solo tras OK dry-run + autorización JP)
DATABASE_URL="..." node scripts/ops/seed-b3-microexercises.mjs --apply
```

---

## 2. Resolución de entidades (lookup)

### 2.1 Curso

```text
WHERE slug = 'ruta-guitarra-12-meses'
  AND status = 'PUBLISHED'
```

- Si 0 filas → error `COURSE_NOT_FOUND`
- Si >1 → error `COURSE_AMBIGUOUS` (no debería ocurrir)

### 2.2 Módulo B3

```text
WHERE courseId = <curso.id>
  AND title = 'Tu primer acorde: La menor'
  AND status = 'PUBLISHED'
```

- **No** usar `module.order === 3` como única clave (label admin ≠ pedagógico en otros contextos).
- Título exacto es la clave primaria de negocio.
- Si 0 o >1 → error con lista de títulos de módulos publicados del curso.

### 2.3 PathNodes (5 etapas)

Para cada fila de la tabla §4, resolver:

```text
WHERE moduleId = <módulo.id>
  AND stageType = <enum>
  AND title = <título exacto>
  AND status = 'PUBLISHED'
```

- Validar que el módulo tiene exactamente **5** nodos publicados tras resolución.
- Si un par `(stageType, title)` no existe → error `NODE_NOT_FOUND` con hint.
- Si >1 coincidencia → error `NODE_AMBIGUOUS`.

**Orden de procesamiento:** `order` ascendente del nodo (1 → 5).

---

## 3. Estrategia idempotente

Por cada ejercicio definido en §4:

```typescript
prisma.microExercise.upsert({
  where: { nodeId_order: { nodeId, order } },
  create: { nodeId, order, type, difficulty, instruction, contentPayload, secureAnswer },
  update: { type, difficulty, instruction, contentPayload, secureAnswer },
})
```

| Propiedad | Efecto |
|-----------|--------|
| Re-run `--apply` | Actualiza copy/payload si cambió el spec; no duplica filas |
| `(nodeId, order)` ocupado por otro tipo | **Sobrescribe** — dry-run debe advertir `WOULD_UPDATE existing order=N` |
| Nodo con ejercicios extra `order > max(spec)` | **No toca** órdenes fuera del spec (no borra huérfanos) |

**Política de huérfanos:** el script **no** elimina ejercicios con `order` no definidos en este spec. Rollback manual si hubo error humano (§8).

---

## 4. Contenido exacto — MicroExercise por etapa

**Total:** 6 ejercicios · 5 nodos · volumen piloto mínimo aprobado.

Convención: `secureAnswer` siempre `{ "correctOptionId": "<id>" }`.

---

### Nodo 1 — `FUNDAMENTO_UNO`

**Título:** `Qué es un acorde y por qué Am es la puerta`

#### Exercise `order: 1`

| Campo | Valor |
|-------|-------|
| `type` | `CHORD_SHAPE` |
| `difficulty` | `1` |
| `instruction` | `¿Cuál definición describe mejor un acorde en guitarra?` |

`contentPayload`:

```json
{
  "options": [
    { "id": "a", "text": "Varias notas que suenan juntas" },
    { "id": "b", "text": "Una sola cuerda pulsada al aire" },
    { "id": "c", "text": "El silencio entre dos notas" }
  ]
}
```

`secureAnswer`:

```json
{ "correctOptionId": "a" }
```

---

### Nodo 2 — `FUNDAMENTO_DOS`

**Título:** `Diagrama de Am: dedos, trastes, cuerdas`

#### Exercise `order: 1`

| Campo | Valor |
|-------|-------|
| `type` | `CHORD_SHAPE` |
| `difficulty` | `1` |
| `instruction` | `Elige la digitación correcta para La menor (Am) en posición abierta.` |

`contentPayload`:

```json
{
  "diagramLabel": "Am abierto · desde 6ª a 1ª cuerda",
  "options": [
    { "id": "a", "text": "X-0-2-2-1-0" },
    { "id": "b", "text": "0-1-2-2-0-0" },
    { "id": "c", "text": "1-3-2-0-1-0" }
  ]
}
```

`secureAnswer`:

```json
{ "correctOptionId": "a" }
```

**Nota pedagógica:** `X` = 6ª cuerda no se toca / silenciada. Canon Bloque 1 D-GOV-04.

---

### Nodo 3 — `TECNICA`

**Título:** `Presión limpia sin trasteo`

#### Exercise `order: 1`

| Campo | Valor |
|-------|-------|
| `type` | `CHORD_SHAPE` |
| `difficulty` | `1` |
| `instruction` | `¿Qué ayuda a que cada cuerda del acorde suene clara, sin trasteo?` |

`contentPayload`:

```json
{
  "options": [
    { "id": "a", "text": "Presionar con la yema, cerca del traste, sin tocar otras cuerdas" },
    { "id": "b", "text": "Apoyar el dedo en el centro del espacio entre trastes" },
    { "id": "c", "text": "Presionar lo más suave posible sin tocar la cuerda" }
  ]
}
```

`secureAnswer`:

```json
{ "correctOptionId": "a" }
```

---

### Nodo 4 — `PRACTICA`

**Título:** `Armar el acorde por cuerdas`

#### Exercise `order: 1`

| Campo | Valor |
|-------|-------|
| `type` | `RHYTHM_TAP` |
| `difficulty` | `1` |
| `instruction` | `Arma el acorde Am y toca solo las cuerdas que pertenecen al acorde, desde la 5ª hasta la 1ª. Marca cada TAP cuando suene.` |

`contentPayload`:

```json
{
  "tapHeadline": "Am cuerda por cuerda",
  "tapDescription": "La 6ª cuerda no se toca. Arma La menor y toca una vez cada cuerda desde la 5ª hasta la 1ª.",
  "submissionOptionId": "tap-complete",
  "tapSequence": [
    { "stringNumber": 5, "label": "5", "stringName": "La" },
    { "stringNumber": 4, "label": "4", "stringName": "Re" },
    { "stringNumber": 3, "label": "3", "stringName": "Sol" },
    { "stringNumber": 2, "label": "2", "stringName": "Si" },
    { "stringNumber": 1, "label": "1", "stringName": "Mi agudo" }
  ]
}
```

**Nota pedagógica:** 5 beats (cuerdas 5→1). La 6ª queda explícitamente fuera del acorde.

`secureAnswer`:

```json
{ "correctOptionId": "tap-complete" }
```

---

### Nodo 5 — `TOCAR`

**Título:** `Am al pulso`

#### Exercise `order: 1`

| Campo | Valor |
|-------|-------|
| `type` | `RHYTHM_TAP` |
| `difficulty` | `1` |
| `instruction` | `Toca el acorde Am cuatro veces al pulso — una pulsación por TAP.` |

`contentPayload`:

```json
{
  "tapHeadline": "Am · 4 tiempos",
  "tapDescription": "Mantén el acorde Am y marca un TAP por cada tiempo. Ve a tu ritmo — sin metrónomo en este piloto.",
  "submissionOptionId": "tap-complete",
  "tapSequence": [
    { "stringNumber": 5, "label": "1", "stringName": "Tiempo 1" },
    { "stringNumber": 5, "label": "2", "stringName": "Tiempo 2" },
    { "stringNumber": 5, "label": "3", "stringName": "Tiempo 3" },
    { "stringNumber": 5, "label": "4", "stringName": "Tiempo 4" }
  ]
}
```

`secureAnswer`:

```json
{ "correctOptionId": "tap-complete" }
```

#### Exercise `order: 2` — piloto (sin audio CDN)

| Campo | Valor |
|-------|-------|
| `type` | `CHORD_SHAPE` |
| `difficulty` | `1` |
| `instruction` | `Al rasguear Am abierto, ¿qué hacemos con la 6ª cuerda?` |

`contentPayload`:

```json
{
  "options": [
    { "id": "a", "text": "No la tocamos — queda silenciada" },
    { "id": "b", "text": "La tocamos al aire como parte del acorde" },
    { "id": "c", "text": "Es la única cuerda que debemos pulsar" }
  ]
}
```

`secureAnswer`:

```json
{ "correctOptionId": "a" }
```

**Validación audio (8 Jul 2026):** `https://cdn.gmusic.academy/audio/samples/chord-am-open.mp3` → **FALLA** (`Could not resolve host: cdn.gmusic.academy`). Por decisión JP: **no usar `EAR_TRAINING` en piloto** hasta CDN confiable.

**Alternativa diferida (no piloto):** cuando el CDN responda, sustituir este ejercicio por:

| Campo | Valor |
|-------|-------|
| `type` | `EAR_TRAINING` |
| `instruction` | `Escucha el acorde y confirma si es La menor (Am).` |
| `audioUrl` | `https://cdn.gmusic.academy/audio/samples/chord-am-open.mp3` |
| Opciones | a = Sí, es La menor · b = No, es otro acorde |
| `secureAnswer` | `{ "correctOptionId": "a" }` |

---

## 5. Logs esperados

### 5.1 `--dry-run` (ejemplo)

```text
[t-pub-02] mode=dry-run
[t-pub-02] database: <host redactado>
[t-pub-02] course: slug=ruta-guitarra-12-meses id=<uuid> status=PUBLISHED
[t-pub-02] module: title="Tu primer acorde: La menor" id=<uuid> order=3 nodes=5 status=PUBLISHED
[t-pub-02] node[1/5] stage=FUNDAMENTO_UNO title="Qué es un acorde y por qué Am es la puerta" id=<uuid>
[t-pub-02]   exercise order=1 type=CHORD_SHAPE → WOULD_CREATE (or WOULD_UPDATE)
[t-pub-02] node[2/5] stage=FUNDAMENTO_DOS title="Diagrama de Am: dedos, trastes, cuerdas" id=<uuid>
[t-pub-02]   exercise order=1 type=CHORD_SHAPE → WOULD_CREATE
[t-pub-02] node[3/5] stage=TECNICA title="Presión limpia sin trasteo" id=<uuid>
[t-pub-02]   exercise order=1 type=CHORD_SHAPE → WOULD_CREATE
[t-pub-02] node[4/5] stage=PRACTICA title="Armar el acorde por cuerdas" id=<uuid>
[t-pub-02]   exercise order=1 type=RHYTHM_TAP → WOULD_CREATE
[t-pub-02] node[5/5] stage=TOCAR title="Am al pulso" id=<uuid>
[t-pub-02]   exercise order=1 type=RHYTHM_TAP → WOULD_CREATE
[t-pub-02]   exercise order=2 type=CHORD_SHAPE → WOULD_CREATE
[t-pub-02] summary: nodes=5 exercises=6 would_create=6 would_update=0 skipped=0 errors=0
[t-pub-02] dry-run complete — no writes performed
```

### 5.2 `--apply` (ejemplo)

```text
[t-pub-02] mode=apply
...
[t-pub-02]   exercise order=1 type=CHORD_SHAPE → UPSERTED id=<uuid>
...
[t-pub-02] summary: nodes=5 exercises=6 created=6 updated=0 errors=0
[t-pub-02] apply complete
```

### 5.3 Errores

```text
[t-pub-02] ERROR NODE_NOT_FOUND stage=TECNICA title="Presión limpia sin trasteo"
[t-pub-02] hint: published nodes in module: [...]
```

---

## 6. Checklist smoke local (post-`--apply` local — futuro)

**Precondiciones**

- [ ] `npm run verify` en verde (sin cambios de código en este ciclo de datos)
- [ ] API `npm run api:dev` + frontend `npm run dev`
- [ ] `VITE_USE_PATH_MOCK=false`
- [ ] `--dry-run` revisado por JP
- [ ] `--apply` autorizado explícitamente

**Datos**

- [ ] `--apply` local exit 0 · summary `exercises=6 errors=0`
- [ ] Query read-only: 6 `MicroExercise` en los 5 `nodeId` B3

**Progresión hasta B3** (bloqueador conocido)

- [ ] Cuenta dev ACTIVE (`POST /api/v1/dev/activate-semestral`)
- [ ] Completar 5 nodos B1+B2 legacy **o** marcar `UserProgress.isCompleted=true` solo en dev para esos nodos (documentar en reporte)

**E2E mínimo — 1 etapa B3 (recomendado: nodo 1)**

- [ ] `GET /me/path` → módulo B3 visible; nodo 1 `active` o `available` según progreso
- [ ] `/mi-camino` → abrir etapa 1 B3 → prepare screen con guía/criterio
- [ ] `POST /lesson-sessions` → `exercises.length === 1`
- [ ] Runner → responder MC correcta → `POST /complete` → `nodeCompleted: true`, `xpEarned: 100`
- [ ] `GET /me/path` → nodo 1 `completed`
- [ ] Re-`POST /complete` misma sesión → `alreadyProcessed: true`, sin XP duplicado

**E2E extendido (opcional mismo ciclo)**

- [ ] Nodo 5: 2 ejercicios (TAP + CHORD_SHAPE) → 2 attempts → `accuracy=1.0`
- [ ] Nodo 4: TAP 5 beats (cuerdas 5→1) parsea sin `UnsupportedExercisePanel`

**Evidencia**

- [ ] Guardar `/tmp/gmusic-tpub02-smoke/report.json` + captura runner

---

## 7. Checklist apply prod (futuro — solo con autorización JP)

**Antes**

- [ ] Smoke local PASS completo
- [ ] `--dry-run` contra **prod** `DATABASE_URL` (read-only efectivo) revisado
- [ ] Backup Supabase o snapshot documentado (fecha + id)
- [ ] Ventana: sin edición concurrente del bloque B3 en admin (riesgo G7)
- [ ] Deploy frontend/API actual en prod (sin depender de código nuevo)

**Apply**

- [ ] `--apply` prod exit 0
- [ ] Verificar `GET /me/path` prod: B3 nodos siguen PUBLISHED (misma estructura 1A)

**Smoke prod**

- [ ] Cuenta `qa-alumno-prod-001@gmusic.test` (o QA con progreso B1/B2 si aplica)
- [ ] Misma secuencia E2E mínima §6 en `proyectogmusic.vercel.app`
- [ ] Reporte en `docs/operations/` o handoff sesión

**Después**

- [ ] Actualizar `T-PUB-02-mini-brief.md` § Historial con fecha apply prod
- [ ] **No** push automático — preguntar a JP

---

## 8. Rollback y mitigación

### 8.1 Si `--dry-run` falla

- Sin impacto en BD.
- Corregir títulos/`stageType` en admin o ajustar spec; no ejecutar `--apply`.

### 8.2 Si `--apply` falla a mitad

- Transacción recomendada en implementación: **una transacción Prisma** para los 6 upserts (todo o nada).
- Si no hay transacción y falla parcial: re-run `--apply` es idempotente para órdenes pendientes.

### 8.3 Rollback manual (post-apply incorrecto)

**Scope:** solo ejercicios creados/actualizados por este script en los 5 nodos B3.

1. Resolver los 5 `nodeId` con el mismo lookup §2.
2. Eliminar ejercicios por orden definido en spec:

```sql
-- Ejemplo: reemplazar <nodeId_N> por UUIDs resueltos en dry-run
DELETE FROM "MicroExercise"
WHERE "nodeId" IN (<nodeId_1>, ..., <nodeId_5>)
  AND "order" IN (1, 2);
```

- Nodo 5 es el único con `order=2`; nodos 1–4 solo `order=1`.
- **No** borrar nodos `PathNode` ni módulo.
- **No** tocar B1/B2.

3. Sesiones `LessonSession` COMPLETED con attempts a ejercicios borrados: dejar histórico (no cascada a progress). Si hace falta re-probar, alumno inicia **nueva** sesión.

4. Si `UserProgress` quedó `isCompleted` por smoke: reset manual solo en cuenta QA:

```sql
UPDATE "UserProgress" SET "isCompleted" = false, "completedAt" = NULL
WHERE "userId" = '<qa-user-id>' AND "nodeId" IN (<b3-node-ids>);
```

### 8.4 Audio CDN

- Piloto usa `CHORD_SHAPE` en nodo 5 `order=2` (sin audio).
- `EAR_TRAINING` queda diferido hasta validar CDN en smoke futuro.

---

## 9. Implementación del script (referencia para Cursor — no ejecutar aún)

Estructura mínima:

```text
scripts/ops/seed-b3-microexercises.mjs
  parseArgs()
  resolveCourse(slug)
  resolveModule(courseId, title)
  resolveNodes(moduleId, NODE_SPECS[])
  for each exercise in EXERCISE_CATALOG:
    upsert or log (dry-run)
  printSummary()
```

Constantes en archivo:

- `COURSE_SLUG`
- `MODULE_TITLE`
- `NODE_SPECS[]` — `{ stageType, title, exercises[] }` copiados de §4

**Tests:** no obligatorios en Fase 2A datos; validación = dry-run + smoke. Opcional: test unitario del parser de args.

---

## 10. Criterio done Fase 2A (futuro)

| # | Criterio |
|---|----------|
| 1 | Script implementado + `--dry-run` OK local y prod |
| 2 | JP autoriza `--apply` |
| 3 | 6 MicroExercise en B3 · smoke E2E nodo 1 PASS |
| 4 | `POST /complete` → progreso + XP sin duplicados |
| 5 | Evidencia documentada · sin regresión T-PUB-01 visibilidad |

---

## Historial

| Fecha | Evento |
|-------|--------|
| 8 Jul 2026 | Spec redactado · pendiente OK JP copy §4 |
| 8 Jul 2026 | JP: corregir Am `X-0-2-2-1-0`; ej. 4 cuerdas 5→1; validar audio |
| 8 Jul 2026 | §4 corregido; CDN audio **no resuelve** → ej. 6 = `CHORD_SHAPE` piloto |
| 8 Jul 2026 | Implementación y apply — **no autorizados** |
