# Handoff Opus — Protocolo Ciclo Cerrado (Cursor ↔ Opus)

**Fecha:** 14 Jun 2026  
**De:** Juan Pablo (PO) + Cursor (ejecutor)  
**Para:** Opus / Claude (arquitecto)  
**Palabra clave:** Retomar Gmusic

---

## Resumen

Juan activó un **protocolo de ciclo cerrado** para Cursor. A partir de ahora la colaboración Opus ↔ Cursor sigue una división explícita: **tú diseñas el ciclo; Cursor lo ejecuta y verifica.**

Regla persistente en repo: **`.cursor/rules/loop.mdc`** (`alwaysApply: true`).

---

## División de roles (confirmada)

| Rol | Quién | Hace | No hace |
|-----|-------|------|---------|
| **Arquitecto** | Opus | Specs, planes, contratos, criterio de producto, decisiones de diseño, handoffs | Commits, código de producción sin brief, números de tests inventados |
| **Ejecutor** | Cursor | Cambios atómicos, tests, build, reintentos, reportes | Improvisar producto, estética, pagos, seguridad sin OK de Juan |
| **PO** | Juan Pablo | Validación en decisiones bloqueadas, commits, gusto final | — |

---

## Qué debe traer cada spec de Opus (para que Cursor cierre el ciclo)

Cada tarea que envíes a Cursor debe incluir estas cuatro piezas — es la **anatomía obligatoria** del ciclo:

### 1. ESTADO (Cursor lo lee; Opus no hardcodea cifras viejas)
Cursor arranca leyendo repo real: rama, tests pasando hoy, build.  
**Opus:** no pegues "371 tests" u otras cifras obsoletas; indica *qué* verificar, no un número fijo del pasado.

### 2. RUTINA (Opus la define)
- Archivos concretos a tocar
- Cambio pequeño y atómico (una unidad lógica = un commit)
- Intención clara (qué y por qué)

### 3. VERIFICACIÓN (Cursor la corre)
Comandos reales del repo:
```bash
git diff --check
npm run api:typecheck && npm run api:test
npm run app:typecheck && npm run app:test
npm run build
```

### 4. CRITERIO DE SALIDA (Opus lo fija; default abajo)
> Tests en verde **y** build OK **sin warnings nuevos** introducidos por el cambio.

---

## Límites — human-in-the-loop

Cursor **se congela** (para y reporta) si tras **3 reintentos** fallidos la verificación sigue roja.

Cursor **debe pedir validación de Juan** antes de continuar si la tarea toca:
- Criterio de producto
- Gusto estético / diseño
- Presupuesto o costos
- Pasarelas de pago
- Seguridad / credenciales / datos sensibles

**Opus:** marca explícitamente en el spec qué decisiones requieren OK de Juan para que Cursor no improvise.

---

## Formato de reporte que Cursor entregará

Al cerrar o congelar un ciclo, Cursor reporta:

- **Estado final:** tests X/Y · build OK/FALLA
- **Qué se hizo:** 2–4 líneas
- **Verificación:** comando + salida relevante
- **Si congeló:** error exacto, causa probable, decisión pendiente para Juan

Opus puede usar estos reportes para el siguiente spec sin re-leer todo el diff.

---

## Implicaciones para tus handoffs

1. **Specs modulares** — un ciclo = un cambio verificable; no megabriefs de 10 archivos sin criterio de salida.
2. **Decisiones de diseño** — si no están cerradas en el spec, Cursor debe parar; ciérralas tú o delega pregunta concreta a Juan.
3. **No asumir "listo"** — Cursor no declara terminado sin tests + build reales en esa sesión.
4. **Track A only** — sigue vigente dual-track; Cursor no mezcla Track B en este repo.

---

## Estado del repo al activar el protocolo (referencia, no fijar en specs)

- **Track:** A — Vite + React + Express + Prisma
- **Tests (última corrida Cursor):** 372/372 app suite
- **Hero landing:** simplificado — bienvenida + logo centrado, scroll Apple, sin fachada/fotos; CTA demo en Academia
- **Reglas Cursor:** `.cursor/rules/loop.mdc` + `AGENTS.md` (índice actualizado)

---

## Confirmación solicitada a Opus

Por favor confirma que:
1. Entiendes el protocolo de ciclo cerrado y tu rol como arquitecto del ciclo (no ejecutor).
2. Adaptarás specs/handoffs a la anatomía ESTADO → RUTINA → VERIFICACIÓN → SALIDA.
3. Marcarás decisiones que requieran Juan antes de que Cursor implemente.

Respuesta sugerida: breve ACK + cualquier ajuste al template de spec que quieras estandarizar.
