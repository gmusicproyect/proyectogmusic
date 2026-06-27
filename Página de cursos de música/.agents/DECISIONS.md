# Decisions — Gmusic Estudio

Registro oficial de decisiones de producto, pedagogía y arquitectura.

**Protocolo:**
- Cursor lee este archivo antes de tocar código.
- Codex registra aquí decisiones importantes de diseño o arquitectura aprobadas por Claude / Juan.
- ChatGPT / Ser Digital usa este archivo como fuente de contexto cuando Juan lo comparte.
- `.agents/` es la fuente oficial de verdad del proyecto.

---

## Roles y autoridades

| Rol | Responsabilidad |
|-----|----------------|
| **Claude (El Cerebro / Arquitecto)** | Diseña estrategia conceptual, lógica de negocio pesada y estructura pedagógica. No genera código de producción directo. |
| **Codex (El Supervisor / Contexto)** | Mantiene memoria de avance (`AGENTS.md`, `.agents/MEMORY.md`, `.agents/DECISIONS.md`) y valida cumplimiento de specs antes de sincronizar. No interactúa con remoto. |
| **Cursos (El Ejecutante / Cursor)** | Único encargado técnico operativo en la Mac. Escribe y aplica código local. Puede interactuar con remoto solo con autorización explícita de Juan. |
| **Juan** | Product Owner. Autoriza commits, push y decisiones de negocio. Valida visualmente. |
| **ChatGPT / Ser Digital** | Cuestionador de producto y UX. Genera preguntas desde perspectiva de usuario. No decide arquitectura técnica. |

---

## Decisiones de producto — Demo

| ID | Decisión | Fecha | Razón |
|----|----------|-------|-------|
| D-001 | ExPulsoAire usa TAP manual — sin micrófono, sin tempo estricto | Jun 2026 | El demo es funnel de conversión, no evaluación musical. El objetivo es que el alumno avance, no que demuestre precisión. Micrófono = fricción innecesaria en esta fase. |
| D-002 | Micrófono y pitch detection son opcionales y futuros — nunca requisito para completar el demo | Jun 2026 | Complejidad técnica alta (getUserMedia, Pitchy, latencia). Reservado para zona alumno premium post-conversión. |
| D-003 | El demo tiene exactamente **5 clases jugables gratuitas** — no existe sexta clase gratuita ni arco pedagógico jugable más allá de 5. *(Aclarado Jun 2026, ver D-GOV-06:)* las clases **6–15 visibles en carrusel** son **teaser comercial bloqueado** de adquisición, no expansión del arco gratuito ni contenido reproducible. | Jun 2026 | Funnel optimizado: 5 clases completan el arc pedagógico básico (Conoce → Canción) y llevan al gate de inscripción. Teaser visible ≠ clase gratuita. |
| D-004 | Arc pedagógico del demo: Conoce → Afina → Cuerdas → Pulso → Canción | Jun 2026 | Reordenado en Fase A (90883a1). Cada clase tiene prerequisito natural de la anterior. |

---

## Decisiones de producto — Funnel

| ID | Decisión | Fecha | Razón |
|----|----------|-------|-------|
| D-005 | Auth real (Fase 4) NO se inicia hasta al menos 1 conversión real vía WhatsApp | Jun 2026 | Validar conversión primero — invertir en infraestructura de auth antes de saber que el funnel convierte es riesgo innecesario. |
| D-006 | Flow / pagos (Fase 5) NO se inicia hasta que Fase 4 (auth real) esté completa | Jun 2026 | Prerequisito técnico: no se puede crear Subscription sin User real en BD. |
| D-007 | No expandir a canto ni piano todavía | Jun 2026 | Validar primero guitarra. Expansión de instrumentos requiere validación de mercado y contenido independiente. |
| D-008 | No agregar XP / racha / logros todavía | Jun 2026 | Sin zona alumno con auth real, no hay a quién asignar XP. El gamification de la zona pública ya existe vía InscripcionGatePage. |
| D-009 | No rediseñar el funnel ahora | Jun 2026 | El funnel existente es funcional y no ha sido validado en conversión real todavía. Rediseñar antes de datos = desperdicio. |

---

## Decisiones técnicas

