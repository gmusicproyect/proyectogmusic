# Flujo 05 — Comunidad C2 + mapa de completitud

**Auditoría:** 6 Jul 2026 · canon `docs/flows/` · tests app **557/557**

```mermaid
flowchart TD
    subgraph COMUNIDAD["COMUNIDAD C2 — implementado"]
        CEntry([Alumno entra a Comunidad]) --> CEnrolled{¿Inscrito?<br/>CommunityEnrollment}
        CEnrolled -- No --> CJoin[PUT /community/enrollment]
        CJoin --> CFeed
        CEnrolled -- Sí --> CFeed[Feed posts<br/>CommunityPost PostgreSQL]
        CFeed --> CAction{¿Qué hace?}
        CAction -- Publicar --> CPost[POST /community/posts]
        CPost --> CFeed
        CAction -- Leer --> CFeed
        CAction -- Moderar admin --> CMod[["NO EXISTE:<br/>sin rutas admin moderación<br/>ni reportar contenido"]]
    end

    subgraph RESUMEN["MAPA DE COMPLETITUD — Track A"]
        R1["✅ COMPLETO:<br/>· Landing + marketing responsive<br/>· Auth JWT httpOnly + tier DEMO<br/>· Mi Camino + video-first R-009<br/>· Admin: crear/editar/publicar/eliminar<br/>· Validación publish 5 etapas<br/>· PDF guía admin + vista evaluación básica<br/>· Comunidad C2 PostgreSQL<br/>· Quiz temperamento D-PROD-01"]

        R2{{"⚠️ PARCIAL / DEUDA:<br/>· T-FLOW-01 login post-auth (ADMIN)<br/>· D-GOV-16 / T-REG-01 registro<br/>· T-UX-01 mensaje 403 genérico<br/>· T-FLOW-05 GmusicPath update depth<br/>· T-FLOW-03 badge legacy UI<br/>· T-FLOW-02 PDF alumno path API<br/>· T-FLOW-04 fin de camino<br/>· Attempts: sin filtro por alumno<br/>· Retry ejercicios sin límite/feedback<br/>· Moderación comunidad inexistente"}}

        R3[["❌ NO EXISTE / PAUSADO:<br/>· Checkout/pago real<br/>· Módulo Usuarios admin UI (Fase F)<br/>· Email admin broadcast<br/>· Multi-curso<br/>· Track B Next/Sanity<br/>· Selah Music (repo estructural)"]]
    end

    style CMod fill:#3a1a1a,stroke:#ff5555,color:#fff
    style R2 fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style R3 fill:#3a1a1a,stroke:#ff5555,color:#fff
```

## Observaciones (sin ticket)

| Ítem | Estado |
|------|--------|
| Scroll flicker iPhone (landing) | Observación; ticket solo tras repro formal |

*T-FLOW-05 registra update depth GmusicPath (R-009 A2).*

## Referencias

- Índice y matriz: [README.md](./README.md)
- Comunidad API: `server/routes/community.ts`
- Visión admin fases: `docs/vision/specs/2026-07-02-admin-platform-vision.md`
