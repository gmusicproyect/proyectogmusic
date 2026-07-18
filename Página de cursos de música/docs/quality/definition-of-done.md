# Definition of Done (DoD) — GMusic Track A

**Estado:** permanente · vigente desde **2026-07-14**  
**Uso:** todas las fases restantes del diagrama (2–10) y tickets anclados al MVP.  
**Contrato de producto:** `docs/product/01-mvp-gmusic.md` + **D-F1-001** (MVP congelado).

---

## Propósito

Este equipo no declara “listo” solo porque se vea bien en pantalla.

Una entrega (feature, ticket, fase de implementación) está **Done** solo cuando cumple este checklist **y** no contradice el contrato del MVP congelado. “Verse bonito” **no basta**.

---

## Checklist obligatorio

Antes de pedir cierre / merge / OK Juan de fase, verificar:

| # | Criterio | Notas |
|---|----------|--------|
| 1 | **Funciona E2E** | El flujo del usuario se completa de punta a punta en el entorno acordado (local controlado, staging o prod QA), no solo un componente aislado. |
| 2 | **Usa datos reales** | Fuente de verdad = API/DB (o fuente controlada explícita documentada). **Nunca** mock oculto como contrato de launch. Mocks solo en dev/demo interna y etiquetados. |
| 3 | **Maneja errores** | Fallos de red/API/validación con mensaje o estado usable; no pantalla muda ni crash silencioso. |
| 4 | **Maneja estados vacíos** | Empty state claro cuando no hay datos (progreso 0, feed vacío, sin lección publicada, etc.). |
| 5 | **Maneja carga** | Loading / skeleton / disabled mientras llega la respuesta; evita doble submit destructivo. |
| 6 | **Respeta permisos** | Roles y entitlements (`STUDENT` / `ADMIN`, `Subscription ACTIVE`, guards de zona). Sin acceso por “confiar solo en la UI”. |
| 7 | **Es responsive** | Happy path usable en viewport móvil principal sin bloqueos P0 (ver MVP §6 / §7.8). |
| 8 | **Tiene documentación** | Qué cambió, cómo probarlo, y si aplica entry en changelog / handoff / ticket. No docs inventadas de producto fuera del MVP. |
| 9 | **Tiene pruebas** | Tests automatizados o smoke del área tocada; cobertura alineada al skill del dominio. |
| 10 | **No rompe otra funcionalidad** | Regresión controlada: funnel demo, zona alumno, admin según impacto. |
| 11 | **Cumple el contrato del MVP** | Dentro de MUST/SHOULD/WON'T/BRIDGE de `01-mvp-gmusic.md` + **D-F1-001**. Scope nuevo → backlog + decisión de gobernanza, no “ampliar MVP en silencio”. |

---

## Relación con verificación técnica

| Capa | Comando / artefacto | Rol |
|------|---------------------|-----|
| **Gate técnico del repo** | `npm run verify` | Debe quedar **verde** en el SHA que se pretenda cerrar (typecheck + suites canónicas). Cifra real del repo, no números hardcodeados de specs viejos. |
| **DoD de este documento** | Checklist arriba | Calidad de entrega por feature/fase — incluye UX de estados, datos reales y permisos. |
| **DoD de lanzamiento MVP** | `01-mvp-gmusic.md` **§7** | Umbral de **producto** para poder lanzar el MVP (happy path, T-PUB, Mi Progreso, Comunidad sin mocks launch, P0 ops, firma, etc.). |

Orden mental:

1. Cumplir este DoD en el trabajo de la fase/ticket.  
2. Pasar `npm run verify`.  
3. Para **lanzamiento** del MVP, además cumplir §7 del contrato congelado.

Skill operativo: `gmusic-verification`. Protocolo de ciclo: `.agents/cursor-rules/loop.mdc`.

---

## Qué no cuenta como Done

- Solo UI mockeada o datos hardcodeados en componentes como verdad de launch.  
- “Compila” sin E2E del flujo tocado.  
- Tests verdes con comportamiento de permisos/entitlements solo en frontend.  
- Ampliar alcance del MVP sin decisión documentada (romper **D-F1-001**).

---

## Referencias

- MVP: `docs/product/01-mvp-gmusic.md` (§7 DoD producto, §12 aprobación / D-F1-001)  
- Decisión: `docs/roadmap/decisiones.md` → **D-F1-001**  
- Etapa: `docs/roadmap/etapa-actual.md`
