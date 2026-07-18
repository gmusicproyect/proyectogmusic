# Instrucción Fase 7 — Mi Progreso / Seguimiento

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de producto/docs — **no** es el documento `07` final ni autorización de código, DB, migraciones o prod.  
> **Duración poster Fase 7:** ~1–2 semanas.  
> **Estado de esta instrucción:** **CERRADA** — Fase 7 documental **TERMINADA** (**D-F7-001**, 2026-07-15) · **D-F7-WIP** supersedido · **≠ launch-ready**.  
> **Entregable:** `docs/features/07-mi-progreso.md` — **v1.0 firmado** Juan §15.  
> **Prerreqs cerrados:** D-F1…D-F6-001 · higiene post-F6 · **D-TPUB-01** · **D-F6-ANTI-DEMO-001** · auditoría Admin/editorial pre-F7 (**opción C**).  
> **Auditoría ancla:** `docs/roadmap/auditoria-admin-editorial-pre-f7.md`.  
> **Ticket ancla:** **T-MVP-PROGRESS** (MUST pre-launch · D-ROAD-005 B).  
> **Restricciones vigentes:** sin código · sin DB · sin F8 · sin commit/push · MVP congelado (**D-F1-001**).

---

## Propósito de esta instrucción

Esta instrucción es el **contrato de trabajo** para, cuando Juan autorice **ejecución documental**, producir:

`docs/features/07-mi-progreso.md`

y acotar (sin ampliar MVP) la **superficie mínima de Mi Progreso** del alumno ACTIVE: métricas útiles basadas en progreso real (`UserProgress` / path / sesiones), empty state, y CTA a la siguiente lección — **sin** dashboards de gamificación avanzada y **sin** declarar launch-ready mientras no exista entorno medible.

| Es | No es |
|----|--------|
| Guía para auditar datos de progreso existentes + frontera Admin | Autorización a implementar UI ahora (salvo mandato explícito) |
| Matriz MUST IN/OUT del MVP §6 Mi Progreso | Inventar rachas/rankings/gráficos |
| Plantilla exacta del `07` | Crear `07-mi-progreso.md` **en esta pasada de brief** |
| Puente F6 → lectura agregada del avance | Reabrir Mi Camino / anti-demo / T-PUB |
| Separación **F7 documental** vs **F7 launch/medible** | Vender Progreso como launch-ready sin PUBLISHED + progreso persistido |

**Regla de oro:** hay datos de progreso en schema/API; **no** hay página Mi Progreso. F7 **no inventa el motor**. Documenta el contrato mínimo, incorpora la frontera Admin (**opción C**), y **no** descongela el MVP.

### Política opción C (auditoría Admin/editorial)

| Afirmación | Consecuencia |
|------------|--------------|
| Admin **Module → 5 PathNode → publish** está definido y probado **LOCAL** | Sostiene Camino local y puede alimentar Progreso **donde haya datos** |
| **Course** Admin UI = **BRIDGE** (seed/ops) | Documentar · **no** exigir LMS Course completo para abrir F7 **docs** |
| **T-PUB-01 = DONE LOCAL** · **no** validación productiva | Progreso **no** se declara listo para launch/prod por ese piloto |
| F7 **docs/contrato** puede avanzar | Sí, con fronteras explícitas |
| F7 **launch-ready / DoD §7.6b en env de lanzamiento** | Requiere entorno medible: contenido **PUBLISHED** + progreso **real persistido** (+ T-UX si no se puede completar) |

### Qué NO es Fase 7

- Fase 6 — Mi Camino (**D-F6-001**).  
- Fase 8 — Comunidad.  
- Fase 9 — Stripe.  
- Implementar **T-UX-LESSON-01** (OUT salvo mandato).  
- Reabrir T-PUB o “completar Admin Course” como parte oculta de F7.  
- Rachas/rankings/gráficos/logros/predictivo/tiempo exacto (**OUT MVP**).  
- DeclaraF7 “lista para launch” sin criterios de medición (§ aparte).  
- Commit / push / prod DB autónomos.

---

## Prerrequisitos

| # | Prerrequisito | Estado |
|---|---------------|--------|
| 1–8 | D-F1…D-F6-001 · higiene · anti-demo · DoD | ✅ |
| 9 | **D-TPUB-01** DONE LOCAL · **no** productiva | ✅ |
| 10 | Auditoría Admin pre-F7 · **opción C** adoptada | ✅ `auditoria-admin-editorial-pre-f7.md` |
| 11 | OK Juan **ejecutar** F7 (docs) | ❌ **pendiente** |

