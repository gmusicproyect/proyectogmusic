# 07 — Mi Progreso / Seguimiento (Track A)

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-15 |
| **Autor** | Cursor (ejecutor) · supervisión Juan |
| **Versión** | 1.0 (canónico · firmado) |
| **Estado** | **TERMINADA / APROBADA** — **D-F7-001** (2026-07-15) · fase **documental** · **≠ launch-ready** (capa C abierta) |
| **SHA ref. auditoría** | `e5b161c` · rama `main` |
| **Prerreqs** | **D-F1…D-F6-001** · higiene post-F6 · **D-TPUB-01** · **D-F6-ANTI-DEMO-001** · auditoría Admin opción **C** |
| **Política producto** | **D-ROAD-005 B** · MVP §6–§7.6b · DoD `docs/quality/definition-of-done.md` |
| **Instrucción** | `docs/roadmap/fase-7-instruccion.md` (opción C) |
| **Auditoría editorial** | `docs/roadmap/auditoria-admin-editorial-pre-f7.md` |
| **Ticket ancla** | **T-MVP-PROGRESS** |
| **Mandato** | OK Juan — Fase 7 **solo documental** (2026-07-15) · sin código · sin DB · sin F8 · sin commit/push |

**Regla de cabecera:** cumplir este documento (**cierre B**) **≠** declarar Mi Progreso **launch-ready** (**cierre C**).

---

## 1. Propósito y alcance

Documento **canónico** de **Mi Progreso** Track A para el MVP congelado. Define la superficie mínima de seguimiento del alumno ACTIVE: qué ve, de dónde salen los números, estados vacíos/error, y qué queda fuera — **sin** implementar UI en esta pasada.

| Cubre | No cubre |
|-------|----------|
| Contrato MUST IN/OUT de Progreso | Rachas/rankings/gráficos/logros/predictivo |
| Fuentes `UserProgress` / path / sesiones | Admin Course UI (BRIDGE aparte) |
| Frontera Admin/Course · T-PUB LOCAL | Validación productiva T-PUB |
| Capas **B documental** vs **C launch/medición** | F8 Comunidad · F9 pagos |
| Frontera **T-UX-LESSON-01** | Implementar runner / T-UX |
| Firma §15 → **D-F7-001** docs | Afirmar launch-ready solo por existir este `07` |

**Regla de oro:** hay motor de progreso en schema (`UserProgress`, `LessonSession`); **no** hay página Mi Progreso. F7 documenta el contrato de superficie; **no** inventa métricas decorativas ni descongela el MVP (**D-F1-001**).

**Alcance de esta ejecución:** solo documental. Sin código producto · sin DB · sin F8 · sin commit/push.

---

## 2. Objetivo MVP

Del roadmap (Fase 7) y `01-mvp-gmusic.md` §6 «Mi Progreso (MUST mínimo)» + §7.6b:

> El alumno ACTIVE entiende **cuántas lecciones/nodos completó**, **qué % de avance real lleva** en su ruta publicada, **cuál es su curso/ruta activa**, **cuál fue su última actividad**, y **cuál es la siguiente lección** — o un **empty state** claro si aún no avanzó.

```text
  PathNode PUBLISHED + UserProgress (+ LessonSession)
              │
              ▼
     Agregados de lectura (API futura o reuso dashboard/path)
              │
              ▼
     Superficie Mi Progreso (IN MVP)
         ├── empty / loading / error
         └── CTA → siguiente (Mi Camino / start sesión)
                    └── si no persiste avance → frontera T-UX
```

*F6 orienta en el mapa; F7 resume el avance agregado sin sustituir el mapa.*

---

## 3. Contrato MUST / SHOULD / WON'T / BRIDGE

Fuente: MVP §6 + D-ROAD-005 B + brief F7 opción C.

### MUST (IN)

| Capacidad | Fuente prevista (repo) | Nota |
|-----------|------------------------|------|
| Nodos/lecciones **completados** (conteo) | `UserProgress` donde `isCompleted` + nodos del curso PUBLISHED | No conteo de demo `localStorage` |
| **% avance real** | Ver §6 fórmula | Numerador/denominador documentados · no decorativo |
| **Curso / ruta activa** | `Course` + módulo activo / `pathPresentation` / `pathLabel` | Coherente con F6 |
| **Última actividad** | Primaria: `max(UserProgress.completedAt)` entre nodos completados del curso activo. Apoyo: actividad más reciente de `LessonSession` solo si no hay `completedAt` | Sin inventar timestamps |
| **Siguiente lección** + CTA | `activeNodeId` / next de `GET /me/path` · o `buildNextPractice` | Misma verdad que Camino |
| **Empty state** | Sin completados o sin PathNode PUBLISHED | Copy sin métricas inventadas |
| ACTIVE + responsive | `StudentZoneGuard` · DoD | D-017 |
| Datos API/DB | — | Mock path / seeds ≠ launch |

