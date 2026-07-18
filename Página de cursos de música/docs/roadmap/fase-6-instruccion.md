# Instrucción Fase 6 — Mi Camino / Ruta de Aprendizaje

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de producto/docs — **no** es el documento `06` final ni autorización de código, DB, migraciones, prod o lección runner.  
> **Duración poster Fase 6:** ~1–2 semanas (docs de feature +, solo tras OK, gaps MUST del path alumno).  
> **Estado de esta instrucción:** **TERMINADA** (**D-F6-001**, 2026-07-15) · ~~D-F6-WIP~~ supersedido · F7 **NO**.  
> **Entregable:** `docs/features/06-mi-camino.md` — **creado** (mandato Juan: SOLO DOCUMENTAL, 2026-07-15).  
> **Prerreqs cerrados:** D-F1…D-F5-001 · **T-PUB-01 DONE LOCAL** (**D-TPUB-01**).  
> **SHA referencia auditoría:** `e5b161c` · rama `main`.  
> **Restricciones vigentes:** sin código · sin DB · sin F7 · sin T-UX implementación · sin commit/push.

---

## Propósito de esta instrucción

Esta instrucción es el **contrato de trabajo** para, cuando Juan autorice ejecución, producir el documento de feature:

`docs/features/06-mi-camino.md`

y acotar (sin ampliar MVP) qué falta en **Mi Camino suscriptor** para el happy path: ruta, niveles/bloques, secuencia, desbloqueo, “dónde estoy”, siguiente lección.

| Es | No es |
|----|--------|
| Guía profunda para auditar `/mi-camino` + `GET /me/path` + estados nodos + UI path | Autorización a implementar ahora |
| Matriz existe / parcial / gap anclada a MVP + realidad post **D-TPUB-01** | Reabrir T-PUB-01 salvo gap verificable nuevo |
| Plantilla exacta que `06-*` debe rellenar en la **ejecución** | Crear `06-mi-camino.md` en esta pasada |
| Puente F5 (materia publicada) → UX/flujo alumno en la ruta | Fase 7 Mi Progreso · 8 Comunidad · 9 Pagos |
| Frontera clara con **T-UX-LESSON-01** (consumo lección) | Inventar mapa greenfield / Track B / currículo 6–75 |

**Regla de oro:** el **path suscriptor ya existe** en Track A (`GmusicPath`, API, desbloqueo secuencial, empty state). Fase 6 **no inventa Mi Camino desde cero**. Documenta la verdad del repo, cierra gaps MUST de **orientación en la ruta** (dónde estoy / siguiente / secuencia usable con datos PUBLISHED), declara BRIDGE/WON'T, y **no** reabre el MVP congelado (**D-F1-001**) ni el piloto T-PUB (**D-TPUB-01**) sin gap real.

### Qué NO es Fase 6

- Fase 5 — Academia/Cursos / Admin publish / T-PUB (cerrados docs + DONE LOCAL).  
- Fase 7 — Mi Progreso página (`T-MVP-PROGRESS`).  
- Fase 8 — Comunidad feed launch.  
- Fase 9 — Stripe / Mercado Pago UI.  
- Re-ejecutar T-PUB-01 “por costumbre” o contra prod.  
- Track B · Next.js · Sanity · CourseLit · AlphaTab.  
- Currículo 6–75 completo jugable.  
- Rediseño visual atraído por gusto (serpiente vs carrusel, VFX) **sin** mandato Juan.  
- Commit / push autónomo · migraciones no autorizadas · seeds/prod DB.

---

## Prerrequisitos

