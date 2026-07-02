# Handoff Opus — Contexto completo para trabajar con Juan (2 Jul 2026)

**Palabra clave:** Retomar Gmusic  
**Audiencia:** Claude / Opus (arquitecto) — **no** Cursor ejecutor  
**Estado repo (confirmar con Cursor):** `main` @ `7a54d9b`+ · app **552/552** · Comunidad C2 + enrollment API en prod

---

## 1. Tu rol y límites

| Tú (Opus) | Cursor |
|-----------|--------|
| Visión, specs, pedagogía, briefs | Código, tests, git (push solo con OK Juan) |
| Leer `.agents/DECISIONS.md` | Implementar lo aprobado |
| Proponer — no commitear | `npm run verify` |

**HARD-GATE:** ninguna implementación hasta spec aprobada por Juan.  
**No reabrir** sin decisión: auth global, pagos, schema masivo, R-001/R-002, Track B en Track A.

---

## 2. Orden de lectura obligatorio

Leer **en este orden** antes de proponer D-GOV-04, admin o materia:

| # | Archivo | Para qué |
|---|---------|----------|
| 1 | `.agents/DECISIONS.md` | **Fuente oficial** decisiones producto/pedagogía/arquitectura |
| 2 | `AGENTS.md` | Roles, mapa rutas URL, skills |
| 3 | `.agents/PROJECT_STATUS.md` | Snapshot operativo (verificar HEAD/tests con Cursor) |
| 4 | `docs/architecture/gmusic-architecture-working-map.md` | Contextos dominio, R-008 Admin, modular monolith |
| 5 | `docs/vision/instruccion-maestra-clases.md` | **APROBADO JUAN** — 1 bloque = 5 etapas fijas |
| 6 | `docs/skills/music/curriculum-guitarra.md` | Curriculum M1–M6 Nivel 1 |
| 7 | `docs/vision/00-INTRODUCCION-CLAUDE-OPUS.md` | Sync Cursor ↔ Opus |
| 8 | `.agents/skills/gmusic-opus-architect/SKILL.md` | Plantilla brief → Cursor |

**Handoffs recientes:**  
- `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`  
- `docs/vision/handoffs/2026-06-30-comunidad-mvp-handoff.md`

---

## 3. Visión de organización por sección (Juan)

Juan quiere el proyecto **ordenado por zona de producto**, no solo por capas técnicas:

| Sección producto | Contexto arquitectura | Estado código |
|------------------|----------------------|---------------|
| **Recepción / funnel** | Acquisition | ✅ Landing, demo 5, gate, routing D-GOV-02/03 |
| **Alumno** | Learning Journey + UI path/lesson | ✅ Mi Camino, sesiones, XP (D-GOV-14 Fase A) |
| **Comunidad** | Community | ✅ MVP + posts + enrollment API (jul 2026) |
| **Suscripción / acceso** | Membership Entitlements | ⏸ parcial — sin pagos reales (Fase 5 pausada) |
| **Recepción materia** | Academy Content | ❌ sin `curriculum/` ni CMS en Track A |
| **Admin creador (Juan)** | Administration (UI sobre contextos) | ❌ **R-008 — no existe panel funcional** |

**Decisiones** viven en **un solo lugar:** `.agents/DECISIONS.md` (no una carpeta por sección).

**Código hoy:** `src/app/pages/` + `components/gmusic/{path,lesson,dashboard,community}` + `server/routes|services`.  
**Objetivo futuro:** materia en `curriculum/guitarra/` (YAML) o CMS Track B; admin publica sin tocar código.

---

## 4. Metodología pedagógica — NO confundir unidades

### Demo (1–5) — jugable gratis
Conoce guitarra → Afina → Cuerdas al aire → Pulso → Primera canción **sin acordes**.  
Arco D-004. Termina en **D-GOV-05/06** (gate / planes).

### Suscriptor — unidad real = **bloque de 5 tarjetas** (microciclo)
Fuente: `instruccion-maestra-clases.md`

| # | Etapa |
|---|--------|
| 1 | Fundamento uno |
| 2 | Fundamento dos |
| 3 | Técnica |
| 4 | Práctica |
| 5 | Tocar (checkpoint) |

**Regla:** 1 bloque = exactamente 5 nodos. Carrusel asume `index % 5`.

### Teaser carrusel (clases 6–15 visibles bloqueadas)
**Marketing / adquisición** (D-GOV-06). Placeholders en `demo-path-catalog.ts`.  
**No** son 10 lecciones jugables ni 10 tarjetas del microciclo.

