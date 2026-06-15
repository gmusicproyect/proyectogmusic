# Handoff Opus — Track A hoy + North Star checkout (Fase 4+)

**Fecha:** 15 Jun 2026  
**De:** Juan Pablo (PO) + Cursor  
**Para:** Opus (arquitecto)  
**Palabra clave:** Retomar Gmusic  
**Estado:** Track A operativo · **sin implementar pagos** hasta señal real WhatsApp

---

## Qué estamos haciendo AHORA (no cambiar sin Juan)

| Capa | Estado | Notas |
|------|--------|-------|
| Landing Visual A | ✅ Commitada (`c84136a` + docs `1273f20`) | Hero, fondos PNG, BrandLogo, navbar Alumno |
| Funnel producto | ✅ Demo → gate → registro → **WhatsApp** | Puente humano; sin pasarela en código |
| PostHog | ✅ Juan configuró | Key en `.env.local` · tráfico Network OK |
| Funnel PostHog UI | ✅ Juan configuró | 4 pasos + filtro `intent=inscripcion` |
| Mercado Pago / SII / auth auto | ❌ **Fuera de scope activo** | North Star documentado abajo |
| Fase 4 Auth JWT | ⏸ | Desbloqueo: ver § Umbral |

**Regla:** No conectar presupuesto interno, Mercado Pago ni boleta automática hasta que el MVP demuestre conversión real.

---

## Umbral desbloqueo Fase 4 (human-in-the-loop)

1. PostHog: ≥1× `whatsapp_cta_clicked` con `intent: "inscripcion"` en funnel **Funnel conversión Gmusic**
2. Juan confirma **manualmente** mensaje real en WhatsApp **+56953429676** (no prueba del equipo)

Hasta entonces: **cero código** de pasarela, webhooks SII o registro automático post-pago.

---

## North Star — Checkout suscripción (Fase 4+, spec para Opus)

> Diseño acordado con Juan. **No implementar** hasta desbloqueo Fase 4.

### Pasarela de pago

- **Mercado Pago** (Chile + extranjeros).  
- ~~Webpay Plus / Flow~~ — referencia histórica del script greenfield; **decisión PO: Mercado Pago**.

### Layout checkout (pantalla de pago / inscripción)

**Columna izquierda — datos del alumno:**

| Campo | Regla |
|-------|-------|
| Nombre completo | Obligatorio |
| Nombre de usuario | Obligatorio (login futuro) |
| Correo | Obligatorio |
| Teléfono | Obligatorio |
| País | Visible |
| **Chile / Extranjero** | **Solo 2 opciones** (toggle o botones; no dropdown largo) |
| RUT | Obligatorio **solo si Chile** |
| Contraseña | Obligatorio (cuando exista auth real) |

**Columna derecha:** resumen del plan / orden.

### Regla tributaria Chile vs Extranjero

| Opción | RUT en formulario | Backend |
|--------|-------------------|---------|
| **Chile** | Usuario ingresa RUT real | User.rut = RUT ingresado |
| **Extranjero** | **No pedir RUT** al usuario | Backend asume **RUT genérico** del servicio interno de boletas (presupuesto/facturación interna ya lo soporta) |

Copy sugerido extranjero: *“No necesitas RUT; emitimos documento con datos internacionales.”*

### Flujo automático post-Fase 4 (referencia)

```
[Formulario Chile/Extranjero + contraseña]
       → [Mercado Pago]
       → [Webhook → Railway/Express + Prisma]
       → User + Payment + acceso desbloqueado
       → [API facturación interna / SII] boleta 19% IVA
       → [Email] acceso + PDF boleta
```

Idempotencia webhooks, estados Payment, fallback si SII falla → spec separada cuando Fase 4 arranque.

---

## Qué NO es el MVP de hoy

- Formulario largo con Mercado Pago embebido en landing
- RUT obligatorio en primer clic desde hero
- Deploy Vercel/Railway greenfield (Next+Sanity) mezclado con Track A
- Sustituir WhatsApp antes de primera conversión real

---

## Checklist Juan — Track A (Jun 2026)

- [x] Web visual aprobada
- [x] `.env.local` con `VITE_POSTHOG_KEY`
- [x] Tráfico PostHog en Network
- [x] Funnel PostHog 4 pasos + `intent=inscripcion`
- [ ] Push `origin/main` — pendiente autorización Juan
- [ ] Primera conversión WhatsApp real — pendiente mercado

---

## Próximo spec Opus (cuando corresponda)

1. **Ciclo push** — si Juan autoriza `git push origin main`
2. **Post-desbloqueo Fase 4** — spec Mercado Pago + form Chile/Extranjero + Prisma + integración presupuesto interno/SII
3. **Visual E** — solo si funnel no convierte y causa es visual (Illustrator → SVG)

---

## ACK Opus

Confirmar lectura: Track A = medir y convertir vía WhatsApp; North Star checkout = Mercado Pago + formulario bilateral Chile/Extranjero; **implementación pagos después de señal real**.
