# Checklist de seguridad pre-lanzamiento — Gmusic Track A

**Versión:** 1.1  
**Fecha:** 2026-07-06  
**Owner:** Juan (Director) · ejecución auditoría: Cursor  
**Base repo auditada:** `origin/main` @ `9440e45`

---

## Propósito y gobernanza

Checklist canónico para auditorías read-only antes del lanzamiento público. Cada ítem se evalúa como:

| Estado | Significado |
|--------|-------------|
| **OK** | Evidencia en código/config verificada |
| **HALLAZGO** | Riesgo confirmado con evidencia |
| **NO VERIFICABLE** | Requiere verificación manual en prod/dashboards |
| **PENDIENTE DE AUDITAR** | Aún no evaluado |

**Reglas de auditoría:**

1. Solo reportar — no arreglar sin autorización explícita de Juan.
2. Sin evidencia (`archivo:línea` o comando + output) → no es hallazgo.
3. Producción no se asume sana: marcar **NO VERIFICABLE** con instrucción exacta para JP.

> **Nota de procedencia (v1.0):** El checklist A–F original de JP se referenció en chat pero no estaba versionado en el repo al momento de la primera auditoría (6 Jul 2026). Esta v1.0 consolida la estructura inferida de la auditoría inicial **más** los ítems numerados por JP (**10**, **13**, **15**, **18**) y **F19**. Cuando JP entregue el texto verbatim original, sincronizar este archivo en el mismo commit (sin cambiar IDs ya auditados).

---

