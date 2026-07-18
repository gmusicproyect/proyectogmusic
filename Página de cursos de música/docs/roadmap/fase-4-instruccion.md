# Instrucción Fase 4 — Autenticación y usuarios

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de producto/docs — **no** es el documento `04` final ni autorización de código.  
> **Duración poster Fase 4:** ~1–2 semanas (docs de feature + gaps auth MUST/SHOULD acotados tras OK ejecución).  
> **Estado de esta instrucción:** lista · **Fase 4 TERMINADA** (**D-F4-001**, 2026-07-15) — `docs/features/04-auth-usuarios.md` = canónico Auth Track A · §14 firmado · **D-F4-WIP** supersedido.  
> **Gate inicio ejecución:** cumplido (OK Juan ejecutar Fase 4). **Gate cierre:** cumplido (OK Juan §14 · **D-F4-001**). Fase 5 **no** autorizada.  
> **SHA referencia auditoría brief / ejecución:** `e5b161c` · rama `main`.

---

## Propósito de esta instrucción

Esta instrucción es el **contrato de trabajo** para, cuando Juan autorice ejecución, producir el documento de feature:

`docs/features/04-auth-usuarios.md`

| Es | No es |
|----|--------|
| Guía profunda para auditar, clasificar y documentar auth Track A ya shipped | Autorización a reescribir JWT / NextAuth / email verify |
| Matriz existe / parcial / bloquea MVP / post-MVP anclada a D-ROAD-005 A + MVP congelado | Implementación de código en esta pasada de brief |
| Plantilla exacta que `04-*` debe rellenar en la **ejecución** | Crear `04-auth-usuarios.md` ahora (este brief) |
| Puente entre F1–F3 cerradas y “auth usable + política clara” | Fase 5 pagos / Track B / schema greenfield |
| Lista de posibles tickets `T-AUTH-*` (si el `04` lo justifica) | Crear tickets en backlog/código en esta pasada |

**Regla de oro:** JWT liviana **ya está IN MVP** (D-ROAD-005 A / D-ROAD-002). Fase 4 **no inventa auth desde cero**. Documenta la verdad del repo, cierra gaps MUST remanentes (si los hay), declara SHOULD/BRIDGE/WON'T, y alinea docs “auth pausada” desfasados — **sin** reabrir el MVP congelado (**D-F1-001**).

### Qué NO es Fase 4

- Email verification (producto) — **WON'T** MVP.  
- NextAuth / Auth.js / OAuth Google / Track B.  
- Cambiar algoritmo JWT, cookie contract o secrets en prod sin decisión + ops Juan.  
- Schema Prisma nuevo (tablas, enums) sin decisión de gobernanza.  
- Fase 5 pasarelas (Stripe / Mercado Pago UI).  
- Features Mi Progreso / Comment / T-PUB / T-UX-LESSON disfrazadas de “auth”.  
- Mitigar R-001 / R-002 sin decisión nueva.  
- Commit / push autónomo.

---

## Prerrequisitos

Antes de que el ejecutor redacte `04-auth-usuarios.md` (o toque código auth), deben cumplirse:

| # | Prerrequisito | Estado (al escribir esta instrucción) |
|---|---------------|----------------------------------------|
| 1 | **D-F1-001** — MVP Track A congelado | ✅ |
| 2 | **D-F2-001** — arquitectura / modelo aprobados | ✅ |
| 3 | **D-F3-001** — entorno `03` guía oficial Track A | ✅ |
| 4 | DoD permanente `docs/quality/definition-of-done.md` | ✅ |
| 5 | Decisiones A–D (**D-ROAD-005**), Auth = A | ✅ |
| 6 | Esta instrucción leída y aceptada como método | ✅ creada · pendiente gate Juan |
| 7 | **OK Juan para iniciar ejecución Fase 4** | ✅ 2026-07-15 · ejecución docs |
| 8 | **OK Juan §14 — cierre Fase 4** | ✅ 2026-07-15 · **D-F4-001** |

Sin punto 7 cumplido históricamente: **congelar**. (Cumplido 2026-07-15.) Gate cierre §14 cumplido (**D-F4-001**).

