# freeCodeCamp → Gmusic — referencia de inspiración (D-GOV-13)

**Fuente externa:** [freeCodeCamp/freeCodeCamp](https://github.com/freeCodeCamp/freeCodeCamp) (BSD-3-Clause software; currículo con copyright aparte)  
**Decisión:** D-GOV-13  
**Estado:** Propuesta — pendiente aprobación formal (Juan)  
**Relación:** Complementa `docs/agents/ecc-adoption.md` (ECC = harness de agentes; FCC = plataforma educativa a escala)

> Este documento **no autoriza código ni migraciones**. Define **responsabilidad**, **cuándo aporta** y **qué acciones** pueden derivarse en tickets futuros.

---

## 1. Responsabilidad de esta referencia

### Qué SÍ es responsabilidad de FCC-inspiration

| Responsabilidad | Descripción |
|-----------------|-------------|
| **Arquitectura pedagógica** | Separar contenido, runtime de ejercicio y API de progreso (como FCC: `curriculum` / client workers / `api`). |
| **Currículo versionado** | Lecciones y nodos como archivos en git, no solo strings en TSX. |
| **Validación de contenido** | Auditar prerequisitos, IDs, ejercicios y copy antes de merge/deploy. |
| **QA reproducible** | Seeds de usuario demo + e2e del funnel o del path (patrón `seed-demo-user`). |
| **Contrato anti-cheat** | Evaluación en servidor; cliente sin `secureAnswer` (alineado con `learning-engine.md`). |

### Qué NO es responsabilidad de FCC-inspiration

| Fuera de scope | Quién manda |
|----------------|-------------|
| Funnel demo 5 clases, gate, WhatsApp, quiz temperamento | `gmusic-funnel-conversion`, D-GOV-05/10, Track A T3 |
| Diseño Obsidiana & Oro, gamificación, VFX | `gmusic-edu-gamified-design`, `gmusic-visual-vfx` |
| Auth, pagos, Flow, suscripciones | `gmusic-auth-email-verification`, Fase 4/5 |
| Stack (Vite, Express, Postgres, Prisma) | D-018, `learning-engine.md` — **no** migrar a Gatsby/Fastify/Mongo |
| Track B app nativa / Sanity / micrófono | Specs Track B separados |
| Agent harness (skills, CI agentes) | D-GOV-12, `ecc-adoption.md` |
| Acceso gratis pre-demo | D-GOV-11 (propuesta aparte) |
| UI adaptativa por temperamento | Ticket 4 (bloqueado) |

### Regla de oro

**FCC inspira *cómo escalar contenido y validación*; Gmusic decide *qué enseñar, a quién y cómo convertir*.**  
Si una idea FCC contradice `.agents/DECISIONS.md`, gana Gmusic.

---

## 2. Cuándo aporta (calendario por fase)

### Leyenda de estado

| Símbolo | Significado |
|---------|-------------|
| ⛔ | No aporta ahora — bloqueado por ticket activo |
| 📋 | Aporta como **documento/plan** solo (sin implementar) |
| 🔧 | Aporta con **spike o script acotado** (tras gate) |
| 🚀 | Aporta con **implementación en producto** |

| Fase / gate | Estado actual Gmusic | Qué aporta FCC-inspiration | Entregable esperado |
|-------------|----------------------|----------------------------|---------------------|
| **T3 + T3.5 E2E** | Abierto | ⛔ Nada de producto FCC | Solo este doc + D-GOV-13 |
| **Post cierre T3/T3.5** | Pendiente | 🔧 Seed reproducible para QA funnel | Script `seed-e2e-onboarding` (propuesta) |
| **Post cierre T3/T3.5** | Pendiente | 🔧 Spike Playwright funnel | `e2e/track-a-funnel.spec.ts` (propuesta, M) |
| **Track A estable** | En curso | 📋 Checklist validación contenido demo | Extender tests estáticos en `demo-lessons` |
| **D-GOV-04 cerrado** | Pendiente Juan | 🚀 Currículo 6–15 como datos versionados | Carpeta `curriculum/` o YAML + build |
| **Fase 4 auth real** | Pausada (D-005) | 🔧 Seed `certified-user` / `demo-user` para API | Patrón FCC `seed:certified-user` adaptado |
| **Motor path 20+ lecciones** | Track B / Fase 4+ | 🚀 Pipeline contenido → Prisma → `GET /me/path` | Ver `learning-engine.md` + FCC `curriculum/` |
| **Certificaciones verificables** | Futuro lejano | 📋 Solo north star | No implementar antes de 1ª conversión real |

### Gate obligatorio antes de cualquier implementación FCC

1. **T3 + T3.5 cerrados** con E2E producción (email, Supabase, PostHog, WhatsApp).  
2. **D-GOV-04** resuelto si el trabajo toca lecciones 6–75.  
3. **Autorización explícita de Juan** por ticket (no “copiar FCC porque sí”).

---

## 3. Mapa de patrones FCC → Gmusic

| Patrón FCC | Equivalente Gmusic (hoy o target) | Skill / doc dueño | Cuándo implementar |
|------------|----------------------------------|-------------------|-------------------|
| `curriculum/` markdown → JSON build | Nodos en Prisma + seed; futuro `curriculum/guitarra/` | `gmusic-learning-engine`, D-GOV-04 | Post D-GOV-04 |
| `audit-challenges` | Script `audit-curriculum` (IDs, prereqs, ejercicios) | `gmusic-verification` | Post T3, antes de publicar 6–15 |
| Challenge workers (browser-scripts) | Microejercicios en cliente; validación en `complete` | `learning-engine.md` | Ya en diseño; reforzar en Fase 4+ |
| `seed-demo-user` | Seed alumno dev + fila onboarding E2E | `gmusic-ci-deploy` | Post T3 E2E OK |
| Playwright `e2e/` | Automatizar checklist `checklist-track-a-t3-e2e.md` | `gmusic-ci-deploy` | Post T3 E2E OK |
| Certificaciones + examen | Diploma Gmusic post-semestre (futuro) | — | Después 1ª conversión WhatsApp (D-005) |
| Foro / comunidad masiva | Comunidad Gmusic (legacy doc) | — | No prioritario Track A |
| Monorepo Turbo + pnpm | **No adoptar** | — | ⛔ |
| Gatsby client | **No adoptar** — mantener Vite | D-018 | ⛔ |
| MongoDB API | **No adoptar** — mantener Postgres | `database-schema.md` | ⛔ |

---

## 4. Acciones priorizadas (backlog derivado)

Solo se ejecutan como **tickets explícitos** tras los gates de §2.

| ID | Acción | Esfuerzo | Aporta cuando | Bloqueado por |
|----|--------|----------|---------------|---------------|
| FCC-A1 | Documento de responsabilidades (este archivo) + D-GOV-13 | S | Ya | — |
| FCC-A2 | `scripts/seed-e2e-onboarding.ts` — usuario + fila quiz reproducible | S | Post T3 E2E | T3/T3.5 abierto |
| FCC-A3 | Playwright: quiz → demo 5 → registro → assert link-lead mock | M | Post T3 E2E | T3/T3.5, FCC-A2 |
| FCC-A4 | `scripts/audit-demo-lessons.mjs` — validar DEMO_LESSONS (IDs, orden, URLs) | S | Track A estable | — |
| FCC-A5 | Spike `curriculum/guitarra/` YAML → seed Prisma | L | Post D-GOV-04 | D-GOV-04, pedagogía 6–75 |
| FCC-A6 | `audit-curriculum` en CI (contenido, no solo código) | M | Post FCC-A5 | FCC-A5 |

**No iniciar FCC-A2…A6** en la misma ventana que cierre T3 manual sin autorización.

---

## 5. Separación explícita: FCC vs ECC vs Gmusic nativo

| Área | FCC | ECC | Gmusic nativo |
|------|-----|-----|---------------|
| Objetivo | Enseñar a millones, certificar devs | Optimizar agentes de código | Academia guitarra + funnel conversión |
| Aporta a Gmusic | Contenido, validación, e2e pedagógico | Verify, CI agentes, handoff | Producto, DECISIONS, skills `gmusic-*` |
| Instalar en repo | ⛔ No fork | ⛔ No plugin completo | ✅ Fuente de verdad |
| Doc en repo | Este archivo | `ecc-adoption.md` | `DECISIONS.md`, `AGENTS.md` |

---

## 6. Criterios de “listo” por acción FCC

| Acción | Criterio de cierre |
|--------|-------------------|
| FCC-A2 | Mismo `session_id` + email de prueba recreable en incógnito automatizado |
| FCC-A3 | CI verde; mismo flujo que checklist T3 sin pasos manuales críticos |
| FCC-A4 | Falla CI si falta clase demo, URL rota o orden pedagógico roto |
| FCC-A5 | Nodo 6–15 cargados desde archivos, no hardcoded en `PathDemoPage` |
| FCC-A6 | PR que rompe prerequisito de nodo no puede mergear |

---

## 7. Qué hacer ahora (jun 2026)

| Rol | Acción |
|-----|--------|
| **Juan** | Cerrar T3/T3.5 E2E; aprobar o rechazar D-GOV-13 |
| **Cursor / Cursos** | No implementar FCC-A2+ hasta gate; usar este doc al planificar Track B |
| **Claude / Opus** | Usar §3 al redactar D-GOV-04 y specs 6–75 |
| **Codex** | Registrar en MEMORY solo tickets FCC-* cuando Juan autorice |

---

## 8. Referencias internas

- `docs/architecture/learning-engine.md` — motor MVP
- `docs/architecture/database-schema.md` — Postgres/Prisma
- `docs/deploy/checklist-track-a-t3-e2e.md` — E2E manual vigente
- `docs/agents/ecc-adoption.md` — harness agentes (paralelo, no sustituto)
- `.agents/skills/gmusic-learning-engine/SKILL.md`
- `.agents/skills/gmusic-ci-deploy/SKILL.md`
