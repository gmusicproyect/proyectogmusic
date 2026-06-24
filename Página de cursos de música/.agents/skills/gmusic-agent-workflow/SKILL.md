---
name: gmusic-agent-workflow
description: >-
  Protocolo de trabajo de Fable como CTO de Gmusic: leer Skills antes de cada
  fase, declarar gobernanza, auditar antes de modificar, verificar tests,
  reportar resultados, no commitear sin autorización. Leer siempre al inicio
  de cada sesión de trabajo.
---

# Gmusic Agent Workflow

Leer este Skill **al inicio de cada sesión de trabajo** en el repositorio Gmusic. Define el protocolo que Fable (CTO) debe seguir antes, durante y después de cada fase.

---

## Protocolo por fase

### 0. Antes de escribir código

1. **Leer la memoria del proyecto** (`MEMORY.md` y archivos referenciados relevantes).
2. **Leer el Skill que gobierna la tarea** — declarar qué Skill aplica antes de tocar código.
3. **Auditar el archivo que se va a modificar** — leerlo antes de editarlo o sobreescribirlo.
4. **Confirmar zona de impacto** — qué archivos se tocan, qué rutas se afectan, qué tests existen.
5. **Obtener autorización explícita del usuario** si la tarea involucra backend, auth, pagos, email, rutas nuevas en producción o cambios en archivos protegidos.

### 1. Durante la implementación

- Implementar solo lo autorizado — sin features extras, sin refactors de cortesía.
- Después de cada archivo editado: verificar TypeScript con `npm run typecheck` (o equivalente).
- No mezclar fases — si durante la Fase N se detecta un problema de Fase N+1, reportar; no implementar.

### 2. Después de cada fase

1. **Correr verificación**: `npm run verify` (o `npm run test` + typecheck si el scope es parcial). Ver skill `gmusic-verification`.
2. **Reportar resultado exacto** — no asumir conteos de tests de MEMORY.
3. **Reportar archivos tocados** — lista de archivos creados/modificados.
4. **Entregar reporte en formato estándar** (ver sección Formato de reporte).
5. **No commitear** sin autorización explícita del usuario.
6. **No iniciar la siguiente fase** sin que el usuario autorice.

### 3. Antes de un compactado de contexto

- Seguir skill `gmusic-session-handoff`: handoff explícito con SHA, ticket activo, verificación.
- Guardar en memoria cualquier información que no esté en el código o git (solo Fable edita MEMORY).

---

## Declaración de Skills

Antes de tocar código, declarar en texto:

```
Skill que gobierna: gmusic-funnel-conversion
Archivos afectados: src/app/pages/InscripcionGatePage.tsx, src/app/data/subscription-plans.ts
```

Si la tarea toca más de un dominio, declarar todos los Skills relevantes. Si no existe un Skill que cubra el dominio, proponer crearlo antes de implementar.

---

## Skills disponibles y dominios

| Skill | Dominio |
|-------|---------|
| `gmusic-welcome` | Dashboard Mi Estudio: layout, cofre semanal, XP, racha |
| `gmusic-path` | Camino del alumno: mapa serpenteante, nodos, sesiones |
| `gmusic-edu-gamified-design` | Tokens de diseño, patrones gamificados, WCAG |
| `gmusic-game-progression-architecture` | Arquitectura macro: demo flow, funnel Semestral, matriz 3×3, progresión zona alumno |
| `gmusic-visual-vfx` | Efectos visuales, animaciones, partículas, atmosfera |
| `gmusic-learning-engine` | Backend: ejercicios, XP, racha, evaluación — SOLO zona alumno |
| `gmusic-funnel-conversion` | Funnel público: demo 5 clases, inscripcion-gate, planes, CTA dinámico |
| `gmusic-verification` | Verificación antes de cerrar: `npm run verify`, regresión funnel |
| `gmusic-ci-deploy` | CI, deploy, smoke `verify-*`, checklist E2E |
| `gmusic-session-handoff` | Handoff inicio/fin de sesión, `agent-status.sh` |
| `gmusic-agent-workflow` | Este Skill — protocolo de trabajo |

---

## Zonas protegidas

Las siguientes zonas requieren autorización explícita antes de cualquier modificación:

| Zona | Archivos clave | Skill que gobierna |
|------|----------------|--------------------|
| Backend / Prisma / DB | `prisma/`, `src/server/`, `*.prisma` | `gmusic-learning-engine` |
| Auth JWT / bcrypt | `src/app/services/`, `src/app/hooks/usePublicStudentSession.ts` | futuro `gmusic-auth-email-verification` |
| Pagos / Flow webhook | `src/app/services/gmusic-api/`, `src/app/pages/legacy/CheckoutPage.tsx` | futuro `gmusic-payments-flow` |
| StudentZoneGuard | `src/app/components/gmusic/StudentZoneGuard.tsx` | `gmusic-welcome` |
| Mi Estudio / GmusicWelcome | `src/app/pages/GmusicWelcome.tsx` | `gmusic-welcome` |
| GmusicPath | `src/app/pages/GmusicPath.tsx` | `gmusic-path` |
| Navbar / routing base | `src/app/App.tsx`, `src/app/utils/student-zone-routing.ts` | `gmusic-game-progression-architecture` |

---

## Formato de reporte estándar

Después de cada fase o acción autorizada, entregar:

```
## Reporte — [Nombre de la acción / Fase N]

**Estado:** ✅ Completo / ⚠️ Parcial / ❌ Bloqueado

**Archivos creados:**
- ruta/archivo.ts — descripción breve

**Archivos modificados:**
- ruta/archivo.tsx — qué cambió

**Tests:** N pasando, 0 fallos (suite: nombre-del-archivo.test.ts)
**TypeScript:** Limpio / [describir errores]
**Pendiente para siguiente fase:** [qué falta / qué espera autorización]
```

---

## Reglas de seguridad (no negociables)

- **Frontend nunca activa suscripciones** — solo guarda planId en localStorage. El backend activa vía webhook.
- **El cliente nunca recibe `secureAnswer`** — la evaluación de ejercicios ocurre en el servidor.
- **El cliente no decide isCorrect, XP ni racha** — solo solicita y muestra lo que el servidor responde.
- **Un alumno suscrito nunca ve "Ver clase gratuita"** como CTA principal.
- **No commit sin autorización explícita** del usuario — ni un commit de checkpoint.
- **No usar `--no-verify`** en git — si un hook falla, investigar y corregir la causa.

---

## Flujo de escalación

Si durante una fase aparece un problema fuera del scope autorizado:

1. Detener la implementación.
2. Reportar el problema con archivo + línea + descripción.
3. Proponer fix con riesgo y scope.
4. Esperar autorización antes de implementar.

No improvizar fixes en zonas no autorizadas aunque parezcan triviales.
