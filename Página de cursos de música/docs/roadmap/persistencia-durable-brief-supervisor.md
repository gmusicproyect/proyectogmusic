# Brief supervisor — Persistencia durable H1

**Fecha:** 2026-07-17  
**Para:** Juan / Opus  
**Estado:** **brief propuesto** · **ejecucion NO autorizada** · **sin codigo** · **sin schema** · **sin migraciones** · **sin commit/push**  
**Origen:** cierre P0 H1 `1ad047d` — puentes en memoria `memory_bridge_h1` / `memory_fixture_h1`

---

## Una linea

Convertir los puentes H1 de eventos, progreso y catalogo en persistencia durable, sin abrir UI nueva, Premium, Comunidad, pagos reales ni routing.

## Dictamen supervisor

El siguiente frente recomendado es **persistencia durable**, no UI/routing. P0 H1 ya valido contratos de dominio; ahora el riesgo principal es que parte del aprendizaje y Biblioteca vive en memoria y se pierde al reiniciar proceso.

Este brief **no autoriza implementacion**. Solo delimita el mandato que Juan/Opus deben aprobar antes de tocar Prisma, migraciones o codigo productivo.

## Fuentes canonicas leidas

| Fuente | Uso en este brief |
|--------|-------------------|
| `.agents/DECISIONS.md` | D-010, D-011, D-021, D-022, D-GOV-01, R-OPS-01 |
| `AGENTS.md` | Protocolo sin commit/push, mapa de rutas, roles y skill `gmusic-learning-engine` |
| `docs/architecture/learning-engine.md` | Reglas de sesiones, intentos, XP, rachas, idempotencia y payload seguro |
| `docs/architecture/database-schema.md` | Modelo relacional base y constraints recomendadas |
| `docs/architecture/gmusic-architecture-working-map.md` | R-001 contenido no versionado y R-002 entitlements no exigidos en endpoints privados |
| `docs/vision/handoffs/2026-07-16-cierre-ciclo-p0-h1.md` | Contratos P0 H1 y puentes temporales aceptados |

## Problema a resolver

P0 H1 cerro el contrato funcional, pero mantiene tres puentes temporales:

| Puente H1 | Estado actual | Riesgo |
|-----------|---------------|--------|
| Eventos de practica | Memoria de proceso | Reinicio pierde historial y proyecciones |
| Progreso derivado | Proyeccion H1 en memoria / datos derivados | `Mi Progreso` no es auditable ni durable |
| Catalogo Biblioteca | Fixture en memoria | No hay curaduria persistida, versionable ni gobernable |

Tambien existen dos riesgos arquitectonicos relacionados:

| Riesgo | Impacto para este mandato |
|--------|---------------------------|
| R-001 — Sesion sin snapshot/version de contenido | Completar una sesion podria evaluarse contra contenido editado despues del inicio |
| R-002 — Entitlements no exigidos por endpoints privados | UI valida acceso, pero endpoints de aprendizaje deben aplicar politica backend consistente |

## Objetivo

Crear una fuente durable y auditable para:

1. Eventos de practica H1.
2. Estado/proyecciones de progreso necesarias para `Mi Camino` y `Mi Progreso`.
3. Catalogo basico de Biblioteca con metadatos, estado editorial y permisos.
4. Politicas de acceso backend para endpoints privados relacionados.
5. Idempotencia verificable ante reintentos y concurrencia.

## No objetivos

| Fuera de alcance | Motivo |
|------------------|--------|
| Push de `1ad047d` | Requiere autorizacion explicita aparte |
| UI/routing nuevo de Mi Camino, Progreso o Biblioteca | Frente posterior; consumirian contratos ya durables |
| Premium real | P0 mantiene premium bloqueado |
| Comunidad | No pertenece al mandato de persistencia H1 |
| Pagos reales / webhook / SII | Billing futuro separado |
| Tabla `Profile` | H1 conserva `profileId = userId` hasta decision nueva |
| Audio, pitch, scoring musical avanzado | Fuera de P0 y del learning engine durable inicial |
| Migracion de framework o React Router | D-018 mantiene `currentPage` |
| Seed/carga editorial masiva 6-75 | Requiere mandato editorial separado |

## Decisiones que debe aprobar Juan/Opus

| ID propuesta | Pregunta | Recomendacion supervisor |
|--------------|----------|--------------------------|
| D-PD-01 | ¿Persistir eventos H1 como tabla append-only propia o mapearlos directo a tablas existentes? | Tabla append-only `PracticeEvent` + proyecciones derivadas |
| D-PD-02 | ¿El progreso oficial se recalcula desde eventos o se escribe directamente? | Eventos como evidencia; proyecciones persistidas para lectura rapida |
| D-PD-03 | ¿Biblioteca usa tablas propias o extiende Course/PathNode/MicroExercise? | Tablas propias de catalogo editorial, relacionadas opcionalmente a ruta |
| D-PD-04 | ¿Como resolver R-001? | Snapshot minimo por `LessonSession` para contenido evaluable al iniciar |
| D-PD-05 | ¿Como resolver R-002? | Policy backend reutilizable de entitlements en `/me/path`, `/me/progress`, `/me/library`, `lesson-sessions` y practica H1 |
| D-PD-06 | ¿Entorno de primera ejecucion? | Local/Docker primero; prod bloqueado por R-OPS-01 hasta baseline/plan ops |