| # | Prerrequisito | Estado (al escribir esta instrucción) |
|---|---------------|----------------------------------------|
| 1 | **D-F1-001** — MVP Track A congelado | ✅ |
| 2 | **D-F2-001** — arquitectura / modelo | ✅ |
| 3 | **D-F3-001** — entorno `03` | ✅ |
| 4 | **D-F4-001** — Auth `04` | ✅ |
| 5 | **D-F5-001** — Academia/Cursos `05` canónico | ✅ |
| 6 | **D-TPUB-01** — T-PUB-01 **DONE LOCAL** | ✅ evidencia `t-pub-01-evidencia-local.md` |
| 7 | DoD permanente `docs/quality/definition-of-done.md` | ✅ |
| 8 | Esta instrucción leída como método | ✅ (brief) |
| 9 | **OK Juan para iniciar ejecución Fase 6** | ✅ **OK** — solo documental (2026-07-15) |
| 10 | Firma Juan §14 del `06` → **D-F6-001** | ❌ **pendiente** |

Ejecución docs **en curso / entregada**; cierre formal de fase = fila 10.

---

## Objetivo de la Fase 6 (roadmap 10 fases)

Del diagrama (**roadmap-general** · Fase **6 — MI CAMINO**):

> Path alumno: nodos, lecciones, práctica → camino demo + suscriptor **sólidos**.

Traducción operativa MVP Track A (sin inflar alcance):

```text
  Materia PUBLISHED (F5 · T-PUB DONE LOCAL)
              │
              ▼
        GET /me/path  ──►  estados: locked | available | active | completed
              │
              ▼
     /mi-camino (GmusicPath)
              │
     ┌────────┴────────┐
     ▼                 ▼
  Dónde estoy     Siguiente lección
  (activeNode)    (CTA nodo active/available)
     │                 │
     └────────┬────────┘
              ▼
     Secuencia + desbloqueo
     (completar N → desbloquea N+1)
              │
              ▼  [frontera]
     Abrir / consumir lección
     (lesson-sessions · PathLessonRunner)
         │
         └──► T-UX-LESSON-01 (ver § frontera)
```

Entregables de **ejecución** (docs-only 2026-07-15):

| Entregable | Rol |
|------------|-----|
| **`docs/features/06-mi-camino.md`** | Canónico Mi Camino Track A — **v1.0** (**D-F6-001**) |
| Gaps MUST path (solo si mandato los incluye) | Orientación ruta / siguiente / secuencia — código OUT este mandato |
| Tickets derivados | Solo gaps verificables — documentados en `06` |
| Control roadmap | `etapa-actual` · `changelog` · `PROJECT_STATUS` · **D-F6-001** (~~D-F6-WIP~~ supersedido) |

**Pasada brief (histórico):** instrucción + supervisor + “brief listo · ejecución NO”.  
**Pasada ejecución docs (histórico):** `06` + informe + **D-F6-WIP** → firma §14.  
**Estado vigente:** F6 **TERMINADA** (**D-F6-001**, 2026-07-15).

---

## Diferencia F5 vs F6 (obligatoria)

| | **Fase 5 — Academia / Cursos** | **Fase 6 — Mi Camino** |
|--|--------------------------------|-------------------------|
| Pregunta | ¿Hay catálogo publicable y el alumno **ve** materia PUBLISHED? | ¿El alumno **entiende y navega** su ruta: niveles, secuencia, desbloqueo, dónde está, siguiente? |
| Actor principal | Admin R-008 + pipeline publish | Alumno ACTIVE en `/mi-camino` |
| Entregable docs | `05-academia-cursos.md` ✅ | `06-mi-camino.md` (**v1.0 · D-F6-001**) |
| Ticket núcleo | T-PUB-01 → **DONE LOCAL** | Gaps path UX/flujo (+ frontera T-UX) |
| Frase canónica | *F5 asegura materia PUBLISHED visible* | *F6 asegura la ruta alumno usable y orientada* |

**Nota vs `05` §12:** el `05` describe F6 como “UX completa (serpiente, VFX…)” de forma **aspiracional**. En este brief **no** es MUST: F6 = orientación/secuencia usable sobre path **ya existente** (carrusel/API). Rediseño serpiente/VFX = **OUT** salvo mandato Juan (humano-en-el-loop). Gana este contrato + MVP §6–§7 frente al wording laxo del `05`.

No reabrir F5 bajo etiqueta “path”. No meter Admin publish en F6 salvo gap nuevo que **bloquea** visibilidad (entonces ticket ops/T-PUB derivado — no “rehacer T-PUB-01”).

