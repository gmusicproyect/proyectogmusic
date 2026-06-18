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
| D-GOV-02 | **URLs funnel demo — destino final:** aprobar mapa canónico `currentPage` → pathname: `mi-camino-demo` → `/mi-camino-demo`; `demo-clase-1` → `/demo-clase-1`; `demo-clase-2` → `/demo-clase-2`; `demo-clase-3` → `/demo-clase-3`; `demo-clase-4` → `/demo-clase-4`; `demo-clase-5` → `/demo-clase-5`; `inscripcion-gate` → `/inscripcion`. Prohibido inventar URLs funnel fuera de esta tabla sin nueva decisión. **Fuera de esta fase:** `inscripcion-registro` (sin URL pública), landing `#academia`, páginas legacy, zona alumno, backend, auth, pagos, schema. **No autoriza:** implementación de sync URL (ver D-GOV-03), React Router global, R-001, R-002. | 18 Jun 2026 | **Aprobada** (Juan) | Habilitar links compartibles del funnel demo alineados con AGENTS.md y producto publicado (Teaser B D-GOV-06, CTA híbrido D-GOV-05). |
| D-GOV-03 | **Fase routing URL — corta, solo funnel demo (Opción A):** implementar sync URL (`pushState` / `replaceState` / `popstate` / carga inicial) **únicamente** para las rutas de D-GOV-02, reutilizando el patrón de `student-zone-routing.ts` + `handlePageChange` en `App.tsx`. Al salir del funnel demo hacia páginas no mapeadas: `replaceState("/")` + `setPage`. Pathnames reconocidos: `/`, `/alumno`, `/mi-camino` (existentes) + rutas D-GOV-02. Pathname desconocido → `home`. **No autoriza:** React Router global, sync URL de legacy, `inscripcion-registro`, landing `#academia`, routing global de todo `currentPage`, cambios en zona alumno salvo no regresión, backend, auth, pagos, schema, R-001, R-002 ni rewrite rules de hosting (documentar aparte en deploy). **Alcance de esta decisión:** autoriza implementación futura; no autoriza código por sí sola. | 18 Jun 2026 | **Aprobada** (Juan) | URLs compartibles con mínimo scope y sin regresión en zona suscriptor. |
| D-GOV-05 | **CTA demo bloqueado — híbrido C (Track A):** **Antes de 5/5:** click en clases bloqueadas **6–15** → panel inline + CTA **“Ver planes”** → sección planes en `home`; click en card **“Más de 60”** → `inscripcion-gate`. **Después de 5/5:** banner de celebración y FAB **“Inscribirse”** → `inscripcion-gate`; clases **6–15** mantienen panel + **“Ver planes”** (no gate). Gate reservado para mayor intención: card +60, banner y FAB. Navegación vía `currentPage`; sync URL según **D-GOV-02/03** una vez implementado. No sustituye D-024 ni D-025. **No autoriza:** backend, auth, pagos, schema, R-001, R-002. | 16 Jun 2026 | **Aprobada** (Juan) | Separa exploración (planes) de conversión (gate); coherente con funnel Track A. |
| D-GOV-06 | **Teaser B (Track A):** demo público con **5 clases jugables gratuitas** (1–5), **10 clases bloqueadas visibles** en carrusel (6–15, sin contenido jugable), **1 card final “Más de 60”** (resume 16–75), **catálogo interno de 75** lecciones y **carrusel visible de 15 nodos de lección + 1 nodo academy teaser**. **D-003 se mantiene** en espíritu (ver fila D-003). Títulos 6–15 son placeholder hasta **D-GOV-04**. **No autoriza:** auth real, pagos, backend, schema, routing URL, R-001, R-002 ni contenido pedagógico definitivo 6–75. | 16 Jun 2026 | **Aprobada** (Juan) | Opción B vs 75 candados (Opus). Reduce fricción pre-CTA; formaliza contrato de producto antes de commit del paquete demo-path. |

---

## Pendientes de decisión

| ID | Pregunta abierta | Quién decide |
|----|-----------------|--------------|
| P-002 | ¿Cuál es el video correcto para Clase 3 (cuerdas al aire)? | Juan |
| P-003 | ¿PostHog analytics como próxima mini-fase después de Fase B validada? | Juan |
| ~~P-004~~ | ~~Fase 3.5b: ¿Autorizar redirección handleSemestralPlanSelect post-auditoría?~~ | ✅ Cerrado — implementado Jun 2026 (D-025 Opción B) |
| P-005 | ¿Patch pedagógico ExPulsoAire? Clase 4: cuerdas alternadas 6/5/4 vs solo cuerda 6. Clase 5: 15 beats con silencios vs 10 sin silencios. | Juan |
| D-GOV-04 | Pedagogía 6–75: ¿skill-graph guitarra (YAML) antes de títulos reales 6–15? | Juan |
