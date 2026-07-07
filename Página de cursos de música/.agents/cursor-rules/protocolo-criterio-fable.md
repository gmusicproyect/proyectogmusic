---
description: Proceso de encargo — spec en ticket, mini-brief, gates, auditoría, cierre de estado
alwaysApply: true
---

# Protocolo Criterio Fable — Proceso de encargo para Cursor

> Canónico versionado en `.agents/cursor-rules/protocolo-criterio-fable.md`.  
> Sincronizar a `.cursor/rules/`: `./scripts/sync-cursor-rules.sh`  
> Trilogía: `loop.mdc` (motor) · este archivo (proceso) · `como-trabaja-claude.md` (identidad).

---

## 1. De dónde viene la spec

- La escribe el **arquitecto** (o JP con el arquitecto) en el chat.
- El **ejecutor la copia al inicio del ticket** — no hace falta carpeta `docs/specs/` formal.
- Si el ticket es decisión de gobernanza importante → archivar como **D-XXX** en `.agents/DECISIONS.md` (flujo JP existente).

### Checklist obligatorio en cada ticket (4 secciones)

```markdown
## Intención
[Qué problema resuelve — lenguaje de negocio, no de código]

## Restricciones
[Qué NO tocar, gates, decisiones ya tomadas, archivos fuera de alcance]

## Criterios de aceptación
[Cómo sabemos que quedó bien — verificables, no subjetivos]

## Definición de hecho
[Comando(s) de verificación + estado del repo al cerrar]
```

---

## 2. Mini-brief del ejecutor (antes del OK de JP)

Antes de tocar código, el ejecutor entrega un mini-brief y **espera OK explícito**:

```markdown
**Ticket:** [nombre corto]
**Nivel inferido:** Bajo | Medio | Alto — [1 línea de por qué]
**Hipótesis inicial:** [si hay bug: "huele a X por Y" — ANTES de abrir archivos]
**Archivos que leeré primero:** [lista]
**Cambio previsto:** [1–3 líneas]
**Verificación prevista:** [comando concreto]
**Auditoría GPT:** requerida | no aplica — [motivo]
```

- JP confirma o corrige el **nivel** con el OK; no etiqueta por voz al dictar.
- Clasificar es parte del análisis del ejecutor.

### Niveles de esfuerzo (referencia)

| Nivel | Típico |
|-------|--------|
| **Bajo** | Copy, CSS acotado, test puntual, doc |
| **Medio** | Flujo UI, routing acotado, API sin schema |
| **Alto** | Auth, DB/schema, pagos, seguridad, cambio transversal |

---

## 3. Auditor GPT (§6 — invoca JP, recuerda el ejecutor)

| Nivel | Auditoría |
|-------|-----------|
| **Alto** | **Obligatoria** siempre — antes del OK final de JP |
| **Medio + datos / auth / dinero / flujo usuario completo** | **Obligatoria** — ejecutor lo declara en mini-brief y reporte |
| **Medio puramente visual/UI** | Opcional |
| **Bajo** | No aplica salvo que JP la pida |

El ejecutor **no invoca** al auditor; **sí recuerda** en el reporte cuando corresponde:
> "Ticket Medio con toque a DB: requiere auditoría antes de tu OK."

*(Pendiente confirmación JP: mantener invocación solo por JP.)*

---

## 4. Gates humanos (G1–G7 resumidos)

Detener y pedir OK explícito de JP antes de:

- `git push` / deploy producción
- Secrets, credenciales, rotaciones
- Schema / migraciones / seed contra BD no verificada
- Auth, pagos, criterio de producto, diseño estético
- Tickets congelados (T3/T3.5 E2E, T4, D-GOV-11 sin aprobación)

---

## 5. Estado del proyecto — un solo archivo

**`.agents/PROJECT_STATUS.md`** — no convive con `ESTADO.md` separado.

| Momento | Acción |
|---------|--------|
| **Inicio de sesión / ticket** | Leer (obligatorio) + `./scripts/agent-status.sh` |
| **Cierre de ticket o sesión** | Actualizar snapshot operativo (obligatorio) |

Skill complementaria: `gmusic-session-handoff`.

---

## 6. Criterio de "metodología transferida" (prueba de fuego)

Un ticket **real Medio** donde:

1. El ejecutor produjo mini-brief + nivel **sin que se lo pidieran**
2. Entrega con plantilla de 5 puntos y **"qué leí"** citando archivos reales
3. Verificación **verde** con comandos ejecutados
4. `PROJECT_STATUS.md` actualizado al cierre
5. **JP no intervino** entre OK del brief y reporte final

Si JP corrigió a mitad de camino → transferencia aún no cerrada.

**Candidato cumplido:** T-LOGIN-REDIRECT — **SUPERADA** 6 Jul 2026 (smoke 3/3, auditoría APRUEBA).

---

## 8. Verify rojo y reporte

| Situación | Acción correcta |
|-----------|-----------------|
| Test flaky / deuda conocida | **A:** fix real · **B:** quarantine documentado (`it.skip` + ticket + DECISIONS + PROJECT_STATUS) |
| Comentar/borrar test sin traza | ❌ verde falso — peor que rojo honesto |
| Director autoriza push | No sustituye verify honesto ni cierre PROJECT_STATUS (G1 matiz) |

**Reporte:** plantilla 5 puntos por defecto. **Versión corta OK** si incluye verify + diff + riesgo residual. Cero reporte = no.

Fundamentos (Pólya, Agans, Gawande, etc.): `docs/agents/bibliografia-protocolo.md` · eval calibración: `docs/agents/eval-calibracion-cursor.md`.

---

## 7. Relación con el loop

| Capa | Archivo | Pregunta que responde |
|------|---------|------------------------|
| Motor | `loop.mdc` | ¿Cómo corro, verifico y reporto? |
| Proceso | este archivo | ¿Cómo encargo, clasifico y cierro? |
| Identidad | `como-trabaja-claude.md` | ¿Cómo pienso y me comunico? |

La metodología **no depende del modelo**. Cualquier arquitecto retoma con **"Retomar Gmusic"** y el contrato sigue idéntico.

---

*Versión 1.1 — Jul 2026 · transferencia SUPERADA · verify/quarantine · bibliografía*