---

## Dependencia T-PUB-01 DONE LOCAL

| Hecho (D-TPUB-01) | Implicación F6 |
|-------------------|----------------|
| Course `ruta-guitarra-12-meses` PUBLISHED (local) | Contrato de datos para path existe en local |
| Module N=1 Admin + 5 PathNode PUBLISHED | Secuencia de 5 etapas usable en API |
| Alumno ACTIVE ve bloque en `GET /me/path` | Empty state **no** es el happy path local del piloto |
| Evidencia API canónica | F6 puede asumir pipeline **local** validado |
| **No** prod · **no** launch staging | F6 **no** declara launch; prod sigue mandato aparte |
| **R-OPS-MIGRATE-UUID** · **T-PUB-01-UI** | Deuda ops/UI — **no** bloquean brief; no “arreglo F6” sin OK |

**Política:** no reabrir T-PUB-01 salvo gap verificable nuevo (p. ej. `/me/path` deja de devolver módulos PUBLISHED). Screenshot FE = **T-PUB-01-UI** opcional, no criterio de re-apertura.

---

## Entradas (fuentes de verdad)

Leer en este orden. Extraer solo lo indicado. **No** inventar endpoints ni estados.

| Path | Qué extraer |
|------|-------------|
| `docs/product/01-mvp-gmusic.md` | Mi Camino MUST §6–§7; happy path “siguiente lección”; T-UX-LESSON; T-PUB |
| `docs/roadmap/decisiones.md` | D-F1…D-F5-001 · **D-TPUB-01** |
| `docs/quality/definition-of-done.md` | Checklist al cerrar ejecución |
| `docs/features/05-academia-cursos.md` | Visibilidad path · frontera F6 · umbral usable |
| `docs/roadmap/t-pub-01-evidencia-local.md` | IDs piloto · moduleCount · sin screenshot FE |
| `docs/architecture/02-modelo-datos.md` | Course→Module→PathNode · UserProgress · LessonSession |
| `docs/architecture/02-arquitectura-sistema.md` | Zona alumno path · siguiente |
| `docs/roadmap/backlog.md` | T-UX-LESSON-01 · R-OPS-MIGRATE-UUID · T-PUB-01-UI |
| `server/lib/nodeStatus.ts` | Reglas locked/available/active/completed |
| `server/services/meService.ts` | `buildPathResponse` · `activeNodeId` |
| `server/services/coursePath.ts` | Filtros PUBLISHED |
| `server/routes/me.ts` | `GET /me/path` |
| `server/routes/lessonSessions.ts` | Frontera consumo |
| `src/app/pages/GmusicPath.tsx` | Orquestador UI |
| `src/app/components/gmusic/path/*` | Runner, shell, map pieces |
| `src/app/components/gmusic/PathCarouselCards.tsx` | UI actual carrusel suscriptor |
| `src/app/utils/student-zone-routing.ts` | URL `/mi-camino` |
| Skill `gmusic-path` · `gmusic-learning-engine` · `gmusic-game-progression-architecture` | Dominio — no rediseñar sin mandato |

**Conflicto docs vs código:** gana código + tests + MVP. Ejemplo: skill `gmusic-path` menciona mapa serpenteante; UI suscriptor actual orquesta **carrusel** (`PathCarouselCards`) — el `06` debe citar la verdad.

---

## Evidencia de auditoría (snapshot 2026-07-15 · HEAD `e5b161c`)

Revalidar al **ejecutar**. Snapshot de este brief:

### Routing / zona alumno

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| URL `/mi-camino` | `student-zone-routing` → page `mi-camino` | **existe** |
| Guard D-017 | `StudentZoneGuard` + Subscription ACTIVE | **existe** (F4) |
| Demo `/mi-camino-demo` | Funnel; datos TS / localStorage | **existe** (≠ path suscriptor) |

