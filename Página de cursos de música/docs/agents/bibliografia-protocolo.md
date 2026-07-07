# Bibliografía del protocolo ejecutor — Gmusic

> Índice maestro: **por qué** existe la trilogía (`.agents/cursor-rules/`).  
> Lectura humana / evaluación — **no** reglas `alwaysApply`.  
> Última consolidación: **6 Jul 2026** · transferencia metodología **SUPERADA** (T-LOGIN-REDIRECT).

---

## Regla epistemológica de este índice

**Los enlaces web de las filas 1–6 no son las obras.** Son resúmenes, reseñas o herramientas de **terceros** — fidelidad variable.  
**El canon es el libro** (o el ensayo editorial en fila 7). Usar enlaces solo como referencia rápida; no citar un gist o repo como si fuera al autor original.

| # | Obra (canon) | Enlace en repo / web | Tipo de enlace | Rol en Gmusic |
|---|--------------|----------------------|----------------|---------------|
| 1 | Pólya, *How to Solve It* (1945) | [gist jph00](https://gist.github.com/jph00/d60301884c56fe063101a7cc6193b3af) | **Resumen de tercero** | Marco 4 pasos: entender → plan → ejecutar → mirar atrás |
| 2 | Agans, *Debugging* (ISBN 0814471684) | [Wheeler reseña](https://dwheeler.com/essays/debugging-agans.html) · [debuggingrules.com](http://www.debuggingrules.com) | **Reseña de tercero** (+ sitio autor) | Hipótesis → datos; una cosa a la vez; “ain't fixed” |
| 3 | Hunt & Thomas, *The Pragmatic Programmer* (20th ed.) | [HugoMatilla resumen](https://github.com/HugoMatilla/The-Pragmatic-Programmer) | **Resumen de tercero** | Ventanas rotas · tracer bullets · prove it · tests |
| 4 | Gawande, *The Checklist Manifesto* | [Nozbe reseña](https://github.com/Nozbe/Michael.team/blob/master/en/_posts/2013-01-23-checklist-manifesto.md) | **Reseña de tercero** | Gates bajo presión; READ-DO / DO-CONFIRM |
| 5 | Tetlock & Gardner, *Superforecasting* | [superforecastinghelper](https://github.com/jmoral4/superforecastinghelper) | **Herramienta inspirada** (no resumen del libro) | Concepto Brier/GJP; calibración → eval 06 |
| 6 | Ousterhout, *A Philosophy of Software Design* | [ciembor reglas agente](https://github.com/ciembor/agent-rules-books/blob/main/a-philosophy-of-software-design/a-philosophy-of-software-design.md) | **Curación de tercero** (política derivada) | Módulos profundos · pull complexity down · review |
| 7 | Schluntz & Zhang, *Building Effective Agents* (Anthropic, 2024) | [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents) | **Fuente primaria** (ensayo editorial) | Ver abajo |

### Fila 7 — por qué es canon para este sistema

Ensayo **Building Effective Agents** (Schluntz & Zhang, Anthropic):

1. **Patrón evaluador–optimizador** — un modelo genera output y otro lo evalúa contra criterios establecidos. En Gmusic: **ejecutor (Cursor) → auditor GPT (JP invoca) → criterios del protocolo** — el trío arquitecto–ejecutor–auditor con nombre académico.

2. **Checkpoints con revisión humana** antes de acciones irreversibles — agentes pausan para validación humana. En Gmusic: **gates G1–G7** (push, prod, schema, producto…) · mini-brief → OK · diff resumido antes de commit/push.

---

## Arquitectura en tres capas

| Capa | Pregunta | Obras (canon) | Artefacto Gmusic |
|------|----------|---------------|------------------|
| **1. Evaluación** | ¿Qué me piden de verdad? ¿Trampa? ¿Gate? | Gawande · Tetlock · Anthropic §7 | `protocolo-criterio-fable.md` · pruebas 05/06 |
| **2. Epistemología** | ¿Cómo sé que es verdad? | Pólya · Agans · Pragmatic | `como-trabaja-claude.md` |
| **3. Entrega** | ¿Cambio mínimo verificado? | Ousterhout · Pragmatic | `loop.mdc` · plantilla 5 puntos |

**Effort adaptativo** no se codifica en reglas — lo compensan: nivel Bajo/Medio/Alto, verify, mini-brief + OK.

---

## Trilogía canónica (repo Gmusic)

| Archivo | Rol |
|---------|-----|
| `.agents/cursor-rules/loop.mdc` | Motor |
| `.agents/cursor-rules/protocolo-criterio-fable.md` | Proceso |
| `.agents/cursor-rules/como-trabaja-claude.md` | Identidad |

Sync: `./scripts/sync-cursor-rules.sh` → `.cursor/rules/`

---

## Mapas gesto → evidencia (detalle)

### Pólya → Gmusic

| Paso | Gmusic |
|------|--------|
| Entender | Mini-brief · spec 4 secciones |
| Plan | Hipótesis · A/B |
| Ejecutar | Cambio mínimo |
| Mirar atrás | verify · PROJECT_STATUS |

### Agans → Gmusic (evidencia 6 Jul)

| Regla | Gmusic |
|-------|--------|
| **3** Quit thinking and look | Hipótesis antes de archivos |
| **9** Ain't fixed | verify honesto; rechazo trampa test |
| **7** Check the plug | “Fix en browser” / LoginCuentaPage co-export |

### Pragmatic → Gmusic

Tips **4, 15, 27, 62–65** → ventanas rotas (T-API-01 P0) · tracer (piloto) · prove it · tests.

### Gawande → Gmusic

Presión · READ-DO (`agent-status.sh`) · DO-CONFIRM (`verify`) · pausas G1.

### Tetlock → Gmusic

`docs/agents/eval-calibracion-cursor.md` — trampas calibración · hipótesis refutable.

### Ousterhout → Gmusic

`resolvePostLoginPage` = módulo profundo; ticket acotado → loop gana sobre reshape.

---

## Pruebas de contrato

| Archivo | Qué mide |
|---------|----------|
| **05** (presión) | Carácter bajo urgencia |
| **06** `eval-calibracion-cursor.md` | Juicio proporcional |

---

## Verify rojo · reporte · hito

Ver `protocolo-criterio-fable.md` §8. Hito: T-LOGIN-REDIRECT smoke 3/3 · transferencia **SUPERADA** · backlog T-UX-COPY-LOGIN · T-API-01 P0.

---

## Secuencia de lectura (JP)

1. Pólya gist + Gawande post (rápido) — **luego libros cuando puedas**
2. [Building Effective Agents](https://www.anthropic.com/research/building-effective-agents) — fuente primaria arquitectura agentes
3. Agans + Pragmatic + Ousterhout — según tarea
4. Tetlock + eval 06 — calibración

---

## Repo de identidad (pendiente JP)

`instruccionescursor` en GitHub quedó con 5 archivos. Al actualizarlo, **incluir** `bibliografia-protocolo.md` y `eval-calibracion-cursor.md` — si diverge del canon vivo de Gmusic, “vaya al repo de identidad” instala versión stale.

---

*Consolidado sesión Fable → Cursor, 6 Jul 2026. Fila 7 verificada JP. Enlaces 1–6 = secundarios; canon = columna Obra.*
