# North Star 2027 — Plataforma «Energía Géminis»

**Tipo:** Visión a largo plazo (Estrella Polar)  
**Estado:** Documento de referencia — **no es scope activo**  
**Gobernanza vigente:** `.agents/DECISIONS.md` → **D-GOV-09** (Track A pragmático)  
**Audiencia:** Producto, diseño, ingeniería — cuando haya tracción y presupuesto

> **Regla de lectura:** Este manifiesto **inspira** dirección futura. **No autoriza** migraciones de stack, rewrites ni features listadas aquí mientras Track A (conversión, medición, primer alumno de pago) no esté validado en Chile.

---

## Por qué existe este documento

Gmusic Academy apunta a una plataforma educativa que trascienda el código estático: un ecosistema **vivo**, de naturaleza dual y «Energía Géminis» — dinámico, altamente interactivo y de respuestas inmediatas.

Ese horizonte es real y deseable. Pero ejecutarlo **antes** de medir el embudo, capturar leads y convertir el primer alumno vía WhatsApp sería sobreingeniería clásica. Por eso:

| Capa | Documento | Rol |
|------|-----------|-----|
| **Hoy (Track A)** | D-GOV-09, roadmap T1–T5 | Lo que se construye y despliega |
| **Mañana (2027+)** | Este north star | Lo que se evalúa con tracción y presupuesto |

---

## Mercado y usuario

- **Mercado:** Chile (expansión LATAM posterior).
- **Perfiles:** jóvenes, padres que buscan clases para hijos, adultos que quieren aprender a tocar.
- **Expectativa UX:** la web debe sentirse como compañera de práctica, no como folleto PDF.

---

## 1. UX/UI centrado en el usuario (diseño camaleónico)

### Paleta y atmósfera

- Minimalista, cinematográfica: **obsidiana + oro** (ver `DESIGN.md`).
- Coherencia premium con guitarra y progreso gamificado (sin copiar marcas protegidas tipo Duolingo).

### Adaptabilidad por temperamento

El diseño **muta** según datos de onboarding (`onboarding_analytics.calculated_temperament`):

| Temperamento | Principio UX |
|--------------|--------------|
| **Sanguíneo / Colérico** | Comprimir teoría; victorias rápidas; CTAs inmediatos; ritmo alto |
| **Melancólico / Flemático** | Expandir estructura; mapas conceptuales; ritmo pausado; claridad antes que velocidad |

**Track A (D-GOV-09):** principios aplicables en microinteracciones y copy; **UI camaleónica completa** = Ticket 4+ / post-tracción.

### Microinteracciones con peso físico

- Cada clic, hover y transición con retroalimentación elástica.
- Elementos que simulan física real (ChunkyButton, sombras de volumen — ver skill `gmusic-visual-vfx`).
- Objetivo: el sistema «escucha» al usuario.

---

## 2. Stack tecnológico (modular y escalable) — visión futura

> **Stack vigente hoy:** Vite + React SPA · Express · Prisma · PostgreSQL · Vercel + Render + Supabase (T1). Migración futura a DonWeb + Coolify cuando haya alumnos de pago.

### Core framework (evaluación 2027+)

| Opción | Propósito |
|--------|-----------|
| **Next.js (App Router)** o **SvelteKit** | HTML ultrarrápido desde Edge; RSC donde aplique |
| **Meta LCP** | &lt; 1,5 s en landing y primer paint del funnel |

**No autorizado en Track A** (D-GOV-09): rewrite masivo a Next.js/SvelteKit.

### Aceleración WebAssembly

- JavaScript del navegador **solo para UI**.
- Cálculos pesados (análisis de audio en tiempo real, validación de ejercicios musicales) compilados en **Rust/C++ → Wasm** en Web Workers.
- Sin bloquear el hilo principal de React.

### Edge AI (inteligencia local)

- **WebGPU** + modelos **ONNX** ligeros en cliente.
- Adaptar ritmo de lección en tiempo real según comportamiento del alumno.
- **Privacidad:** procesamiento local; datos sensibles no salen del dispositivo sin consentimiento.

### Resiliencia PWA (offline-first estricto)

- Service Workers avanzados.
- Demo, metrónomos y lecciones cacheadas funcionan con red inestable.
- **Track A:** funnel online primero; PWA completa = fase posterior.

### Web3 invisible (opcional, muy posterior)

