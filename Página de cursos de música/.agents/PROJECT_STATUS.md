# Project Status — Gmusic Estudio

Última actualización: **16 Jul 2026** · **Gates G1–G8 APROBADOS** · **ciclo P0 completo** · sin commit

## Hito — Dominio H1 / P0 (16 Jul 2026)

| Item | Estado |
|------|--------|
| **Gate G1 (P0-01)** | ✅ **APROBADO** |
| **Gate G2 (P0-02)** | ✅ **APROBADO** (API; UI/routing diferidos) |
| **Gate G3 (P0-03)** | ✅ **APROBADO** |
| **Gate G4 (P0-07)** | ✅ **APROBADO** — AccessViewH1 + gate práctica |
| **Gate G5 (P0-05)** | ✅ **APROBADO** — lifecycle binario + eventos idempotentes |
| **Gate G6 (P0-04)** | ✅ **APROBADO** — PathViewH1 / Mi Camino backend |
| **Gate G7 (P0-06)** | ✅ **APROBADO** — ProgressViewH1 derivado de eventos |
| **Gate G8 (P0-08)** | ✅ **APROBADO** — LibraryViewH1 / Biblioteca básica |
| **Ciclo P0** | ✅ **CERRADO** — P0-01, 02, 03, 07, 05, 04, 06 y 08 |
| **P0-08 verificación** | T-LIB 13/13 · typecheck/build OK · app 578/578 · verify global rojo por seed |
| **P0-06 verificación** | T-PRG 10/10 (+2) · typecheck/build OK · app 578/578 · verify global rojo por seed |
| **P0-04 verificación** | T-CAM 10/10 · typecheck/build OK · verify global rojo por seed |
| **P0-05 verificación** | T-SES aislados 6/6 · typecheck/build OK · verify global rojo por seed |
| **Schema / audio / scoring / UI** | **NO** |
| **Evidencia final P0** | ✅ `P0_evidencia_final_ciclo_H1.md` + handoff repo 16 Jul |
| **Commit P0** | ✅ Autorizado por Juan — alcance selectivo, sin mezclar cambios preexistentes |
| **Push** | **NO** — no autorizado |
| **Próxima decisión** | Persistencia durable después del cierre Git, con mandato aparte |


## Hito — Transferencia metodología SUPERADA (6 Jul 2026)

| Item | Estado |
|------|--------|
| **Piloto** | T-LOGIN-REDIRECT (Medio) — `df842a5` en prod |
| **Smoke prod** | **3/3** — demo→`/mi-camino-demo` · QA suscriptor→`/mi-camino` (JP, captura) · offline→error en login |
| **Auditoría GPT** | APRUEBA |
| **Contrato ejecutor** | Trilogía desplegada; piloto sin intervención mid-flight |

## Snapshot operativo (6 Jul 2026 — cierre piloto)

| Item | Estado |
|------|--------|
| **HEAD remoto** | `df842a5` — fix(auth): redirect post-login LoginCuentaPage |
| **Tests app** | **563/563** |
| **npm run verify** | ✅ **563 + 160** · gate verde (7 Jul 2026) |
| **Backlog nuevo** | **T-UX-COPY-LOGIN** (Baja) — copy anonymous login vs registro · `assert-auth-session.ts:15` |
| **Rama** | `main` · sync `origin/main` · dirty: `.env.example`, checklist |

## Cola operativa (7 Jul 2026)

| Orden | Item | Estado | Dependencia / nota |
|-------|------|--------|-------------------|
| **1** | ~~**T-API-01**~~ — flake `phase3b2` concurrencia | ✅ **Cerrado** 7 Jul 2026 | APRUEBA GPT · FOR UPDATE + tx retry · verify verde |
| **2** | **T-PUB-01** — Piloto Publicación (admin → alumno) | **En cola** · siguiente tras T-API-01 en remoto | **Bloque 1** (D-GOV-04) · Fase 0: inventario biblioteca admin · spec pendiente |
| **3** | **T-UX-LESSON-01** — Pantalla lección video-first + práctica activa | **En progreso** · 01D+01A implementados localmente | Mini-brief 7 Jul 2026 · 01B/C/E pendientes · R1 resuelto provisionalmente |

