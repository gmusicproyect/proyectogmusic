# Decisiones (roadmap protocolo)

Las decisiones de producto canónicas siguen en `.agents/DECISIONS.md`.  
Aquí se registran decisiones del **protocolo de cierre MVP**.

## D-ROAD-001 — Inventario ETAPA 0 como puerta de entrada
### Fecha
2026-07-14
### Contexto
Se adopta protocolo maestro etapas 0–15 para terminar GMusic sin dispersión.
### Opciones evaluadas
1. Seguir solo cola T-PUB / T-UX-LESSON  
2. Congelar y auditar (ETAPA 0) antes de Etapa 1  
3. Rediseñar producto desde cero
### Decisión
Opción 2: ETAPA 0 primero.
### Razones
Docs y código divergían; riesgo de rework.
### Consecuencias
No implementar features hasta OK de inventario + Etapa 1.
### Riesgos
Retraso percibido vs tickets abiertos.
### Condición para revisar
Juan autoriza saltar a un ticket P0 ops/seguridad justificado.

## D-ROAD-002 — Auth JWT ya shipped no implica email verify
### Fecha
2026-07-14 (propuesta inventario) · **confirmada** 2026-07-14 vía D-ROAD-005 (decisión A)
### Contexto
Código tiene registro/login JWT; docs dicen Fase 4 pausada; no hay email verification.
### Opciones
1. Revertir auth  
2. Documentar “auth liviana hecha; verify pausada/WON'T”  
3. Implementar verify ya
### Decisión
**Opción 2 ampliada:** JWT liviana **IN MVP**; email verification **WON'T**; docs “auth pausada” = desfasados. Ver D-ROAD-005 / `01-mvp-gmusic.md`.
### Razones
Realidad del repo + autorización Juan (paquete supervisor GPT).
### Consecuencias
MVP y agentes deben tratar registro/login/sesión como alcance; sync AGENTS/CLAUDE en pasada documental (no reescribir historial D-005 entero en esta fase).
### Riesgos
Agentes con contexto viejo siguen “no tocar auth” — mitigar con D-ROAD-005 + lista docs desfasados en MVP.
### Condición para revisar
Incidente de seguridad o decisión explícita de reabrir email verify.

## D-ROAD-003 — Diagrama de 10 fases = estructura canónica del roadmap
### Fecha
2026-07-14
### Contexto
Juan confirmó: *"La estructura está bien como el de la diagrama."* El infográfico define 10 fases (Definir → … → Pulir/Probar/Lanzar) con pilares ENFOCAR · CONSTRUIR · PROBAR · LANZAR · ESCALAR. Previamente el protocolo maestro usaba etapas 0–15 como estructura primaria.
### Opciones evaluadas
1. Mantener protocolo 0–15 como estructura primaria  
2. Adoptar las **10 fases del diagrama** como canónicas; 0–15 como checklist subordinado  
3. Mezclar ambas en paralelo sin jerarquía (riesgo de confusión)
### Decisión
**Opción 2.** Estructura canónica = Fases 1–10 del diagrama (+ Fase 0 inventario ya hecha). Protocolo 0–15 = detalle subordinado. Stack/herramientas del cartel (NextAuth, Stripe, Discourse, Docker, etc.) = **referencia**; el stack real sigue siendo Track A (Vite + React + Express + Prisma). No adoptar ciegamente el cartel.
### Razones
Alinea planificación con el artefacto visual que Juan validó; evita “greenfield” inventado; conserva el valor del checklist 0–15 sin competir.
### Consecuencias
- `roadmap-general.md` se reescribe alrededor de las 10 fases.  
- `etapa-actual.md` apunta a Fase 1 (DEFINIR Y PLANEAR) como siguiente tras OK Juan.  
- No se inicia doc MVP (`01-mvp-gmusic.md`) hasta autorización explícita.
### Riesgos
Agentes o docs antiguos sigan citando solo 0–15; hay que referenciar D-ROAD-003.
### Condición para revisar
Cambio explícito de Juan sobre el orden de fases o adopción formal de stack Track B.

