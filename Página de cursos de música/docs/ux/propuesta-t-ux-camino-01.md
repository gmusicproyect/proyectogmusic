# PROPUESTA — T-UX-CAMINO-01 · Pantalla Mi Camino (v1, ordenada desde mockup A)

**Fecha:** 2026-08-05 · **Estado:** propuesta-insumo — NO implementar sin «arrancar»
**Origen:** `propuesta-mockup-mi-camino-a.html` (mockup estático, sin JS) — queda como **referencia visual solamente**, mismo estatus que `Classroom.jsx`: no importar desde `src/`.
**Destino:** `docs/ux/` (pasada G1 de Cursor) junto al mockup.
**Rótulo:** «T-UX-CAMINO-01» sigue la convención de las propuestas hermanas; el ID definitivo se confirma cuando Juan arranque el ticket.

---

## 1 · Qué propone (en léxico del repo)

Una pantalla de **Mi Camino** en dos columnas: **sidebar** con la ruta completa (bloques con estados completado/activo/bloqueado, el activo desplegado en acordeón mostrando sus 5 etapas `StageType`) + **panel principal** con la etapa en curso en **3 zonas**: video de clase, práctica interactiva (tablatura + diapasón), y material PDF. Chip flotante de racha abajo a la derecha.

## 2 · Aciertos verificados contra el repo

1. **Tokens reales al 100% en la base:** `#080808`, `#111111`, `rgba(255,255,255,0.06)`, `#C9A84C`, `#F5F0E8`, `#8A8A8A` — el mockup consumió los contratos de `cb5c3e5` correctamente (no aparecen `#D4AF37` ni `#c4956a`).
2. **Vocabulario correcto:** Bloques y las 5 etapas con sus nombres reales de `StageType` (Fundamento uno, Fundamento dos, Técnica, Práctica, Tocar) — nada de mundos/lecciones del mockup Classroom.
3. **Estados alineados:** completado / activo / bloqueado en bloques y etapas coincide con el modelo de candados de `/me/path`.
4. **«Ejercicio 2 de 6»** coincide con el conteo real seed de B3 — aunque ver discrepancia §8.4-3 sobre a qué se ancla ese total.
5. **El diapasón interactivo** apunta exactamente en la dirección ya decidida (FretboardSVG parametrizado para CHORD_SHAPE, pieza estrella de la evaluación Classroom).
6. Responsive contemplado (sidebar colapsa a columna en <900px).

## 3 · Relación con lo existente — la decisión grande primero

Este mockup **fusiona en una sola pantalla** lo que hoy son dos superficies: Mi Camino (path + candados, hoy carrusel `PathCarouselCards`) y la experiencia de lección (hoy runner modal; mañana `propuesta-t-ux-lesson-01.md`, layout 3 zonas). Las 3 zonas del panel principal son, de hecho, **las mismas 3 zonas de LESSON-01**.

**→ Decisión de arquitectura UX (dueño: Juan, antes de cualquier ticket):**
- **Opción 1 pantalla:** camino persistente en sidebar + lección embebida (este mockup). Pro: contexto siempre visible, una sola navegación. Contra: reemplaza el layout actual de Mi Camino y absorbe T-UX-LESSON-01 (los dos tickets se vuelven uno).
- **Opción 2 pantallas:** Mi Camino como está (carrusel) → click en etapa → pantalla de lección (LESSON-01). Pro: incremental, cada ticket independiente. Contra: el alumno pierde el mapa al entrar a la lección.

Esta propuesta **no decide**; ordena. Si se elige 1 pantalla, LESSON-01 y CAMINO-01 se fusionan en un solo ticket con este mockup como layout de referencia.

## 4 · Mapa elemento ↔ contrato real

| Elemento del mockup | Fuente real | Estado |
|---|---|---|
| Lista de bloques con estados | `GET /me/path` → modules + nodes + status | ✅ Existe |
| Acordeón: bloque activo → 5 etapas | modules[].nodes[] (una etapa = un PathNode) | ✅ Existe (ver §8.4-1 terminología) |
| Barra de progreso «3 de N bloques» | derivable de `nodesCompleted/nodesTotal` por módulo | ✅ Derivable |
| «Completado el 28 jul» por bloque | fecha de completado por nodo/módulo en `/me/path` | ❓ Verificar contrato (§8.1) |
| Video firmado por etapa | `videoUrl` + `POST /me/media/signed-url` (TTL 3600) | ✅ Existe |
| Duración «8:24» del video | metadato de duración | ❌ No existe en contrato |
| «📺 1080p» selector de calidad | pipeline de transcoding | ❌ No existe |
| «⬇ Descargar video» | — | ⚠️ Conflicto de gobernanza (§5-1) |
| «🔖 Guardar para después» | — | ❌ Feature nueva sin backend |
| Tablatura + diapasón CHORD_SHAPE | exercises[] de `POST /lesson-sessions` | ✅ Existe (runner) |
| «Verificar acorde» por ejercicio | — | ⚠️ Conflicto: el runner registra attempts; **la calificación es solo del servidor en el complete** (§5-2) |
| «🎯 Precisión: —» en vivo | accuracy llega SOLO en la respuesta del complete | ⚠️ Mismo conflicto |
| «⚡ Tiempo» | `responseTimeMs` por attempt | ✅ Existe (se registra; mostrarlo es decisión) |
| «🏆 XP» | `xpEarned` en el complete | ✅ Existe (post-complete, no en vivo) |
| Lista de PDFs con «4 páginas» | `guidePdfUrl` (uno por nodo) | ⚠️ Parcial: existe UN pdf por etapa; conteo de páginas y multi-PDF no existen |
| Chip de racha «🔥 5 días» | `GET /me/dashboard` → streak.currentDays | ✅ Existe — pero ver §5-4 (fuente canónica pendiente + solape con T-UX-STREAK-01) |