**Regla:** T-PUB-01 valida el **pipeline** publish-to-student, no el currículo completo. Nombre anterior "Piloto B3" **retirado** — colisionaba con Bloque 3 pedagógico y labels del admin.

**T-UX-LESSON-01:** Reemplazar/evolucionar `PathLessonRunner` hacia pantalla pedagógica video-first (5 etapas D-GOV-04, tabs, checklist, CTA único, celebración D-BRAND-02). Gate G6 si checklist requiere schema nuevo. Ver mini-brief en chat / handoff sesión 7 Jul 2026.

## Cola operativa (6 Jul 2026 — noche, superseded)

## Snapshot operativo (6 Jul 2026 — noche, superseded)

## Snapshot operativo (2 Jul 2026 — tarde)

| Item | Estado |
|------|--------|
| **HEAD** | `2134e71` — fix(security): admin seed via env |
| **Admin Creador MVP (R-008)** | ✅ `bc2de81`..`fd65927` — API + UI + shell |
| **Tests app** | **554/554** |
| **INC admin credential P0** | Repo ✅ cerrado · **Prod DB 🔴 abierto** — rotar antes de publicar materia |
| **Siguiente autorizado** | Piloto Bloque 1 vía admin (tras rotación) — `docs/operations/piloto-bloque-1-admin.md` |
| **Rama** | `main` · sync `origin/main` |

## Snapshot operativo (2 Jul 2026 — mañana)

| Item | Estado |
|------|--------|
| **HEAD** | `11c7034` — test(path): alinear stage demo con D-GOV-07 |
| **Tests app** | **550/550** |
| **Rama** | `main` · sync con `origin/main` |
| **Visual D-022C** | ✅ stage demo + suscriptor (paridad microciclo) |
| **Comunidad MVP** | ✅ mergeado (`d171c20`) · C2/API pendiente |
| **Rewrites SPA prod** | ✅ `vercel.json` commiteado (`75332fd`) · smoke **2 Jul 2026** |

### Smoke deploy prod (2 Jul 2026)

| URL | Resultado | Nota |
|-----|-----------|------|
| `/mi-camino-demo` | ✅ pass | SPA carga |
| `/quiz-temperamento` | ✅ pass | SPA carga |
| `/demo-clase-1` | ✅ pass | SPA carga |
| `/inscripcion` | ✅ pass (comportamiento esperado) | Ver abajo — no es bug de routing |

**`/inscripcion` — lógica (no cruce de rutas):**

- Pathname `/inscripcion` → `currentPage: inscripcion-gate` → **`InscripcionGatePage`** (`student-zone-routing.ts`, tests en `student-zone-routing.test.ts`).
- Si configured in `App.tsx` **sin** `StudentZoneGuard` ni `DemoAuthGuard` — ruta pública del funnel.
- Si `useDemoProgress().demoFinished === false` (0–4/5 clases, típico incógnito o CTA Semestral D-025): renderiza **`LockedGate`** dentro de la misma página — copy *"Completa tu primer camino para desbloquear esta zona"*, barra *"X de 5 clases completadas"*, CTA *"Volver a mi camino gratuito"*.
- Si `demoFinished === true` (5/5): selector de planes + celebración (puerta abierta D-GOV-05).
- **D-GOV-11** aplica a quiz + demo (cuenta antes de clases); **no** redirige `/inscripcion` a registro — el gate es el punto de conversión post-demo o con puerta cerrada si demo incompleto.

Config Vercel: `vercel.json` — catch-all `/(.*) → /index.html` + proxy `/api/v1/*` → Render.

---

## D-017 — Acceso zona alumno prod (25 Jun 2026)

| Item | Estado |
|------|--------|
| Diagnóstico | Bloqueo sin `Subscription ACTIVE` = comportamiento esperado |
| E2E prod QA | ✅ cuenta `qa-alumno-prod-001@gmusic.test` + sub manual |
| Patch código | ❌ no requerido |
| Doc estados | ✅ `docs/operations/student-access-states.md` |
| Runbook ops manual | ⬜ tarea separada (registro → sub ACTIVE → validar) |
| Knip `devStudentAuth` | ⬜ fuera de alcance D-017 |

