# D-GOV-16 — Registro gratuito liviano; datos formales en inscripción/compra

**Estado:** Propuesta — pendiente aprobación (Juan)  
**Fecha:** 2026-06-27  
**Área:** Producto / UX / Auth / Funnel  
**Ticket de implementación propuesto:** **T-REG-01** (copy + formulario registro gratis)  
**Relación:** Complementa **D-GOV-11** (acceso requiere cuenta) · Independiente de **D-GOV-15/T4A** (landing vs onboarding académico)  
**No autoriza implementación** hasta aprobación explícita y QA registro prod estable.

---

## Problema

Para acceder a las 5 clases gratis, el registro debe sentirse **liviano y rápido**. Pedir datos formales demasiado pronto (WhatsApp, RUT, facturación) aumenta fricción y se percibe como compra o contrato, no como prueba gratuita.

---

## Decisión propuesta

| Momento | Qué pedir | Qué NO pedir |
|---------|-----------|--------------|
| **Crear acceso gratis** (`registro-cuenta`) | Nombre · nombre de usuario / artístico · correo · contraseña · confirmar contraseña | RUT · WhatsApp · facturación · datos formales de inscripción |
| **Continuar / comprar / suscribirse** (`inscripcion-gate` → `inscripcion-registro` / Fase 5) | Nombre completo si falta · RUT · WhatsApp · plan · pago/contacto · datos formales | — |

**Principio:** cuenta gratuita = acceso rápido. Compra/suscripción = datos formales.

**Motivo:** menos fricción antes de probar → más entradas. Más formalidad solo cuando la decisión de pago/inscripción ya está tomada.

---

## Copy recomendado — registro gratis

| Elemento | Texto |
|----------|-------|
| Título | **Crea tu acceso gratis** |
| Subtítulo | Te regalamos tus primeras 5 clases para que descubras tu camino musical. |
| Botón principal | **Crear mi acceso gratis** |

*(Hoy en prod: «Crea tu cuenta» / «Regístrate para acceder…» / «Crear cuenta» — ver gap abajo.)*

---

## Reglas técnicas

| Regla | Detalle |
|-------|---------|
| Celular/WhatsApp | **No** en registro inicial (ni obligatorio ni opcional en UI). Backend ya acepta `phone` omitido (`parseRegisterBody`). |
| RUT | **No** en registro inicial. RUT vive hoy en `InscripcionRegistroPage` — correcto para fase formal. |
| Username / nombre artístico | Campo `User.username` existe en spec Fase 4 pero **requiere migración Prisma** si no está en schema prod. **No implementar** sin aprobación. **Interim:** usar `User.name` como nombre visible hasta migración. |
| Confirmar contraseña | **Mantener** en frontend. |
| Auth JWT httpOnly | **No tocar** — cross-origin ya corregido (`dd7c11e`). |
| D-GOV-15 / T4A | **No tocar** en este ticket. |
| Pagos / progreso alumno / seed | **Fuera de scope.** |

---

## Estado actual del repo (referencia — post `07f6cde`)

| Item | Hoy | Objetivo D-GOV-16 |
|------|-----|-------------------|
| Campos registro | Nombre, email, password, confirm, **tel opcional** | Quitar tel de UI; añadir username cuando Prisma apruebe |
| Copy | «Crea tu cuenta» | «Crea tu acceso gratis» + copy propuesto |
| RUT | Solo `InscripcionRegistroPage` | Sin cambio (ya separado) |
| `name` vs username | Solo `name` → API | Documentar `name` = display interim |

Archivos futuros (post aprobación): `RegistroCuentaPage.tsx`, tests `public-session-flow.test.ts`, opcional copy en `RegistroExitoPage`.

---

## Separación de decisiones (no fusionar)

| ID | Rol |
|----|-----|
| **D-GOV-11** | **Acceso** — demo requiere cuenta |
| **D-GOV-15** | **Onboarding visual** — landing ≠ selector instrumento/nivel |
| **D-GOV-16** | **Formulario registro gratis** — liviano vs datos formales en compra |

---

## Gates de implementación T-REG-01

1. **D-GOV-16 aprobada** (Juan)  
2. **QA registro prod** estable (incógnito: registro → regalo → quiz → demo)  
3. Si se pide **username** distinto de `name`: spec Prisma + aprobación explícita  
4. Implementación Cursor (copy + quitar tel UI; username solo si gate 3 OK)

**No bloqueado por T4A** — puede implementarse en paralelo tras QA auth, salvo conflicto de copy en landing (D-GOV-15).

---

## Criterio de aceptación (implementación)

1. Formulario `/registro-cuenta` sin WhatsApp, RUT ni campos de facturación.  
2. Copy alineado a tabla de copy recomendado.  
3. Confirmación de contraseña presente.  
4. `POST /auth/register` sigue funcionando sin `phone`.  
5. RUT/WhatsApp siguen solo en flujo inscripción/compra.  
6. Tests app en verde; sin cambios Render/auth cookie.

---

## Preguntas abiertas

1. ¿Aprobar D-GOV-16 como dirección de producto?  
2. ¿Username en v1 usando solo `name`, o esperar migración `username`?  
3. ¿Actualizar también `RegistroExitoPage` / login copy para decir «acceso gratis»?
