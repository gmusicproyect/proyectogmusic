# T-PUB-01 — Cierre PROD · Pipeline publicación admin → alumno

**Fecha cierre:** 4 Ago 2026  
**Entorno:** prod — `proyectogmusic.vercel.app` → Render `gmusic-api` → Supabase prod  
**Modo:** B (pipeline completo publish hoy)  
**Smoke Juan:** OK 4 Ago 2026  
**Veredicto:** **CERRADO 6/6**

---

## Criterio binario

| # | Ítem | Evidencia |
|---|------|-----------|
| 1 | Course `ruta-guitarra-12-meses` **PUBLISHED** | `courseId` `d0164f24-079e-4521-b825-460e60ca9024` |
| 2 | ≥1 Module · 5 PathNode **PUBLISHED** (D-F5-001) | B4 «Mi menor» · `moduleId` `6b36c6ea-db8e-4c0b-addd-e31abdca6290` · 5 nodes abajo |
| 3 | Pipeline Admin → API → Postgres → `GET /me/path` | Sin mock · JSON antes/después en `.agents/operations/t-pub-01-prod-evidence/` |
| 4 | Alumno **carlos@gmusic.academy** ACTIVE ve bloque en `/mi-camino` | OK smoke Juan 4 Ago 2026 — «Mi menor» listado |
| 5 | Guards | Publish con admin prod (sesión Juan + credencial rotada); DRAFT invisible (path 3→4 módulos); anónimo **401** |
| 6 | Doc evidencia + PROJECT_STATUS **6/6** | Este archivo |

**SHOULD T1 (fuera 6/6):** PDF placeholder slot 1 · ruta `admin/b4/slot-1/pilot-fundamento-1.pdf` · evidencia `should-t1-upload.json`

---

## Contenido publicado

**Bloque mapa Nivel 1 · Bloque 2** — catálogo posición **B4** «Mi menor» (Em).  
No duplica B3 «Tu primer acorde: La menor» (Am · Bloque 1).

| Order | pathNodeId | Título |
|------:|------------|--------|
| 1 | `20324e6f-11cb-4d27-ae6e-dcdf7e2fdadf` | Por qué Em: el acorde de dos dedos |
| 2 | `a03cb051-de4a-4e09-91c9-db5a28cae39e` | Diagrama de Em y relación visual con Am |
| 3 | `135068c2-1ba8-407c-8221-146cc6ff0125` | Dos dedos precisos — limpieza de las cuerdas al aire |
| 4 | `a4025b37-515e-472e-801a-57471e05df2c` | Alternar Am / Em lento, sin metrónomo |
| 5 | `196c9917-df87-4629-8bcb-d7d0d059b394` | Em limpio al pulso + reconocer ambos acordes |

---

## Antes / después publish (extra evidencia)

| Momento | Módulos en `GET /me/path` |
|---------|---------------------------|
| **Antes** | Fundamentos · Acordes abiertos · Tu primer acorde: La menor (**3**) |
| **Después** | + **Mi menor** (**4**) |

DRAFT del nuevo módulo: **no** visible en path de carlos pre-publish.

---

## Artefactos

| Archivo | Contenido |
|---------|-----------|
| `.agents/operations/t-pub-01-prod-evidence/report.json` | Steps PASS pipeline |
| `me-path-before-publish.json` / `me-path-after-publish.json` | API alumno |
| `should-t1-upload.json` | Upload PDF T1 |
| `scripts/ops/t-pub-01-prod-cierre.mjs` | Runner ops (no producto) |

---

## Relación tickets previos

| Ticket | Relación |
|--------|----------|
| **D-TPUB-01 DONE LOCAL** (Jul 2026) | Pipeline validado local; este cierre = **prod** |
| **T1 Storage** | SHOULD upload vía `/admin` · convención `admin/b{n}/slot-{n}/` |
| **T-PUB-02** | MicroExercise · practicabilidad E2E — **siguiente** |

---

## Ops pendiente (no bloquea cierre)

- Configurar **`ADMIN_PASSWORD_RESET_KEY`** en Render (UI reset; hoy fallback `rotate-admin-password.mjs` usado 4 Ago 2026 por 503).
- Regla: subidas **solo** por `/admin`, no dashboard Supabase manual.

---

*Fin T-PUB-01 prod · 4 Ago 2026 · OK smoke Juan · 6/6*
