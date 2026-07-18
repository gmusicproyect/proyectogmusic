# 04 — Autenticación y usuarios (Track A)

## 0. Metadatos

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-15 |
| **Autor** | Cursor (ejecutor) · supervisión Juan |
| **Versión** | 1.0 |
| **Estado** | **APROBADO / TERMINADA** — **D-F4-001** (2026-07-15) · canónico Auth Track A |
| **SHA ref. auditoría** | `e5b161c` · rama `main` |
| **Prerreqs** | **D-F1-001** · **D-F2-001** · **D-F3-001** · DoD `docs/quality/definition-of-done.md` |
| **Política auth** | **D-ROAD-005 A** · **D-ROAD-002** (JWT IN · email verify WON'T) |
| **Instrucción** | `docs/roadmap/fase-4-instruccion.md` |
| **Decisión** | **D-F4-001** · **D-F4-WIP** supersedido |

---

## 1. Propósito y alcance

Documento **canónico** de autenticación Track A (Vite + React + Express + Prisma). Permite a otro agente o desarrollador entender auth **sin leer todo el server**.

| Cubre | No cubre (prohibido / fuera) |
|-------|------------------------------|
| Registro, login, logout, cookie JWT | Email verification (producto) — **WON'T** |
| Guards FE/BE, roles, D-017 ACTIVE | NextAuth / Auth.js / OAuth / Track B |
| Política MUST/SHOULD/WON'T/BRIDGE | Fase 5 pasarelas (Stripe / Mercado Pago) |
| Recovery admin (ops) + BRIDGE alumno | Schema Prisma greenfield |
| Criterios de prueba + deuda docs | Edición de perfil alumno (OUT post-MVP) |
| Gaps / tickets sugeridos (solo doc) | Mitigar R-001 / R-002 sin decisión nueva |

**Regla de oro:** JWT liviana **ya está shipped e IN MVP**. Fase 4 **documenta** la verdad del repo; no inventa auth desde cero. Conflicto docs vs código → gana **código + tests + D-ROAD-005**.

---

## 2. Política auth MVP (congelada)

Fuente: `docs/product/01-mvp-gmusic.md` § Auth + **D-ROAD-005 A**.

| Capacidad | Clasificación | Estado repo | Nota |
|-----------|---------------|-------------|------|
| Registro | **MUST** | existe | `Role.STUDENT` · `AccountTier.DEMO` · sin sub |
| Login | **MUST** | existe | STUDENT \| ADMIN; GUARDIAN → 403 |
| Logout | **MUST** | existe | clear cookie `gmusic_session` |
| Sesión JWT cookie | **MUST** | existe | HttpOnly · Path `/api/v1` · TTL 8h |
| Protección rutas (demo + zona alumno) | **MUST** | existe | FE + BE |
| Subscription ACTIVE (D-017) | **MUST** | completa | Sin ACTIVE → no zona alumno |
| Admin `requireAdmin` | **MUST** (acceso admin) | existe | Credencial segura = P0 ops |
| Email verification | **WON'T** | inexistente | No implementar |
| Password recovery **alumno** | **BRIDGE** | inexistente self-service | Ops/WA — ver §7 |
| Password recovery **admin** | Ops (existe) | endpoint + UI | Clave `ADMIN_PASSWORD_RESET_KEY` |
| Roles avanzados (GUARDIAN UI) | **SHOULD** / post-MVP | schema only | Latente |
| Edición perfil alumno | **OUT** / post-MVP | inexistente canónica | Juan 2026-07-15 |
| NextAuth / OAuth | **WON'T** | inexistente | Track B / cartel ≠ stack |

---

## 3. Modelo de usuario y roles

Evidencia: `prisma/schema.prisma`.

### Enums

| Enum | Valores |
|------|---------|
| `Role` | `STUDENT` · `GUARDIAN` · `ADMIN` |
| `AccountTier` | `DEMO` · `SUBSCRIBER` |
| `SubscriptionStatus` | `ACTIVE` · `PAST_DUE` · `CANCELED` |

### `User` (campos auth-relevantes)

| Campo | Uso |
|-------|-----|
| `id` | UUID · `sub` del JWT |
| `email` | único · normalizado lower |
| `name` | display |
| `passwordHash` | bcrypt (nunca en JSON cliente) |
| `role` | default `STUDENT` |
| `accountTier` | default `DEMO` al registrar |
| `phone` | opcional (WhatsApp) |

### Roles — UI vs latente

| Role | Login API | UI producto | BE guard |
|------|-----------|-------------|----------|
| **STUDENT** | sí | Registro/login alumno · demo · zona alumno (si ACTIVE) | `realStudentAuth` |
| **ADMIN** | sí (mismo `/auth/login`) | `/admin` (R-008) + reset ops | `requireAdmin` |
| **GUARDIAN** | **no** (403) | sin UI familias | schema + `GuardianLink` latente |

### `Subscription` + D-017

Registro **no** crea `Subscription` (D-015). Zona alumno exige al menos una fila `ACTIVE` vigente (`endsAt` null o futura) — ver §6.

### `GuardianLink`

Latente (familia / multi-perfil Elvis OUT de este documento).

---

## 4. Flujo registro / login / logout / sesión

```text
Visitante
   │  POST /api/v1/auth/register  → Set-Cookie gmusic_session
   │  POST /api/v1/auth/login     → Set-Cookie gmusic_session
   ▼
Sesión JWT (HttpOnly, Path=/api/v1, max-age 28800)
   │
   ├─ GET /api/v1/me/access  (realStudentAuth)
   │     ├─ 401 → anonymous
   │     ├─ 200 + canAccessStudentZone:false → registered_no_sub
   │     └─ 200 + canAccessStudentZone:true  → authenticated (ACTIVE)
   │
   └─ POST /api/v1/auth/logout → clear cookie
```

### Endpoints

Montaje: `server/app.ts` → `/api/v1/auth` · `/api/v1/me`.

| Método | Path | Handler | Respuesta |
|--------|------|---------|-----------|
| `POST` | `/api/v1/auth/register` | `auth.ts` → `registerStudent` | `201` `{ user }` + cookie |
| `POST` | `/api/v1/auth/login` | `auth.ts` → `loginStudent` | `200` `{ user }` + cookie |
| `POST` | `/api/v1/auth/logout` | `auth.ts` | `204` + clear cookie |
| `POST` | `/api/v1/auth/admin/reset-password` | `resetAdminPassword` | `204` (sin cookie sesión) |
| `GET` | `/api/v1/me/access` | `me.ts` + `accessService` | JSON acceso |

Archivos clave:

| Capa | Path |
|------|------|
| Router | `server/routes/auth.ts` |
| Servicio | `server/services/authService.ts` |
| Validación body | `server/lib/parseAuthBody.ts` |
| JWT / cookie | `server/lib/jwtSession.ts` |
| Cliente FE | `src/app/services/gmusic-api/auth.ts` |
| Hook | `src/app/hooks/useAuth.tsx` |
| Sesión pública | `src/app/hooks/usePublicStudentSession.ts` · `public-student-session.ts` |
| UI registro/login | `src/app/pages/RegistroCuentaPage.tsx` (`RegistroCuentaPage` · `LoginCuentaPage` · `RegistroExitoPage`) |
| Post-login | `src/app/services/gmusic-api/resolve-post-login-page.ts` |

### Cookie contract (verdad del código)

| Atributo | Valor |
|----------|-------|
| Nombre | `gmusic_session` |
| Algoritmo | HS256 (`jose`) |
| Payload | solo `sub` = userId (sin email/role) |
| Secret | `JWT_SECRET` (vía `server/config`) |
| `HttpOnly` | sí |
| `Path` | `/api/v1` |
| `Max-Age` | `28800` (8 h) |
| `SameSite` | **prod:** `None` (+ `Secure`) · **dev:** `Lax` — `resolveSessionCookieSameSite` |
| Credentials FE | `credentials: "include"` en fetch auth/me |

> **Nota deuda skill:** `.agents/skills/gmusic-auth-email-verification/SKILL.md` declara `SameSite=Strict`. **Incorrecto** frente a `jwtSession.ts` (cross-origin Vercel SPA + Render API necesita `None` en prod). Prevalece el código.

### Validación registro

- Nombre requerido ≤ 100 chars  
- Email válido normalizado  
- Password ≥ 8 → si no, `422 WEAK_PASSWORD`  
- Email duplicado → `409 EMAIL_TAKEN`  
- bcrypt rounds = 10  

### URLs FE auth

| `currentPage` | URL | Propósito |
|---------------|-----|-----------|
| `registro-cuenta` | `/registro-cuenta` | Alta alumno |
| `login-cuenta` | `/login-cuenta` | Login |
| `registro-exito` | (interna) | Celebración → onboarding-quiz |

Post-login (`resolvePostLoginPage`):

| Outcome sesión | Destino |
|----------------|---------|
| `authenticated` | `mi-camino` |
| `registered_no_sub` | `mi-camino-demo` |
| `anonymous` / `error` | stay + mensaje (cookies / reintento) |

---

## 5. Protección de rutas

### Frontend

| Guard | Archivo | Qué exige | Dónde se usa (`App.tsx`) |
|-------|---------|-----------|---------------------------|
| **DemoAuthGuard** | `src/app/components/gmusic/DemoAuthGuard.tsx` | sesión logged-in (`registered_no_sub` \| `authenticated`) | demo path / clases demo · si no → `registro-cuenta` |
| **StudentZoneGuard** | `src/app/components/gmusic/StudentZoneGuard.tsx` | `useStudentAccess` → `canAccessStudentZone` | `/alumno` · `/mi-camino` · community zona · denied → home planes |
| Gate helpers | `src/app/utils/demo-auth-gate.ts` | entrada demo vs anonymous | navegación funnel |

`StudentZoneGuard` estados UI: `loading` · `error` (reintentar) · `denied` (redirect) · ok → children.

### Backend

| Middleware | Archivo | Regla |
|------------|---------|-------|
| **realStudentAuth** | `server/middleware/realStudentAuth.ts` | JWT válido + `Role.STUDENT` → `req.student` |
| **requireAdmin** | `server/middleware/requireAdmin.ts` | JWT válido + `Role.ADMIN` → `req.admin` |
| **devStudentAuth** | `server/middleware/devStudentAuth.ts` | **Legacy** — **no** montado en routers reales (D-017) |

| Router | Auth |
|--------|------|
| `meRouter` (`/api/v1/me/*`) | `realStudentAuth` |
| `adminRouter` (`/api/v1/admin/*`) | `requireAdmin` |
| `authRouter` | público (register/login/logout/admin-reset) |

---

## 6. Entitlements D-017

Fuentes: `server/lib/studentAccess.ts` · `server/services/accessService.ts` · `docs/operations/student-access-states.md` · `.agents/DECISIONS.md` D-017.

| Estado FE | Condición API | Experiencia |
|-----------|---------------|-------------|
| **anonymous** | 401 sin JWT válido | registro/login; demo bloqueado → registro |
| **registered_no_sub** | 200 + `canAccessStudentZone: false` | demo 5 clases; **no** `/alumno` suscriptor |
| **authenticated** | 200 + ACTIVE vigente | Mi Estudio / Mi Camino |

Regla: `status === ACTIVE` y (`endsAt === null` ∨ `endsAt > now`). Selección multi-sub: vencimiento más lejano; `null` gana; desempate por `id`.

Activación manual hasta Fase 5: `docs/operations/manual-student-activation.md` (D-019).

**Fase 4 no rediseña entitlements.**

---

## 7. Recuperación de contraseña

### Admin — existe (ops)

| Pieza | Path / doc |
|-------|------------|
| API | `POST /api/v1/auth/admin/reset-password` |
| Servicio | `authService.resetAdminPassword` + `adminPasswordResetGate` |
| UI | `/admin` — «¿Olvidaste tu contraseña?» |
| Runbook | `docs/operations/admin-recuperacion-contrasena.md` |
| Env | `ADMIN_PASSWORD_RESET_KEY` (API Render; nunca Vercel SPA) |
| Fallback local | `scripts/rotate-admin-password.mjs` |

No emite cookie de sesión; login manual después.

### Alumno — **BRIDGE** (decisión Juan 2026-07-15)

| Qué | Estado |
|-----|--------|
| Endpoint self-service forgot-password | **inexistente** |
| UI «olvidé mi contraseña» en `LoginCuentaPage` | **inexistente** |
| Email reset magic link | **WON'T** (sin verify pipeline) |

**BRIDGE documentado (lanzamiento OK sin feature):**

1. Alumno contacta **WhatsApp** `56953429676` o a Juan.  
2. Ops verifica identidad por canal humano acordado.  
3. Ops restablece `passwordHash` con procedimiento autorizado (bcrypt ≥ 8 chars) — **sin** endpoint público alumno; no usar `ADMIN_PASSWORD_RESET_KEY` para alumnos.  
4. Alumno recibe nueva clave por canal seguro y hace login en `/login-cuenta`.  
5. Si no hay `passwordHash` (cuenta legacy): escalar a Juan — no tratar como activación estándar (`manual-student-activation.md`).

Ticket opcional post-MVP (no creado en backlog esta pasada): `T-AUTH-PASSWORD-RECOVERY` — solo si Juan prioriza self-service.

---

## 8. Perfiles

| Capacidad | Estado | Clasificación |
|-----------|--------|---------------|
| Edición nombre / email / password alumno (API + UI canónica) | inexistente | **OUT / post-MVP** (Juan 2026-07-15) |
| `ProfileHeader` en `DashboardPage` | mock/legacy DEV | no contrato zona alumno |
| Campo `username` / artistName | comentario pendiente migración en `RegistroCuentaPage` | fuera MVP |

Ticket reservado (no abrir sin OK): `T-AUTH-PROFILE-EDIT`.

---

## 9. Matriz audit (existe / parcial / gap)

Revalidada 2026-07-15 · HEAD `e5b161c`.

| Capacidad | Estado | ¿Bloquea MVP? | Evidencia |
|-----------|--------|---------------|-----------|
| Registro | existe | No | `auth.ts` · `registerStudent` · `RegistroCuentaPage` |
| Login | existe | No | `loginStudent` · `LoginCuentaPage` |
| Logout | existe | No | `appendSessionClearCookie` · `logoutAccount` / `performPublicLogout` |
| JWT sesión | existe | No | `jwtSession.ts` |
| Email verify | inexistente | No | WON'T |
| Recovery alumno | **BRIDGE** | No | §7 |
| Recovery admin | existe | Ops P0 aparte | `admin/reset-password` |
| Role STUDENT | existe + uso | No | register default |
| Role ADMIN | existe + UI | Credencial = P0 ops | `requireAdmin` · `/admin` |
| Role GUARDIAN | schema only | No | post-MVP |
| DemoAuthGuard | existe | No | `DemoAuthGuard.tsx` |
| StudentZoneGuard | existe | No | + `useStudentAccess` |
| realStudentAuth / requireAdmin | existe | No / sí si bypass | middleware |
| D-017 ACTIVE | completa | Sí si se rompe | `studentAccess.ts` |
| Perfil edición | inexistente | No | OUT |
| NextAuth | inexistente | N/A | WON'T |

**Conclusión:** sin gap MUST de “auth ausente”. Trabajo Fase 4 = documental + política + BRIDGE + higiene lista docs.

---

## 10. Docs desfasados y reconciliación

**Tratamiento esta pasada:** solo **listar** deuda (autorización Juan). **Sin** reescritura masiva de `CLAUDE.md` / skills / AGENTS.

| Fuente | Problema | Acción sugerida (ticket / pasada futura) |
|--------|----------|------------------------------------------|
| `CLAUDE.md` | “Fase 4 Auth pausada” / condicionada a WA como si no hubiera JWT | Alinear a D-ROAD-005 A · JWT IN · verify WON'T |
| `.agents/PROJECT_STATUS.md` (secciones históricas) | “Fase 4 Auth real pausada”; desbloqueo WA | Hito F4 WIP ya actualizado arriba; limpiar texto histórico en pasada docs |
| `.agents/DECISIONS.md` D-005 literal | “Auth real no hasta conversión WA” | Histórico de **infra pesada**; prevalece **D-ROAD-005**; no borrar JWT |
| Skill `gmusic-auth-email-verification` | Nombre implica verify; body mezcla JWT + verify | Rename → p.ej. `gmusic-auth-session` + corregir `SameSite` Strict→None/Lax |
| Skill SameSite | Declara `Strict` | Alinear a `jwtSession.ts` |
| `docs/operations/admin-recuperacion-contrasena.md` | “Fase 4 auth pendiente” | Actualizar puntero a este `04` |
| Handoffs visión Jun 2026 | “Fase 4 pausada” | SUPERSEDIDOS por D-ROAD-005 / este `04` |
| `AGENTS.md` matriz “futuro gmusic-auth-email-verification” | Naming | Tras rename skill |

Ticket DX opcional: `T-AUTH-DOCS-ALIGN` (no creado en backlog esta pasada — solo documentado).

Pulido copy ya en backlog: **T-UX-COPY-LOGIN** (Baja).

---

## 11. Tickets derivados (sugeridos — no creados)

| ID tentativo | Si Juan… | Prioridad |
|--------------|----------|-----------|
| `T-AUTH-PASSWORD-RECOVERY` | Quiere self-service alumno (sale de BRIDGE) | SHOULD — no bloquea launch |
| `T-AUTH-DOCS-ALIGN` | Autoriza higiene CLAUDE/skill/ops text | Docs / DX |
| `T-AUTH-PROFILE-EDIT` | Eleva edición perfil | Post-MVP |
| `T-UX-COPY-LOGIN` | Ya en `backlog.md` | Baja |

---

## 12. Cómo probar

### Automático (referencia)

```bash
npm run verify
```

Áreas de tests útiles (nombres pueden evolucionar; correr suite real):

| Área | Pistas |
|------|--------|
| Sesión pública / logout | `public-session-flow.test.ts` · `public-logout.test.ts` |
| Routing auth URLs | `student-zone-routing.test.ts` |
| Access API | `access.test.ts` · `assert-auth-session` |
| Demo gate | `demo-auth-gate.test.ts` · `anonymous-gate-navigation.test.ts` |
| API auth / student access | suite `api:test` (authService / studentAccess) |

Cifra de tests: **correr `npm run verify`** — no hardcodear de specs viejos. Esta pasada F4 = **docs-only** → verify completo N/A para cierre documental; sí aplica si hubiera código.

### Manual smoke (local o staging)

1. **Registro:** `/registro-cuenta` → cuenta nueva → cookie → `registro-exito` → quiz/demo.  
2. **Login registered_no_sub:** `/login-cuenta` → `mi-camino-demo`; `/alumno` bloqueado.  
3. **Login authenticated:** cuenta con `Subscription ACTIVE` → `mi-camino`; guard pasa.  
4. **Logout:** cierra sesión → `/me/access` 401 · demo exige registro.  
5. **GUARDIAN:** si existe en BD, login → 403.  
6. **Admin:** login admin → `/admin`; reset con clave ops (entorno con key).  
7. **Sin email verify:** registro usable inmediata — correcto (WON'T).

DoD producto §7.2–§7.3 (`01-mvp-gmusic.md`): auth sin verify + D-017 ACTIVE.

---

## 13. Fuera de alcance / riesgos

| Ítem | Tratamiento |
|------|-------------|
| **INC-admin-cred** (credencial admin prod) | P0 **ops** — documentado en `03` / incidente; **no** “arreglar” por abrir F4 |
| **R-OPS-01** (baseline Prisma prod) | Ops — fuera F4 feature |
| **R-001 / R-002** | No mitigar sin decisión |
| Fase 5 Stripe/MP / webhooks pago | **NO** abierta |
| Track B NextAuth | **WON'T** |
| Schema verify / OAuth ids | Prohibido sin gobernanza |
| Prod DB seeds a ciegas | Prohibido |
| Commit / push autónomo | Regla Director |

### Bugs P0 producto (auditoría esta pasada)

| Bug P0 auth runtime | Hallazgo |
|---------------------|----------|
| — | **Ninguno nuevo** en happy path registro/login/logout/guards/D-017 |

Ops P0 preexistentes (no son bugs de feature F4): INC-admin-cred · R-OPS-01 — ver `docs/setup/03-entorno-desarrollo.md` §15.

Inconsistencias doc/skill (SameSite, “auth pausada”) = **deuda docs**, no P0 código.

---

## 14. Aprobación (cierre Fase 4)

Fase 4 **TERMINADA**. `docs/features/04-auth-usuarios.md` es el documento **canónico Auth Track A**. **D-F4-001**.

| Campo | Valor |
|-------|-------|
| Lectura `04` completa | ✅ |
| Política A coherente (JWT MUST · verify WON'T · recovery BRIDGE) | ✅ |
| Sin NextAuth / email verify / schema / Fase 5 en esta ejecución | ✅ |
| Aprobado como canónico Auth Track A | ✅ |

```text
OK Juan §14 — apruebo docs/features/04-auth-usuarios.md como documento canónico Auth Track A.
Fecha: 2026-07-15
Firma / mensaje: OK Juan §14. Declaro Fase 4 TERMINADA (D-F4-001). Fase 5 NO queda autorizada. Sin commit/push.
Decisión: D-F4-001
```

Control roadmap: Fase 4 **TERMINADA** · Fase 5 **NO INICIADA** / no autorizada (sin OK nuevo).

---

*Fin `04-auth-usuarios.md` · v1.0 · APROBADO (**D-F4-001**) · 2026-07-15 · sin código producto · sin commit/push.*
