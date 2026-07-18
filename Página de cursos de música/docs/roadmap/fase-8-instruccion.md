# Instrucción Fase 8 — Comunidad

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de producto/docs — **no** es el documento `08` final ni autorización de código, DB, migraciones o prod.  
> **Duración poster Fase 8:** ~2–3 semanas.  
> **Estado de esta instrucción:** **lista** · **Fase 8 NO INICIADA** · ejecución documental **NO** · F9 **NO**.  
> **Entregable (solo tras OK ejecución):** `docs/features/08-comunidad.md`.  
> **Prerreqs cerrados:** **D-F1-001**…**D-F7-001** · higiene post-F7 · DoD permanente · MVP congelado.  
> **Ticket ancla:** **T-MVP-COMMUNITY** (MUST **si en nav** · **D-ROAD-005 C**).  
> **Restricciones vigentes:** sin código · sin DB · sin F9 · sin commit/push · **no** ampliar MVP · capa C Progreso **no** absorbida.

---

## Propósito de esta instrucción

Contrato de trabajo para, cuando Juan autorice **ejecución documental**, producir:

`docs/features/08-comunidad.md`

y acotar (sin ampliar MVP) la **Comunidad alumno**: feed real reducido — ver / publicar / comentar sobre API/DB — con empty/loading/error, permisos ACTIVE, y **cero mocks de launch** si la superficie está o se desbloquea en nav.

| Es | No es |
|----|--------|
| Guía para auditar feed / enrollment / posts vs mocks | Autorización a implementar UI o desbloquear nav ahora |
| Matriz MUST IN/OUT del MVP §6 Comunidad + §7.6c | Inventar DM / chat RT / notif. / social avanzado |
| Plantilla exacta del `08` | Crear `08-comunidad.md` **en esta pasada de brief** |
| Puente F4 (auth) + F6 (header bloqueado) → contrato launch | Reabrir Mi Camino / Progreso capa C / Admin Course |
| Separación **F8 documental** vs **F8 launch/medible** | Vender Comunidad launch-ready solo por existir el `08` |

**Regla de oro:** hay **feed API + modelos** (`CommunityEnrollment`, `CommunityPost`) y también **mocks** (`mock-community-data`, peers/mentorship). Fase 8 **no inventa red social**. Documenta el contrato reducido, la frontera mock ≠ launch, el candado nav (**D-F6-ANTI-DEMO**), y **no** descongela el MVP.

### Inventario ancla (estado de código · no ejecución)

| Hecho | Consecuencia para F8 |
|-------|----------------------|
| Feed API / modelos Prisma existen (parcial) | Soporta contrato “feed real” |
| Peers / mentorship / curated mock en FE | **≠** contrato launch (D-ROAD-005 C · DoD) |
| Header alumno Comunidad **bloqueada** (candado) | Mitiga mocks hoy; desbloqueo = T-MVP-COMMUNITY + feed real |
| Página `community` sin URL sync en tabla AGENTS | Documentar en `08`; no inventar URL sin arquitectura |
| Landing `#comunidad` (marketing) | Distinta de Comunidad **alumno**; no sustituye §7.6c |

### Qué NO es Fase 8

