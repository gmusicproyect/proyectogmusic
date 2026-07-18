# 01 — MVP GMusic (Track A)

## 0. Metadatos

| Campo | Valor |
|-------|--------|
| **Fecha** | 2026-07-14 |
| **Autor** | Cursor (ejecutor) · brief supervisor GPT · decisiones Juan |
| **Versión** | 1.0 |
| **Estado** | **APROBADO** · contrato MVP **congelado** (**D-F1-001**, 2026-07-14) |
| **Inventario ref.** | `docs/project-status/00-inventario-actual.md` (2026-07-14) · HEAD audit `e5b161c` |
| **Instrucción / validación** | `docs/roadmap/fase-1-instruccion.md` · `fase-1-validacion-arquitecto.md` → **APROBADA** |
| **Decisiones** | **D-ROAD-005** (A–D) · **D-F1-001** (aprobación Fase 1 + congelado) · confirma D-ROAD-002 |
| **Track** | **A** — Vite + React + Express + Prisma (+ PostgreSQL). **No** Next.js / Track B |

---

## 1. Visión (≤8 líneas)

GMusic MVP es una academia online de **guitarra** donde un alumno real puede **crear cuenta, entrar, seguir un camino, completar lecciones y ver qué estudiar después**, con progreso persistido.

Promesa: del primer clic a la siguiente lección clara, sin depender de mocks de lanzamiento ni de una pasarela de pago.

A propósito deja fuera: email verification, Stripe/pasarela, Track B, ERP familias, LMS marketplace, social avanzado y gamificación comunitaria profunda.

---

## 2. Problema y propuesta de valor

| | |
|--|--|
| **Problema** | Querer aprender guitarra en casa sin academia presencial cara ni YouTube sin orden; necesita camino, feedback de avance y cierre comercial humano confiable. |
| **Solución MVP** | Funnel demo 5 clases + cuenta JWT + zona alumno (Mi Estudio / Mi Camino / lección / Mi Progreso mínimo) + admin publica contenido + WhatsApp para activar suscripción. |
| **Diferenciador** | Metodología **Fundamento → Técnica → Crea**, demo jugable, camino gamificado Track A, conversión humana (WhatsApp) hasta validar cobro. |

---

## 3. Usuario principal

| Atributo | Definición MVP |
|----------|----------------|
| **Quién** | Persona en Chile que quiere aprender **guitarra** (principiante / Fundamento); puede ser adulto o joven autónomo. |
| **Contexto** | Móvil o desktop; canal de cierre comercial **WhatsApp** (`+569…` canónico del producto). |
| **Jobs** | (1) Probar sin pagar pasarela. (2) Tener cuenta y no perder avance. (3) Estudiar lección y saber la siguiente. (4) Pedir/activar plan vía humano. |
| **No-usuario MVP** | Familias ERP / apoderados UI · multi-instrumento · alumno que exige chat/DM · quien exige cobro online Stripe. |

Instrumento: solo **Guitarra** avanza (D-007). Teclado/Canto = próximamente.

---

## 4. Recorrido principal (happy path)

### 4.1 Contrato núcleo (MUST — D-ROAD-005)

```text
Registra → Login → Academia (/onboarding-academia) → curso/ruta activa
  → abre lección → consume → completa → progreso guardado
  → ve siguiente lección (Mi Camino y/o Mi Progreso)
```

Comunidad (feed) y WhatsApp **acompañan**; no sustituyen este núcleo.

### 4.2 Adquisición / conversión (MUST como embudo; pago = BRIDGE)

```text
Landing (/) → registro (D-GOV-11) → [quiz opcional]
  → /onboarding-academia → /mi-camino-demo + /demo-clase-1..5
  → /inscripcion → WhatsApp → ops concede Subscription ACTIVE
  → /alumno → /mi-camino → lección…
```

**Academia canónica:** `/onboarding-academia` (`student-zone-routing.ts` + `OnboardingAcademiaPage`).  
Landing `#academia` = CTA/marketing (`AcademiaPublicSection`), **no** el wizard.

### 4.3 Tabla estado vs gap

