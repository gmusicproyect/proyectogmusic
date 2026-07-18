# Auditoría — Estructura editorial / Admin (antes de F7)

**Fecha:** 2026-07-15  
**Rol:** Cursor · auditoría documental/técnica (solo lectura)  
**Mandato:** Pausar avance F7 · verificar si Admin sostiene Mi Camino y luego Mi Progreso  
**Prohibido respetado:** sin código · sin DB · sin abrir F7 · sin commit/push  

**Fuentes:** `05-academia-cursos.md` · `06-mi-camino.md` · `01-mvp` · `02-modelo-datos` · `t-pub-01-evidencia-local.md` · `D-F5-001` / `D-TPUB-01` / `D-F6-001` · DoD · `AdminPage` / `admin.ts` / `curriculum.ts` / `schema.prisma` (lectura)

---

## 1. Veredicto / recomendación

**`documentar frontera + no bloquear brief F7 por modelo; sí bloquear launch/prod de Progreso si no hay materia PUBLISHED en el entorno de medición`**

Más corto:

| Pregunta | Respuesta |
|----------|-----------|
| ¿La estructura editorial está definida para Camino? | **Sí** (schema + Admin R-008 + filtros PUBLISHED + T-PUB DONE **LOCAL**) |
| ¿Admin es ya “fuente real” en todo entorno? | **No** — Course vía **seed/ops BRIDGE**; publish de **Module** sí vía Admin; **prod/staging no verificados** |
| ¿Bloquea **preparar/ejecutar F7 docs**? | **No** — F7 lee `UserProgress` + PathNode; contrato se puede documentar |
| ¿Bloquea **Mi Progreso con datos útiles en un entorno?** | **Sí**, si ese entorno no tiene Course/Module PUBLISHED + completados reales |
| **Recomendación** | **Avanzar a F7 documental cuando Juan quiera** · en paralelo o antes de **código F7 / launch**: mantener frontera **Admin-publicación** (Course BRIDGE, T-PUB ≠ prod, media SHOULD) explícita · **no** fingir Admin LMS completo |

---

## 2. Qué ya está definido

### Modelo (Fase 2 / Prisma)

```text
Course (PublishStatus) → Module (bloque) → PathNode (etapa/“lección”) ×5 StageType
                                              └─ MicroExercise (opcional)
UserProgress (userId, nodeId) · LessonSession
```

- **Lección** canónica = `PathNode` (no tabla `Lesson` duplicada).  
- Cinco tarjetas = 5 `PathNode` / `StageType` por Module.  
- Media = campos en PathNode (`videoUrl`, `guide*`, `completionCriteria`).  
- Documentado en `02-modelo-datos.md` + `05-academia-cursos.md`.

### Admin R-008 (código + canónico F5)

| Capacidad | Estado |
|-----------|--------|
| UI `AdminPage` + API `/admin/modules` | Existe |
| Crear Module (bloque) bajo Course | Existe (`POST /admin/modules`) |
| Editar 5 slots → PathNode | Existe (`PUT .../slots/:order`) |
| Validar + publicar Module | Existe (`validateModuleForPublish` + `POST .../publish`) |
| Listar / detalle / borrar Module | Existe |
| Guards `requireAdmin` | Existe (`04-auth`) |

**Umbral publish (D-F5-001):** título + `completionCriteria` + 5 `StageType` · media/micro = SHOULD.

### Pipeline alumno (Mi Camino)

| Capacidad | Estado |
|-----------|--------|
| Solo contenido **PUBLISHED** en `GET /me/path` | Existe |
| Desbloqueo + `UserProgress` | Existe (**D-F6-001**) |
| Zona ACTIVE (D-017) | Existe |
| Anti-demo path | Cerrado (**D-F6-ANTI-DEMO-001**) |

### Gobernanza

- Academia/Cursos canónico: **D-F5-001**.  
- MVP congelado: **D-F1-001** (Admin publish pipeline = MUST soporte).  
- DoD: datos reales / no mock launch.

---

## 3. Qué existe solo como piloto LOCAL (o BRIDGE)

| Pieza | Naturaleza |
|-------|------------|
| **T-PUB-01 DONE LOCAL** | Piloto Docker local · evidencia IDs · **no** prod · **no** launch staging (**D-TPUB-01**) |
| Course `ruta-guitarra-12-meses` PUBLISHED | Creado/actualizado por **seed** — **sin UI Admin create/publish Course** |
| Alumno ACTIVE de prueba | Seed QA (`carlos@…`) — no usuario real prod |
| Schema local fresh | `migrate deploy` UUID roto → workaround `db push` (**R-OPS-MIGRATE-UUID**) |
| Módulos seed adicionales | Pueden coexistir con el bloque Admin; no confundir con pipeline publish |
| Media / MicroExercise en umbral publish | **No** exigidos en piloto LOCAL |

---

## 4. Qué falta para que Admin sea “fuente real” de clases

Definición operativa de “fuente real”:

