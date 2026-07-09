---
description: Proceso de encargo — spec, mini-brief, gates G1–G7, auditoría, PROJECT_STATUS
alwaysApply: true
---

# Protocolo Criterio Fable — Loop Engineer v2

> Canónico Gmusic: `.agents/cursor-rules/02-protocolo-criterio-fable.md`  
> Upstream: [instruccionesAgentes](https://github.com/gmusicproyect/instruccionesAgentes) — ver `UPSTREAM.md`  
> Sincronizar a `.cursor/rules/`: `./scripts/sync-cursor-rules.sh`  
> Trilogía: `loop.mdc` (motor) · este archivo (proceso) · `01-identidad-del-ejecutor.md` (identidad).

> Extensión del protocolo Loop Engineer para Gmusic Academy.
> Objetivo: pasar del modo "tarea" (JP verifica cada paso) al modo "responsabilidad"
> (el agente verifica contra criterios y JP solo revisa el resultado y autoriza lo irreversible).
> Agnóstico al modelo: funciona con Sonnet, Opus o cualquier ejecutor futuro.

---

## 0. Arquitectura (sin cambios)

| Rol | Agente | Responsabilidad |
|---|---|---|
| Arquitecto / Validador | Claude | Diseña spec, define criterios de aceptación, valida cierre |
| Motor / Ejecutor | Cursor Agent Mode (o equivalente: Codex, Claude Code) | Implementa código según spec |
| Auditor | Agentes GPT | Revisión cruzada de calidad y seguridad |
| Autoridad final | JP | Autoriza commits, push y toda acción irreversible |

---

## 1. Especificación por adelantado (Spec-First)

**Regla:** Ningún ticket entra a ejecución sin spec completa. La spec se escribe UNA vez, al inicio, y contiene todo lo que el ejecutor necesita para trabajar sin preguntar.

Cada ticket debe incluir estas 4 secciones antes de tocar código:

### 1.1 Intención
Qué problema resuelve y por qué ahora. Una o dos frases. Si no se puede
escribir en dos frases, el ticket es demasiado grande → dividir.

### 1.2 Restricciones
- Archivos que SÍ se pueden tocar / archivos PROHIBIDOS.
- Dependencias que NO se pueden agregar sin autorización.
- Patrones obligatorios del proyecto (design system MASTER.md, Obsidian & Gold, convenciones Prisma).

### 1.3 Criterios de aceptación (VERIFICABLES POR MÁQUINA)
Cada criterio debe ser comprobable sin juicio humano. Formato checklist:

```
- [ ] `npm run test` pasa (554/554 o el número vigente)
- [ ] `npm run build` compila sin errores ni warnings nuevos
- [ ] [criterio funcional específico, ej: "GET /api/lessons/:id devuelve guidePdfUrl cuando existe"]
- [ ] No hay credenciales, secrets ni URLs hardcodeadas en el diff
- [ ] El diff no toca archivos fuera de la lista permitida
```

**Prohibido:** criterios subjetivos como "que se vea bien" o "que funcione".
Si un criterio no se puede verificar con un comando o un paso reproducible, reescribirlo.

### 1.4 Definición de "hecho"
Hecho = todos los criterios en verde + smoke test documentado + diff listo para revisión de JP.
Hecho ≠ "el código está escrito".

---

## 2. Ciclo obligatorio: Plan → Ejecutar → Verificar → Reportar

Ningún paso se salta. Orden estricto:

1. **PLAN**: El ejecutor escribe el plan (archivos a modificar, orden, riesgos) ANTES de la primera edición. Si el plan revela ambigüedad en la spec → detener y consultar, no asumir.
2. **EJECUTAR**: Implementación en commits atómicos (un cambio lógico por commit, como Admin Phase B).
3. **VERIFICAR (auto-verificación)**: El ejecutor corre la checklist de criterios COMPLETO y registra el resultado de cada uno. Esto lo hace el agente, no JP.
4. **REPORTAR**: El reporte a JP contiene: checklist con resultados, diff resumido, riesgos residuales, y la pregunta única de autorización. JP revisa el reporte, no el proceso.

**Regla de honestidad del reporte:** Si un criterio falla, se reporta en rojo con causa. Prohibido reportar "casi listo" u ocultar fallos parciales. Un criterio en rojo bloquea el cierre.

---

## 3. Memoria persistente entre sesiones

**Regla:** El estado del proyecto vive en archivos, no en la memoria de la conversación.

Archivo único: `.agents/PROJECT_STATUS.md`, actualizado al CIERRE de cada sesión de trabajo.

Estructura fija:

```markdown
# ESTADO — Gmusic Academy
Última actualización: [fecha]

## En curso
- [ticket activo + fase en la que quedó]

## Bloqueado / Pendiente
- [ej: Piloto B3 gate-first, re-render GmusicPath.tsx, LoginCuentaPage redirect, T-UX-01]

## Decisiones vigentes (referencia rápida)
- [ej: D-GOV-17: legacy B1/B2 → badge "Publicado legacy", NO migrar]

## Reglas duras activas
- [copia de la sección 4 de este protocolo]

## Última verificación conocida
- Tests: [n/n] · Build: [ok/fail] · Fecha: [fecha]
```

**Protocolo de inicio de sesión:** Todo agente (Claude, Cursor, GPT) lee `.agents/PROJECT_STATUS.md`
como PRIMER paso de cada sesión, antes de cualquier otra acción.

**Protocolo de cierre de sesión:** Actualizar `.agents/PROJECT_STATUS.md` es el ÚLTIMO paso obligatorio.
Sesión sin actualización de estado = sesión no cerrada.

---

## 4. Gates de seguridad (reglas duras — checkpoint humano)

Estas reglas son determinísticas. No admiten excepción, interpretación ni "esta vez sí".
Son la versión Loop Engineer de los clasificadores de Fable: checkpoint humano en lo irreversible.

| # | Regla | Acción irreversible protegida |
|---|---|---|
| G1 | Ningún push sin autorización explícita de JP en esa sesión | Historial remoto |
| G2 | Todo SQL de producción se muestra COMPLETO antes de ejecutar | Datos de producción (Supabase) |
| G3 | `db:seed` NUNCA corre en producción de forma amplia | Datos de producción |
| G4 | Ningún secret/credencial en código, seed, ni UI (lección P0 de `prisma/seed.ts`) | Seguridad de cuentas |
| G5 | Ninguna dependencia nueva sin justificación escrita en la spec | Superficie de ataque / bundle |
| G6 | Migraciones Prisma: idempotentes y revisadas antes de aplicar a Supabase | Esquema de producción |
| G7 | Borrado de datos, archivos o ramas: confirmación explícita de JP, siempre | Todo lo no recuperable |

**Regla meta:** Si un agente no está seguro de si una acción cae bajo un gate, se trata
como si cayera. La duda escala a JP, no se resuelve por iniciativa propia.

---

## 5. Effort adaptativo (versión Sonnet)

Fable regula profundidad de razonamiento con un parámetro. Aquí se regula con el
TAMAÑO DEL TICKET y la FRECUENCIA DE VERIFICACIÓN:

| Nivel | Tipo de tarea | Tamaño máx. | Verificación |
|---|---|---|---|
| Bajo | Renombrar, formatear, textos, CSS puntual | 1 archivo | Build al final |
| Medio | Feature acotada, fix con test | 3–5 archivos | Tests + build por commit |
| Alto | Migración, auth, pagos, esquema DB | Dividir en tickets Medio | Checklist completa + auditor GPT + smoke test manual de JP |

**Regla:** Una tarea de nivel Alto nunca se ejecuta como una sola pieza.
Se divide hasta que cada pieza sea nivel Medio. La autonomía larga se logra
encadenando ciclos cortos verificados, no con un ciclo largo sin verificar.

---

## 6. Auditoría cruzada (rol GPT)

Antes del reporte final a JP en tareas de nivel Medio y Alto:

1. El auditor GPT recibe: spec + diff + checklist con resultados.
2. Revisa SOLO tres cosas: (a) ¿el diff cumple la spec?, (b) ¿viola algún gate de la sección 4?, (c) ¿hay riesgo no declarado en el reporte?
3. Veredicto binario: APRUEBA o DEVUELVE con causa. Sin veredicto del auditor, el ticket no llega a JP.

---

## 6-bis. Decisiones vigentes del arquitecto (6 jul 2026)

Aclaraciones que resuelven ambigüedades del protocolo. Vigentes hasta que
una decisión posterior las reemplace:

- **Specs:** las escribe el arquitecto (o JP con el arquitecto) en el chat;
  el ejecutor las copia al inicio del ticket. No hay carpeta `docs/specs/`
  formal — el checklist de 4 secciones en el ticket basta. Solo se archiva
  como D-XXX lo que sea decisión de gobernanza.
- **Nivel de esfuerzo:** lo INFIERE y declara el ejecutor en el mini-brief;
  JP confirma o corrige con el OK. Clasificar es parte del análisis.
- **Auditor GPT:** obligatorio en Alto siempre. En Medio, obligatorio solo
  si toca datos, auth, dinero o flujo de usuario completo; opcional en Medio
  puramente visual. Lo INVOCA JP — el ejecutor lo RECUERDA en brief y reporte.
- **Tests existentes:** se puede ajustar un test SOLO si el comportamiento
  acordado cambió, declarándolo explícitamente en el reporte con OK de JP
  antes del cierre. Nunca ajustar un test para que "pase".
- **Suite por nivel:** Bajo = build; Medio/Alto = suite completa (app + api
  + build). Un flake preexistente declarado con ticket propio no invalida
  el cierre del scope del ticket.
- **Tercer fallo:** bloque "BLOQUEADO" en PROJECT_STATUS (con hipótesis
  descartadas) + aviso en chat. Ambos.
- **Push:** cero commit/push sin OK explícito de JP, sin excepciones, incluso
  en ventanas de trabajo solo-Cursor. G1 no se negocia.
- **Criterio de transferencia (CUMPLIDO 6 jul 2026, ticket T-LOGIN-REDIRECT):**
  ticket Medio real donde el ejecutor produjo mini-brief y nivel sin pedirlo,
  entrega con plantilla de 5 puntos citando archivos reales, verificación
  verde del scope, estado actualizado, y cero intervención de JP entre el OK
  del brief y el reporte final. Este estándar es el piso desde entonces.

---

## 7. Qué cambia para JP en la práctica

Antes (modo tarea): JP verifica cada paso → JP es el cuello de botella.

Ahora (modo responsabilidad):
- JP escribe/aprueba la spec al inicio (5 min bien invertidos).
- Los agentes ejecutan y SE verifican contra criterios.
- JP recibe un reporte cerrado y decide sobre lo irreversible (gates).
- JP hace smoke test manual solo en nivel Alto.

La responsabilidad final sobre producción sigue siendo de JP. Eso no cambia y no debe cambiar.

---

*Versión 1.0 — Julio 2026. Instalado en Gmusic junto a `loop.mdc` y
`01-identidad-del-ejecutor.md`. Canon portable: `instruccionesAgentes/rules/02`.*