| ID | Decisión | Fecha | Razón |
|----|----------|-------|-------|
| D-010 | Frontend NUNCA activa subscripciones — solo backend vía webhook puede hacerlo | — | Seguridad: evitar bypass del flujo de pago desde cliente. |
| D-011 | El cliente nunca recibe `secureAnswer`. El cliente no decide `isCorrect`, XP, racha ni progreso. | — | Seguridad: toda evaluación ocurre en servidor. |
| D-012 | JWT payload usa `userId`, no `email` | — | Seguridad: exponer email en token es innecesario y riesgo de privacidad. |
| D-013 | bcrypt mínimo 10 rounds | — | Seguridad: estándar mínimo aceptable para almacenamiento de contraseñas. |
| D-014 | `passwordHash` nunca expuesto en ninguna respuesta de API | — | Seguridad: dato crítico que nunca sale del servidor. |
| D-015 | `registerService` nunca crea una `Subscription` activa | — | Seguridad: la Subscription solo se activa vía webhook de pago confirmado. |
| D-016 | `StudentZoneGuard` no desbloquea Mi Academia sin pago confirmado | — | Seguridad: no se puede acceder a zona alumno sin Subscription activa. |
| D-017 | `devStudentAuth` está bloqueado en producción — no modificar hasta que `realStudentAuth` esté listo | — | Seguridad: el bypass de dev no puede llegar a producción. |
| D-018 | Routing es string-based en `App.tsx` (`currentPage` state) — no usar React Router | — | Decisión de arquitectura preexistente. Cambiar implicaría refactor mayor sin beneficio claro en esta fase. |

---

## Decisiones de contenido

| ID | Decisión | Fecha | Razón |
|----|----------|-------|-------|
| D-019 | Clase 3 mantiene TODO en videoUrl hasta que Juan / Fable definan el video correcto | Jun 2026 | Clase 2 y Clase 3 comparten el mismo embed de YouTube. No inventar URL. El TODO está en el código como marcador. |
| D-020 | Todos los videos del demo son `isPlaceholderVideo: true` — ninguno es contenido oficial de Gmusic aún | Jun 2026 | Los videos de YouTube son ejemplos temporales. Reemplazar con videos propios antes de escalar el funnel. |

---

## Decisiones de proceso

| ID | Decisión | Fecha | Razón |
|----|----------|-------|-------|
| D-021 | No hacer commit sin autorización explícita de Juan | — | Protocolo establecido desde el inicio del proyecto. Juan es el gatekeeper del historial de git. |
| D-022 | No hacer push a main sin autorización explícita de Juan | — | Idem. Push afecta producción / remoto compartido. |
| D-023 | `.agents/` es la fuente oficial de verdad — Cursor debe leerla antes de cada sesión | Jun 2026 | Protocolo para mantener coherencia entre sesiones y entre herramientas (Fable, Cursor, ChatGPT). |
| D-024 | Post-demo = solicitud de inscripción estructurada + WhatsApp; "reservar lugar" prohibido en copy hasta que exista backend de cupos | Jun 2026 | No hay sistema de reservas. El copy "Reservar mi lugar" y "Tu lugar está reservado" crea expectativa falsa. El flujo es: form (nombre/email/WhatsApp/doc) → mensaje WhatsApp prefilled → equipo confirma acceso manualmente. Dos CTAs diferenciados: inscripción intencional vs. despejar dudas. |
| D-025 | Landing "Semestral" CTA → siempre `inscripcion-gate` (Opción B) — checkout legacy congelado hasta Fase 5 | Jun 2026 | Quien hace clic en "Semestral" ya mostró intención de compra; mandarlos al demo es un desvío. `InscripcionGatePage` mantiene el `LockedGate` si no completó el demo — no hay bypass. Implementado en Fase 3.5b (`handleSemestralPlanSelect` → `setCurrentPage("inscripcion-gate")`). |
| D-026 | PostHog host = `us.i.posthog.com` por defecto; override vía `VITE_POSTHOG_HOST` | Jun 2026 | El proyecto de Juan responde en US (EU devuelve 404 en config.js). El host es configurable para no hardcodear la región en código — si el proyecto migra a EU basta con cambiar la var de entorno. |
| D-027 | **Fase 4+ checkout:** Mercado Pago · form izquierda (nombre completo, username, email, teléfono, país, Chile/Extranjero, RUT solo Chile, contraseña) · orden derecha · extranjero = RUT genérico vía servicio interno boletas · **no implementar** hasta 1ª conversión WhatsApp real confirmada por Juan | Jun 2026 | MVP Track A = WhatsApp bridge + PostHog. Pasarela/SII/auth auto es north star, no scope activo. Handoff: `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md` |
| D-028 | **Carrusel Mi Camino suscriptor:** extender patrón `DemoPathCards` (layout Yousician + Obsidian & Gold) a `GmusicPath.tsx` cuando el path tenga 20+ lecciones (Track B / Fase 4+). Demo 5 clases no usa milestones ni carrusel en suscriptor en Track A | Jun 2026 | Opus revisión demo-path. `GmusicPath.tsx` no se toca en Track A |

