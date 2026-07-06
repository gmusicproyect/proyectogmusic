# Visión — Admin Platform Gmusic (Track A)

**Fecha:** 2 Jul 2026  
**Estado:** Aprobada por Juan (2 Jul 2026) — **D-GOV-17 cerrada 3 Jul 2026** (Opción B)  
**Palabra clave:** Retomar Gmusic  
**Decisión formal:** D-GOV-17 en `.agents/DECISIONS.md`

### Aprobación Juan (2 Jul 2026)

| ID | Decisión |
|----|----------|
| D1 | **Gmusic Studio Admin** (plataforma, no solo cursos) |
| D2 | Tras Bloque 1: **PDF/materiales → tablero aciertos/errores** |
| D3 | PDFs: **URL externa + Supabase Storage** |
| D4 | Landing editable: **después** de más bloques academia (Fase D) |
| D5 | **Sí** — formalizar D-GOV-17 con Opus |

---

## 1. Lo que planteas (resumen)

Tienes razón: **Admin Creador MVP** (`/admin` hoy) resuelve solo **Academia → materia de bloques**. Pero Gmusic tiene más superficies que Juan debe poder operar **sin Cursor**:

| Zona producto | Qué quieres controlar desde Admin |
|---------------|-----------------------------------|
| **Landing** | Novedades, copy, qué se ve en hero/planes/comunidad pública |
| **Academia** | Bloques, etapas, videos, **PDFs**, material descargable |
| **Comunidad** | Curado (canción del mes), moderación de posts, preguntas |
| **Evaluación** | Preguntas/quizzes → **quién acertó, quién falló**, revisión |
| **Operación** | Leads, quiz onboarding, respuestas de alumnos |

Eso no es “un formulario más”: es un **centro de operación** del estudio.

---

## 2. Principio arquitectónico (R-008 — no negociable)

```text
Admin = interfaz delgada
Dueño de reglas = cada contexto de dominio (server/services/*)
```

| Contexto | Dueño de reglas | Admin solo… |
|----------|-----------------|-------------|
| Academy Content | `curriculum.ts`, schema Module/PathNode | CRUD + publish |
| Learning Journey | `completeLessonSessionService`, attempts | **leer** intentos, no recalcular XP a mano |
| Community | `communityService.ts` | moderar, curar, featured |
| Acquisition | onboarding analytics, landing config | editar copy/novedades |
| Membership | subscriptions (futuro) | activaciones manuales (ya hay dev endpoint) |

**Prohibido:** que Admin duplique lógica de progreso, desbloqueo o calificación — solo **dispara** o **consulta** APIs del dominio.

---

## 3. Mapa objetivo — “Gmusic Studio Admin”

Sidebar futuro (una sola app `/admin`, módulos por fase):

```text
/admin
├── Inicio          → KPIs: alumnos activos, bloques draft, posts pendientes
├── Academia        → ✅ MVP hoy — bloques 5 etapas
│   ├── Bloques     → list / create / publish
│   ├── Etapas      → video, guía, PDF, criterio
│   └── Materiales  → biblioteca PDF/audio reutilizable (fase 2)
├── Evaluación      → intentos por ejercicio, aciertos/errores, export
├── Comunidad       → curado + moderación + sector por nivel
├── Landing         → novedades, secciones, planes (copy + visibilidad)
├── Captación       → leads quiz, emails vinculados, funnel PostHog resumido
└── Ajustes         → cuenta admin, rotación credencial (env)
```

---

## 4. Estado real hoy (honesto)

| Módulo Admin | Backend | UI admin | Fuente datos hoy |
|--------------|---------|----------|------------------|
| Bloques 5 etapas | ✅ API `/admin/modules` | ✅ AdminPage | PostgreSQL |
| Video YouTube por etapa | ✅ `videoUrl` | ✅ formulario | PathNode |
| PDF / descargables | ❌ | ❌ | — |
| MicroExercise / quizzes | ✅ schema + lesson runner | ❌ sin editor admin | Prisma seed |
| Quién acertó/falló | ✅ `ExerciseAttempt` en DB | ❌ sin panel | Solo API interna |
| Comunidad curada | ❌ | ❌ mock en `mock-community-data.ts` | Frontend mock |
| Posts comunidad | ✅ CRUD alumno | ❌ moderación admin | `CommunityPost` |
| Landing novedades | ❌ | ❌ hardcoded en TSX | Código |
| Planes landing | ❌ | ❌ hardcoded `PlanesSection` | Código |
| Quiz temperamento leads | ✅ `onboarding_analytics` | ❌ | PostgreSQL |

**Conclusión:** el MVP actual es el **primer módulo** (Academia/bloques). El resto está en código mock o sin UI operativa.

---

## 5. Fases recomendadas (orden de valor / riesgo)

### Fase A — **Ahora** (sin ampliar scope código)

**Objetivo:** validar que el flujo Academia funciona en la vida real.

