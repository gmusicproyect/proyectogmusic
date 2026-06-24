# Checklist E2E — T3 + T3.5 (producción)

**Tickets:** T3 captura de leads · T3.5 reset embudo anónimo  
**Gobernanza:** D-GOV-10, R-OPS-01  
**Fix submit aprobado:** `900f1f4` — FormData + `await linkOnboardingLead` + reset al final  
**Prerequisito:** push a `main` + redeploy Vercel + API Render activa

> **No declarar T3/T3.5 cerrados** hasta completar todas las casillas.  
> **No iniciar Ticket 4** (UI adaptativa) hasta cierre formal aquí.

---

## 0. Pre-flight producción

- [ ] `https://proyectogmusic.vercel.app/quiz-temperamento` → 200 + pantalla quiz (incógnito)
- [ ] Refresh en `/quiz-temperamento` → sigue en quiz (rewrite SPA)
- [ ] `POST https://gmusic-api.onrender.com/api/v1/onboarding/link-lead` con `{}` → 400 (no 500)
- [ ] Columnas T3 en Supabase: `email`, `lead_captured_at`, `selected_plan_id`

---

## 1. Flujo manual (incógnito)

Usar email único: `test-t3-YYYYMMDD@gmusic.cl` (esta corrida: `test-t3-20260624@gmusic.cl`)

| Paso | Acción | OK si… |
|------|--------|--------|
| 1 | Abrir `/quiz-temperamento` | **Pregunta 1 de 6** |
| 2 | Completar quiz (6 preguntas) | Llega a `/mi-camino-demo` |
| 3 | Completar **5 clases** demo | Banner 5/5 + gate desbloqueado |
| 4 | `/inscripcion` → elegir plan → registro | Formulario visible |
| 5 | Enviar formulario con email de prueba | WhatsApp se abre; **mensaje usa el mismo email visible del formulario** (no email autofill viejo); mensaje éxito en página |
| 6 | Pulsar **「Repetir quiz y clases gratis」** | Vuelve a quiz o camino en 0/5 |
| 7 | DevTools → `localStorage` | `gmusic:demo_v1` = null tras envío |

---

## 2. Supabase (SQL Editor)

```sql
SELECT
  session_id,
  email,
  selected_plan_id,
  lead_captured_at,
  calculated_temperament,
  created_at
FROM onboarding_analytics
WHERE email = 'test-t3-YYYYMMDD@gmusic.cl'
ORDER BY lead_captured_at DESC
LIMIT 1;
```

- [ ] `session_id` presente
- [ ] `email` presente
- [ ] `selected_plan_id` presente (ej. `plus-semester`)
- [ ] `lead_captured_at` NOT NULL
- [ ] `calculated_temperament` coherente con quiz

---

## 3. PostHog (mismo ciclo / ventana de tiempo)

Eventos esperados (ver `docs/deploy/funnel-events-track-a.md`):

- [ ] `temperament_quiz_completed`
- [ ] `demo_lesson_completed` (×5) y/o `demo_completed`
- [ ] `gate_viewed`
- [ ] `plan_selected`
- [ ] `registro_viewed`
- [ ] `whatsapp_cta_clicked` (`intent: inscripcion`)

Unir por `session_id` en propiedades del quiz o por distinct_id + timestamp.

---

## 4. Regresión T3.5

| Escenario | Resultado esperado |
|-----------|-------------------|
| Tarjeta **60+** con demo **incompleto** | Abre **clase gratis** siguiente, no gate |
| Tarjeta **60+** con demo **5/5** | Abre `inscripcion-gate` |
| CTA Academia **Ver clase gratuita** (anónimo) | Pasa por quiz si no completado |
| Tras registro sin suscripción | Puede reiniciar ciclo completo |

---

## 5. Cierre formal

Marcar cuando todo esté verde:

```
T3  — CERRADO · fecha · responsable · email prueba usado
T3.5 — CERRADO · fecha · commit SHA 900f1f4 en main
T4  — NO INICIADO (bloqueado hasta arriba)
D-GOV-11 — Evaluar antes de T4 o como T3.6 (acceso gratis pre-demo)
```

Registrar en handoff o `.agents/DECISIONS.md` si aplica.
