# Gmusic Architecture Working Map

**Estado:** cuaderno arquitectónico vivo, no plan de implementación  
**Propósito:** consolidar la arquitectura observada, las hipótesis estratégicas, los riesgos y los caminos posibles antes de discutir decisiones con Opus y Juan.  
**Regla:** este documento no autoriza cambios de código, reorganización de carpetas, nuevas fases ni modificaciones del schema.

---

## 1. Cómo leer este documento

Cada afirmación utiliza uno de estos estados:

| Estado | Significado |
|---|---|
| **Observado** | Confirmado directamente en el repositorio actual |
| **Objetivo aceptado** | Dirección arquitectónica considerada sana, pendiente de decisiones concretas |
| **Hipótesis** | Propuesta que todavía debe validarse con Juan y Opus |
| **Riesgo** | Condición comprobada que puede causar problemas bajo determinados escenarios |
| **Decisión pendiente** | Pregunta que requiere autoridad de producto o arquitectura |
| **Fuera de scope actual** | No debe implementarse en la fase vigente |

La arquitectura objetivo no describe automáticamente el sistema actual. Los cambios solo deben planificarse después de aprobar una decisión y su momento de ejecución.

---

## 2. Resumen ejecutivo

Gmusic ya posee los cimientos de un **Modular Monolith**, aunque sus límites de dominio todavía no están representados consistentemente en toda la estructura del repositorio.

El núcleo técnico más desarrollado es el **Learning Journey**: sesiones de práctica, intentos, validación, progreso, XP y rachas. El funnel público también está avanzado, pero funciona como una experiencia separada basada en datos frontend, `localStorage`, PostHog y conversión humana por WhatsApp.

Las dos brechas arquitectónicas comprobadas de mayor impacto futuro son:

1. Una `LessonSession` no conserva una versión o snapshot del contenido utilizado al iniciarse.
2. Membership Entitlements decide acceso mediante backend para la UI, pero sus reglas todavía no se exigen dentro de los endpoints privados de Learning Journey.

Estas brechas no implican que deban corregirse inmediatamente. Su prioridad depende del momento del producto, especialmente antes de contenido editable en producción y antes de habilitar autenticación y membresías reales.

---

## 3. Arquitectura actual observada

```text
Gmusic actual
├── Acquisition / Demo pública
│   ├── Landing y funnel
│   ├── Demo de cinco clases
│   ├── Progreso demo en localStorage
│   ├── Analítica PostHog
│   └── Conversión humana por WhatsApp
│
├── Academy Content privado
│   ├── Course
│   ├── Module
│   ├── PathNode
│   └── MicroExercise
│
├── Learning Journey
│   ├── LessonSession
│   ├── ExerciseAttempt
│   ├── UserProgress
│   ├── XpEvent
│   └── StreakEvent
│
├── Identity parcial de desarrollo
│   ├── User y Role
│   ├── devStudentAuth
│   └── cookie local firmada
│
└── Membership Entitlements embrionario
    ├── Subscription
    ├── resolución de acceso backend
    ├── GET /me/access
    └── StudentZoneGuard
```

### Contextos o capacidades todavía no consolidados

| Capacidad | Estado observado |
|---|---|
| Billing | No existe modelo financiero, webhook, pago ni factura real |
| Community | Página mock/placeholder, sin fuente de verdad propia |
| Notifications | No posee implementación |
| IA de aprendizaje | Capacidad futura sin lenguaje ni decisiones propias aprobadas |
| Administration | No existe como interfaz operativa real |

---

## 4. Arquitectura objetivo aceptada

Gmusic debe evolucionar como un **Modular Monolith**: un solo sistema desplegable inicialmente, con PostgreSQL compartido y fronteras internas claras.

```text
Gmusic Modular Monolith objetivo
├── Identity
│   └── quién eres
├── Acquisition
│   └── cómo llega y convierte el visitante
├── Academy Content
│   └── qué contenido pedagógico existe y en qué versión
├── Learning Journey
│   └── qué practicó, intentó y avanzó el alumno
├── Membership Entitlements
│   └── qué puede utilizar el alumno
├── Billing [candidato futuro]
│   └── qué ocurrió financieramente
├── Notifications [candidato futuro]
├── Community [candidato futuro]
└── Adaptive Learning / IA [capacidad candidata]
```

