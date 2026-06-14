# Track B — Arquitectura de Esquemas Sanity

**Fecha:** 13 Jun 2026  
**Autor:** Opus (arquitecto)  
**Track:** B — Master System (diseño en papel, construcción no iniciada)  
**Dependencia:** Track A valida mercado primero. Este doc es referencia futura.

---

## Premisas de diseño

1. **Cero código para agregar contenido** — admin sube video/texto/audio → Next.js renderiza automáticamente.
2. **Multimarca** — un mismo esquema sirve a Gmusic y Selah Music. El campo `brand` filtra todo.
3. **Separación limpia** — Sanity almacena *qué* mostrar. Railway PostgreSQL almacena *quién pagó* y *qué completó*.
4. **El puente entre ambos es `contentId`** — string estable que Railway usa como clave foránea lógica.

---

## 1. Esquemas de Sanity

### 1.1 Brand (Marca)

```json
{
  "name": "brand",
  "title": "Marca",
  "type": "document",
  "fields": [
    { "name": "brandId",     "type": "slug",   "description": "gmusic | selah-music" },
    { "name": "name",        "type": "string"  },
    { "name": "tagline",     "type": "string"  },
    { "name": "domain",      "type": "string",  "description": "gmusic.cl" },
    { "name": "logo",        "type": "image"   },
    { "name": "palette",     "type": "object", "fields": [
      { "name": "background", "type": "string", "description": "#080808" },
      { "name": "gold",       "type": "string", "description": "#C9A84C" },
      { "name": "text",       "type": "string", "description": "#F5F0E8" }
    ]},
    { "name": "seo",         "type": "object", "fields": [
      { "name": "title",       "type": "string" },
      { "name": "description", "type": "text"   },
      { "name": "ogImage",     "type": "image"  }
    ]}
  ]
}
```

**Regla:** nunca duplicar tokens visuales en Next.js. El frontend los lee de `brand.palette`.

---

### 1.2 Curso

```json
{
  "name": "curso",
  "type": "document",
  "fields": [
    { "name": "brand",       "type": "reference", "to": [{"type": "brand"}] },
    { "name": "title",       "type": "string"  },
    { "name": "slug",        "type": "slug"    },
    { "name": "level",       "type": "string",  "options": {"list": ["beginner","intermediate","advanced"]} },
    { "name": "instrument",  "type": "string",  "options": {"list": ["guitar","piano","bass","drums"]} },
    { "name": "thumbnail",   "type": "image"   },
    { "name": "trailerVideoId", "type": "string", "description": "Cloudflare Stream video ID del trailer" },
    { "name": "planAccess",  "type": "array",  "of": [{"type": "string"}],
      "description": "Planes que desbloquean este curso: basico | plus | familiar" },
    { "name": "modules",     "type": "array",  "of": [{"type": "reference", "to": [{"type": "modulo"}]}] },
    { "name": "isActive",    "type": "boolean" },
    { "name": "publishedAt", "type": "datetime" }
  ]
}
```

---

### 1.3 Módulo

```json
{
  "name": "modulo",
  "type": "document",
  "fields": [
    { "name": "curso",       "type": "reference", "to": [{"type": "curso"}] },
    { "name": "title",       "type": "string"  },
    { "name": "slug",        "type": "slug"    },
    { "name": "order",       "type": "number"  },
    { "name": "description", "type": "text"    },
    { "name": "lessons",     "type": "array",  "of": [{"type": "reference", "to": [{"type": "leccion"}]}] }
  ]
}
```

---

### 1.4 Lección — esquema central

La lección usa **bloques de contenido tipados** (array polimórfico). El administrador combina bloques en cualquier orden sin tocar código.

```json
{
  "name": "leccion",
  "type": "document",
  "fields": [
    { "name": "contentId",    "type": "string",
      "description": "ID estable. Railway usa este campo para registrar progreso. NUNCA cambiar una vez publicado." },
    { "name": "modulo",       "type": "reference", "to": [{"type": "modulo"}] },
    { "name": "title",        "type": "string"  },
    { "name": "slug",         "type": "slug"    },
    { "name": "order",        "type": "number"  },
    { "name": "phase",        "type": "string",
      "options": {"list": ["fundamento","tecnica","crea","logro"]},
      "description": "Metodología FTC" },
    { "name": "contenido",    "type": "array",  "of": [
      {
        "type": "object", "name": "videoBlock",
        "fields": [
          { "name": "provider",  "type": "string", "options": {"list": ["cloudflare-stream","youtube"]} },
          { "name": "videoId",   "type": "string", "description": "Stream ID o YouTube ID" },
          { "name": "title",     "type": "string"  },
          { "name": "duration",  "type": "number",  "description": "segundos" }
        ]
      },
      {
        "type": "object", "name": "audioBlock",
        "fields": [
          { "name": "provider",    "type": "string", "options": {"list": ["spotify"]} },
          { "name": "spotifyUrl",  "type": "url"   },
          { "name": "embedType",   "type": "string", "options": {"list": ["track","playlist","episode"]} },
          { "name": "title",       "type": "string"  }
        ]
      },
      {
        "type": "object", "name": "textBlock",
        "fields": [
          { "name": "body", "type": "array", "of": [{"type": "block"}], "description": "Portable Text" }
        ]
      },
      {
        "type": "object", "name": "exerciseRef",
        "fields": [
          { "name": "exerciseType", "type": "string",
            "options": {"list": ["tap-rhythm","chord-recognition","note-identification","string-identification"]} },
          { "name": "exerciseId",   "type": "string", "description": "Referencia al motor de ejercicios de Track B" },
          { "name": "xpReward",     "type": "number"  }
        ]
      }
    ]},
    { "name": "isFree",          "type": "boolean", "description": "true = demo sin suscripción" },
    { "name": "requiredPlan",    "type": "string",  "description": "basico | plus | familiar | null" },
    { "name": "estimatedMinutes","type": "number"  },
    { "name": "xpValue",         "type": "number"  }
  ]
}
```

