# 00 — Inventario actual de GMusic (ETAPA 0)

> **Orden canónico del roadmap (D-ROAD-003):** tras este inventario, el trabajo sigue las **10 fases del diagrama** (Definir y planear → … → Pulir, probar y lanzar). El protocolo 0–15 es checklist subordinado — ver `docs/roadmap/roadmap-general.md`. Stack real = Track A; herramientas del cartel = referencia.

> **Fecha:** 2026-07-14 (UTC+0 ≈ 15 Jul)  
> **Repo:** `gmusicproyect/proyectogmusic` · App path: `Página de cursos de música/`  
> **HEAD local:** `e5b161c` · Branch: `main` · Working tree: **DIRTY**  
> **Typecheck:** OK (`agent-status.sh`) · **verify completo:** no re-ejecutado en esta auditoría (cifras de tests según `.agents/PROJECT_STATUS.md` y conteo de archivos)

Leyenda de clasificación de superficies:

| Etiqueta | Significado |
|----------|-------------|
| **completa** | Flujo usable E2E con fuente de datos controlada |
| **parcial** | Existe y funciona en parte; faltan piezas, mocks o deuda |
| **simulada** | UI o bridge sin backend de negocio real (p.ej. pagos) |
| **rota** | Implementada pero falla de forma conocida (ninguna P0 en inventario estático) |
| **inexistente** | No hay página/flujo en el producto |

---

## 1. Resumen del proyecto

GMusic Track A es una **academia de guitarra online (MVP de validación)**: landing comercial + funnel demo + zona alumno (Mi Estudio / Mi Camino / Comunidad) + admin creador + bridge de conversión WhatsApp.

- **Navegación:** `currentPage` en `App.tsx` + sync parcial de URL (`student-zone-routing.ts`), no React Router como router principal (aunque `react-router` está en deps).
- **Backend:** Express + Prisma + PostgreSQL (Supabase), JWT cookie `gmusic_session`.
- **Gobernanza:** Opus diseña; Cursor ejecuta; pagos/pasarelas y varias Fases siguen pausadas por producto.

---

## 2. Tecnologías

| Capa | Tecnología | Evidencia |
|------|------------|-----------|
| Frontend | Vite 6.3.5, React 18.3.1, TS 5.8 | `package.json` |
| Backend | Express 4.21.2, tsx | `api:dev` → `server/index.ts` |
| DB | Prisma 6.19.3, PostgreSQL | `prisma/schema.prisma` |
| Auth | bcrypt + JWT cookie | `server/services/authService.ts`, `server/lib/jwtSession.ts` |
| Tests | Node.js `node:test` + tsx | `app:test`, `api:test` |
| Verify | `npm run verify` = typecheck + test + build | `package.json` |
| Deploy | Vercel SPA + proxy API Render | `vercel.json`, `PROJECT_STATUS` smoke |

Scripts útiles: `dev`, `build`, `typecheck`, `test`, `verify`, `api:dev`, `db:migrate*`, `db:seed*`, `ops:test-db-guard`.

---

## 3. Estructura relevante

```text
src/app/          → UI (pages, components, hooks, utils, data)
server/           → API Express (routes, services, middleware)
prisma/           → schema + migrations
docs/             → arquitectura, ops, análisis externos (elvis, courseliit)
.agents/          → PROJECT_STATUS, DECISIONS, skills, cursor-rules
public/           → assets estáticos
```

---

## 4. Modelo de datos (Prisma)

Modelos: `User`, `DemoProgress`, `GuardianLink`, `Subscription`, `Course`, `Module`, `PathNode`, `MicroExercise`, `LessonSession`, `ExerciseAttempt`, `UserProgress`, `XpEvent`, `StreakEvent`, `OnboardingAnalytics`, `CommunityEnrollment`, `CommunityPost`.

**Nota:** `GuardianLink` existe en schema (capacidad latente de familia) — **no** hay UI/flujo de familias en el producto.

---

## 5. Rutas / páginas (mapa)

### URLs sincronizadas (código)

| Zona | `currentPage` | URL |
|------|---------------|-----|
| Landing | `home` | `/` |
| Quiz | `onboarding-quiz` | `/quiz-temperamento` |
| Academia onboarding | `onboarding-academia` | `/onboarding-academia` |
| Demo path | `mi-camino-demo` | `/mi-camino-demo` |
| Demo clases | `demo-clase-1..5` | `/demo-clase-*` |
| Gate | `inscripcion-gate` | `/inscripcion` |
| Auth | registro/login/éxito | `/registro-cuenta`, `/login-cuenta`, `/registro-exito` |
| Alumno | `mi-estudio`/`welcome` | `/alumno` |
| Camino | `mi-camino` | `/mi-camino` |
| Admin | `admin` | `/admin` |

