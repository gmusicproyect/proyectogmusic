# 06 — Mi Camino / Ruta de Aprendizaje (Track A)

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-15 |
| **Autor** | Cursor (ejecutor) · supervisión Juan |
| **Versión** | 1.0 (canónico · firmado) |
| **Estado** | **TERMINADA / APROBADA** — **D-F6-001** (2026-07-15) · fase documental |
| **SHA ref. auditoría** | `e5b161c` · rama `main` · anti-demo verificado local (uncommitted) |
| **Prerreqs** | **D-F1-001** · **D-F2-001** · **D-F3-001** · **D-F4-001** · **D-F5-001** · **D-TPUB-01** · **D-F6-ANTI-DEMO-001** · DoD `docs/quality/definition-of-done.md` |
| **Política producto** | **D-ROAD-005** · **D-017** ACTIVE · MVP §6–§7 Mi Camino |
| **Instrucción** | `docs/roadmap/fase-6-instruccion.md` · revisión `fase-6-revision-coherencia.md` (**coherente**) |
| **Dependencia contenido** | **T-PUB-01 DONE LOCAL** (**D-TPUB-01**) · evidencia `docs/roadmap/t-pub-01-evidencia-local.md` · **no** prod/launch |
| **Evidencia anti-demo** | **T-F6-ANTI-DEMO-01 CERRADO** (**D-F6-ANTI-DEMO-001**) · auditoría `coherente` · `docs/roadmap/t-f6-anti-demo-01-auditoria-final.md` |
| **Decisión** | **D-F6-001** (firmado Juan §14, 2026-07-15) · ~~D-F6-WIP~~ supersedido |
| **Mandato ejecución** | Juan: Fase 6 **SOLO DOCUMENTAL** · sin código · sin DB · sin F7 · sin commit/push · T-UX default OUT |

---

## 1. Propósito y alcance

Documento **canónico** de **Mi Camino** Track A (Vite + React + Express + Prisma) para el MVP congelado. Describe la ruta del alumno suscriptor: orientación, secuencia, desbloqueo, “dónde estoy” y “siguiente lección” — **sin** inventar el path desde cero y **sin** abrir Fase 7.

| Cubre | No cubre (prohibido / fuera) |
|-------|------------------------------|
| `/mi-camino` + guard zona alumno | **Fase 5 reopen** / re-piloto T-PUB sin gap |
| Contrato `GET /me/path` + UI `GmusicPath` | **Fase 7** Mi Progreso (`T-MVP-PROGRESS`) |
| Estados UI: vacío · cargando · error · bloqueado · activo | **Fase 8** Comunidad · **Fase 9** pagos |
| Secuencia + desbloqueo (`deriveNodeStatuses`) | Track B · Next.js · Sanity · CourseLit |
| Frontera con **T-UX-LESSON-01** (documentada) | Consumo lección pulido **en código** (sin mandato T-UX) |
| Dependencia T-PUB DONE LOCAL | Rediseño serpiente / VFX **sin** mandato Juan |
| Matriz existe/parcial/gap · cómo probar | Schema migrations · prod DB · seeds prod |
| Firma §14 → cierre **D-F6-001** | Currículo 6–75 · multi-instrumento · commit autónomo |

**Regla de oro:** el **path suscriptor ya existe**. Fase 6 **no inventa Mi Camino**. Documenta la verdad del repo, declara gaps MUST de orientación (si bloquean happy path), fija frontera T-UX, y **no** reabre el MVP (**D-F1-001**) ni el piloto T-PUB (**D-TPUB-01**) sin gap verificable.

**Alcance de esta ejecución (2026-07-15):** **solo documental**. Sin código producto · sin migraciones · sin Prisma changes · sin prod DB · sin T-UX implementación · sin Fase 7 · sin commit/push.

---

## 2. Objetivo Mi Camino en MVP

Del diagrama (**roadmap-general** · Fase 6) y `01-mvp-gmusic.md` §6–§7:

> El alumno ACTIVE entiende y navega su ruta: ve bloques/nodos **PUBLISHED**, sabe **dónde está**, puede ir a la **siguiente lección** accionable, y el desbloqueo secuencial refleja progreso real en API/DB.

