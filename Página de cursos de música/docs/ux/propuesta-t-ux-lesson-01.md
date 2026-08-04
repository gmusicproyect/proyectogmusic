# Propuesta — Pantalla de Lección (T-UX-LESSON-01)

**Producto:** Academia GMusic  
**Fecha:** agosto 2026  
**Estado:** Propuesta-insumo (NO entrega refactorizada)  
**Arquitectura destino:** Vite SPA React  
**Paleta:** [PENDIENTE: leer tokens del stylesheet desplegado, commit cb5c3e5]

---

## 1. Resumen Ejecutivo

Este documento es una **propuesta de diseño**, no código de producción. Extrae cuatro ideas de UX del mockup `Classroom.jsx` y las mapea a la arquitectura real de la Academia GMusic. Las piezas de código asociadas (`Fretboard.jsx`, `LessonView.jsx`, `lesson-view.css`) **aún no existen**; se revisarán contra el repo real el día que se implementen. Hasta entonces, este doc sirve como insumo de dirección para el ticket T-UX-LESSON-01.

---

## 2. Los cinco conflictos identificados (y su estado)

| # | Conflicto | Estado en esta propuesta |
|---|---|---|
| **1** | Next.js vs SPA Vite | Resuelto: se eliminó `styled-jsx` y dependencias de Next. Se propone CSS importado estándar + React puro. |
| **2** | Modelo de datos inventado | Resuelto: se eliminó `WORLDS` estático. Se propone consumo de `GET /api/v1/me/path`. |
| **3** | Video por canal equivocado | Resuelto: se eliminó Vimeo/YouTube. Se propone `<video>` nativo + endpoint firmado real. |
| **4** | Ficciones sin backend | Resuelto: se eliminaron EN VIVO, timer, racha, Grabar, Metrónomo, Loop, Tempo, Comunidad. |
| **5** | Paleta desalineada | **Parcialmente resuelto:** se identificó que el mockup usaba ámbar `#c4956a` y verde/naranja sin verificar. El dorado real debe leerse del stylesheet de producción (commit cb5c3e5). Los colores de estado y tipo deben ser distintos para evitar colisión semántica. |

---

## 3. Correcciones aplicadas al documento anterior

### 3.1 Paleta: de afirmaciones a pendientes

**Problema:** El documento anterior afirmaba "dorado `#D4AF37` alineado a producción" sin verificar el stylesheet real. Lo mismo con verde `#6ecf8a` y naranja `#e8a84c` heredados del mockup.

**Corrección:**
- El dorado real de la vista demo rediseñada vive en el CSS de producción (commit cb5c3e5). **Debe leerse de allí.**
- El verde y naranja del mockup original se descartan como no verificados.
- **Colisión semántica identificada:** usar el mismo verde para "completado" (estado) y "técnica" (tipo) es ambiguo. Se propone separar:
  - **Estado:** completado (check) vs. bloqueado vs. actual — sistema visual propio.
  - **Tipo:** Fundamento / Técnica / Práctica / Canción — color distinto por categoría.

**Tokens propuestos (sujetos a verificación):**

| Token | Valor propuesto | Uso | Estado |
|---|---|---|---|
| `--gmc-bg-primary` | `[PENDIENTE]` | Fondo general | **Leer de cb5c3e5** |
| `--gmc-bg-sidebar` | `[PENDIENTE]` | Sidebar | **Leer de cb5c3e5** |
| `--gmc-border` | `[PENDIENTE]` | Bordes sutiles | **Leer de cb5c3e5** |
| `--gmc-gold` | `[PENDIENTE]` | Acentos, progreso | **Leer de cb5c3e5** |
| `--gmc-type-fundamento` | `[PENDIENTE]` | Nodos de teoría | **Definir** |
| `--gmc-type-tecnica` | `[PENDIENTE]` | Nodos de técnica | **Definir (distinto al estado completado)** |
| `--gmc-type-practica` | `[PENDIENTE]` | Nodos de práctica | **Definir** |
| `--gmc-type-tocar` | `[PENDIENTE]` | Nodos de canción | **Definir** |
| `--gmc-state-completed` | `[PENDIENTE]` | Check de nodo terminado | **Definir (distinto a tipo técnica)** |
| `--gmc-text-primary` | `[PENDIENTE]` | Texto principal | **Leer de cb5c3e5** |
| `--gmc-text-secondary` | `[PENDIENTE]` | Texto secundario | **Leer de cb5c3e5** |

