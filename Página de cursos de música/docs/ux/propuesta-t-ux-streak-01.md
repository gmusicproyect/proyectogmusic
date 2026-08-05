# Propuesta — Visualización de Racha en la UI (T-UX-STREAK-01)

**Producto:** Academia GMusic  
**Fecha:** agosto 2026  
**Estado:** Propuesta-insumo  
**Depende de:** T-PUB-02 (runner certificado, endpoint `complete`)  
**Bloqueado por:** T-UX-LESSON-01 (sidebar de lección, Ubicación 4)

---

## 1. Resumen Ejecutivo

El backend ya expone `currentStreak` y `streakUpdated` en la respuesta de `POST /api/v1/lesson-sessions/:id/complete`. Esta propuesta insumo define **dónde** y **cómo** mostrar ese dato en la UI para maximizar retención de alumnos, sin inventar endpoints ni lógica de cliente. Todo lo que no existe hoy (`bestStreak`, `weekHistory`, `practicedToday`, `lastPracticeDate`) está marcado explícitamente como campo propuesto con migración Prisma.

---

## 2. Dato real disponible hoy

```json
// POST /api/v1/lesson-sessions/:id/complete
// Contrato verificado contra repo (T-PUB-02, smoke test)
{
  "sessionId": "uuid",
  "status": "COMPLETED",
  "alreadyProcessed": false,
  "accuracy": 1.0,
  "xpEarned": 100,
  "streakUpdated": true,     // ← ← ← Dato real: indica si la racha subió en ESTE complete
  "currentStreak": 12,       // ← ← ← Dato real: valor después del complete
  "nodeCompleted": true,
  "completedAt": "2026-08-04T14:32:00Z"
}
```

**Nota:** `streakUpdated` es crítico para la UI. La racha solo incrementa una vez al día: en el segundo `complete` del mismo día, `currentStreak` no sube y `streakUpdated` es `false`. La celebración de "racha incrementada" solo debe mostrarse cuando `streakUpdated === true`.

**Lógica de "qué es un día" y reset de racha:** vive exclusivamente en el backend. El frontend solo lee y muestra.

---

## 3. Cuatro ubicaciones propuestas

### 3.1 Ubicación 1: Header global (siempre visible)

**Qué se muestra:** `currentStreak` como badge compacto en el topbar.

**Diseño:**
- Badge con 🔥 + número + "días"
- Fondo: `rgba(201, 168, 76, 0.08)` con borde `rgba(201, 168, 76, 0.15)`
- Color texto: `#C9A84C` (dorado real de producción)
- Click: navega a Mi Camino (donde la racha se ve en detalle)

**Cuándo aparece:** Siempre, si `currentStreak > 0`. Comportamiento recomendado: si es 0, no se muestra (evita vergüenza del alumno que no ha empezado). Decisión final en §6 / §8.2 #10.

**Dato usado:** `currentStreak` del último `complete` (o del perfil si se expone en `GET /api/v1/me`).