## D-ROAD-004 — Fase 1 requiere instrucción profunda antes de redactar el MVP
### Fecha
2026-07-14
### Contexto
Juan pidió: *"Para la fase uno necesitas una instrucción más profunda"* — no el doc MVP final aún, sino el brief ejecutable que Cursor usará para escribir `docs/product/01-mvp-gmusic.md` sin ambigüedad. El inventario (Fase 0) y el diagrama de 10 fases ya existen; faltaba el contrato de método (plantilla, MUST/OUT, preguntas, DoD).
### Opciones evaluadas
1. Redactar `01-mvp-gmusic.md` de inmediato con plantilla implícita  
2. Escribir primero `docs/roadmap/fase-1-instruccion.md` y **solo tras OK Juan** ejecutar Fase 1 (redactar el MVP)  
3. Mezclar instrucción + MVP en un solo archivo
### Decisión
**Opción 2.** Artefacto: `docs/roadmap/fase-1-instruccion.md`. Gate: OK explícito de Juan para iniciar la redacción del MVP. No crear `01-mvp-gmusic.md` en la misma pasada que la instrucción.
### Razones
Reduce rework; fuerza separar aspiración (protocolo Juan) de realidad (inventario); obliga preguntas concretas (auth JWT vs “pausada”, Mi Progreso, Comunidad, T-PUB/T-UX-LESSON, ops P0) antes de congelar alcance.
### Consecuencias
- Fase 1 ejecución = **NO INICIADA** hasta OK Juan aunque la instrucción esté lista.  
- El ejecutor debe seguir el outline, matriz y método de la instrucción al escribir el MVP.  
- Cierre de Fase 1 actualiza etapa-actual, changelog y backlog según la propia instrucción.
### Riesgos
Instrucción demasiado larga se ignora; mitigación: secciones obligatorias + checklist de aceptación corto.
### Condición para revisar
Juan pide acortar o fusionar instrucción + MVP, o autoriza saltar directo a redactar `01-mvp`.

## D-ROAD-005 — Decisiones A–D Fase 1 (producto MVP Track A)
### Fecha
2026-07-14
### Contexto
Juan/JP reenvió el paquete del supervisor GPT autorizando **solo** la ejecución documental de Fase 1 (redactar `01-mvp-gmusic.md`), con decisiones de producto A–D cerradas. No autoriza código de app, cambio de stack, ni Track B.
### Fuente
Autorización Juan vía supervisor GPT (paquete Fase 1).
### Decisiones

**A) Auth**
- JWT liviana **IN MVP**.
- Email verification **WON'T**.
- **MUST:** registro, login, sesión persistente, logout, protección básica de rutas.
- **SHOULD:** roles avanzados; recuperación de password (MAY ser SHOULD o BRIDGE documentado).
- Docs que digan “auth pausada” = **desfasadas** (declararlo en MVP; no reescribir todo AGENTS/CLAUDE indiscriminadamente).

**B) Mi Progreso**
- Página mínima funcional **MUST IN MVP**.
- **IN:** lecciones completadas; % avance real; curso/ruta activa; última actividad; siguiente lección; empty state.
- **OUT:** rachas avanzadas; tiempo exacto de práctica; rankings; gráficos complejos; logros sofisticados; predictivo.

**C) Comunidad**
- Feed real básico **IN** (versión reducida).
- **IN:** ver posts; publicar; comentar; filtrar/contextualizar por nivel si posible; moderación admin mínima.
- Mocks solo en desarrollo/demo interna — **NO** contrato de lanzamiento.
- **OUT:** DM, chat realtime, videollamada, notificaciones complejas, social avanzado, gamificación comunitaria profunda.
- Puede quedar fuera del happy path principal de aprendizaje, pero si está en nav debe ser superficie funcional real.

