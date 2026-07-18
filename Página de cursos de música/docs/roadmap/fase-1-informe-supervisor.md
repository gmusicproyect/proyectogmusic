# Informe de revisión MVP — supervisor (pausa gobernanza post Fase 1)

Fecha: 2026-07-14 · HEAD: `e5b161c` · Autor: Cursor

## 1. Contrato del MVP

Happy path núcleo (MUST · D-ROAD-005): Registra → Login → `/onboarding-academia` → curso/ruta → abre lección → consume → completa → progreso persistido → ve siguiente (Mi Camino y/o Mi Progreso). Funnel de adquisición: Landing → registro → [quiz opcional] → onboarding → demo 5 clases → `/inscripcion` → WhatsApp BRIDGE → ops/admin concede `Subscription ACTIVE` → `/alumno` → `/mi-camino`. MUST: auth JWT liviana, landing/academia/demo, catálogo publicado (T-PUB-01), consumo lección (T-UX-LESSON-01 si aplica), Mi Estudio/Camino/Progreso mínimo, Comunidad feed real si está en nav, ACTIVE (D-017), responsive, P0 admin/Prisma, `npm run verify` verde. SHOULD: roles avanzados; password recovery (o BRIDGE documentado). WON'T: email verify, Stripe/MP, Track B, social avanzado, rachas/rankings/gráficos de Progreso, Elvis/CourseLit/AlphaTab. BRIDGES: WhatsApp conversión/pagos (sin fingir pasarela).

## 2. Criterio de cierre

Fuente: `01-mvp-gmusic.md` §7 (DoD) + casilla §12.

| # | Criterio | ¿Objetivo? | Cómo |
|---|----------|------------|------|
| 1 | Happy path E2E registro→…→siguiente lección | Sí | Prueba E2E (staging/prod controlado) |
| 2 | Auth registro/login/logout/sesión; sin email verify | Sí | Prueba + inspección cookies/guards |
| 3 | Sin `Subscription ACTIVE` no entra zona alumno | Sí | Prueba (D-017 / StudentZoneGuard) |
| 4 | Demo 5 clases + teaser; URLs funnel | Sí | Smoke URLs funnel |
| 5 | T-PUB-01: ≥1 bloque/ruta publicada en Mi Camino | Sí | Inspección admin→alumno (+ ticket); N=1 explícito |
| 6 | Lección: abre/consume/completa/guarda; T-UX si no | Sí | Prueba umbral; ticket condicional |
| 6b | Mi Progreso mínimo (campos IN §6) + empty state | Sí | Inspección UI vs lista IN/OUT |
| 6c | Comunidad: si en nav, feed API real sin mocks launch | Sí | Inspección nav + prueba API (condicional claro) |
| 7 | WhatsApp `wa.me` + comprensión activación; no Stripe fingido | Sí | Inspección CTA + evidencia doc/runbook |
| 8 | Responsive happy path móvil sin P0 | Sí | Inspección viewport (p.ej. 390×844) |
| 9 | P0: credencial admin + Prisma persistencia | Sí | Inspección seguridad + prueba/evidencia DB |
| 10 | `npm run verify` verde en SHA launch | Sí | Comando (cifra real del repo) |
| 11 | OUT firmados en §8 | Sí | Evidencia doc |
| 12 | Juan firma §12 | Sí | Casilla en MVP |

## 3. Contradicciones resueltas

| Tema | Resolución en MVP |
|------|-------------------|
| JWT vs “auth pausada” | Auth liviana **IN**; email verify **WON'T**; docs pausada = desfasados (A · D-ROAD-005/002) |
| onboarding vs `#academia` | Canónica `/onboarding-academia`; `#academia` = CTA marketing, no wizard |
| Mi Progreso | **MUST** mínimo B (IN/OUT explícitos); inventario “inexistente” = gap de código, no de alcance |
| Comunidad mocks | Feed real reducido **IN** si en nav; mocks ≠ contrato launch (C) |
| WhatsApp | **BRIDGE**; Stripe **WON'T** (D) |
| T-PUB-01 | **MUST** pre-launch (publicación/disponibilidad) |
| T-UX-LESSON-01 | **MUST** si afecta consumo; resto SHOULD solo con evidencia en ticket |
| P0 credencial/Prisma | Bloqueo launch explícito §7.9 |

## 4. Ambigüedades restantes

Ninguna material (no habilitan dos implementaciones incompatibles del núcleo MUST/happy path).

Menores (no bloquean aprobación de lectura):
- URL exacta de **Mi Progreso** aún “a definir” (§4.3) — campos MUST sí están fijados.
- Recuperación password etiquetada **SHOULD o BRIDGE** — no blocker del núcleo.
- T-PUB-01 menciona “equivalente acordado” además de N=1 — el mínimo usable queda claro.
- Comunidad **MUST si en nav** — regla condicional explícita; no ambiguiedad de definición.

## 5. Trazabilidad

| Fuente | Respaldo en docs |
|--------|------------------|
| **D-ROAD-003** | Metadatos Track A; roadmap 10 fases; stack cartel = OUT; § Stack canónico |
| **D-ROAD-004** | Instrucción → validación APROBADA → MVP; método MUST/DoD/preguntas cerradas |
| **D-ROAD-005 A–D** | §4.1, §5, §6, §9; confirmación D-ROAD-002 en §9 |
| **A** Auth | §5 auth JWT · §7.2 · §8 email verify OUT · lista docs desfasados |
| **B** Mi Progreso | §5 · §6 IN/OUT · §7.6b |
| **C** Comunidad | §5 · §6 · §7.6c · mocks ≠ launch |
| **D** Launch/ops | T-PUB/T-UX · WhatsApp BRIDGE · Stripe/Track B OUT · P0 §7.9 |
| **Inventario Fase 0** | Metadatos HEAD `e5b161c`; tabla §4.3 alineada a clasificación inventario; Academia URL y gaps Mi Progreso/Comunidad/T-* coherentes con `00-inventario-actual.md` |

## 6. Veredicto

**LISTA PARA APROBACIÓN DE JUAN**

---

*Revisión documental Cursor · sin corrección al MVP · Fase 2 no iniciada · cero código · cero commit.*