---

### 3.2 Contrato de video: de suposición a real

**Problema:** El documento anterior inventó `{ key: "videos/...", ttl: 3600 }` como payload del endpoint firmado.

**Corrección:**
- El modelo real guarda `videoUrl` y `guidePdfUrl` en el `PathNode`.
- Las rutas reales siguen el patrón `admin/b{n}/slot-{n}/...`.
- El TTL lo decide el servidor; un endpoint que acepte TTL del cliente sería un smell de seguridad.
- **Quien implemente LessonView debe consumir el contrato real del endpoint tal como quedó en T1 (commit 99e74d4).**

**Flujo corregido (sujeto a verificación del contrato real):**

```
1. Alumno abre lección → LessonView lee node.videoUrl del path
2. Si la URL es pública (demo gratuito): usar directo
3. Si la URL es de Storage privado: POST /api/v1/me/media/signed-url
   [PENDIENTE: verificar payload exacto en commit 99e74d4]
4. <video src={url} controls /> reproduce
5. URL expira según lo que defina el servidor
```

---

### 3.3 Routing y estructura de archivos: de react-router al sistema real

**Problema:** El documento anterior usó sintaxis de react-router (`{ path: "/leccion/:nodeId?" }`) y rutas tipo `src/components/lesson/`.

**Corrección:**
- La SPA usa un mapa `currentPage ↔ pathname` propio definido en `student-zone-routing.ts` (tocado en T-URL-FUNNEL-01).
- Los componentes viven bajo `src/app/components/...` (no `src/components/...`).
- **El nombre de una URL pública nueva no se decide en este doc.** Pasa por D-GOV, como pasó `/clase-gratuita`.

**Registro propuesto (sujeto a aprobación de D-GOV):**

```typescript
// student-zone-routing.ts
// [PENDIENTE: aprobar path con D-GOV antes de implementar]
const ROUTES = {
  // ... rutas existentes ...
  LESSON: { page: "lesson", pathname: "/leccion" }, // o el path que apruebe D-GOV
};
```

---

### 3.4 Runner de práctica: de futuro a presente

**Problema:** La sección 11 del documento anterior trató como futuro lo que ya existe: "Runner de práctica — conectar POST /lesson-sessions — T-RUNNER-PRACTICE".

**Corrección:**
- El runner **ya está certificado en producción** desde T-PUB-02.
- Tiene sesiones, `complete` idempotente y XP.
- LessonView debe **integrarse con el runner existente**, no agendarlo.
- Los tickets `T-RUNNER-PRACTICE`, `T-CONTENT-BLOCKS` y `T-AUDIO-ENGINE` **no existen** en la cola. Se eliminan del documento.

**Integración real propuesta:**

| Cuándo | Qué llamar | Endpoint |
|---|---|---|
| Alumno inicia práctica | Crear sesión | `POST /lesson-sessions` |
| Alumno completa ejercicio | Finalizar + XP | `POST /lesson-sessions/:id/complete` |
| Alumno abandona | [PENDIENTE: verificar comportamiento] | — |

---

### 3.5 Estado del documento: de "entrega" a "propuesta"

**Problema:** El documento anterior se presentó como "refactorizado" con piezas "entregadas", pero solo existía el `.md`.

**Corrección:**
- Este documento es una **propuesta de dirección**, no una entrega de código.
- Las afirmaciones de accesibilidad ("contraste > 4.5:1") y estructura ("roles ARIA") se verificarán cuando existan las piezas de código, contra el repo real.
- El título cambia de "Integración" a "Propuesta".

---

### 3.6 Nomenclatura: de "GMusic Estudio" a "Academia GMusic"

**Problema:** "GMusic Estudio" era el nombre inventado del mockup.

**Corrección:** Todo el documento usa **Academia GMusic**, el nombre real del producto.

---

## 4. Piezas propuestas (aún no implementadas)

### 4.1 `Fretboard.jsx` — Diapasón SVG parametrizado

**Idea:** Componente que reciba props y dibuje cualquier acorde sin dependencias.

**Props propuestos:**

```jsx
<Fretboard
  capo={2}
  fingers={[{ string: 5, fret: 2, label: "2" }, { string: 4, fret: 2, label: "3" }]}
  open={[1, 2, 3]}
  muted={[6]}
  caption="Forma de Em + cejillo 2 = F#m"
/>
```