### Principios aceptados

- No introducir microservicios para resolver problemas actuales de claridad interna.
- No reorganizar carpetas solamente por estética.
- Mantener Learning Journey unido mientras sesión, evaluación, progreso, XP y racha compartan invariantes transaccionales.
- Diferenciar Identity, Billing y Membership Entitlements.
- Tratar Administration como interfaz operativa sobre contextos, no como dueño de sus reglas.
- No tratar IA como Bounded Context hasta definir sus decisiones, lenguaje e invariantes.
- Distinguir siempre arquitectura actual, arquitectura objetivo y trabajo autorizado.

---

## 5. Context Map

### Relaciones objetivo

| Upstream | Downstream | Contrato esperado |
|---|---|---|
| Identity | Learning Journey | Toda sesión real pertenece a un alumno identificable |
| Identity | Membership Entitlements | Todo permiso pertenece a una identidad |
| Academy Content | Learning Journey | Learning utiliza contenido publicado y estable |
| Membership Entitlements | Learning Journey | UI y backend aplican autorización consistente |
| Acquisition | Identity | Un visitante puede convertirse en usuario sin perder trazabilidad |
| Academy Content | Acquisition | Solo si la demo reutiliza contenido publicado o una copia controlada |
| Billing futuro | Membership Entitlements | Un hecho financiero confirmado puede crear o modificar acceso |
| Learning Journey | Notifications futuro | Publica hechos de aprendizaje, no instrucciones de envío |
| Learning Journey | Community futuro | Comparte hitos, sin ceder la fuente oficial de progreso |
| Learning Journey | IA candidata | Entrega evidencia; IA no decide progreso oficial ni acceso |

### Relación actual más importante

```text
Academy Content privado
        ↓
Learning Journey consulta ejercicios y secureAnswer actuales
```

### Relación actual más delicada

```text
Subscription → studentAccess → GET /me/access → StudentZoneGuard

pero:

/me/dashboard
/me/path
/lesson-sessions

solo exigen identidad STUDENT, no entitlement activo.
```

---

## 6. Fuentes de verdad observadas

| Área | Fuente de verdad actual | Observación |
|---|---|---|
| Demo pública | `localStorage`, datos TypeScript y PostHog | No es progreso real |
| Contenido privado | PostgreSQL mediante Prisma | Separado del contenido demo |
| Sesión de aprendizaje | `LessonSession` | No conserva versión de contenido |
| Intentos | `ExerciseAttempt` | Validación realizada por servidor |
| Progreso real | `UserProgress` | Desbloqueos derivados dinámicamente |
| XP | `XpEvent` | Causa trazable e idempotencia por sesión/razón |
| Racha | `StreakEvent` | Un registro por usuario y fecha local |
| Identidad actual | `User` + autenticación local de desarrollo | No es auth real de producción |
| Acceso | `Subscription` + resolución backend | No exigido todavía por endpoints de Learning Journey |
| Conversión | WhatsApp + PostHog | No existe `Lead` persistido |

---

## 7. Invariantes confirmadas

### Learning Journey

Dentro de una sola transacción se realizan:

- Validación de intentos.
- Cálculo de precisión.
- Finalización de sesión.
- Actualización de `UserProgress`.
- Registro de XP.
- Actualización de racha.

### Reglas protegidas actualmente

| Regla | Estado |
|---|---|
| El cliente no recibe `secureAnswer` | Protegida por implementación y tests |
| El cliente no decide `isCorrect`, XP, racha ni progreso | Protegida por backend |
| Completar una sesión es idempotente | Protegida secuencialmente y bajo concurrencia |
| XP no se duplica por reprocesar una sesión | Protegida por constraint y tests |
| La racha no se duplica el mismo día | Protegida por constraint y tests |
| El siguiente nodo se desbloquea desde progreso previo | Derivado dinámicamente; no persistido |
| La demo no contamina `UserProgress` real | Separación observada |

---

## 8. Registro de riesgos arquitectónicos

### R-001 — Contenido de sesión no versionado

