# Funnel PostHog — Track A (T2)

**Ticket:** Roadmap 30 días · T2  
**Decisión:** D-026 (`VITE_POSTHOG_HOST` → US por defecto)  
**Objetivo:** Medir conversión Landing → Demo → Gate → WhatsApp sin tocar pagos ni auth.

---

## Qué desbloquea T2

| Sin T2 | Con T2 |
|--------|--------|
| No sabes cuántos entran al demo | Eventos `demo_cta_clicked`, `demo_completed` |
| No sabes quién llega a planes | `gate_viewed`, `plan_selected` |
| No mides conversión real | `whatsapp_cta_clicked` con `intent: inscripcion` |
| Quiz invisible en analytics | `temperament_quiz_completed` / `_skipped` |

---

## Variables Vercel (obligatorio en producción)

| Variable | Valor |
|----------|--------|
| `VITE_POSTHOG_KEY` | Project API Key (`phc_…`) desde PostHog → Project Settings |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` |

Tras guardar → **Redeploy** en Vercel. Sin key, todos los eventos son no-op.

Local: copiar la misma key en `.env` o `.env.local`.

---

## Catálogo de eventos (código → PostHog)

Fuente única: `src/app/utils/analytics.ts` (no usar `posthog.capture` en otros archivos).

| Evento | Cuándo | Propiedades clave |
|--------|--------|-------------------|
| `$pageview` | Cambio de pantalla SPA | `$current_url`, `gmusic_page` |
| `demo_cta_clicked` | CTA "Ver clase gratuita" en Academia | — |
| `semestral_cta_clicked` | CTA plan semestral en landing | — |
| `temperament_quiz_completed` | 6 preguntas enviadas | `calculated_temperament`, `session_id`, `scores` |
| `temperament_quiz_skipped` | "Saltar por ahora" | — |
| `temperament_quiz_sync_failed` | Quiz OK local pero API falló | `session_id` |
| `demo_lesson_completed` | Termina una clase demo | `lesson_id`, `lesson_title` |
| `demo_completed` | Termina clase 5 | — |
| `gate_viewed` | Abre `/inscripcion` | `locked` (true = demo incompleto) |
| `plan_selected` | Elige tier + período | `tier`, `period`, `price_clp`, `plan_id` |
| `registro_viewed` | Pantalla registro/WhatsApp | `plan_id` |
| `whatsapp_cta_clicked` | Clic WhatsApp | `intent` (`inscripcion` \| `dudas`), `plan_id` |

---

## Funnel principal en PostHog UI

Crear insight tipo **Funnel** con nombre: `Funnel conversión Gmusic`

| Paso | Evento | Filtro opcional |
|------|--------|-----------------|
| 1 | `demo_cta_clicked` | — |
| 2 | `demo_completed` | — |
| 3 | `gate_viewed` | `locked` = `false` |
| 4 | `whatsapp_cta_clicked` | `intent` = `inscripcion` |

Ventana de conversión sugerida: **14 días**.

### Funnel secundario (quiz)

| Paso | Evento |
|------|--------|
| 1 | `demo_cta_clicked` |
| 2 | `temperament_quiz_completed` |
| 3 | `demo_completed` |

---

## Umbral Fase 4 (negocio — no código)

Desbloquear pagos automáticos cuando:

1. PostHog registra ≥1 `whatsapp_cta_clicked` con `intent: inscripcion` (lead real, no prueba del equipo)
2. Juan confirma mensaje en WhatsApp **+56953429676**

Ref: `docs/vision/handoffs/2026-06-15-track-a-estado-y-fase4-north-star-opus.md`

---

## QA post-deploy

### Red local o producción (con key configurada)

1. Abrir DevTools → **Network** → filtrar `posthog` o `i.posthog.com`
2. Recorrer: Academia → demo CTA → (quiz) → clase 1 → … → inscripción → WhatsApp
3. Ver requests `capture` o `e/` con los nombres de evento

### Incógnito (visitante nuevo)

```javascript
// Console — reset funnel local si hace falta
localStorage.removeItem('gmusic:demo_v1');
localStorage.removeItem('gmusic_temperament_quiz_result');
localStorage.removeItem('gmusic_temperament_quiz_skipped');
location.reload();
```

### PostHog → Activity

- Debe aparecer tu `distinct_id` con eventos en los últimos 30 min
- Funnel de prueba: completar pasos 1–2 mínimo y ver conversión parcial

---

## Verificación en repo

```bash
npm run deploy:verify-funnel
npm run app:test -- src/app/utils/analytics.test.ts
```

---

## Referencias

| Doc | Contenido |
|-----|-----------|
| `docs/deploy/checklist-track-a-t2.md` | Checklist cierre T2 |
| `.agents/DECISIONS.md` | D-026, D-027 |
| `docs/deploy/checklist-track-a.md` | T1 deploy + infra |

---

*Funnel events Track A · T2 · Gmusic Estudio*