| Paso | Página / URL | Inventario | Gap MVP |
|------|--------------|------------|---------|
| Landing | `/` | completa | Mantener Visual A |
| Registro / login | `/registro-cuenta`, `/login-cuenta` | parcial (sin email verify) | Auth liviana IN; verify WON'T |
| Quiz | `/quiz-temperamento` | completa | Opcional según reglas vigentes |
| Academia | `/onboarding-academia` | completa | Solo Guitarra |
| Demo path + clases | `/mi-camino-demo`, `/demo-clase-*` | completa | Teaser 6–15 bloqueado |
| Gate + WhatsApp | `/inscripcion` | bridge / pago simulada | BRIDGE documentado; Stripe OUT |
| Activación | ops / admin | parcial | Admin concede ACTIVE |
| Mi Estudio | `/alumno` | parcial | Usable MUST |
| Mi Camino | `/mi-camino` | parcial | + T-PUB-01 contenido |
| Lección | LessonRunner | parcial | + T-UX-LESSON-01 si afecta consumo |
| Mi Progreso | (nueva / a definir URL) | **inexistente** | **MUST** superficie mínima (B) |
| Comunidad | `community` (sin URL sync) | parcial | Feed real; mocks ≠ launch |

---

## 5. Matriz MUST / SHOULD / WON'T / BRIDGE

| Módulo | Tag | Criterio verificable (ancla §7) |
|--------|-----|--------------------------------|
| Auth JWT — registro, login, sesión, logout, protección rutas | **MUST** | §7.2 |
| Roles avanzados | **SHOULD** | No bloquea launch |
| Recuperación password | **SHOULD** o **BRIDGE** doc | Documentar si ausente |
| Email verification | **WON'T** | — |
| Landing + planes marketing | **MUST** | §7.1 / §7.7 |
| Academia `/onboarding-academia` | **MUST** | §7.1 |
| Demo funnel 5 clases | **MUST** | §7.4 |
| Catálogo publicado (admin→alumno) | **MUST** | §7.5 · **T-PUB-01** |
| Consumo lección correcto | **MUST** | §7.6 · **T-UX-LESSON-01** si aplica |
| Progreso lección persistido | **MUST** | §7.6 |
| Mi Camino suscriptor | **MUST** | §7.1 / §7.5 |
| Mi Estudio | **MUST** | §7.1 |
| Mi Progreso (mínimo B) | **MUST** | §7.6b |
| Comunidad feed reducido (C) | **MUST** si en nav | §7.6c |
| Subscription ACTIVE (D-017) | **MUST** | §7.3 |
| WhatsApp conversión/pagos | **BRIDGE** | §7.7 |
| Stripe / MP pasarela | **WON'T** | — |
| Track B / Next | **WON'T** | — |
| DM, chat RT, videollamada, notif. complejas | **WON'T** | — |
| Rachas avanzadas, rankings, gráficos, logros sofisticados, predictivo | **WON'T** (Progreso) | — |
| Elvis / CourseLit producto / AlphaTab | **WON'T** | — |
| Responsive happy path móvil | **MUST** | §7.8 |
| Credencial admin segura | **MUST** (P0) | §7.9 |
| Prisma persistencia sana | **MUST** (P0) | §7.9 |
| `npm run verify` verde en SHA launch | **MUST** | §7.10 |

---

## 6. Alcance por superficie

### Landing
- Visual A: hero + CTA Academia + comunidad marketing + planes + contacto.
- `#academia` enlaza al flujo de onboarding (no wizard embebido obsoleto).

### Academia / onboarding
- URL **`/onboarding-academia`**: instrumento → punto de partida; solo Guitarra avanza (D-007).
- Destino típico: demo path o continuación según estado de cuenta.

### Demo
- 5 clases jugables; teaser bloqueado D-GOV-05/06; URLs funnel rewrites OK.

### Auth
- JWT cookie; registro/login/sesión/logout; guards demo + zona alumno.
- Sin email verify. Password recovery = SHOULD/BRIDGE documentado, no blocker si el resto del happy path opera.

### Mi Estudio (`/alumno`)
- Home post-login con acceso a camino / progreso / comunidad según nav real.
- UX evolución profunda = post-MVP salvo bloqueos P0.

### Mi Camino (`/mi-camino`)
- Ruta suscriptor con nodos publicados vía admin.
- Sin materia publicada usable → **no** launch (T-PUB-01).

### Lección
- Alumno abre, consume (video/práctica según umbral usable), completa, progreso en BD.
- Si el runner actual impide ese consumo → T-UX-LESSON-01 es **MUST** pre-launch.

### Mi Progreso (MUST mínimo)
- **IN:** lecciones completadas; % avance real; curso/ruta activa; última actividad; siguiente lección; empty state.
- **OUT:** rachas avanzadas; tiempo exacto práctica; rankings; gráficos complejos; logros sofisticados; predictivo.

### Comunidad
- **IN:** ver posts, publicar, comentar; filtro/contexto por nivel si es viable; moderación admin mínima.
- Mocks peers/mentorship: **solo** dev/demo interna — **no** parte del contrato de lanzamiento.
- **OUT:** DM, chat realtime, videollamada, notificaciones complejas, social/gamificación comunitaria profunda.
- Fuera del happy path pedagógico central; si aparece en nav del alumno, debe ser feed real funcional.

