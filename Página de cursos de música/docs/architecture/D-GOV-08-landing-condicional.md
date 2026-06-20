# D-GOV-08 — Landing condicional según estado del alumno

**Estado:** Propuesta — pendiente aprobación  
**Fecha:** 2026-06-20  
**Área:** UX / Routing / Sesión  
**Scope:** GmusicLanding.tsx + PlanesSection.tsx

---

## Decisión

La landing muestra contenido diferente según el estado del visitante. No hay redirección automática.

---

## Estados y comportamiento

### Visitante sin sesión (estado actual)

- Ve landing completa
- Hero + Academia + Comunidad + Planes + Contacto

### Alumno en demo (completó registro, no ha pagado)

- Ve landing completa
- PlanesSection muestra su plan actual y botón para continuar inscripción
- Sin cambios en otras secciones

### Alumno pagante (suscripción activa)

- Ve landing personalizada
- Hero con saludo: "Bienvenido de vuelta, [nombre]"
- Academia y Comunidad visibles
- PlanesSection OCULTA — reemplazada por botón prominente "Ir a Mi Camino →"
- Contacto visible

---

## Lo que NO cambia

- URL principal sigue siendo `/`
- No hay redirección automática
- El alumno puede seguir viendo la landing si quiere

---

## Dependencias

- `session.status` ya disponible en `GmusicLanding.tsx`
- `StudentZoneGuard` ya implementado
- R-002 (entitlements) debe estar resuelto antes de implementar el estado "alumno pagante"

---

## Criterio de aprobación

- [ ] R-002 resuelto
- [ ] Al menos 1 alumno real pagante para probar
- [ ] Diseño del Hero personalizado aprobado por JP

---

## Estado actual

**PROPUESTA — no implementar todavía.**

Se activa cuando haya alumnos reales pagantes.

No toca `server/`, `prisma/`, auth ni pagos.
