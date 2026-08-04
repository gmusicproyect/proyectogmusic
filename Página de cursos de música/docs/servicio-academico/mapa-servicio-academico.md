# Mapa del Servicio Académico
**Ruta de Guitarra de 12 Meses**

| | |
|---|---|
| Versión | 1.0 |
| Fecha | 2026-08-03 |
| Ubicación | `docs/servicio-academico/mapa-servicio-academico.md` |
| Se actualiza cuando | cambia una decisión de contenido, storage, pagos o comunidad |
| Documentos compañeros | `.agents/PROJECT_STATUS.md` (estado operativo) · `prisma/schema.prisma` (plano de datos) · `docs/flows/00-mapa-maestro.md` (flujo de producto) |

**Leyenda de estado en este documento**

| Marca | Significado |
|---|---|
| ✅ | Existe y opera hoy |
| 🟡 | Parcial / incompleto |
| 🔴 | No existe · propuesta · no implementar sin frase de Juan |

---

## 0 · Principio rector

La carpeta que sube al hosting **no contiene la academia**; contiene el código que la sirve. El servicio real está repartido así:

| Pieza | Dónde vive | Estado |
|---|---|---|
| Código, demo, documentación | Repo (Vercel lo construye) | ✅ |
| Clases de pago: curso, bloques, etapas, ejercicios | Supabase (tablas) | 🟡 (admin parcial; ejercicios aún dependen de seed) |
| Alumnos, suscripciones, progreso | Supabase (tablas) | ✅ |
| Validación de ejercicios y progreso | Render | ✅ |
| Videos, PDF, imágenes, audio | Storage centralizado | 🔴 por crear |
| Cierre comercial Track A | WhatsApp (`wa.me`) | ✅ (J-FLOW-01) |
| Cobros automatizados | Pasarela + webhook → `Subscription` | 🔴 por definir |

Por eso el orden tiene dos capas: la carpeta (sección 1) y los flujos del servicio (secciones 2 a 8).

---

## 1 · Orden de la carpeta (repo)

Estructura **real hoy** (Vite + React SPA, no App Router de Next.js):

```
Página de cursos de música/
├── src/
│   ├── app/
│   │   ├── pages/              ← landing, registro, demo, alumno, admin, inscripción
│   │   ├── components/         ← UI (gmusic, music, auth…)
│   │   ├── data/
│   │   │   └── demo-lessons.ts ← demo gratis (temporal: migrar a Supabase)
│   │   ├── services/gmusic-api/← cliente HTTP → /api/v1
│   │   └── App.tsx             ← routing string-based (D-018)
│   └── main.tsx
├── server/                     ← API Express (Render)
├── prisma/
│   ├── schema.prisma           ← plano de los datos
│   ├── migrations/             ← historial de cambios
│   └── seed.ts                 ← ejercicios iniciales (a retirar)
├── public/                     ← SOLO marca e interfaz, nada de clases
├── docs/
│   ├── operations/
│   ├── flows/
│   └── servicio-academico/     ← este mapa
├── vercel.json                 ← rewrites SPA + proxy API + cron keep-alive
└── .agents/PROJECT_STATUS.md
```

Capas de producto (lógicas, no carpetas Next):

| Capa | Rutas / pantallas principales |
|---|---|
| **VENTA** | landing, precios/planes, inscripción → WhatsApp |
| **ALUMNO** | registro, demo, `/alumno`, `/mi-camino`, lección |
| **ADMIN** | `/admin` — bloques y etapas |

**Reglas fijas del repo**

1. `public/` es solo marca e interfaz. Ningún material de clase entra ahí jamás.
2. La base de datos guarda rutas (`videoUrl`, `guidePdfUrl`, `contentPayload`), nunca archivos pesados.
3. `demo-lessons.ts` es temporal: su destino es el mismo árbol de Supabase con marca de «gratis».
4. `seed.ts` es andamiaje: se retira cuando el editor de ejercicios esté completo.

---

## 2 · Mapa general del servicio

```mermaid
flowchart LR
  P["Profesor / admin"] --> A["Panel /admin<br/>Vercel"]
  AL["Alumno"] --> W["Web del alumno<br/>Vercel"]
  W --> R["API de práctica<br/>Render"]
  subgraph SB["Supabase"]
    C["Contenido<br/>curso, bloques, etapas, ejercicios"]
    D["Datos de alumnos<br/>cuentas, avance, pagos"]
    S["Storage multimedia<br/>🔴 por definir"]
  end
  A --> C
  W --> C
  R --> D
  A -.-> S
  S -.-> W
  classDef pendiente stroke:#b8860b,stroke-dasharray:5 5
  class S pendiente
```

Las líneas punteadas hacia y desde Storage son el eslabón faltante: hoy nadie sube archivos a un almacén propio; se pegan URLs (YouTube / enlaces externos).

---

## 3 · Flujo del alumno