### API / dominio path

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| `GET /me/path` | `me.ts` + `buildPathResponse` | **existe** |
| Modules/nodes PUBLISHED only | `loadPublishedCoursePath` | **existe** |
| `activeNodeId` | Primer incompleto desbloqueado | **existe** |
| Status nodos | `deriveNodeStatuses` — completed / locked / active / available | **existe** |
| Progress → desbloqueo | `UserProgress.isCompleted` alimenta statuses | **existe** |
| Empty path | `moduleCount` 0 → empty UI | **existe** |
| Lesson sessions | start/complete; rechaza locked | **existe** (consumo = frontera T-UX) |
| Piloto T-PUB local | moduleCount ≥1; bloque Admin visible | **DONE LOCAL** (dato) |

### UI Mi Camino

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| `GmusicPath` | `usePath` → viewModel · carousel · runner | **existe** |
| Loading / error / empty / complete | Banner · “Cargando…” · empty copy · `CompletedPathPanel` | **existe** |
| Progress rail | `DemoPathLevelBar` (completed/total) | **existe** |
| Foco “dónde estoy” | `resolveCarouselFocusIndex` + `activeNodeId` | **parcial** (UX; no screenshot piloto) |
| CTA inicio lección | `canStartLessonFromNode` + `handleStartNode` | **existe** |
| `PathLessonRunner` | Overlay consumo sesión | **parcial** vs umbral T-UX |
| Serpentine map | `SerpentinePathMap.tsx` en árbol | **parcial / legacy?** — UI principal actual = carrusel |
| Badge course | `meService` hardcode instrument/level strings | **parcial** (dato cosmético) |
| Screenshot FE piloto | T-PUB-01-UI | **pendiente** (opcional) |

---

## Qué entra en MVP Mi Camino (F6)

Anclado a `01-mvp` §6–§7 + realidad post **D-TPUB-01**:

### MUST (núcleo Fase 6)

| Capacidad | Notas |
|-----------|--------|
| Ruta suscriptor `/mi-camino` con datos API reales (no mock launch) | `usePath` / `GET /me/path` |
| Ver bloques/nodos **PUBLISHED** | Dependencia T-PUB satisfecha **local**; entornos launch = mandato aparte |
| Secuencia de etapas (orden Module → PathNode) | Schema + API |
| Desbloqueo secuencial (completar → abre siguiente) | `deriveNodeStatuses` |
| “Dónde estoy” visible (nodo active / foco UI) | Código parcial; documentar + cerrar gaps UX si bloquean happy path |
| “Siguiente lección” accionable desde el path | CTA en nodo active/available → sesión |
| Empty / loading / error usables | Ya en UI; DoD estados |
| Responsive happy path path | MVP §7.8 |

### SHOULD

| Capacidad | Notas |
|-----------|--------|
| Copy pedagógico de módulo/foco alineado a contenido real | Hoy strings de foco parcialmente hardcodeados en API |
| Nivel/badge coherente con Academia (Fundamento/…) | Parcial hardcode |
| Paridad clara demo vs suscriptor (sin confundir al agente) | Docs |
| Screenshot FE post-piloto (**T-PUB-01-UI**) | Opcional; no bloquea brief |

### BRIDGE

| Capacidad | Notas |
|-----------|--------|
| Course PUBLISHED vía seed/ops (sin UI Course) | Igual que F5 — no greenfield Admin Course |
| Contenido en **prod/staging** | Fuera DONE LOCAL; mandato ops separado |
| Activación Subscription | F4/F9 WhatsApp — no reabrir |

### WON'T (esta fase / MVP)

| Capacidad | Notas |
|-----------|--------|
| Página **Mi Progreso** completa | **Fase 7** |
| Comunidad / pagos / Auth redo | F8 / F9 / F4 |
| Currículo 6–75 / multi-instrumento | post-MVP / D-007 |
| Track B / CourseLit / VFX “por belleza” sin mandato | OUT |
| Reescribir pipeline Admin publish | F5 cerrado |

---

## Relación T-UX-LESSON-01 — clasificación