---

| Item | Estado |
|------|--------|
| Repo canónico | `gmusicproyect/proyectogmusic` |
| **HEAD** | `11c7034` — ver snapshot arriba |
| Routing demo D-GOV-02/03 | ✅ código + rewrites prod verificados 2 Jul |
| Academia 2 pasos | ✅ `f20e795` |
| Teaser B + CTA híbrido | ✅ D-GOV-05/06 |
| Gobernanza operativa | ✅ |
| **Tests app** | **550/550** |
| Untracked local | `logogmusic.png` — fase visual hero (futuro) |
| **Deploy rewrites** | ✅ en repo + prod smoke 2 Jul (ver snapshot) |

Handoff operativo: `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`

## Academia 2 pasos — publicado (`f20e795`)

| Item | Estado |
|------|--------|
| Paso 1: Elige tu instrumento | ✅ Guitarra, Teclado, Canto |
| Solo Guitarra activa (D-007) | ✅ Teclado/Canto “Próximamente” |
| Paso 2: Elige tu punto de partida | ✅ InteractiveLevelSelector |
| CTA dinámico en paso 2 | ✅ useDemoUserState |

## Landing Visual A — One Page

| Item | Estado |
|------|--------|
| Hero simplificado (logo + bienvenida, scroll Apple) | ✅ validado Juan |
| Fondos PNG por sección (inicio → contacto) | ✅ |
| BrandLogo SVG inline + Bebas (Typekit) | ✅ |
| Navbar: Alumno + Regístrate, grid 3 cols | ✅ |
| CTA demo en Academia paso 2 (no hero) | ✅ |
| Visual D Canva/Canvas | ❌ superseded |
| Pipeline futuro assets | Visual E — Illustrator → SVG |

Handoff activo: `docs/vision/handoffs/2026-06-14-hero-simplificado-handoff-opus.md`  
Visual D obsoleto: `docs/vision/handoffs/2026-06-14-hero-d2-ux-handoff.md` (SUPERSEDED)

**Desbloqueo Fase 4 Auth:** `whatsapp_cta_clicked` con `intent: "inscripcion"` ≥ 1, confirmado manualmente por Juan (contacto real WhatsApp).

**North Star checkout (Fase 4+, no implementar aún):** Mercado Pago · form Chile/Extranjero · RUT genérico extranjero vía servicio interno · ver `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md` y **D-027**.

**Juan Track A (Jun 2026):** visual ✅ · Academia 2 pasos ✅ · routing demo URL ✅ (`e047ac3`) · PostHog key + funnel ✅ · push origin ✅ · conversión WhatsApp real ⬜

---

## Routing demo — publicado (`e047ac3`)

| Ruta | `currentPage` | Estado |
|------|---------------|--------|
| `/mi-camino-demo` | `mi-camino-demo` | ✅ sync URL |
| `/demo-clase-1` … `/demo-clase-5` | `demo-clase-*` | ✅ sync URL |
| `/inscripcion` | `inscripcion-gate` | ✅ sync URL |
| — | `inscripcion-registro` | ✅ sin URL pública (mantiene `/inscripcion`) |
| `/alumno` | `mi-estudio` / `welcome` | ✅ sin cambio |
| `/mi-camino` | `mi-camino` | ✅ sin cambio |

Implementación: `student-zone-routing.ts` + `handlePageChange`. Tests: `student-zone-routing.test.ts` (**550/550** app).

**Deploy:** rewrites en `vercel.json` — verificado prod 2 Jul 2026 (snapshot arriba).

---

## Fases