---

## Gobernanza y arquitectura

| ID | Decisión | Fecha | Estado | Razón |
|----|----------|-------|--------|-------|
| D-GOV-01 | Para decisiones de **arquitectura y dominio**, la fuente estratégica base es **Context Map v1.1** + **Auditoría READ-ONLY v1.2**, ambos en `docs/architecture/gmusic-architecture-working-map.md`. **Jerarquía documental:** (1) `.agents/DECISIONS.md` aprobado; (2) Context Map v1.1 + Auditoría v1.2; (3) código + tests; (4) `PROJECT_STATUS.md` (operativo, no arquitectura); (5) specs/handoffs vigentes si no contradicen lo anterior; (6) legacy/SUPERSEDED no referencia activa. **Alcance:** gobernanza documental únicamente — no autoriza implementación, reorganización de carpetas, cambios de schema ni nuevas fases. | 15 Jun 2026 | **Aprobada** (Juan) | Unificar criterio entre Claude, Codex, Cursor y Opus antes de evaluar brechas, riesgos y caminos A/B/C. |

---

## Gobernanza y producto — Demo / Funnel

| ID | Decisión | Fecha | Estado | Razón |
|----|----------|-------|--------|-------|
| D-GOV-02 | **URLs funnel demo — destino final:** aprobar mapa canónico `currentPage` → pathname: `onboarding-quiz` → `/quiz-temperamento` *(extensión **D-GOV-10**)*; `mi-camino-demo` → `/mi-camino-demo`; `demo-clase-1` → `/demo-clase-1`; `demo-clase-2` → `/demo-clase-2`; `demo-clase-3` → `/demo-clase-3`; `demo-clase-4` → `/demo-clase-4`; `demo-clase-5` → `/demo-clase-5`; `inscripcion-gate` → `/inscripcion`. Prohibido inventar URLs funnel fuera de esta tabla sin nueva decisión. **Fuera de esta fase:** `inscripcion-registro` (sin URL pública), landing `#academia`, páginas legacy, zona alumno, backend, auth, pagos, schema. **No autoriza:** implementación de sync URL (ver D-GOV-03), React Router global, R-001, R-002. | 18 Jun 2026 | **Aprobada** (Juan) | Habilitar links compartibles del funnel demo alineados con AGENTS.md y producto publicado (Teaser B D-GOV-06, CTA híbrido D-GOV-05). |
| D-GOV-03 | **Fase routing URL — corta, solo funnel demo (Opción A):** implementar sync URL (`pushState` / `replaceState` / `popstate` / carga inicial) **únicamente** para las rutas de D-GOV-02, reutilizando el patrón de `student-zone-routing.ts` + `handlePageChange` en `App.tsx`. Al salir del funnel demo hacia páginas no mapeadas: `replaceState("/")` + `setPage`. Pathnames reconocidos: `/`, `/alumno`, `/mi-camino` (existentes) + rutas D-GOV-02. Pathname desconocido → `home`. **No autoriza:** React Router global, sync URL de legacy, `inscripcion-registro`, landing `#academia`, routing global de todo `currentPage`, cambios en zona alumno salvo no regresión, backend, auth, pagos, schema, R-001, R-002 ni rewrite rules de hosting (documentar aparte en deploy). **Alcance de esta decisión:** autoriza implementación futura; no autoriza código por sí sola. | 18 Jun 2026 | **Aprobada** (Juan) | URLs compartibles con mínimo scope y sin regresión en zona suscriptor. |
| D-GOV-05 | **CTA demo bloqueado — híbrido C (Track A):** **Antes de 5/5:** click en clases bloqueadas **6–15** → panel inline + CTA **“Ver planes”** → sección planes en `home`; click en card **“Más de 60”** → `inscripcion-gate` **solo si `demoFinished`**; si demo incompleto → siguiente clase gratis *(refinamiento T3.5, jun 2026)*. **Después de 5/5:** banner de celebración y FAB **“Inscribirse”** → `inscripcion-gate`; clases **6–15** mantienen panel + **“Ver planes”** (no gate). Gate reservado para mayor intención: card +60 (post-5/5), banner y FAB. Navegación vía `currentPage`; sync URL según **D-GOV-02/03** una vez implementado. No sustituye D-024 ni D-025. **No autoriza:** backend, auth, pagos, schema, R-001, R-002. | 16 Jun 2026 | **Aprobada** (Juan) | Separa exploración (planes) de conversión (gate); coherente con funnel Track A. |
| D-GOV-06 | **Teaser B (Track A):** demo público con **5 clases jugables gratuitas** (1–5), **10 clases bloqueadas visibles** en carrusel (6–15, sin contenido jugable), **1 card final “Más de 60”** (resume 16–75), **catálogo interno de 75** lecciones y **carrusel visible de 15 nodos de lección + 1 nodo academy teaser**. **D-003 se mantiene** en espíritu (ver fila D-003). Títulos 6–15 son placeholder hasta **D-GOV-04**. **No autoriza:** auth real, pagos, backend, schema, routing URL, R-001, R-002 ni contenido pedagógico definitivo 6–75. | 16 Jun 2026 | **Aprobada** (Juan) | Opción B vs 75 candados (Opus). Reduce fricción pre-CTA; formaliza contrato de producto antes de commit del paquete demo-path. |

