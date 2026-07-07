# T-UX-COPY-LOGIN — Copy de anonymous en login usa texto de registro

**Estado:** Abierto (backlog)  
**Prioridad:** Baja  
**Fecha:** 6 Jul 2026  
**Detectado en:** Auditoría piloto T-LOGIN-REDIRECT · smoke prod 3/3

---

## Síntoma

Tras login, si `/me/access` devuelve `anonymous` (cookie no establecida, 403 mapeado, etc.), `assertAuthSessionEstablished` lanza con copy de **registro**:

> *"Tu cuenta se creó, pero no pudimos iniciar sesión…"*

En contexto **login**, el mensaje correcto ya existe en `resolve-post-login-page.ts` pero **no se alcanza** porque `login()` en `useAuth.tsx` llama `assertAuthSessionEstablished` antes de retornar.

---

## Impacto

- UX confusa en login (no en registro).
- **Preexistente** — no introducido por T-LOGIN-REDIRECT.
- No bloquea funnel; smoke offline muestra copy de red vía `formatAuthFormError`.

---

## Causa raíz (código)

`src/app/services/gmusic-api/assert-auth-session.ts:13-18` — mensaje único para register y login.

---

## Fix sugerido (cuando se autorice)

- Mensaje contextual por operación (`login` vs `register`), o
- Reutilizar copy de `resolvePostLoginPage` para anonymous en login.

---

## Fuera de alcance

- Cambio de matriz post-login (T-LOGIN-REDIRECT cerrado).
- Admin → `/admin` (T-FLOW-01).