| Fase | Descripción | Estado | Commit | Tests |
|------|-------------|--------|--------|-------|
| Fase 1 | Landing limpia + CTA dinámico en AcademiaSection | ✅ Completo | `5ad9517` | `fundamento-funnel.test.ts` |
| Fase 2 | Demo 5 clases (PathDemoPage + DemoLessonPage) | ✅ Completo | `2e41d9f` | `path-demo-page.test.ts`, `fundamento-funnel.test.ts` |
| Fase 3 | InscripcionGatePage gamificada + selector de planes | ✅ Completo | `2e41d9f` | `inscripcion-gate.test.ts` |
| Pre-Fase 4 | Bridge WhatsApp + videos YouTube en demo | ✅ Completo | `8ca6228` | `inscripcion-gate.test.ts` |
| Fase Precios | Modelo 3 tiers × 3 períodos + CLP en gate/registro | ✅ Completo | `cf3343c` | `inscripcion-gate.test.ts` (358 tests totales app) |
| R3 / zona alumno | Acceso, funnel Semestral dev, cofre Fase 6, R3.3E redirect | ✅ Completo (remoto) | `30e310b`…`6088dc5` | `public-session-flow.test.ts`, `map-dashboard.test.ts`, etc. |
| Fase A | Reordenamiento pedagógico demo (arc Conoce→Afina→Cuerdas→Pulso→Canción) | ✅ Completo | `90883a1` | `path-demo-page.test.ts` (358/358) |
| Fase B código | ExPulsoAire — ejercicio TAP manual Clases 4 y 5 · validado en browser | ✅ Completo | `846c8f5` | 358/358 |
| Fase Visual A | DemoPathCards — tarjetas verticales reemplazando mapa serpentino | ✅ Completo | `263d5f6` | 358/358 |
| Fase Visual B | Carrusel Yousician + DemoAcademyNav (4 tabs sticky) | ✅ Completo · validado en browser | `263d5f6` | 358/358 |
| Fase 3.5a | Registro: dos CTAs (inscripción + dudas), form boleta/factura, eliminar "reservar" copy | ✅ Completo | `35e139b` | `inscripcion-gate.test.ts` (358/358) |
| Fase 3.5b | CTA "Semestral" landing → `inscripcion-gate` directo (Opción B, D-025); cerrar leak checkout legacy | ✅ Completo | `5133075` | `semestral-checkout-flow.test.ts` (359/359) |
| PostHog | 8 eventos de funnel; host US por defecto, configurable vía `VITE_POSTHOG_HOST` (D-026) | ✅ Completo — pendiente commit | — | `analytics.test.ts` (365/365) |
| Visual C | Eliminar `GmusicInternalHeader` (doble nav) en `mi-camino-demo`; `DemoFinishedCelebration` centrada | ✅ Completo — pendiente commit | — | `path-demo-page.test.ts` (365/365) |
| Fase 4 | Auth real (JWT/bcrypt/Prisma) | ⏸ Pausada — condicionada a conversión WhatsApp | — | — |
| Fase 5 | Flow + Resend + Webhooks | ⏸ Pausada — condicionada a Fase 4 | — | — |

---

## Inventario de páginas activas

Páginas montadas en `App.tsx` que **no** están detrás de `DEV_LEGACY`:

| Archivo | Ruta (`currentPage`) | Estado | Notas |
|---------|----------------------|--------|-------|
| `GmusicLanding.tsx` | `home` | ✅ Completo | Compone Hero, Academia, Planes, etc.; recibe `session` para CTA |
| `PathDemoPage.tsx` | `mi-camino-demo` | ✅ Completo | 5 nodos desde `DEMO_LESSONS`; progreso vía `useDemoProgress` |
| `DemoLessonPage.tsx` | `demo-clase-1` … `demo-clase-5` | ✅ Completo | Fases video → ejercicio → éxito; YouTube embed si `videoUrl` presente |
| `InscripcionGatePage.tsx` | `inscripcion-gate` | ✅ Completo | Selector período (default `semester`) + 3 tiers (`basico`/`plus`/`familiar`); Plus recomendado (`cf3343c`) |
| `InscripcionRegistroPage.tsx` | `inscripcion-registro` | ✅ Completo | Bridge WhatsApp; planId `{tier}-{period}`; fallback `plus-semester`; `WHATSAPP_NUMBER = "56953429676"` |
| `GmusicWelcome.tsx` | `mi-estudio`, `welcome` | ✅ Completo | Tras `StudentZoneGuard`; API dashboard real/mock |
| `GmusicPath.tsx` | `mi-camino` | ✅ Completo | Tras `StudentZoneGuard`; API path + lesson sessions |
| `FreeFundamentoLessonPage.tsx` | `fundamento-free-lesson` | 🗂️ Legacy activo | Ruta paralela; Hero/Planes aún apuntan aquí |
| `ProbarPage.tsx` | `probar` | 🗂️ Legacy activo | Página de prueba histórica |
| `CheckoutPage.tsx` | `checkout` | 🗂️ Legacy activo | Funnel Semestral directo (AuthModal → checkout) |
| `CourseDetailPage.tsx` | `course-detail` | 🗂️ Legacy activo | Catálogo legacy |
| `AlbumCoursesPages.tsx` | `album`, `courses` | 🗂️ Legacy activo | Catálogo legacy |
| `InstrumentCoursesPage.tsx` | `instrument-selector`, `instrument-courses` | 🗂️ Legacy activo | Selector instrumento legacy |
| `CommunityPage.tsx` | `community` | 🔴 Placeholder | Montada; alcance producto no verificado |

