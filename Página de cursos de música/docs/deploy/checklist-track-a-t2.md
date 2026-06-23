# Checklist T2 — Funnel medible (PostHog)

**Depende de:** T1 cerrado (Vercel + Render + Supabase)  
**Doc eventos:** `docs/deploy/funnel-events-track-a.md`

---

## 0. Código (repo)

```bash
npm run deploy:verify-funnel
npm run app:test
```

- [ ] `deploy:verify-funnel` en verde
- [ ] `analytics.test.ts` en verde (11 eventos + `pageViewed`)

---

## 1. Vercel — PostHog en producción

| Variable | Valor |
|----------|--------|
| `VITE_POSTHOG_KEY` | `phc_…` (PostHog US) |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` |

- [ ] Variables guardadas en **Production** (y Preview si aplica)
- [ ] **Redeploy** completado

---

## 2. PostHog — UI

- [ ] Proyecto en región **US** (`us.i.posthog.com`)
- [ ] Funnel `Funnel conversión Gmusic` — 4 pasos (ver `funnel-events-track-a.md`)
- [ ] Filtro paso 4: `intent` = `inscripcion`

---

## 3. QA manual (producción)

Usar ventana **incógnito** o borrar `localStorage` del funnel.

- [ ] Network: requests a PostHog al navegar
- [ ] `demo_cta_clicked` al entrar al demo desde Academia
- [ ] `temperament_quiz_completed` o `_skipped` si aplica
- [ ] `gate_viewed` en `/inscripcion`
- [ ] `whatsapp_cta_clicked` al pulsar WhatsApp inscripción

---

## 4. Cierre T2

- [ ] Eventos visibles en PostHog → **Activity** (últimas 24 h)
- [ ] Funnel configurado y guardado
- [ ] Equipo sabe mirar el funnel semanal

**Siguiente:** T3 — puente `session_id` quiz → email en gate.

---

*Checklist T2 · Gmusic Estudio*
