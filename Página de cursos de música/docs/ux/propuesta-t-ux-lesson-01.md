# Propuesta — Pantalla de Lección y Estructura de Clases (T-UX-LESSON-01)

**Producto:** Academia GMusic  
**Fecha:** agosto 2026  
**Estado:** Propuesta-insumo · **v1.1 — corregida** según evaluación de Fable (2026-08-05)  
**Depende de:** T-PUB-02 (runner certificado, endpoint `complete`)  
**Desbloquea:** T-UX-STREAK-01 — Ubicación 4 (banner de racha en sidebar)

> **Errata v1.1 (2026-08-05):** (1) El runner **no escucha la guitarra**: el alumno responde ejercicios (`selectedAnswer`, `responseTimeMs`) y el servidor califica en el `complete`. No existe captura de audio en ninguna capa — la experiencia tipo Yousician es decisión D-GOV propia (`PROPUESTA-D-GOV-MOTOR-AUDIO.md`). (2) `POST /lesson-sessions` es **real y certificado** (devuelve `exercises[]`, `expiresAt`, `contentSnapshot`). (3) `GET /lessons/:id`, `tablatureUrl` y `durationSec` **no existen en contrato** — la información de etapa vive entre `GET /api/v1/me/path` y la sesión. (4) Léxico unificado: Bloque / Etapa (`PathNode`) / `StageType`.
>
> **Errata layout (2026-08-05, D-UX-LAYOUT-01):** la **Parte A** (layout 3-zonas de este doc) queda **superada** por el layout de **pestañas** (Tarjetas · Práctica · Resumen PDF) de la entrega Kimi archivada en `docs/ux/entregas/entrega-kimi-2026-08-05/`. Este documento sigue vigente para **estructura pedagógica (Parte B)** y contratos; no compite con el layout aprobado.

---

## 1. Resumen Ejecutivo

Esta propuesta insumo define dos cosas en un solo documento: **(A) la pantalla de lección** —layout, zonas, sidebar y navegación entre clases— y **(B) la estructura pedagógica de una clase** —qué contiene, en qué orden y cómo se completa—. El único contrato de backend verificado hoy es `POST /api/v1/lesson-sessions/:id/complete` (T-PUB-02). Todo endpoint de lectura de lecciones (`GET lesson`, sesiones, progreso) se asume razonable y está marcado explícitamente como **propuesto**, pendiente de verificación contra repo. Nada en este documento inventa lógica de cliente: scoring, racha y definición de "día" viven exclusivamente en backend.

---

## 2. Dato real disponible hoy vs. endpoints asumidos

### 2.1 Real (verificado, T-PUB-02)

```json
// POST /api/v1/lesson-sessions/:id/complete
{
  "sessionId": "uuid",
  "status": "COMPLETED",
  "alreadyProcessed": false,
  "accuracy": 1.0,
  "xpEarned": 100,
  "streakUpdated": true,
  "currentStreak": 12,
  "nodeCompleted": true,
  "completedAt": "2026-08-04T14:32:00Z"
}
```

Existe además `GET /api/v1/me/path` (referenciado como existente en T-UX-STREAK-01 §5), que entrega los nodos del camino del alumno.

### 2.2 Contratos verificados contra repo (pasada del 2026-08-05)

```json
// POST /api/v1/lesson-sessions       [REAL — certificado]
// Crea la sesión al entrar a la etapa. Más rico de lo que esta propuesta asumía:
{
  "sessionId": "uuid",
  "exercises": [ /* MicroExercise[] con payload JSON parseable — el ejercicio ES el payload */ ],
  "expiresAt": "2026-08-05T15:00:00Z",
  "contentSnapshot": { /* congela el contenido de la sesión */ }
}
```

```json
// GET /api/v1/me/path                [EXISTENTE — contenido exacto PENDIENTE #2]
// Cada PathNode expone las etapas; incluye guidePdfUrl (PDF de materia por tarjeta).
// Se asume que cada nodo expone al menos: id, título, estado (locked/current/done).
```

**Eliminados por no existir en contrato:** `GET /api/v1/lessons/:id`, `tablatureUrl`, `durationSec`. La información de la etapa (título, orden, tipo `StageType`) vive repartida entre `GET /api/v1/me/path` y la sesión — no hay endpoint de lección individual.

