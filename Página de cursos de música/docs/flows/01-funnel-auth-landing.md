# Flujo 01 — Funnel público, registro y login

**Zona:** visitante anónimo → cuenta demo o suscriptor  
**Auditoría:** 6 Jul 2026 · canon `docs/flows/`

```mermaid
flowchart TD
    subgraph LEYENDA
        L1[Existe y funciona]
        L2{{Parcial / con bug}}
        L3[["NO EXISTE — por construir"]]
    end
    style L2 fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style L3 fill:#3a1a1a,stroke:#ff5555,color:#fff

    Start([Visitante llega a gmusic.academy]) --> Landing[Landing pública<br/>Obsidian & Gold]
    Landing --> Decision1{¿Qué quiere hacer?}

    Decision1 -- Conocer más --> Secciones[Secciones marketing<br/>responsive OK]
    Secciones --> Flicker{{"⚠️ OBSERVACIÓN: scroll flicker iPhone<br/>(sin ticket — repro formal pendiente)"}}
    Secciones --> Decision1

    Decision1 -- Probar gratis --> Registro[Registro cuenta]
    Registro --> RegOK{¿Registro exitoso?}
    RegOK -- No --> RegError{{"⚠️ D-GOV-16 / T-REG-01:<br/>registro liviano + CORS prod<br/>(decisión / ops pendiente)"}}
    RegError --> Registro
    RegOK -- Sí --> QuizTemp[Quiz temperamento<br/>Eysenck D-PROD-01]
    QuizTemp --> TierDemo[Cuenta tier DEMO<br/>JWT httpOnly cookie]

    Decision1 -- Ya tengo cuenta --> Login[LoginCuentaPage]
    Login --> LoginOK{¿Credenciales OK?}
    LoginOK -- No --> Login
    LoginOK -- Sí --> RefreshAccess[refresh → GET /me/access]
    RefreshAccess --> LoginBranch{¿outcome.type?}

    TierDemo --> LoginBranch
    LoginBranch -- authenticated<br/>sub ACTIVE --> PaidPath[/mi-camino/]
    LoginBranch -- registered_no_sub --> DemoPath[/mi-camino-demo<br/>gate D-GOV-11]
    LoginBranch -- anonymous<br/>o error --> LoginError[Pantalla error sesión<br/>sin navegar a demo]

    LoginBranch --> AdminDebt{{"⚠️ DEUDA T-FLOW-01:<br/>rol ADMIN no enruta a /admin<br/>desde login alumno"}}

    DemoPath --> Upsell{¿Convierte a pago?}
    Upsell -- Sí --> Checkout[["NO EXISTE:<br/>Checkout/pago real<br/>(hoy: activate-semestral dev<br/>+ ops manual Supabase)"]]
    Upsell -- No --> DemoPath
    Checkout --> PaidPath

    PaidPath --> GuardPaid[StudentZoneGuard<br/>canAccessStudentZone]
    DemoPath --> DemoGuard[DemoAuthGuard]

    style Flicker fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style RegError fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style AdminDebt fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style Checkout fill:#3a1a1a,stroke:#ff5555,color:#fff
```

## Notas de implementación

| Nodo | Código / decisión |
|------|-------------------|
| Login branch | `RegistroCuentaPage`: `authenticated` → `mi-camino`; else → `mi-camino-demo` |
| ADMIN | Login no distingue rol; admin entra a `/admin` por URL directa + credencial |
| D-GOV-16 | Registro liviano propuesto; no confundir con ID inexistente «D-REG-01» |
| Checkout | D-005 / D-006 / Fase 5 pausada |