**D) Lanzamiento / ops**
- **T-UX-LESSON-01 MUST** si afecta consumo correcto de lección.
- **T-PUB-01 MUST** si afecta publicación/disponibilidad real de contenido.
- Credencial admin insegura = **P0 bloqueo**.
- Prisma pérdida/corrupción/imposibilidad de persistir = **P0 bloqueo**.
- Ops no críticos: launch OK con riesgo documentado.
- WhatsApp = **BRIDGE** temporal conversión/pagos (documentado; no simular pasarela; admin puede conceder acceso; alumno entiende siguiente paso).
- Stripe **OUT**.
- No Next.js / Track B.

### Contrato happy path MVP
Alumno se registra → login → academia → curso → lección → consume → completa → guarda progreso → sabe qué estudiar después.  
Comunidad y WhatsApp acompañan; no reemplazan el núcleo educativo real.

### Consecuencias
- `fase-1-instruccion.md` ajustada; validación arquitecto **APROBADA**.
- Entregable: `docs/product/01-mvp-gmusic.md`.
- Confirmación D-ROAD-002 (auth liviana / verify WON'T).
- Fase 2 **no** inicia hasta OK Juan de lectura del MVP.
### Riesgos
Implementar A–D en código sin pasar por fases 2+ y OK Juan.
### Condición para revisar
Firma Juan en §12 del MVP, o cambio explícito de alcance A–D.

## D-F1-001 — Fase 1 aprobada · contrato MVP congelado
### Fecha
2026-07-14
### Decisión
Fase 1 APROBADA. El contrato del MVP Track A en `docs/product/01-mvp-gmusic.md` queda congelado como referencia oficial hasta nueva decisión de gobernanza documentada.
### Consecuencias
Ideas nuevas → backlog (`docs/roadmap/backlog.md`), no al MVP. Cambio de alcance MVP requiere decisión de gobernanza.
### Fuente
Aprobación formal Juan / director (mensaje sesión 14 Jul 2026) + informe `fase-1-informe-supervisor.md` LISTA.

## D-F2-001 — Fase 2 aprobada/cerrada
### Fecha
2026-07-14
### Decisión
Fase 2 TERMINADA. Arquitectura y modelo de datos Track A aprobados como referencia (`02-modelo-datos.md`, `02-arquitectura-sistema.md`, `fase-2-informe-supervisor.md`).
### Consecuencia
Fase 3 puede briefarse; cambios de arquitectura requieren nueva decisión de gobernanza.
### Fuente
Aprobación formal Juan (lectura OK 2026-07-14) de los tres artefactos anteriores.

## D-F3-WIP — Fase 3 infraestructura en borrador / revisión
### Fecha
2026-07-14
### Estado
**SUPERSEDIDO** por **D-F3-001** (2026-07-14).
### Decisión
Fase 3 pasa de “brief listo / ejecución NO INICIADA” a **borrador documental / EN REVISIÓN**. Entregable: `docs/setup/03-entorno-desarrollo.md`. Revisión de coherencia: `fase-3-revision-coherencia.md` (veredicto `coherente`). **No** se declara Fase 3 TERMINADA hasta OK Juan en §18 del `03`. **D-F3-001** queda reservada para el cierre formal posterior.
### Consecuencia
Control roadmap apunta al `03` en revisión. Fase 4 AUTENTICACIÓN permanece **NO INICIADA**. Sin features producto, sin rotación de secretos en repo, sin commit autónomo en esta pasada.
### Fuente
Autorización Juan: “OK, ejecuta Fase 3” (alcance docs setup según `fase-3-instruccion.md`, 2026-07-14) + pasada de revisión coherencia (misma fecha).

## D-F3-001 — Fase 3 aprobada/cerrada
Fecha: 2026-07-14
Decisión: Fase 3 TERMINADA. `docs/setup/03-entorno-desarrollo.md` es la guía oficial de entorno Track A.
Consecuencia: Fase 4 NO abierta hasta OK Juan. Sin commit/push en esta autorización.

## D-F4-WIP — Fase 4 autenticación en pruebas / revisión
### Fecha
2026-07-15
### Estado
**SUPERSEDIDO** por **D-F4-001** (2026-07-15).
### Decisión
Fase 4 pasa de “brief listo / ejecución NO” a **ejecución documental EN PRUEBAS**. Entregable: `04-auth-usuarios.md`. Política: JWT MUST · email verify **WON'T** · recovery alumno **BRIDGE** · perfil edición **OUT** · higiene docs = lista sin reescritura masiva. Cero código producto en esta pasada.
### Consecuencia
Control roadmap apuntaba al `04` en pruebas. Fase 5 permanece **NO INICIADA**. Sin NextAuth / schema / commit autónomo.
### Fuente
Autorización Juan: “OK, ejecuta Fase 4” (alcance docs según `fase-4-instruccion.md` + restricciones del mensaje 2026-07-15).

## D-F4-001 — Fase 4 aprobada/cerrada
Fecha: 2026-07-15
Decisión: Fase 4 TERMINADA. `docs/features/04-auth-usuarios.md` es el documento canónico Auth Track A.
Consecuencia: Fase 5 NO INICIADA / no autorizada. Sin commit/push en esta autorización.
Fuente: OK Juan §14 (2026-07-15).

## D-F5-WIP — Fase 5 Academia/Cursos en pruebas / revisión
### Fecha
2026-07-15
### Estado
**SUPERSEDIDO** por **D-F5-001** (2026-07-15).
### Decisión
Fase 5 pasa de “brief listo / ejecución NO” a **ejecución documental EN PRUEBAS**. Entregable: `docs/features/05-academia-cursos.md`. Alcance: onboarding + modelo Course/Module/PathNode + Admin R-008 + visibilidad PUBLISHED + contrato N=1 + **T-PUB-01 MUST abierto** (sin piloto código) + F6 OUT. Cero código producto · cero migraciones · cero prod publish · cero commit/push en esta pasada.
### Consecuencia
Control roadmap apuntaba al `05` en pruebas. Fase 6 Mi Camino permanece **NO INICIADA**. Sin CourseLit / Track B / LessonRunner implementación.
### Fuente
Autorización Juan: ejecutar Fase 5 **solo documental** (mensaje 2026-07-15) según `fase-5-instruccion.md` + restricciones del mandato.

## D-F5-001 — Fase 5 aprobada/cerrada (documental)
### Fecha
2026-07-15
### Estado
**APROBADA / TERMINADA** (fase documental).
### Decisión
Fase 5 **TERMINADA**. `docs/features/05-academia-cursos.md` es el documento **canónico Academia/Cursos Track A** (v1.0).
**T-PUB-01** permanece **MUST abierto** — piloto real **no** ejecutado en esta fase; criterio N=1 documentado en `05` §2 / §7.
**Umbral “usable” (default técnico T-PUB):** validator actual (título + `completionCriteria` + 5 `StageType`). Media/video y MicroExercise = **SHOULD** salvo que Juan eleve a MUST en mandato aparte.
### Consecuencia
Fase 6 Mi Camino **NO INICIADA** / no autorizada. Sin código · sin publish prod · sin commit/push en esta autorización. Piloto T-PUB-01 requiere mandato ops/entorno separado.
### Fuente
OK Juan §13 (2026-07-15).
### Nota posterior
Piloto T-PUB-01 cerrado formalmente como **DONE LOCAL** vía **D-TPUB-01** (2026-07-15) — no reabre Fase 5 ni autoriza Fase 6 / prod / launch.

## D-TPUB-01 — T-PUB-01 cerrado DONE LOCAL
### Fecha
2026-07-15
### Estado
**CERRADA** (alcance **local** únicamente).
### Decisión
**T-PUB-01** se declara **DONE LOCAL**. Veredicto formal Juan: pipeline Admin R-008 → Module N=1 + 5 PathNode PUBLISHED → alumno ACTIVE visible en `GET /me/path` validado en Docker/local.
**Evidencia canónica:** `docs/roadmap/t-pub-01-evidencia-local.md`.
### Alcance explícito
| Incluye | No incluye |
|---------|------------|
| Entorno **LOCAL** controlado (Docker Postgres + API `:3001`) | Prod DB · publish prod · launch staging |
| Criterio N=1 D-F5-001 (validator) | Fase 6 Mi Camino (en el momento del cierre T-PUB) |
| Evidencia API `/me/path` | Código producto · migraciones repo · commit/push |

### Deuda ops separada (no bloquea cierre)
- **R-OPS-MIGRATE-UUID** — `prisma migrate deploy` fresh local falla UUID vs TEXT (workaround local `db push` documentado).
- **T-PUB-01-UI** — captura screenshot FE Vite `/mi-camino` **opcional** (API ya validada).
### Consecuencia
Ticket T-PUB-01 → **cerrados** en backlog. Al cierre T-PUB, Fase 6 seguía NO; posterior ejecución docs F6 = **D-F6-WIP** (no reabre T-PUB ni prod). Sin código · sin prod · sin commit/push en esta autorización.
### Fuente
Autorización Juan 2026-07-15: *“Cierro formalmente T-PUB-01 como DONE LOCAL…”*.

## D-F6-001 — Fase 6 aprobada/cerrada (Mi Camino documental)
### Fecha
2026-07-15
### Decisión
Juan aprueba `docs/features/06-mi-camino.md` como documento canónico **Mi Camino Track A**. **Fase 6 TERMINADA** (fase documental).
### Condiciones explícitas
- **T-PUB-01** permanece **DONE LOCAL** (**D-TPUB-01**) — no validación productiva.
- **T-F6-ANTI-DEMO-01** permanece **CERRADO** (**D-F6-ANTI-DEMO-001**).
- **T-UX-LESSON-01** frontera / OUT salvo mandato aparte.
- **Fase 7 NO** autorizada.
- Sin código, sin DB, sin commit/push salvo mandato explícito.
### Consecuencia
**D-F6-WIP** supersedido. Control roadmap: F6 **TERMINADA**. F7 **NO INICIADA**.
### Fuente
Cierre formal Juan §14 (mensaje 2026-07-15).

## D-F6-WIP — Fase 6 Mi Camino en pruebas / revisión
### Fecha
2026-07-15
### Estado
**SUPERSEDIDO** por **D-F6-001** (2026-07-15).
### Decisión
Fase 6 pasa de “brief listo / ejecución NO” a **ejecución documental EN PRUEBAS**. Entregable: `docs/features/06-mi-camino.md`. Alcance: objetivo path MVP · contrato funcional · estados vacío/cargando/error/bloqueado/activo · dependencia **D-TPUB-01** · `GET /me/path` + `GmusicPath` · frontera **T-UX-LESSON-01** OUT mandato · OUT F7/VFX · DoD · riesgos ops separados. Cero código producto · cero DB · cero F7 · cero commit/push en esta pasada.
### Consecuencia
Control roadmap apunta al `06` en pruebas. Fase 7 Mi Progreso permanece **NO**. T-PUB no se reabre. Sin Track B / LessonRunner implementación.
### Fuente
Autorización Juan: ejecutar Fase 6 **SOLO DOCUMENTAL** (mensaje 2026-07-15) según `fase-6-instruccion.md` + `fase-6-revision-coherencia.md` + restricciones del mandato.

## D-F6-ANTI-DEMO-001 — T-F6-ANTI-DEMO-01 cerrado formalmente
### Fecha
2026-07-15
### Decisión
Juan cierra formalmente **T-F6-ANTI-DEMO-01** con veredicto auditoría final **`coherente`**. Mi Camino sin demo/mock/hardcode visible como producto real según `t-f6-anti-demo-01-auditoria-final.md`.
### Consecuencias
- Ticket **CERRADO** (DONE LOCAL verificado).
- En el momento del ticket: F6 estaba **PAUSADA** (este cierre **≠** D-F6-001).
- **Post D-F6-001 (2026-07-15):** F6 **TERMINADA** (documental) · F7 **NO INICIADA**.
- **Sin prod** · **sin commit/push** en el cierre del ticket anti-demo.
### Fuente
Cierre formal Juan (mensaje 2026-07-15).

## D-F6-ANTI-DEMO — Quitar verdad mock/hardcode de Mi Camino (T-F6-ANTI-DEMO-01)
### Fecha
2026-07-15
### Estado
**CERRADO** (**D-F6-ANTI-DEMO-001**, 2026-07-15) · implementación local verificada · commit/push **no** autorizado en este cierre. En el momento del ticket **no** cerraba F6 (estaba PAUSADA); **post D-F6-001** F6 **TERMINADA**.
### Decisión
1. Badge path desde datos controlados (`pathPresentation`: instrumento por slug, level = Module.title, month = Module.order).  
2. `module.focus` vacío hasta campo editorial Prisma — **prohibido** inventar pedagogía.  
3. `user.pathLabel` / Mes desde `Module.order` — **prohibido** usar índice del array como Mes.  
4. `node.duration` vacío hasta editorial — **prohibido** inventar minutos por `exercises.length`.  
5. `VITE_USE_PATH_MOCK=false` en CI/launch / `.env.example`. Seeds = **local-only** ≠ evidencia productiva.  
6. Checklist lección = visual local (preferir `completionCriteria`).  
7. Comunidad en header alumno **bloqueada** (modal OUT MVP) hasta T-MVP-COMMUNITY (mocks peers/curated ≠ launch).
### Consecuencias
Alumno ACTIVE en `/mi-camino` no ve copy inventado de focus/Fundamento/duración hardcode. Comunidad nav = candado OUT MVP. Fase 7 / prod DB / commit autónomo = **NO**.
### Fuente
Mandato Juan T-F6-ANTI-DEMO-01 (2026-07-15) + re-audición corrección.

## D-F7-001 — Fase 7 aprobada/cerrada (Mi Progreso documental)
### Fecha
2026-07-15
### Decisión
Juan aprueba `docs/features/07-mi-progreso.md` como documento canónico **Mi Progreso / Seguimiento Track A**. **Fase 7 TERMINADA** como fase **documental**.
### Condiciones explícitas
- F7 documental cerrada **≠** launch-ready.
- Launch/medición real queda en **capa C** (entorno medible + contenido PUBLISHED + progreso persistido).
- Admin/Course permanece **BRIDGE**.
- **T-PUB-01** permanece **DONE LOCAL** (**D-TPUB-01**) — no validación productiva.
- **T-UX-LESSON-01** permanece frontera/riesgo si el runner no persiste avance.
- **Fase 8 NO** autorizada.
- Sin código, sin DB, sin commit/push salvo mandato explícito.
### Consecuencia
**D-F7-WIP** supersedido. Control roadmap: F7 **TERMINADA** (documental). F8 **NO INICIADA**. Capa C / **T-MVP-PROGRESS** UI abierta solo con mandato aparte. **No** se declara Mi Progreso launch-ready.
### Fuente
Cierre formal Juan §15 (mensaje 2026-07-15).

## D-F7-WIP — Fase 7 Mi Progreso en pruebas / revisión documental
### Fecha
2026-07-15
### Estado
**SUPERSEDIDO** por **D-F7-001** (2026-07-15).
### Decisión
Fase 7 pasa a **ejecución documental EN PRUEBAS**. Entregable: `docs/features/07-mi-progreso.md`. Incorpora auditoría Admin opción **C**: Course BRIDGE · T-PUB DONE LOCAL ≠ productiva · criterios B (docs) vs C (launch/medición) · T-UX frontera persistencia · F8 OUT. Cero código · cero DB · cero commit/push en esta pasada.
### Consecuencia
Control roadmap apunta al `07` en pruebas. **No** se declara Mi Progreso launch-ready. F8 permanece **NO**.
### Fuente
OK Juan: ejecutar Fase 7 documental (mensaje 2026-07-15) según `fase-7-instruccion.md` + `auditoria-admin-editorial-pre-f7.md`.