---

## Objetivo de la Fase 4

Lograr **auth usable y política explícita** para el MVP Track A, con este mapa mental:

```text
                    ┌─────────────┐
                    │  Visitante  │
                    └──────┬──────┘
           registro/login  │  (JWT cookie gmusic_session)
                    ┌──────▼──────┐
                    │  Sesión     │  Role: STUDENT | ADMIN
                    │  persistente│  (GUARDIAN = schema latente)
                    └──────┬──────┘
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
     DemoAuthGuard   StudentZoneGuard   requireAdmin
     (demo funnel)   + /me/access       (API + /admin)
                     Subscription
                     ACTIVE (D-017)
           │               │               │
           ▼               ▼               ▼
    demo clases      future /alumno      Admin creador
    + gate           /mi-camino          R-008
                     community…
```

Entregables de **ejecución** (futuro, tras OK Juan):

| Entregable | Rol |
|------------|-----|
| **`docs/features/04-auth-usuarios.md`** | Documento canónico auth Track A (política + matriz + gaps + cómo probar) |
| Tickets opcionales `T-AUTH-*` / updates a `T-UX-COPY-LOGIN` | Solo si el `04` demuestra gap verificable — **no** inventar ticket vacío |
| Ajustes de código **mínimos** y autorizados | Solo gaps MUST MVP o docs/política; NO email verify; NO NextAuth |
| Control roadmap | `etapa-actual` · `changelog` · `PROJECT_STATUS` · opcional `D-F4-*` al cierre |

**Esta pasada (brief):** solo esta instrucción + brief supervisor + control roadmap que diga “brief listo · ejecución NO INICIADA”.

---

## Entradas (fuentes de verdad)

Leer en este orden. Extraer solo lo indicado. **No** inventar endpoints ni roles.

| Path | Qué extraer |
|------|-------------|
| `docs/product/01-mvp-gmusic.md` | MUST/SHOULD/WON'T/BRIDGE auth §5–§6; DoD producto §7.2–§7.3; docs desfasados § lista |
| `docs/roadmap/decisiones.md` | **D-ROAD-002**, **D-ROAD-005 A**, D-F1/F2/F3-001 |
| `.agents/DECISIONS.md` | **D-017** (ACTIVE); D-005/D-006 históricos vs puntero D-ROAD-005 |
| `docs/quality/definition-of-done.md` | Permisos / E2E / verify al cerrar ejecución |
| `docs/setup/03-entorno-desarrollo.md` | JWT_SECRET, cookies local/preview/prod, seeds passwords |
| `docs/project-status/00-inventario-actual.md` | Clasificación auth parcial; B3 docs pausada |
| `docs/architecture/02-modelo-datos.md` / `02-arquitectura-sistema.md` | User/Subscription/Role; no reinventar |
| `prisma/schema.prisma` | `Role`, `SubscriptionStatus`, `User`, `Subscription`, `GuardianLink` |
| `server/routes/auth.ts` | register / login / logout / admin reset-password |
| `server/services/authService.ts` | bcrypt, roles login STUDENT\|ADMIN, register STUDENT |
| `server/lib/jwtSession.ts` | cookie `gmusic_session`, TTL 28800, SameSite |
| `server/middleware/realStudentAuth.ts` | JWT → Role.STUDENT |
| `server/middleware/requireAdmin.ts` | JWT → Role.ADMIN |
| `server/middleware/devStudentAuth.ts` | Legacy — **no** en rutas reales (D-017) |
| `server/routes/me.ts` + `accessService` | `/me/access` + entitlements |
| `src/app/hooks/useAuth.tsx` | register/login/logout FE |
| `src/app/services/gmusic-api/auth.ts` | Cliente API auth |
| `src/app/components/gmusic/StudentZoneGuard.tsx` | Guard zona alumno |
| `src/app/components/gmusic/DemoAuthGuard.tsx` | Guard demo |
| `src/app/pages/RegistroCuentaPage.tsx` | UI registro + login cuenta |
| `docs/operations/student-access-states.md` | Matriz estados acceso |
| `docs/operations/admin-recuperacion-contrasena.md` | Reset admin (ops key) |
| `docs/operations/manual-student-activation.md` | Bridge ACTIVE |
| Skill `gmusic-auth-email-verification` | Nombre desfasado vs JWT-only — documentar, no implementar verify |