**Solo en `import.meta.env.DEV` (`DEV_LEGACY`):**

| Archivo | Ruta | Estado |
|---------|------|--------|
| `DashboardPage.tsx` | `dashboard` | 🗂️ Dev legacy |
| `LessonPage.tsx` | `lesson` | 🗂️ Dev legacy (`ExerciseEngine`) |
| `CurriculumPage.tsx` | `curriculum` | 🗂️ Dev legacy |

**Existe pero no montada en `App.tsx`:**

| Archivo | Notas |
|---------|-------|
| `FundamentoPreviewPage.tsx` | Conservada; tests confirman que no se monta en App |

---

## Inventario de ejercicios del demo (estado post-Fase B)

Arc pedagógico activo: **Conoce → Afina → Cuerdas → Pulso → Canción**

| Clase | Título | Ejercicio | Componente | Estado |
|-------|--------|-----------|------------|--------|
| 1 | Conoce tu guitarra | MCQ — ¿dónde van las clavijas? (correctId: `headstock`) | `MultipleChoiceExercise` | ✅ |
| 2 | Afina tu guitarra | MCQ — ¿qué nota es la cuerda 6? (correctId: `e_mi`) | `MultipleChoiceExercise` | ✅ |
| 3 | Cuerdas al aire | Nombrar las 6 cuerdas | `Ex1Cuerdas` | ✅ |
| 4 | Pulso con cuerdas al aire | TAP manual — 8 beats (ver nota pedagógica) | `ExPulsoAire` | ⚠️ impl. pendiente commit |
| 5 | Tu primera canción | TAP manual — 10 beats (ver nota pedagógica) | `ExPulsoAire` | ⚠️ impl. pendiente commit |

**Nota pedagógica — diferencia Fable spec vs. implementación Cursor (Fase B):**

| | Fable especificó | Cursor implementó |
|-|-----------------|-------------------|
| Clase 4 | 8 beats alternando cuerdas 6/5/4 (`6 6 / 5 5 / 4 4 / 6 6`) | 8 beats en cuerda 6 al aire solamente |
| Clase 5 | 15 beats con 3 silencios automáticos (`6 6 — 6 / 5 5 — 5 / 4 4 5 6 / 6 — 6`) | 10 beats sin silencios (`6 6 6 / 5 5 5 / 4 4 5 6`) |

Pendiente: validación visual de Juan + decisión de Fable (aceptar v1 o patch pedagógico).
No bloqueante para el commit de Fase B — es una decisión de contenido, no un bug técnico.

**Componentes de ejercicio en zona alumno (ExerciseEngine / LessonPage — DEV_LEGACY):**

`Ex2NotasAm`, `Ex3NotasEm`, `Ex4CalidadAcorde`, `Ex5Secuencia` — solo en zona alumno, nunca en demo.

---

## Archivos sin commit

Working tree con cambios sin commit (PostHog + Visual C):

