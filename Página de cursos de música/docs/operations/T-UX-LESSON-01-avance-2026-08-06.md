# T-UX-LESSON-01 — Avance producto real `/mi-camino`

**Fecha:** 6 Ago 2026  
**Contexto Juan:** *«Lo que tenemos aquí está muy sólido, está muy bien — déjalo registrado. Esto no es un demo; ya estamos trabajando en nuestra página para terminarla.»*  
**Alcance:** Zona suscriptor **`/mi-camino`** — producto en construcción, no funnel demo.

---

## Veredicto de sesión

| Aspecto | Estado |
|---------|--------|
| **Naturaleza del trabajo** | **Producto real** (Mi Camino suscriptor), no prototipo Kimi ni `/clase-gratuita` |
| **Calidad percibida** | **Sólida** — aprobación explícita Juan 6 Ago 2026 |
| **Tests app** | **652/652 PASS** (`npm run app:typecheck` OK) |
| **Commit / push** | **Pendiente OK Juan** — cambios locales en working tree |

---

## Entregado en código (checkpoint 6 Ago 2026)

### 1. Shell 3 pestañas (D-UX-LAYOUT-01)

- **Tarjetas (Mi Camino)** · **Práctica** · **Resumen PDF**
- Montado en `GmusicPath.tsx` vía `PathLessonTabsShell`
- Tablist accesible (`role="tablist"` / `tab` / `tabpanel`)
- Guards: `path-lesson-tabs.test.ts`

### 2. Tarjetas — video **dentro de cada tarjeta**

- ❌ Eliminado bloque global «Video de la etapa» debajo del carrusel
- ✅ Video embebido en hero de tarjeta enfocada (`PathCarouselCardHero`)
- URLs Supabase firmadas vía `use-path-node-video-sources.ts` + `useSignedMaterialUrl`
- Tarjetas laterales: foto preview (no cargan video hasta focus)
- Sin video publicado: «Video próximamente» compacto en hero

**Archivos clave:** `PathCarouselCardHero.tsx`, `PathCarouselCards.tsx`, `path-carousel-stage.css`

### 3. Práctica — diapasón Paquete A Kimi v2

- Diapasón oscuro Simply Guitar: madera, cejuela dorada, grosor real por cuerda
- Modo **inline** (tarjeta): cuadro compacto ~228–256px, ejercicio dentro del marco
- Modo **pantalla completa** (opcional): banda horizontal borde a borde, estilo referencia Yousician/Simply Guitar
  - HUD flotante: salir + barra progreso `X/Y`
  - Cuerdas escalan en altura; fondo continuo, no tarjeta flotante sobre negro
- Contador **«X de 5»** en toolbar inline; en fullscreen píldora `X/Y`
- Gate Yousician honesto (sin micrófono)
- Runner embebido en pestaña Práctica (`PathLessonRunner` variant `embedded`)

**Archivos clave:** `PathPracticaTab.tsx`, `PathPracticaShell.tsx`, `PathPracticaReposo.tsx`, `LessonFretboard.tsx`, `lesson-fretboard.css`, `path-practica-layout.tsx`

### 4. Resumen PDF

- Firma guías privadas al expandir (`PathResumenPdfTab`)
- Mapping etapas vía `flattenPathNodesWithStep`

### 5. APIs — sin cambios backend

- Solo frontend sobre contratos existentes (T-PUB-02, T1 Storage)
- `POST /lesson-sessions` · `POST .../complete` · `POST /me/media/signed-url`

---

## Criterios binarios spec — estado estimado

| # | Criterio | Estado | Nota |
|---|----------|--------|------|
| 1 | 3 pestañas exactas | ✅ | Implementado + tests |
| 2 | Video firmado, nunca URL directa bucket | ✅ infra / ☐ evidencia Juan | **Opción A (2026-08-07):** stub + signed-url + vacío digno; YouTube real = pendiente de contenido |
| 3 | Práctica sesión → complete | ✅ | Flujo T-PUB-02 integrado en tab |
| 4 | Diapasón + `answerInput` fretboard | ✅ | Parser + interacción cuerdas |
| 5 | Gate Yousician sin micrófono | ✅ | Copy honesto |
| 6 | Suite verde + smokes (stub OK) | ☐ | app:test verde · smoke humano con video stub + 5 PDFs F1 pendiente Juan |

**Cierre formal:** pendiente frase Juan `OK T-UX-LESSON-01 — cierre con evidencia 6/6 infra (stubs OK) y smoke PASS.`  
Ver: `docs/operations/RESPUESTA-FABLE-OPCION-A-H1-2026-08-07.md`

---

## Pendiente para terminar la página (no bloquea checkpoint)

1. Smoke humano Juan en local/Render (F1 PDF, F2 gate, diapasón, contador, fullscreen, video en tarjeta)
2. Material real Fundamento 1 — video «Tu guitarra y postura» vía `/admin`
3. Commit + push cuando Juan diga OK
4. Doc G1 cierre 6/6 con capturas tras smoke PASS

---

## Separación demo vs producto (recordatorio)

| Superficie | Ruta | Estado |
|------------|------|--------|
| **Funnel demo** | `/clase-gratuita`, `/clase-gratuita/1…5` | Intacto — no confundir con este trabajo |
| **Producto suscriptor** | `/mi-camino` | **Aquí vive T-UX-LESSON-01** — en terminación |

---

*Registro operativo · Juan 6 Ago 2026 · checkpoint local sin commit automático.*