| Zona | Scope | Clasificación en este brief |
|------|--------|-----------------------------|
| **Mapa / ruta** — listar nodos, estados, foco, CTA “empezar”, vacío, complete | Núcleo F6 | **IN brief F6** |
| **Abrir sesión** — `POST lesson-sessions`, guard locked/completed | Contrato path↔lección | **IN brief** (documentar frontera) · código solo si Juan lo mete en mandato |
| **Consumo lección** — video-first, tabs/checklist, práctica, complete+persiste, celebración | Ticket **T-UX-LESSON-01** | **Frontera** · default **OUT ejecución F6 docs-only** y **OUT código** hasta OK Juan que lo **incluya** o abra el ticket aparte |
| **Agregados progreso** (% curso, historial, última actividad en página dedicada) | Fase 7 | **OUT** |

**Default del brief (sin mandato extra):**

1. Ejecución F6 documental → escribe `06` con matriz path + frontera T-UX explícita.  
2. **No** implementar `T-UX-LESSON-01` bajo etiqueta F6 salvo Juan diga “incluye T-UX”.  
3. Si en re-auditoría el runner **impide** complete+guarda → el `06` marca T-UX como **MUST pre-launch** (ya en MVP) y pide mandato; no inventa scope.

MVP: *“Si el runner actual impide ese consumo → T-UX-LESSON-01 es MUST pre-launch.”*  
Roadmap backlog: T-UX vive en etapa **5/6** — **no** asume inclusión automática en el primer OK de F6.

---

## Riesgos

| Riesgo | Tratamiento |
|--------|-------------|
| **R-OPS-MIGRATE-UUID** | Deuda ops local post T-PUB; **no** fix en repo sin OK Juan; no bloquea brief F6 |
| **T-PUB-01-UI** screenshot FE pendiente | Opcional; API ya validada; no reabrir T-PUB |
| Confundir DONE LOCAL con launch prod | Explicitar en `06` · sin prod sin mandato |
| Confundir F5 (publish) con F6 (ruta UX) | Tabla F5 vs F6 arriba |
| Meter F7 “siguiente lección” en página Progreso dentro de F6 | Siguiente **en el path** = F6; superficie Progreso = F7 |
| Rediseño serpiente vs carrusel por gusto | Solo con criterio Juan — humano-en-el-loop |
| Ampliar a LessonRunner “bonito” sin umbral | T-UX con mandato; umbral = completa + persiste |

---

## Matriz canónica (existe / parcial / bloquea MVP / post-MVP)

| Capacidad | Estado repo | ¿Bloquea MVP? | Política | Notas |
|-----------|-------------|---------------|----------|--------|
| URL + guard `/mi-camino` | **existe** | Si roto → **Sí** | MUST | Routing shipped |
| `GET /me/path` PUBLISHED | **existe** | Si roto → **Sí** | MUST | T-PUB local OK |
| Secuencia + desbloqueo | **existe** | Si roto → **Sí** | MUST | `nodeStatus.ts` |
| Dónde estoy (active) | **parcial** UI | Si alumno no identifica nodo → **Sí** | MUST UX | Documentar gap |
| Siguiente lección CTA | **existe** | Si no abre sesión usable → frontera T-UX | MUST path + T-UX si aplica | |
| Empty/loading/error | **existe** | No si copy claro | MUST DoD | |
| Materia local piloto | **DONE LOCAL** | Launch ≠ local | Dato | D-TPUB-01 |
| Materia prod/staging | **no verificado** aquí | **Sí** para launch | Ops / mandato | No reabrir T-PUB en brief |
| PathLessonRunner pulido | **parcial** | Si no completa+guarda → **Sí** | T-UX-LESSON-01 | Frontera |
| Mi Progreso página | **inexistente** | MUST pero **F7** | OUT F6 | |
| Demo path | **completa** funnel | No | Funnel | No confundir |

---

## Entregable: `docs/features/06-mi-camino.md`

**Creado** en ejecución docs (2026-07-15) · **hoy: v1.0 · TERMINADA (**D-F6-001**)**. Outline usado:

