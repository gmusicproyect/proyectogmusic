# T-PUB-02 — Hacer practicable el Bloque 1 piloto B3

**Ticket:** T-PUB-02 — MicroExercise para B3  
**Prerequisito:** T-PUB-01 Fase 1A cerrada (visibilidad admin → alumno PASS local + prod)  
**Estado brief:** ✅ Aprobado · 8 Jul 2026 · JP  
**Estado implementación:** ⏸ Pendiente spec ejecutable Fase 2A + autorización apply datos  
**Spec ejecutable:** `T-PUB-02-fase2a-spec.md` (entregable siguiente; no autoriza apply)

---

## Objetivo

Convertir el módulo admin **B3** — `Tu primer acorde: La menor` (Bloque 1 pedagógico D-GOV-04) en un bloque **practicable y completable** vía lesson runner + `POST /lesson-sessions/:id/complete`, sin romper el pipeline de publicación validado en T-PUB-01.

**Gap actual:** B3 tiene 5 etapas PUBLISHED con metadata pedagógica pero **0 MicroExercise** → visible, no jugable E2E.

**Criterio de éxito futuro:**

```
Mi Camino → B3/etapa → prepare screen → runner → ejercicios
→ POST /complete → progreso/XP sin duplicados
```

**Fuera de alcance:** currículo completo 6–75, limpieza B1/B2 legacy, admin CRUD ejercicios, schema, auth, pagos.

---

## Contexto T-PUB-01 (cerrado)

| Check | Resultado |
|-------|-----------|
| Pipeline publish → alumno (visibilidad) | ✅ Local + prod |
| Piloto identificado | B3 `Tu primer acorde: La menor` (`module.order === 3`) |
| Etapas | 5/5 con `stageType` FUNDAMENTO_UNO → TOCAR |
| MicroExercise B3 | **0** (gap; no falla 1A) |
| B1/B2 legacy | Ruido conocido — **no tocar** en T-PUB-02 |

Evidencia: `docs/operations/T-PUB-01-piloto-bloque-1-admin.md`

---

## 1. Modelo actual de MicroExercise

En Prisma (`MicroExercise`):

| Campo | Rol |
|-------|-----|
| `nodeId` | FK → `PathNode` (`onDelete: Cascade`) |
| `type` | Enum `ExerciseType` |
| `difficulty` | Entero ≥ 1 |
| `instruction` | Copy visible al alumno |
| `contentPayload` | JSON público (opciones, media, tapSequence…) |
| `secureAnswer` | JSON privado — solo backend |
| `order` | Orden dentro del nodo (`@@unique([nodeId, order])`) |

**Contrato de respuesta:** `secureAnswer` usa `{ correctOptionId: string }`. El cliente nunca lo recibe; `server/lib/exercisePublic.ts` sanitiza `contentPayload` antes de exponer.

**Fuente de datos hoy:**

- `prisma/seed.ts` — solo módulos legacy B1 (`Fundamentos`) y B2 (`Acordes abiertos`).
- B3 fue creado vía **Admin Creador** — no existe en seed.
- Admin publish **no crea** MicroExercise (gap G1 en `T-PUB-01-fase0-inventario.md`).

---

## 2. Tipos de ejercicio existentes

Enum `ExerciseType` (4 valores; todos soportados en runner):

| Tipo | Interacción UI | `contentPayload` mínimo |
|------|----------------|-------------------------|
| `IDENTIFY_NOTE` | Multiple choice | `options[]` (≥2); opcional `imageUrl` https |
| `CHORD_SHAPE` | Multiple choice | `options[]`; opcional `diagramLabel` |
| `EAR_TRAINING` | Multiple choice + audio | `options[]` + `audioUrl` https |
| `RHYTHM_TAP` | Tap sequence **o** MC | Con tap: `tapSequence[]`, `submissionOptionId`, `tapHeadline`/`tapDescription`. Sin tap: `options[]` como MC |

Validación cliente: `src/app/components/gmusic/lesson/parse-exercise-payload.ts`. Tipos no parseables → `UnsupportedExercisePanel`.

---

## 3. Relación MicroExercise ↔ PathNode

```
Course → Module (bloque) → PathNode (etapa, stageType) → MicroExercise[]
```

| Capa | Comportamiento |
|------|----------------|
| **GET /me/path** | Carga solo `exercise.type` por nodo → deriva `contentKind` y `duration` |
| **POST /lesson-sessions** | Devuelve ejercicios completos del nodo (`order asc`) |
| **POST /lesson-sessions/:id/complete** | Valida attempts contra `session.node.exercises` (ids + `secureAnswer`) |

