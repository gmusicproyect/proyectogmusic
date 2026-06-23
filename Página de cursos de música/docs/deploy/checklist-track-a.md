# Checklist deploy — Track A (producción lista para datos reales)

**Ticket:** Roadmap 30 días · T1  
**Fecha:** Jun 2026  
**Base de código:** `afee020`+ (quiz + `onboarding_analytics` en PostgreSQL)

> **Jerarquía:** `.agents/DECISIONS.md` → código + tests → esta nota.  
> **Rewrites SPA detallados:** `docs/vision/handoffs/2026-06-18-demo-routing-deploy-rewrites.md`

---

## Qué desbloquea este deploy

| Capacidad | Sin T1 | Con T1 |
|-----------|--------|--------|
| Link compartido `/demo-clase-3` | 404 en host | Carga clase 3 |
| Refresh en `/inscripcion` | 404 en host | Gate visible |
| Quiz → Postgres | Tabla inexistente en prod | Fila en `onboarding_analytics` |
| Análisis temperamento 6–12 meses | Solo localStorage efímero | Fuente de verdad en BD |

---

## 0. Pre-deploy (local / CI)

Ejecutar en la raíz del proyecto (`Página de cursos de música/`):

```bash
npm run deploy:verify-config   # rewrites + migración presentes
npm run prisma:generate
npm run app:typecheck && npm run api:typecheck
npm run app:test && npm run api:test
npm run build
```

- [ ] Todos los comandos anteriores en verde
- [ ] `origin/main` incluye migración `20260622143000_onboarding_analytics`
- [ ] Variables de entorno de producción documentadas (sección 2)

---

## 1. Variables de entorno

### Frontend (Vite / host estático)

| Variable | Producción | Notas |
|----------|------------|-------|
| `VITE_API_BASE_URL` | `/api/v1` o URL absoluta del API | Mismo origen si hay reverse proxy; si API en otro host, URL completa |
| `VITE_POSTHOG_KEY` | Key del proyecto US | Sin key = analytics no-op |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` | D-026 |
| `VITE_SENTRY_DSN` | DSN frontend | Opcional |
| `VITE_SENTRY_ENVIRONMENT` | `production` | |

### API (Express + Prisma)

| Variable | Producción | Notas |
|----------|------------|-------|
| `DATABASE_URL` | Postgres gestionado (Supabase/Neon/Railway) | **Obligatorio** para quiz en BD |
| `API_PORT` | Puerto del proceso | Según host |
| `SENTRY_DSN` | DSN backend | Opcional |
| `SENTRY_ENVIRONMENT` | `production` | |

### No usar en producción

| Variable | Motivo |
|----------|--------|
| `GMUSIC_DEV_USER_EMAIL` | Auth de desarrollo (D-017) |
| `GMUSIC_DEV_ACTIVATION_KEY` | Solo local |
| `VITE_USE_DASHBOARD_MOCK` / `VITE_USE_PATH_MOCK` | Deben ser `false` o ausentes |

Plantilla local: `.env.example`

---

## 2. Base de datos — migración `onboarding_analytics`

Migración: `prisma/migrations/20260622143000_onboarding_analytics/`

### Staging

```bash
# Con DATABASE_URL de staging en el entorno:
npm run db:migrate:deploy
npm run db:migrate:status
```

- [ ] `db:migrate:deploy` termina sin error
- [ ] `db:migrate:status` muestra todas las migraciones aplicadas

### Verificación SQL (staging)

```sql
-- Tabla existe
SELECT to_regclass('public.onboarding_analytics');

-- Enum temperament
SELECT enumlabel FROM pg_enum
JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
WHERE pg_type.typname = 'TemperamentType';

