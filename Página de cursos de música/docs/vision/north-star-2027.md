# Visión Géminis 2027: Arquitectura y Diseño para Gmusic Academy

**Tipo:** Estrella Polar — visión a largo plazo  
**Estado:** Documento de referencia — **no es scope activo de implementación**  
**Entregable formal:** alineado al Google Doc del equipo (Jun 2026)

Este documento establece la «Estrella Polar» arquitectónica y creativa para la evolución de la plataforma educativa. Diseñado para dominar el mercado chileno y conectar tanto con jóvenes de 15 a 25 años como con adultos y padres, el ecosistema trasciende el código estático para convertirse en una entidad viva, dinámica y altamente comunicativa.

---

## 1. UX/UI Centrado en el Usuario (Diseño Camaleónico)

La interfaz es el sistema nervioso del sitio. Todo el diseño visual debe anclarse en una estética premium, cinematográfica y minimalista, utilizando una paleta dominada por tonos **obsidiana** profundo con acentos precisos en **oro puro** para guiar la atención sin generar fatiga visual.

### Adaptabilidad Metabólica

La UI muta según el temperamento del alumno. Para perfiles impulsivos (**Sanguíneos / Coléricos**), la información se comprime priorizando flujos acelerados. Para perfiles analíticos (**Melancólicos / Flemáticos**), se expande revelando mapas conceptuales detallados.

### Microinteracciones Táctiles

Cada interacción emite una retroalimentación elástica y fluida. Los elementos poseen peso físico simulado para confirmar telepáticamente que el sistema está en sincronía con el usuario.

---

## 2. Stack Tecnológico Core y Escalabilidad

Para soportar interactividad extrema sin sacrificar el presupuesto de rendimiento ni la indexación en buscadores:

| Capa Arquitectónica | Tecnología Seleccionada | Justificación Técnica |
| --- | --- | --- |
| **Framework Principal** | Next.js (App Router) o SvelteKit | Uso intensivo de React Server Components (RSC) para entregar HTML ultrarrápido desde el Edge (LCP &lt; 1,5 s). |
| **Interactividad UI** | View Transitions API | Cambios de ruta sin parpadeos, simulando una aplicación nativa a 60 FPS. |
| **Cálculo Intensivo** | WebAssembly (Rust/C++) | Procesamiento de audio en tiempo real y validación de ejercicios musicales en el cliente sin bloquear el hilo de JavaScript. |
| **Inteligencia Local** | Edge AI (WebGPU + ONNX) | Modelos predictivos que ajustan el nivel de las clases analizando el comportamiento sin latencia ni envío de datos sensibles a la nube. |

---

## 3. Resiliencia y Tecnologías Emergentes

### Progressive Web App (Offline-First)

Configuración de Service Workers con estrategias **Stale-While-Revalidate**. El estudiante mantendrá acceso a lecciones críticas y metrónomos incluso si su conexión a internet fluctúa.

### Web3 Invisible (ERC-4337)

Implementación de **Account Abstraction**. El ecosistema de recompensas y certificaciones opera silenciosamente; el usuario inicia sesión con su email tradicional sin lidiar con frases semilla.

---

## 4. Accesibilidad Inquebrantable (WCAG 2.2+)

El pipeline de integración continua (CI/CD) bloqueará cualquier despliegue que incumpla estas métricas:

- **Operabilidad Universal:** Navegación 100 % operable por teclado. Un requisito innegociable para músicos y compositores que interactúan con las manos ocupadas en sus instrumentos.
- **Contraste Dinámico:** Ratio validado de **4,5:1** en todos los estados dinámicos de la interfaz obsidiana/oro.
- **Respeto Cognitivo:** Escucha de `prefers-reduced-motion`. Si el sistema operativo lo solicita, las transiciones fluidas se apagarán para operar con fundidos instantáneos.

---

## Anexo de gobernanza (repositorio)

> **Regla de lectura:** Este manifiesto **inspira** dirección futura. **No autoriza** migraciones de stack ni features listadas aquí mientras Track A no esté validado en Chile. La ejecución diaria la gobierna **D-GOV-09** (`.agents/DECISIONS.md`).

| Capa | Documento | Rol |
| --- | --- | --- |
| **Hoy (Track A)** | D-GOV-09, roadmap T1–T5 | Lo que se construye y despliega |
| **Mañana (2027+)** | Este north star | Lo que se evalúa con tracción y presupuesto |

**Stack vigente hoy:** Vite + React SPA · Express · Prisma · PostgreSQL · Vercel + Render + Supabase. Migración futura a DonWeb + Coolify cuando haya alumnos de pago.

### Track A — orden de ejecución

```
✅ T1 — Deploy + BD
✅ T2 — PostHog en producción
→ T3 — session_id quiz ↔ email en gate (Postgres)
→ T4 — Demo / copy por temperamento
→ T5 — E2E Playwright golden path
→ Fase 4 — Mercado Pago + auth (post WhatsApp real)
→ DonWeb + Coolify (post alumnos de pago)
→ Evaluación north star 2027 (Next, Wasm, WebGPU, PWA, Web3)
```

### Anti-patrones (no hacer ahora)

- Reescribir a Next.js «por el manifiesto».
- Introducir Web3, tokens o wallets en el funnel público.
- Implementar Wasm/WebGPU sin ejercicio concreto en producción.
- PWA offline-first antes de cerrar conversión online.

### Referencias

| Recurso | Ubicación |
| --- | --- |
| Gobernanza UX pragmática | `.agents/DECISIONS.md` → D-GOV-09 |
| Diseño visual | `DESIGN.md` |
| Funnel y eventos | `docs/deploy/funnel-events-track-a.md` |
| Handoff Fase 4 / WhatsApp | `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md` |

---

*North Star 2027 · Energía Géminis · Gmusic Academy · Inspiración futura — ejecución gobernada por D-GOV-09*