```mermaid
flowchart TD
  A1["1 · Se registra ✅<br/>User"] --> A2["2 · Quiz de onboarding ✅<br/>OnboardingAnalytics"]
  A2 --> A3["3 · Demo: 5 clases gratis ✅<br/>DemoProgress + demo-lessons.ts"]
  A3 -->|hoy: WhatsApp J-FLOW-01| A4a["4a · Inscripción vía WA ✅<br/>ops activa Subscription"]
  A3 -->|futuro: pasarela 🔴| A4b["4b · Checkout + webhook 🔴<br/>Subscription automática"]
  A4a --> A5
  A4b --> A5["5 · Toma la clase de su ruta 🟡<br/>PathNode: video, guía, PDF"]
  A5 --> A6["6 · Resuelve ejercicios ✅<br/>ExerciseAttempt · valida Render"]
  A6 --> A7["7 · Avance, XP y racha ✅<br/>UserProgress · XpEvent · StreakEvent"]
  A7 -->|desbloquea la siguiente etapa| A5
  classDef pendiente stroke:#b8860b,stroke-dasharray:5 5
  class A4b pendiente
```

Notas:

- Cada práctica registra además `LessonSession`.
- Pasos 1 a 3 = fase gratis; del acceso pagado en adelante = zona suscriptor (`StudentZoneGuard`).
- **Hoy no hay pasarela en prod.** El cierre comercial Track A es WhatsApp; la activación de `Subscription` es operativa/manual. La pasarela es decisión futura (sección 7 y registro).

---

## 4 · Flujo del administrador (crear y publicar una clase)

```mermaid
flowchart TD
  B1["1 · Crea el bloque del mes ✅<br/>Course → Module"] --> B2["2 · Crea las 5 etapas ✅<br/>PathNode"]
  B2 --> B3["3 · Escribe la guía ✅<br/>guideText"]
  B3 --> B4["4 · Sube video y PDF 🔴<br/>hoy: URLs pegadas · sin storage propio"]
  B4 --> B5["5 · Carga los ejercicios 🟡<br/>editor incompleto · dependen de prisma/seed.ts"]
  B5 --> B6["6 · Publica el bloque ✅<br/>visible en la ruta del alumno"]
  classDef pendiente stroke:#b8860b,stroke-dasharray:5 5
  class B4,B5 pendiente
```

Los dos pasos punteados/amarillos son los eslabones débiles de hoy. El demo queda fuera de este flujo: se edita en código y exige deploy; su destino es entrar a este mismo flujo (regla 3 de la sección 1).

---

## 5 · Estructura de clases y lecciones

```mermaid
flowchart TD
  C["Course<br/>Ruta de Guitarra de 12 Meses"] --> M["Module<br/>un bloque por unidad"]
  M --> P1["Fundamento 1<br/>PathNode"]
  M --> P2["Fundamento 2<br/>PathNode"]
  M --> P3["Técnica<br/>PathNode"]
  M --> P4["Práctica<br/>PathNode"]
  M --> P5["Tocar<br/>PathNode"]
  P3 --> F["Cada PathNode guarda<br/>videoUrl · guideText · guidePdfUrl"]
  F --> E["MicroExercise (varios)<br/>contentPayload: imagen, audio, datos"]
```

Las 5 etapas son fijas en cada bloque: Fundamento 1, Fundamento 2, Técnica, Práctica, Tocar. Un `PathNode` = una etapa; un `Module` = el bloque con esas cinco etapas.

---

## 6 · Multimedia y PDF

**Decisión propuesta: Supabase Storage** (🔴 por confirmar — ver registro).

- Razón: la base y la autenticación ya viven ahí; URLs firmadas impiden que un no-suscriptor comparta el enlace de un video o PDF de pago.
- Buckets propuestos: `demo-media` (público o firmado corto) · `clases-video` · `clases-pdf` · `ejercicios-media` (privados).
- Riesgo: el egress de video se encarece con volumen. Plan B: con cientos de alumnos, mover solo el video a Cloudflare R2/Stream o Mux; PDF, imágenes y audio se quedan en Supabase.

**No crear buckets ni subir archivos de prod hasta confirmar esta decisión** (runbook propio + permisos + política de firmado).

```mermaid
flowchart TD
  M1["1 · El profesor sube el archivo<br/>desde /admin"] --> M2["2 · Storage con buckets privados<br/>demo-media · clases-video · clases-pdf · ejercicios-media"]
  M2 --> M3["3 · La base guarda solo la ruta<br/>PathNode.videoUrl · guidePdfUrl · MicroExercise.contentPayload"]
  M3 --> M4["4 · El servidor verifica el acceso<br/>Subscription ACTIVE"]
  M4 --> M5["5 · Entrega URL firmada temporal<br/>el alumno ve el video y el PDF"]
```

---

## 7 · Venta y suscripciones

