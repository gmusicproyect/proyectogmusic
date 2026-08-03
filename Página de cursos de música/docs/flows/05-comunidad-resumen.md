# Flujo 05 — Comunidad C2 + mapa de estado

**Auditoría:** 6 Jul 2026 · alineación propuesta 20 Jul 2026 (prod `d48d163`) · **B+ formalizar abierta 2 Ago 2026**  
**Estado producto Comunidad:** **NO LANZADO**  
**Capas (no confundir):** **CONSTRUIDO** (API + persistencia existen) · **NAV HABILITADA** (tab Comunidad en header **sin candado**, UI parcial) · **NO LANZADO** (sin recorrido canónico completo para usuarios reales; no contar como «Comunidad lanzada»)  
**Detalle visible:** API IMPLEMENTADA · PERSISTENCIA IMPLEMENTADA · UI PARCIAL (estados vacíos honestos / «próximamente»; **sin** mocks curados tipo «Canción del mes» ni URLs `example`) · NAV HABILITADA · `communityAccess: false` en entitlements (línea base observada; no tocado en B+) · Header **sin** candado · Mocks residuales de demo **saneados** (B+)

```mermaid
flowchart TD
    subgraph LEYENDA["LEYENDA — no equivalen"]
        L1["CONSTRUIDO = existe código / API / persistencia"]
        L2["NAV HABILITADA = tab visible sin candado · UI parcial"]
        L3["LANZADO = usuarios reales usan recorrido canónico completo"]
    end

    subgraph COMUNIDAD["COMUNIDAD C2 — construido ≠ nav habilitada ≠ lanzado"]
        CEntry([Alumno intenta Comunidad]) --> CGate{{"PRODUCTO NO LANZADO<br/>NAV HABILITADA · UI PARCIAL<br/>header sin candado B+ 2026-08-02<br/>communityAccess: false entitlements<br/>≠ LANZADO"}}
        CGate --> CTech["CAPA CONSTRUIDA (no implica lanzamiento):<br/>API IMPLEMENTADA<br/>PERSISTENCIA IMPLEMENTADA"]
        CTech --> CEnrolled{¿Inscrito?<br/>CommunityEnrollment}
        CEnrolled -- No --> CJoin[PUT /community/enrollment<br/>API IMPLEMENTADA]
        CJoin --> CFeed
        CEnrolled -- Sí --> CFeed[Feed posts API<br/>CommunityPost · PERSISTENCIA IMPLEMENTADA<br/>UI PARCIAL · empty/próximamente honestos<br/>sin mocks curados demo]
        CFeed --> CAction{¿Qué hace?}
        CAction -- Publicar --> CPost[POST /community/posts]
        CPost --> CFeed
        CAction -- Leer --> CFeed
        CAction -- Moderar admin --> CMod[["NO EXISTE:<br/>sin rutas admin moderación<br/>ni reportar contenido"]]
    end

    subgraph RESUMEN["MAPA DE ESTADO — Track A"]
        R1["CAPAS CONFIRMADAS / PARCIALES — no declarar cierre global:<br/>· Landing + marketing responsive<br/>· Auth JWT httpOnly + tier DEMO<br/>· Mi Camino + video-first R-009<br/>· guidePdfUrl alumno API+UI d48d163<br/>· Admin contenido: CRUD publish<br/>· Quiz temperamento D-PROD-01<br/>· Comunidad: CONSTRUIDA API+persistencia<br/>  UI PARCIAL · NAV HABILITADA · NO LANZADA"]

        R2{{"⚠️ PARCIAL / DEUDA:<br/>· T-FLOW-01 login post-auth ADMIN<br/>· D-GOV-16 / T-REG-01 registro<br/>· T-UX-01 mensaje 403 genérico<br/>· T-FLOW-05 GmusicPath update depth<br/>· T-FLOW-03 badge legacy UI<br/>· T-FLOW-02 cierre documental Lab pendiente<br/>· T-FLOW-04 fin de camino<br/>· PD-5 entitlements documentar en 02<br/>· Attempts: sin filtro por alumno<br/>· Retry ejercicios sin límite/feedback<br/>· Moderación comunidad inexistente<br/>· Comunidad: feed/curado real pendiente"}}

        R3[["❌ NO EXISTE / PAUSADO / NO LANZADO:<br/>· Checkout/pago real<br/>· Comunidad como producto lanzado<br/>· Módulo Usuarios admin UI Fase F<br/>· Email admin broadcast<br/>· Multi-curso<br/>· Track B Next/Sanity<br/>· Selah Music repo estructural"]]
    end

    style CMod fill:#3a1a1a,stroke:#ff5555,color:#fff
    style CGate fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style R2 fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style R3 fill:#3a1a1a,stroke:#ff5555,color:#fff
```

## Nota B+ (2 Ago 2026)

Frase de control Juan: `OK Comunidad: formalizar abierta` → **B+** (no B puro): tab abierta en nav + saneo de mocks en el mismo diff. **No** equivale a producto lanzado. Ver `docs/operations/dictamen-ws2-comunidad-a-vs-b-2026-08-02.md` y **D-COMM-BPLUS-001**.

## Observaciones (sin ticket)

| Ítem | Estado |
|------|--------|
| Scroll flicker iPhone (landing) | Observación; ticket solo tras repro formal |

*T-FLOW-05 registra update depth GmusicPath (R-009 A2). Cifra histórica tests 557/557 (6 Jul): no revalidada aquí — NO DETERMINADO cifra actual.*

## Referencias

- Índice y matriz: [README.md](./README.md)
- Comunidad API: `server/routes/community.ts`
- Entitlements: `server/lib/entitlementsH1.ts` (`communityAccess: false` — no tocado en B+)
- Header (sin candado): `src/app/components/gmusic/GmusicInternalHeader.tsx`
- Visión admin fases: `docs/vision/specs/2026-07-02-admin-platform-vision.md`