Comunidad alumno (`community`) **sin** URL propia en sync (correcto respecto a tabla AGENTS parcial).

### Landing

`GmusicLanding.tsx` → Hero, `AcademiaPublicSection` (CTA, no wizard), Comunidad marketing, Planes, Contacto.

### Academia 2 pasos

**En código:** wizard en `OnboardingAcademiaPage` + `AcademiaInstrumentSelector` + selector de nivel (ruta `/onboarding-academia`).  
**Doc AGENTS.md:** describe wizard in-place en `#academia` / `AcademiaSection.tsx` → **OBSOLETO** (ese archivo no existe).

---

## 6. Clasificación de funciones

| Función | Clasificación | Evidencia / nota |
|---------|---------------|------------------|
| Landing Visual A | **completa** | `GmusicLanding` + secciones |
| Auth registro/login/logout | **parcial** | JWT+UI vivos; sin email verification; docs aún dicen Fase 4 “pausada” |
| Protección zona alumno | **completa** | `StudentZoneGuard` + Subscription ACTIVE (D-017) |
| Demo Auth Guard | **completa** | Login requerido antes de demo (D-GOV-11 en práctica) |
| Academia 2 pasos | **completa** (onboarding) | URL dedicada; landing solo CTA |
| Funnel Mi Camino demo | **completa** | 5 clases + bloqueos + CTA gate |
| Clases demo `/demo-clase-*` | **completa** | Routing D-GOV-02/03 |
| Inscripción gate + WhatsApp | **completa** (bridge) / pago **simulada** | `wa.me` + analytics; sin pasarela |
| Mi Estudio | **parcial** | Dashboard API real; evolución UX abierta |
| Mi Camino suscriptor | **parcial** | Path + LessonRunner API; T-PUB-01 / T-UX-LESSON pendientes |
| LessonRunner / práctica | **parcial** | Video-first en progreso (T-UX-LESSON-01) |
| Progreso demo (localStorage + BD) | **parcial** | `gmusic:demo_v1` + `DemoProgress` |
| Progreso suscriptor (BD) | **parcial** | `UserProgress` / `LessonSession` / XP |
| Página **Mi Progreso** | **inexistente** | Solo mención demo nav / roadmaps históricos |
| Comunidad alumno | **parcial** | Feed API; peers/mentorship mock |
| Comunidad landing | **completa** (marketing) | `ComunidadSection` |
| Planes UI | **completa** (marketing) | Sin cobro |
| Pagos / suscripción automática | **simulada** / **inexistente** pasarela | activate-semestral dev; WhatsApp humano |
| Admin creador (R-008) | **parcial** | UI+API; piloto publicación en cola; alertas de credencial prod |
| Checkout legacy | **simulada**/congelada | Legacy pages en `App.tsx` |
| Email verification | **inexistente** | Skill mal nombrada vs JWT-only |
| ERP familias/periodos (Elvis) | **inexistente** en producto | Solo análisis en `docs/elvis-analysis/` |
| LMS CourseLit-like | **inexistente** como producto | Análisis parcial `docs/courselit-analysis/` |

---

## 7. Datos: real vs mock vs demo

| Fuente | Uso |
|--------|-----|
| Prisma / API | Auth, admin, curriculum path, community feed, lesson sessions, me-access |
| `localStorage` demo | `gmusic:demo_v1`, plan seleccionado, quiz temperamento |
| `mock-user.ts` | Fallback dashboard / tests |
| `mock-community-data.ts` | Peers/mentorship curados |

---

## 8. Tests

| Ámbito | Archivos `*.test.ts` |
|--------|----------------------|
| `src/` | 75 |
| `server/` | 24 |
| Status documentado | **563/563** app (+ API en verify) — **verificar con `npm run verify` antes de declarar verde en CI local si el tree dirty lo requiere** |

Áreas: routing, path, lesson, dashboard API client, auth API, admin, community, curriculum, DB guards…

---

## 9. Deuda técnica