Traducción operativa (sin inflar alcance):

```text
  Materia PUBLISHED (F5 · T-PUB DONE LOCAL)
              │
              ▼
        GET /me/path  ──►  locked | available | active | completed
              │
              ▼
     /mi-camino (GmusicPath + carrusel)
              │
     ┌────────┴────────┐
     ▼                 ▼
  Dónde estoy     Siguiente lección
  (activeNodeId)  (CTA nodo active/available)
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
         └──► T-UX-LESSON-01 (default OUT este mandato)
```

**Frase canónica F5 vs F6:** *F5 asegura materia PUBLISHED visible; F6 asegura la ruta alumno usable y orientada.*  
Nota: el wording aspiracional de `05` §12 (“UX completa / serpiente / VFX”) **no** es MUST de F6 — gana este documento + brief F6 + MVP.

---

## 3. Política MVP / contrato funcional mínimo

Fuente: `01-mvp` §6 Mi Camino + §7 + brief F6 + post **D-TPUB-01**.

### MUST (núcleo F6)

| Capacidad | Nota |
|-----------|------|
| Ruta suscriptor `/mi-camino` con datos API reales | `usePath` → `GET /me/path` (mock path ≠ launch) |
| Ver módulos/nodos **PUBLISHED** | Dependencia T-PUB satisfacida **local**; launch = mandato aparte |
| Secuencia Module → PathNode | Schema + `loadPublishedCoursePath` |
| Desbloqueo secuencial | `deriveNodeStatuses` + `UserProgress.isCompleted` |
| “Dónde estoy” (nodo `active` / foco UI) | `activeNodeId` + `resolveCarouselFocusIndex` |
| “Siguiente lección” accionable desde el path | CTA → start sesión (frontera T-UX si consumo falla) |
| Empty / loading / error / bloqueado por acceso usables | DoD estados |
| Responsive happy path path | MVP §7.8 |

### SHOULD

| Capacidad | Nota |
|-----------|------|
| Copy pedagógico módulo/foco alineado a contenido real | `focus` vacío hasta campo editorial Prisma (§ anti-demo) |
| Badge nivel coherente con datos reales | Module.title + Module.order + slug instrumento (§ anti-demo) |
| Paridad clara demo vs suscriptor (docs) | Evitar confusión agentes |
| Screenshot FE piloto (**T-PUB-01-UI**) | Opcional · no bloquea F6 docs |

### BRIDGE

| Capacidad | Nota |
|-----------|------|
| Course PUBLISHED vía seed/ops | Igual F5 — sin UI Course |
| Contenido **prod/staging** | Fuera DONE LOCAL · mandato ops |
| Activación Subscription | F4/F9 WA — no reabrir |

### WON'T (esta fase / MVP)

| Capacidad | Nota |
|-----------|------|
| Página **Mi Progreso** | **Fase 7** |
| Comunidad / pagos / Auth redo | F8 / F9 / F4 |
| Currículo 6–75 / multi-instrumento | post-MVP / D-007 |
| Track B / CourseLit / VFX o serpiente “por belleza” | OUT sin mandato Juan |
| Reescribir Admin publish | F5 cerrado |

---

## 4. F5 vs F6 · dependencia T-PUB DONE LOCAL

| | **Fase 5 — Academia / Cursos** | **Fase 6 — Mi Camino** |
|--|--------------------------------|-------------------------|
| Pregunta | ¿Hay catálogo publicable y el alumno **ve** materia PUBLISHED? | ¿El alumno **entiende y navega** su ruta? |
| Actor | Admin R-008 + pipeline publish | Alumno ACTIVE en `/mi-camino` |
| Entregable docs | `05-academia-cursos.md` ✅ | **Este** `06-mi-camino.md` |
| Ticket núcleo | T-PUB-01 → **DONE LOCAL** | Gaps path UX (si bloquean) + frontera T-UX |
| Frase | Materia PUBLISHED visible | Ruta usable y orientada |

