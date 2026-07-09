# Upstream — canon ejecutor portable

La **identidad y el proceso** del ejecutor viven primero en el repo portable
[instruccionesAgentes](https://github.com/gmusicproyect/instruccionesAgentes).
Gmusic mantiene aquí la **instalación local** (con `loop.mdc` especializado).

## Trazabilidad

| Campo | Valor |
|-------|-------|
| **Upstream repo** | `gmusicproyect/instruccionesAgentes` |
| **Upstream HEAD** | `c5a3c9b` (9 Jul 2026) |
| **Última sync Gmusic** | 9 Jul 2026 — `01` + `02` desde upstream; `loop.mdc` local |

## Archivos en esta carpeta

| Archivo Gmusic | Origen |
|----------------|--------|
| `01-identidad-del-ejecutor.md` | `instruccionesAgentes/rules/01` |
| `02-protocolo-criterio-fable.md` | `instruccionesAgentes/rules/02` |
| `loop.mdc` | Plantilla upstream + comandos Gmusic (`npm run verify`) |

## Regla de prioridad

Si un archivo local contradice `instruccionesAgentes` en **cómo trabaja el
ejecutor**, gana el upstream. JP decide cuándo propagar mejoras locales
de vuelta al repo portable.

## Propagación

```text
instruccionesAgentes  ──JP autoriza──►  .agents/cursor-rules/  ──sync──►  .cursor/rules/
```

No incluir en upstream: materia pedagógica, rutas de producto, specs de
tickets Gmusic — eso vive en `AGENTS.md`, `DECISIONS.md`, `docs/`.