## Sección A — Secretos y credenciales

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **A1** | Archivos `.env` no trackeados en git | **OK** | Solo `.env.example` en `git ls-files`; `.gitignore` L11–22 |
| **A2** | Perímetro CI: gitleaks, env, keys | **OK** | `.github/workflows/security-scan.yml` activo en remoto |
| **A3** | `.env.example` con placeholders, sin secretos reales | **OK** | `.env.example` L10, L18 — `change-me-*` |
| **A4** | `JWT_SECRET` no en bundle cliente | **OK** | `src/vite-env.d.ts`; `semestral-checkout-flow.test.ts` L125–133 |
| **A5** | `GMUSIC_DEV_ACTIVATION_KEY` no expuesto al browser | **OK** | Mismo test; proxy solo `vite/devActivationProxy.ts` (dev server) |
| **A6** | `passwordHash` excluido de respuestas auth | **OK** | `server/services/authService.ts` L33–37 |
| **A7** | `secureAnswer` filtrado en API lección | **OK** | `server/lib/exercisePublic.ts` L3–11, L60–68 |
| **A8** | Rotación credenciales Supabase/Render/JWT post-incidente P0 | **NO VERIFICABLE** | Ver [Verificación manual A8](#verificación-manual-a8) |
| **A9** | Password admin prod distinta de credencial quemada | **NO VERIFICABLE** | Ver [Verificación manual A9](#verificación-manual-a9); incidente `docs/operations/incident-2026-07-02-admin-credential.md` |

### Verificación manual A8

JP en dashboards (no asumir “creo que sí”):

1. **Render** → servicio `gmusic-api` → Environment → confirmar `JWT_SECRET` ≥32 chars, rotado post-incidente Jul 2026.
2. **Supabase** → Settings → Database → password de DB rotada si aplicó al incidente.
3. Registrar fecha de confirmación en tabla abajo.

| Campo | Valor |
|-------|-------|
| Verificado por | _pendiente Juan_ |
| Fecha | _pendiente_ |
| JWT_SECRET rotado | ☐ |
| DB password rotada | ☐ |

### Verificación manual A9

1. Supabase → tabla `User` → fila `role=ADMIN` → `passwordHash` bcrypt válido (no hash de `GmusicAdmin2026!`).
2. Login `/admin` con clave nueva → OK; clave vieja → rechazada.
3. Runbook: `docs/operations/manual-student-activation.md`, script `scripts/rotate-admin-password.mjs`.

| Campo | Valor |
|-------|-------|
| Verificado por | _pendiente Juan_ |
| Fecha | _pendiente_ |
| Login clave nueva OK | ☐ |
| Login clave vieja rechazado | ☐ |

---

## Sección B — Superficie API

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **B1** | Admin `/api/v1/admin/*` exige rol ADMIN | **OK** | `server/routes/admin.ts` L21; `requireAdmin.ts` L36–37 |
| **B2** | Zona alumno exige STUDENT | **OK** | `realStudentAuth.ts` L36–37 |
| **B3** | `devStudentAuth` no montado en rutas reales | **OK** | `grep devStudentAuth server/` → tests + middleware, no rutas prod |
| **B4** | Registro no crea Subscription automática | **OK** | `authService.ts` L24–38 |
| **B5** | CORS allowlist explícito | **OK** | `server/lib/cors.ts` L20–28 |
| **B6** | Rate limiting / brute-force en auth | **HALLAZGO** (medio) | Sin `rateLimit`/`helmet` en `server/` — **backlog**, fuera de bloque F19 |
| **B7** | Endpoints `/api/v1/dev/*` bloqueados en producción | **OK** (código) · **NO VERIFICABLE** (curl prod) | `devActivationGate.ts` L28–31; tests `dev-activate-semestral.test.ts`, `dev-student-session.test.ts` L184–220 |

### Verificación manual B7

```bash
curl -sS -o /dev/null -w "%{http_code}\n" -X POST \
  https://gmusic-api.onrender.com/api/v1/dev/activate-semestral \
  -H "Content-Type: application/json" -d '{"email":"probe@test.local"}'
# Esperado: 404 (no 200/201)
```

| Campo | Valor |
|-------|-------|
| HTTP code observado | _pendiente Juan_ |
| Fecha | _pendiente_ |
| Resultado | ☐ OK (404) · ☐ HALLAZGO |

**Riesgo residual B7:** `activateSemestralSubscription` crea subs ACTIVE — impacto **crítico** si el gate fallara; hoy `NODE_ENV === "production"` → 404 en `devActivationGate.ts` L28–31.

---

## Ítems transversales (numeración JP)

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **10** | **IDOR:** alumno no puede leer/escribir progreso de otro manipulando IDs en API | **OK** | Ver [Anexo B — ítem 10](#anexo-b--auditoría-complementaria-2026-07-06-ciclo-2) |
| **13** | **XSS almacenado Comunidad:** posts sanitizan/escapan HTML | **OK** (post-fix Ciclo 3) | `parseCreateCommunityPostBody.ts` + `normalizeMaterialUrl`; test `parse-create-community-post.test.ts` |
| **15** | **Errores prod:** respuestas no filtran stack traces | **OK** (código) · **NO VERIFICABLE** (prod) | Ver Anexo B — ítem 15 |
| **18** | **Postgres:** cliente no accede directo; todo vía API | **OK** | Ver Anexo B — ítem 18 |

---

## Sección C — Auth y sesión

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **C1** | Cookie `HttpOnly` | **OK** | `server/lib/jwtSession.ts` L52 |
| **C2** | Prod: `Secure` + `SameSite=None` | **OK** | `jwtSession.ts` L43–44, L57–58 |
| **C3** | JWT `sub` = `userId` | **OK** | `jwtSession.ts` L19–21 |
| **C4** | bcrypt ≥10 rounds | **OK** | `authService.ts` L8, L22 |
| **C5** | API exige JWT en prod al arrancar | **OK** | `server/index.ts` L5 + `assertJwtSecretConfigured()` |
| **C6** | Fallback dev JWT solo dev/test | **OK** | `server/config.ts` L7–15 |
| **C7** | Cookie path `/api/v1` acotado | **OK** | `jwtSession.ts` L6 |

---

## Sección D — Cliente / exposición frontend

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **D1** | Solo `VITE_*` públicos documentados | **OK** | `src/vite-env.d.ts` |
| **D2** | Mocks path/dashboard explícitos | **OK** | `gmusic-api/config.ts` L62–66 |
| **D3** | PostHog key en cliente (esperado) | **OK** | `src/main.tsx` L11 |
| **D4** | Rewrites SPA funnel en prod | **NO VERIFICABLE** | JP: Vercel → rewrites; `docs/deploy/checklist-track-a.md` |

---

## Sección E — Dependencias y CI

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **E1** | `security-scan.yml` en GitHub | **OK** | Remoto: workflow activo |
| **E2** | `npm audit --omit=dev --audit-level=high` limpio | **HALLAZGO** (medio) | 4 high en cadena `vite` (devDependency) — **backlog** |
| **E3** | `package-lock.json` versionado | **OK** (post-fix Ciclo 3) | Lockfile en repo; removido de `.gitignore` |
| **E4** | Doc/skill alineado con workflows reales | **HALLAZGO** (bajo) | `gmusic-ci-deploy/SKILL.md` vs remoto sin `ci.yml` |

---

## Sección F — Infra y deploy

| ID | Criterio | Estado | Evidencia / notas |
|----|----------|--------|-------------------|
| **F1** | Deploy Vercel + Render auto on push | **OK** (operativo) | Histórico smoke prod JWT OK |
| **F2** | Prisma baseline prod (R-OPS-01) | **HALLAZGO** (medio) | `.agents/DECISIONS.md` R-OPS-01 |
| **F3** | Sentry configurado en prod | **NO VERIFICABLE** | JP: env `SENTRY_DSN`, `VITE_SENTRY_DSN` |
| **F4** | `x-powered-by` deshabilitado | **OK** | `server/app.ts` L17 |
| **F19** | **CI verify** (typecheck → tests → build) en GitHub antes de deploy | **OK** (post-fix Ciclo 3) | `.github/workflows/ci.yml` — CI-on-push; sin branch protection (decisión JP 6 Jul) |

### F19 — Implicación deploy actual

1. Push `main` → GitHub corre gitleaks/npm-audit (no verify funcional).
2. Vercel build frontend (sin suite de tests).
3. Render build/start API (sin tests previos en CI).
4. **No hay gate** que exija tests en verde antes de deploy automático.

**Decisión JP (6 Jul 2026):** CI-on-push primero; **sin** branch protection (solo dev + Loop como gate humano).

**Implementado Ciclo 3:**

- `.github/workflows/ci.yml` commiteado
- Secret `DATABASE_URL` en GitHub (para `api:test`; skip graceful si ausente)
- **E3:** `package-lock.json` versionado
- **13c:** `normalizeMaterialUrl` en Comunidad

**Mejora futura (fuera de este ciclo):** deploy gating en Vercel/Render para esperar CI verde antes de prod.

---

## Tabla resumen de hallazgos

| ID | Severidad | Hallazgo | Acción |
|----|-----------|----------|--------|
| **F19** | **Alto** | ~~CI verify ausente~~ | **Cerrado Ciclo 3** — `ci.yml` CI-on-push |
| **13** | **Medio** | ~~`external_url` sin http(s)~~ | **Cerrado Ciclo 3** — `normalizeMaterialUrl` |
| **E3** | **Medio** | ~~Lockfile gitignored~~ | **Cerrado Ciclo 3** — lockfile versionado |
| **B6** | **Medio** | Sin rate limit auth | Backlog ticket |
| **E2** | **Medio** | 4 high vite (dev) | Backlog ticket |
| **F2** | **Medio** | R-OPS-01 Prisma baseline | Ops |
| **E4** | **Bajo** | Doc drift ci.yml | Sync skill |
| **D4** | **Bajo** | Rewrites SPA no verificados | Smoke deploy JP |

**Sin hallazgo crítico** en secretos trackeados ni en B7 por código/tests.

---

## Anexo A — Auditoría inicial 2026-07-06 (Ciclo 1)

Auditoría read-only sobre `9440e45`. Marco: solo reporte, sin cambios en código/config.

Copia consolidada del reporte Cursor del 6 Jul 2026 (estructura inferida A–F + F19). Los ítems **10**, **13**, **15**, **18** quedaron **PENDIENTE DE AUDITAR** en este anexo y se cerraron en Anexo B.

<details>
<summary>Contenido completo auditoría inicial (expandir)</summary>

### Prioridad inmediata — A + B7

- **A1–A7:** OK (ver tablas Sección A).
- **A8, A9:** NO VERIFICABLE — verificaciones manuales arriba.
- **B7:** OK código + tests; NO VERIFICABLE curl prod.

### Sección B

- B1–B5, B7: OK.
- B6: HALLAZGO medio — sin rate limit.

### Sección C

- C1–C7: OK.

### Sección D

- D1–D3: OK.
- D4: NO VERIFICABLE.

### Sección E

- E1: OK.
- E2: HALLAZGO medio — vite dev vulns.
- E3: HALLAZGO medio — lockfile gitignored.
- E4: HALLAZGO bajo — doc drift.

### Sección F

- F1, F4: OK.
- F2: HALLAZGO medio.
- F3: NO VERIFICABLE.
- **F19:** HALLAZGO alto — gap CI verify.

</details>

---

## Anexo B — Auditoría complementaria 2026-07-06 (Ciclo 2)

Read-only · base `9440e45` · orden: **13 → 10 → 15 → 18**

### Ítem 13 — XSS almacenado en Comunidad

| Sub-aspecto | Resultado | Evidencia |
|-------------|-----------|-----------|
| **13a** Contenido texto (`content`) | **OK** | `CommunityPostCard.tsx` L90–91 — `{post.content}` en nodo texto React (escape automático, sin `dangerouslySetInnerHTML`) |
| **13b** Persistencia servidor | **OK** (para HTML en body) | `parseCreateCommunityPostBody.ts` L58–61 — string plano; no se interpreta HTML en servidor |
| **13c** Enlaces externos (`external_url`) | **OK** (post-fix Ciclo 3) | `parseCreateCommunityPostBody.ts` — `normalizeMaterialUrl(..., "Enlace externo")`; test rechazo `javascript:` |
| **13d** Tests | **HALLAZGO** (bajo) | `parse-create-community-post.test.ts` — caso YouTube https; **sin** test rechazo `javascript:` (contraste: `normalizeMaterialUrl.test.ts` L19–21) |

**Severidad ítem 13:** medio — HTML en cuerpo de post mitigado por React; riesgo residual en URLs externas.

**Fix sugerido (post-autorización):** aplicar `normalizeMaterialUrl` (o equivalente) a `externalUrl` en `parseCreateCommunityPostBody.ts` + test regresión.

---

### Ítem 10 — IDOR progreso entre usuarios

| Endpoint / flujo | Resultado | Evidencia |
|------------------|-----------|-----------|
| `POST /lesson-sessions` (start) | **OK** | `lessonSessionService.ts` L30–32, L48–50 — `student.id` en queries; no acepta `userId` del cliente |
| `POST /lesson-sessions/:id/complete` | **OK** | `completeLessonSessionService.ts` L51–62 — `preliminary.userId !== student.id` → 403 FORBIDDEN |
| `GET /me/dashboard`, `/me/path`, `/me/access` | **OK** | `me.ts` L13–34 — `assertStudent(req)`; servicios filtran por `student.id` (`meService.ts` L19–20) |
| Rutas con `:userId` arbitrario | **OK** | No hay rutas alumno con param `userId` en `server/routes/` |
| Test regresión IDOR | **OK** | `phase3b2.test.ts` L236–248 — “rechaza sesión de otro alumno” → 403 |

**Severidad ítem 10:** ningún hallazgo — controles de ownership en sesiones y scope por JWT.

---

### Ítem 15 — Stack traces en errores producción

| Aspecto | Resultado | Evidencia |
|---------|-----------|-----------|
| Handler genérico 500 | **OK** | `server/app.ts` L58–62 — `console.error` solo servidor; cliente recibe `errorBody("INTERNAL_ERROR", "Error interno del servidor.")` |
| `ApiError` controlado | **OK** | L54–55 — solo `err.code` + `err.message` (mensajes definidos en servicios, no stack) |
| Sentry | **NO VERIFICABLE** | L43–44, L59–60 — si DSN configurado, excepciones van a Sentry (no al cliente) |
| Prod real ante 500 | **NO VERIFICABLE** | JP: provocar error controlado o revisar respuesta JSON en Render logs vs body HTTP |

**Verificación manual JP (15):**

```bash
# Respuesta no debe contener "at ", "stack", rutas /Users/, node_modules
curl -sS https://gmusic-api.onrender.com/api/v1/ruta-inexistente | jq .
# Esperado: {"error":{"code":"INTERNAL_ERROR","message":"Ruta no encontrada."}}
```

---

### Ítem 18 — Acceso directo cliente → Postgres

| Aspecto | Resultado | Evidencia |
|---------|-----------|-----------|
| Prisma solo servidor | **OK** | `@prisma/client` / `prisma` importado en `server/`; **no** en `src/` |
| Supabase client en frontend | **OK** | Sin `createClient` / `@supabase` en `src/` (solo mención histórica en `src/imports/`) |
| `DATABASE_URL` en bundle | **OK** | `src/vite-env.d.ts` — solo `VITE_*`; test `semestral-checkout-flow.test.ts` L125–133 |
| Cliente → API | **OK** | `gmusic-api/client.ts` — fetch a `/api/v1`; prod vía `VITE_API_BASE_URL` o default Render |

**Severidad ítem 18:** ningún hallazgo — Postgres accesible solo desde API Render.

---

## Historial de versiones

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 1.0 | 2026-07-06 | Checklist versionado + Anexo A (auditoría inicial) + Anexo B (ítems 10, 13, 15, 18) + F19 |
| 1.1 | 2026-07-06 | Ciclo 3: F19 + E3 + fix 13c (`normalizeMaterialUrl` Comunidad) |

---

## Pendientes operativos (fuera de checklist)

| Ticket | Estado |
|--------|--------|
| B6 rate limit | Backlog |
| E2 npm audit vite | Backlog |
| Deploy gating Vercel/Render post-CI | Mejora futura |
| Verificaciones manuales B7, A8, A9, 15-prod | Juan |