### Hechos D-TPUB-01 (no reabrir)

| Hecho | Implicación F6 |
|-------|----------------|
| Course `ruta-guitarra-12-meses` PUBLISHED (local) | Contrato datos path existe en local |
| Module N=1 + 5 PathNode PUBLISHED | Secuencia 5 etapas usable en API |
| Alumno ACTIVE ve bloque en `GET /me/path` | Empty state **no** es el happy path local del piloto |
| Evidencia API canónica | Pipeline **local** validado |
| **No** prod · **no** launch staging | F6 **no** declara launch |
| **R-OPS-MIGRATE-UUID** · **T-PUB-01-UI** | Deuda ops — **no** MUST F6 · mandato aparte |

**Política:** no reabrir T-PUB-01 salvo gap verificable nuevo (p. ej. `/me/path` deja de devolver módulos PUBLISHED).

---

## 5. Routing y acceso

| Pieza | Valor |
|-------|-------|
| `currentPage` | `mi-camino` |
| Pathname | `/mi-camino` |
| Página | `GmusicPath` (`src/app/pages/GmusicPath.tsx`) |
| Routing | `src/app/utils/student-zone-routing.ts` + `App.tsx` |
| Guard | `StudentZoneGuard` + `useStudentAccess` · **D-017** (Subscription **ACTIVE**) |
| Demo (≠ suscriptor) | `/mi-camino-demo` · datos TS / `localStorage` — **no** es este contrato |

Sin ACTIVE: el guard muestra estados de acceso / redirige a planes — **bloqueado** a nivel zona (ver §7).

---

## 6. Contrato API path · relación `GET /me/path` + GmusicPath

### Backend (archivos reales)

| Archivo | Rol |
|---------|-----|
| `server/routes/me.ts` | `GET /me/path` (auth estudiante real; `courseSlug` opcional → default config) |
| `server/services/meService.ts` | `buildPathResponse` · `activeNodeId` · badge/focus vía `pathPresentation` |
| `server/lib/pathPresentation.ts` | Badge/focus controlados · sin pedagogía inventada (**T-F6-ANTI-DEMO-01**) |
| `server/services/coursePath.ts` | `loadPublishedCoursePath` — solo Course/Module/PathNode **PUBLISHED** |
| `server/lib/nodeStatus.ts` | `deriveNodeStatuses` → `locked` \| `available` \| `active` \| `completed` |
| `server/routes/lessonSessions.ts` + `lessonSessionService.ts` | Frontera: start/complete; rechaza locked |

### Payload mínimo (contrato)

| Campo | Significado |
|-------|-------------|
| `course` | id, title, slug, `badge` (instrument/month/level) |
| `modules[]` | título, focus, nodesCompleted/Total, `nodes[]` |
| `nodes[].status` | unlocked map derivado |
| `nodes[]` material público | title, order, stageType, guide*, videoUrl, completionCriteria, ctaLabel, … |
| `activeNodeId` | primer nodo desbloqueado e incompleto (`findActiveNodeId`) |

### Frontend (archivos reales)

| Archivo | Rol |
|---------|-----|
| `src/app/hooks/usePath.ts` | estados hook `loading` / `success` / `error` → `loadPathOnce` |
| `src/app/services/gmusic-api/path-load.ts` (+ `map-path`) | HTTP → `PathViewModel` (`isEmpty`, `isComplete`, `activeNodeId`, …) |
| `src/app/pages/GmusicPath.tsx` | Orquestador: shell, empty/error/loading/complete, carrusel, runner |
| `src/app/components/gmusic/PathCarouselCards.tsx` | **UI principal** suscriptor (verdad del repo) |
| `src/app/components/gmusic/subscriber-path-carousel.ts` | `resolveCarouselFocusIndex` / `ActiveClass` · “dónde estoy” |
| `src/app/components/gmusic/path/*` | `PathShell`, `PathPageIntro`, `CompletedPathPanel`, `PathLessonRunner`, start helpers |
| `src/app/components/gmusic/DemoPathLevelBar.tsx` | Progress rail completed/total |
| `SerpentinePathMap.tsx` (árbol) | **parcial / legacy?** — **no** es UI principal actual |

