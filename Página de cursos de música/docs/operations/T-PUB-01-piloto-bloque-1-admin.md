# T-PUB-01 Fase 1A — Piloto smoke Bloque 1 (admin → alumno)

**Ticket:** T-PUB-01 — Piloto Publicación  
**Fase:** 1A · smoke pipeline real · **sin código**  
**Prerequisito:** Fase 0 inventario (`T-PUB-01-fase0-inventario.md`) · T-API-01 cerrado  
**Compañero Fase 1:** 1B — quitar fallback mock silencioso en path vacío (plan separado)  
**Estado 1A:** ✅ **PASS local + prod** · 8 Jul 2026 · piloto **B3** (JP)

---

## Objetivo

Validar el pipeline **real** de publicación:

```
admin crea/edita bloque DRAFT
→ edita 5 etapas
→ publish PUBLISHED
→ alumno lo ve en GET /me/path
→ alumno lo ve en /mi-camino
```

**Alcance explícito:** visibilidad y publicación del bloque. **No** valida practicabilidad completa (MicroExercise / lesson runner) — eso requiere decisión D-GOV posterior (Fase 1D).

---

## Pre-requisitos smoke

| Check | Valor esperado |
|-------|----------------|
| `VITE_USE_PATH_MOCK` | `false` (o unset) |
| API | `npm run api:dev` o preview apuntando a API con DB |
| Frontend | `npm run dev` |
| Admin | Usuario `Role.ADMIN` |
| Alumno | Usuario suscripción **ACTIVE** (ej. `carlos@gmusic.academy`) |
| Curso | `ruta-guitarra-12-meses` (hardcoded admin + path) |

---

## Paso 0 — Inventario biblioteca admin (completado 8 Jul 2026)

Fuente: `listAdminModules('ruta-guitarra-12-meses')` · read-only Prisma (equivalente a tabla **Bloques** en `/admin`).  
Inventario UI admin pendiente captura visual (login local post-rotación).

| Label | Título | Estado | Etapas completas | Observación |
|-------|--------|--------|------------------|-------------|
| **B1** | Fundamentos | PUBLISHED | 1/5 | **Legacy seed** — ruido conocido. No tocar en 1A. |
| **B2** | Acordes abiertos | PUBLISHED | 0/5 | **Legacy seed** — ruido conocido. No tocar en 1A. |
| **B3** | **Tu primer acorde: La menor** | PUBLISHED | **5/5** | **Bloque 1 pedagógico D-GOV-04** (piloto 1A). **0 MicroExercise**. |

**Decisión JP (8 Jul 2026):** usar **B3** como fila del smoke 1A.

- Aunque `module.order === 3`, pedagógicamente es **Bloque 1** (`Tu primer acorde: La menor`).
- **No limpiar B1/B2** antes del smoke — deuda/ruido de datos documentado, no intervención en 1A.
- B3 ya está **PUBLISHED** → Paso 1 del smoke = **confirmar** (no crear ni re-publicar).

**Gap conocido (no falla 1A):** B3 visible en path pero **no practicable E2E** hasta Fase futura con MicroExercise.

---

## Paso 1 — Admin: crear o confirmar bloque

**1A (8 Jul 2026):** bloque ya existe como **B3** · `PUBLISHED` · 5/5 etapas. **Skip crear/editar/publish.**

Referencia pedagógica (ya cargada en B3):

1. ~~Login `/admin`~~
2. ~~**Crear bloque**~~ → **B3 confirmado**
3. **5 etapas** (presentes en BD):

| # | Etapa | Título visible | Criterio de completado |
|---|--------|----------------|------------------------|
| 1 | Fundamento uno | Qué es un acorde y por qué Am es la puerta | El alumno puede explicar con sus palabras qué es un acorde |
| 2 | Fundamento dos | Diagrama de Am: dedos, trastes, cuerdas | Identifica dedos y trastes del diagrama Am |
| 3 | Técnica | Presión limpia sin trasteo | Cada cuerda suena clara al pulsar el acorde |
| 4 | Práctica | Armar el acorde por cuerdas | Arma Am 3 veces seguidas sin ayuda visual |
| 5 | Tocar | Am al pulso | Am suena limpio 4 tiempos al pulso |

