# Evaluación y propuesta de mejora — `Classroom.jsx` (GMusic Estudio)

**Fecha:** agosto 2026 · **Insumo evaluado:** `Classroom.jsx` (1.100+ líneas, Next.js/styled-jsx) + su README

---

## Veredicto ejecutivo

Es un mockup de alta fidelidad con buenas ideas de UX — y una receta de instalación equivocada para este proyecto. Seguir su README al pie de la letra (`npx create-next-app gmusic-studio`) crearía una **segunda aplicación** paralela a la academia real que ya corre en producción, con otro framework, otro modelo de datos, otro manejo de video y otra paleta. La mejora propuesta no es instalarlo: es **desarmarlo** — extraer cuatro piezas concretas, mapear sus datos al modelo real y descartar la utilería que no tiene backend. Así el componente deja de ser un riesgo de fork y se convierte en el mejor insumo de diseño que tiene hoy el ticket T-UX-LESSON-01.

## Lo que el componente hace bien

El layout de tres zonas (sidebar de progresión 260 px, área de contenido, barra de controles inferior) es exactamente la anatomía de una pantalla de lección tipo Simple Guitar, que es la ambición declarada del producto. El sistema de tipos de lección con etiqueta visual — T teoría, X técnica, ♫ canción, ★ desafío final — comunica progresión de un vistazo y coincide en espíritu con la estructura real de 5 etapas por bloque. El `FretboardSVG` es la joya: un diapasón con cejillo, dedos numerados, cuerdas al aire y cuerdas muteadas, sin dependencias externas. La "theory box" tiene un patrón pedagógico sólido (problema → solución → porqué → aplicación) y el texto de ejemplo sobre el cejillo está genuinamente bien escrito — reutilizable como contenido cuando el currículo llegue a ese tema. Y todo el componente usa iconos SVG inline, cero librerías.

## Los cinco conflictos con la arquitectura real

**1 — Next.js contra una SPA.** El componente declara `"use client"`, Next.js 14 y styled-jsx. La academia real es una SPA React/Vite desplegada en Vercel con routing propio (`student-zone-routing.ts`, `App.tsx`) y rewrites SPA en `vercel.json`; Next/SSR está fuera de la gobernanza vigente. Crear el proyecto `gmusic-studio` del README sería bifurcar el producto en dos apps con doble mantenimiento.

**2 — Un modelo de datos inventado.** El array estático `WORLDS` (mundos → lecciones con `type`, `isBoss`, `locked`) y el `fetch("/api/course/guitar-fundamentals")` sugerido no corresponden a nada que exista. El modelo real es `Course → Module` (los bloques B1…Bn) `→ PathNode` (5 etapas por bloque, cada una con `StageType`, título y criterio de completado), servido por `GET /api/v1/me/path`, con sesiones de práctica en `POST /lesson-sessions` y `/complete` (XP, idempotencia). La sección "Mapeo de datos" de abajo resuelve esta traducción.

**3 — Video por el canal equivocado.** El README recomienda "reemplaza por un reproductor de Vimeo/YouTube". Eso contradice la arquitectura certificada: las clases pagas se sirven desde Supabase Storage privado con **URL firmada** (`POST /api/v1/me/media/signed-url`, TTL 1 h); YouTube existe únicamente en el demo gratuito. Adoptar YouTube para clases pagas sería una regresión de seguridad directa sobre lo que costó cerrar T1.

**4 — Duplica o finge sistemas ya construidos.** El progreso "35 %" está hardcodeado (el real se deriva del path), el timer `00:18:42` y la racha "🔥 12 días" son decorado sin backend, el badge "EN VIVO" promete una feature que no existe, y los botones Grabar, Metrónomo, Loop y Tempo no tienen lógica detrás. La navegación ofrece "Clases en vivo" y "Comunidad" — y la comunidad está deliberadamente al final del orden de construcción. Un alumno real frente a esta pantalla tocaría botones muertos.

**5 — Estilos y marca desalineados.** ~600 líneas de CSS en styled-jsx (acoplado a Next; en Vite exige plugin) y una paleta ámbar-madera (`#c4956a`) que se parece pero no es la identidad ya desplegada en producción (negro + dorado de la vista demo rediseñada). Introducirla tal cual fragmentaría la marca en dos tonos de dorado.

Además, accesibilidad: las filas del sidebar son `div` clickeables sin rol ni soporte de teclado, y varios textos `#666` sobre `#0a0a0a` quedan por debajo de un contraste cómodo.

## Mapeo de datos: del mockup al modelo real