**Conflicto docs vs código:** gana código + tests + **D-ROAD-005**. El `04` debe citar la contradicción (p. ej. “auth pausada” / D-005 histórico) y cómo se resuelve en docs — **sin** reabrir MVP.

---

## Evidencia de auditoría (snapshot 2026-07-15 · HEAD `e5b161c`)

Revalidar rutas y comportamientos al **ejecutar**. Snapshot de este brief:

### Backend

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| Registro | `POST /api/v1/auth/register` → `registerStudent` · cookie sesión · `Role.STUDENT` · `AccountTier.DEMO` | **existe** |
| Login | `POST /api/v1/auth/login` · STUDENT \| ADMIN; GUARDIAN → 403 | **existe** |
| Logout | `POST /api/v1/auth/logout` · clear cookie | **existe** |
| JWT | `jose` HS256 · cookie HttpOnly `gmusic_session` · Path `/api/v1` · max-age 8h | **existe** |
| Admin password reset | `POST /api/v1/auth/admin/reset-password` + `ADMIN_PASSWORD_RESET_KEY` | **existe** (ops) |
| Student password reset | Sin endpoint dedicado | **inexistente** |
| Email verify | Sin campos/flujo | **inexistente** (WON'T) |
| Student API guard | `realStudentAuth` en `meRouter` | **existe** |
| Admin API guard | `requireAdmin` | **existe** |
| Access / D-017 | `GET /me/access` + Subscription ACTIVE | **existe** |

### Frontend

| Pieza | Evidencia | Estado audit |
|-------|-----------|--------------|
| Registro / login UI | `RegistroCuentaPage.tsx` (+ rutas `/registro-cuenta`, `/login-cuenta`) | **existe** |
| Hook sesión | `useAuth.tsx` + `usePublicStudentSession` | **existe** |
| Demo gate | `DemoAuthGuard` / `demo-auth-gate.ts` | **existe** |
| Zona alumno | `StudentZoneGuard` + `useStudentAccess` | **existe** |
| Admin UI login/reset | `AdminPage.tsx` | **existe** |
| Perfil edición alumno | Sin página/API PATCH perfil canónica; `ProfileHeader` legacy/mock en dashboard no-zona | **inexistente / no MVP-blocker** |
| Student forgot-password UI | No | **inexistente** |

### Schema

| Enum / modelo | Valores / nota |
|---------------|----------------|
| `Role` | `STUDENT` · `GUARDIAN` · `ADMIN` |
| `SubscriptionStatus` | `ACTIVE` · `PAST_DUE` · `CANCELED` |
| `User` | email único, `passwordHash`, role, accountTier DEMO\|SUBSCRIBER |
| `GuardianLink` | Latente — sin UI familias |

---

## Matriz canónica (existe / parcial / bloquea MVP / post-MVP)

Leyenda: **bloquea MVP** = sin esto no se puede lanzar según §7 MVP + decisión A. **post-MVP** = no bloquea launch.

| Capacidad | Estado repo | ¿Bloquea MVP? | Decisión A–D / política | Notas |
|-----------|-------------|---------------|-------------------------|--------|
| Registro | **existe** (parcial vs “auth completa industria”) | **No** si happy path opera | Public MUST | Sin email verify (correcto) |
| Login | **existe** | **No** | MUST | Incluye ADMIN en mismo endpoint |
| Logout | **existe** | **No** | MUST | Cookie clear |
| Sesión JWT | **existe** | **No** | MUST | Documentar TTL/cookie quirks local vs prod |
| Email verification | **inexistente** | **No** | **WON'T** | No implementar en F4 |
| Password recovery alumno | **inexistente** | **No** (si BRIDGE doc) | **SHOULD** o **BRIDGE** | Preferir documentar BRIDGE ops (WA/admin) si no se implementa |
| Password recovery admin | **existe** (ops key) | Relacionado P0 ops, no feature F4 | Ops / INC | Fuera de “producto alumno”; link `admin-recuperacion-*` |
| Role STUDENT | **existe** + uso real | **No** | MUST básico | Register default |
| Role ADMIN | **existe** + `requireAdmin` | Credencial segura = P0 (decisión D) | MUST acceso admin | No = “roles avanzados” |
| Role GUARDIAN | **schema only** | **No** | **SHOULD** roles avanzados | Post-MVP / familia Elvis OUT |
| Guards FE (Demo + StudentZone) | **existe** | **No** | MUST protección rutas | |
| Guards BE (student + admin) | **existe** | **No** | MUST / DoD permisos | |
| Subscription ACTIVE + StudentZoneGuard + D-017 | **completa** (inventario) | **Sí** si se rompe | MUST §7.3 | Fase 4 **no** rediseña entitlements |
| Admin `requireAdmin` | **existe** | Si bypass → P0 | MUST admin | |
| Perfiles edición (nombre/email/pass alumno) | **inexistente** | **No** | No listado MUST A | Post-MVP salvo Juan eleve a SHOULD en ejecución |
| Docs “auth pausada” / D-005 literal | **desfasados** | Bloquea **claridad** agentes, no runtime | A: declarar desfasados | Ejecución F4: alinear punteros mínimos en `04` + control; **no** reescritura masiva AGENTS/CLAUDE sin OK |
| Skill email-verification | Nombre engañoso | No | WON'T verify | Documentar en `04`; rename skill = ticket DX opcional |
| NextAuth / OAuth | **inexistente** | N/A | WON'T Track B | Prohibido adoptar |

---

## Gaps vs MVP congelado (decisión A)

### MUST — ¿qué falta realmente?

Para el contrato A + MVP §7.2:

| MUST | Gap residual | Acción en ejecución F4 |
|------|--------------|------------------------|
| Registro / login / logout / sesión | Funcional en código | Documentar contrato + smoke en `04`; fix solo si audit encuentra rotura |
| Protección básica rutas | FE+BE presentes | Documentar matriz; no duplicar guards |
| Sin exigir email verify | Cumple WON'T | Explicitar en `04` |

**Conclusión brief:** no hay gap MUST grande de “auth inexistente”. El trabajo de Fase 4 es sobre todo **documental + higiene de política + SHOULD/BRIDGE**, no greenfield.

### SHOULD / BRIDGE (no bloquean launch)

| Ítem | Gap | Opción en ejecución (Juan elige al autorizar) |
|------|-----|-----------------------------------------------|
| Recuperación password alumno | Ausente | (1) BRIDGE: ops/WA documentado · (2) ticket `T-AUTH-PASSWORD-RECOVERY` post o en F4 si Juan prioriza |
| Roles avanzados (GUARDIAN UI, multi-rol fino) | Latente schema | Post-MVP |
| T-UX-COPY-LOGIN | Copy anonymous vs registro | Pulido — backlog Baja; puede mención F4/F10 |

### WON'T (no reabrir)

- Email verification.  
- Stripe/MP como auth.  
- Track B / NextAuth.

### Docs desfasados (declarados MVP; higiene en F4 docs)

| Doc / fuente | Problema | Tratamiento F4 |
|--------------|----------|----------------|
| `CLAUDE.md` / handoffs “Fase 4 Auth pausada” | Ignora JWT shipped | `04` lista + puntero; reescritura archivo solo con OK Juan |
| D-005 histórico “auth real no hasta conversión WA” | Contradice D-ROAD-005 A | Prevalece D-ROAD-005; D-005 = contexto histórico conversion-gated **infra pesada**, no “borrar JWT” |
| Skill `gmusic-auth-email-verification` | Imply verify email | Documentar alcance real = sesión JWT |
| `AGENTS.md` Academia wizard | Parcialmente otro tema | Fuera F4 salvo mención |

---

## Entregable futuro: `docs/features/04-auth-usuarios.md`

**No crear en esta pasada.** Outline EXACTO a rellenar **tras OK ejecución**:

```markdown
# 04 — Autenticación y usuarios (Track A)

## 0. Metadatos
Fecha · autor · versión · estado · SHA · prerreqs D-F1/F2/F3-001 · D-ROAD-005 A

## 1. Propósito y alcance
Qué cubre · audiencia · qué NO (email verify, NextAuth, Fase 5)

## 2. Política auth MVP (congelada)
Tabla MUST / SHOULD / WON'T / BRIDGE citando 01-mvp + decisión A

## 3. Modelo de usuario y roles
User · Role · AccountTier · Subscription · GuardianLink (latente)

## 4. Flujo registro / login / logout / sesión
Diagrama + endpoints + cookie contract + TTL

## 5. Protección de rutas
DemoAuthGuard · StudentZoneGuard · realStudentAuth · requireAdmin · /me/access

## 6. Entitlements D-017
Estados registered_no_sub / authenticated · link student-access-states.md

## 7. Recuperación de contraseña
Admin (existe) · Alumno (SHOULD vs BRIDGE documentado) · decisión explícita Juan

## 8. Perfiles
Estado real · IN/OUT MVP

## 9. Matriz audit (existe/parcial/gap)
Tabla actualizada vs esta instrucción

## 10. Docs desfasados y reconciliación
Lista + acciones mínimas (qué se tocó / qué queda)

## 11. Tickets derivados (si aplica)
T-AUTH-* · T-UX-COPY-LOGIN — solo con aceptación verificable

## 12. Cómo probar
Smoke local + criterios DoD + `npm run verify`

## 13. Fuera de alcance / riesgos
INC-admin-cred · R-OPS-01 · R-001/R-002

## 14. Aprobación
Casilla Juan · fecha · restricciones
```

### Posibles tickets (nombres reservados — **no crear ahora**)

| ID tentativo | Si el `04` demuestra… | Prioridad vs MVP |
|--------------|----------------------|------------------|
| `T-AUTH-PASSWORD-RECOVERY` | Se elige implementar recovery alumno (no solo BRIDGE) | SHOULD — no bloquea |
| `T-AUTH-DOCS-ALIGN` | Higiene AGENTS/CLAUDE/skill rename | Docs — no runtime |
| `T-AUTH-PROFILE-EDIT` | Juan eleva edición perfil a alcance | Post-MVP default |
| `T-UX-COPY-LOGIN` | Ya en backlog | Baja / pulido |

---

## Criterios de aceptación — separar brief vs ejecución

### A) Criterios de **este brief** (pasada actual — 2026-07-15)

- [x] Existe `docs/roadmap/fase-4-instruccion.md` (este archivo).  
- [x] Opcional: `docs/roadmap/fase-4-brief-supervisor.md` (1 página gate).  
- [x] `etapa-actual.md` · `changelog.md` · `PROJECT_STATUS.md` · fila F4 en `roadmap-general.md` actualizados.  
- [x] **Ejecución Fase 4 = NO INICIADA** · sin `04-auth-usuarios.md` · sin código auth · sin commit/push.  
- [x] No reabre MVP · no email verify · no schema · no Fase 5.

### B) Criterios de **ejecución Fase 4** (cerrados · **D-F4-001**)

Fase 4 **cerrada** (**D-F4-001**, 2026-07-15):

- [x] Existe `docs/features/04-auth-usuarios.md` con secciones de la plantilla.  
- [x] Matriz auth revalidada contra código/tests en el SHA de cierre (`e5b161c`).  
- [x] Política WON'T email verify + MUST JWT liviana explícitas y coherentes con D-ROAD-005 A.  
- [x] Password recovery alumno: **BRIDGE** documentado (no limbo).  
- [x] Docs desfasados “auth pausada” tratados (lista en `04` §10; sin reescritura masiva).  
- [x] Cero NextAuth / OAuth / email verify / schema sin decisión.  
- [x] Código: N/A (docs-only) · verify N/A justificado.  
- [x] Juan marca aprobado §14 del `04` (→ **D-F4-001**).  
- [x] Control roadmap: Fase 4 TERMINADA · Fase 5 **NO** abierta sin OK.

---

## Método — pasos cuando autoricen ejecución

1. **Releer** esta instrucción + MVP § Auth + D-ROAD-005 A + `03` cookies/JWT.  
2. **Re-auditar** archivos de la tabla Entradas (HEAD actual).  
3. **Crear** `docs/features/` si no existe.  
4. **Redactar** `04-auth-usuarios.md` con plantilla §§0–14.  
5. **Decidir con Juan** (si no está en el OK): BRIDGE vs implementar recovery alumno.  
6. **Solo si OK en el mismo mandato:** código mínimo para gaps MUST reales o ticket SHOULD priorizado.  
7. **No** email verify · **no** NextAuth · **no** tocar schema sin decisión · **no** prod DB a ciegas.  
8. Tests del área tocada + `npm run verify`.  
9. Cierre control + pedir firma Juan §14.  
10. **No** abrir Fase 5 sin OK explícito.

**Tope reintentos verify:** protocolo loop (máx 3; 4.º congela).

---

## Prohibidos (ejecución y brief)

| Prohibido | Por qué |
|-----------|---------|
| NextAuth / Auth.js / Clerk / Supabase Auth como reemplazo | Stack Track A = JWT propio |
| Email verification producto | WON'T D-ROAD-005 A |
| Cambiar JWT secret/algoritmo/cookie Path en prod sin ops Juan | Seguridad / sesión |
| Schema change (nuevos campos verify, OAuth ids…) sin decisión | D-F2 + gobernanza |
| Seeds/migrate contra prod DB | R-OPS-01 / DB-02 |
| Fase 5 Stripe/MP | WON'T / fase distinta |
| Track B / Next.js | Dual-track |
| Reabrir A–D / descongelar MVP | D-F1-001 |
| Commit/push autónomo | Regla Director |
| Crear `04-auth-usuarios.md` o tickets `T-AUTH-*` en esta pasada brief | Solo tras OK ejecución |

---

## Preguntas mínimas a Juan (no reabrir MVP)

Solo si el OK de ejecución no las responde:

1. **Password recovery alumno:** ¿BRIDGE ops documentado basta para launch, o priorizar ticket/implementación en la misma Fase 4?  
2. **Higiene docs:** ¿autorizar toques mínimos a `CLAUDE.md` / skill rename en la misma ejecución del `04`, o solo lista + tickets?  
3. **Perfil edición:** confirmar OUT (recomendado) salvo pedido explícito.

No preguntar de nuevo email verify, Stripe, NextAuth, ni alcance Mi Progreso/Comunidad (otras fases).

---

## Relación con otras fases / T-*

| Ítem | Relación |
|------|----------|
| F1–F3 | Prerreqs cerrados |
| Fase 5 Academia / 9 Pagos | **Fuera** — no iniciar |
| T-PUB · T-UX-LESSON · T-MVP-* | **Fuera** — no implementar bajo etiqueta auth |
| INC-admin-cred / R-OPS-01 | Ops P0 — **documentar enlace**; no “resolver” solo porque es F4 |
| DoD | Aplica a cualquier cambio de ejecución |
| Skills | `gmusic-agent-workflow` · `gmusic-verification` · auth skill = JWT realidad |

---

## Formato de cierre Fase 4 — **cumplido** (**D-F4-001**)

1. ✅ `etapa-actual.md` → Fase 4 TERMINADA · Fase 5 NO INICIADA.  
2. ✅ `changelog.md` — link a `04` / D-F4-001.  
3. ✅ `.agents/PROJECT_STATUS.md` — hito corto.  
4. ✅ `D-F4-001` en `decisiones.md` · **D-F4-WIP** supersedido.  
5. ✅ No iniciar Fase 5 sin OK.

---

## Estado post-cierre (2026-07-15)

### Hecho

- F1 / F2 / F3 / **F4** cerradas.  
- Brief + instrucción F4.  
- `docs/features/04-auth-usuarios.md` canónico · **D-F4-001** · §14 firmado.

### Pendiente (fuera de F4)

**Fase 5** **NO INICIADA** / no autorizada hasta OK Juan explícito nuevo.  
Sin brief Fase 5 en esta autorización.

---

*Fin de la instrucción. Fase 4 **TERMINADA** (**D-F4-001**). Fase 5 **NO**.*