## 5 · Elementos a retirar o convertir en decisión explícita

1. **«Descargar video»** — choca con la regla «URLs públicas para contenido pago: prohibido» y con el diseño de URLs firmadas TTL 1 h. Recomendación: **retirar**. Si Juan quiere descarga offline algún día, es decisión D-GOV aparte, no un botón de mockup.
2. **Verificación por ejercicio en cliente** («Verificar acorde», precisión en vivo) — el contrato real registra `attempts` y califica todo en el complete (`accuracy`, `nodeCompleted ≥ 0.7`). La UI puede confirmar **selección** («respuesta registrada, siguiente»), nunca **corrección**. Guard de gobernanza existente lo impide léxicamente en el escopo del runner — cualquier implementación debe diseñarse con eso, no contra eso.
3. **«Ejercicio 2 de 6»** — anclar el contador a `exercises[]` de la **sesión del nodo**, no al total del bloque (§8.4-3).
4. **Chip de racha** — la racha existe (`/me/dashboard`, Mi Estudio ya la consume), pero (a) la **fuente canónica** dashboard-vs-progress sigue siendo decisión pendiente, y (b) un chip flotante en Mi Camino es una **ubicación nueva** respecto de las 4 mapeadas en `propuesta-t-ux-streak-01.md` — debe entrar a ese documento como ubicación candidata, no colarse por aquí.
5. **Hex nuevos** — `--success #4CAF50`, `--danger #E74C3C`, hover `#d4b55a`, `--panel #0d0d0c` y los derivados dorados (`gold-soft/line/glow`) **no están en el set verificado** de `cb5c3e5`. Los derivados con alpha del dorado real son extensión razonable; success/danger/hover/panel son **decisión de paleta** (§8.2).
6. **Breadcrumb «Módulo 1 › Bloque 3»** — en el modelo real Módulo **es** el Bloque; dos niveles con números distintos confunden. Unificar léxico: Bloque N › Etapa M.
7. **Digitación del ejemplo Am** — la tablatura del mockup (0-1-2-2-0-0) y el root marcado en La-traste-1 **no son La menor** (Am real: x-0-2-2-1-0, root La al aire). Error de contenido, no de código — corregir en cualquier derivado visual.
8. **Fechas «Completado el 28 jul»** — solo si el contrato las trae (§8.1); si no, es campo a decidir, no a inventar.

## 6 · Decisiones abiertas (numeradas, dueño Juan / D-GOV)

1. **Arquitectura UX:** 1 pantalla (camino+lección fusionados) vs 2 pantallas (§3). Condiciona el destino de T-UX-LESSON-01.
2. Paleta extendida: ¿se adoptan success/danger/hover/panel? ¿Cuáles hex?
3. Ubicación del chip de racha en Mi Camino → se resuelve en T-UX-STREAK-01 (junto con la fuente canónica, ya pendiente allí).
4. Mostrar `responseTimeMs` al alumno: ¿sí/no?
5. Duración del video en la UI: ¿se agrega metadato al modelo (migración) o se omite?
6. Path de URL si la lección gana pantalla propia → D-GOV (precedente D-GOV-19).

## 7 · Qué puede resolver Cursor hoy (docs-only, G1) vs qué espera ticket

**Hoy (G1):** archivar este doc + el mockup en `docs/ux/`; verificar §8.1 contra el repo y completarlo con valores reales; registrar la ubicación nueva del chip en `propuesta-t-ux-streak-01.md`.
**Espera ticket:** todo componente, estilo o cambio de layout. Cero código hasta «arrancar».

## 8 · Inventario

### 8.1 Hechos del repo (Cursor verifica y completa en la pasada G1)
- ¿`/me/path` expone fecha de completado por nodo o módulo? (campo exacto o «no existe»)
- Shape exacto de modules[] usado por `PathCarouselCards` (para saber si el acordeón sidebar es re-render del mismo viewmodel)
- ¿Existe metadato de duración de video en algún contrato? (esperado: no)
- Confirmar que `exercises[]` de la sesión es el único conteo válido por etapa

### 8.2 Decisiones (no tocar sin Juan)
- Las 6 del §6.

### 8.3 Post-implementación (cuando el ticket exista)
- Contraste AA de los tags sobre `--gold-soft`; foco visible en acordeón; comportamiento móvil del sidebar (¿colapsable o ruta arriba?); estados vacíos/error del panel principal (patrón casa ya existente en Mi Camino).

### 8.4 Discrepancias registradas (mockup vs realidad)
1. En el mockup «nodo del camino» = Bloque; en la API el **PathNode es la etapa**. El acordeón es mapeable, pero el léxico del código deberá respetar la API.
2. «Descargar video» contradice el diseño de contenido protegido (URLs firmadas TTL 1 h).
3. «Ejercicio 2 de 6» cuenta el bloque; el contrato cuenta por sesión de nodo.
4. Precisión/verificación en vivo no existen: calificación solo-servidor en el complete.
5. `success/danger/hover/panel` no pertenecen al set de tokens verificado.
6. La digitación mostrada de Am es incorrecta (contenido).
7. «13 bloques» del subtítulo: verificar contra `mapa-bloques-nivel-1.md` (D-GOV-04) antes de fijar el número en UI.

---

*v1 ordenada por Fable desde el mockup A · sin credenciales · si algo de aquí contradice el repo, manda el repo y la discrepancia se registra.*