### Planes / pagos
- Precios visibles; cobro **no** automático.
- WhatsApp BRIDGE: alumno pide / ops explica; admin puede activar `Subscription ACTIVE`; alumno entiende el siguiente paso.
- Stripe OUT.

### Admin
- Publicar módulos/etapas (R-008). Pipeline publish→alumno = T-PUB-01.
- Credencial insegura = P0 bloqueo launch.

### Responsive
- Happy path usable en viewport móvil principal (p.ej. 390×844) sin bloqueos P0.

---

## 7. Criterios de lanzamiento MVP (DoD producto)

1. **Happy path E2E** (staging o prod controlado): registro → login → `/onboarding-academia` → (demo y/o zona alumno según estado) → curso/ruta → ≥1 lección publicada → completa → progreso persistido → siguiente lección visible.  
2. **Auth:** registro + login + logout + sesión cookie; **sin** exigir email verify.  
3. **Acceso:** sin `Subscription ACTIVE` no entra zona alumno (D-017).  
4. **Demo:** 5 clases + teaser bloqueado; smoke URLs funnel.  
5. **Contenido:** T-PUB-01 satisfecho — ≥1 bloque/ruta publicada visible en Mi Camino suscriptor (N mínimo = 1 bloque usable completo o equivalente acordado en el ticket).  
6. **Lección:** consumo correcto; si no, T-UX-LESSON-01 cerrado al umbral “completa + guarda”.  
6b. **Mi Progreso:** superficie mínima con campos IN de §6; empty state OK.  
6c. **Comunidad:** si está en nav — ver/publicar/comentar sobre API real; cero dependencia de mocks en launch.  
7. **WhatsApp:** CTA `wa.me` correcto; alumno/ops entienden activación; **no** se finge cobro Stripe.  
8. **Responsive:** §6 móvil sin P0.  
9. **P0 ops:** credencial admin insegura = **no launch**; Prisma que pierda/corrompa/impeda persistir = **no launch**. Otros ops: OK con riesgo documentado.  
10. **`npm run verify`** verde en el SHA de lanzamiento (cifra real del repo).  
11. **OUT explícitos** firmados en §8.  
12. **Juan firma** §12.

---

## 8. Fuera de alcance explícito

| Ítem | Por qué | Reabrir |
|------|---------|---------|
| Email verification | WON'T (A) | Incidente seguridad / decisión Juan |
| Stripe / Mercado Pago implementación | WON'T (D); D-027 diferido | Tras conversión WhatsApp real |
| Track B (Next, Sanity, Railway, Stream) | Dual-track | Primera conversión + decisión arquitectura |
| NextAuth / Discourse / Docker-as-must | Cartel ≠ stack | Nunca por defecto |
| Elvis ERP / familias UI | WON'T | Producto aparte |
| CourseLit clone | Análisis only | Nunca como scope MVP |
| DM / chat RT / video / notif. complejas | WON'T (C) | Post-comunidad básica |
| Rachas avanzadas / rankings / gráficos / logros / predictivo | WON'T (B) | Post–Mi Progreso mínimo |
| Visual D / hero sin auth Juan | SUPERSEDED / gated | Autorización visual |
| Currículo 6–75 completo jugable | Teaser ≠ currículo | Publicación por bloques |
| AlphaTab / audio AI | D-GOV-07 | Fase explícita |
| Mitigar R-001 / R-002 | Sin fase arquitectura | Decisión nueva |
| React Router global como router canónico | Fuera D-GOV-03 legado | Fase arquitectura |

---

## 9. Decisiones resueltas en Fase 1

| Decisión | Opción | Fecha |
|----------|--------|-------|
| Auth JWT vs “pausada” | Liviana **IN**; verify **WON'T**; docs pausada = desfasadas | 2026-07-14 · D-ROAD-005 A |
| Alta suscripción | WhatsApp **BRIDGE** + ACTIVE manual/admin | 2026-07-14 · D |
| Mi Progreso | **MUST** mínimo (IN/OUT B) | 2026-07-14 · B |
| Comunidad | Feed real reducido **IN**; mocks ≠ launch | 2026-07-14 · C |
| T-UX-LESSON-01 | **MUST** si afecta consumo | 2026-07-14 · D |
| T-PUB-01 | **MUST** si afecta publicación/disponibilidad | 2026-07-14 · D |
| Ops P0 | Admin cred + Prisma persistencia = bloqueo | 2026-07-14 · D |
| Stack | Track A only | D-ROAD-003 / D |
| Academia URL | `/onboarding-academia` canónica | Inventario + código |