-- Índice único por sesión
SELECT indexname FROM pg_indexes
WHERE tablename = 'onboarding_analytics' AND indexname LIKE '%session_id%';
```

### Producción

Repetir los mismos pasos con `DATABASE_URL` de **producción** (idealmente en ventana acotada, con backup si ya hay datos).

- [ ] Migración aplicada en prod
- [ ] `onboarding_analytics` visible en consola del proveedor

---

## 3. Frontend — build + rewrites SPA

### Archivos en el repo (no requieren configuración manual si el deploy usa el repo)

| Archivo | Host |
|---------|------|
| `vercel.json` | Vercel — rewrite global `/* → /index.html` |
| `public/_redirects` | Netlify / Cloudflare Pages — copiado a `dist/` en build |

### Deploy

```bash
npm run build
# Publicar contenido de dist/ según el proveedor
```

- [ ] Build de producción exitoso
- [ ] `dist/_redirects` presente tras build (Netlify/CF)
- [ ] `vercel.json` en raíz si deploy es Vercel

### Rutas que deben resolver (D-GOV-02)

| URL | Pantalla esperada |
|-----|-------------------|
| `/` | Landing |
| `/mi-camino-demo` | Mapa demo |
| `/demo-clase-1` … `/demo-clase-5` | Clase demo N |
| `/inscripcion` | InscripcionGate |
| `/alumno` | Mi Estudio |
| `/mi-camino` | Mi Camino |

**Nota:** `onboarding-quiz` no tiene pathname público (navegación interna desde Academia). No crear `/onboarding-quiz` en el host sin nueva decisión.

---

## 4. API — deploy del Learning Engine

- [ ] API desplegada y alcanzable desde el frontend (`VITE_API_BASE_URL`)
- [ ] `GET /api/v1/health` responde 200
- [ ] `POST /api/v1/onboarding/temperament-quiz` acepta payload válido (ver `server/tests/onboarding-analytics.test.ts`)

Si frontend y API están en dominios distintos, configurar CORS en el API antes del go-live (fuera de scope de este ticket si ya comparten origen vía proxy).

---

## 5. QA post-deploy (producción o preview con rewrites)

### Funnel — carga directa y refresh

- [ ] `/mi-camino-demo` directo → mapa demo, sin 404
- [ ] Refresh en `/mi-camino-demo` → misma pantalla
- [ ] `/demo-clase-3` directo → DemoLessonPage clase 3
- [ ] `/inscripcion` directo → gate
- [ ] Back/forward del navegador coherente en el funnel

### Zona suscriptor — regresión

- [ ] `/alumno` y `/mi-camino` directos → sin 404

### Quiz → PostgreSQL (D-PROD-01)

1. Landing → Academia → completar quiz (o saltar y volver a probar completando)
2. Completar las 6 preguntas y enviar

- [ ] PostHog: `temperament_quiz_completed` (si key configurada)
- [ ] En Postgres:

```sql
SELECT session_id, calculated_temperament, completed_at
FROM onboarding_analytics
ORDER BY completed_at DESC
LIMIT 5;
```

- [ ] Aparece al menos una fila con `session_id` y `calculated_temperament`
- [ ] Si la API falló temporalmente: evento `temperament_quiz_sync_failed` y cola `gmusic_temperament_quiz_pending_sync` en localStorage; al recargar, `flushPendingTemperamentQuizSync` en `App.tsx` reintenta

### Soft gate

- [ ] “Saltar por ahora e ir al demo” lleva a `/mi-camino-demo` sin bloquear

---

## 6. Rollback rápido

| Componente | Acción |
|------------|--------|
| Frontend | Revertir deploy al commit anterior en el host |
| API | Revertir imagen/commit anterior |
| BD | **No** borrar `onboarding_analytics` si ya hay datos; migración es aditiva |

---

## 7. Referencias

| Doc | Contenido |
|-----|-----------|
| `docs/architecture/onboarding-analytics.sql` | Spec tabla |
| `docs/product/quiz-temperamento.md` | Quiz D-PROD-01 |
| `docs/architecture/backend-provider-options.md` | Proveedores Postgres |
| `.agents/DECISIONS.md` | D-GOV-02, D-GOV-03, D-PROD-01 |

---

*Checklist Track A · T1 · Gmusic Estudio*
