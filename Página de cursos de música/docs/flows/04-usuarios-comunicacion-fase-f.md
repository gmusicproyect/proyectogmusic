# Flujo 04 — Usuarios + Comunicación (Fase F propuesta)

> **NO es el siguiente sprint.**  
> Orden visión: **Academia (activa)** → **Evaluación + Captación (Fase E)** → **Comunidad (Fase C)** → Landing (Fase D) → **este módulo (Fase F)**.  
> Requiere OK Juan/Opus antes de tocar auth, tiers o email transaccional.

**Auditoría:** 6 Jul 2026 · canon `docs/flows/`

```mermaid
flowchart TD
    Titulo["FASE F PROPUESTA<br/>Admin: Usuarios + Comunicación<br/>UI: no existe · Datos: parcial en Postgres"]

    Titulo --> Usuarios[/"MÓDULO USUARIOS<br/>UI admin: no existe<br/>Datos: User, Subscription,<br/>UserProgress, onboarding_analytics,<br/>ExerciseAttempt"/]

    Usuarios --> Lista[Lista de usuarios:<br/>nombre, email, rol/tier/sub,<br/>temperamento quiz, bloque derivado,<br/>última actividad derivada]
    Lista --> Filtros{¿Filtrar?}
    Filtros -- Por acceso --> FAcceso[["demo / suscriptor ACTIVE<br/>/ admin (3 ejes distintos)"]]
    Filtros -- Por progreso --> FProg[["estancados / activos /<br/>completaron bloque X"]]
    Filtros -- Por perfil --> FPerfil[["temperamento Eysenck<br/>(lead puede ser session-only)"]]

    Lista --> Leads[["Captación Fase E:<br/>onboarding_analytics<br/>email sin User aún"]]

    Lista --> DetalleUser[Detalle usuario:<br/>progreso + suscripción + quiz]

    DetalleUser --> AccionUser{¿Qué acción?}
    AccionUser -- Contactar --> Comunicacion
    AccionUser -- Ver respuestas --> LinkAttempts[["Enlace Evaluación<br/>attempts filtrados por userId<br/>(hoy: solo por nodo)"]]
    AccionUser -- Cambiar tier --> TierChange[["Gestión manual tier/sub<br/>ZONA SENSIBLE + audit log<br/>+ D-GOV nueva"]]

    Comunicacion[/"MÓDULO COMUNICACIÓN<br/>UI: no existe"/]
    Comunicacion --> Canal{¿Canal?}
    Canal -- WhatsApp manual --> WA1["D-PROD-03 Fase 1:<br/>ops fundador + plantillas<br/>por temperamento (Track A hoy)"]
    Canal -- Email admin --> EmailTrack[["Track paralelo Fase F:<br/>requiere proveedor + gobernanza"]]

    EmailTrack --> TipoMsg{¿Tipo email?}
    TipoMsg -- Individual --> Email1[Email transaccional 1 alumno]
    TipoMsg -- Broadcast --> Email2[Segmento ej. demos inactivos 7d<br/>post-lanzamiento + reglas claras]

    WA1 --> RegistroWA[Log manual / futuro CRM]
    Email1 --> RegistroEmail[["Registro comunicaciones<br/>auditoría (schema futuro)"]]
    Email2 --> RegistroEmail

    style Titulo fill:#1a1a2e,stroke:#8888ff,color:#fff
    style Usuarios fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style Leads fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style FAcceso fill:#3a1a1a,stroke:#ff5555,color:#fff
    style FProg fill:#3a1a1a,stroke:#ff5555,color:#fff
    style FPerfil fill:#3a1a1a,stroke:#ff5555,color:#fff
    style DetalleUser fill:#3a1a1a,stroke:#ff5555,color:#fff
    style LinkAttempts fill:#3a1a1a,stroke:#ff5555,color:#fff
    style TierChange fill:#3a1a1a,stroke:#ff5555,color:#fff
    style Comunicacion fill:#3a1a1a,stroke:#ff5555,color:#fff
    style EmailTrack fill:#3a1a1a,stroke:#ff5555,color:#fff
    style Email1 fill:#3a1a1a,stroke:#ff5555,color:#fff
    style Email2 fill:#3a1a1a,stroke:#ff5555,color:#fff
    style RegistroEmail fill:#3a1a1a,stroke:#ff5555,color:#fff
```

## Relación con visión admin

| Módulo visión | Este diagrama |
|---------------|---------------|
| Evaluación (attempts) | LinkAttempts desde detalle — extiende Fase B, no duplica |
| Captación (Fase E) | Nodo Leads / inbox quiz — **antes** que CRM completo |
| Comunicación email | Track paralelo; no sustituye WhatsApp D-024 / D-PROD-03 |