**Clave de diseño:** el admin inyecta `videoId` de Cloudflare Stream. El frontend llama `https://videodelivery.net/{videoId}/manifest/video.m3u8` sin generar nueva página. Mismo patrón para Spotify: inyecta URL, el frontend genera el embed `<iframe>`. **Cero páginas nuevas por contenido.**

---

## 2. Separación CMS vs DB Transaccional

```
SANITY (qué mostrar)           RAILWAY POSTGRESQL (quién puede verlo y qué completó)
─────────────────────          ──────────────────────────────────────────────────────
leccion.contentId     ←───────→  lesson_progress.content_id  (FK lógica, no FK real)
leccion.requiredPlan  ←cross──→  suscripcion.plan
leccion.isFree        ←cross──→  (no requiere fila en suscripciones)
leccion.xpValue       ←───────→  lesson_progress.xp_earned (copiado al completar)
```

### Tablas Railway que cruzan con Sanity

```sql
-- Progreso por lección
lesson_progress (
  id              SERIAL PRIMARY KEY,
  alumno_id       INTEGER REFERENCES alumnos(id),
  content_id      TEXT NOT NULL,         ← leccion.contentId de Sanity
  status          TEXT DEFAULT 'pending', ← pending | in_progress | completed
  completed_at    TIMESTAMPTZ,
  xp_earned       INTEGER DEFAULT 0,
  marca           TEXT NOT NULL           ← gmusic | selah-music
);

-- Suscripción (determina qué plan tiene el alumno)
suscripciones (
  plan  TEXT   ← basico | plus | familiar
                  Next.js compara esto con leccion.requiredPlan de Sanity
);
```

### Lógica de acceso en Next.js (pseudocódigo)

```
lesson = await sanityClient.fetch(leccion, slug)
subscription = await railwayApi.getSubscription(alumnoId)
progress = await railwayApi.getProgress(alumnoId, lesson.contentId)

canAccess = lesson.isFree 
         || subscription.plan IN lesson.requiredPlan

if (canAccess) render(lesson.contenido)
else           render(UpgradeWall)
```

**Regla fundamental:** Sanity **nunca** sabe si el alumno pagó. Railway **nunca** sabe qué hay en el video. El frontend une ambas fuentes en runtime.

---

## 3. Recordatorio Track A — Hero D2 (interior.jpg)

Spec completa: `docs/vision/specs/2026-06-13-visual-d2-interior-design.md`

**Resumen ejecutivo para ejecutar cuando Juan entregue el asset:**

| Campo | Valor |
|-------|-------|
| Archivo destino | `public/hero/threshold/interior.jpg` |
| Dimensiones mínimas | 1920×1080 px (ideal 3840×2160) |
| Formato | JPEG quality 85 |
| Peso máximo | 600 KB |
| Fondo | `#080808` (negro cálido) |
| Luz focal | Dorado/ámbar desde arriba-centro |
| Contenido | Guitarra acústica, estudio oscuro, sin personas, sin texto |
| Prohibido | Azul, verde, blanco puro, neon RGB, caras |

**Cambio de código (Cursor, 1 línea):**

```ts
// threshold-assets.ts — cambiar:
interior: "https://images.unsplash.com/photo-...",
// por:
interior: "/hero/threshold/interior.jpg",
```

**Commit:** `feat(landing): Visual D2 — interior real del estudio`

**Criterio de cierre del hero:** scroll desktop + móvil fluido, los 3 actos se sienten como una secuencia cinematográfica continua.

---

## Próximos pasos Track B (cuando llegue el momento)

1. Crear repositorio GitHub Track B separado
2. Inicializar Next.js (`npx create-next-app@latest gmusic-master --typescript`)
3. Conectar Sanity Studio al repo Track B
4. Implementar esquemas de este documento
5. Configurar Railway (NoSQL perfiles + PostgreSQL transaccional)
6. Validar esquema SQL contra los 371 tests de Track A (mapeo de reglas de negocio)