---

## 10. Roadmap post-MVP inmediato

| Ítem | Rol post-definición | Fase diagrama |
|------|---------------------|---------------|
| Cerrar gaps auth UX / password recovery | SHOULD / BRIDGE → implementar si falta | 4 |
| T-PUB-01 | MUST pre-launch | 5 |
| T-UX-LESSON-01 | MUST si umbral consumo | 6 |
| Página Mi Progreso mínima | MUST pre-launch | 7 |
| Comunidad quitar mocks de launch | MUST si en nav | 8 |
| WhatsApp BRIDGE runbook | Bridge launch | 9 |
| Stripe/MP | WON'T hasta decisión | 9 / post |
| INC-admin-cred / R-OPS-01 | P0 según §7.9 | 3 / 10 |
| T-UX-COPY-LOGIN | Pulido | 10 |
| Sync AGENTS/CLAUDE docs desfasados | Deuda documental | paralelo / post-lectura Juan |
| Fase 2 docs arquitectura | Tras OK Juan a este MVP | 2 |

**Mencionar ticket ≠ autorizar implementación.** Cada ticket requiere OK Juan de ejecución.

---

## 11. Riesgos y dependencias

| ID | Riesgo | Severidad | Tratamiento MVP |
|----|--------|-----------|-----------------|
| B1 | Sin T-PUB-01 → path vacío | Alta | MUST pre-launch |
| B2 | Credencial admin / migraciones | Alta | P0 bloqueo si inseguro o Prisma roto |
| B3 | Docs “auth pausada” | Media | Declarar desfasados; D-ROAD-005 |
| B4 | Conversión solo WhatsApp | Media | BRIDGE aceptado |
| B5 | Dispersión Elvis/CourseLit | Media | WON'T producto |
| B6 | Lesson UX incompleta | Media | T-UX-LESSON-01 MUST si afecta consumo |
| B7 | Docs agentes stale | Media | Lista § abajo + sync posterior |

Dependencia dura: ops humano para ACTIVE hasta pasarela (OUT).

---

## Docs desfasados (declaración — no reescritura masiva en Fase 1)

1. `AGENTS.md` — Academia como wizard `#academia` / `AcademiaSection.tsx`.  
2. `CLAUDE.md` / handoffs — “Fase 4 Auth pausada” como si no hubiera JWT.  
3. Notas `DO_NOT_TOUCH` / agentes — “no JWT”.  
4. Skill `gmusic-auth-email-verification` implicando verify de correo real.  
5. Snapshots CLAUDE “18 Jun” (tests/HEAD) vs estado real `agent-status`.  
6. Lecturas del inventario §13 que traten Mi Progreso/Comunidad como post-MVP opcional — **el estado de código del inventario sigue válido**; el **alcance de lanzamiento** lo fija este MVP + D-ROAD-005.

---

## Relación T-PUB-01 / T-UX-LESSON-01

| Ticket | Condición MUST | Si no aplica |
|--------|----------------|--------------|
| **T-PUB-01** | Afecta publicación o disponibilidad real de contenido para el alumno | N/A — en la práctica **sí** afecta al núcleo; tratar MUST pre-launch |
| **T-UX-LESSON-01** | Afecta consumo correcto (abrir → estudiar → completar → persistir) | Si el runner actual ya cumple umbral, el resto del ticket puede ser SHOULD post-launch **solo** con evidencia explícita en el ticket |

---

## Stack canónico Track A

| Capa | Tecnología |
|------|------------|
| Frontend | Vite + React + TypeScript |
| Backend | Express |
| Datos | Prisma + PostgreSQL |
| Auth | JWT cookie sesión (liviana) |
| Deploy ref. | Vercel SPA + API (p.ej. Render) — según ops actual |
| **OUT** | Next.js, Sanity CMS como producto, Stripe, Track B |

---

## 12. Aprobación

- [x] **Juan aprueba** este MVP (lectura)  
- **Fecha:** 2026-07-14  
- **Decisión de gobernanza:** **D-F1-001** (`docs/roadmap/decisiones.md`)  
- **Restricciones / enmiendas:** ninguna en la aprobación; alcance A–D de D-ROAD-005 se mantiene. Ideas nuevas → backlog, no a este contrato.

Fase 1 **TERMINADA / APROBADA**. Contrato MVP **congelado**. Fase 2 (arquitectura) autorizada. Implementación de gaps MUST = fases/tickets posteriores con OK explícito por fase.

---

*Fin `01-mvp-gmusic.md` v1.0 — Fase 1 documental. Aprobado D-F1-001. Cero código de aplicación en la entrega de Fase 1.*