---

## 3. PARTE A — Pantalla de lección: layout y zonas

### 3.1 Layout general (desktop)

```
┌──────────────────────────────────────────────────────────┐
│ A. Header de lección (fijo, 56px)                        │
├────────────────────────────────────────────┬─────────────┤
│                                            │             │
│  B. Zona de contenido                      │  C. Sidebar │
│  (video + tablatura + ejercicio)           │  de lección │
│                                            │  (280px)    │
│                                            │             │
├────────────────────────────────────────────┴─────────────┤
│ D. Barra de navegación (fija, 64px)                      │
└──────────────────────────────────────────────────────────┘
```

Mobile (< 768px): el sidebar colapsa a un drawer inferior ("Ver temario ↑"). El resto apila verticalmente en orden A → B → D.

---

### 3.2 Zona A — Header de lección

**Qué se muestra:**
- Breadcrumb: `Mi Camino › Chord Basics I › Acordes básicos I`
- Botón salir (`✕`) con confirmación solo si hay sesión activa sin completar
- (Opcional) Badge de racha — **Ubicación 1 de T-UX-STREAK-01**, si Producto aprueba header global

**Diseño:**
- Fondo `#0a0a0a`, borde inferior `#1a1a1a`
- Breadcrumb: 13px, gris `#888`, segmento activo en `#e5e5e5`
- Altura fija 56px, no hace scroll

**Datos usados:** título de lección y módulo (`GET /api/v1/lessons/:id` propuesto) + `currentStreak` si aplica.

---

### 3.3 Zona B — Contenido de la clase (el corazón pedagógico)

Renderiza la estructura pedagógica definida en §4. Resumen visual:

```
┌────────────────────────────────────────────┐
│  B1. Video de la clase (16:9)              │
├────────────────────────────────────────────┤
│  B2. Tablatura interactiva (JSON → render) │
├────────────────────────────────────────────┤
│  B3. Ejercicio / práctica                  │
│      "Cuando termines: [Completar lección]"│
└────────────────────────────────────────────┘
```

**Diseño:**
- Fondo de zona: `#080808`; tarjetas internas `#111` con borde `#1a1a1a`
- Acento dorado `#C9A84C` solo para el estado activo (bloque en curso, CTA principal)
- Un solo CTA primario visible a la vez (regla anti-ansiedad, §7)

---

### 3.4 Zona C — Sidebar de lección (componente que desbloquea T-UX-STREAK-01 Ubicación 4)

**Qué se muestra, de arriba hacia abajo:**

1. **Progreso del módulo:** "Chord Basics I · 3 de 8 clases" + barra de progreso fina (2px, dorado sobre `#1a1a1a`)
2. **Slot de banner de racha** — reservado para T-UX-STREAK-01 Ubicación 4:
   - Banner compacto: padding 10px, fondo `rgba(201, 168, 76, 0.06)`, borde `rgba(201, 168, 76, 0.12)`
   - "🔥 Racha: 12 días · Practica hoy para mantenerla" / "¡Racha activa! 🔥 12 días"
   - Depende de `practicedToday` (campo propuesto de backend — ver T-UX-STREAK-01 §3.4)
3. **Temario del módulo:** lista de clases con estado por ítem:
   - ✅ Completada (check verde tenue)
   - ▶ Actual (borde dorado `rgba(201,168,76,0.25)`, fondo `rgba(201,168,76,0.05)`)
   - 🔒 Bloqueada (gris `#444`, no clickeable)
4. **CTA contextual:** "Siguiente clase →" (habilitado solo tras `complete` exitoso)

**Diseño:**
- Ancho 280px desktop, fondo `#0d0d0d`, borde izquierdo `#1a1a1a`
- Ítem de temario: 13px, padding 10px 12px, separador `#161616`