### SHOULD

| Capacidad | Nota |
|-----------|------|
| URL dedicada p.ej. `/mi-progreso` + `currentPage` | **A definir en implementación**; hoy **no** existe en routing |
| Ítem nav “Mi Progreso” | Header actual: Camino + Estudio — Progreso **ausente** |
| Desglose simple por Module | Opcional si no hincha MUST |
| Reusar `dashboardAssembly.resolveModuleProgress` / `buildNextPractice` | Evitar lógica duplicada |

### WON'T (MVP)

| Capacidad | Nota |
|-----------|------|
| Rachas avanzadas (UI) | `StreakEvent` puede existir — OUT superficie |
| Tiempo exacto de práctica | OUT |
| Rankings / leaderboards | OUT |
| Gráficos complejos | OUT |
| Logros / badges sofisticados | OUT |
| Predictivo / recomendaciones ML | OUT |
| XP como promesa principal de la página | OUT |

### BRIDGE

| Capacidad | Nota |
|-----------|------|
| **Course** create/publish Admin UI | **BRIDGE** seed/ops (**opción C**) |
| Materia **solo LOCAL** (T-PUB DONE LOCAL) | Antecedente de pipeline · **≠** validación productiva |
| Mi Estudio mostrando parciales de progreso | Puede coexistir; **no** sustituye superficie MUST Progreso hasta implementarla |

---

## 4. F6 vs F7 · Admin/Course BRIDGE · T-PUB LOCAL

| | **Fase 6 — Mi Camino** | **Fase 7 — Mi Progreso** |
|--|------------------------|---------------------------|
| Pregunta | ¿Dónde estoy en la ruta? | ¿Cuánto he avanzado en agregado? |
| UI principal | Carrusel / path | Superficie resumen (aún inexistente) |
| Canónico | `06-mi-camino.md` **D-F6-001** | **Este** `07` · **D-F7-001** |
| Ticket | — / anti-demo cerrado | **T-MVP-PROGRESS** |

### Admin / editorial (opción C)

| Hecho | Implicación Progreso |
|-------|----------------------|
| Admin publica **Module** + 5 PathNode | Nodos entran al denominador de % y al Camino |
| **Course** vía seed/ops · sin Admin UI | **BRIDGE** — documentado; no bloquear contrato `07` |
| T-PUB-01 **DONE LOCAL** | Prueba que el publish→path funciona en Docker · **no** prod/staging |

### T-PUB-01 como antecedente (no productiva)

- Evidencia: `docs/roadmap/t-pub-01-evidencia-local.md` · **D-TPUB-01**.  
- Autoriza afirmar: “el pipeline local de contenido PUBLISHED existe”.  
- **No** autoriza: “Mi Progreso está validado en producción / launch”.

---

## 5. Routing y acceso

| Pieza | Estado repo (auditoría lectura) | Contrato F7 |
|-------|----------------------------------|-------------|
| `currentPage` Progreso | **Inexistente** | SHOULD definir en implementación |
| Pathname `/mi-progreso` | **No** en `student-zone-routing` | SHOULD · documentar sync D-GOV al implementar |
| Nav header | Camino + Estudio · Comunidad locked | Añadir Progreso solo si superficie real |
| Guard | Misma zona alumno · **ACTIVE** | MUST |

Sin ACTIVE: no entra a Progreso (mismo contrato que Camino).

---

## 6. Fuentes de datos · fórmula %

### Fuentes canónicas (lectura)

| Dato IN | Fuente primaria | Fuente de apoyo |
|---------|-----------------|-----------------|
| Completados | `UserProgress` (`isCompleted`, `completedAt`) | — |
| Total publicable | `PathNode` con `status=PUBLISHED` bajo Modules PUBLISHED del Course activo | `loadPublishedCoursePath` / `GET /me/path` |
| Ruta/curso activo | `Course.title` / slug + módulo activo | `pathPresentation` · `user.pathLabel` (dashboard) |
| Siguiente | Primer nodo `active`/`available` del path | `activeNodeId` · `buildNextPractice` |
| Última actividad | Primaria: `max(UserProgress.completedAt)` (completados del curso) | `LessonSession` solo si no hay completedAt |

