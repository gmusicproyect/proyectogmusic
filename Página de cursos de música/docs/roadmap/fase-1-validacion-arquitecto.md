# Validación arquitecto — Fase 1 (documental)

> **Fecha:** 2026-07-14  
> **Rol:** validación documental previa a `01-mvp-gmusic.md` (no rediseño de producto).  
> **Fuentes:** `fase-1-instruccion.md` · `00-inventario-actual.md` · autorización Juan vía supervisor GPT (decisiones A–D) · verificación rápida de routing en código.  
> **Código de app:** solo lectura · **cero** implementación.

---

## 1. ¿Permite redactar `01-mvp-gmusic.md` sin ambigüedad?

**Sí — con ajustes menores a la instrucción** (aplicados en la misma pasada).

| Antes | Después |
|-------|---------|
| Preguntas 1–9 abiertas en la instrucción | Cerradas por decisiones **A–D** (D-ROAD-005) |
| Matriz proponía Mi Progreso OUT/SHOULD y Comunidad como pregunta | Matriz anclada a A–D |
| Auth “pendiente Juan” (D-ROAD-002) | Auth canónica: JWT liviana IN · email verify WON'T |

Tras esos ajustes, el outline de la instrucción + A–D bastan para un MVP verificable.

---

## 2. Contradicciones de gobernanza a resolver **dentro** del MVP (no reescribir AGENTS/CLAUDE enteros)

| Contradicción | Resolución dentro de `01-mvp` |
|---------------|-------------------------------|
| D-005 / CLAUDE “auth pausada” vs JWT + D-GOV-11 shipped | Declarar **docs desfasados**; canónica = auth liviana IN MVP (A). No reescribir historial D-005; marcar superseded para alcance MVP. |
| D-008 “no XP/racha todavía” vs Mi Progreso MUST (B) | MVP: superficie **mínima** de progreso (lecciones/%, siguiente lección). Rachas avanzadas / logros sofisticados = OUT. D-008 no bloquea página mínima. |
| AGENTS “wizard `#academia`” vs código `/onboarding-academia` | Canónica = **URL dedicada** (ver §5). Landing `#academia` = CTA/marketing, no wizard. |
| DO_NOT_TOUCH / skills “no JWT” / “email verification” | Declarar desfasados; skill de auth describe JWT cookie, no Resend verify. |
| Comunidad con peers mock vs lanzamiento | Feed real básico IN; mocks **solo** dev/demo interna — no contrato de launch (C). |
| Pagos D-027 vs lanzamiento | WhatsApp **BRIDGE**; Stripe/MP **OUT** (D). |

---

## 3. Docs a declarar desfasados (lista para § MVP)

1. `AGENTS.md` — sección Academia 2 pasos como wizard in-place `#academia` / `AcademiaSection.tsx`.  
2. `CLAUDE.md` / handoffs que digan **“Fase 4 Auth pausada”** como si no existiera JWT.  
3. Cualquier `DO_NOT_TOUCH` / nota de agente que diga **“no JWT”** o prohíba tocar auth cuando ya hay registro/login shipped.  
4. Skill `gmusic-auth-email-verification` como si existiera verify de correo (nombre vs realidad JWT-only).  
5. Cifras de tests / HEAD en CLAUDE “estado 18 Jun” cuando contradigan `agent-status` / `PROJECT_STATUS` (no reescribir todo; no usar como fuente de MUST).  
6. Inventario §13 orden “Mi Progreso = 7” / “Comunidad endurecer = 6” como si fueran post-MVP opcionales — **superseded** por B/C para alcance de lanzamiento (el inventario de *estado* sigue válido; el *orden de producto* lo fija el MVP).

**Regla:** en Fase 1 solo se **declaran** desfasados en el MVP; sync masiva de AGENTS/CLAUDE = pasada documental posterior (no bloquea redacción).

---

## 4. Definición canónica de auth (MVP)

| Dimensión | Canónica |
|-----------|----------|
| Mecanismo | JWT liviana (cookie sesión) — **IN MVP** |
| MUST | Registro · login · sesión persistente · logout · protección básica de rutas (incl. zona alumno + demo gate existentes) |
| SHOULD | Roles avanzados; recuperación de password (o **BRIDGE** documentado si no llega al launch) |
| WON'T | Email verification |
| Política histórica | Textos “auth pausada” = **desfasados** respecto al MVP; no autorizan revertir JWT |

---

## 5. `/onboarding-academia` vs wizard `#academia`

**Verificación código (2026-07-14):**

- `student-zone-routing.ts`: `"onboarding-academia": "/onboarding-academia"`.  
- `App.tsx`: monta `OnboardingAcademiaPage` cuando `currentPage === "onboarding-academia"`.  
- Landing `#academia`: `AcademiaPublicSection` / CTA (`resolveAcademiaPublicCta` → destino `onboarding-academia`); **no** es el wizard 2 pasos.  
- Inventario §5 ya lo documenta; AGENTS wizard in-place = obsoleto.

**Canónica:** onboarding Academia = **`/onboarding-academia`**.  
`#academia` = ancla de marketing/CTA en home.

---

## 6. ¿MUST / SHOULD / WON'T / BRIDGE verificables?

**Sí**, con A–D:

| Tag | Criterio de verificación (nivel producto) |
|-----|-------------------------------------------|
| MUST | Checklist DoD con paso manual/smoke observable; falla = no lanzar |
| SHOULD | Deseable; ausencia documentada no bloquea launch si no afecta happy path |
| WON'T | Prohibido en MVP; reabrir solo con decisión Juan |
| BRIDGE | Aceptable en launch con proceso humano/mock controlado/WhatsApp; criterio explícito de “usuario entiende el siguiente paso” |

Aplicación A–D: Auth JWT MUST · email verify WON'T · Mi Progreso mínimo MUST · Comunidad feed básica MUST (si está en nav) · T-PUB-01 / T-UX-LESSON-01 MUST si bloquean publicación o consumo correcto · WhatsApp BRIDGE · Stripe WON'T · Track B WON'T · P0 admin/Prisma bloquean.

---

## Ajustes mínimos aplicados a `fase-1-instruccion.md`

1. Gate prerrequisito #4 → **OK Juan** (paquete supervisor GPT, decisiones A–D).  
2. Matriz propuesta alineada a A–D (Auth, Mi Progreso, Comunidad, colas T-*).  
3. Preguntas 1–9 → **resueltas** (puntero D-ROAD-005).  
4. Happy path educativo nucleo + funnel/WhatsApp como acompañamiento.  
5. Academia canónica = `/onboarding-academia`.

---

## Veredicto

### **APROBADA**

La instrucción (tras ajustes) + inventario + A–D permiten redactar `docs/product/01-mvp-gmusic.md` sin ambigüedad de producto ni cambio de stack.

**No rediseño.** **No código.** Próximo: redactar MVP · registrar D-ROAD-005 · actualizar control · Juan lee y firma §12 antes de Fase 2.