| En el mockup | En la academia real | Nota |
|---|---|---|
| `world` | `Module` (bloque B1…Bn) | título/subtítulo del módulo |
| `world.completed` / `current` | derivado del estado de sus nodos en el path | no se almacena aparte |
| `lesson` | `PathNode` (5 por bloque) | |
| `lesson.type` `theory / tech / song` | `StageType`: Fundamento uno y dos → T · Técnica → X · Práctica y Tocar → ♫ (★ en Tocar como cierre) | el sistema visual T/X/♫ se conserva |
| `done / locked / current` | estado del nodo en `GET /api/v1/me/path` | ya existe, con candados reales |
| barra "35 %" | nodos `completed` / total del bloque | calculado, nunca hardcodeado |
| video del player | `videoUrl` del nodo → `POST /api/v1/me/media/signed-url` | reproductor nativo `<video>`, URL expira en 1 h |
| tab Recursos | `guidePdfUrl` del nodo, también firmado | los tamaños/nombres ficticios se eliminan |
| botón Reproducir / práctica | runner real: `POST /lesson-sessions` → ejercicio → `/complete` (XP) | certificado en producción |
| racha, timer, EN VIVO | — | fuera hasta que exista backend |

## Las cuatro piezas a extraer (la mejora concreta)

### 1. `FretboardSVG` parametrizado — valor inmediato

Hoy el diapasón tiene un solo acorde cableado (forma de Em con cejillo en 2). La mejora: convertir posiciones en props y coordenadas en cálculo, para que un mismo componente dibuje cualquier digitación.

```jsx
<Fretboard
  capo={2}
  fingers={[{ string: 5, fret: 2, label: "2" }, { string: 4, fret: 2, label: "3" }]}
  open={[1, 2, 3]}
  muted={[6]}
  caption="Forma de Em + cejillo 2 = F#m"
/>
```

Convención: `string` 1 = mi agudo … 6 = mi grave; el componente traduce cuerda/traste a las mismas coordenadas `cx/cy` del SVG actual (trastes cada 55 px, cuerdas cada 14 px). Dónde rinde desde ya: los ejercicios **CHORD_SHAPE** del runner — el ejercicio real de Am en producción usa la digitación X-0-2-2-1-0, y este componente la dibuja — y las guías de los slots de Técnica. Es la única pieza que podría adelantarse como mini-ticket propio si así se decide; la cola no se reordena sola.

### 2. El layout de tres zonas, como referencia de diseño de T-UX-LESSON-01

Sidebar = bloques y etapas del path real (mismos candados y checks que ya calcula la API). Contenido = la pantalla *prepare* del nodo (título, criterio, video firmado, guía). Barra inferior = solo controles con lógica real detrás (hoy: reproducir; Metrónomo/Loop/Grabar entran el día que tengan backend, no antes).

### 3. La theory box, para los slots Fundamento uno y dos

El patrón problema → solución → porqué → aplicación encaja natural en los dos primeros slots de cada bloque. El contenido de ejemplo (transporte con cejillo) se archiva como borrador de currículo para cuando toque ese tema.

### 4. Los tokens de tipo (T/X/♫/★), sobre la paleta vigente

Se conserva el sistema visual, se sustituye el ámbar `#c4956a` por el dorado que ya vive en producción, y los estilos se extraen de styled-jsx a la técnica de CSS que usa la app.

## Qué descartar sin culpa

Badge EN VIVO y su timer, la racha ficticia, el botón Grabar, Metrónomo/Loop/Tempo (hasta que exista su lógica), la navegación a features inexistentes, y del README: NextAuth/Clerk (la app ya tiene auth propia), "conectar PostgreSQL/Supabase para trackear progreso" (ya existe `LessonSession` + path), Daily.co/100ms (fuera de roadmap) y el pitch detection con TensorFlow (capa muy posterior).

## Ruta de adopción propuesta

1. Archivar `Classroom.jsx` + este documento como insumo de diseño en el repo (p. ej. `docs/ux/t-ux-lesson-01/`), bajo la regla de docs vigente. **No ejecutar el README**: nada de `create-next-app`.
2. Cuando arranque T-UX-LESSON-01, su handoff parte del mapeo de datos de este documento en lugar de inventar uno.
3. Decisión opcional y explícita del director: adelantar el `Fretboard` parametrizado como mini-ticket dentro del runner CHORD_SHAPE (alcance chico, valor visible en un ejercicio que ya está en producción).

## Riesgos si se instalara tal cual

Fork del producto en dos apps con doble mantenimiento; regresión de seguridad en video (contenido pago por URLs públicas); una pantalla que promete a alumnos reales funciones que no existen; y una segunda paleta que fragmenta la marca recién unificada.
