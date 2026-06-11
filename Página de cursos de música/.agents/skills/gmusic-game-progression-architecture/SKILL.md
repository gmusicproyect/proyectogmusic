---
name: gmusic-game-progression-architecture
description: >-
  Arquitectura de progresión y conversión de Gmusic: demo funnel 5 clases,
  matrix Academia 3×3, funnel Semestral lineal, estados de bloqueo WCAG AA y
  semántica de juego premium. Usar cuando la tarea toque niveles, XP, funnel
  público, demo flow, suscripción, Academia o cards bloqueadas.
---

# Gmusic Game Progression Architecture

Usar este skill cuando la tarea toque **mecánicas de juego**, **progresión**, **funnel de conversión**, **demo flow**, **matriz de niveles** o **estados bloqueados** — no para CSS/VFX (ver `gmusic-visual-vfx`) ni layout base (ver `gmusic-welcome` / `DESIGN.md`).

Para el detalle del funnel público (rutas, localStorage, CTA, InscripcionGate), leer también `gmusic-funnel-conversion`.

## Fuentes locales obligatorias

1. `AGENTS.md`
2. `DESIGN.md`
3. `src/app/utils/academia-track-matrix.ts`
4. `src/app/utils/public-subscription-flow.ts`
5. `src/app/App.tsx` (funnel y red de seguridad pública)
6. `src/app/data/demo-lessons.ts` (configuración de las 5 clases del demo)
7. `src/app/data/subscription-plans.ts` (3 planes con flowPlanId)

Complemento visual/gamificado: skill `gmusic-edu-gamified-design`.

---

## Flujo de conversión canónico (actualizado Fase 3)

El flujo principal de conversión de visitante anónimo a alumno suscrito es:

```
GmusicLanding (home)
  └── AcademiaSection [CTA dinámico — useDemoUserState]
        └── mi-camino-demo → PathDemoPage (5 nodos serpentinos)
              └── demo-clase-1..5 → DemoLessonPage
                    └── [clase 5 completa] → inscripcion-gate → InscripcionGatePage
                          └── selector de planes → inscripcion-registro
                                └── [Fase 4] auth + registro → mi-estudio
                                      └── [Fase 5] pago Flow + email Resend
```

Estado del demo: localStorage `gmusic:demo_v1 = { completed: number[] }`.
Plan elegido: localStorage `gmusic:selected_plan_v1 = { planId: "plus-semester" }` (formato `{tier}-{period}`).

**Ruta legacy paralela (suscripción directa sin demo):**
```
PlanesSection → handleSemestralPlanSelect → AuthModal → CheckoutPage → mi-estudio
```

**Clase pública legacy (aún activa, no es el camino principal):**
- Ruta: `fundamento-free-lesson` → `FreeFundamentoLessonPage`
- Red de seguridad: `isPublicFreeLessonPage()` cubre alias
- Esta ruta NO es el embudo principal — el embudo principal es el demo de 5 clases

---

## Matriz reactiva Academia 3×3

Fuente: `academia-track-matrix.ts`

**Ejes:**

| Eje | Valores | UI pública |
|-----|---------|------------|
| **Nivel (tier)** | `basico`, `intermedio`, `avanzado` | Selectores: `Nivel 1 · Básico`, `Nivel 2 · Intermedio`, `Nivel 3 · Avanzado` |
| **Enfoque (focus)** | `fundamento`, `tecnica`, `crea` | Tres tarjetas por nivel activo |

**Reglas de producto:**

- Exactamente **9 combinaciones** tier × focus; títulos compuestos (`Fundamento Básico`, etc.).
- Solo **`basico` + `fundamento`** abre la clase gratuita pública (`fundamento-free-lesson`).
- El resto de celdas son preview/comercial; no inventar progreso, XP ni racha en landing.
- No usar rutas legacy (`probar`, `fundamento-preview` como destino principal, `LessonRunnerShell` en anónimo).

**Componentes cableados:**

- `InteractiveLevelSelector.tsx` — selector 3×3
- `HeroSection.tsx` / `PlanesSection.tsx` — CTAs al funnel
- `fundamento-funnel.test.ts` — contratos de la matriz

---

## Funnel de conversión lineal (Semestral — ruta directa legacy)

Fuente: `public-subscription-flow.ts` + `App.tsx`

Flujo obligatorio y secuencial:

```
Plan Semestral (PlanesSection)
  → AuthModal (tab register)
  → CheckoutPage (SEMESTRAL_CHECKOUT_COURSE)
  → mi-estudio (zona alumno)
```

**Reglas:**

- `handleSemestralPlanSelect` activa `pendingSemestralCheckout` y abre registro.
- `handleAuthSuccess` con checkout pendiente navega a `checkout`, no a curso legacy.
- `handleCheckoutSuccess` lleva a `mi-estudio`, no a `course-detail`.
- Mensual/Anual: no seleccionables en esta fase (placeholders visuales).
- Navbar público: `onSignIn` / `onRegister` activos; sin acceso directo a Mi Estudio anónimo.

---

## Semántica de bloqueo (WCAG AA)

El bloqueo se comunica por **diseño y copy**, no rompiendo el componente.

**LockedFeatureCard / nav bloqueada:**

- Tokens: `--dash-surface-locked`, `--dash-locked-text` (#7a7a7a), `--dash-locked-text-muted` (#555555).
- Texto principal legible a **14px** sobre `#0d0d0d`.
- Candado Lucide: `strokeWidth={1.5}`, `currentColor`, tono muted semántico.
- **Prohibido:** `opacity: 0.6` o `pointer-events: none` en el contenedor global de la card.
- Copy de plan completo: `"Disponible en el plan completo"` (`LOCKED_NAV_MODAL` en header interno).

**Mi Estudio — features futuras:**

- Desafío del Día y Laboratorio: bloqueados con badge "Próximamente", no rutas fantasma.
- Mi Progreso / Comunidad: modal placeholder, no páginas legacy.

---

## Progresión en zona alumno (estado actual)

| Capa | Estado | Archivo |
|------|--------|---------|
| Dashboard | API mock vía `useDashboard` | `GmusicWelcome.tsx` |
| Camino | Ruta serpenteante + sesiones | `GmusicPath.tsx` |
| XP / racha | Métricas visuales; cofre = shell (`WeeklyChestCelebrationShell`) | dashboard/* |
| Cofre semanal | UI shell; lógica de apertura en fase posterior | `WeeklyChestCelebrationShell.tsx` |

No implementar backend real, pagos reales ni Tonal.js salvo fase explícita.

---

## Prohibiciones

- No mezclar funnel público con componentes legacy del dev funnel.
- No usar verde `--edu-success` como marca global; reservado para acciones de práctica.
- No commit salvo autorización explícita.
- No borrar bloques existentes del dashboard al extender progresión.

---

## QA mínima

1. `npm run app:test` — especialmente `fundamento-funnel.test.ts`, `path-demo-page.test.ts`, `inscripcion-gate.test.ts`, `dashboard-atmosphere.test.ts`.
2. Demo funnel: 5 nodos serpentinos, progresión correcta, inscripcion-gate bloqueada si demo incompleto.
3. Matriz 3×3: 9 celdas; `fundamento-free-lesson` sigue activa como ruta legacy pero no es el CTA principal.
4. Semestral directo: registro → checkout → `/alumno`.
5. Locked cards: contraste AA, sin opacity global en contenedor.
6. Alumno autenticado: CTA de AcademiaSection → "Entrar a mi academia", nunca "Ver clase gratuita".