B3 hoy: 5 `PathNode` PUBLISHED con `guideText`, `completionCriteria`, `ctaLabel`, `stageType`; **0 filas** `MicroExercise`.

---

## 4. Qué exige POST /lesson-sessions/:id/complete

Body (`parseCompleteSessionBody` en `server/lib/validation.ts`):

```json
{
  "attempts": [
    {
      "microExerciseId": "<uuid>",
      "selectedAnswer": "<optionId o submissionOptionId>",
      "responseTimeMs": 0
    }
  ]
}
```

Reglas críticas (`completeLessonSessionService.ts` — **no modificar en T-PUB-02**):

| Regla | Efecto |
|-------|--------|
| `attempts` no vacío | Array vacío → 400 `VALIDATION_ERROR` |
| UUIDs únicos en attempts | Duplicado → 400 |
| Cada `microExerciseId` ∈ ejercicios del nodo | Ajeno → 400 `INVALID_ATTEMPT` |
| `totalExercises === 0` | 400 «El nodo no tiene ejercicios configurados» |
| `accuracy = correctos / totalExercises` | Denominador = ejercicios del nodo, **no** `attempts.length` |
| `nodeCompleted` | `accuracy ≥ 0.7` → `UserProgress.isCompleted = true` |
| `xpEarned` | `round(accuracy × 100)`; dedup `@@unique([sessionId, reason])` en `XpEvent` |
| Re-submit misma sesión COMPLETED | Idempotente (`alreadyProcessed: true`) |
| Sesión expirada (>3 h) | 410 `SESSION_EXPIRED` |

**Implicación piloto:** si un nodo tiene N ejercicios, el runner debe enviar **N attempts** (uno por ejercicio) para maximizar accuracy.

**Estado B3 hoy:** sesión arranca con `exercises: []` → runner «Sin ejercicios en esta sesión» → complete con `attempts: []` falla en validación.

---

## 5. B1/B2 legacy — modelado actual (referencia, no tocar)

Seed (`prisma/seed.ts`) — **no incluye B3**:

| Módulo seed | Nodos | MicroExercise/nodo |
|-------------|-------|-------------------|
| B1 Fundamentos (`order` 1) | 3 | 2 c/u |
| B2 Acordes abiertos (`order` 2) | 2 | 2 c/u |

Patrón legacy: **2 ejercicios por nodo**, `difficulty` 1–2, mezcla conceptual + práctica.

**Ejemplos reutilizables como patrón** (mismo modelo JSON; distintos `nodeId` en B3):

- B1 nodo «Primer acorde Am»: `CHORD_SHAPE` digitación + `EAR_TRAINING` sample Am.
- B1 nodo «Escucha el pulso»: `RHYTHM_TAP` secuencia + MC patrón.

---

## 6. Qué le falta exactamente a los 5 nodos B3

Módulo admin: título `Tu primer acorde: La menor` · `course.slug` = `ruta-guitarra-12-meses` · `module.order` = 3.

| # | `stageType` | Título etapa | Tiene hoy | Falta |
|---|-------------|--------------|-----------|-------|
| 1 | `FUNDAMENTO_UNO` | Qué es un acorde y por qué Am es la puerta | guideText, criterio, cta | ≥1 `MicroExercise` |
| 2 | `FUNDAMENTO_DOS` | Diagrama de Am: dedos, trastes, cuerdas | idem | ≥1 `MicroExercise` |
| 3 | `TECNICA` | Presión limpia sin trasteo | idem | ≥1 `MicroExercise` |
| 4 | `PRACTICA` | Armar el acorde por cuerdas | idem | ≥1 `MicroExercise` |
| 5 | `TOCAR` | Am al pulso | idem | ≥1 `MicroExercise` |

Sin `videoUrl` en la mayoría de etapas — prepare screen funciona con guía/criterio (T-UX-LESSON-01A).

---

## 7. Opciones para poblar B3

| Opción | Veredicto |
|--------|-----------|
| **A. Extender `seed.ts` con módulo order 3** | ❌ B3 no nació del seed; IDs distintos; re-seed arriesga B1/B2 |
| **B. Script operativo idempotente** (`--dry-run` / `--apply`) | ✅ **Aprobado como dirección Fase 2A** |
| **C. Prisma Studio / SQL manual** | ⚠️ Solo emergencia |
| **D. Admin CRUD futuro** | 🔜 Post-piloto (gap G1) |
| **E. Copiar ejercicios B1→B3 por SQL ciego** | ❌ Frágil (UUIDs) |