| Campo | Evaluación |
|---|---|
| Estado | Riesgo comprobado |
| Contextos | Academy Content → Learning Journey |
| Situación actual | `LessonSession` guarda `nodeId`, pero al completarse consulta ejercicios y `secureAnswer` actuales |
| Impacto | Una edición durante una sesión podría cambiar cómo se evalúa al alumno |
| Severidad | Alta cuando exista contenido editable en producción |
| Activador recomendado | Antes de permitir cualquier mutación de contenido en producción mientras existan sesiones activas, ya sea por Admin, seed, script o edición directa de PostgreSQL |
| Caminos posibles | Snapshot por sesión, referencia a versión publicada o contenido inmutable por versión |
| Decisión pendiente | Elegir estrategia de versionado y política editorial |

### R-002 — Entitlements no exigido por endpoints privados

| Campo | Evaluación |
|---|---|
| Estado | Riesgo comprobado |
| Contextos | Membership Entitlements → Learning Journey |
| Situación actual | `/me/access` y la UI validan suscripción; dashboard, path y lesson sessions solo validan rol `STUDENT` |
| Impacto | Un alumno autenticado sin membresía podría invocar endpoints directamente |
| Severidad | Alta antes de producción con auth real |
| Activador recomendado | Antes de habilitar autenticación real o acceso comercial público |
| Caminos posibles | Middleware/policy de entitlement reutilizable o autorización por caso de uso |
| Decisión pendiente | Definir qué endpoints y contenidos requieren qué entitlement |

### R-003 — Dos fuentes pedagógicas independientes

| Campo | Evaluación |
|---|---|
| Estado | Riesgo observado, no necesariamente problema actual |
| Contextos | Acquisition ↔ Academy Content |
| Situación actual | La demo usa datos TypeScript; la experiencia privada usa PostgreSQL. El catálogo demo actual declara 75 lecciones, muestra 15 en carrusel, mantiene 5 jugables y resume las 60 restantes como teaser numérico |
| Impacto | Duplicación editorial y posible divergencia pedagógica |
| Severidad | Media; alta si se promete continuidad demo → academia |
| Activador recomendado | Cuando editar ambas fuentes se vuelva costoso, la demo deba continuar dentro del curso real o se escale el funnel |
| Caminos posibles | Mantener separación explícita, compartir catálogo publicado o generar copia controlada |
| Decisión pendiente | Definir si la demo es producto comercial independiente o muestra del Academy Content real |

### R-004 — Fragmentación documental

| Campo | Evaluación |
|---|---|
| Estado | Riesgo observado |
| Áreas | `.agents`, `docs/architecture`, `docs/vision`, handoffs, skills y README |
| Situación actual | Documentos con fechas y estados distintos compiten como fuente de verdad. Algunos documentos todavía declaran `0f7415a` como último commit, mientras HEAD observado el 2026-06-15 es `1d30841` |
| Impacto | Agentes y personas pueden actuar usando contexto obsoleto |
| Severidad | Media |
| Activador recomendado | Permanente |
| Caminos posibles | Índice rector, estados explícitos y archivado/superseded consistente |
| Decisión pendiente | Definir jerarquía documental oficial |

### R-005 — Frontend coordinador central creciente

| Campo | Evaluación |
|---|---|
| Estado | Riesgo temprano observado |
| Área | `src/app/App.tsx` y navegación `currentPage` |
| Situación actual | Coordina navegación, sesión pública, checkout, reproducción y montaje de páginas |
| Impacto | Mayor dificultad para evolucionar dominios y flujos |
| Severidad | Baja/Media hoy |
| Activador recomendado | Cuando una nueva fase requiera ampliar significativamente routing o estados globales |
| Caminos posibles | Mantener conscientemente, extraer coordinadores por flujo o adoptar routing global en fase explícita |
| Decisión pendiente | No cambiar mientras D-018 continúe vigente |

### R-006 — Identity parcial de desarrollo

