# Smoke Track A — checklist (1 página)

**Base:** `main@f9e59be` (copia cursor) · **Arranque:** `scripts/dev/start-smoke-local.sh` (Postgres Docker :5433 + API + Vite).  
**Cuentas:** una ADMIN, una STUDENT con suscripción ACTIVE, una STUDENT sin suscripción (DEMO).  
**Rutas funnel:** D-GOV-19 — `/clase-gratuita` (no usar `/mi-camino-demo`; redirect legacy en `vercel.json`).

| # | Smoke | Pasos | Esperado |
|---|-------|-------|----------|
| 1 | **ADMIN → /admin** (T-FLOW-01) | Login público en `/login-cuenta` con cuenta ADMIN | Aterriza en Admin Creador sin pedir credenciales de nuevo |
| 2 | **ACTIVE → completar nodo** | Login ACTIVE → `/mi-camino` → nodo available → video → ejercicios → complete | XP/racha del servidor; siguiente nodo unlock |
| 3 | **DEMO → clase → WhatsApp** | Registro o login sin sub → `/clase-gratuita` → clase `/clase-gratuita/1`…`/5` → upsell | Progreso en `gmusic:demo_v1`; `/inscripcion` abre `wa.me` |
| 4 | **Fin de camino** (T-FLOW-04) | ACTIVE con todo lo publicado completado → `/mi-camino` | «Completaste lo publicado» + CTA «Ir a Mi Estudio» y «Seguir en Mi Camino» (revisión sin poder reiniciar completadas) |
| 5 | **Badge legacy** (T-FLOW-03) | `/admin` → listado y detalle de módulo seed B1/B2 publicado | Chip «Publicado legacy»; módulo 5/5 «Publicado»; borrador «Borrador» |
| 6 | **403 admin en zona alumno** (T-UX-01) | Con sesión ADMIN navegar directo a `/mi-camino` | Panel «Esta zona es del alumno» + CTA «Ir al panel admin» (sin redirect mudo a planes) |
| 7 | **Copy login** (T-UX-COPY-LOGIN) | Login con cookies bloqueadas (o simular anonymous) | Mensaje «Iniciaste sesión…» — nunca «Tu cuenta se creó…» |

**T-FLOW-05:** receta aparte en `docs/operations/t-flow-05-repro-runtime.md` (opcional, cuando quieras).

## Verificación automática (copia cursor / CI local)

Sin levantar browsers — contrato de rutas del smoke contra el routing D-GOV-19:

```bash
cd "Página de cursos de música"
node --import ./scripts/app-test-import.mjs --import tsx --test \
  src/app/operations/smoke-track-a.contract.test.ts
```