```markdown
# 06 — Mi Camino / Ruta de Aprendizaje (Track A)

## 0. Metadatos
Fecha · autor · versión · estado · SHA · prerreqs D-F1…D-F5-001 · D-TPUB-01

## 1. Propósito y alcance
Qué cubre · audiencia · qué NO (F5 reopen, F7–F9, Track B, rediseño gratis)

## 2. Política MVP Mi Camino
Tabla MUST / SHOULD / WON'T / BRIDGE citando 01-mvp + post T-PUB

## 3. F5 vs F6
Tabla corta + dependencia D-TPUB-01 (no reabrir)

## 4. Routing y acceso
`/mi-camino` · guards · vs `/mi-camino-demo`

## 5. Contrato API path
GET /me/path · módulos/nodos · activeNodeId · statuses · material público

## 6. Secuencia y desbloqueo
Reglas deriveNodeStatuses · complete → unlock · lesson-session guards

## 7. UX pantalla (GmusicPath)
Carrusel/map verdad del repo · foco · CTA · empty/error/loading/complete

## 8. Frontera T-UX-LESSON-01
IN path vs OUT/consumo · umbral completa+persiste · estado ticket

## 9. Matriz audit (existe/parcial/gap)
Tabla actualizada vs esta instrucción

## 10. Riesgos y deuda
R-OPS-MIGRATE-UUID · T-PUB-01-UI · prod content

## 11. Tickets derivados
Solo gaps reales — nombres + prioridad

## 12. Cómo probar
Smoke alumno ACTIVE → path → nodo active → (opcional sesión) · DoD · verify si código

## 13. Fuera de alcance
F7–F9 · Track B · currículo completo · commit autónomo

## 14. Aprobación
Casilla Juan · fecha · restricciones · ¿incluye T-UX en mandato?
```

### Tickets (nombres — **no implementar en brief**)

| ID | Rol en F6 | Prioridad |
|----|-----------|-----------|
| Gaps path UX (nombre en `06`) | Orientación / siguiente / foco | MUST si bloquea happy path |
| **T-UX-LESSON-01** | Consumo lección | MUST pre-launch **si** bloquea; **frontera** — solo con mandato |
| **T-PUB-01-UI** | Screenshot FE | Baja / opcional |
| **R-OPS-MIGRATE-UUID** | Migrate fresh local | Ops · mandato aparte |
| `T-MVP-PROGRESS` | Página progreso | **F7** — OUT |

---

## Criterios de aceptación — brief vs ejecución

### A) Criterios de **este brief** (pasada brief — 2026-07-15 · histórico)

- [x] Existe `docs/roadmap/fase-6-instruccion.md` (este archivo).  
- [x] Opcional: `docs/roadmap/fase-6-brief-supervisor.md`.  
- [x] Control brief: brief listo · ejecución NO (luego supersedido por D-F6-WIP).  
- [x] En la pasada brief: sin `06` · sin código · sin DB · sin F7 · sin commit/push.  
- [x] No reabre MVP · no reabre T-PUB salvo gap · no Track B.

### B) Criterios de **ejecución Fase 6** (docs-only 2026-07-15 + cierre)

Fase 6 documental se entrega / cierra cuando:

- [x] Existe `docs/features/06-mi-camino.md` con secciones de la plantilla.  
- [x] Matriz path revalidada contra código (SHA `e5b161c`).  
- [x] F5 vs F6 + dependencia **D-TPUB-01** explícitas.  
- [x] Frontera **T-UX-LESSON-01** clasificada (**OUT** este mandato).  
- [x] Gaps MUST listados según mandato docs-only (sin código).  
- [x] DoD documentado como aplicable · verify **N/A** (sin código).  
- [x] Cero F7/F8/F9 / Track B / reopen T-PUB sin gap.  
- [x] Juan marca aprobado §14 del `06` → **D-F6-001** (2026-07-15).  
- [x] Control roadmap: **D-F6-001** · F7 **NO**.

---

## DoD aplicable

Al **ejecutar** (docs y/o código autorizado): cumplir `docs/quality/definition-of-done.md` — E2E del flujo path, datos reales API, empty/loading/error, permisos ACTIVE, responsive, docs de cómo probar, tests del área, sin romper funnel, dentro del MVP.