**Conflicto docs vs código:** skill `gmusic-path` puede mencionar mapa serpenteante; suscriptor actual = **carrusel**. Este `06` cita la verdad del código.

### Secuencia y desbloqueo

Reglas (`nodeStatus.ts`):

1. `completed` si `UserProgress.isCompleted`.  
2. `locked` si el nodo anterior no está completado.  
3. Primer incompleto desbloqueado → `active` (uno solo).  
4. Resto desbloqueados incompletos → `available`.  
5. Completar N (vía lesson-session / progress) → desbloquea N+1.

---

## 7. Estados de pantalla (contrato UX)

Estados de producto exigidos en F6. Mapeo a implementación auditada (`e5b161c`):

| Estado producto | Cuándo | UI / evidencia | ¿Usable MVP? |
|-----------------|--------|----------------|--------------|
| **Cargando** | Hook path o guard acceso en vuelo | “Cargando mapa del camino…” / “Verificando acceso…” | **existe** |
| **Error** | Fallo API path (o acceso) | `DashboardErrorBanner` + retry / panel error guard | **existe** |
| **Bloqueado** | (a) zona: sin Subscription ACTIVE · (b) nodo `locked` | Guard deniega / redirige planes · nodos sin CTA start | **existe** |
| **Vacío** | `success` + `moduleCount`/viewModel `isEmpty` | Copy: “Tu camino todavía no tiene módulos publicados…” | **existe** (local piloto ≠ vacío) |
| **Activo** | `success` + módulos + nodo `active` (y opc. complete path) | Carrusel + foco + CTA · `CompletedPathPanel` si `isComplete` | **existe** (foco UX **parcial**) |

Sub-estado operativo: error al **iniciar sesión de lección** (banner + Reintentar) — frontera T-UX, no empty path.

---

## 8. Frontera T-UX-LESSON-01

| Zona | Scope | Clasificación en este `06` |
|------|--------|------------------------------|
| Mapa / ruta — listar, estados, foco, CTA empezar, vacío, complete | Núcleo F6 | **IN docs F6** |
| Abrir sesión — `POST lesson-sessions`, guard locked/completed | Contrato path↔lección | **IN docs** · código solo con mandato |
| Consumo lección — video-first, tabs, práctica, complete+persiste | **T-UX-LESSON-01** | **OUT** este mandato docs-only · MUST pre-launch **si** bloquea complete+guarda |
| Agregados página Mi Progreso | Fase 7 | **OUT** |

**Default mandato Juan (2026-07-15):** docs path + frontera explícita · **no** implementar T-UX bajo etiqueta F6.

Umbral MVP: *Si el runner actual impide completar + persistir → T-UX-LESSON-01 es MUST pre-launch* — requiere mandato aparte o inclusión explícita.

---

## 9. Matriz audit (existe / parcial / gap)

Revalidado HEAD `e5b161c` (2026-07-15).

| Capacidad | Estado repo | ¿Bloquea MVP? | Política | Notas |
|-----------|-------------|----------------|----------|--------|
| URL + guard `/mi-camino` | **existe** | Si roto → **Sí** | MUST | Routing shipped |
| `GET /me/path` PUBLISHED | **existe** | Si roto → **Sí** | MUST | T-PUB local OK |
| Secuencia + desbloqueo | **existe** | Si roto → **Sí** | MUST | `nodeStatus.ts` |
| Dónde estoy (active + foco) | **parcial** UI | Si alumno no identifica nodo → **Sí** | MUST UX | Documentar; gap código solo con mandato |
| Siguiente lección CTA | **existe** | Si no abre sesión usable → T-UX | MUST path + T-UX si aplica | |
| Empty/loading/error/bloqueado | **existe** | No si copy/guard claros | MUST DoD | |
| Materia local piloto | **DONE LOCAL** | Launch ≠ local | Dato | D-TPUB-01 |
| Materia prod/staging | **no verificado** aquí | **Sí** para launch | Ops | No reabrir T-PUB en F6 docs |
| PathLessonRunner pulido | **parcial** | Si no completa+guarda → **Sí** | T-UX-LESSON-01 | Frontera |
| UI carrusel vs serpiente | carrusel = principal | No (sin mandato redesign) | WON'T redesign | |
| Badge/focus sin verdad inventada | **mitigado** (T-F6-ANTI-DEMO-01) | Si vuelve hardcode pedag. → Sí | MUST anti-demo | Ver § anti-demo |
| Comunidad en header alumno | **bloqueada** (candado) | Mocks ≠ launch | MUST si visible | T-MVP-COMMUNITY para desbloquear |
| Mi Progreso página | **inexistente** | MUST pero **F7** | OUT F6 | |
| Demo path | **completa** funnel | No | Funnel | No confundir |