| Campo | Evaluación |
|---|---|
| Estado | Riesgo comprobado y aceptado temporalmente |
| Contextos | Identity → Learning Journey / Membership Entitlements |
| Situación actual | Existen `User`, roles, cookie firmada y `devStudentAuth`, pero no autenticación productiva |
| Impacto | Progreso y membresías reales no deben depender de identidad de desarrollo |
| Severidad | Alta antes de alumnos externos |
| Activador recomendado | Antes del primer piloto externo, login privado, membresías reales o progreso personal persistente |
| Caminos posibles | Ejecutar la fase de Identity real previamente diseñada o reevaluar proveedor/estrategia |
| Decisión pendiente | Mantener la condición de desbloqueo comercial definida por Juan |

### R-007 — Acquisition sin Lead persistido

| Campo | Evaluación |
|---|---|
| Estado | Decisión pendiente, no defecto automático |
| Contextos | Acquisition |
| Situación actual | El funnel utiliza `localStorage`, PostHog y WhatsApp; no existe entidad `Lead` propia |
| Impacto | Trazabilidad limitada entre visitante, demo, intención y conversión humana |
| Severidad | Media; aumenta al invertir en adquisición |
| Activador recomendado | Antes de tráfico pagado significativo, automatización de seguimiento o medición de CAC |
| Caminos posibles | Continuar human-in-the-loop, persistir leads mínimos o integrar CRM externo |
| Decisión pendiente | Definir cuándo la pérdida de trazabilidad supera el valor de mantener el funnel liviano |

### R-008 — Admin como dueño falso de reglas

| Campo | Evaluación |
|---|---|
| Estado | **Mitigado parcialmente** — Admin Creador MVP en `fd65927` |
| Contextos | Administration como interfaz sobre Academy, Identity, Entitlements, Learning Journey y Community |
| Situación actual | Panel `/admin` + API `/api/v1/admin/*`; dueño de reglas publish = `server/services/curriculum.ts` |
| Impacto | UI y rutas admin son capas delgadas; `requireAdmin` verifica rol contra DB en cada request |
| Severidad | Alta si admin duplica reglas de negocio o expone credenciales |
| Regla permanente (2 Jul 2026) | Credenciales seed admin **solo** vía `ADMIN_SEED_PASSWORD` en env; nunca hardcodeadas ni mostradas en UI. Contraseñas expuestas en git se tratan como quemadas — rotar en prod de inmediato. |
| Decisión pendiente | Casos de uso admin futuros (moderación, alumnos) deben declarar contexto dueño antes de implementar |

### R-009 — IA sin decisiones delimitadas

| Campo | Evaluación |
|---|---|
| Estado | Riesgo futuro controlado por decisión actual |
| Contextos | IA candidata ↔ Academy Content / Learning Journey |
| Situación actual | IA no posee lenguaje, fuente de verdad ni autoridad core |
| Impacto | Una integración prematura podría tomar decisiones pedagógicas no auditables o invadir otros contextos |
| Severidad | Media/Alta al introducir personalización |
| Activador recomendado | Antes de recomendar rutas, diagnosticar desempeño o influir en prácticas |
| Caminos posibles | Definir primero decisiones permitidas, evidencia consumida y límites de autoridad |
| Decisión pendiente | Determinar el primer caso de uso real de IA |

### R-010 — Capacidades futuras conectadas directamente

| Campo | Evaluación |
|---|---|
| Estado | Riesgo futuro |
| Contextos | Notifications / Community ↔ Learning Journey |
| Situación actual | Notifications no existe y Community es mock |
| Impacto | Avisos duplicados, spam o comunidad modificando progreso oficial si se conectan sin contratos claros |
| Severidad | Media |
| Activador recomendado | Antes de recordatorios automáticos, posts, retos, rankings o logros compartibles |
| Caminos posibles | Eventos internos nombrados y contratos donde Learning Journey conserva la verdad oficial |
| Decisión pendiente | Definir primeros casos de uso y límites antes de implementación |

---

## 9. Caminos arquitectónicos posibles

Estos caminos no son tareas autorizadas. Sirven para conversar trade-offs con Opus.

### Camino A — Proteger producción mínima

Objetivo: resolver únicamente condiciones necesarias antes de usuarios y membresías reales.

- Auth real.
- Entitlements exigido en backend.
- Política mínima para estabilidad de contenido durante sesiones.
- Mantener demo y Academy Content separados.