- Fase 7 — Mi Progreso (**D-F7-001** cerrado; capa C / **T-MVP-PROGRESS** = mandato aparte).  
- Fase 9 — Pagos / Stripe / pasarela.  
- Fase 10 — pulir/lanzar global (salvo criterios Comunidad del DoD producto).  
- Desbloquear nav Comunidad **por código** en esta pasada de brief.  
- DM · chat realtime · videollamada · notificaciones complejas · gamificación comunitaria profunda (**WON'T**).  
- Absorber T-UX-LESSON / T-PUB prod / Admin Course UI.  
- DeclaraF8 “lista para launch” sin criterios de medición (§ aparte).  
- Commit / push / prod DB autónomos.

---

## Prerrequisitos

| # | Prerrequisito | Estado |
|---|---------------|--------|
| 1–7 | D-F1…D-F7-001 · higiene post-F7 · DoD | ✅ |
| 8 | MVP §6 Comunidad · §7.6c · D-ROAD-005 **C** | ✅ congelado |
| 9 | Header Comunidad bloqueado (**D-F6-ANTI-DEMO-001**) | ✅ |
| 10 | Esta instrucción leída como método | ✅ (este brief) |
| 11 | OK Juan **ejecutar** F8 (docs) | ❌ **pendiente** |

---

## Objetivo de la Fase 8 (roadmap)

> **Comunidad alumno sin mocks de launch:** feed real básico (versión reducida) para el alumno autenticado con `Subscription ACTIVE`, coherente con **D-ROAD-005 C** y MVP §7.6c.

```text
  JWT + Subscription ACTIVE (D-017)
           │
           ▼
  CommunityEnrollment (contexto) + CommunityPost (API/DB)
           │
           ├── ver · publicar · comentar (+ filtro nivel si viable)
           ├── empty / loading / error (DoD)
           ├── moderación admin mínima
           └── nav desbloqueada solo si superficie ≠ mocks launch
                    │
                    └── mocks peers/mentorship = SOLO dev/demo etiquetada
```

*Landing `#comunidad` = marketing. F8 = Comunidad **alumno**.*

---

## Contrato MVP — IN / OUT / BRIDGE

### MUST (IN) — si la superficie está en nav (o se pretende desbloquear)

| Capacidad | Nota |
|-----------|------|
| Ver posts del feed | API/DB real |
| Publicar post | Auth + ACTIVE |
| Comentar | API/DB real |
| Empty state feed vacío | DoD · sin inventar peers |
| Loading / error | DoD |
| Moderación admin mínima | Borrar/ocultar o equivalente documentado |
| Mocks ≠ launch | Peers/mentorship curated **no** son contrato de lanzamiento |
| Responsive happy path | DoD · MVP §7.8 |

### SHOULD

| Capacidad | Nota |
|-----------|------|
| Filtro / contexto por nivel (enrollment / `academicTierId`) | “si viable” — no bloquear F8 docs si impreciso |
| URL estable o sync documentado | Decidir en ejecución `08`; respetar mapa AGENTS |
| Desbloquear nav cuando contrato launch cumplido | Ticket **T-MVP-COMMUNITY** |

### WON'T (post-MVP / explícito)

DM · chat realtime · videollamada · notificaciones complejas · social/gamificación comunitaria profunda · foro multi-curso · reputación/ranks comunitarios.

### BRIDGE / fronteras externas (no absorbe F8)

| Capacidad | Nota |
|-----------|------|
| Admin/Course UI | **BRIDGE** (opción C F7) — fuera |
| T-PUB-01 | **DONE LOCAL** ≠ prod — no reabrir como F8 |
| T-UX-LESSON-01 | Frontera progreso/lección — no Comunidad |
| T-MVP-PROGRESS / capa C | Mandato aparte — no mezclar en `08` |
| WhatsApp | BRIDGE conversión — no es feed alumno |

### Condicional crítico (MVP)

| Condición | Efecto |
|-----------|--------|
| Comunidad **en nav** alumno (o se desbloquea) | Feed real = **MUST** pre-launch (§7.6c) |
| Comunidad **fuera de nav** y no prometida | Puede quedar fuera del happy path pedagógico; mocks no deben aparentar producto |
| Header **bloqueado** (estado actual) | Mitiga riesgo; **no** sustituye cerrar T-MVP-COMMUNITY si se quiere nav real |

---

## Dependencias (auth + datos reales)

| Dependencia | Rol |
|-------------|-----|
| **Auth JWT** + sesión cookie | Identidad del autor de posts/comentarios |
| **Subscription ACTIVE** (D-017) | Zona alumno; misma frontera que Camino |
| `CommunityEnrollment` | Contexto instrumento / nivel / programa |
| `CommunityPost` (+ comentarios si existen en schema) | Fuente feed |
| Guards API + FE | Sin “confiar solo en UI” (DoD #6) |
| Admin mínimo | Moderación |

**Prohibido en launch:** presentar `mock-community-data` / peers curados / mentorship fake como verdad de producto.

---

## Capas de cierre (B vs C) — no confundir

| Capa | Qué cierra | Qué **no** cierra |
|------|------------|-------------------|
| **B — Documental** | Existe `08` + fronteras mock/nav/API · firma → **D-F8-001** (docs) | Launch-ready Comunidad |
| **C — Launch/medible** | §7.6c en env acordado: ver/publicar/comentar API real · nav sin mocks · empty real · DoD | Solo porque el `08` exista |

Regla: cumplir **B** ≠ cumplir **C**. Igual que F7 Progreso.

---

## Criterios de aceptación (documental = esta fase tras OK ejecución)

### A) Brief (esta pasada) — **CUMPLIDO** al existir esta instrucción + brief supervisor

- [x] Objetivo F8 + IN/OUT + mock ≠ launch.  
- [x] Gate Juan para ejecución documental.  
- [x] F8 ejecución **NO** · F9 **NO** · sin `08` · sin código/DB/commit.

### B) Ejecución F8 **documental** (`08` + firma) — **NO iniciada**

Cierra la fase **documental** cuando:

- [ ] Existe `docs/features/08-comunidad.md` con plantilla.  
- [ ] IN/OUT/BRIDGE + fuentes API/DB vs mocks mapeadas.  
- [ ] Empty / loading / error / permisos ACTIVE documentados.  
- [ ] Nav candado vs desbloqueo (T-MVP-COMMUNITY) explícito.  
- [ ] Capas B vs C; **no** claim launch-ready solo por docs.  
- [ ] Juan firma cierre documental (**D-F8-001** o equivalente).  
- [ ] F9 permanece **NO**.

### C) Launch / medición (MVP §7.6c · DoD) — **separados**

1. Alumno ACTIVE puede ver / publicar / comentar sobre **API real** en env acordado.  
2. Nav (si visible) **sin** dependencia de mocks de launch.  
3. Empty state real si feed vacío.  
4. Moderación mínima operable.  
5. Verify/smoke según DoD si hubo código.  

### D) DoD permanente

Checklist `docs/quality/definition-of-done.md` aplica a cualquier implementación posterior (E2E, datos reales, estados, permisos, responsive, tests, no romper funnels).

---

## Riesgos conocidos

| Riesgo | Mitigación en brief / `08` |
|--------|----------------------------|
| Desbloquear nav sin quitar mocks | Prohibido; T-MVP-COMMUNITY = feed real primero |
| Confundir landing `#comunidad` con alumno | Separar en `08` |
| Ampliar a “red social” | WON'T listado; D-F1-001 |
| Mezclar capa C Progreso / T-UX / T-PUB | Fronteras explícitas OUT |
| Feed API parcial / comentarios incompletos | Auditar en ejecución; tickets — no improvisar alcance |
| Moderación ausente → spam launch | MUST documentar mínimo admin |
| Commit/push autónomo | Prohibido sin OK Juan |

---

## Plantilla `docs/features/08-comunidad.md` (solo ejecución)

```text
# 08 — Comunidad (Track A)
## 0. Metadatos (versión · D-F8-WIP · ≠ launch-ready)
## 1. Objetivo
## 2. Alcance IN / OUT / BRIDGE
## 3. Inventario real (API · modelos · FE · mocks · nav candado)
## 4. Contrato funcional (ver / publicar / comentar · filtro nivel)
## 5. Dependencias auth + ACTIVE + enrollment
## 6. Estados UI (empty / loading / error / con datos / bloqueado)
## 7. Mocks ≠ launch (peers / mentorship / curated)
## 8. Nav header + T-MVP-COMMUNITY (desbloqueo)
## 9. Moderación admin mínima
## 10. Relación F6 / F7 / F9 / landing marketing
## 11. Capas B (docs) vs C (launch §7.6c)
## 12. Tickets
## 13. Cómo probar
## 14. Fuera de alcance
## 15. Aprobación Juan → D-F8-001 (documental ≠ launch-ready)
```

---

## Método de ejecución documental (cuando Juan autorice)

1. Releer este brief + MVP §6 Comunidad · §7.6c + DoD + `06` anti-demo Comunidad + `07` fronteras.  
2. Auditar (lectura): rutas community, `mock-community-data`, API posts/enrollment, header locked.  
3. Redactar `08` con capas B vs C y mock ≠ launch.  
4. **No** implementar UI / desbloquear nav salvo mandato explícito en el mismo OK.  
5. D-F8-WIP → firma D-F8-001 **documental**.  
6. F9 NO · commit/push solo con OK Juan.

---

## Gate Juan — autorización ejecución documental

```text
OK, ejecuta Fase 8 documental.
Alcance: crear docs/features/08-comunidad.md según fase-8-instruccion.md.
Sin declarar launch-ready.
Sin DM/chat RT/videollamada/notif. complejas.
Sin desbloquear nav Comunidad en código salvo que este OK lo pida.
Sin F9 · sin absorber T-MVP-PROGRESS / T-UX / T-PUB prod / Admin Course.
Sin código UI (salvo que este OK lo pida) · sin DB · sin commit/push.
```

---

## Relación T-* / fases

| Ítem | Relación |
|------|----------|
| T-MVP-COMMUNITY | Ticket MUST si en nav / desbloqueo |
| D-F6-ANTI-DEMO | Nav bloqueada vigente hasta feed real |
| T-MVP-PROGRESS | Capa C F7 · **fuera** de F8 |
| T-PUB-01 | DONE LOCAL · **fuera** |
| T-UX-LESSON-01 | Frontera lección · **fuera** |
| Admin/Course | BRIDGE · **fuera** |
| F9 | **NO** |

---

*Brief F8 · listo para ejecución documental · ejecución **NO iniciada** · F9 **NO** · sin `08` · sin código/commit.*