**Decisión JP (8 Jul 2026):** vía **B** aprobada en principio. **No autorizado aún:** implementar script, `--apply`, datos local/prod, seed, edición manual B3.

---

## 8. Propuesta de contenido mínimo por etapa (base aprobada)

Base de trabajo aprobada por JP. **Copy final** debe figurar en `T-PUB-02-fase2a-spec.md` antes de crear datos.

| Etapa | Tipo sugerido | Idea mínima |
|-------|---------------|-------------|
| **1 · FUNDAMENTO_UNO** | `CHORD_SHAPE` MC | «¿Qué es un acorde?» — 3 opciones |
| **2 · FUNDAMENTO_DOS** | `CHORD_SHAPE` MC | Digitación Am `0-1-2-2-0-0` |
| **3 · TECNICA** | `CHORD_SHAPE` MC | Presión limpia / evitar trasteo |
| **4 · PRACTICA** | `RHYTHM_TAP` | Secuencia taps cuerda por cuerda |
| **5 · TOCAR** | `RHYTHM_TAP` | 4 beats «Am al pulso»; opcional `EAR_TRAINING` si hay audio |

**Volumen piloto sugerido:** 5–8 `MicroExercise` total (1–2 por etapa).

---

## 9. Riesgos al tocar datos prod

| Riesgo | Mitigación |
|--------|------------|
| Supabase compartido local = prod | `--dry-run` obligatorio primero; backup antes de `--apply` prod |
| `nodeId` equivocado | Lookup por `course.slug` + título módulo + `stageType` + título etapa |
| Ejercicios en nodos legacy | Scope estricto: solo 5 nodos B3 |
| Re-edit published → DRAFT (G7) | No re-editar bloque B3 durante el ciclo |
| Sesiones STARTED en vuelo | Alumno inicia sesión nueva post-insert |
| Progresión secuencial | B3 `locked` hasta completar 5 nodos B1+B2 — ver §10 |
| Audio URLs placeholder | Validar CDN o usar MC sin audio en piloto |
| Re-run | Upsert `(nodeId, order)` evita duplicados |

---

## 10. Dependencia de progresión (smoke E2E)

`deriveNodeStatuses` (`server/lib/nodeStatus.ts`) desbloquea en orden global módulo → nodo.

**B3 etapa 1** pasa a `active`/`available` solo tras completar los **5 nodos** B1+B2 legacy.

Smoke de jugabilidad B3 requiere cuenta con progreso legacy o bypass solo-dev documentado en spec Fase 2A.

---

## 11. Recomendación de implementación segura (Fase 2A)

1. JP aprueba `T-PUB-02-fase2a-spec.md` (copy final + checklist).
2. Cursor implementa script ops idempotente — **sin** `--apply` hasta autorización explícita.
3. `--dry-run` local → revisión logs.
4. Smoke local E2E (una etapa B3 mínimo).
5. `--apply` prod solo con checklist ops + backup.

### Fuera de alcance T-PUB-02

- Schema / migraciones / `completeLessonSessionService.ts`
- Admin CRUD ejercicios · T-UX-LESSON-01B/C/E
- Limpieza B1/B2 · auth · pagos · admin password reset

---

## Referencias

| Documento | Uso |
|-----------|-----|
| `T-PUB-01-piloto-bloque-1-admin.md` | Cierre 1A + inventario B3 |
| `T-PUB-01-fase0-inventario.md` | Gap G1 (sin MicroExercise en admin) |
| `docs/product/mapa-bloques-nivel-1.md` | Bloque 1 pedagógico D-GOV-04 |
| `prisma/seed.ts` | Patrones JSON legacy B1/B2 |
| `T-PUB-02-fase2a-spec.md` | Spec ejecutable script (siguiente entregable) |

---

## Historial de decisiones

| Fecha | Decisión | Por |
|-------|----------|-----|
| 8 Jul 2026 | T-PUB-01 Fase 1A cerrada; gap B3 = 0 MicroExercise | JP |
| 8 Jul 2026 | T-PUB-02 brief aprobado; vía B (script ops) aprobada en dirección | JP |
| 8 Jul 2026 | **No** autorizado: implementar script, apply datos, seed, edición manual | JP |
