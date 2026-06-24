# D-GOV-11 — Acceso gratis obligatorio antes de quiz + demo

**Estado:** Propuesta — pendiente aprobación (Juan)  
**Fecha:** 2026-06-24  
**Área:** Producto / Funnel / Identidad  
**Relación:** Post T3/T3.5 · Evaluar como **Ticket 3.6** o prerequisito de **Ticket 4**  
**No autoriza implementación** mientras T3/T3.5 cierre E2E o sin decisión explícita.

---

## Problema

El demo gratuito de 5 clases hoy puede iniciarse como visitante 100% anónimo. Eso dificulta:

- Persistir avance real en backend antes de la conversión WhatsApp
- Reengagement y correlación temperamento ↔ comportamiento
- Separar estado temporal (`localStorage`) de identidad mínima del lead

---

## Decisión propuesta

Antes de iniciar **quiz de temperamento** y **demo de 5 clases**, el visitante debe crear un **acceso gratuito simple**.

### Flujo propuesto

```
Landing → Crear acceso gratis → Quiz temperamento → Mi Camino demo (5 clases) → Gate inscripción / WhatsApp
```

### Copy guía

**Usar:** «Crea tu acceso gratis y guarda tu avance.»

**No usar antes del demo:**

- «Paga»
- «Compra»
- «Inscríbete al plan»

---

## Datos mínimos del acceso gratis

| Campo | Requerido |
|-------|-----------|
| Nombre | Sí |
| Email | Sí |
| WhatsApp | Sí |

---

## Reglas de estado

| Actor | Qué puede hacer | Persistencia |
|-------|-----------------|--------------|
| Anónimo | Solo landing / preview | Sin avance guardado en backend |
| Lead gratuito | Quiz + 5 clases demo + avance guardado | Postgres/backend (fuente de verdad) |
| Alumno pagante | Progreso real + camino completo | Backend + suscripción activa |

**Principio:** `localStorage` representa solo estado temporal de sesión/dispositivo. Postgres/backend representa estado persistente del lead o alumno.

**Principio:** No mezclar `resetAnonymousFunnelAfterLeadCapture()` con progreso real de un alumno o lead ya identificado en backend.

---

## Fuera de scope (explícito)

- No forma parte del fix `900f1f4` (submit FormData + link-lead)
- No es Ticket 4 (UI adaptativa por temperamento)
- No implica pagos, Flow ni auth con contraseña en esta propuesta
- No redefine el gate WhatsApp post-5/5 (D-024)

---

## Preguntas abiertas para aprobación

1. ¿Ticket 3.6 independiente o bloqueante de Ticket 4?
2. ¿El acceso gratis crea fila en `users` / `onboarding_analytics` / tabla nueva?
3. ¿Qué pasa si el visitante ya tiene email en sesión parcial (quiz hecho sin registro)?
4. ¿Migración del embudo anónimo actual en producción?

---

## Criterio de cierre de esta decisión

Juan aprueba o rechaza D-GOV-11. Si se aprueba, definir ticket (3.6 vs T4 prereq) y spec de API/schema antes de código.