---

## 10. Riesgos y pendientes (separados · no MUST F6 docs)

| Ítem | Tratamiento | ¿Bloquea cierre docs F6? |
|------|-------------|---------------------------|
| **R-OPS-MIGRATE-UUID** | Migrate fresh local falla UUID FK; workaround `db push` Docker — mandato ops aparte | **No** |
| **T-PUB-01-UI** | Screenshot FE Vite `/mi-camino` opcional | **No** |
| Contenido prod/staging | Mandato ops · confusión DONE LOCAL ≠ launch | **No** (explicitar) |
| Confundir F5 publish con F6 ruta | Tabla §4 | — |
| Meter F7 “siguiente” en página Progreso | Siguiente **en el path** = F6; superficie Progreso = F7 | — |
| Redesign serpiente/VFX por gusto | Solo con criterio Juan | — |
| Ampliar LessonRunner sin umbral | T-UX + mandato; umbral = completa + persiste | — |

---

## 11. Tickets derivados

| ID | Rol | Prioridad | Estado / nota |
|----|-----|-----------|---------------|
| Gaps path UX (foco / orientación) | Si bloquea “dónde estoy” happy path | MUST UX | **No** código en esta pasada; listar para mandato futuro |
| **T-F6-ANTI-DEMO-01** | Quitar verdad mock/hardcode visible en Mi Camino | MUST pre-launch | **CERRADO** (**D-F6-ANTI-DEMO-001**) · auditoría `coherente` · ver § anti-demo |
| **T-UX-LESSON-01** | Consumo lección | MUST pre-launch **si** bloquea | Frontera · OUT este mandato |
| **T-PUB-01-UI** | Screenshot FE | Baja / opcional | Deuda aparte |
| **R-OPS-MIGRATE-UUID** | Migrate fresh local | Ops | Mandato aparte |
| `T-MVP-PROGRESS` | Página progreso | MUST MVP · **F7** | **OUT F6** |
| Reopen T-PUB | Solo gap verificado | — | Prohibido por costumbre |

---

## 12. Criterios de aceptación · DoD aplicable · cómo probar

### A) Criterios de **esta ejecución documental** (D-F6-WIP)

- [x] Existe `docs/features/06-mi-camino.md` con secciones 0–14.  
- [x] Matriz path revalidada contra código (SHA `e5b161c`).  
- [x] F5 vs F6 + dependencia **D-TPUB-01** explícitas.  
- [x] Estados vacío / cargando / error / bloqueado / activo documentados.  
- [x] Frontera **T-UX-LESSON-01** clasificada (OUT mandato actual).  
- [x] Riesgos ops (UUID / screenshot) **separados**.  
- [x] **T-F6-ANTI-DEMO-01** cerrado (**D-F6-ANTI-DEMO-001**) incorporado como evidencia.  
- [x] Mi Camino path suscriptor **no** depende de mock/hardcode visible como producto real (auditoría `coherente`).  
- [x] Cero código · cero DB · cero F7 · cero commit/push (esta pasada documental).  
- [x] Juan marca aprobado §14 → **D-F6-001** (2026-07-15).

### B) DoD aplicable

