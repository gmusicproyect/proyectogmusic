---
name: gmusic-funnel-conversion
description: >-
  Flujo de conversión público de Gmusic: Landing → Demo 5 clases →
  InscripcionGate → Registro → Pago → Mi Estudio. Usar cuando la tarea toque
  rutas del funnel, localStorage del demo, CTA dinámico, InscripcionGate,
  selección de plan o lógica de bloqueo para visitantes.
---

# Gmusic Funnel Conversion

Usar este skill cuando la tarea toque **rutas públicas del funnel, CTA dinámico, demo de 5 clases, puerta de inscripción, planes de suscripción o lógica de bloqueo para visitantes anónimos**.

No es el skill para backend (ver `gmusic-learning-engine`), auth JWT (ver `gmusic-auth-email-verification` cuando exista) ni VFX del dashboard (ver `gmusic-visual-vfx`).

---

## Flujo completo y canónico

```
GmusicLanding (home)
  └── AcademiaSection [CTA dinámico — useDemoUserState]
        └── mi-camino-demo → PathDemoPage
              └── demo-clase-1..5 → DemoLessonPage (video → ejercicio → éxito)
                    └── [clase 5 completa] → inscripcion-gate → InscripcionGatePage
                          ├── [demo incompleto] → LockedGate → mi-camino-demo
                          └── [demo completo] → selector período + tier
                                └── inscripcion-registro → InscripcionRegistroPage
                                      └── [Fase 4] registro real → mi-estudio
```

Flujo alternativo — suscripción directa desde Planes:
```
PlanesSection → handleSemestralPlanSelect → AuthModal → CheckoutPage → mi-estudio
```

---

## Archivos del funnel

| Archivo | Rol |
|---------|-----|
| `src/app/hooks/useDemoUserState.ts` | CTA dinámico según estado del visitante |
| `src/app/hooks/useDemoProgress.ts` | R/W de progreso demo en localStorage |
| `src/app/data/demo-lessons.ts` | Configuración de las 5 clases gratuitas |
| `src/app/data/subscription-plans.ts` | 3 tiers × 3 períodos, `PRICE_TABLE` CLP, 9 `flowPlanIds` |
| `src/app/pages/PathDemoPage.tsx` | Mapa de 5 nodos progresivos |
| `src/app/pages/DemoLessonPage.tsx` | Runner video→ejercicio→éxito |
| `src/app/pages/InscripcionGatePage.tsx` | Toggle período + selector tier (default `semester`/`plus`) |
| `src/app/pages/InscripcionRegistroPage.tsx` | Bridge WhatsApp; muestra tier + período + precios |
| `src/app/components/marketing/sections/AcademiaSection.tsx` | Punto de entrada al demo |
| `src/app/utils/public-home-navigation.ts` | Navegación hacia secciones del home |

---

## localStorage keys

| Clave | Shape | Propietario | Ciclo de vida |
|-------|-------|-------------|---------------|
| `gmusic:demo_v1` | `{ completed: number[] }` | `useDemoProgress` | Antes del registro. Migrar a DB al crear usuario |
| `gmusic:selected_plan_v1` | `{ planId: "basico-monthly" \| "plus-semester" \| … }` (9 combos) | `InscripcionGatePage` | Sesión. Fallback registro: `plus-semester` |

**Regla:** el cliente nunca activa una suscripción directamente. Solo guarda el plan elegido. El backend (Fase 5) activa la suscripción vía webhook de Flow.

---

## CTA dinámico — useDemoUserState

| Estado sesión + progreso demo | Label | Destino |
|-------------------------------|-------|---------|
| `authenticated` | "Entrar a mi academia" | `mi-estudio` |
| `demo_completed` (≥5 clases) | "Inscribirme para continuar" | `inscripcion-gate` |
| `demo_started` (1–4 clases) | "Continuar clase gratuita" | `mi-camino-demo` |
| `anonymous` (0 clases) | "Ver clase gratuita" | `mi-camino-demo` |

---

## Rutas del funnel y exclusiones de Navbar/MusicPlayer

Las siguientes páginas excluyen Navbar y MusicPlayer (son pantallas de inmersión):

- `mi-camino-demo`
- `demo-clase-1` … `demo-clase-5` (regex: `/^demo-clase-[1-5]$/`)
- `inscripcion-gate`
- `inscripcion-registro`

Detección en `App.tsx`:
```typescript
const demoLessonId = (() => {
  const m = /^demo-clase-([1-5])$/.exec(currentPage);
  return m && m[1] ? parseInt(m[1], 10) : null;
})();
```

---

## Regla crítica — alumno suscrito

> Un alumno con suscripción activa nunca debe ver "Ver clase gratuita" como CTA principal.

`useDemoUserState` verifica `sessionStatus === "authenticated"` antes de leer el progreso demo. Si hay sesión activa, devuelve siempre `{ label: "Entrar a mi academia", destination: "mi-estudio" }`.

`InscripcionGatePage` no está protegida por `StudentZoneGuard` (es pública). Sin embargo, si un alumno suscrito llega a ella, el CTA de `AcademiaSection` ya lo habría redirigido a `mi-estudio`.

---

## Regla de InscripcionGate

`InscripcionGatePage` verifica `useDemoProgress().demoFinished`:

- `false` → renderiza `LockedGate` — muestra progreso y botón "Volver a mi camino gratuito"
- `true` → renderiza la puerta completa con celebración + selector de planes

No hay form ni campos en esta página. Solo selección de plan y navegación.

---

## Protecciones — qué NO tocar sin leer este Skill

- **No agregar nuevas rutas públicas** sin actualizar las exclusiones de Navbar/MusicPlayer en `App.tsx`.
- **No cambiar las localStorage keys** sin migrar los lectores (`useDemoProgress`, `InscripcionRegistroPage`) en el mismo PR.
- **No modificar el orden de las 5 clases** sin consultar `demo-lessons.ts` y el contrato de `buildDemoModules` en `PathDemoPage.tsx`.
- **No mostrar "Ver clase gratuita" a alumnos autenticados** — verificar `useDemoUserState`.
- **No activar suscripciones desde el frontend** — solo guardar `planId` en localStorage.

---

## QA mínima del funnel

1. `npm run app:test` — especialmente `fundamento-funnel.test.ts`, `path-demo-page.test.ts`, `inscripcion-gate.test.ts`
2. Visitante anónimo: AcademiaSection muestra "Ver clase gratuita" → navega a mi-camino-demo
3. Demo completo: AcademiaSection muestra "Inscribirme para continuar" → navega a inscripcion-gate con puerta abierta
4. Demo incompleto: inscripcion-gate muestra LockedGate con barra de progreso
5. Alumno autenticado: AcademiaSection muestra "Entrar a mi academia" → no muestra demo CTA