**Gana:** menor riesgo y alcance controlado.  
**Pierde:** mantiene duplicación y modularidad principalmente conceptual.

### Camino B — Consolidar el Learning Platform

Objetivo: convertir el Learning Journey y Academy Content en una plataforma interna más madura.

- Versionado de contenido.
- Contratos internos explícitos.
- Eventos internos nombrados.
- Herramientas de publicación y operación.
- Fitness checks automatizados donde aporten valor.

**Gana:** base fuerte para crecimiento pedagógico.  
**Pierde:** inversión considerable antes de validar escala de producto.

### Camino C — Evolución orientada por conversión

Objetivo: mantener la arquitectura actual y desbloquear trabajo solamente mediante señales de negocio.

- Funnel y analítica primero.
- Auth y Entitlements al confirmar conversión.
- Billing al necesitar cobro automatizado.
- Consolidación pedagógica al aumentar contenido y alumnos.

**Gana:** máxima disciplina de MVP.  
**Pierde:** algunas brechas permanecen abiertas más tiempo y requieren vigilancia.

### Hipótesis recomendada para discutir

Combinar **Camino C** como estrategia de producto con las protecciones críticas de **Camino A** justo antes de producción real. Reservar **Camino B** para cuando el volumen de contenido, alumnos o equipo lo justifique.

---

## 10. Guardrails de activación

Estos controles convierten los riesgos en condiciones para decidir trabajo futuro. No autorizan implementar por sí solos.

| Antes de activar... | Debe estar resuelto o explícitamente aceptado... |
|---|---|
| Auth real, membresías reales o alumnos externos | R-002 Entitlements exigido en backend y R-006 Identity productiva |
| Edición dinámica de contenido en producción | R-001 estabilidad/versionado de contenido por sesión |
| Continuidad pedagógica demo → academia | R-003 estrategia de fuente pedagógica |
| Campañas pagadas o automatización comercial | R-007 estrategia de persistencia/seguimiento de leads |
| Panel administrativo | R-008 límites de Admin y casos de uso dueños |
| Recomendaciones o diagnóstico por IA | R-009 autoridad y límites de IA |
| Recordatorios, retos o comunidad real | R-010 contratos con Learning Journey |
| Billing real | Separación Billing → Entitlements y autorización backend |

---

## 11. Architecture Fitness Checklist

| Check | Estado observado | Condición objetivo |
|---|---|---|
| Learning Journey unido y transaccional | Cumple | Mantener mientras comparta invariantes |
| XP idempotente | Cumple con tests | No aceptar regresiones |
| Racha sin duplicación diaria | Cumple con tests | No aceptar regresiones |
| Desbloqueo derivado desde progreso | Cumple | Documentar como regla |
| Demo separada de progreso real | Cumple | Mantener hasta nueva decisión |
| UI consulta backend para acceso | Cumple | No convertir UI en autoridad |
| Entitlements exigido por endpoints privados | Brecha crítica | Requerido antes de auth/membresías reales |
| Contenido estable durante sesión | Brecha crítica | Requerido antes de contenido editable en producción |
| Identity real | Parcial de desarrollo | Requerido antes de producción |
| Eventos internos nombrados | Pendiente | Introducir solo cuando reduzcan acoplamiento real |
| Billing separado de Entitlements | Objetivo futuro | Aplicar cuando exista Billing |
| IA sin autoridad core | Cumple por decisión | Mantener |
| Community sin autoridad de progreso | Cumple por ausencia | Mantener cuando se implemente |
| Documentación con fuente de verdad clara | Brecha | Definir jerarquía |

---

## 12. Registros de decisión candidatos

Hasta definir una convención ADR oficial, usar nombres fechados y estado **propuesto**:

```text
2026-06-15-content-versioning-for-lesson-sessions.md
2026-06-15-backend-entitlement-enforcement.md
2026-06-15-demo-content-source-strategy.md
2026-06-15-identity-development-boundary.md
2026-06-15-acquisition-lead-persistence-decision.md
```

Estos archivos todavía no deben crearse: primero Juan y Opus deben cerrar la decisión correspondiente.

---