---

## Gobernanza — Stack técnico / Lecciones

| ID | Decisión | Fecha | Estado | Razón |
|----|----------|-------|--------|-------|
| D-GOV-07 | **Integración alphaTab para lecciones interactivas:** renderizar archivos Guitar Pro (.gp/.gpx) en browser vía `@coderline/alphatab` (tablatura animada + alphaSynth). Flujo: JP exporta desde Guitar Pro 8 → sube a Sanity → alphaTab en lección. **Scope:** nivel intermedio únicamente (módulos 7, 9, 10). **No autoriza:** audio recognition, MIDI físico, nivel básico, implementación antes de alumnos en intermedio. Ejercicios básicos interactivos (diagramas, quiz, mástil) = React + Tone.js, sin D-GOV extra. **Doc completo:** `docs/architecture/D-GOV-07-alphatab.md`. **No afecta:** server/, prisma/, auth, pagos, R-001, R-002. | 20 Jun 2026 | **Propuesta — pendiente aprobación** | Registrar evaluación técnica sin implementar. Criterios de aprobación: D-GOV-04 resuelta, ≥1 alumno real en básico, bundle 500KB optimizado, prueba aislada de alphaTab. |
| D-GOV-14 | **Cablear práctica real en Mi Camino (LessonRunner → GmusicPath):** cerrar el loop alumno suscriptor: iniciar sesión → practicar → `POST /complete` → XP/racha visibles. **Gate:** T3/T3.5 E2E cerrado (Juan). **Fase A (obligatoria):** tras `POST /lesson-sessions` success, `GmusicPath` renderiza `LessonRunnerShell` (fullscreen o overlay); cliente `completeLessonSession` + hook que al `status === finished` envía `attemptsDraft`; pantalla éxito con `xpEarned` / `currentStreak`; refresco `usePath` / dashboard. MCQ para tipos ya parseados (`IDENTIFY_NOTE`, `EAR_TRAINING`, `CHORD_SHAPE`, `RHYTHM_TAP` seed actual = MCQ + `patternBeats`). **Fase B (mismo ticket, scope acotado):** `RHYTHM_TAP` con `tapSequence` en `contentPayload` → componente `ExPulsoAire` adaptado; al completar secuencia enviar `selectedAnswer` = `submissionOptionId` (sin `secureAnswer` en cliente); seed nodo pulso alineado a demo clase 4 (D-001: TAP manual, sin micrófono). P-005 no bloquea Fase B. **No autoriza:** alphaTab, Tone.js, micrófono, `CHORD_SHAPE` mástil, T4, D-GOV-11, cambios funnel demo. **QA Fase A:** alumno T1 → nodo disponible → sesión → MCQ → complete → XP en UI. **QA Fase B:** mismo flujo con TAP en nodo pulso. Estimación: Fase A 1–2 días; Fase B +2–3 días post-T3. | 24 Jun 2026 | **Aprobada** (Juan) | Implementar post cierre T3/T3.5 E2E. Fase A primero (loop MCQ + `/complete`); Fase B extiende payload TAP. |

---

## Gobernanza — UX / Landing

