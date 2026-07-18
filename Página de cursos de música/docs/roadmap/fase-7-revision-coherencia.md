# Revisión de coherencia — `07-mi-progreso.md` (archivo histórico pre-firma)

**Fecha revisión:** 2026-07-15  
**Estado archivo:** **CONSUMIDO** por **D-F7-001** (firma Juan §15, 2026-07-15)  
**Rol:** Cursor · revisión documental corta (pre-cierre)  
**Mandato original:** Coherencia vs MVP · F6 · auditoría Admin/editorial · DoD  
**Prohibido en la pasada de revisión:** sin código · sin DB · sin F8 · sin commit/push  
**Nota:** Esta revisión **no** cierra F7 por sí sola; el cierre formal es **D-F7-001**. El canónico vigente es `07` **v1.0**.

---

## 0. Estado canónico vigente (post-higiene)

| Ítem | Estado |
|------|--------|
| F7 | **TERMINADA** documental · **D-F7-001** |
| `07` | **v1.0** firmado |
| Launch-ready Progreso | **NO** (capa C abierta) |
| F8 | **NO** iniciada |
| Course / T-PUB / T-UX | BRIDGE · DONE LOCAL · frontera |

---

## 1. Veredicto (histórico de la revisión)

**`coherente`** (en el momento de la revisión, sobre `07` entonces en EN PRUEBAS / borrador previo a firma).

El borrador del `07` (con ajuste menor de fuente «última actividad») estaba alineado con MVP §6–§7.6b, `06` / F6, auditoría Admin **opción C** y DoD permanente. Esa coherencia habilitó la firma Juan §15; **cumplido** vía **D-F7-001** (canónico hoy **v1.0**).

Cerrar **B** (documental) **no** cierra **C** (launch/medición) — ya explícito en el `07`.

---

## 2. Checklist cruzado

| Fuente | Criterio | ¿`07` OK? |
|--------|----------|-----------|
| MVP §6 IN | Completadas · % · ruta · última actividad · siguiente · empty | ✅ |
| MVP §6 OUT | Rachas · tiempo · rankings · gráficos · logros · predictivo | ✅ WON'T |
| MVP §7.6b | Superficie mínima IN + empty | ✅ mapeado a **capa C** (no a firma docs) |
| MVP §7.1 | Siguiente vía Camino y/o Progreso | ✅ CTA → Camino/sesión |
| F6 / `06` | UserProgress · path · activeNode · anti-demo · T-UX frontera | ✅ §4–§8 |
| Admin auditoría C | Course BRIDGE · Module publish · T-PUB LOCAL ≠ prod | ✅ §3–§4 |
| DoD permanente | Datos reales · empty/loading/error · permisos · no mock launch | ✅ §7 + capa C |
| D-F1-001 | No ampliar MVP | ✅ |

---

## 3. Hallazgos (de la revisión)

| # | Severidad | Hallazgo | Acción |
|---|-----------|----------|--------|
| H1 | Menor | MUST «última actividad» decía “elegir en implementación” y “documentar aquí” a la vez | **Corregido:** primaria `max(completedAt)`; `LessonSession` solo fallback |
| H2 | Info | UI/ruta Progreso **inexistente** — correcto para fase docs; launch = capa C + T-MVP-PROGRESS | Ninguna (ya documentado) |
| H3 | Info | MVP §7.5 T-PUB “satisfecho” en launch global vs DONE LOCAL | `07` no confunde: C1 exige env medible |

No hay contradicción material tipo “F7 launch-ready” o absorción de T-UX/F8/Admin Course.

---

## 4. Confirmaciones de estado

| Ítem | Estado |
|------|--------|
| F7 | **D-F7-001** · TERMINADA documental (post-firma §15) |
| Launch-ready Progreso | **NO** (capa C abierta) |
| F8 | **NO** |
| Código / DB / commit | **NO** en pasada de revisión / higiene |

---

## 5. Cierre D-F7-001 — **firmado** (2026-07-15)

Texto Juan §15 registrado en `docs/features/07-mi-progreso.md` §15 y **D-F7-001** en `decisiones.md`.  
Esta revisión pre-firma queda **archivada / consumida**; no reabrir F7 ni abrir F8 desde este archivo.

---

## 6. Detenerse

**Cumplido:** F7 docs cerrada (**D-F7-001**). **No** abrir F8. Capa C solo con mandato Juan aparte.