> Un admin puede, **en el entorno de lanzamiento acordado**, crear/editar/publicar la materia que el alumno ACTIVE consume en Mi Camino (y que alimenta Progreso), **sin** depender de seed oculto ni de editar código.

| Gap | Severidad | Notas |
|-----|-----------|-------|
| **UI/API Admin para Course** (crear, editar, publish Course) | Media (BRIDGE documentado) | Hoy Course = seed/ops |
| **T-PUB / materia en staging o prod** | Alta para **launch** | DONE LOCAL ≠ entorno lanzamiento |
| **Runbook ops** publish Course + Module en cada env | Media | Parcial en setup/ops |
| **Media / criterios ricos** por etapa | SHOULD contenido | No bloquea Camino mínimo |
| **MicroExercise** vía Admin fluido | Frontera T-UX / contenido | No bloquea % Progreso mínimo |
| **Orden/reorden editorial** avanzado | Baja | `order` existe; UX puede mejorar |
| **Unpublish / ARCHIVED** flujo claro en UI | Baja–media | Enum existe; ops a documentar |
| **INC-admin-cred / R-OPS-01** | P0 ops launch | Fuera de modelo editorial pero bloquean trust prod |

**Conclusión gap Admin:** el **pipeline Module → 5 PathNode → publish → `/me/path`** está definido y probado **localmente**. Lo que falta para “Admin = fuente real de launch” es sobre todo **Course como entidad admin + materia en env no-local + ops/seguridad**, no un rediseño del modelo.

---

## 5. Relación con Mi Camino (ya cerrado docs)

```text
Admin publica Module (+ PathNodes PUBLISHED)
        → loadPublishedCoursePath
        → /mi-camino (GmusicPath)
```

- F6 **no** requiere más Admin para cerrar su fase documental (**ya cerrada**).  
- Camino usable en un entorno = ese entorno tiene PUBLISHED (LOCAL sí; prod **no** afirmado).

---

## 6. Relación futura con Mi Progreso (F7)

```text
UserProgress + PathNodes PUBLISHED del curso
        → agregados (% / completadas / siguiente / última actividad)
        → superficie Mi Progreso
```

| Pregunta | Implicación |
|----------|-------------|
| ¿F7 necesita Admin LMS completo? | **No** para **documentar** el contrato ni para UI mínima leyendo DB |
| ¿F7 necesita materia + completados? | **Sí** para smoke útil: sin PathNode PUBLISHED o sin `isCompleted`, empty state es válido pero no prueba % |
| ¿Course seed bloquea F7? | **No** para docs; **sí** si se exige “100% editorial desde Admin” antes de medir Progreso en launch |
| ¿T-UX bloquea F7? | Solo si no se puede **completar + persistir** — entonces empty eterno de “completadas” |

**Qué bloquearía F7 (ejecución/código útil):**

1. **Bloqueo duro de producto F7:** ninguno del modelo Admin — schema y path soportan agregados.  
2. **Bloqueo de medición/launch Progreso:** entorno sin PUBLISHED; runner que no persiste progreso (T-UX); Active/guards rotos.  
3. **No es bloqueo F7 docs:** Course BRIDGE, media SHOULD, migrou UID local, screenshot FE opcional.

---

## 7. Matriz resumen

| Capa | Definido | Piloto LOCAL | Gap launch / fuente real Admin |
|------|----------|--------------|--------------------------------|
| Course → Module → PathNode | ✅ | ✅ seed + Admin Module | Course Admin UI |
| Publish Module (5 etapas) | ✅ | ✅ Admin real | Repetir en staging/prod |
| Visibilidad Mi Camino | ✅ | ✅ `/me/path` | Env launch |
| UserProgress → F7 | ✅ schema | Parcial (datos locales) | Completados + UI |
| Admin = única fuente clases | Parcial | Module sí / Course no | Course + ops env |

---

## 8. Recomendación operativa (para Juan)

| Opción | Cuándo elegirla |
|--------|-----------------|
| **A — Avanzar F7 (docs / brief ya listo; ejecutar `07`)** | Prioridad = cerrar contrato Mi Progreso; aceptar frontera Admin/Course BRIDGE y T-PUB LOCAL |
| **B — Corregir Admin-publicación primero** | Prioridad = Course Admin UI + T-PUB en staging/prod **antes** de invertir en UI Progreso launch |
| **C — Documentar frontera y seguir (híbrido)** | **Recomendado ahora:** mantener A para **docs F7**; exigir B (o smoke T-PUB en env acordado) **antes** de declarar Mi Progreso “listo launch” / DoD §7.6b en prod |

**Esta auditoría:** **C** — frontera explícita; **no** exigir LMS Admin completo para abrir ejecución documental F7; **sí** exigir materia PUBLISHED + progreso persistido en el entorno donde se validará F7.

---

## 9. Estado F7 tras este mandato

- Brief F7 **existe** pero avance a ejecución **en pausa** hasta OK Juan tras esta auditoría.  
- F7 **no** iniciada · F8 **no** · sin código · sin commit.

---

## 10. Detenerse

Sin implementación. Sin DB. Sin abrir F7. Sin commit/push.