| ID | Decisión | Fecha | Estado | Razón |
|----|----------|-------|--------|-------|
| D-GOV-08 | **Landing condicional según estado del alumno:** la landing (`GmusicLanding.tsx` + `PlanesSection.tsx`) muestra contenido distinto según sesión **sin redirección automática** — URL sigue siendo `/`. **Sin sesión:** landing completa (Hero, Academia, Comunidad, Planes, Contacto). **Demo (registro, sin pago):** landing completa; PlanesSection con plan actual + CTA continuar inscripción. **Pagante:** Hero personalizado (“Bienvenido de vuelta, [nombre]”); Academia + Comunidad + Contacto; PlanesSection oculta → CTA “Ir a Mi Camino →”. **Dependencias:** `session.status`, `StudentZoneGuard`; estado pagante requiere **R-002** resuelto. **Doc completo:** `docs/architecture/D-GOV-08-landing-condicional.md`. **No autoriza:** implementación hasta R-002 + ≥1 alumno pagante + diseño Hero aprobado. **No afecta:** server/, prisma/, auth, pagos. | 20 Jun 2026 | **Propuesta — pendiente aprobación** | Registrar UX futura para alumnos reales pagantes sin redirección forzada. |
| D-GOV-09 | **Energía Géminis — principios UX (sin cambio de stack):** adoptar dinamismo, adaptabilidad y fluidez como estándar de experiencia. **UX camaleónica:** microinteracciones y ritmo visual según `calculated_temperament` (ej. recompensas rápidas Sanguíneo; estructura clara Melancólico). **Velocidad percibida:** optimizar SPA actual (routing cliente, View Transitions API donde aplique, carga diferida) — no SSR masivo ni migración a Next.js/SvelteKit en Track A. **Wasm (futuro):** cálculos pesados (audio, partituras) vía WebAssembly en Web Workers, sin bloquear React. **A11y:** WCAG 2.2+ — teclado, contraste obsidiana/oro, ARIA en componentes interactivos. **No autoriza:** rewrite a Next.js, PWA offline completa, Wasm en producción, ni cambios de schema. **Stack vigente:** Vite + React SPA + Express + Prisma (D-018). | Jun 2026 | **Aprobada** (Juan + Tech Lead) | North star UX 2026 alineado a momentum actual; descartar migración de framework por costo vs valor inmediato. |
| D-GOV-10 | **Ruta pública `/quiz-temperamento` y gating del quiz anónimo (extensión D-GOV-02/03):** `onboarding-quiz` → `/quiz-temperamento`; refresh SPA vía rewrite Vercel; CTAs Academia e `InteractiveLevelSelector` enrutan al quiz si `shouldShowTemperamentQuiz({ isSubscribedStudent: false })`; alumno autenticado redirige a `mi-estudio`. **No autoriza:** UI adaptativa completa por temperamento (Ticket 4), cambios de pricing, auth, pagos, rediseño del funnel, schema ni nuevas rutas fuera del mapa D-GOV-02. | Jun 2026 | **Aprobada** (Juan) | Acceso directo al quiz en producción; alinea embudo anónimo con captura T3 sin ampliar scope a Ticket 4. |
| D-GOV-11 | **Regla de acceso — demo gratis requiere cuenta:** el visitante anónimo no entra a quiz + demo sin crear acceso/cuenta. Implementado vía `DemoAuthGuard`, `registro-cuenta`, auth JWT (`registered_no_sub` → demo). Copy guía: *«Crea tu acceso gratis y guarda tu avance.»* Prohibido antes del demo: «Paga», «Compra», «Inscríbete al plan». **Reglas:** lead/cuenta registrada persiste en backend; `localStorage` solo estado temporal de sesión/dispositivo. **Doc:** `docs/architecture/D-GOV-11-acceso-gratis-pre-demo.md`. **Separada de D-GOV-15** (experiencia/onboarding visual). | Jun 2026 | **Aprobada / cerrada** (Juan, 27 Jun 2026) | Regla de acceso: quién puede entrar al demo. Evidencia: PR2 auth gate + `dd7c11e`, `5c46ec1`. |
| D-GOV-12 | **Adopción ECC curada (no plugin completo):** integrar solo patrones ECC que complementan Gmusic — verificación (`gmusic-verification`), CI/deploy (`gmusic-ci-deploy`), handoff (`gmusic-session-handoff`), `npm run verify`, workflow CI, `agent-status.sh`. **No autoriza:** instalar `ecc@ecc` / `ecc-universal` entero, catálogo 260+ skills, Hermes, ecc2 daemon, skills ajenos al dominio, ni reglas ECC que contradigan DECISIONS. **Doc:** `docs/agents/ecc-adoption.md`. | Jun 2026 | **Aprobada** (Juan) | Mejorar harness de agentes sin diluir gobernanza Gmusic ni tickets T3/T3.5/T4. |
| D-GOV-13 | **Inspiración freeCodeCamp (referencia pedagógica, no fork):** FCC aporta patrones de currículo versionado, validación de contenido, seeds e2e y separación contenido/runtime/API. **Responsabilidad:** escalar lecciones 6–75 y motor de ejercicios post-gates; **no** funnel T3, stack, auth, pagos ni Track B app. **No autoriza:** implementación hasta T3/T3.5 E2E cerrado + ticket explícito (FCC-A2…A6). **Doc:** `docs/agents/fcc-inspiration.md`. | Jun 2026 | **Propuesta — pendiente aprobación** (Juan) | Referencia clara sin scope creep; calendario de cuándo FCC aporta vs cuándo está bloqueado. |
| D-GOV-15 | **Experiencia/onboarding — landing separada del selector académico (T4A):** la landing (`#academia` en home anónimo) **no** muestra wizard instrumento/nivel ni CTAs de clase gratis. Muestra bienvenida emocional + CTA **«Crear acceso gratis»** → `registro-cuenta`. Flujo post-registro: registro-exito → quiz → **selección instrumento → selección nivel** → CTA **«Iniciar mis clases gratis»** (solo Fundamento Básico / `isFreeClassTrack`) → `mi-camino-demo`. Rutas no implementadas: **«Próximamente»** / **«Disponible en el camino completo»**. **Complementa D-GOV-11 (no fusionar).** **Doc:** `docs/architecture/D-GOV-15-landing-academia-separada.md`. **No autoriza implementación** hasta gates T4A (Render + smoke auth + QA registro prod + brief Opus). | 27 Jun 2026 | **Aprobada — pendiente implementación** (Juan, 27 Jun 2026) | Regla de experiencia: cómo se presenta el camino. D-GOV-11 = quién entra; D-GOV-15 = cómo se ve el embudo. |