## Alcance tecnico propuesto

### A. Eventos durables

Persistir eventos H1 con:

- `eventId` unico.
- `profileId` actualmente igual a `userId`.
- `type`: `practice_started`, `practice_completed`, `practice_abandoned`, `ftc_card_completed`, `unit_completed`.
- `occurredAt`.
- `clientRequestId` / causation id.
- `sessionId`, `unitId`, `cardId` cuando aplique.
- `payload` JSON controlado.
- constraints de idempotencia por evento y por clave natural critica.

### B. Progreso durable

Mantener proyecciones consultables por los endpoints H1:

- progreso por unidad FTC;
- progreso por tarjeta;
- sesiones recientes;
- streak/habito si el endpoint H1 lo consume;
- resumen para `progressViewH1`;
- metadata de ultima reconstruccion desde eventos.

Regla: las proyecciones aceleran lectura, pero los eventos conservan la evidencia.

### C. Catalogo durable de Biblioteca

Persistir recursos con:

- `resourceId`, titulo, descripcion;
- instrumento, nivel, mes/rango de meses, objetivo pedagogico;
- tipo de recurso;
- `accessTier`: basic/premium;
- `publishStatus`: draft/published/archived;
- relacion opcional a ruta/unidad/tarjeta;
- `mediaRef` nullable hasta multimedia real;
- timestamps editoriales.

Reglas H1 vigentes:

- `premium` permanece bloqueado si grants MVP no lo permiten;
- `DRAFT` / `ARCHIVED` nunca salen al alumno;
- consumir Biblioteca no completa tarjetas.

### D. Snapshot/versionado de sesion

Resolver R-001 antes de permitir contenido editable con sesiones activas:

- al iniciar sesion, guardar snapshot minimo de ejercicios evaluables o referencia a version publicada inmutable;
- `complete` valida contra ese snapshot/version, no contra contenido mutable actual;
- `secureAnswer` nunca sale por API publica.

### E. Entitlements en backend

Aplicar politica backend comun a:

- `GET /api/v1/me/path`;
- `GET /api/v1/me/progress`;
- `GET /api/v1/me/library`;
- `GET /api/v1/me/library/:id`;
- `POST /api/v1/lesson-sessions`;
- endpoints H1 de start/complete practice si estan separados.

Regla: `/me/access` sigue siendo fuente visible de acceso, pero no sustituye autorizacion en cada caso de uso privado.

## Plan por fases

| Fase | Entrega | Gate |
|------|---------|------|
| PD-0 | Inventario tecnico: mapear tablas existentes, endpoints H1 y stores en memoria | Sin cambios de codigo productivo |
| PD-1 | Diseño aprobado: modelo durable, estrategia R-001/R-002, plan de migracion local | OK Juan/Opus |
| PD-2 | Implementacion local de schema/migracion y repositorios | Tests verdes; sin prod |
| PD-3 | Adaptar servicios H1 para escribir durable y leer proyecciones | Contratos API P0 sin ruptura |
| PD-4 | Catalogo Biblioteca durable con seed/fixture controlado | `/me/library` mantiene reglas H1 |
| PD-5 | Hardening: idempotencia, concurrencia, timezone, entitlements | Suites especificas verdes |
| PD-6 | Evidencia y handoff | No commit/push sin OK |

## Tests minimos

| Area | Cobertura esperada |
|------|--------------------|
| Eventos | idempotencia por `eventId`, `clientRequestId` y claves naturales |
| Progreso | reconstruccion desde eventos + lectura de proyeccion |
| Sesiones | complete idempotente, reintento concurrente, sesion expirada |
| Snapshot | completar usa version/snapshot inicial aunque el contenido cambie |
| Biblioteca | filtros por `publishStatus`, mes, instrumento y `accessTier` |
| Entitlements | alumno sin acceso no inicia practica ni lee recursos privados |
| Timezone | racha/fecha local calculada en servidor |
| Regresion P0 | `pathViewH1`, `progressViewH1`, `libraryH1` conservan contrato |

## Riesgos operativos

| Riesgo | Tratamiento |
|--------|-------------|
| R-OPS-01 Prisma baseline prod/P3005 | No ejecutar migraciones prod dentro de este mandato sin plan ops separado |
| Arbol dirty ajeno a P0 | Staging selectivo obligatorio si luego se autoriza commit |
| Mezclar UI con persistencia | Bloquear UI/routing hasta que contratos durables esten estables |
| Cambiar `profileId = userId` antes de tiempo | Prohibido salvo decision nueva sobre Profile |
| Doble fuente de verdad memoria + DB | Durante transicion, definir feature flag/lectura unica y retirar puente al cerrar |

## Gate sugerido para Juan

```text
OK, abre mandato Persistencia Durable H1.
Alcance: eventos de practica, progreso/proyecciones, catalogo Biblioteca,
snapshot/version de sesion y entitlements backend.
Entorno: local primero.
Sin UI/routing, sin Premium, sin Comunidad, sin pagos reales, sin tabla Profile,
sin prod, sin push.
Primero entregar PD-0 + PD-1 antes de implementar schema/migraciones.
```

## Veredicto

**Recomendacion:** empezar por este mandato.  
**Push de `1ad047d`:** pendiente de autorizacion explicita.  
**UI/routing:** despues de persistencia durable o en rama/mandato separado.

---

*Brief de supervision; no autoriza ejecucion tecnica por si solo.*