4. ~~**Publicar bloque**~~ — ya `PUBLISHED`

**Fuente pedagógica:** `docs/product/mapa-bloques-nivel-1.md` · Bloque 1

---

## Paso 2 — Verificar API (pipeline real)

### Local (Carlos · `activate-semestral` · 8 Jul 2026)

**Pass 1A-API local:**

- [x] `modules` contiene bloque `Tu primer acorde: La menor`
- [x] `nodesTotal === 5`
- [x] Cada nodo tiene `title` no vacío
- [x] `stageType`: FUNDAMENTO_UNO → FUNDAMENTO_DOS → TECNICA → PRACTICA → TOCAR
- [x] **No** es respuesta mock (`course.id` = UUID real, ≠ `mock-course`)
- [x] `exercises` por nodo B3: **0** (gap futuro; no falla 1A)

### Producción (QA suscriptor ACTIVE · `qa-alumno-prod-001@gmusic.test` · 8 Jul 2026)

Entorno: `https://proyectogmusic.vercel.app` → API Render · Supabase prod · deploy Vercel `53e9309`.

**Pass 1A-API prod:**

- [x] `GET /me/path?courseSlug=ruta-guitarra-12-meses` incluye `Tu primer acorde: La menor`
- [x] Módulo index **3** · `nodesTotal === 5`
- [x] Títulos no vacíos en las 5 etapas
- [x] `stageType` en orden: FUNDAMENTO_UNO → FUNDAMENTO_DOS → TECNICA → PRACTICA → TOCAR
- [x] `course.id` = `d0164f24-079e-4521-b825-460e60ca9024` (real, ≠ `mock-course`)
- [x] B3 nodos en `locked` (QA sin progreso previo; activo en B1 «Tu guitarra y postura») — **esperado**
- [x] B3 `exercises`: **0** — gap futuro; **no falla 1A**

**Snippet evidencia prod** (`GET /me/path` — IDs redactables en handoff externo):

```json
{
  "course": { "id": "d0164f24-079e-4521-b825-460e60ca9024", "slug": "ruta-guitarra-12-meses" },
  "modules": [
    { "index": 1, "title": "Fundamentos", "nodesTotal": 3 },
    { "index": 2, "title": "Acordes abiertos", "nodesTotal": 2 },
    {
      "index": 3,
      "title": "Tu primer acorde: La menor",
      "nodesTotal": 5,
      "nodes": [
        { "title": "Qué es un acorde y por qué Am es la puerta", "stageType": "FUNDAMENTO_UNO", "status": "locked" },
        { "title": "Diagrama de Am: dedos, trastes, cuerdas", "stageType": "FUNDAMENTO_DOS", "status": "locked" },
        { "title": "Presión limpia sin trasteo", "stageType": "TECNICA", "status": "locked" },
        { "title": "Armar el acorde por cuerdas", "stageType": "PRACTICA", "status": "locked" },
        { "title": "Am al pulso", "stageType": "TOCAR", "status": "locked" }
      ]
    }
  ],
  "activeNodeId": "<nodo B1 Tu guitarra y postura>"
}
```

**Snippet evidencia local** (misma estructura; ver `/tmp/gmusic-tpub01-smoke/me-path.json`):

---

## Paso 3 — Verificar UI alumno

### Local (Carlos ACTIVE · 8 Jul 2026)

- [x] Path real en `/mi-camino` (3 módulos; carrusel en nodo activo legacy B2)
- [x] B3 en `GET /me/path`
- [x] Sin mock
- [x] Lección/prepare abre en nodo activo

### Producción (QA ACTIVE · 8 Jul 2026)

- [x] Login → `/mi-camino` carga path real (0/10 etapas · foco B1 «Tu guitarra y postura»)
- [x] Sin mock ni empty-state falso (1B en remoto `dad28a9`)
- [x] B3 verificado en API; UI carrusel en nodo activo B1 (B3 `locked` por progreso — esperado)
- [x] Captura: `/tmp/gmusic-tpub01-prod/mi-camino-prod.png`