Launch MVP global sigue siendo §7 de `01-mvp` (incluye T-UX si aplica, Mi Progreso F7, etc.) — **F6 no finge cierre de launch**.

---

## Método — pasos cuando Juan diga OK ejecuta

1. **Releer** esta instrucción + MVP Mi Camino §6–§7 + D-TPUB-01 + `05` § frontera F6.  
2. **Re-auditar** archivos de la tabla Entradas (HEAD actual).  
3. **Crear** `docs/features/06-mi-camino.md` con plantilla §§0–14.  
4. **Confirmar con Juan** si el mandato **incluye T-UX-LESSON-01** o solo docs path.  
5. **Solo si OK en el mismo mandato:** código mínimo gaps MUST de orientación ruta (no F7, no redesign libre).  
6. **No** migraciones schema sin decisión · **no** prod DB · **no** re-piloto T-PUB sin gap · **no** F7–F9.  
7. Tests del área + `npm run verify` si hay código.  
8. Cierre control + pedir firma Juan §14 del `06`.  
9. **No** abrir Fase 7 sin OK explícito.

**Tope reintentos verify:** protocolo loop (máx 3; 4.º congela).

---

## Gate Juan (explícito)

| Pregunta | Respuesta actual (2026-07-15) |
|----------|-------------------------------|
| ¿Brief F6 listo? | **Sí** |
| ¿Autorizo **ejecución** Fase 6? | **Sí** — SOLO DOCUMENTAL |
| ¿Solo docs (`06`) o también código path? | **Solo docs** |
| ¿Incluye **T-UX-LESSON-01** en el mismo mandato? | **No** |
| ¿Tocar prod / staging contenido? | **No** |
| ¿Abrir Fase 7? | **No** |
| ¿Commit/push? | **No** |
| ¿Firma §14 / D-F6-001? | **Sí** — **D-F6-001** (2026-07-15) |

Cierre formal F6 = **D-F6-001** aplicado. F7 **NO INICIADA**.

---

## Preguntas mínimas a Juan (cierre)

1. ¿Aprueba §14 del `06` como canónico Mi Camino Track A? (`D-F6-001`)  
2. ¿Algún gap path debe pasar a mandato de **código** después? (default: no en esta firma)  
3. ¿Mandato **T-PUB-01-UI** o **R-OPS-MIGRATE-UUID**? (default: no en F6)

No preguntar Stripe, Track B, currículo 6–75, ni descongelar MVP.

---

## Relación con otras fases / T-*

| Ítem | Relación |
|------|----------|
| F1–F5 | Prerreqs cerrados |
| **D-TPUB-01** | Dependencia contenido local — no reabrir |
| **Fase 6** | **TERMINADA** docs · **D-F6-001** · F7 **NO** |
| Fase 7–9 | **Fuera** |
| T-UX-LESSON-01 | Frontera — ver § |
| R-OPS-MIGRATE-UUID / T-PUB-01-UI | Deuda aparte |
| DoD | Aplica a ejecución |
| Skills | `gmusic-agent-workflow` · `gmusic-verification` · `gmusic-path` · `gmusic-learning-engine` · `gmusic-game-progression-architecture` |

---

## Estado post-ejecución docs (2026-07-15)

### Hecho

- F1–F5 cerradas (docs) · T-PUB-01 **DONE LOCAL**.  
- Brief + instrucción Fase 6 · revisión coherencia **coherente**.  
- **`06-mi-camino.md`** v1.0 · informe supervisor · **D-F6-001**.  
- Control: F6 **TERMINADA** · F7 **NO** · sin código · sin DB · sin commit en cierre.

### Pendiente (fuera de F6)

OK Juan explícito para brief/ejecución **Fase 7** u otros tickets (T-UX, ops, commit anti-demo). No abrir F7 sin mandato.

---

*Fin de la instrucción. Fase 6 **TERMINADA** (**D-F6-001**). F7 **NO**. Sin código · sin DB · sin commit/push en cierre F6.*
