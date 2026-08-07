# Prioridad operativa — infraestructura antes que material

**Fecha:** 2026-08-07  
**Decisión de Juan (producto Academia GMusic)**  
**Para:** Claude / Cursor en cualquier sesión de este repo

---

## Veredicto

> **Todo el material (incluidos los links de YouTube) se colocará a su tiempo.**  
> **Ahora la prioridad es que la infraestructura quede ordenada.**  
> Del material nos preocupamos después.

## Qué significa en la práctica

| Ahora (sí) | Después (no bloquear hoy) |
|------------|---------------------------|
| Contratos API, runners, pestañas, diapasón, viewModel, seeds estructurales | Videos reales / clips de YouTube por `/admin` |
| Specs de referencia (`docs/ux/`, F1/F2 en rama, gates de audio) | Sustituir placeholders por URLs finales |
| Orden de carpetas, parsers, tests de contrato | Biblioteca completa de PDFs/audios “de producción” |
| Que el camino H1 funcione de punta a punta con **contenido stub / firmado / placeholder** | Pulir catálogo pedagógico con material definitivo |

## Reglas para Claude

1. **No frenes** trabajo de infraestructura, bugs de contrato o cierre técnico esperando YouTube o clips reales.
2. **No inventes** URLs de YouTube “definitivas” ni rellenes material pedagógico de producción por tu cuenta.
3. Si un flujo exige `videoUrl` / material firmado: usa **stubs, fixtures o el pipeline de firmado ya existente**; deja el hueco para que Juan cargue el material real por `/admin` cuando toque.
4. Documenta los huecos de material como **pendientes de contenido**, no como bloqueadores de arquitectura.
5. Cuando el material llegue, la tarea es **enganchar URLs al slot correcto** — no rediseñar la infraestructura.

## Relación con T-UX-LESSON-01 / H1

**Decisión Juan 2026-08-07 — Opción A:** H1 cierra por **evidencia de infraestructura**, no de contenido de producción.

- Casilla de video (§6 #2): pipeline firmado con **stub/fixture** + vacío digno sin material.
- Smokes 2–3: ejercicios reales + **video stub** (YouTube real no requerido).
- F1: 5 PDFs distinguibles en Resumen (estructura) — **cuando Juan quiera verificar**; no es tarea inmediata de Cursor.
- Enganchar video real Fundamento 1 = **pendiente de contenido explícito**, no bug abierto.
- Spec actualizado: `.agents/specs/T-UX-LESSON-01-mini-spec.md` § criterios 6/6.

**Prioridad operativa reafirmada:** Cursor avanza **estructura de guitarra interactiva** (parser, diapasón, contratos). No pedir material (PDFs/YouTube) como siguiente paso.

Merge F1/F2: sigue necesitando autorización Juan. La prioridad de material **no** relaja eso.


## Lectura relacionada

- `docs/ux/GUITARRA-INTERACTIVA-REFERENCIA.md` — norte de Práctica (infra)
- `docs/ux/ESTRUCTURA-JSON-MODO-PRACTICA.md` — payload / datos
- `docs/operations/T-UX-LESSON-01-f1-f2-cierre.md` — estado F1/F2