**Datos usados:** `GET /api/v1/me/path` (existente, contenido PENDIENTE #2) + `currentStreak`/`practicedToday` (real / propuesto).

---

### 3.5 Zona D — Barra de navegación

**Qué se muestra:**
- Izquierda: "← Clase anterior" (deshabilitado si `prevLessonId === null`)
- Centro: indicador "Clase 3 de 8"
- Derecha: botón primario contextual:
  - Antes de completar: **"Completar lección"** (deshabilitado hasta que el ejercicio B3 se ejecuta)
  - Después de completar: **"Siguiente clase →"** (dorado sólido `#C9A84C`, texto `#000`)

**Regla crítica:** el botón "Completar lección" dispara `POST /api/v1/lesson-sessions/:id/complete` con el `sessionId` de la sesión activa. Si la respuesta trae `alreadyProcessed: true`, el frontend **no** celebra de nuevo ni suma XP en UI — solo navega. Idempotencia leída, nunca recalculada.

---

## 4. PARTE B — Estructura pedagógica de una clase

### 4.1 Principio rector

Una clase = **un objetivo motor o conceptual único**, aprendible en 5–10 minutos, con cierre verificable (ejercicio con `accuracy`). Nada de clases de 40 minutos con 6 temas: la retención en Academia GMusic se apoya en racha + completados frecuentes (T-UX-STREAK-01), y eso exige unidades cortas y cerradas.

### 4.2 Secuencia canónica de una clase

| # | Bloque | Qué pasa | Dato que lo alimenta |
|---|---|---|---|
| 1 | **Contexto** (≤ 15 seg) | Texto de 1–2 líneas: "Hoy sale el acorde Em. Lo usas en la canción del nivel 4." | `lesson.introText` [propuesto] |
| 2 | **Demostración** (video) | El profesor lo ejecuta. Video 16:9, sin skip los primeros 10 seg (anti-abandono ciego) | `lesson.videoUrl` [propuesto] |
| 3 | **Práctica guiada** | Tablatura JSON renderizada, tempo reducido opcional (0.75x). El alumno toca con la guitarra real | `lesson.tablatureUrl` [propuesto] |
| 4 | **Ejercicio verificable** | El alumno **responde** ejercicios (`selectedAnswer`, `responseTimeMs`); el servidor califica en el `complete` y produce `accuracy`. Umbral real: 0.7 por etapa, fijo en backend. **No hay escucha de guitarra** | sesión activa → `complete` (real) |
| 5 | **Cierre + recompensa** | `complete` → celebración condicional (T-UX-STREAK-01 Ubicación 3) → "Siguiente clase →" | `xpEarned`, `streakUpdated`, `currentStreak` (reales) |

### 4.3 Tipos de clase (`lesson.type`)

| Tipo | Composición | Ejemplo |
|---|---|---|
| `VIDEO_PRACTICE` | Secuencia completa 1→5 | "Acordes básicos I — Em y Am" |
| `PRACTICE_ONLY` | Sin video: bloques 1, 3, 4, 5 | "Repaso Em↔Am switching, 60 bpm" |
| `THEORY` | Bloques 1, 2, 5 — sin ejercicio con accuracy; el `complete` se dispara por lectura confirmada | "Cómo se lee una tablatura" |

**[PENDIENTE #7: confirmar con Backend si `THEORY` puede usar el mismo `complete` o necesita variante sin scoring. La regla "no scoring en cliente" se mantiene igual.]**

### 4.4 Reglas pedagógicas de secuencia entre clases

1. **Nunca dos `VIDEO_PRACTICE` de técnica nueva seguidas**: entre dos clases de técnica nueva va un `PRACTICE_ONLY` de consolidación.
2. **Dificultad en escalera, no en rampa**: el salto de tempo entre clase y clase ≤ 10 bpm.
3. **Cada módulo cierra con aplicación musical** (canción o riff reconocible), no con ejercicio abstracto. Es la recompensa emocional del módulo.
4. **El temario del sidebar es el contrato con el alumno**: lo que se ve es exactamente lo que falta. Ni clases ocultas ni sorpresas mid-módulo.

**[PENDIENTE #8: estas 4 reglas son pedagógicas, no técnicas. Validarlas con quien diseñe el currículo (journeys/levels ya existentes en el laboratorio: 799 levels / 6 662 stages como referencia de granularidad).]**

---

## 5. Datos propuestos vs. datos reales

| Campo / endpoint | Estado | Para qué | Cómo obtener |
|---|---|---|---|
| `POST .../complete` | ✅ **Real** | Cierre de clase, XP, racha | Verificado T-PUB-02 |
| `POST /api/v1/lesson-sessions` | ✅ **Real** (v1.1) | Crea sesión; devuelve `exercises[]`, `expiresAt`, snapshot | Verificado contra repo 2026-08-05 |
| `GET /api/v1/me/path` | ✅ **Existe** — contenido **PENDIENTE #2** | Temario del sidebar, breadcrumb; incluye `guidePdfUrl` | Referenciado en T-UX-STREAK-01 §5 |
| `GET /api/v1/lessons/:id` | ⛔ **No existe** (v1.1) | — | Eliminado: la info vive entre `me/path` y la sesión |
| `tablatureUrl` / `durationSec` | ⛔ **No existen** (v1.1) | — | Eliminados del contrato |
| `lesson.type` → `StageType` | ✅ **Existe** (modelo real) | Renderizado condicional por tipo de etapa | Léxico unificado v1.1 |
| `prevLessonId` / `nextLessonId` | ❌ **Propuesto** | Zona D (navegación) | Alternativa: derivarlo de `me/path` |
| `practicedToday` | ❌ **Propuesto** (backend) | Banner de racha en sidebar | Ver T-UX-STREAK-01 §3.4 — no derivar en cliente |

---

## 6. Reglas de gobernanza aplicadas

| Regla | Cumplimiento |
|---|---|
| No inventar endpoints | ✅ Solo un real verificado (`complete`) + `me/path` existente; todo lo demás marcado PROPUESTO con PENDIENTE de verificación |
| No scoring en cliente | ✅ `accuracy` y umbral de aprobación los emite el backend; el frontend solo los muestra |
| No lógica de día en cliente | ✅ `practicedToday` heredado de T-UX-STREAK-01 como campo de backend |
| Idempotencia del complete | ✅ `alreadyProcessed: true` → navegar sin re-celebrar ni re-sumar |
| No pagos ni monetización | ✅ Ninguna clase se bloquea por pago en esta propuesta |
| No Next.js/SSR | ✅ Propuesta de diseño UI, agnóstica de framework |
| URLs públicas por D-GOV | ✅ No se propone URL pública nueva; assets (video/tablatura) van por CDN interno |
| Nombre del producto | ✅ Academia GMusic |

---

## 7. Decisiones pendientes (no se deciden en este doc)

| Decisión | Quién decide | Cuándo |
|---|---|---|
| ¿Sidebar visible por defecto en desktop o colapsado? | Diseño + Producto | Handoff del ticket |
| ¿Video con skip bloqueado los primeros 10 seg? | Producto + Pedagogía | Handoff del ticket |
| ¿`THEORY` usa el mismo `complete` o variante sin scoring? | Backend | Verificación §10.1 |
| ¿Navegación libre dentro del módulo o secuencial estricta (🔒)? | Producto + Pedagogía | Handoff del ticket |
| ¿El drawer mobile del sidebar es bottom-sheet o pantalla aparte? | Diseño | Handoff del ticket |
| ¿Umbral de `accuracy` para aprobar (valor exacto)? | Backend + Pedagogía | Definición de currículo |

**Recomendación del doc:** secuencial estricta dentro del módulo (🔒), navegación libre entre clases ya completadas. Es lo que sostiene el contrato visual del temario (§4.4 regla 4) y alimenta la racha sin fricción.

---

## 8. Riesgos identificados

| Riesgo | Mitigación |
|---|---|
| Endpoints de §2.2 no existen y el alcance crece | Verificación §10.1 antes de cualquier estimación; si `GET lesson` no existe, su creación es trabajo de backend separado |
| Alumno abandona a mitad de video y pierde la sesión | Sesión creada al entrar (no al completar); retomar = misma `sessionId` si no expiró — expiración la define backend |
| Doble click en "Completar" duplica celebración | `alreadyProcessed` + botón deshabilitado tras primer click |
| Tablatura JSON pesada frena la carga en mobile | Lazy-load del bloque B2/B3 (cargar solo al hacer scroll); video siempre primero |
| Sidebar distrae del ejercicio | Acento dorado solo en el ítem actual; banner de racha con opacidad baja (0.06) |
| Clases largas rompen la dinámica de racha diaria | Principio §4.1: 5–10 min por clase; si una clase crece, se parte en dos nodos del path |
| Alumno nuevo ve 🔒 en todo y se paraliza | El nodo actual siempre visible y con CTA; bloqueados en gris muy tenue, casi decorativos |

---

## 9. Inventario de pendientes

### 9.1 Hechos del repo (resolubles con Cursor/docs G1)

| # | Pendiente | Dónde verificar | Estado |
|---|---|---|---|
| 1 | ¿Existe `GET /api/v1/lessons/:id`? | Backend, rutas + schema | **Resuelto ⛔ (v1.1): no existe** — info entre `me/path` y sesión |
| 2 | ¿Qué contiene exactamente cada nodo de `GET /api/v1/me/path`? (¿estado locked/current/done?) | Backend, schema de respuesta | Abierto |
| 3 | ¿Qué endpoint crea la sesión que origina el `sessionId`? | Backend, rutas de lesson-sessions | **Resuelto ✅ (v1.1):** `POST /lesson-sessions`, real y certificado |
| 4 | ¿El `complete` devuelve `currentStreak` inmediatamente? | T-PUB-02 smoke test | **Resuelto ✅** (heredado) |
| 5 | ¿Expira una sesión? ¿Se puede retomar? | Backend, modelo LessonSession | **Resuelto ✅ (v1.1):** la sesión trae `expiresAt` y `contentSnapshot` |
| 6 | ¿Existe distinción video/práctica/teoría en el modelo? | Prisma schema | **Resuelto ✅ (v1.1):** es `StageType` en el modelo real |
| 7 | ¿`THEORY` puede usar el mismo `complete` sin scoring? | Backend + runner | Abierto — conecta con mínimo de ejercicios por slot (marco de clases) |

### 9.2 Decisiones (esperan aprobación de propuesta)

| # | Pendiente | Quién decide |
|---|---|---|
| 8 | Validar las 4 reglas pedagógicas de §4.4 contra el currículo real (journeys/levels) | Pedagogía + Producto |
| 9 | ¿Secuencial estricta o navegación libre dentro del módulo? | Producto + Pedagogía |
| 10 | ¿Sidebar desktop: visible o colapsado por defecto? | Diseño + Producto |
| 11 | ¿Skip de video bloqueado los primeros 10 seg? | Producto + Pedagogía |

### 9.3 Post-implementación

| # | Pendiente | Cuándo |
|---|---|---|
| 12 | Tasa de abandono por bloque (¿en qué bloque se van: video, tablatura, ejercicio?) | Con métricas reales, 30 días post-lanzamiento |
| 13 | ¿El temario lateral reduce la salida mid-módulo? | Con métricas reales, 30 días post-lanzamiento |
| 14 | ¿`PRACTICE_ONLY` de consolidación mejora el `accuracy` de la siguiente `VIDEO_PRACTICE`? | Con métricas reales, 60 días post-lanzamiento |

---

## 10. Dependencias con otros tickets

| Ticket | Relación | Nota |
|---|---|---|
| **T-PUB-02** | **Requerido** | Provee `complete`, `sessionId`, `xpEarned`, `accuracy`, `currentStreak`, `streakUpdated`. Ya certificado. |
| **T-UX-STREAK-01** | **Bidireccional** | Este ticket construye el sidebar que su Ubicación 4 necesita; su banner de racha entra en el slot reservado de §3.4. |
| **Currículo (journeys/levels)** | **Insumo** | Las 799 levels / 6 662 stages del laboratorio son la referencia de granularidad para §4.4. |

**Nota sobre MVP:** si la verificación §9.1 resulta negativa en los endpoints de lectura, el MVP mínimo de pantalla de lección es: **Zona B con contenido estático por lección + Zona D con solo "Completar lección"** (alimentado 100% por el `complete` real). Sidebar, temario y breadcrumb entran en cuanto `me/path` confirme su contenido. Esa es la jerarquía real del doc: un MVP con cero backend nuevo, y la experiencia completa detrás de una verificación de dos endpoints.

---

*Documento de propuesta-insumo. No contiene código de producción. Nombre del producto: Academia GMusic.*