## 13. Revisión de Opus — 2026-06-15

La revisión ejecutiva de Opus fue contrastada nuevamente contra el repositorio.

### Recomendaciones de Opus validadas

- Mantener **Camino C** como estrategia de producto y aplicar protecciones de **Camino A** por activador.
- Tratar R-002 y R-006 como un mismo paquete antes de usuarios reales: Identity productiva sin enforcement de Entitlements dejaría una brecha de autorización.
- Mantener Learning Journey unido.
- Resolver primero la fragmentación documental por su bajo coste y alto beneficio operativo.
- Posponer Admin, IA, Notifications y Community hasta que exista un caso de uso activador.

### Correcciones realizadas tras verificar el repositorio

| Afirmación de la revisión | Corrección observada |
|---|---|
| El commit real sería `4a52b31` | HEAD observado es `1d30841`; `origin/main` está en `4a52b31` |
| R-001 se activa únicamente con interfaz editorial | También puede activarse por seed, script o edición directa de PostgreSQL |
| Debe decidirse entre “75 cards” y teaser | El working tree ya implementa 75 entradas de catálogo, 15 visibles en carrusel, 5 jugables y teaser numérico para 60 |
| La demo ya debe declararse producto independiente definitivo | Es una propuesta razonable, pero todavía requiere decisión explícita de Juan |

### Decisiones propuestas por Opus, todavía pendientes de Juan

| ID temporal | Propuesta | Estado |
|---|---|---|
| DP-001 | Cuando se active Fase 4, Identity real y enforcement backend de Entitlements deben resolverse juntos | Recomendada para aprobación |
| DP-002 | La demo es producto de adquisición independiente y no se unifica con Academy Content en Track A | Pendiente de decisión de producto |
| DP-003 | Aceptar temporalmente R-001 hasta que exista mutación de contenido en producción con sesiones activas | Recomendada con activador corregido |

### Preguntas que permanecen abiertas para Juan

1. ¿La experiencia actual debe mantenerse como **5 clases gratuitas + 10 cards bloqueadas + teaser de 60**, o cambiarse?
2. ¿La demo debe prometer continuidad pedagógica con la academia pagada?
3. ¿La demo se declara formalmente producto independiente durante todo Track A?
4. ¿Cuándo podría una persona o proceso editar contenido privado mientras existen sesiones activas?
5. ¿Aprueba Juan que Fase 4 incluya obligatoriamente Identity real + enforcement backend de Entitlements?

---

## 14. Jerarquía documental propuesta

Esta jerarquía fue recomendada por Opus y todavía requiere aprobación de Juan antes de convertirse en regla oficial.

| Nivel | Fuente | Responsabilidad propuesta |
|---|---|---|
| 1 — Autoritativo | `.agents/DECISIONS.md` | Decisiones aprobadas |
| 1 — Autoritativo | `.agents/PROJECT_STATUS.md` | Estado operativo, manteniéndolo actualizado |
| 1 — Ejecutable | `prisma/schema.prisma`, `server/routes/`, código y tests | Comportamiento real observado |
| 2 — Arquitectónico | `docs/architecture/` | Mapas, contratos, riesgos y propuestas validadas |
| 3 — Visión | `docs/vision/specs/`, `docs/vision/handoffs/` | Specs y handoffs con vigencia explícita |
| 4 — Archivado | `docs/legacy/` y artefactos `SUPERSEDED` | No usar como referencia activa |

### Regla propuesta para conflictos

```text
Decisión aprobada
    > comportamiento real comprobado
    > arquitectura vigente
    > spec
    > handoff
    > documento legacy
```

Una decisión aprobada puede describir un objetivo distinto del código actual; en ese caso debe quedar visible como brecha pendiente, no fingirse que ya está implementada.

### Regla propuesta para handoffs

Un handoff debe marcarse `SUPERSEDED` o archivarse cuando el commit que describe ya se encuentra en git y su información operativa dejó de ser necesaria. Archivar o borrar documentos requiere autorización explícita.

---

## 15. Decisiones pendientes para Juan y Opus

### Producto y estrategia