| Capa | Aplica a F6 docs-only | Aplica si hay código futuro |
|------|------------------------|-----------------------------|
| `docs/quality/definition-of-done.md` | Checklist como **criterio del feature** documentado (§ estados, datos API, permisos ACTIVE, responsive) | Checklist **completo** + `npm run verify` verde |
| MVP §7 launch | F6 **no** finge cierre de launch (falta T-UX si aplica, Mi Progreso F7, contenido launch env, etc.) | Idem |
| Gate técnico | **N/A** cierre docs (sin código) | `npm run verify` obligatorio |

DoD permanente — ítems especialmente aplicables a Mi Camino:

1. E2E path alumno ACTIVE → nodos → (opcional) sesión.  
2. Datos reales API (no mock launch).  
3–5. Error / empty / loading.  
6. Permisos ACTIVE.  
7. Responsive.  
8. Docs cómo probar.  
9. Tests del área si hay código.  
10. No romper funnel.  
11. Dentro MVP congelado.

### C) Cómo probar (smoke — no ejecutado en esta pasada docs)

1. Precondición: entorno LOCAL con piloto **D-TPUB-01** (o equivalente PUBLISHED).  
2. Alumno ACTIVE → `/mi-camino` → no empty; ve bloque; nodo `active` enfocado.  
3. Completar etapa N → N+1 `available`/`active` (API + UI).  
4. Sin ACTIVE → bloqueado (guard).  
5. Sin módulos PUBLISHED → vacío usable.  
6. (Opcional, mandato T-UX) start sesión → complete → progress persiste.  
7. Si hubo código: `npm run verify`.

---

## Anti-demo · T-F6-ANTI-DEMO-01 (CERRADO · D-F6-ANTI-DEMO-001 · 2026-07-15)

Mandato Juan: limpiar Mi Camino / rutas relacionadas de datos demo/mock que puedan verse como producto real. **Sin Fase 7 · sin prod DB · sin commit/push en cierre ticket.** En el momento del ticket F6 estaba PAUSADA; **post D-F6-001 (2026-07-15) F6 TERMINADA** · F7 **NO**.

| Campo | Valor |
|-------|-------|
| **Ticket** | **CERRADO** (DONE LOCAL verificado) |
| **Decisión** | **D-F6-ANTI-DEMO-001** |
| **Auditoría** | **`coherente`** · `docs/roadmap/t-f6-anti-demo-01-auditoria-final.md` |
| **≠ cierre F6** | Firma §14 / **D-F6-001** sigue pendiente |

**Conclusión para F6:** el path suscriptor (`GET /me/path` + `/mi-camino`) **ya no** presenta badge/focus/duration inventados como verdad de producto; mocks FE son opt-in explícito; Comunidad nav bloqueada OUT MVP.

### Contrato badge / focus / pathLabel / duration (API real)

| Campo | Fuente | Nota |
|-------|--------|------|
| `badge.instrument` | Mapa controlado slug/título Course (`pathPresentation`) | `ruta-guitarra-*` → Guitarra; fallback `"Ruta"` |
| `badge.level` | `Module.title` del módulo activo (o primero) | Ya no hardcode `"Fundamento"` |
| `badge.month` | `Module.order` → `Mes N` | Orden Prisma real — **nunca** índice del `map` |
| `user.pathLabel` | `Module.order` + ordinal de nodo | Mismo contrato Mes; fallback neutro `"Tu ruta"` |
| `module.focus` | **Vacío** hasta columna/editorial Prisma | UI oculta párrafo si vacío — **no** inventar pedagogía |
| `node.duration` | **Vacío** hasta duración editorial | **no** inventar `N min` desde `exercises.length` |

Helpers: `server/lib/pathPresentation.ts` · wiring `buildPathResponse` / `dashboardAssembly` / dashboard `levelLabel`.

### Launch mocks OFF

| Flag | Launch / CI / piloto |
|------|----------------------|
| `VITE_USE_PATH_MOCK` | **`false`** o ausente (`.env.ci`, `.env.example`, `.env.t-pub-01.local`) |
| Mock path FE | Solo si flag `true` explícito — **≠** fallback silencioso |

### Checklist lección (prepare)