**API hoy:** `GET /me/path`, `GET /me/dashboard` (parciales). **No** hay `GET /me/progress` dedicado — gap de implementación (no de modelo).

### Fórmula % (propuesta canónica)

\[
\% = \frac{\#\{\text{PathNode PUBLISHED del curso activo con UserProgress.isCompleted}\}}{\#\{\text{PathNode PUBLISHED del curso activo}\}} \times 100
\]

Reglas:

1. Denominador = 0 → no mostrar % inventado → **empty** o “sin etapas publicadas”.  
2. Solo contar nodos **PUBLISHED** (alineado a Camino).  
3. Redondeo: entero 0–100 (detalle de UI en implementación).  
4. Prohibido: % hardcode, % desde demo funnel, % desde ejercicios no persistidos.

---

## 7. Estados: vacío · cargando · error · con datos

| Estado | Cuándo | Comportamiento esperado |
|--------|--------|-------------------------|
| **Cargando** | Fetch progreso/path/dashboard en vuelo | Skeleton / “Cargando tu progreso…” |
| **Error** | Fallo API / red | Mensaje + reintentar · no números falsos |
| **Vacío (sin avance)** | ACTIVE + curso «con nodos» + 0 completados | Copy motivador · CTA ir a Mi Camino / siguiente |
| **Vacío (sin materia)** | 0 PathNode PUBLISHED | Copy “tu ruta aún no tiene etapas publicadas” · **no** % 0 decorativo engañoso |
| **Con datos** | ≥1 completado o al menos total>0 con siguiente | Mostrar IN · CTA siguiente |

---

## 8. Frontera T-UX-LESSON-01 · F8

| Zona | Clasificación |
|------|----------------|
| Leer y mostrar progreso **ya persistido** | **IN F7** |
| Completar lección + guardar `UserProgress` | Contrato path/lección · si roto → **T-UX-LESSON-01 MUST** pre-launch medición |
| Implementar LessonRunner video-first | **OUT** F7 salvo mandato T-UX |
| Comunidad / feed | **Fase 8 OUT** |

**Riesgo explícito:** si el alumno “termina” en UI pero no hay `isCompleted` en DB, Progreso quedará vacío/estancado — eso es bug de **persistencia/consumo**, no de falta de página Progreso.

---

## 9. Matriz existe / parcial / gap

| Capacidad | Estado repo | ¿Bloquea F7 docs? | ¿Bloquea launch Progreso? |
|-----------|-------------|-------------------|---------------------------|
| Schema UserProgress / PathNode | **existe** | No | No |
| Agregados en dashboardAssembly | **parcial** | No | No (reutilizable) |
| `GET /me/path` + ACTIVE | **existe** | No | Si roto → Sí |
| Página / ruta Mi Progreso | **inexistente** | No (docs) | Sí hasta implementar |
| Nav ítem Progreso | **inexistente** | No | Sí si se promete en nav |
| API dedicada `/me/progress` | **inexistente** | No | SHOULD |
| Materia PUBLISHED local | **DONE LOCAL** | No | No basta para prod |
| Materia PUBLISHED staging/prod | **no verificado** | No | **Sí** para cierre C |
| Persistencia complete | **parcial** (T-UX frontera) | No | **Sí** si no persiste |
| Course Admin UI | **BRIDGE** | No | Ops/BRIDGE OK si Course PUBLISHED por ops |
| Rachas UI | OUT | — | — |

---

## 10. Criterios B (documental) vs C (launch/medición)

### B — Cierre Fase 7 **documental** (esta fase)

| # | Criterio |
|---|----------|
| B1 | Existe este `07` con §§0–15 |
| B2 | IN/OUT/BRIDGE + fórmula % + estados |
| B3 | Fronteras F6 · Admin/Course BRIDGE · T-PUB LOCAL ≠ prod · T-UX · F8 |
| B4 | Separación explícita B vs C · **no** claim launch-ready |
| B5 | Cero código · cero DB · cero F8 · cero commit en esta pasada |
| B6 | Firma Juan §15 → **D-F7-001** (documental) | ✅ 2026-07-15 |

### C — Launch / medición real (MVP §7.6b · **no** cerrado por B)

| # | Criterio |
|---|----------|
| C1 | Env acordado con Course + ≥1 Module **PUBLISHED** (T-PUB en ese env o ops equivalente — **no** asumir DONE LOCAL) |
| C2 | Alumno ACTIVE completa ≥1 nodo y queda `UserProgress.isCompleted` (si no → T-UX MUST) |
| C3 | Superficie Progreso implementada muestra campos IN (o empty real) |
| C4 | Sin mocks de launch · DoD + verify si hubo código |
| C5 | Course BRIDGE aceptable solo con ops que dejan Course PUBLISHED en ese env |

**Regla:** **B ≠ C**. Juan puede cerrar F7 documental sin C; el MVP launch sigue exigiendo C.

---

## 11. Riesgos y deuda ops

| Riesgo / deuda | Tratamiento |
|----------------|-------------|
| Declarar launch-ready tras firmar §15 | **Prohibido** |
| Course BRIDGE olvidado | Mantener en §3–§4 |
| T-PUB LOCAL confundido con prod | §4 |
| T-UX no persiste | §8 · ticket aparte |
| R-OPS-MIGRATE-UUID | Ops · no bloquea docs F7 |
| INC-admin-cred / R-OPS-01 | P0 launch · no bloquea docs F7 |
| URL nueva sin D-GOV | Documentar al implementar |
| Duplicar Camino en Progreso | Progreso = resumen; profundidad = Camino |

---

## 12. Tickets

| ID | Rol | Prioridad |
|----|-----|-----------|
| **T-MVP-PROGRESS** | Implementar superficie + (opcional) API lectura | MUST pre-launch (capa C) |
| **T-UX-LESSON-01** | Persistencia complete | MUST si bloquea C2 |
| Admin Course UI | Ticket aparte | BRIDGE · no mezclar en F7 |
| T-PUB env staging/prod | Ops | Antecedente C1 |
| T-MVP-COMMUNITY | F8 | OUT |

---

## 13. Cómo probar

### Local (documental / futuro smoke)

1. Entorno LOCAL con T-PUB DONE LOCAL (o equivalente PUBLISHED).  
2. Alumno ACTIVE · opcionalmente completar un nodo.  
3. Cuando exista UI: verificar IN o empty · sin mocks (`VITE_USE_PATH_MOCK=false`).  

### Env medible / launch (capa C)

1. PUBLISHED en ese env.  
2. Complete + persistencia verificada en DB.  
3. Progreso refleja conteo/%/siguiente.  
4. DoD + verify si aplica.

**Esta pasada docs:** pruebas de UI **no** ejecutadas (sin código).

---

## 14. Fuera de alcance

- Implementación UI/API en esta pasada.  
- F8 Comunidad · F9 pagos.  
- Admin Course UI · T-UX implementación.  
- Rachas/rankings/gráficos/logros.  
- Track B · descongelar MVP.  
- Prod DB · commit/push autónomo.  
- Declarar DoD §7.6b cumplido solo con este documento.

---

## 15. Aprobación (cierre F7 documental → D-F7-001) — firmado Juan

**Estado:** **TERMINADA / APROBADA** — **D-F7-001** (2026-07-15) · fase documental.  
**≠** capa **C** (launch/medición) cumplida.

| Campo | Valor |
|-------|-------|
| Lectura `07` completa | ✅ Juan |
| Contrato IN/OUT + fórmula % claros | ✅ |
| Opción C Admin/T-PUB/T-UX reflejada | ✅ |
| B vs C separados · sin claim launch-ready | ✅ |
| F8 OUT · sin código en esta pasada | ✅ |
| Aprobado canónico Mi Progreso Track A (docs) | ✅ **D-F7-001** |

```text
OK Juan §15.
Apruebo docs/features/07-mi-progreso.md como documento canónico de Fase 7 — Mi Progreso / Seguimiento Track A.
Declaro Fase 7 TERMINADA (D-F7-001) como fase documental.
Aclaraciones:
- F7 documental cerrada ≠ launch-ready.
- Launch/medición real queda en capa C y exige entorno medible, contenido PUBLISHED y progreso persistido.
- Admin/Course permanece BRIDGE.
- T-PUB-01 permanece DONE LOCAL, no validación productiva.
- T-UX-LESSON-01 permanece frontera/riesgo si el runner no persiste avance.
- Fase 8 NO queda autorizada.
Sin código. Sin DB. Sin commit/push salvo mandato explícito.
Fecha: 2026-07-15
Decisión: D-F7-001
```

Control roadmap: Fase 7 **TERMINADA** (documental) · **D-F7-WIP** supersedido · Fase 8 **NO INICIADA** · capa C abierta · T-PUB DONE LOCAL · Course BRIDGE · T-UX frontera.

---

*Fin `07-mi-progreso.md` · v1.0 · **TERMINADA** (**D-F7-001**, 2026-07-15) · canónico Mi Progreso Track A (documental) · **≠ launch-ready** (capa C).*