1. ¿Track A seguirá siendo la base evolutiva del producto o será reemplazado posteriormente por Track B?
2. ¿La demo pública debe continuar como producto de adquisición independiente?
3. ¿Cuál es la condición exacta que desbloquea auth y membresías reales?
4. ¿Qué volumen de alumnos o contenido justificaría invertir en una plataforma pedagógica más madura?

### Dominio pedagógico

5. ¿Qué significa oficialmente “clase completada”?
6. ¿El progreso principal se mide por nodo, habilidad musical, hábito o combinación?
7. ¿El contenido publicado puede editarse o cada cambio debe crear una nueva versión?
8. ¿Qué debe ocurrir con una sesión activa cuando cambia una lección?

### Acceso y monetización

9. ¿Qué recursos controla exactamente un entitlement: zona alumno completa, curso, instrumento, feature o perfil?
10. ¿Existirán compra única, membresía, invitaciones manuales y acceso familiar?
11. ¿Qué endpoints deben estar disponibles sin membresía activa?

### Operación y evolución

12. ¿Quién será responsable de crear y publicar contenido?
13. ¿Qué documentos deben considerarse fuente oficial de estado, decisiones y visión?
14. ¿Qué riesgos deben resolverse antes de producción y cuáles pueden aceptarse temporalmente?

---

## 16. Temas para conversación con Opus

Cuando Juan decida conversar con Opus, usar este orden:

1. Confirmar Modular Monolith como dirección.
2. Revisar Context Map actual versus objetivo.
3. Validar si Learning Journey seguirá unido.
4. Decidir el futuro de la demo frente a Academy Content.
5. Priorizar R-001 y R-002 según condiciones de producto.
6. Elegir Camino A, B, C o una combinación.
7. Acordar jerarquía documental.
8. Registrar únicamente las decisiones aprobadas.

### Prompt sugerido para Opus

```text
Lee docs/architecture/gmusic-architecture-working-map.md.

Actúa como arquitecto de Gmusic. El documento contiene hechos observados,
arquitectura objetivo, riesgos y caminos posibles; no contiene autorización
de implementación.

Primero:
1. Cuestiona las hipótesis y detecta alternativas omitidas.
2. Evalúa los caminos A, B y C según producto, riesgo, coste y evolución.
3. Recomienda qué riesgos aceptar, mitigar o resolver, y bajo qué activador.
4. Formula las decisiones que Juan debe aprobar.

No propongas cambios de carpetas ni implementación hasta cerrar decisiones.
```

---

## 17. Evidencia principal del repositorio

| Tema | Evidencia |
|---|---|
| Modelo de datos | `prisma/schema.prisma` |
| Contrato API | `docs/architecture/api-contract.md` |
| Learning Engine | `docs/architecture/learning-engine.md` |
| Cierre transaccional de sesión | `server/services/completeLessonSessionService.ts` |
| Inicio de sesión de lección | `server/services/lessonSessionService.ts` |
| Derivación de desbloqueos | `server/lib/nodeStatus.ts` |
| Resolución de acceso | `server/lib/studentAccess.ts`, `server/services/accessService.ts` |
| Endpoints privados actuales | `server/routes/me.ts`, `server/routes/lessonSessions.ts` |
| Guard visual de acceso | `src/app/components/gmusic/StudentZoneGuard.tsx` |
| Demo pública | `src/app/data/demo-lessons.ts`, `src/app/hooks/useDemoProgress.ts` |
| Catálogo demo actual | `src/app/data/demo-path-catalog.ts`, `src/app/pages/demo-path-build.ts` |
| Decisiones vigentes | `.agents/DECISIONS.md` |
| Estado operativo | `.agents/PROJECT_STATUS.md` |
| Pruebas de idempotencia | `server/tests/phase3b2.test.ts` |

---

## 18. Historial del cuaderno

| Fecha | Cambio |
|---|---|
| 2026-06-15 | Primera consolidación basada en auditoría read-only y refinamiento del Context Map v1.1 |
| 2026-06-15 | Incorporación del Risk Register priorizado y guardrails de activación propuestos por el Proyecto |
| 2026-06-15 | Incorporación y auditoría de la revisión ejecutiva de Opus; corrección de HEAD, alcance del catálogo demo y activador de R-001 |