**Commit 1 — PostHog analytics:**
| Archivo | Cambio |
|---------|--------|
| `src/app/utils/analytics.ts` | 8 eventos con guard `VITE_POSTHOG_KEY` |
| `src/app/utils/analytics.test.ts` | Tests analytics |
| `src/main.tsx` | Init PostHog (US host default, configurable) |
| `src/vite-env.d.ts` | Tipo `VITE_POSTHOG_HOST` |
| `.env.example` | Placeholder `VITE_POSTHOG_KEY` + `VITE_POSTHOG_HOST` |
| `src/app/App.tsx` | `analytics.semestralCtaClicked()` en `handleSemestralPlanSelect` |
| `src/app/components/music/InteractiveLevelSelector.tsx` | `analytics.demoCtaClicked()` |
| `src/app/pages/DemoLessonPage.tsx` | `analytics.demoLessonCompleted()` + `demoCompleted()` |
| `src/app/pages/InscripcionGatePage.tsx` | `analytics.gateViewed()` + `planSelected()` |
| `src/app/pages/InscripcionRegistroPage.tsx` | `analytics.registroViewed()` + `whatsappCtaClicked()` |
| `package.json` | `posthog-js` instalado |

**Commit 2 — Visual C:**
| Archivo | Cambio |
|---------|--------|
| `src/app/pages/PathDemoPage.tsx` | Elimina `GmusicInternalHeader`; `DemoFinishedCelebration` centrada con animación |
| `src/app/pages/path-demo-page.test.ts` | Tests Visual C |

**Pendiente de resolución (no bloquea demo):**

| Archivo | Problema |
|---------|---------|
| `src/app/data/demo-lessons.ts` (Clase 3) | `videoUrl` duplicado con Clase 2 — `TODO` en código; requiere URL real de video de cuerdas al aire |

---

## Modelo de precios activo

(`subscription-plans.ts`, commit `cf3343c`):

- Tiers: `basico`, `plus` (recomendado), `familiar` (3 perfiles)
- Períodos: `monthly`, `semester` (default UI), `annual`
- 9 `planId`: p. ej. `plus-semester`
- `PRICE_TABLE` CLP completo; ahorro en selector: Semestral 17%, Anual 25% (referencia Plus)

**WHATSAPP_NUMBER:** `56953429676` (formato wa.me correcto, commit `8ca6228`).

---

## Estado del demo — listo para revisión PO

El funnel completo está publicado y validado en browser:

```
Landing → Ver clase gratuita → mi-camino-demo (carrusel Yousician, 4 tabs nav)
  → demo-clase-1..5 (video → ejercicio → éxito)
    → inscripcion-gate (planes 3×3 CLP)
      → inscripcion-registro (WhatsApp bridge)
```

**Caveat explícito:** Clase 3 usa video placeholder (mismo embed que Clase 2). Requiere URL real antes de escalar el funnel a tráfico real.

## Próximo paso operativo

**Condición de desbloqueo para Fase 4:** primera conversión real confirmada vía WhatsApp (`56953429676`).

**Condición de desbloqueo para Fase 4:** primera conversión real confirmada vía WhatsApp (`56953429676`).

Hasta que haya conversión, opciones disponibles:
- Patch pedagógico ExPulsoAire — decidir v1 vs cuerdas alternadas/silencios (validación visual Juan pendiente)
- Fix cosmético Clase 3 video (requiere URL real de Juan)
- PostHog analytics — 8 eventos de funnel (aprobado en principio)

---

## Pendientes documentados (no bloqueantes hoy)

- [ ] Clase 3 video: reemplazar embed duplicado (mismo que Clase 2) por video de cuerdas al aire
- [ ] Patch pedagógico Fase B: cuerdas alternadas en Clase 4, silencios automáticos en Clase 5 (post-validación)
- [ ] PostHog analytics — ~8 eventos de funnel — aprobado en principio, sin prioridad activa
- [ ] Limpieza rutas legacy — post-Fase 4, con plan de migración explícito
- [ ] Fase 4 Auth real — NO iniciar hasta primera conversión WhatsApp confirmada
- [ ] Fase 5 Flow + Resend — NO iniciar hasta Fase 4 completa