- Piloto Bloque 1 (`docs/operations/piloto-bloque-1-admin.md`)
- Publicar 1 bloque → ver en Mi Camino
- **No** abrir landing/comunidad admin hasta Bloque 1 OK

**Criterio done:** Juan publica Bloque 1 sin ayuda de Cursor.

---

### Fase B — **Academia completa** (Track A · siguiente ciclo código)

| Feature | Descripción | Schema/API |
|---------|-------------|------------|
| **PDF por etapa** | URL o upload (S3/Supabase Storage) + `guidePdfUrl` en PathNode | Migración mínima |
| **Biblioteca material** | Reutilizar PDF entre etapas | Opcional `ContentAsset` |
| **Preview alumno** | Botón “Ver como alumno” en admin | Solo routing interno |
| **Ejercicios por etapa** | Editor MCQ / TAP ligado a `MicroExercise` | Admin API extendida |
| **Tablero respuestas** | Lista por nodo: alumno, acierto, timestamp | GET admin read-only sobre `ExerciseAttempt` |

**Dueño reglas:** Learning Journey calcula acierto; Admin **muestra**, no re-califica.

---

### Fase C — **Comunidad operable**

| Feature | Descripción |
|---------|-------------|
| Curado admin | CRUD `CommunityFeatured` (reemplaza mock) |
| Moderación | Cola posts reportados / ocultar / pin |
| Preguntas al profesor | Tipo post `question` → inbox admin + marcar respondida |

**Prerequisito:** Comunidad C2 estable en prod (ya mergeada).

---

### Fase D — **Landing & novedades**

| Feature | Descripción |
|---------|-------------|
| Banner novedades | Modelo `SiteAnnouncement` (texto, link, vigencia, activo) |
| Secciones on/off | Flags: mostrar comunidad teaser, planes promo |
| Copy planes | Editable sin redeploy (JSON en DB o CMS) |

**Decisión Juan:** ¿Track A (JSON/Postgres simple) o esperar Track B (Sanity)?  
Recomendación interina: **Postgres + 3 campos** para novedades en Track A; Sanity cuando haya conversión WhatsApp.

---

### Fase E — **Captación & leads**

| Feature | Descripción |
|---------|-------------|
| Inbox quiz | Listar `onboarding_analytics` + email vinculado |
| Export CSV | Leads para seguimiento |
| (Futuro) Respuestas demo | Agregar cuando demo deje localStorage |

---

## 6. Qué NO meter en Admin (todavía)

- Pagos / Flow / facturación (Fase 5 pausada)
- Auth global / roles nuevos sin decisión
- Editar progreso/XP/racha manualmente (rompe invariantes)
- Track B (Sanity, Next.js) mezclado en repo Vite
- IA / recomendaciones automáticas (R-009)

---

## 7. Decisiones para Juan (elige dirección)

Responde **A / B / C** (o mezcla):

| # | Pregunta | Opciones |
|---|----------|----------|
| **D1** | ¿Nombre del producto admin? | A) Admin Creador (solo academia) · **B) Gmusic Studio Admin (plataforma)** · C) Otro |
| **D2** | ¿Prioridad post-Bloque-1? | A) PDF + materiales · B) Tablero aciertos/errores · C) Comunidad curado · D) Landing novedades |
| **D3** | ¿PDFs dónde viven? | A) URL externa (Drive/Dropbox) · B) Supabase Storage · C) Ambos |
| **D4** | ¿Landing editable cuándo? | A) Fase D (después academia) · B) Urgente antes de más bloques · C) Solo Track B Sanity |
| **D5** | ¿Registrar D-GOV-17 formal? | Sí → Opus/Codex cierran texto en DECISIONS |

**Recomendación interina (Cursor):** **D1=B**, **D2=A then B**, **D3=C**, **D4=A**, **D5=Sí**.

---

## 8. Próximo paso concreto

1. **Tú:** Piloto Bloque 1 (materia Am) — credencial ya rotada ✅  
2. **Juan responde D1–D5** (aunque sea una línea)  
3. **Cursor (próximo ciclo):** spec Fase B acotada → implementar **solo** lo que apruebes (ej. PDF + tablero intentos)  
4. **Opus (cuando vuelva):** formalizar D-GOV-17 y revisar fases C–E

---

## 9. Brief Cursor futuro (plantilla — NO ejecutar aún)

```markdown
## Brief — Admin Fase B (ejemplo PDF + intentos)

**Objetivo:** PDF por etapa + panel read-only aciertos/errores por PathNode
**Skills:** gmusic-learning-engine, gmusic-agent-workflow
**SÍ:** migración guidePdfUrl, API admin GET attempts, UI tab Academia
**NO:** landing CMS, pagos, re-calificar intentos en admin
**Done:** npm run verify + Juan sube 1 PDF y ve intentos de QA
**Autorizado Juan:** pendiente D2
```

---

*Propuesta interina · 2 Jul 2026 · sustituye alcance “solo cursos” de R-008 MVP sin invalidar arquitectura*