1. **Docs vs código:** AGENTS Academia desfasado; CLAUDE.md cifras/auth “pausada”; DO_NOT_TOUCH “no JWT” vs JWT existing.  
2. **Tabla de rutas AGENTS incompleta** vs `student-zone-routing.ts`.  
3. **R-OPS-01:** migraciones Prisma/prod baseline frágil.  
4. **INC credencial admin prod** (status histórico — validar si sigue abierto).  
5. **Working tree dirty** + análisis externos (`vendor-sources/`, elvis/courselit docs) pueden dispersar foco.  
6. **Legacy surfaces** aún montadas en `App.tsx`.  
7. **Comunidad** híbrida API+mocks.  
8. **Mi Progreso** ausente pese a datos XP/racha en schema.  
9. Auth sin verificación de email.  
10. Pagos deliberadamente humanos (WhatsApp) — OK como decisión, no como “falta accidental”.

---

## 10. Riesgos y bloqueos

| ID | Riesgo / bloqueo | Severidad | Nota |
|----|------------------|-----------|------|
| B1 | T-PUB-01 no cerrado → poca materia “publicado→alumno” | Alta | Cola operativa |
| B2 | Ops seguridad admin/migraciones | Alta | Antes de escalar alumnos |
| B3 | Contradicción política auth pausada vs código | Media | Decisión de gobernanza |
| B4 | Conversión depende WhatsApp | Media | Producto, no bug |
| B5 | Dispersión Elvis/CourseLit | Media | No mezclar en Track A MVP |
| B6 | Lesson UX pedagógica incompleta | Media | T-UX-LESSON-01 |
| B7 | Docs agentes desactualizadas | Media | Riesgo de implementación incorrecta |

---

## 11. Duplicaciones / confusiones

- “Academia” landing CTA vs onboarding wizard (dos superficies).  
- Comunidad marketing vs comunidad alumno.  
- “Mi Camino” demo vs suscriptor.  
- Skill `gmusic-auth-email-verification` sin verify email.  
- Protocolo maestro (etapas 0–15) vs colas `.agents` (T-PUB, T-UX-LESSON) — **ambos válidos**; deben reconciliarse.

---

## 12. Mapa de dependencias (simplificado)

```text
Landing → Quiz/Onboarding Academia → Mi Camino Demo → Inscripción Gate
                                              ↓
                                    Registro/Login (JWT)
                                              ↓
                         Subscription ACTIVE → /alumno + /mi-camino + community
                                              ↓
                              Admin (Role.ADMIN) publica Module/PathNode
```

---

## 13. Orden real recomendado (vs protocolo 0–15)

Dado el estado **real**, no “inventar cemento” otra vez:

| Orden | Acción | Mapeo protocolo |
|-------|--------|-----------------|
| **Ahora** | Cerrar ETAPA 0 (este doc) + sync mínima de docs AGENTS | Etapa 0 |
| **1** | Definir MVP escrito sin contradicciones (`01-mvp-gmusic.md`) | Etapa 1 |
| **2** | Decisión auth: documentar “JWT shipped; email verify out” | Etapa 4 parcial ya existe |
| **3** | Ops: credenciales/migraciones prod | Etapa 3/12 |
| **4** | T-PUB-01 + contenido publishable | Etapa 5/10 |
| **5** | T-UX-LESSON-01 | Etapa 5/6 |
| **6** | Endurecer Comunidad (quitar mocks críticos) | Etapa 8 |
| **7** | Página Mi Progreso | Etapa 7 |
| **8** | Pagos automáticos **solo** tras conversión WhatsApp real | Etapa 9 |
| **Después** | ERP familias (Elvis) / LMS creator (CourseLit) como productos/referencias | Fuera MVP Track A |

---

## 14. Archivos revisados (muestra)

- `.agents/PROJECT_STATUS.md`, `AGENTS.md`, `package.json`, `prisma/schema.prisma`
- `src/app/App.tsx`, `utils/student-zone-routing.ts`
- Landing / Academia / Path / Welcome / Community / Admin / Inscripcion pages
- `server/routes/auth.ts`, admin middleware
- Conteos `*.test.ts`, agent-status typecheck
- Exploración: [ETAPA0 inventory](d7ce7919-8ee3-4086-a581-8d4a7b07c352)

## 15. Qué NO se hizo en ETAPA 0

- No se implementó código de producto.  
- No se corrió `npm run verify` completo (tree dirty + tiempo); typecheck OK.  
- No se avanzó a Etapa 1.

---

## Criterio de cierre ETAPA 0

✅ Existe inventario verificable contra el repo.  
✅ Clasificaciones con evidencia.  
✅ Orden real propuesto.  
✅ `docs/roadmap/etapa-actual.md` actualizado.  

**Siguiente etapa autorizada (solo tras revisión Juan):** ETAPA 1 — Definición del MVP (`docs/product/01-mvp-gmusic.md`).