---

## Riesgos operativos

| ID | Riesgo | Estado | Mitigación |
|----|--------|--------|------------|
| R-OPS-01 | **Supabase DB creada manualmente; `prisma migrate deploy` bloqueado por P3005.** Migraciones futuras no son reproducibles vía Prisma CI hasta baseline. | **Activo** | Aplicar SQL idempotente en `scripts/` para cambios prod (ej. `supabase-t3-lead-email.sql`). **Baseline obligatorio** antes de Fase 4 / auth / pagos / nuevas migraciones críticas. Ver [Prisma baselining](https://www.prisma.io/docs/guides/migrate/developing-with-prisma-migrate/baselining). |

---

## Decisiones de marca

| ID | Decisión | Fecha | Estado | Razón |
|----|----------|-------|--------|-------|
| D-BRAND-01 | **Emoción de marca Gmusic:** "El deseo de tocar se convierte en ruta clara, acompañada y posible." **Doc completo:** `docs/brand/emocion-de-marca.md`. | 20 Jun 2026 | **Aprobada** (Juan) | Fuente oficial de emoción de marca para copy, diseño, demo, marketing y WhatsApp. |
| D-BRAND-02 | **Pantalla de celebración de meta:** overlay con música Musicful (autoplay, sin reproductor visible), estética Obsidiana & Oro, CTAs "Continuar al Mundo X" y "Ver mi progreso". **Doc completo:** `docs/brand/celebracion-meta.md`. | 21 Jun 2026 | **Aprobada** (Juan) | Celebra logros del alumno; refuerza D-BRAND-01 ("el deseo se convierte en realidad"). |

---

## Pendientes de decisión

| ID | Pregunta abierta | Quién decide |
|----|-----------------|--------------|
| P-002 | ¿Cuál es el video correcto para Clase 3 (cuerdas al aire)? | Juan |
| P-003 | ¿PostHog analytics como próxima mini-fase después de Fase B validada? | Juan |
| ~~P-004~~ | ~~Fase 3.5b: ¿Autorizar redirección handleSemestralPlanSelect post-auditoría?~~ | ✅ Cerrado — implementado Jun 2026 (D-025 Opción B) |
| P-005 | ¿Patch pedagógico ExPulsoAire? Clase 4: cuerdas alternadas 6/5/4 vs solo cuerda 6. Clase 5: 15 beats con silencios vs 10 sin silencios. | Juan |
| D-GOV-04 | Pedagogía 6–75: ¿skill-graph guitarra (YAML) antes de títulos reales 6–15? | Juan |
| ~~D-GOV-11~~ | ~~¿Acceso gratis obligatorio antes de quiz + demo?~~ | ✅ Cerrada 27 Jun 2026 — regla de acceso (PR2 auth + DemoAuthGuard) |
| D-GOV-13 | ¿Aprobar referencia FCC-inspiration y calendario FCC-A2…A6 post-T3? | Juan |
| ~~D-GOV-15~~ | ~~¿Separar landing pública del wizard Academia (T4A)?~~ | ✅ Aprobada 27 Jun 2026 — dirección producto; **implementación bloqueada** (gates T4A) |
| ~~D-GOV-14~~ | ~~¿Aprobar ticket LessonRunner → GmusicPath (Fase A + Fase B TAP)?~~ | ✅ Aprobado 24 Jun 2026 (Juan) — **Fase A CERRADA** · **Fase B desbloqueada** |

---

## Cierre operativo — T3 / T3.5 (Track A)

| Ticket | Estado | Fecha | Evidencia |
|--------|--------|-------|-----------|
| **T3** | **CERRADO** | 24 Jun 2026 | Email `test-t3-20260624c@gmusic.com` · WhatsApp OK · Supabase OK (`session_id` `da224c05-5c73-4467-a7d4-5188831afafd`, `plus-semester`) · PostHog OK (eventos cableados desde `900f1f4`) · fixes `410cf00`, `fb92675` |
| **T3.5** | **CERRADO** | 24 Jun 2026 | Reset funnel post-lead · commit base `900f1f4` |
| **T4** | **NO INICIADO** | — | Gate Fase A levantado (24 Jun 2026) · pendiente ticket explícito |
| **T4A** | **BLOQUEADO** | — | D-GOV-15 aprobada (27 Jun 2026) · **gates:** Render deploy OK · smoke auth OK · QA registro prod incógnito OK · brief Opus · luego Cursor |

Commits T3 relevantes: `900f1f4` (FormData + link-lead), `410cf00` (autofill WhatsApp), `fb92675` (API Vercel→Render + quiz sync).

### Cierre D-GOV-14 Fase A (24 Jun 2026)

**D-GOV-14 FASE A CERRADA · 24 Jun 2026 · OK XP · OK racha · OK path refresh**

| Check | Resultado |
|-------|-----------|
| Deploy prod | `2e7358c` — bundle Vercel incluye `Práctica completada` |
| QA T1 loop | Suscriptor dev → `POST /lesson-sessions` → MCQ → `POST /complete` → **+100 XP · racha 1 · 100% precisión** → path `completed` 0→1, nodo activo `Primer acorde Am` |
| Prod `/mi-camino` | Redirige sin sesión suscriptor real (esperado: D-017 `devStudentAuth` off en prod) |

Commits: `2e7358c` (Fase A implementación).

| Área | Entrega |
|------|---------|
| Cliente API | `completeLessonSession` → `POST /lesson-sessions/:id/complete` |
| Mi Camino | `GmusicPath` → `PathLessonRunner` fullscreen tras sesión creada |
| Loop MCQ | `LessonRunnerShell` → complete → pantalla XP/racha/precisión |
| Refresco | `path.retry()` al cerrar runner y tras complete exitoso |

**Fase B — DESBLOQUEADA:** `ExPulsoAire` + `tapSequence` para `RHYTHM_TAP` con payload extendido.

### Cierre D-GOV-14 Fase B (24 Jun 2026)

**D-GOV-14 FASE B CERRADA · 24 Jun 2026 · OK TAP · OK complete · OK XP**

| Check | Resultado |
|-------|-----------|
| Parser | `RHYTHM_TAP` + `tapSequence` + `submissionOptionId` → `interaction.mode: tap` |
| UI | `RhythmTapExercise` → `ExPulsoAire` en `LessonRunnerShell` (sin botón Siguiente en TAP) |
| Reducer | `COMPLETE_TAP` → `selectedAnswer` = `submissionOptionId` |
| Seed | Nodo **Escucha el pulso** ej.1 = 8× cuerda 6 (demo clase 4) · `secureAnswer: tap-complete` |
| Tests app | **414/414** verdes (`npm run app:test`) |
| QA T1 TAP | `lesson-sessions` → payload público con `tapSequence` (sin `secureAnswer`) → `complete` con `tap-complete` → **+100 XP · racha 1** |

| Área | Entrega |
|------|---------|
| Tipos | `ParsedExerciseInteraction` (`mcq` \| `tap`) en `lesson-runner-types.ts` |
| Parser | `parseTapSequence` / `parseTapInteraction` en `parse-exercise-payload.ts` |
| Runner | `RhythmTapExercise.tsx` + wiring `LessonRunnerShell` + `completeTap()` en hook |
| Seed | `prisma/seed.ts` nodo pulso alineado demo clase 4 |

**D-GOV-14 COMPLETO** — Fase A (MCQ loop) + Fase B (TAP manual D-001) cerrados.

---

## D-PROD-01 — Onboarding con detección de temperamento
- **Fecha:** 2026-06-22
- **Estado:** Aprobado
- **Área:** Producto / Onboarding
### Decisión
Implementar un quiz de 6 preguntas situacionales antes del demo de 5 clases gratuitas para detectar el temperamento predominante del alumno (sanguíneo, colérico, melancólico, flemático).
### Propósito
Recolección de datos para segmentación conductual. No se usa para personalización inmediata — los datos se correlacionan con comportamiento real a 6-12 meses para predecir abandono y adaptar mensajes.
### Implementación
- 6 preguntas situacionales en español chileno
- Telemetría: tiempo por pregunta, cambios de respuesta, duración total
- Algoritmo simple: temperamento con más respuestas = tag asignado
- Tabla PostgreSQL: `onboarding_analytics`
- Ver spec completo: `docs/product/quiz-temperamento.md`
- Ver schema: `docs/architecture/onboarding-analytics.sql`
- Ver queries: `docs/product/query-validacion-temperamento.sql`
### Hipótesis principal
Sanguíneo será el temperamento dominante (mayor volumen de registros, mayor riesgo de abandono semana 1-2). Flemático será el segundo con mayor retención y LTV.
### Plan de validación
- Correr query de validación al llegar a 100 usuarios
- Ver `docs/product/query-validacion-temperamento.sql`
---
## D-PROD-02 — Rediseño del demo priorizando perfil Sanguíneo
- **Fecha:** 2026-06-22
- **Estado:** Aprobado
- **Área:** Producto / Demo
### Decisión
Rediseñar el orden y estructura de las 5 clases gratis para entregar una victoria musical en los primeros 7 minutos, optimizado para el temperamento Sanguíneo que será el perfil dominante.
### Problema detectado
El demo estructurado de forma tradicional (Introducción → Anatomía → Ejercicios → Melodía) es un repelente de Sanguíneos. Para la clase 3 su cerebro asocia la plataforma con "tarea escolar" y abandona.
### Cambios requeridos
**1. Orden inverso del demo:**
- Antes: Clase 1 = "Postura y partes de la guitarra"
- Ahora: Clase 1 = "Toca tu primer clásico del rock en 5 minutos" (usando 2 dedos o 1 acorde simplificado)
**2. Micro-progreso visual al terminar Clase 1:**
- Modal de celebración usando tokens CSS del design system (dorado sobre oscuro)
- Copy: "¡Nivel 1 Desbloqueado! Ya manejas el 20% del tema. Estás a 4 clases de tocarlo completo."
- Ver D-BRAND-02 para referencia de pantalla de celebración
**3. CTA diferenciado para Sanguíneo detectado:**
- Al terminar Clase 2, si `calculated_temperament = 'sanguine'`:
- CTA directo a WhatsApp: "¡Buena! Te salió increíble. Escríbenos aquí para mandarte la pista de fondo oficial y tocar con una banda real de fondo hoy mismo."
### Dependencias
- D-PROD-01 (quiz de temperamento debe estar implementado primero)
- D-BRAND-02 (pantalla de celebración)
---
## D-PROD-03 — Gobernanza del Comportamiento y Reengagement
- **Fecha:** 2026-06-22
- **Estado:** Aprobado
- **Área:** Producto / Retención
### Contexto
Necesitamos monitorear el comportamiento del usuario y su riesgo de abandono (basado en el temperamento calculado) sin sobreingeniería inicial.
### Decisión
Implementar un modelo de gobernanza híbrido (Humano-Agente) con una ruta de maduración en dos fases.
* **Fase 1 (Manual - Primeros 100 usuarios):** Un script en Node.js detecta desviaciones en PostgreSQL (abandono temprano). El sistema alerta al fundador. La acción de reengagement se realiza enviando manualmente plantillas de WhatsApp personalizadas por temperamento.
* **Fase 2 (Automatizada - Escala):** Un webhook conectado a la API de WhatsApp Business inyectará mensajes de reengagement asíncronos directamente cuando los eventos del backend detecten riesgo.