**Estado:** No implementado. Se revisará contra el repo real cuando exista.

---

### 4.2 `LessonView.jsx` — Layout de tres zonas

**Idea:** Sidebar (path real) + Content (video firmado, theory box, tabs) + barra de controles.

**Endpoints a consumir:**
- `GET /api/v1/me/path`
- `POST /api/v1/me/media/signed-url` [PENDIENTE: verificar contrato en 99e74d4]
- `POST /lesson-sessions` (runner existente)
- `POST /lesson-sessions/:id/complete` (runner existente)

**Estado:** No implementado. Se revisará contra el repo real cuando exista.

---

### 4.3 `lesson-view.css` — Tokens de estilo

**Idea:** Variables CSS con la paleta real de producción.

**Estado:** No implementado. Los valores de color deben leerse del stylesheet desplegado (commit cb5c3e5) y definirse sin colisión semántica.

---

### 4.4 Mapeo de datos propuesto

| Concepto mockup | Concepto real | Campo en API |
|---|---|---|
| `world` | `Module` (bloque B1…Bn) | `modules[].title` |
| `lesson` | `PathNode` (5 etapas) | `modules[].nodes[]` |
| `lesson.type` | `StageType` | `nodes[].stageType` |
| `done / locked` | Estado del nodo | `nodes[].completed`, `nodes[].locked` |
| `video` | Video de la lección | `nodes[].videoUrl` |
| `resources` | Guías descargables | `nodes[].guidePdfUrl` |
| `fretboard` | Diagrama de acorde | `nodes[].fretboard` (campo propuesto) |

---

## 5. Tokens visuales por StageType (propuesta)

| StageType | Tag visual | Theory Box | Color de tipo (propuesto) |
|---|---|---|---|
| `FUNDAMENTO_UNO` | **T** | ✅ Sí | [PENDIENTE: definir] |
| `FUNDAMENTO_DOS` | **T** | ✅ Sí | [PENDIENTE: definir] |
| `TECNICA` | **X** | ❌ No | [PENDIENTE: definir — distinto a estado completado] |
| `PRACTICA` | **♫** | ❌ No | [PENDIENTE: definir] |
| `TOCAR` | **★** | ❌ No | [PENDIENTE: definir] |

**Estado visual del nodo (independiente del tipo):**

| Estado | Indicador |
|---|---|
| Completado | Check verificado |
| Actual (seleccionado) | Borde dorado |
| Bloqueado | Opacidad reducida + candado |
| Disponible | Normal |

---

## 6. Accesibilidad (propuesta, no verificada)

- Sidebar: botones con `aria-current`, `aria-disabled`, soporte de teclado.
- Tabs: roles `tablist`, `tab`, `tabpanel`.
- Video: elemento `<video>` nativo con controles del navegador.
- SVG: `role="img"` + `aria-label` descriptivo.
- **Contraste:** se verificará con herramienta cuando exista el CSS real.

---

## 7. Ruta de adopción propuesta

1. **Archivar** este documento como `docs/ux/propuesta-t-ux-lesson-01.md` junto a la evaluación anterior.
2. **No implementar** hasta que:
   - Se lean los tokens de color del stylesheet real (cb5c3e5).
   - Se verifique el contrato del endpoint firmado (99e74d4).
   - Se apruebe el path de URL con D-GOV.
3. Cuando arranque T-UX-LESSON-01, este doc es punto de partida, no especificación final.

---

## 8. Inventario de pendientes

### 8.1 Hechos del repo (resolubles hoy en pasada de Cursor/docs-only G1)

