# Flujo 03 — Admin Academia (contenido)

**Zona:** `/admin` · bloques 5 etapas  
**Auditoría:** 6 Jul 2026 · canon `docs/flows/` · alineado Admin Phase B

```mermaid
flowchart TD
    Entry([Admin entra a /admin]) --> Auth{¿Sesión ADMIN válida?}
    Auth -- No --> LoginAdmin[Login admin]
    Auth -- Sí --> Panel[Panel de bloques<br/>stats: total/publicados/borrador]

    Panel --> Accion{¿Qué hace?}

    Accion -- Crear bloque --> Titulo[Escribir título]
    Titulo --> Dup{¿Título duplicado?}
    Dup -- Sí --> AbreExistente[Abre el existente + toast<br/>anti-duplicado OK]
    Dup -- No --> Nuevo[Bloque DRAFT<br/>5 slots vacíos]

    Accion -- Editar --> Detalle[Detalle bloque<br/>5 etapas + evaluación]
    Nuevo --> Detalle
    AbreExistente --> Detalle

    Detalle --> EditEtapa[Editar etapa:<br/>título / video / PDF /<br/>guía / criterio / CTA]
    EditEtapa --> URLCheck{¿URLs válidas https?}
    URLCheck -- No --> URLError[normalizeMaterialUrl<br/>rechaza + error]
    URLError --> EditEtapa
    URLCheck -- Sí --> Guardar[Guardar borrador]
    Guardar --> Detalle

    Detalle --> Publicar{¿Publicar?}
    Publicar --> Validar{¿5/5 etapas con<br/>título + criterio?}
    Validar -- No --> Bloqueado[400 MODULE_INCOMPLETE<br/>validateModuleForPublish]
    Bloqueado --> EditEtapa
    Validar -- Sí --> Published[PUBLISHED<br/>visible en /mi-camino]

    Detalle --> Legacy{¿Es bloque legacy B1/B2?}
    Legacy -- Sí --> BadgeLegacy{{"⚠️ T-FLOW-03:<br/>D-GOV-17 Opción B firmada;<br/>badge UI pendiente"}}

    Accion -- Eliminar --> EsDraft{¿DRAFT sin progreso<br/>de alumnos?}
    EsDraft -- Sí --> Confirm[Confirmación roja inline]
    Confirm --> Borrado([Eliminado])
    EsDraft -- No --> E409[409 MODULE_NOT_DELETABLE<br/>protege alumnos]
    E409 --> Panel

    Accion -- Ver respuestas --> Attempts[Vista evaluación:<br/>GET /admin/nodes/:id/attempts<br/>badges correcto/incorrecto]
    Attempts --> Limitado{{"⚠️ PARCIAL: read-only,<br/>máx 200, por nodo<br/>(sin filtro por alumno;<br/>D-PROD-03 intervención manual ops)"}}

    Panel --> MultiCurso[["NO EXISTE:<br/>selector Cursos/Materias<br/>(hardcoded ruta-guitarra-12-meses)"]]

    style BadgeLegacy fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style Limitado fill:#3a2a1a,stroke:#ffaa55,color:#fff
    style MultiCurso fill:#3a1a1a,stroke:#ff5555,color:#fff
```

## Notas de implementación

| Nodo | Código / decisión |
|------|-------------------|
| Publish | `server/services/curriculum.ts` |
| Attempts | `server/services/adminReports.ts` + `AdminPage.tsx` |
| PDF admin | `guidePdfUrl` en PathNode; alumno vía T-FLOW-02 |