`buildVisualPracticeChecklist`: ayuda **visual local** (no persistida). Prefiere `completionCriteria` del PathNode; si no hay, hints genéricos. Copy UI: no sustituye currículo publicado.

### Comunidad (header alumno)

**Bloqueada** en `GmusicInternalHeader` (candado + modal **«fuera del MVP actual»**) hasta feed/peers reales de launch. Feed API + enrollment existen; peers vacíos / curated mock / mentorship mock ≠ launch. Desbloqueo = **T-MVP-COMMUNITY** (F8) + OK Juan.

Landing marketing `#comunidad` (público) **no** es el nav interno del alumno. CTA landing → `community` puede abrir página con mocks curated — **OUT MVP** documentado; no equivale a producto launch.

### Seeds = local-only

`prisma/seed.ts` / `db:seed` / alumnos QA → **solo local/staging autorizado**. **≠** verdad launch · **≠** evidencia productiva · **≠** prod. Ver `docs/setup/03-entorno-desarrollo.md` § Seeds.

### Mock residual intencional (documentado)

| Residual | Dónde | Por qué OK |
|----------|-------|------------|
| `gmusic-path-data.ts` / `mock-path.ts` | FE explícito | Solo `VITE_USE_PATH_MOCK=true` |
| Demo funnel `/mi-camino-demo` | Funnel público | ≠ suscriptor ACTIVE |
| `SAMPLE_COMMUNITY_POSTS` | Tests / fixtures | No en path alumno header |
| Mentorship / curated mock arrays | `CommunityPage` | Nav alumno bloqueado; F8 reopen |
| Checklist visual local | Lesson prepare | Etiquetado; no DB |
| `typeLabel` dashboard nextPractice | Estimación por contentKind | Cosmético Mi Estudio; sin minutos inventados en path |

---

## 13. Fuera de alcance

- Fase 7 Mi Progreso · 8 Comunidad · 9 Pagos.  
- Track B / Currículo completo / multi-instrumento.  
- VFX / serpiente redesign sin mandato.  
- Implementación **T-UX-LESSON-01** (este mandato).  
- Fix **R-OPS-MIGRATE-UUID** · **T-PUB-01-UI** sin mandato.  
- Prod DB · publish prod · migraciones schema.  
- Commit / push autónomo.  
- Descongelar MVP (**D-F1-001**).

---

## 14. Aprobación (cierre Fase 6 → D-F6-001) — firmado Juan

**Estado:** **TERMINADA / APROBADA** — **D-F6-001** (2026-07-15) · fase documental.

| Campo | Valor |
|-------|-------|
| Lectura `06` completa | ✅ Juan |
| Matriz path coherente con código | ✅ |
| Estados vacío/cargando/error/bloqueado/activo claros | ✅ |
| T-PUB = DONE LOCAL (no prod) respetado | ✅ |
| T-F6-ANTI-DEMO-01 cerrado (D-F6-ANTI-DEMO-001) reflejado | ✅ |
| Frontera T-UX clasificada · F7 OUT | ✅ |
| Aprobado como canónico Mi Camino Track A | ✅ **D-F6-001** |

```text
OK Juan §14.
Apruebo docs/features/06-mi-camino.md como documento canónico Mi Camino Track A.
Declaro Fase 6 TERMINADA (D-F6-001) como fase documental.
T-PUB-01 permanece DONE LOCAL (D-TPUB-01); no es validación productiva.
T-F6-ANTI-DEMO-01 permanece CERRADO (D-F6-ANTI-DEMO-001).
T-UX-LESSON-01 permanece frontera / OUT salvo mandato aparte.
Fase 7 NO queda autorizada.
Sin código, sin DB, sin commit/push salvo mandato explícito.
Fecha: 2026-07-15
Decisión: D-F6-001
```

Control roadmap: Fase 6 **TERMINADA** (documental) · **D-F6-WIP** supersedido · Fase 7 **NO INICIADA** · T-PUB DONE LOCAL · deuda ops aparte.

---

*Fin `06-mi-camino.md` · v1.0 · **TERMINADA** (**D-F6-001**, 2026-07-15) · canónico Mi Camino Track A.*