---

## 5. D-GOV-04 — estado y corrección de encuadre

**En DECISIONS:** D-GOV-04 **pendiente Juan** — *«Pedagogía 6–75: skill-graph antes de títulos 6–15?»*  
**D-GOV-06:** títulos 6–15 son placeholder hasta cerrar D-GOV-04.

### Lo que NO cerrar solo con “10 títulos lineales”
Encuadre erróneo: *clase 6 = «La menor», clase 7 = «Mi menor»…* como 1 tarjeta = 1 lección Yousician.

### Lo que SÍ cerrar en D-GOV-04
1. **Mapa de bloques** post-demo (cada bloque = tema + 5 etapas), ej. bloque «Primer acorde Am».  
2. **Orden pedagógico de bloques** (consenso Juan-profesor): Am → Em → G → C; teoría M2/M5 **después** del hito progresión.  
3. **Alineación teaser 6–15** con nombres de **bloque**, no de cada etapa interna.  
4. **Spec MVP Admin creador** (Track A) antes de producir materia a escala.

### Respuestas pedagógicas acordadas con Juan (profesor)
| Pregunta | Respuesta |
|----------|-----------|
| Orden acordes | **Am → Em → G → C** (Am primero: puente desde demo cuerdas al aire) |
| Ritmo 10 “lecciones” | **Sí como arco narrativo 6–15**; en producto prever labs/repetición entre bloques |
| Teoría 12 notas / escalas | **Después del hito progresión**; antes solo mínimo (diagrama, pulso, traste+cuerda) |

---

## 6. Secuencia de producto acordada (Juan)

```
Hecho:
  ✅ Funnel demo + routing
  ✅ Zona alumno (path, sesiones)
  ✅ Comunidad C2 (publicar + enrollment)

Siguiente (prioridad Juan):
  1. Admin creador — subir video / slot → crea o actualiza nodo en bloque (sin código)
  2. Pipeline materia — curriculum/ o equivalente Track A
  3. Mapa bloques suscriptor alineado a microciclo 5 etapas
  4. Materia por slot (guiones, ejercicios, quizzes)
  5. Videos propios (hoy YouTube placeholder en demo)

Después:
  · Cerrar D-GOV-04 en DECISIONS con mapa de bloques + admin spec
  · Teaser títulos definitivos alineados al mapa
```

**Visión Track B (referencia, no implementar en Track A):**  
`docs/vision/specs/2026-06-13-track-b-sanity-schemas.md` — *cero código para agregar contenido*.

---

## 7. Fases pausadas (no proponer sin OK explícito)

- **Fase 4 Auth** ampliada — hasta conversión WhatsApp real (+56953429676)  
- **Fase 5 Pagos** — Flow, webhooks  
- **Track B** — Next.js, Sanity, Railway (no mezclar en repo Vite actual)

---

## 8. Tickets abiertos relevantes

| ID | Tema |
|----|------|
| D-GOV-04 | Pedagogía 6–75 / mapa bloques — **cerrar con Juan** |
| R-008 | Admin sin panel funcional — **spec pendiente** |
| T-API-01 | Flaky `phase3b2` concurrencia — `docs/operations/T-API-01-phase3b2-flaky-concurrency.md` |

---

## 9. Qué producir Opus en la próxima sesión

1. **Spec Admin creador MVP (Track A)** — pantallas, flujo «subo URL video → nodo en bloque X etapa Y», rol `ADMIN`, sin Sanity.  
2. **Propuesta mapa bloques** Nivel 1 (primeros N bloques post-demo) en formato tabla: bloque | 5 etapas | outcome | teaser label.  
3. **Borrador D-GOV-04** para registrar en `.agents/DECISIONS.md` tras OK Juan.  
4. **Brief Cursor** (≤15 líneas + Retomar Gmusic) solo si Juan autoriza fase implementación.

**NO producir aún:** títulos finos por tarjeta interna, grabación de videos, YAML masivo 6–75 sin admin.

---

## 10. Plantilla brief → Cursor (cuando corresponda)

```markdown
## Brief para Cursor — [fase]

**Objetivo:** …
**Skills:** gmusic-agent-workflow, gmusic-learning-engine, …
**Alcance SÍ:** …
**Alcance NO:** auth, pagos, schema sin decisión, Track B
**Criterios done:** npm run verify, tests X/Y
**Autorizado Juan:** sí/no
```

---

*Handoff generado desde sesión Juan + Cursor · 2 Jul 2026 · Comunidad C2 desplegada*
