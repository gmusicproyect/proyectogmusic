# INSTRUCCIÓN PARA KIMI — Entrega del código completo (paquete ordenado)

**De:** Juan (Academia GMusic) · **Preparada por:** Fable (El Cerebro)
**Fecha:** 2026-08-05
**Contexto:** tu preview visual gustó y marca la dirección de la página. Ahora Juan necesita **el código completo de esa experiencia, entregado en un paquete ordenado y verificable**. Esta instrucción define qué entregar, cómo, y con qué contratos. Léela completa antes de escribir una línea.

---

## 0 · Qué se te pide (alcance)

**Paquete A (el pedido principal):** el código completo, navegable y autónomo, de la experiencia de lección que mostraste en el preview — pestañas **Tarjetas (Mi Camino) · Práctica · Resumen PDF**, con las tarjetas de video (Ⓡ Repaso → Ⓔ Ejercicio en video → Ⓣ Toca conmigo) y el modo Práctica leyendo ejercicios desde datos JSON.

**Paquete B (solo si el código existe de verdad):** el prototipo de audio (micrófono + pitch detection). **Separado del Paquete A, en su propia carpeta.** Si no está construido, no lo incluyas ni lo menciones como hecho — su decisión de producto sigue abierta.

## 1 · Contratos reales que tu código DEBE respetar (no inventar)

**Léxico oficial** (úsalo en código, variables y UI):
`Bloque` (módulo) → 5 `Etapas` fijas (`StageType`: Fundamento uno, Fundamento dos, Técnica, Práctica, Tocar) → cada etapa es un `PathNode` con `videoUrl` / `guidePdfUrl` y sus `MicroExercise[]`. No uses «Tema/Clase/Tarjeta» como modelo de datos; «tarjeta» puede vivir solo como palabra visual de UI.

**Tokens de color verificados** (los únicos): fondo `#080808` · superficie `#111111` · borde `rgba(255,255,255,0.06)` · dorado `#C9A84C` · texto `#F5F0E8` · secundario `#8A8A8A`. Derivados con alpha del dorado real: permitidos. Cualquier otro hex (verdes, rojos, hovers) → va listado en el README como «propuesta de paleta, pendiente decisión», no mezclado en silencio. Tipografía mínima 11px.

**Contratos de API reales** (si tu demo los simula, simúlalos con ESTAS formas):
- `POST /api/v1/lesson-sessions` `{nodeId}` → `{sessionId, status:"STARTED", startedAt, expiresAt, exercises[]}` — los ejercicios **llegan por la sesión autenticada**, nunca de un CDN público.
- `POST /api/v1/lesson-sessions/:id/complete` `{attempts:[{microExerciseId, selectedAnswer, responseTimeMs}]}` → `{accuracy, xpEarned, streakUpdated, currentStreak, nodeCompleted, alreadyProcessed}`.
- `GET /api/v1/me/path` → bloques/etapas con estado y `activeNodeId`. `GET /api/v1/me/dashboard` → `streak.currentDays`, `activeToday`.
- Endpoints que necesites y no estén aquí: puedes proponerlos **marcados `[PROPUESTO]`** — jamás presentados como existentes.

**Reglas duras (no negociables):**
1. El cliente **nunca** califica: puntos/combos del juego son feedback visual; `accuracy`, XP y aprobación los emite solo el `complete`.
2. Nada de lógica de «qué día es» en cliente (la racha la computa el backend).
3. Contenido pago jamás por URL pública: videos/PDFs se muestran como «enlace firmado (1 h)».
4. Identificadores de ejercicios = `microExerciseId`; datos de ejercicio = payload que llega en `exercises[]`.

## 2 · Estructura obligatoria del ZIP

```
entrega-kimi-YYYY-MM-DD/
├── README-ENTREGA.md          ← obligatorio, ver §3
├── paquete-a-leccion/
│   ├── index.html             ← autónomo (abre con doble click) o
│   ├── package.json           ← con scripts claros si necesitas build
│   └── data/*.json            ← datos MOCK rotulados como MOCK
└── paquete-b-audio/           ← SOLO si el código existe
    ├── index.html
    └── PRUEBA-EN-5-PASOS.md   ← receta para que Juan lo pruebe con su guitarra
```

Sin dependencias exóticas; sin llamadas de red salvo CDNs declarados en el README; sin código ofuscado o minificado — todo legible.

## 3 · README-ENTREGA.md — el corazón de la entrega

Debe abrir con esta declaración, literal: **«Todo lo afirmado en este README está en el código de este ZIP.»** Y contener una tabla obligatoria, fila por funcionalidad:

| Funcionalidad | Estado | Dónde está en el código |
|---|---|---|
| (ej.) Pestaña Práctica lee ejercicios de JSON | **REAL** | `paquete-a/js/engine.js` L40 |
| (ej.) Puntos y combo | **SIMULADO** (fórmula visual, no califica) | `...` |
| (ej.) Detección de pitch por micrófono | **NO INCLUIDO** / **REAL en paquete B** | `...` |

Tres estados posibles: `REAL` (funciona en este ZIP), `SIMULADO` (se ve pero es utilería), `NO INCLUIDO`. Nada más. Si una fila dice REAL y el código no lo respalda, la entrega completa se devuelve.

## 4 · Lo que NO debes hacer

- No escribir resoluciones o aprobaciones de Juan dentro de ningún documento — las decisiones las emite él, por fuera.
- No atribuir capacidades a tickets del repo (T-PUB-02 califica respuestas en servidor; **no escucha audio**).
- No entregar código «listo para pegar en `src/`»: tu entrega es **prototipo de referencia**; si se aprueba, entra al producto por el canal del repo con su propio ticket.
- No mezclar los paquetes A y B: se evalúan por separado.

## 5 · Qué pasa con tu entrega

Fable la evalúa contra los contratos reales → las discrepancias se registran (no es castigo, es el método) → Juan decide. Lo que llegue honesto y ordenado avanza rápido; lo que llegue inflado, vuelve. Tu preview ya demostró que puedes darle a Juan lo que quiere ver — este paquete es demostrar que puede construirse sobre lo que existe.

**Fin de la instrucción.**
