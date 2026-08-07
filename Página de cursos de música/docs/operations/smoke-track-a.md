# Smoke Track A — checklist (1 página)

**Base:** `main@77e3a0c`+ · **Arranque:** `scripts/dev/start-smoke-local.sh` (Postgres Docker :5433 + API + Vite).
**Cuentas:** una ADMIN, una STUDENT con suscripción ACTIVE, una STUDENT sin suscripción (DEMO).

### Opción A (T-UX-LESSON-01 / 2026-08-07) — video stub, no YouTube real

- Runbook completo: `docs/operations/RUNBOOK-VERIFICACION-OPCION-A-H1.md`
- Rama a verificar: `fix/t-ux-lesson-01-f1-f2`
- `.env.smoke.local` debe tener `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (si no → 503 al firmar/subir)
- Smoke 2: usar **video stub** en `/admin` (pegar URL Storage o subir mp4 pequeño; piloto T1: `clases-video/pilot/fundamentos/tu-guitarra-y-postura.mp4`)
- F1: subir **5 PDFs** distinguibles en slots 1–5 y verificar Tarjetas ↔ Resumen
- Evidencia video: Network `POST /me/media/signed-url` + DOM solo URL firmada (captura ofuscada)

| # | Smoke | Pasos | Esperado |
|---|-------|-------|----------|
| 1 | **ADMIN → /admin** (T-FLOW-01) | Login público en `login-cuenta` con cuenta ADMIN | Aterriza en Admin Creador sin pedir credenciales de nuevo |
| 2 | **ACTIVE → completar nodo** | Login ACTIVE → `/mi-camino` → nodo available → **video stub firmado** → ejercicios → complete | XP/racha del servidor; siguiente nodo unlock; DOM sin URL cruda de bucket |
| 3 | **DEMO → clase → WhatsApp** | Registro o login sin sub → `/mi-camino-demo` → clase → upsell | Progreso en `gmusic:demo_v1`; `/inscripcion` abre `wa.me` |
| 4 | **Fin de camino** (T-FLOW-04) | ACTIVE con todo lo publicado completado → `/mi-camino` | «Completaste lo publicado» + CTA «Ir a Mi Estudio» y «Seguir en Mi Camino» (revisión sin poder reiniciar completadas) |
| 5 | **Badge legacy** (T-FLOW-03) | `/admin` → listado y detalle de módulo seed B1/B2 publicado | Chip «Publicado legacy»; módulo 5/5 «Publicado»; borrador «Borrador» |
| 6 | **403 admin en zona alumno** (T-UX-01) | Con sesión ADMIN navegar directo a `/mi-camino` | Panel «Esta zona es del alumno» + CTA «Ir al panel admin» (sin redirect mudo a planes) |
| 7 | **Copy login** (T-UX-COPY-LOGIN) | Login con cookies bloqueadas (o simular anonymous) | Mensaje «Iniciaste sesión…» — nunca «Tu cuenta se creó…» |

**T-FLOW-05:** receta aparte en `docs/operations/t-flow-05-repro-runtime.md` (opcional, cuando quieras).
