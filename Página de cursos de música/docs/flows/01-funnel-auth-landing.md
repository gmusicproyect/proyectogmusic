# Flujo 01 — Funnel público, registro y login

**Zona:** visitante anónimo → cuenta demo o suscriptor  
**Auditoría:** 6 Jul 2026 · alineación propuesta 20 Jul 2026 (prod `d48d163`) · **CANON CANDIDATO — PARCIALMENTE DESACTUALIZADO** hasta lote aplicado  
**Cierre comercial Track A actual (J-FLOW-01):** WhatsApp = **CIERRE COMERCIAL CANÓNICO DEL TRACK A ACTUAL** (sustituible por pasarela u otro cierre aprobado más adelante)

```mermaid
flowchart TD
    subgraph LEYENDA
        L1[Existe y funciona]
        L2{{Parcial / con bug}}
        L3[["NO EXISTE — por construir"]]
        L4{{LEGACY / residual / paralelo no canónico}}
    end
    style L2 fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style L3 fill:#3a1a1a,stroke:#ff5555,color:#fff
    style L4 fill:#2a2a3a,stroke:#8888aa,color:#fff

    Start([Visitante llega a proyectogmusic.vercel.app<br/>SPA Track A]) --> Landing[Landing pública<br/>Obsidian & Gold]
    Landing --> Decision1{¿Qué quiere hacer?}

    Decision1 -- Conocer más --> Secciones[Secciones marketing<br/>responsive OK]
    Secciones --> Flicker{{"⚠️ OBSERVACIÓN: scroll flicker iPhone<br/>(sin ticket — repro formal pendiente)"}}
    Secciones --> Decision1

    Decision1 -- Comenzar mi camino --> Registro[Registro cuenta]
    Registro --> RegOK{¿Registro exitoso?}
    RegOK -- No --> RegError{{"⚠️ D-GOV-16 / T-REG-01:<br/>registro liviano + CORS prod<br/>(decisión / ops pendiente)"}}
    RegError --> Registro
    RegOK -- Sí --> TierDemo[Cuenta tier DEMO<br/>JWT httpOnly cookie gmusic_session]
    TierDemo --> RegExito[registro-exito]
    RegExito --> QuizTemp[Quiz temperamento<br/>Eysenck D-PROD-01]
    QuizTemp --> OnboardingAcad[onboarding-academia<br/>instrumento → nivel]
    OnboardingAcad --> DemoPath["/clase-gratuita<br/>gate D-GOV-11"]

    Decision1 -- Ya tengo cuenta --> Login[LoginCuentaPage]
    Login --> LoginOK{¿Credenciales OK?}
    LoginOK -- No --> Login
    LoginOK -- Sí --> RefreshAccess[refresh → GET /me/access]
    RefreshAccess --> LoginBranch{¿outcome.type?}

    LoginBranch -- authenticated<br/>sub ACTIVE --> PaidPath["/mi-camino/"]
    LoginBranch -- registered_no_sub --> DemoPath
    LoginBranch -- anonymous<br/>o error --> LoginError[Pantalla error sesión<br/>sin navegar a demo]

    LoginBranch --> AdminDebt{{"⚠️ DEUDA T-FLOW-01:<br/>rol ADMIN no enruta a /admin<br/>desde login alumno"}}

    DemoPath --> DemoClases["/clase-gratuita/1…5<br/>progreso localStorage gmusic:demo_v1"]
    DemoClases --> DemoPath
    DemoPath --> Upsell{¿Convierte?}
    Upsell -- Sí --> Inscripcion["/inscripcion<br/>gate → registro"]
    Inscripcion --> WA[WhatsApp wa.me<br/>CIERRE COMERCIAL CANÓNICO<br/>DEL TRACK A ACTUAL · J-FLOW-01]
    Upsell -- No --> DemoPath
    Upsell -. paralelo residual .-> Checkout{{"LEGACY / RESIDUAL / PARALELO NO CANÓNICO:<br/>CheckoutPage + activate-semestral<br/>NO pasarela de pago real · Fase 5 pausada"}}
    Checkout -. ops/dev .-> PaidPath

    PaidPath --> GuardPaid[StudentZoneGuard<br/>canAccessStudentZone]
    DemoPath --> DemoGuard[DemoAuthGuard]

    style Flicker fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style RegError fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style AdminDebt fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style Checkout fill:#2a2a3a,stroke:#8888aa,color:#fff
    style WA fill:#1a3a1a,stroke:#55aa55,color:#fff
```

## Notas de implementación

| Nodo | Código / decisión |
|------|-------------------|
| Host | Producción observada: `proyectogmusic.vercel.app` (B0-P). `gmusic.academy` = marca/email seed, no hostname SPA. |
| CTA | `academia-public-cta.ts`: label **Comenzar mi camino** → `registro-cuenta` (tests prohíben «Probar gratis»). |
| Post-registro | `RegistroCuentaPage` → DEMO JWT en register → `registro-exito` → quiz → `onboarding-academia` → `clase-gratuita` (`/clase-gratuita`). |
| Login branch | `resolve-post-login-page.ts` + login en `RegistroCuentaPage`/`LoginCuentaPage`: `authenticated`+ACTIVE → `mi-camino`; `registered_no_sub` → `clase-gratuita`; error → stay. |
| ADMIN | Login alumno no distingue rol (T-FLOW-01); admin entra a `/admin` por URL + credencial. |
| WhatsApp | **J-FLOW-01:** CIERRE COMERCIAL CANÓNICO DEL TRACK A ACTUAL. Código prod `d48d163`: `InscripcionRegistroPage` → `wa.me/56953429676`. No es decisión permanente de producto futuro. |
| Checkout | **LEGACY / RESIDUAL / PARALELO NO CANÓNICO** — D-005/D-006 / Fase 5 pausada; no confundir con cierre comercial actual. |
| D-GOV-16 | Registro liviano propuesto; no confundir con ID inexistente «D-REG-01». |