| # | Pendiente | Dónde verificar | Quién |
|---|---|---|---|
| 1 | **Tokens reales (commit cb5c3e5):** fuente `src/app/components/marketing/tokens.ts` + estilos inline de `DemoLessonPage.tsx`. `--gmc-bg-primary`: `#080808` · `--gmc-bg-sidebar` / superficie: `#111111` (`BG_SURFACE`; la demo no tiene sidebar; paneles usan `#0A0A0A`) · `--gmc-border`: `rgba(255,255,255,0.06)` (`BORDER`; bordes de tarjeta en demo: `rgba(255,255,255,0.08)`) · `--gmc-gold`: `#C9A84C` (`GOLD`) · `--gmc-text-primary`: `#F5F0E8` (`WHITE_WARM`) · `--gmc-text-secondary`: `#8A8A8A` (`TEXT_SEC`) | Commit cb5c3e5 — stylesheet desplegado | Cursor / G1 ✓ |
| 3 | **Contrato `POST /api/v1/me/media/signed-url` (T1, 99e74d4):** auth por cookie de sesión alumno. Request: `{ "materialUrl": "<https URL de objeto en bucket privado Supabase>" }` — el cliente **no** envía TTL. Response 200: `{ "signedUrl": "<https...>", "expiresIn": 3600 }`. TTL fijado en servidor (`createSignedStorageUrl`, default 3600 s). Errores: 401 sin sesión · 400 `INVALID_STORAGE_URL` · 403 `SUBSCRIPTION_REQUIRED` · 503 `STORAGE_NOT_CONFIGURED`. | Commit 99e74d4 — backend T1 | Cursor / G1 ✓ |
| 4 | **Payload runner (T-PUB-02):** `POST /api/v1/lesson-sessions` — body mínimo `{ "nodeId": "<UUID>" }` (+ campos H1 opcionales: `monthIndex`, `profileId`, `tarjetaId`, `unidadId`, `slot`, `clientRequestId`, `eventId`, `retry`). Response 201/200: `{ sessionId, nodeId, status: "STARTED", startedAt, expiresAt, exercises[] }`. `POST /api/v1/lesson-sessions/:id/complete` — body `{ attempts: [{ microExerciseId, selectedAnswer, responseTimeMs }] }`. Response 200: `{ sessionId, status: "COMPLETED", alreadyProcessed, accuracy, xpEarned, streakUpdated, currentStreak, nodeCompleted, completedAt, attemptsSummary? }`. Idempotencia: reenvío devuelve `alreadyProcessed: true` y omite `attemptsSummary`. `nodeCompleted` true si accuracy ≥ 0.7; XP = `round(accuracy * 100)`. | Runner certificado en T-PUB-02 | Cursor / G1 ✓ |
| 6 | **Carpetas reales:** componentes de lección/runner ya viven en `src/app/components/gmusic/lesson/` (p. ej. `LessonRunnerShell.tsx`, `LessonMaterialTabs.tsx`, `useLessonRunner.ts`) e integración path en `src/app/components/gmusic/path/` (`PathLessonRunner.tsx`, `PathShell.tsx`). Piezas nuevas propuestas (`Fretboard`, `LessonView`, CSS) irían bajo `src/app/components/gmusic/lesson/` — no `src/components/...`. | `src/app/components/...` en repo | Cursor / G1 ✓ |

### 8.2 Decisiones (esperan al handoff de T-UX-LESSON-01)

| # | Pendiente | Quién decide | Cuándo |
|---|---|---|---|
| 2 | Colores por tipo (Fundamento, Técnica, Práctica, Tocar) — distintos al estado completado | Diseño + Producto | Handoff T-UX-LESSON-01 |
| 5 | Path de URL público aprobado | D-GOV | Antes de implementar |

### 8.3 Verificaciones post-implementación

| # | Pendiente | Cuándo |
|---|---|---|
| 7 | Contraste de colores > 4.5:1 con herramienta | Cuando exista CSS real |
| 8 | Schema `fretboard` en PathNode — cambio de schema vía migración Prisma | Cuando se apruebe el campo |
| 9 | Comportamiento cuando el alumno abandona la sesión de práctica | Cuando se integre con runner |

### 8.4 Registro de discrepancias (repo vs propuesta)

| # | Discrepancia |
|---|---|
| 1 | Dorado real `#C9A84C` (tokens cb5c3e5) — no `#D4AF37` (afirmación descartada en §3). |
| 2 | cb5c3e5 no define sidebar; `#111111` (`BG_SURFACE`) es el token de superficie más cercano. |
| 3 | Rutas completas llevan prefijo `/api/v1/` (§3.4 usa `/lesson-sessions` sin prefijo). |
| 4 | `signed-url` pide `materialUrl` (URL https completa), no `{ key, ttl }` del borrador anterior. |
| 5 | El backend de rachas **SÍ existe** — la respuesta de `POST /lesson-sessions/:id/complete` incluye `streakUpdated` y `currentStreak`. Mostrar o no la racha en la pantalla de lección pasa de «ficción eliminada» a **decisión de producto** para el handoff T-UX-LESSON-01. |

---

*Documento de propuesta. No contiene código de producción. Las piezas de código asociadas se revisarán contra el repo real cuando existan. Nombre del producto: Academia GMusic.*