---

## Objetivo de la Fase 7

> El alumno ACTIVE entiende **cuánto avanzó**, **dónde está**, **última actividad** y **siguiente lección**, con datos reales y empty state — sin gamificación avanzada.

```text
  PathNode PUBLISHED + UserProgress (+ LessonSession)
           │
           ▼
  Agregados lectura → superficie Mi Progreso (IN MVP)
           │
           ├── empty / loading / error (DoD)
           └── CTA siguiente → Mi Camino / sesión
                    └── T-UX si no persiste (frontera)
```

*F6 = mapa; F7 = resumen de avance.*

---

## Contrato MVP — IN / OUT / BRIDGE

### MUST (IN) — superficie mínimo

| Capacidad | Nota |
|-----------|------|
| Lecciones/nodos completados (conteo real) | `UserProgress.isCompleted` |
| % avance **real** (fórmula documentada en `07`) | Sobre PathNode **PUBLISHED** del curso activo |
| Curso / ruta activa | Coherente con F6 / pathPresentation |
| Última actividad | Fuente documentada (session / `completedAt`) |
| Siguiente lección + CTA | Alineada a `activeNodeId` / next path |
| Empty state | Sin métricas inventadas |
| Datos API/DB · mock ≠ launch | Anti-demo |
| ACTIVE + responsive | D-017 · DoD |

### SHOULD

| Capacidad | Nota |
|-----------|------|
| URL `/mi-progreso` o sección estable | Decidir en ejecución; documentar routing |
| Enlace nav / Mi Estudio | Si visible, debe ser real |
| Reuso `dashboardAssembly` | Evitar duplicar lógica |

### WON'T

Rachas avanzadas · tiempo exacto · rankings · gráficos · logros · predictivo · XP como promesa principal.

### BRIDGE (explícitos — opción C)

| Capacidad | Nota |
|-----------|------|
| **Course** create/publish vía Admin UI | **BRIDGE** seed/ops — documentado; no bloquear F7 docs |
| Materia solo **LOCAL** (T-PUB DONE LOCAL) | Válido para pruebas locales; **≠** launch |
| Completados 0 por falta de runner | Empty válido en docs; launch exige persistencia (T-UX si aplica) |

---

## Dependencias

### Contenido PUBLISHED

| Hecho | Implicación F7 |
|-------|----------------|
| Module publish Admin existe | Fuente de nodos contables |
| Course vía seed BRIDGE | Aceptado en docs; gap launch documentado |
| T-PUB LOCAL | Puede haber %/ruta en Docker local |
| Sin PUBLISHED en un env | Empty o “sin ruta” — **no** inventar avance |

### Persistencia de progreso real

| Hecho | Implicación F7 |
|-------|----------------|
| `UserProgress` / sesiones | Fuente MUST de “completadas” / última actividad |
| Runner no completa ni guarda | Riesgo **T-UX-LESSON-01** — F7 no miente con % falso |
| Demo/`localStorage` | **≠** progreso suscriptor launch |

### Admin / editorial (auditoría C)

| Hecho | Implicación F7 |
|-------|----------------|
| Admin Module pipeline LOCAL OK | Soporta Camino → datos Progreso **donde hay publish** |
| Course Admin faltante | **No** bloquea `07` documental |
| Trust prod (credencial, Prisma, T-PUB env) | Bloquea **declarar launch** Progreso, no el brief |

---

## Riesgos

| Riesgo | Tratamiento |
|--------|-------------|
| Vender F7 como launch-ready | **Prohibido** sin § criterios medición |
| % inventado / mock | Prohibido |
| Ignorar Course BRIDGE | Documentar en `07` |
| T-UX no persiste | Frontera: empty o gap MUST pre-launch |
| Absorber Admin Course UI en F7 | OUT — ticket aparte |
| Absorber F8 / rachas | OUT MVP |

---

## Criterios de aceptación — dos capas

### A) Este brief (ahora)

- [x] Instrucción + brief supervisor actualizados con opción C.  
- [x] Frontera Admin/Course BRIDGE · T-PUB LOCAL · T-UX.  
- [x] Criterios **documentales** vs **launch/medición** separados.  
- [x] Ejecución F7 **NO** · F8 **NO** · sin código/DB/commit.  

