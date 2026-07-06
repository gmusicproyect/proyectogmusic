# T-UX-01 — StudentZoneGuard: copy genérico en 403 (sesión admin / rol incorrecto)

**Estado:** Abierto (backlog)  
**Prioridad:** Media  
**Fecha:** 3 Jul 2026  
**Detectado en:** Smoke D-GOV-17 · QA local `/mi-camino` tras sesión `/admin`

---

## Síntoma

Usuario con cookie `gmusic_session` de cuenta **no STUDENT** (p. ej. `admin@gmusic.academy`) navega a `/mi-camino` o `/alumno` y ve:

> **No pudimos verificar tu acceso**  
> [Reintentar] [Volver al inicio]

Ese copy sugiere fallo de red o verificación genérica, no “esta cuenta no es de alumno”.

---

## Impacto

- **QA / soporte:** confusión al cambiar de cuenta en la misma pestaña (admin → alumno, o viceversa).
- **Usuarios reales (futuro):** si un admin o apoderado entra a zona alumno con sesión equivocada, el mensaje no orienta la acción correcta (logout + login alumno).
- **No bloquea** D-GOV-17 ni path legacy — es deuda UX de mensajes y estados.

---

## Investigación (3 Jul 2026)

| Escenario | `/me/access` | Guard UI |
|-----------|--------------|----------|
| Sin cookie (401) | 401 | `denied` → redirige home/planes — **no** muestra este panel |
| Alumno sin suscripción (200, `canAccessStudentZone: false`) | 200 | `denied` → redirige — **no** este panel |
| **Admin con JWT válido (403 FORBIDDEN)** | 403 | **`error`** → panel “No pudimos verificar…” |
| Juan → Carlos vía `activate-semestral` sin logout | 200 Carlos | **OK** — cookie reemplazada, sin colisión |

**Conclusión:** el fallo del smoke D-GOV-17 fue **sesión admin activa**, no colisión Juan/Carlos.

---

## Causa raíz (código)

1. `realStudentAuth` devuelve **403** si `user.role !== STUDENT` (`server/middleware/realStudentAuth.ts`).
2. `loadAccessOnce` trata cualquier `GmusicApiError` ≠ 401 como **`error`** (`access-load.ts`).
3. `StudentZoneGuard` muestra copy genérico en `access.status === "error"` (`StudentZoneGuard.tsx`).

**Deuda adicional (severidad baja):** 401 se mapea a `denied` con `reason: NO_ACTIVE_SUBSCRIPTION` ficticio (`student-access-request.ts`), mezclando “sin login” con “sin suscripción”.

---

## Criterio de cierre

- [ ] Distinguir en cliente al menos: **403 FORBIDDEN (rol)** vs **401 UNAUTHORIZED** vs **red/5xx**.
- [ ] Copy 403 rol: p. ej. “Esta sesión es de administrador (o no es de alumno). Cierra sesión e inicia con tu cuenta de alumno.” + CTA logout.
- [ ] Opcional: en `activate-semestral` / login alumno, documentar que reemplaza `gmusic_session` (no coexisten dos alumnos).
- [ ] Test unitario o contrato en `student-zone-guard.test.ts` para mapeo 403 → mensaje específico.

---

## Archivos probables

| Archivo | Cambio |
|---------|--------|
| `src/app/services/gmusic-api/access-load.ts` | Outcome `forbidden_role` o extender `error` con `code` |
| `src/app/hooks/student-access-request.ts` | Mapear 403 vs 401 con reasons distintos |
| `src/app/components/gmusic/StudentZoneGuard.tsx` | Copy + CTA logout según reason |
| `server/middleware/realStudentAuth.ts` | (opcional) code estable `FORBIDDEN` ya existe |

---

## Fuera de alcance

- Refactor auth global, Fase 4, pagos.
- Fix `LoginCuentaPage` → `mi-camino-demo` (ticket aparte; familia redirect post-login).
- Knip / eliminar `devStudentAuth`.

---

## Asignación sugerida

**Cursor** — ciclo UX acotado tras autorización Juan.  
**No mezclar** con Piloto B3 ni D-GOV-17 (decisión ya cerrada con Opción B).