**Nota UI (local y prod):** el carrusel enfoca el **nodo activo** del alumno. B3 es módulo 3 en API; nodos `locked` hasta completar B1/B2 legacy — comportamiento esperado del motor de progresión.

**Fuera de criterio 1A:** completar lección / runner — **0 MicroExercise en B3** (no falla 1A).

---

## Paso 4 — Evidencia

| Artefacto | Ubicación |
|-----------|-----------|
| Inventario Paso 0 | Este doc §Paso 0 |
| API local `GET /me/path` | `/tmp/gmusic-tpub01-smoke/me-path.json` |
| Reporte smoke local | `/tmp/gmusic-tpub01-smoke/report.json` |
| Captura `/mi-camino` local | `/tmp/gmusic-tpub01-smoke/01-mi-camino.png` |
| API prod `GET /me/path` | `/tmp/gmusic-tpub01-prod/me-path.json` |
| Reporte smoke prod | `/tmp/gmusic-tpub01-prod/report.json` |
| Captura `/mi-camino` prod | `/tmp/gmusic-tpub01-prod/mi-camino-prod.png` |
| Captura admin biblioteca | ⬜ pendiente (login admin post-rotación) |

---

## Criterio done Fase 1A

| # | Criterio | Local | Prod |
|---|----------|-------|------|
| 1 | Bloque piloto **B3** publicado | ✅ | ✅ (en path API) |
| 2 | `GET /me/path` bloque + 5 nodos reales | ✅ | ✅ |
| 3 | `/mi-camino` path real alumno ACTIVE | ✅ | ✅ |
| 4 | Sin mock silencioso | ✅ | ✅ (1B `dad28a9`) |
| 5 | Inventario biblioteca (Paso 0) | ✅ | ✅ (API; UI admin pendiente captura) |

**Veredicto final:**

- ✅ **T-PUB-01 Fase 1A local PASS**
- ✅ **T-PUB-01 Fase 1A prod PASS**
- ✅ Pipeline **publish → alumno** validado para **visibilidad**
- ⚠️ **Jugabilidad** bloque admin pendiente — B3 con **0 MicroExercise**

### Legacy / ruido conocido (no tocado en 1A)

| Label | Título | Estado | Slots admin | En path alumno |
|-------|--------|--------|-------------|----------------|
| B1 | Fundamentos | PUBLISHED | 1/5 | 3 nodos |
| B2 | Acordes abiertos | PUBLISHED | 0/5 | 2 nodos |
| B3 | Tu primer acorde: La menor | PUBLISHED | 5/5 | 5 nodos · piloto |

### Gap B3 (no falla 1A)

Bloques admin **publicados y visibles** pero B3 **no practicable E2E** hasta MicroExercise (fase futura).

### Recomendación — siguiente fase (post-cierre 1A)

1. **Decisión JP:** MicroExercise para B3 (hacer bloque piloto jugable) **vs** limpieza B1/B2 legacy (deuda datos).
2. **No mezclar** con admin password reset (ticket propio · working tree congelado).
3. **T-UX-LESSON-01** 01B/01C/01E siguen congelados hasta decisión explícita.

---

## Si algo falla

| Síntoma | Revisar |
|---------|---------|
| 401/403 admin | Rol ADMIN, cookie, API local |
| Publish 400 | 5 etapas con título + criterio cada una |
| Path vacío en API pero UI muestra mock | **1B cerrada** (`dad28a9`) — fallback silencioso eliminado |
| Path vacío en API y UI vacía | Nada publicado o curso slug incorrecto |
| Bloque no en path | `PublishStatus`, enrollment ACTIVE, slug `ruta-guitarra-12-meses` |
| Runner vacío | Esperado sin MicroExercise — no bloquea 1A |

---

## Relación con docs previos

- Contenido pedagógico: hereda `docs/operations/piloto-bloque-1-admin.md` (2 Jul 2026)
- Inventario técnico: `docs/operations/T-PUB-01-fase0-inventario.md`
- Tras 1B: path vacío real muestra copy “Tu camino todavía no tiene módulos publicados…” (`GmusicPath.tsx`)

---

*Fase 1A · smoke PASS local + prod · 8 Jul 2026 · piloto B3 · JP · sin commit doc*