**[PENDIENTE #1: verificar si `GET /api/v1/me` o `GET /api/v1/me/path` incluye `currentStreak` fuera del `complete` — Cursor/docs G1]**

---

### 3.2 Ubicación 2: Mi Camino / Mi Estudio — Vista principal

**Qué se muestra:**
- Número grande de racha actual
- Subtítulo contextual: "días consecutivos de práctica"
- Meta próxima: "Tu mejor: 23 días · Meta: 14 días" (si `bestStreak` existe)
- Grid de 7 días: Lunes a Domingo con checks de días practicados
- CTA: "Practicar hoy →" (lleva al nodo actual del path)

**Diseño:**
- Tarjeta destacada con fondo `#111` y borde `#1a1a1a`
- Icono 🔥 grande (32px) en caja dorada suave
- Número: 28px, peso 600, color `#C9A84C`
- Grid de 7 días: círculos 32px, check verde si practicó, outline si no

**Datos usados:**
- `currentStreak` ✅ (real, de `complete` o perfil)
- `bestStreak` ❌ (no existe — propuesto como campo nuevo en Prisma)
- `weekHistory[7]` ❌ (no existe — propuesto como campo nuevo o derivable de historial de sesiones)

**[PENDIENTE #4: mapear esta ubicación a la pantalla real del alumno — Mi Camino o Mi Estudio, no a un "dashboard" genérico. Verificar cuál es la pantalla de aterrizaje post-login. Cursor/docs G1]**

**[PENDIENTE #5: verificar si `bestStreak` existe en algún modelo Prisma (User, StudentProfile) o requiere migración. Cursor/docs G1]**

---

### 3.3 Ubicación 3: Pantalla post-completado — Celebración condicional

**Qué se muestra:**
- Si `streakUpdated === true`: Animación de 🔥 con bounce + "¡Racha incrementada! 🔥 13 días consecutivos"
- Si `streakUpdated === false`: "¡Lección completada! 🔥 12 días consecutivos" (sin "incrementada")
- Contexto motivacional (si `bestStreak` existe): "¡Te falta 1 día para tu récord de 23!"

**Flujo:**
1. Alumno termina ejercicio → `POST /api/v1/lesson-sessions/:id/complete`
2. Backend devuelve `{ currentStreak: 13, streakUpdated: true/false }`
3. Frontend evalúa `streakUpdated`:
   - `true` → muestra celebración de racha incrementada
   - `false` → muestra lección completada con racha actual (sin incremento)
4. Auto-navega a Mi Camino después de 3 segundos (o click en "Continuar")

**Diseño:**
- Pantalla modal centrada, fondo `#080808` con overlay oscuro
- 🔥 48px con animación bounce (solo si `streakUpdated === true`)
- Texto: 18px título, 13px subtítulo, 16px racha en badge dorado
- Badge: `rgba(201, 168, 76, 0.08)` con borde `#C9A84C` al 20%

**Dato usado:** `currentStreak` + `streakUpdated` de la respuesta de `complete` ✅ (ambos reales)

**[PENDIENTE: resuelto — el `complete` devuelve ambos campos inmediatamente, verificado en T-PUB-02 smoke test]**

---

### 3.4 Ubicación 4: Sidebar de lección — Recordatorio contextual

**Dependencia:** Esta ubicación requiere que exista el sidebar de lección, que es el alcance de **T-UX-LESSON-01**. Sin ese componente, esta ubicación no es implementable.

**Qué se muestra:**
- Banner sutil en el sidebar: "🔥 Racha: 12 días · Practica hoy para mantenerla"
- Si ya practicó hoy: no se muestra (o cambia a "¡Racha activa! 🔥 12 días")

**Diseño:**
- Banner compacto: padding 10px, fondo `rgba(201, 168, 76, 0.06)`, borde `rgba(201, 168, 76, 0.12)`
- Texto: 12px título dorado, 10px subtítulo gris
- CTA: "Ir →" lleva al nodo actual

**Cuándo aparece:**
- Si `currentStreak > 0` AND `practicedToday === false`
- `practicedToday` debe venir del backend, no derivarse en cliente. La lógica de "qué es hoy" (zona horaria, inicio de día) vive exclusivamente en el servidor.

**Datos usados:**
- `currentStreak` ✅ (real)
- `practicedToday` ❌ (no existe — propuesto como campo de backend o `lastPracticeDate`)

**[PENDIENTE #6: proponer `practicedToday` o `lastPracticeDate` como campo de backend. No derivar en cliente. Cursor/backend G1]**

---

## 4. Datos propuestos vs. datos reales

| Campo | Estado | Para qué | Cómo obtener |
|---|---|---|---|
| `currentStreak` | ✅ **Real** | Todas las ubicaciones | `POST /api/v1/lesson-sessions/:id/complete` |
| `streakUpdated` | ✅ **Real** | Celebración condicional (Ubicación 3) | `POST /api/v1/lesson-sessions/:id/complete` |
| `xpEarned` | ✅ **Real** | Contexto de recompensa (opcional) | `POST /api/v1/lesson-sessions/:id/complete` |
| `accuracy` | ✅ **Real** | Feedback de precisión (opcional) | `POST /api/v1/lesson-sessions/:id/complete` |
| `bestStreak` | ❌ **No existe** | "Tu mejor racha" en Mi Camino/Mi Estudio y celebración | Propuesto: campo nuevo en Prisma, migración con guard |
| `weekHistory[7]` | ❌ **No existe** | Grid de 7 días en Mi Camino/Mi Estudio | Propuesto: array booleano de 7 días, o historial de sesiones |
| `practicedToday` | ❌ **No existe** | Ocultar/mostrar banner en sidebar | Propuesto: campo de backend (no derivar en cliente) |
| `lastPracticeDate` | ❌ **No existe** | Alternativa a `practicedToday` | Propuesto: campo de backend |
| `totalXp` | ❌ **No existe** | Niveles/progreso global | Propuesto: campo nuevo en Prisma |
| `nextLevelAt` | ❌ **No existe** | Meta de siguiente nivel | Propuesto: campo nuevo en Prisma |

---

## 5. Reglas de gobernanza aplicadas

| Regla | Cumplimiento |
|---|---|
| No inventar endpoints | ✅ Solo se usa `POST /api/v1/lesson-sessions/:id/complete` (existente) y `GET /api/v1/me/path` (existente) |
| No scoring en cliente | ✅ Toda lógica de racha vive en backend. Frontend solo lee `currentStreak` y `streakUpdated`. |
| No lógica de día en cliente | ✅ `practicedToday` propuesto como campo de backend, no derivable. |
| No pagos ni monetización | ✅ La racha no se vende, no desbloquea contenido pago, no es premium. |
| No Next.js/SSR | ✅ Propuesta es de diseño UI, no depende de framework. |
| URLs públicas por D-GOV | ✅ No se propone URL nueva. |
| Nombre del producto | ✅ Academia GMusic. |

---

## 6. Decisiones pendientes (no se deciden en este doc)

| Decisión | Quién decide | Cuándo |
|---|---|---|
| ¿Agregar `bestStreak` al schema? | Backend + Producto | Si se aprueba esta propuesta |
| ¿Agregar `weekHistory` o historial de sesiones al perfil? | Backend + Producto | Si se aprueba Mi Camino/Mi Estudio detallado |
| ¿Agregar `practicedToday` o `lastPracticeDate` al perfil? | Backend + Producto | Si se aprueba Ubicación 4 |
| ¿La racha se muestra si es 0? | Producto | Handoff del ticket |
| ¿Animación de celebración post-completado? | Diseño + Producto | Handoff del ticket |
| ¿El header global muestra racha o se reserva para Mi Camino? | Producto | Handoff del ticket |

**Recomendación del doc:** No mostrar racha si es 0. Evita que el alumno nuevo se sienta fracasado antes de empezar. Mostrar desde 1 en adelante.

---

## 7. Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Alumno ve "0 días" y se siente fracasado | No mostrar racha si es 0; mostrar solo desde 1. (Recomendación, no regla.) |
| Racha se rompe por bug de backend (zona horaria, etc.) | La lógica de "día" debe ser robusta en backend; frontend no compensa. |
| Gamificación excesiva genera ansiedad | Mensajes positivos siempre: "¡Vuelves mañana!" en lugar de castigo. |
| `currentStreak` no se actualiza en tiempo real en header | Header lee de perfil en carga inicial; se actualiza explícitamente post-complete. |
| Celebración de racha incrementada en complete donde no subió | Usar `streakUpdated` como condicional. Si `false`, no mostrar "incrementada". |
| Lógica de "hoy" derivada en cliente (zona horaria) | `practicedToday` debe venir de backend, no calcularse en frontend. |

---

## 8. Inventario de pendientes

### 8.1 Hechos del repo (resolubles con Cursor/docs G1)

| # | Pendiente | Dónde verificar | Estado |
|---|---|---|---|
| 1 | **`GET /api/v1/me`:** no — solo devuelve `{ context }` (`LearnerContextH1`, sin racha). **`GET /api/v1/me/path`:** no — solo `course`, `modules[]`, `nodes[]` (estado del nodo), `activeNodeId`; sin racha ni sesiones. **Sí fuera del `complete`:** `GET /api/v1/me/dashboard` → `streak.currentDays` (equivalente numérico a `currentStreak`) + `streak.activeToday`; `GET /api/v1/me/progress` → `progressViewH1.streakDays` + `lastActivityAt` (cómputo distinto, eventos H1). | Backend T-PUB-02, `meService.ts`, `me.ts` | **Resuelto ✅** |
| 2 | **Solo nodos** — `buildPathResponse` devuelve módulos/nodos con `status` (`locked`/`active`/`completed`), metadatos de etapa y URLs de material. **No** incluye `LessonSession` del día, `practicedToday` ni historial de sesiones. Para “¿practicó hoy?” hoy: `GET /api/v1/me/dashboard` → `streak.activeToday` (derivado de `StreakEvent.eventDate` vs timezone del alumno). | Backend, `meService.buildPathResponse` | **Resuelto ✅** |
| 3 | ¿El `complete` devuelve `currentStreak` inmediatamente? | T-PUB-02 smoke test | **Resuelto ✅** |
| 4 | **Aterrizaje post-login:** `App.tsx` — alumno autenticado en `/` → `handlePageChange("mi-estudio")`. Routing: `student-zone-routing.ts` — `mi-estudio`/`welcome` → pathname `/alumno`; render `GmusicWelcome` (`useDashboard` → `GET /api/v1/me/dashboard`). **`/mi-camino`** es pantalla separada (`GmusicPath`), no landing por defecto. Ubicación 2 propuesta = extender **Mi Estudio** (`/alumno`), no un dashboard genérico ajeno al routing. | `App.tsx`, `student-zone-routing.ts` | **Resuelto ✅** |
| 5 | **No** — ningún modelo Prisma (`User`, `LearnerProjectionH1`, `StreakEvent`, etc.) define `bestStreak`. `StreakEvent` guarda `currentStreak` **por fila/día** (`eventDate`); el máximo histórico requeriría agregación o campo nuevo + migración. | `prisma/schema.prisma` | **Resuelto ✅** |
| 6 | **No** como campo dedicado en perfil (`User` / `LearnerProjectionH1`). Proxies existentes: `StreakEvent.eventDate` (última fila = último día con racha registrada); `GET /api/v1/me/progress` → `lastActivityAt`; `GET /api/v1/me/dashboard` → `streak.activeToday` (booleano, no fecha). | `prisma/schema.prisma`, `progressViewH1.ts`, `meService.ts` | **Resuelto ✅** |

### 8.2 Decisiones (esperan aprobación de propuesta)

| # | Pendiente | Quién decide |
|---|---|---|
| 7 | ¿Agregar campos `bestStreak`, `weekHistory`, `practicedToday` al schema? | Backend + Producto |
| 8 | ¿Qué ubicaciones se implementan? (1, 2, 3, 4, o subset) | Producto + Diseño |
| 9 | ¿Animación de celebración: sí/no, qué tipo? | Diseño |
| 10 | ¿Mostrar racha si es 0? | Producto (recomendación del doc: no) |

### 8.3 Post-implementación

| # | Pendiente | Cuándo |
|---|---|---|
| 11 | A/B test: ¿la racha en header aumenta retención? | Con métricas reales, 30 días post-lanzamiento |
| 12 | ¿Mensajes de racha en riesgo funcionan o generan churn? | Con métricas reales, 30 días post-lanzamiento |
| 13 | ¿El banner de sidebar (Ubicación 4) aumenta práctica diaria? | Con métricas reales, 30 días post-lanzamiento |

### 8.4 Registro de discrepancias (repo vs propuesta)

| # | Discrepancia |
|---|---|
| 1 | §2 JSON de ejemplo del `complete` usa campos inventados (`completed`, `totalXp`, `nextLevelAt`); contrato real: `status`, `alreadyProcessed`, `accuracy`, `xpEarned`, `streakUpdated`, `currentStreak`, `nodeCompleted`, `completedAt`. |
| 2 | `currentStreak` **no** viaja en `GET /api/v1/me` ni en `GET /api/v1/me/path`; el dato fuera del `complete` está en `GET /api/v1/me/dashboard` como `streak.currentDays` (nombre distinto). |
| 3 | `practicedToday` como campo no existe, pero `streak.activeToday` en dashboard cubre el mismo intent (booleano, backend). `/me/path` no ayuda para derivarlo. |
| 4 | Mi Estudio (`GmusicWelcome` + `useDashboard`) **ya consume** racha del backend; Ubicación 2 no es pantalla nueva sino extensión de `/alumno`. |
| 5 | `GET /api/v1/me/progress` expone `streakDays` calculado desde eventos H1 — puede diferir de `StreakEvent.currentStreak` usado en dashboard/`complete`; no asumir una sola fuente sin alinear producto. |

---

## 9. Dependencias con otros tickets

| Ticket | Relación | Nota |
|---|---|---|
| **T-PUB-02** | **Requerido** | Provee `currentStreak` y `streakUpdated` en `complete`. Ya certificado. |
| **T-UX-LESSON-01** | **Bloquea Ubicación 4** | El sidebar de lección no existe sin este ticket. Ubicaciones 1, 2, 3 son independientes. |

**Nota sobre MVP:** Si el pendiente #1 resulta negativo (ni `GET /api/v1/me` ni `GET /api/v1/me/path` exponen `currentStreak` fuera del `complete`), la única ubicación implementable sin trabajo de backend es la **3 (celebración post-completado)**, que se alimenta enteramente de la respuesta del `complete`. Esa es la jerarquía real del doc: un MVP gratis y tres opciones que probablemente requieren exponer un dato adicional. Quien decida el subset (§8.2 #8) debe ver esta jerarquía de frente.

---

*Documento de propuesta-insumo. No contiene código de producción. Nombre del producto: Academia GMusic.*