### B) Ejecución F7 **documental** (`07` + D-F7-WIP → firma) — **CUMPLIDO (D-F7-001)**

Cierra la fase **documental** cuando:

- [x] Existe `docs/features/07-mi-progreso.md` con plantilla.  
- [x] Campos IN con **fuente de datos** y **fórmula %**.  
- [x] Empty / loading / error documentados.  
- [x] Fronteras: F6 · Admin/Course BRIDGE · T-PUB DONE LOCAL ≠ prod · T-UX · F8 OUT.  
- [x] Criterios **launch/medición** listados como **no cumplidos** hasta env medible (salvo evidencia).  
- [x] Juan firma cierre documental (**D-F7-001**).  
- [x] **No** se afirma “Mi Progreso launch-ready” solo por existir el `07`.

### C) Launch / medición real (MVP §7.6b · DoD producto) — **separados**

Para declarar Mi Progreso **usable en launch** (o DoD §7.6b en el env de lanzamiento):

1. Entorno acordado con Course + ≥1 Module **PUBLISHED** (T-PUB en ese env o equivalente ops — **no** basta solo DONE LOCAL por defecto).  
2. Alumno ACTIVE puede **completar** ≥1 nodo y **persistir** `UserProgress` (si no → **T-UX-LESSON-01** MUST).  
3. Superficie Progreso muestra campos IN con esos datos (o empty real pre-avance).  
4. Sin mocks de launch · verify/smoke según DoD si hubo código.  
5. Course BRIDGE aceptable solo si ops documenta cómo el Course queda PUBLISHED en ese env.

**Regla:** cumplir **B** ≠ cumplir **C**.

### D) DoD permanente

Aplica a cualquier implementación futura; “verse bonito” no basta. Datos reales · empty/loading/error · ACTIVE · responsive · tests · MVP congelado.

---

## Plantilla `docs/features/07-mi-progreso.md` (solo ejecución)

```markdown
# 07 — Mi Progreso / Seguimiento (Track A)
## 0. Metadatos
## 1. Propósito y alcance
## 2. Objetivo MVP
## 3. Contrato MUST / SHOULD / WON'T / BRIDGE
## 4. F6 vs F7 · Admin/Course BRIDGE · T-PUB LOCAL
## 5. Routing / nav / guard
## 6. Fuentes de datos · fórmula %
## 7. Estados vacío / cargando / error / con datos
## 8. Frontera T-UX-LESSON-01 · F8
## 9. Matriz existe / parcial / gap
## 10. Criterios B (documental) vs C (launch/medición)
## 11. Riesgos y deuda ops
## 12. Tickets (T-MVP-PROGRESS · T-UX)
## 13. Cómo probar (local vs env medible)
## 14. Fuera de alcance
## 15. Aprobación Juan → D-F7-001 (documental ≠ launch-ready)
```

---

## Método de ejecución documental (cuando Juan autorice)

1. Releer este brief + auditoría Admin + MVP §6–§7.6b + `06` + DoD.  
2. Auditar fuentes (lectura): UserProgress, path, dashboardAssembly, nav.  
3. Redactar `07` con fronteras opción C y capas B vs C.  
4. **No** implementar UI salvo mandato explícito en el mismo OK.  
5. ~~D-F7-WIP → firma D-F7-001 **documental**.~~ ✅ **D-F7-001** (2026-07-15).  
6. F8 NO · commit/push solo con OK Juan.

---

## Gate Juan

```text
OK, ejecuta Fase 7 documental.
Alcance: crear docs/features/07-mi-progreso.md según fase-7-instruccion.md
(incorporando auditoría Admin/editorial opción C).
Sin declarar launch-ready.
Sin rachas/rankings/gráficos.
Sin Admin Course UI · sin F8 · sin T-UX salvo mandato.
Sin código UI (salvo que este OK lo pida) · sin DB · sin commit/push.
```

---

## Relación T-* / fases

| Ítem | Relación |
|------|----------|
| T-MVP-PROGRESS | Ticket MUST F7 |
| T-PUB-01 | DONE LOCAL · ≠ prod |
| Admin/Course | BRIDGE documentado |
| T-UX-LESSON-01 | Riesgo persistencia · OUT salvo mandato |
| F8 | NO |

---

*Instrucción F7 · opción C · **D-F7-001** documental cerrado · **≠ launch-ready** · F8 NO · capa C abierta.*
