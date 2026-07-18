# Brief supervisor — T-PUB-01 (piloto publicación)

**Fecha:** 2026-07-15  
**Para:** Juan  
**Estado:** **DONE LOCAL** · **cierre formal Juan** · **D-TPUB-01**  
**Instrucción:** `docs/roadmap/t-pub-01-brief.md`  
**Evidencia:** `docs/roadmap/t-pub-01-evidencia-local.md`  
**Canónico:** `docs/features/05-academia-cursos.md` · **D-F5-001** · **D-TPUB-01**  
**Umbral usable:** validator (título + `completionCriteria` + 5 `StageType`); media/micro SHOULD  

---

## Qué validó (local)

Admin R-008 crea/completa/publica **N=1** bloque → alumno STUDENT **ACTIVE** lo ve en `GET /me/path` (contrato `/mi-camino`).  
No Fase 6 · no LessonRunner completo · no prod.

## Entorno ejecutado

| Entorno | Condición |
|---------|-----------|
| **Local** (Docker + API `:3001`) | ✅ ejecutado · **cierre formal** |
| Staging dedicado | N/A · **no** launch |
| **Prod** | **NO** |

## IDs clave (local)

| Pieza | ID |
|-------|-----|
| Course | `d6fdc6fe-3415-4cce-9480-9a9b9b18ea92` · PUBLISHED |
| Module piloto | `f816fee7-2b72-4dea-af66-a5bbbe53ba29` · PUBLISHED |
| Alumno | `14147a41-d7f7-4b4b-9839-97c064b09679` · `carlos@gmusic.academy` |
| PathNodes | 5 IDs en evidencia |

## OUT

T-UX-LESSON · F6 · Progreso · Comunidad · pagos · prod · migraciones repo · código producto · commit/push.

## Deuda ops (separada · no bloquea cierre)

- **R-OPS-MIGRATE-UUID** — `migrate deploy` fresh local UUID vs TEXT.  
- **T-PUB-01-UI** — screenshot FE `/mi-camino` opcional (API validada).

## Veredicto

**`DONE LOCAL`** — cierre formal Juan (**D-TPUB-01**, 2026-07-15).  
**Fase 6 NO INICIADA.** Sin prod · sin código producto · sin commit/push.

---

*1 página · 2026-07-15 · cierre formal DONE LOCAL.*
