# 00 — Mapa maestro · Academia GMusic

**Host prod:** `proyectogmusic.vercel.app` (SPA Track A)
**Base:** `main` ~`0705032` · prod FE/BE `d48d163` · verificación código 28 Jul 2026
**Roles:** `DEMO` (registered_no_sub) · `ACTIVE` (suscriptor) · `ADMIN`
**Cierre comercial Track A:** WhatsApp (`/inscripcion` → `wa.me`) — J-FLOW-01. Checkout = legacy.

Flujo global: **visitante → registro/demo → alumno → clases → ejercicios → admin**

---

## Índice de diagramas

| # | Archivo | Zona | Estado |
|---|---------|------|--------|
| 00 | (este archivo) | Mapa maestro | Definitivo 28 Jul 2026 |
| 01 | [01-funnel-auth-landing.md](./01-funnel-auth-landing.md) | Visitante → registro/login → demo | Activo · patch v2 aplicado |
| 02 | [02-mi-camino-suscriptor.md](./02-mi-camino-suscriptor.md) | Alumno `/mi-camino` | Activo · patch v2 aplicado |
| 03 | [03-admin-contenido.md](./03-admin-contenido.md) | Admin bloques 5 etapas | Activo · patch v2 aplicado |
| 04 | [04-usuarios-comunicacion-fase-f.md](./04-usuarios-comunicacion-fase-f.md) | Usuarios + comunicación | **Fase F — NO ahora** (propuesta) |
| 05 | [05-comunidad-resumen.md](./05-comunidad-resumen.md) | Comunidad C2 | **Solo referencia** · API-ready, launch OFF |

**Leyenda Mermaid (canon):** nodo normal = existe y funciona · `{{Parcial / deuda}}` · `[["NO EXISTE"]]` · `{{LEGACY / residual}}`.

---

## Mapa global (nodos verificados en código)

```mermaid
flowchart TD
    subgraph LEYENDA
        L1[Existe] --- L2{{Parcial / deuda}} --- L3[["NO EXISTE"]] --- L4{{LEGACY}}
    end
    style L2 fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style L3 fill:#3a1a1a,stroke:#ff5555,color:#fff
    style L4 fill:#2a2a3a,stroke:#8888aa,color:#fff

    %% ── ADQUISICIÓN (detalle en 01) ──
    Start([Visitante · proyectogmusic.vercel.app]) --> Landing[Landing Obsidian & Gold]
    Landing -->|CTA Comenzar mi camino| Registro[registro-cuenta]
    Registro --> RegExito[registro-exito · JWT DEMO cookie gmusic_session]
    RegExito --> Quiz[onboarding-quiz · TemperamentQuizPage]
    Quiz --> OnbAcad[onboarding-academia · instrumento → nivel]
    OnbAcad --> DemoPath[/mi-camino-demo/]

    %% ── DEMO ──
    DemoPath --> DemoClases[demo-clase-1..5 · progreso localStorage gmusic:demo_v1]
    DemoPath -->|Upsell| InsGate[inscripcion-gate] --> InsReg[inscripcion-registro]
    InsReg --> WA[wa.me · CIERRE COMERCIAL Track A]
    Checkout{{CheckoutPage / activate-semestral · LEGACY}}
    style Checkout fill:#2a2a3a,stroke:#8888aa,color:#fff

    %% ── LOGIN (detalle en 01) ──
    Landing -->|Ya tengo cuenta| Login[login-cuenta]
    Login --> Access[GET /me/access]
    Access -->|ADMIN| AdminHome[/admin/]
    Access -->|ACTIVE| MiCamino[/mi-camino/]
    Access -->|registered_no_sub| DemoPath
    Access -->|error| Stay[stay + mensaje]

    %% ── ALUMNO (detalle en 02) ──
    MiCamino --> Guard[StudentZoneGuard · 403 → T-UX-01]
    Guard --> Path[loadPublishedCoursePath · ruta-guitarra-12-meses]
    Path --> Nodo[PathNode · locked / available / active / completed]
    Nodo --> Runner[LessonRunner · video → ejercicios]
    Runner --> Complete[POST complete → XP / racha → unlock siguiente]
    Runner --> PDF[guidePdfUrl en materiales · T-FLOW-02 resuelto en prod]
    Complete --> PD5[Entitlements H1 en start/complete · PD-5]
    FinCamino[["Pantalla fin de contenido · T-FLOW-04"]]
    style FinCamino fill:#3a1a1a,stroke:#ff5555,color:#fff

    %% ── ADMIN (detalle en 03) ──
    AdminHome --> AdminAuth[Login embebido AdminPage + requireAdmin server]
    AdminAuth --> CRUD[Módulo DRAFT · 5 slots fijos]
    CRUD --> Etapas[Fundamento1 → Fundamento2 → Técnica → Práctica → Tocar]
    Etapas --> Publish{validateModuleForPublish}
    Publish -->|5/5| Published[PUBLISHED · visible en path alumno]
    Publish -->|incompleto| Err400[400 MODULE_INCOMPLETE]
    CRUD -->|delete publicado| Err409[409 MODULE_NOT_DELETABLE]
    BadgeLegacy{{Badge Publicado legacy · T-FLOW-03}}
    style BadgeLegacy fill:#3a2a1a,stroke:#ffaa55,color:#fff

    %% ── FUERA DE SPRINT ──
    Comunidad{{Comunidad · API C2 lista · launch OFF · ver 05}}
    FaseF[["Usuarios / Comunicación · Fase F · ver 04"]]
    style Comunidad fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style FaseF fill:#3a1a1a,stroke:#ff5555,color:#fff
```

---

## Modelo de contenido

`Course → Module → PathNode → MicroExercise` · estados `DRAFT / PUBLISHED / ARCHIVED`
**BLOQUE** = 5 etapas fijas: `Fundamento1 → Fundamento2 → Técnica → Práctica → Tocar`
Curso único hardcoded: `ruta-guitarra-12-meses` (multi-curso = post-piloto).
XP / acierto: **solo servidor** (el runner no puntúa en cliente).

## Deuda activa (detalle en [README](./README.md))

| ID | Estado 28 Jul 2026 |
|----|--------------------|
| T-FLOW-01 | **Fix implementado en este lote** (role en `/me/access` + rama ADMIN en resolver) — pendiente OK Juan + tests en su máquina |
| T-FLOW-02 | Resuelto técnicamente en prod `d48d163` · formalización Lab pendiente |
| T-FLOW-03 | Abierto — badge legacy admin sin UI |
| T-FLOW-04 | Abierto — sin pantalla fin de contenido |
| T-FLOW-05 | Sin repro estático 28 Jul · repro runtime pendiente |
| T-UX-01 | Abierto — mensaje 403 genérico |