```mermaid
flowchart TD
  V1["Tráfico<br/>redes, anuncios, referidos"] --> V2["Landing y registro ✅<br/>User"]
  V2 --> V3["Demo gratis, sin tarjeta ✅<br/>DemoProgress"]
  V3 --> V4["Gate / precios ✅<br/>plan mensual o anual"]
  V4 --> V4w["WhatsApp bridge ✅<br/>cierre comercial Track A hoy"]
  V4 --> V5["Checkout con pasarela 🔴<br/>por definir"]
  V4w --> V6ops["Ops activa Subscription ✅<br/>manual / runbook"]
  V5 --> V6["Webhook activa Subscription 🔴"]
  V6ops --> E1
  V6 --> E1["Activa"]
  V6 --> E2["Vencida"]
  V6 --> E3["Cancelada"]
  E2 -. correo de recuperación 🔴 .-> V5
  E3 -. correo de recuperación 🔴 .-> V5
  classDef pendiente stroke:#b8860b,stroke-dasharray:5 5
  class V5,V6 pendiente
```

Regla del embudo (destino): vencida o cancelada pierde el contenido de pago pero **conserva su progreso** (`UserProgress` intacto). Cada baja es un lead caliente que vuelve por correo al checkout.

Pendiente: elegir pasarela (Stripe, Mercado Pago, Wompi u otra) y conectar su webhook a `Subscription`. Hasta entonces, WhatsApp + activación ops siguen vigentes.

---

## 8 · Comunidad

**Estado real hoy (D-COMM-BPLUS-001):** tab Comunidad **habilitada en nav**, UI parcial, mocks saneados, producto **NO LANZADO**. Hay API/persistencia construida; no es «cero código».

**Propuesta de piloto de feedback (etapa Tocar → compartir → feedback):**

```mermaid
flowchart LR
  K1["Toca y se graba<br/>etapa Tocar"] --> K2["Comparte su avance<br/>en la comunidad"]
  K2 --> K3["Recibe feedback<br/>profesor y pares"]
  K3 -. motivación: vuelve a la ruta .-> K1
```

| Opción | Qué implica | Cuándo |
|---|---|---|
| B · Fuera de la app (Discord o WhatsApp grupo) | Cero/bajo desarrollo; valida si la gente participa | Primera recomendada para el loop de feedback |
| A · Dentro de la app (feed/posts/comentarios completos) | Semanas de desarrollo + moderación; hay base parcial | Solo si B demuestra participación real · no reabrir launch sin frase |

---

## 9 · Las 6 preguntas del mapa

| Pregunta | Hoy | Destino |
|---|---|---|
| 1. ¿Dónde se crea una clase? | Panel `/admin` (bloques y etapas); ejercicios a medias | `/admin` completo, sin `seed.ts` |
| 2. ¿Dónde se almacena? | Supabase (`Course → Module → PathNode → MicroExercise`); demo en código | Todo en Supabase, demo incluido |
| 3. ¿Dónde se suben sus archivos? | No hay almacén propio: se pegan URLs a mano | Supabase Storage con buckets (tras confirmar D-STORAGE-01) |
| 4. ¿Cómo se publica? | Botón de publicar en `/admin` | Igual, más vista previa antes de publicar |
| 5. ¿Cómo la recibe el alumno? | Vercel lee API/Render → Supabase; Render valida ejercicios | Igual, más URLs firmadas para multimedia |
| 6. ¿Dónde queda su progreso? | `UserProgress`, `LessonSession`, `ExerciseAttempt`, `XpEvent`, `StreakEvent` | Igual (PD-2 sigue bloqueado para producción) |

---

## 10 · Orden de construcción

1. **Confirmar Storage (D-STORAGE-01)** — proveedor, buckets, privacidad, firmado, tamaños; **después** crear los 4 buckets y subir video+PDF de **una** etapa real. Desbloquea las secciones 2, 4 y 6.
2. **Editor de ejercicios en `/admin`** — retirar la dependencia de `prisma/seed.ts`.
3. **Pasarela de pago** — checkout + webhook hacia `Subscription` (sustituye o complementa el bridge WhatsApp según decisión).
4. **Migrar el demo a Supabase** con marca de «gratis» — un solo sistema de contenido.
5. **Comunidad** — piloto Opción B (Discord) para el loop de feedback; ampliar producto interno solo con participación demostrada y frase de Juan.

**No ejecutar el paso 1 operativo (crear buckets) hasta la frase de confirmación de Storage.**

---

## Registro de decisiones

| Fecha | Decisión | Estado |
|---|---|---|
| 2026-08-03 | Este mapa es la fuente de verdad del servicio académico (capa servicio; no reemplaza `docs/flows/` ni PROJECT_STATUS) | Vigente |
| 2026-08-03 | Cierre comercial Track A hoy = WhatsApp (J-FLOW-01); pasarela automatizada = futuro | Vigente |
| 2026-08-03 | Storage: Supabase Storage con 4 buckets (`demo-media`, `clases-video`, `clases-pdf`, `ejercicios-media`) | 🔴 Propuesta, por confirmar |
| 2026-08-03 | Pasarela de pago (Stripe / Mercado Pago / Wompi / otra) | 🔴 Por definir |
| 2026-08-03 | Comunidad feedback: empezar con Opción B (Discord/externa); producto in-app NO LANZADO (B+ parcial vigente) | 🔴 Propuesta, por confirmar |

Cuando confirmen storage y pasarela, actualizar este registro y subir la versión a **1.1**.