- **Account Abstraction (ERC-4337)** para propiedad digital de logros/medallas.
- Contratos inteligentes detrás de login tradicional — **cero fricción** para el alumno chileno medio.
- Solo si hay caso de negocio claro (certificados, coleccionables, B2B).

---

## 3. Accesibilidad y rendimiento (WCAG 2.2+)

Estándares **innegociables** — aplicables **ya** de forma incremental en Track A:

| Requisito | Detalle |
|-----------|---------|
| **Teclado** | Operabilidad total sin ratón (músicos con manos en el instrumento) |
| **Contraste** | Ratio mínimo 4,5:1 en paleta obsidiana/oro, también en variantes dinámicas |
| **Movimiento** | Respeto a `prefers-reduced-motion`; animaciones complejas → fundidos instantáneos |
| **ARIA** | Componentes interactivos del funnel y zona alumno |
| **CI/CD (futuro)** | Bloqueo de merge si regresión a11y crítica |

---

## 4. Mapa de madurez (cuándo considerar cada pilar)

| Pilar | Precondición sugerida | Señal de go |
|-------|----------------------|-------------|
| UI por temperamento (T4) | T2 funnel medible + datos en Postgres | PostHog + `onboarding_analytics` poblado |
| Auth + Mercado Pago (Fase 4) | ≥1 conversión WhatsApp real (D-027) | Juan confirma lead en +56953429676 |
| DonWeb + Coolify | Alumnos de pago recurrentes | Factura única CLP &lt; $15k/mes viable |
| Next.js / RSC | LCP/SEO limitan crecimiento orgánico | Métricas Core Web Vitals en rojo con SPA |
| Wasm / audio | Producto requiere validación pitch en cliente | Spec de ejercicio + prueba de concepto |
| WebGPU / ONNX | Caso pedagógico que JS no aguanta | Prototipo aislado aprobado |
| PWA offline | Alumnos en zonas de mala conectividad | Encuesta o soporte recurrente |
| Web3 / medallas on-chain | Demanda explícita de certificación verificable | Decisión PO + legal |

---

## 5. Relación con decisiones activas

| ID | Relación con este north star |
|----|------------------------------|
| **D-GOV-09** | Adopta principios UX Géminis **sin** cambiar stack Track A |
| **D-GOV-02/03** | Routing funnel SPA actual; no reemplazar por App Router hasta fase explícita |
| **D-027** | Pagos automáticos **después** de conversión WhatsApp real |
| **D-PROD-01** | Quiz temperamento = base de la UX camaleónica |
| **D-026** | PostHog US — medición antes de personalización agresiva |

---

## 6. Track A — orden de ejecución (no negociable hasta señal de mercado)

```
✅ T1 — Deploy + BD (Vercel, Render, Supabase)
✅ T2 — Código PostHog en main
⏳ T2 — Variables PostHog en Vercel + redeploy
⏸ T3 — session_id quiz ↔ email en gate (Postgres)
→ T4 — Demo / copy por temperamento (primer slice camaleónico)
→ T5 — E2E Playwright golden path
→ Fase 4 — Mercado Pago + auth (post WhatsApp real)
→ DonWeb + Coolify (post alumnos de pago)
→ Evaluación north star 2027 (Next, Wasm, WebGPU, PWA, Web3)
```

---

## 7. Anti-patrones (no hacer ahora)

- Reescribir a Next.js «por el manifiesto».
- Introducir Web3, tokens o wallets en el funnel público.
- Implementar Wasm/WebGPU sin ejercicio concreto en producción.
- PWA offline-first antes de cerrar conversión online.
- Mezclar este documento con tickets activos sin nueva decisión en `DECISIONS.md`.

---

## 8. Referencias

| Recurso | Ubicación |
|---------|-----------|
| Gobernanza UX pragmática | `.agents/DECISIONS.md` → D-GOV-09 |
| Diseño visual | `DESIGN.md` |
| Funnel y eventos | `docs/deploy/funnel-events-track-a.md` |
| Handoff Fase 4 / WhatsApp | `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md` |
| Infra futura Chile | Conversación DonWeb 2 vCPU + Coolify (~$7.123 CLP/mes) |

---

*North Star 2027 · Energía Géminis · Gmusic Estudio · Inspiración futura — ejecución gobernada por D-GOV-09*
