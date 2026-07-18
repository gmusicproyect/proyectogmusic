# GMusic — Auditoría de Arquitectura Actual

**Tipo:** diagnóstico técnico · evidencia para decisiones (Codex / Juan)  
**Fecha:** 2026-07-16  
**Alcance:** Track A — `Página de cursos de música/` (Vite + React + Express + Prisma + PostgreSQL)  
**Referencias conceptuales (solo lente, no decisiones):**
- `…/joytunes-analysis/reportes/analisis_arquitectura_joytunes_para_gmusic.md`
- `…/joytunes-analysis/reportes/decisiones_arquitectura_gmusic.md`

**Reglas de esta auditoría:**
- No propone arquitectura final.
- No modifica código ni documentación canónica existente.
- No sustituye specs firmados (MVP **D-F1-001**, features `04`–`07`, DoD permanente).
- Separa **estado observado** vs **documentación de gobernanza** vs **aspiración metodológica** (Ruta 12m, FTC, Biblioteca, Perfiles del informe JoyTunes).

**SHA / entorno de lectura:** inventario base `e5b161c` (`docs/project-status/00-inventario-actual.md`); gobernanza F1–F7 documental cerrada hasta **D-F7-001**; F8 brief listo sin ejecutar.

---

## 0. Resumen ejecutivo

GMusic Track A es un **modular monolith** web (SPA Vite + API Express + Postgres) orientado a validación MVP: landing → academia/onboarding → funnel demo → conversión WhatsApp → zona alumno (Mi Estudio / Mi Camino) con pipeline editorial Admin → alumno parcialmente probado (T-PUB DONE LOCAL).

**Fortalezas transversales:** schema pedagógico coherente (Course → Module → PathNode ×5 `StageType`); motor de aprendizaje backend con sesiones, intentos, XP y progreso; auth JWT cookie operativa; tests extensos (~100 archivos `*.test.ts`); gobernanza documental madura (fases 0–7); separación explícita demo (TS/localStorage) vs academia (Postgres).

**Brechas transversales vs metodología de referencia (JoyTunes/decisiones):** no existe entidad **Perfil** separada de cuenta; no hay **RutaAnual/MesDeRuta** explícitos en schema; **Biblioteca** como producto no existe (solo “biblioteca admin” de bloques); **Mi Progreso** UI ausente pese a datos; **Comentarios** comunidad no persistidos; **Entitlements** (R-002) no enforced en todos los endpoints Learning; **audio realtime / micrófono** no es núcleo (alineado a MVP guiado).

**Riesgos P0 documentados:** credencial admin prod; baseline Prisma prod (R-OPS-01); R-001 snapshot contenido; R-002 autorización backend inconsistente; mocks comunidad visibles si se desbloquea nav sin T-MVP-COMMUNITY.

---

## 1. Metodología y mapa de evidencia

### 1.1 Fuentes primarias (código)

| Área | Rutas clave |
|------|-------------|
| Frontend SPA | `src/app/App.tsx`, `src/app/pages/*`, `src/app/components/gmusic/*` |
| Routing | `src/app/utils/student-zone-routing.ts` |
| API client | `src/app/services/gmusic-api/*` |
| Backend | `server/app.ts`, `server/routes/*`, `server/services/*`, `server/middleware/*` |
| Persistencia | `prisma/schema.prisma`, `prisma/migrations/*`, `prisma/seed.ts` |
| Tests | `server/tests/*`, `src/**/*.test.ts` |
| Config deploy | `vercel.json`, `package.json` |

### 1.2 Fuentes documentales (gobernanza)

| Documento | Rol en auditoría |
|-----------|------------------|
| `docs/product/01-mvp-gmusic.md` | Contrato MUST/OUT congelado |
| `docs/architecture/02-modelo-datos.md`, `02-arquitectura-sistema.md` | Modelo y capas aprobados F2 |
| `docs/architecture/gmusic-architecture-working-map.md` | Riesgos R-001/R-002/R-003 |
| `docs/features/04`–`07` | Auth, Academia, Camino, Progreso (docs) |
| `docs/project-status/00-inventario-actual.md` | Inventario Etapa 0 |
| `docs/roadmap/*`, `.agents/PROJECT_STATUS.md` | Estado fases y tickets |
| `docs/quality/definition-of-done.md` | DoD permanente |

### 1.3 Lente de comparación (sin decidir)

El informe JoyTunes describe dominios: Journey, Library, Music Engine, Profiles, Purchases, Community. El documento `decisiones_arquitectura_gmusic.md` propone adopciones A1–A8 (Ruta 12m, FTC, Mi Camino, Mi Progreso, Biblioteca, Perfiles, Entitlements, Comunidad cerrada). **Esta auditoría mapea gap observado vs esas ideas; no las adopta ni rechaza.**

---

## 2. Arquitectura general

### 2.1 Estado actual

Patrón **Modular Monolith** desplegado en dos hosts: Vite SPA (Vercel) + Express API (Render típico) + PostgreSQL. Navegación por `currentPage` en `App.tsx` con sync parcial URL (`student-zone-routing.ts`), no React Router como router global. Bounded contexts documentados en `02-arquitectura-sistema.md`: Identity, Acquisition, Academy Content, Learning Journey, Membership, Community, Administration; Billing ausente (WhatsApp BRIDGE).

### 2.2 Fortalezas

- Separación FE/BE clara con API versionada `/api/v1/*`.
- Servicios por dominio en `server/services/` (auth, me, curriculum, community, lesson sessions).
- Track B (Next/Sanity) explícitamente fuera — reduce deriva stack.
- Working map maduro con riesgos nombrados y activadores.

### 2.3 Debilidades

- `App.tsx` monolítico (~480+ líneas): mezcla player música legacy, navegación, auth, páginas marketing y zona alumno.
- Páginas legacy (`CoursesPage`, `CheckoutPage`, etc.) aún montadas bajo `DEV_LEGACY`.
- Dual-track documentación vs código en varios satélites (AGENTS Academia obsoleto).
- No hay capa de “entitlements middleware” transversal en API.

### 2.4 Riesgos

- **R-002:** endpoints Learning autentican STUDENT pero no siempre revalidan Subscription ACTIVE.
- **R-003:** dos fuentes pedagógicas (demo TS vs Postgres) sin estrategia de continuidad formalizada en código.
- Crecimiento de `App.tsx` dificulta evolución sin router formal.

### 2.5 Oportunidades de mejora (observación, no decisión)

- Consolidar documentación de contextos con estructura de carpetas (solo tras decisión).
- Middleware shared `requireActiveSubscription` en rutas alumno (propuesta ya en working map).
- Extraer router de producto de legacy music player.

### 2.6 Preguntas abiertas

- ¿Cuándo se exige cerrar R-002 antes de usuarios reales externos?
- ¿Se mantiene `currentPage` indefinidamente o hay fase de React Router global?
- ¿Track B sigue congelado hasta conversión WhatsApp?

### 2.7 Evidencia

`server/app.ts`, `src/app/App.tsx`, `docs/architecture/02-arquitectura-sistema.md`, `docs/architecture/gmusic-architecture-working-map.md`

---

## 3. Modelo de dominio

### 3.1 Estado actual

Schema Prisma (`prisma/schema.prisma`, ~371 líneas): **User**, **Subscription**, **Course/Module/PathNode/MicroExercise**, **UserProgress**, **LessonSession/ExerciseAttempt**, **XpEvent/StreakEvent**, **CommunityEnrollment/CommunityPost**, **DemoProgress**, **OnboardingAnalytics**, **GuardianLink**. No hay: `Profile`, `Plan`, `Enrollment` curso, `Comment`, `Resource/Biblioteca`, `RutaAnual`, `TarjetaFTC` como entidades.

Mapeo pedagógico: **Module = bloque**, **PathNode = etapa/lección**, **5× StageType** = unidad FTC operativa (`FUNDAMENTO_UNO`…`TOCAR`). Curso default `ruta-guitarra-12-meses`.

### 3.2 Fortalezas

- Modelo editorial alineado a D-GOV-04 (bloque de 5 etapas).
- `secureAnswer` en MicroExercise solo servidor — buena frontera seguridad.
- Progreso por nodo con unlock secuencial derivado (`nodeStatus.ts`).
- Enums de dominio claros (`PublishStatus`, `StageType`, `SessionStatus`).

### 3.3 Debilidades

- **User = identidad + perfil** mezclados (sin multi-perfil familia).
- **planId** string sin tabla Plan ni entitlements estructurados.
- Comentarios comunidad: API devuelve `comments: 0` hardcoded (`communityService.ts`).
- Sin versionado de contenido en sesión (**R-001**).
- `Module.focus` referenciado en docs anti-demo pero sin columna Prisma (DT-11).

### 3.4 Riesgos

- Editar PathNode/MicroExercise con sesiones activas puede alterar evaluación retrospectiva (R-001).
- Gap “comentar” en MVP vs schema puede forzar parche o nuevo modelo bajo presión.
- GuardianLink en schema sin producto — deuda latente.

### 3.5 Oportunidades de mejora

- Documentar explícitamente equivalencia PathNode ↔ “Tarjeta FTC” (ya parcial en F5/F6).
- Tabla de gaps vs dominio objetivo JoyTunes (§12 matriz).

### 3.6 Preguntas abiertas

- ¿Perfiles multi-alumno son MUST post-MVP o WON'T?
- ¿Biblioteca es extensión de PathNode media o catálogo independiente?
- ¿Se modelará Plan/Entitlement o se mantiene string + ops?

### 3.7 Evidencia

`prisma/schema.prisma`, `docs/architecture/02-modelo-datos.md`, `server/services/curriculum.ts`, `.agents/DECISIONS.md` (D-GOV-04)

---

## 4. Módulos lógicos (vs referencia JoyTunes)

| Módulo referencia | Equivalente GMusic observado | Estado |
|-------------------|------------------------------|--------|
| App / Splash | `App.tsx` + landing | **Existe** |
| Onboarding | `OnboardingAcademiaPage`, quiz temperamento | **Parcial** (instrumento/nivel; no asigna ruta 12m automática) |
| Home / Play | `GmusicWelcome` (/alumno) | **Parcial** |
| Journey / Course | `GmusicPath`, `GET /me/path` | **Parcial** (1 curso seed; no 12 meses navegables completos) |
| Library | Admin “biblioteca” bloques; sin catálogo alumno | **No producto** |
| Music engine | MicroExercise + audio URL estático; sin mic realtime | **MVP guiado** |
| Account / Profiles | User + Subscription; sin Profile | **Parcial** |
| Purchases | WhatsApp + activate-semestral dev; sin Stripe | **BRIDGE** |
| Community | API posts + mocks FE | **Parcial** |
| Analytics | PostHog funnel | **Parcial** |
| Admin editorial | `AdminPage` + `admin.ts` | **Parcial** (Module publish sí; Course BRIDGE) |

**Fortalezas:** learning engine backend más desarrollado que comunidad/biblioteca.  
**Debilidades:** módulos comerciales y sociales menos maduros que pedagógicos core.  
**Riesgos:** priorizar Library/Community antes de cerrar path+progreso (orden en decisiones doc ≠ estado código).  
**Preguntas:** ¿qué módulo es P0 para cerrar gap vs Simply Piano UX?

**Evidencia:** `src/app/pages/*`, `server/routes/*`, inventario §6

---

## 5. Frontend

### 5.1 Estado actual

React 18 + Vite 6 + TypeScript. Componentes Gmusic bajo `src/app/components/gmusic/` (path, lesson, dashboard, community). Marketing en `components/marketing/`. Estado global ligero: hooks (`useAuth`, `useDemoProgress`, `useCommunityEnrollment`). Sin Redux/Zustand global documentado.

### 5.2 Fortalezas

- Design tokens y atmósfera (`tokens`, `StudioAtmosphere`, skill visual-vfx).
- Tests de componentes significativos (lesson, path, header, funnel).
- Guards UI: `StudentZoneGuard`, `DemoAuthGuard`.
- Anti-demo F6: pathPresentation controlado, Comunidad nav locked.

### 5.3 Debilidades

- `App.tsx` concentra demasiadas responsabilidades + legacy music monetization v4.
- Mi Progreso: sin página/ruta.
- CommunityPage importa `mock-community-data.ts` para peers/challenges.
- `userTier` mock `"free"` en App para paywall demo.
- react-router en deps pero no es router principal.

### 5.4 Riesgos

- Mocks importados en producción build si se navega a `community` fuera del header locked.
- Inconsistencia docs AGENTS (wizard `#academia`) vs `OnboardingAcademiaPage`.

### 5.5 Oportunidades

- Reutilizar `dashboardAssembly` para Mi Progreso (ya previsto en `07`).
- Lazy routes por zona (funnel vs alumno) — solo tras decisión.

### 5.6 Preguntas

- ¿Se elimina music player legacy del happy path MVP?
- ¿URL `/mi-progreso` se sincronizará en student-zone-routing?

### 5.7 Evidencia

`src/app/App.tsx`, `src/app/components/gmusic/*`, `src/app/pages/GmusicPath.tsx`, `GmusicWelcome.tsx`, `CommunityPage.tsx`, `docs/features/06-mi-camino.md`

---

## 6. Backend y API

### 6.1 Estado actual

Express app (`server/app.ts`): routers montados en `/api/v1/{health,auth,me,onboarding,lesson-sessions,community,admin,dev}`. Errores tipados `ApiError`. CORS configurable. Sentry opcional. Prisma singleton.

### 6.2 Fortalezas

- API REST versionada y predecible.
- Validación de bodies en libs dedicadas (`parseAuthBody`, `parseCreateCommunityPostBody`, etc.).
- Servicios separados de rutas (testeable).
- Admin protegido `requireAdmin`.
- Community exige subscriber (`assertCommunitySubscriber`).

### 6.3 Debilidades

- `lessonSessions` y `me/path` usan `realStudentAuth` sin check subscription explícito en middleware (R-002).
- No hay endpoints CRUD comentarios.
- Dev routes (`/api/v1/dev`) existen — riesgo si expuestos en prod sin gate.
- Course create/publish no expuesto completamente en Admin API/UI (BRIDGE seed).

### 6.4 Riesgos

- Exposición dev endpoints en producción.
- Rate limiting / abuse prevention no observado en community posts.
- JWT secret misconfiguration bloquea arranque (`assertJwtSecretConfigured`) — bien, pero ops crítico.

### 6.5 Oportunidades

- Endpoint agregado lectura progreso (capa C F7) sin nueva arquitectura.
- Health checks ya presentes.

### 6.6 Preguntas

- ¿Todos los endpoints alumno deben usar el mismo middleware de entitlement?
- ¿API GraphQL o REST suficiente a escala MVP?

### 6.7 Evidencia

`server/app.ts`, `server/routes/*.ts`, `server/middleware/realStudentAuth.ts`, `server/middleware/requireAdmin.ts`, `server/tests/*`

---

## 7. Base de datos

### 7.1 Estado actual

PostgreSQL + Prisma 6. Migraciones en `prisma/migrations/`. Seed `ruta-guitarra-12-meses` + bloque piloto T-PUB. Deuda **R-OPS-MIGRATE-UUID** (onboarding_analytics FK UUID vs TEXT en deploy fresh).

### 7.2 Fortalezas

- Relaciones Restrict/Cascade conscientes en contenido vs progreso.
- Índices en consultas feed comunidad y progreso.
- Unique constraints pedagógicos (`moduleId+order`, `userId+nodeId`).

### 7.3 Debilidades

- Prod baseline frágil (DT-06, R-OPS-01).
- Sin migraciones para comentarios, perfiles, biblioteca.
- `planId` libre sin FK.

### 7.4 Riesgos

- Pérdida/corrupción datos = P0 bloqueo launch (MVP §7.9).
- migrate deploy fallido en entornos nuevos.

### 7.5 Oportunidades

- Advisory locks ya usados (`server/lib/advisoryLock.ts`) — patrón para ops.

### 7.6 Preguntas

- ¿Supabase/Render es definitivo o hay migración infra?
- ¿Cuándo se normaliza Plan?

### 7.7 Evidencia

`prisma/schema.prisma`, `prisma/seed.ts`, `docs/roadmap/deuda-tecnica.md`, `docs/roadmap/t-pub-01-evidencia-local.md`

---

## 8. Autenticación y autorización

### 8.1 Estado actual

Registro/login/logout JWT en cookie httpOnly `gmusic_session`. bcrypt passwords. Roles enum STUDENT/GUARDIAN/ADMIN. Email verify **WON'T**. Recovery password **BRIDGE**. Zona alumno: UI `StudentZoneGuard` + `GET /me/access` con `Subscription ACTIVE` (D-017).

### 8.2 Fortalezas

- Flujo auth E2E con tests (`server/tests/auth.test.ts`, `jwtSession.test.ts`).
- Separación admin vs student en middleware.
- Community API valida suscripción activa.

### 8.3 Debilidades

- R-002: lesson-sessions/me.path no revalidan entitlement en capa middleware.
- GUARDIAN role sin producto.
- Docs históricos “auth pausada” vs código vivo (DT-02, DT-03).
- Sin MFA, sin verify email, sin rotación sesión documentada para alumno.

### 8.4 Riesgos

- INC credencial admin prod (mencionado en inventario).
- Dev student auth por email (`GMUSIC_DEV_USER_EMAIL`) si leak a prod.

### 8.5 Oportunidades

- `resolveStudentAccess` ya centralizado — candidato natural a middleware.

### 8.6 Preguntas

- ¿Password recovery se implementa o permanece BRIDGE?
- ¿GUARDIAN se elimina del enum o se reserva?

### 8.7 Evidencia

`server/services/authService.ts`, `server/lib/jwtSession.ts`, `server/lib/studentAccess.ts`, `server/services/accessService.ts`, `docs/features/04-auth-usuarios.md`, `src/app/components/gmusic/StudentZoneGuard.tsx`

---

## 9. Navegación y routing

### 9.1 Estado actual

`currentPage` string + `student-zone-routing.ts`: sync para `/`, `/alumno`, `/mi-camino`, funnel demo, `/inscripcion`, `/admin`, onboarding URLs. Comunidad `community` **sin** URL pública sync (AGENTS). `popstate` maneja subset; unknown → home.

### 9.2 Fortalezas

- D-GOV-02/03 funnel URLs implementadas.
- Guards de demo auth antes de entrar demo.
- Tests routing (`student-zone-routing` tests implícitos en suite).

### 9.3 Debilidades

- Tabla AGENTS incompleta vs código.
- Mi Progreso sin URL.
- Legacy pages no en mapa oficial.
- Header Comunidad locked pero página `GmusicCommunity` existe.

### 9.4 Riesgos

- Deploy SPA rewrites necesarios en host (documentado, no siempre verificado prod).
- Deep links fuera del mapa caen a home.

### 9.5 Oportunidades

- Mapa único generado desde `student-zone-routing.ts` para docs.

### 9.6 Preguntas

- ¿Comunidad tendrá `/comunidad` sync?
- ¿Se formaliza lista blanca de `currentPage`?

### 9.7 Evidencia

`src/app/utils/student-zone-routing.ts`, `AGENTS.md`, `src/app/App.tsx`, `vercel.json`

---

## 10. Experiencia del alumno (zona suscriptor)

### 10.1 Estado actual

Flujo: login → `/me/access` → Mi Estudio (`GmusicWelcome`) o Mi Camino (`GmusicPath`). Dashboard API real (`dashboardAssembly.ts`). Path desde Postgres publicado. Lesson runner (`LessonRunnerShell.tsx`) con etapas prepare/practice/checklist. Comunidad accesible por página pero **nav bloqueado**.

### 10.2 Fortalezas

- Mi Camino con estados nodo locked/available/active/completed.
- Empty/error/loading documentados post F6 anti-demo.
- CTA dinámico demo vs suscriptor separados.

### 10.3 Debilidades

- T-UX-LESSON-01: persistencia completa post-consumo en frontera.
- Sin Mi Progreso dedicado.
- Sin biblioteca alumno.
- Onboarding no asigna automáticamente mes/ruta 12m.

### 10.4 Riesgos

- Alumno sin contenido PUBLISHED en prod ve vacío (T-PUB DONE LOCAL ≠ prod).
- UX fragmentada entre Estudio y Camino.

### 10.5 Oportunidades

- Contrato `07` listo para UI capa C.
- Hero panel audio permission (`StudentHeroPanel`) — base UX permisos.

### 10.6 Preguntas

- ¿Mi Estudio sigue siendo home o Mi Camino según decisiones A3?
- ¿Cuántos bloques publicados mínimo para UX aceptable?

### 10.7 Evidencia

`src/app/pages/GmusicWelcome.tsx`, `GmusicPath.tsx`, `server/services/dashboardAssembly.ts`, `server/services/meService.ts`, `docs/features/06-mi-camino.md`

---

## 11. Sistema pedagógico y metodología FTC

### 11.1 Estado actual

Metodología documentada: **Fundamento → Técnica → Crea** (marketing) + **5 StageType por Module** (motor). D-GOV-04: Nivel 1 = 12 bloques (10 arco + 2 teoría). Matriz UI 3×3 en onboarding (`InteractiveLevelSelector`). Validator publish: título + `completionCriteria` + 5 StageType (`curriculum.ts`).

### 11.2 Fortalezas

- Unidad pedagógica operativa clara en schema (no paralelo LessonCard).
- Admin R-008 alineado a publicar bloques.
- Specs pedagógicos en `.agents/DECISIONS.md` D-GOV-04.

### 11.3 Debilidades

- Contenido jugable en prod ≪ 12 bloques (solo piloto local).
- Fundamento/Técnica/Crea en UI ≠ 5 StageType en schema (mapeo no 1:1 automático).
- Currículo 6–75 / motor largo documentado pero no implementado.

### 11.4 Riesgos

- Inconsistencia curricular (R2 en decisiones doc) si se publican bloques sin orden D-GOV-04.
- Teaser demo 6–15 labels vs bloques reales — gobernanza D-GOV-06 mitiga pero requiere disciplina editorial.

### 11.5 Oportunidades

- `lesson-stage.ts` mapea StageType a slots UI.

### 11.6 Preguntas

- ¿FTC = PathNode o sub-división dentro del nodo?
- ¿Los 12 meses son 12 Modules o agrupación superior?

### 11.7 Evidencia

`server/services/curriculum.ts`, `src/app/components/gmusic/lesson/lesson-stage.ts`, `.agents/DECISIONS.md` D-GOV-04, `docs/features/05-academia-cursos.md`

---

## 12. Ruta de 12 meses

### 12.1 Estado actual

Curso slug `ruta-guitarra-12-meses` en seed/config. **Un** Module publicado en piloto T-PUB LOCAL. No hay entidad `MesDeRuta` ni UI “mes 3 de 12”. Roadmap y decisiones A1 describen eje anual; código implementa **curso lineal modular** extensible.

### 12.2 Fortalezas

- Naming y slug comunican intención 12 meses.
- Pipeline Module→PathNode escala a N bloques.

### 12.3 Debilidades

- Gap enorme contenido vs promesa 12 meses.
- Sin navegación temporal (mes/semana).
- Sin asignación onboarding → mes inicial (B5 referencia).

### 12.4 Riesgos

- Expectativa marketing vs realidad contenido.
- Publicar bloques fuera de orden rompe narrativa anual.

### 12.5 Oportunidades

- Usar `Module.order` como proxy de mes/bloque hasta modelo explícito.

### 12.6 Preguntas

- ¿12 meses = 12 modules exactos?
- ¿Ruta es única por instrumento o por perfil?

### 12.7 Evidencia

`server/config.ts`, `prisma/seed.ts`, `docs/roadmap/t-pub-01-evidencia-local.md`, decisiones doc A1/D3/D4

---

## 13. Modelo FTC (5 tarjetas)

### 13.1 Estado actual

Implementación = **5 PathNode** con `StageType` fijos por Module. UI lesson runner por etapas (`lesson-stage.ts`). No hay tabla `TarjetaFTC` ni `UnidadFTC` (decisiones D5/D6).

### 13.2 Fortalezas

- Regla de 5 etapas enforced en validator publish.
- Stage types alineados a ciclo práctica pedagógica.

### 13.3 Debilidades

- Tarjetas no son componentes UI independientes reutilizables fuera del runner.
- MicroExercise opcional (SHOULD) — bloques pueden publicarse sin ejercicios.

### 13.4 Riesgos

- Confundir “5 botones UI Academia” con “5 PathNode FTC” en comunicación equipo.

### 13.5 Oportunidades

- Documentar mapping FTC ↔ StageType ↔ lesson stages (parcial en F5).

### 13.6 Preguntas

- ¿Cada tarjeta FTC tiene duración/XP propios obligatorios?

### 13.7 Evidencia

`prisma/schema.prisma` StageType, `server/services/curriculum.ts`, `docs/features/05-academia-cursos.md`

---

## 14. Mi Camino

### 14.1 Estado actual

**Documental:** `06-mi-camino.md` v1.0 **D-F6-001**. **Código:** `GET /me/path`, `GmusicPath`, carousel/path nodes, anti-demo (`pathPresentation.ts`). T-PUB DONE LOCAL alimenta path en Docker.

### 14.2 Fortalezas

- Contrato API path con status derivado y activeNode.
- Tests `path-presentation.test.ts`, anti-demo audit coherente.
- Separación demo path vs suscriptor path.

### 14.3 Debilidades

- focus/duration editorial vacíos (DT-11, DT-12).
- Dependencia T-UX para completar nodos.
- VFX/serpiente avanzada fuera MVP.

### 14.4 Riesgos

- Path vacío si Course no PUBLISHED en env alumno.

### 14.5 Oportunidades

- Reuso como hub A3 (decisiones) ya parcialmente cumplido.

### 14.6 Preguntas

- ¿Serpiente/map visual es MUST o SHOULD?

### 14.7 Evidencia

`docs/features/06-mi-camino.md`, `server/services/coursePath.ts`, `server/lib/pathPresentation.ts`, `src/app/pages/GmusicPath.tsx`

---

## 15. Mi Progreso

### 15.1 Estado actual

**Documental:** `07-mi-progreso.md` v1.0 **D-F7-001** (capa B cerrada; capa C launch abierta). **Código:** datos en `UserProgress`, `LessonSession`, `XpEvent`, `StreakEvent`, agregación parcial en `dashboardAssembly.ts`. **UI página dedicada: inexistente.**

### 15.2 Fortalezas

- Fórmula % y fuentes documentadas en `07`.
- Motor ya persiste completados y timestamps.
- Ticket T-MVP-PROGRESS acotado.

### 15.3 Debilidades

- Sin ruta `/mi-progreso`.
- Rachas/XP en schema pero OUT contrato MVP UI avanzada.
- Capa C depende T-UX + env medible.

### 15.4 Riesgos

- Dashboard mezcla métricas sin superficie dedicada puede confundir alumno.
- Declarar launch sin UI viola MVP §7.6b.

### 15.5 Oportunidades

- Implementación lectura-only API + página mínima (mandato aparte).

### 15.6 Preguntas

- ¿Mi Progreso vive en Estudio o página propia?

### 15.7 Evidencia

`docs/features/07-mi-progreso.md`, `server/services/dashboardAssembly.ts`, `docs/project-status/00-inventario-actual.md` §6

---

## 16. Comunidad

### 16.1 Estado actual

**API:** enrollment CRUD, list/create posts (`community.ts`). **FE:** `CommunityPage`, mocks peers/challenges (`mock-community-data.ts`). **Nav:** locked (`GmusicInternalHeader.tsx`). **F8:** brief listo, `08` no creado. Comentarios: **stub** `comments: 0`.

### 16.2 Fortalezas

- Modelo posts con level, instrument, external links.
- `communityAccess.ts` autorización por nivel.
- Regla mocks ≠ launch explícita en gobernanza.

### 16.3 Debilidades

- Sin persistencia comentarios.
- UI mezcla API posts + mock peers.
- Moderación admin mínima no auditada end-to-end en código leído.

### 16.4 Riesgos

- Desbloquear nav sin retirar mocks = violación DoD §7.6c.
- Feed vacío sin empty state pulido en todos los paths.

### 16.5 Oportunidades

- T-MVP-COMMUNITY acotado en backlog F8.

### 16.6 Preguntas

- ¿Comunidad por cohorte (A8) o feed global por nivel?
- ¿Likes son MUST o stub como comments?

### 16.7 Evidencia

`server/routes/community.ts`, `server/services/communityService.ts`, `src/app/data/mock-community-data.ts`, `src/app/components/gmusic/GmusicInternalHeader.tsx`, `docs/roadmap/fase-8-instruccion.md`

---

## 17. Biblioteca

### 17.1 Estado actual

**No existe** módulo Biblioteca alumno (decisiones A5/D10). “Biblioteca” en ops = inventario **Admin** de Modules/bloques (`AdminPage.tsx`, `T-PUB-01` docs). PathNode lleva `videoUrl`, `guidePdfUrl`, `guideText`. Seed referencia CDN audio samples.

### 17.2 Fortalezas

- Media por etapa en schema.
- Admin lista bloques publicables.

### 17.3 Debilidades

- Sin catálogo buscable, favoritos, desbloqueos por plan.
- Sin `RecursoBiblioteca` entity.
- Análisis CourseLit/Elvis en `docs/` solo referencia externa.

### 17.4 Riesgos

- Confundir biblioteca admin con biblioteca alumno en roadmap.

### 17.5 Oportunidades

- PathNode media como proto-recursos hasta catálogo editorial (B4).

### 17.6 Preguntas

- ¿Biblioteca es P1 post-MVP o parte del cierre MVP?

### 17.7 Evidencia

`src/app/pages/AdminPage.tsx`, `docs/operations/T-PUB-01-piloto-bloque-1-admin.md`, `docs/courselit-analysis/*`, decisiones A5/B4

---

## 18. Multimedia y contenido

### 18.1 Estado actual

Videos via `videoUrl` (externos). PDFs `guidePdfUrl`. Ejercicios con `contentPayload` JSON (imágenes, audio URLs). `normalizeMaterialUrl.ts` en server. Content kind derivation (`contentKind.ts`: video, audio_lab, reward).

### 18.2 Fortalezas

- Validación URLs en parse exercise payload (anti javascript:).
- Separación payload público vs secureAnswer.

### 18.3 Debilidades

- Sin CDN/hosting propio documentado en repo (URLs seed a `cdn.gmusic.academy`).
- Sin pipeline upload admin completo para media (parcial).
- Video-first lesson depende URLs externas estables.

### 18.4 Riesgos

- Links rotos = lección rota sin fallback.
- Sin transcoding/streaming dedicado (Track B Stream fuera).

### 18.5 Oportunidades

- Cloudflare Stream / Sanity = Track B solo.

### 18.6 Preguntas

- ¿Quién hospeda media en launch?

### 18.7 Evidencia

`prisma/schema.prisma` PathNode, `server/lib/normalizeMaterialUrl.ts`, `src/app/components/gmusic/lesson/parse-exercise-payload.ts`, `prisma/seed.ts`

---

## 19. Audio y motor musical

### 19.1 Estado actual

**No** hay motor realtime micrófono/MIDI/pitch como Simply Piano. Audio = reproducción de samples HTTPS en ejercicios + Web Audio API puntual (`free-fundamento-lesson.ts` feedback tonal). Exercise types: IDENTIFY_NOTE, RHYTHM_TAP, EAR_TRAINING, CHORD_SHAPE — evaluación server-side con `secureAnswer`.

### 19.2 Fortalezas

- Alineado a decisión B3/C1 referencia: MVP guiado sin depender de mic crítico.
- Validación respuestas en backend.
- Tests payload audio URL safety.

### 19.3 Debilidades

- EAR_TRAINING sin captura audio alumno — selección opciones únicamente.
- Sin Oboe/TFLite/native libs (imposible en web stack actual sin proyecto aparte).
- `StudentHeroPanel` pide permiso audio — uso limitado.

### 19.4 Riesgos

- Expectativa usuario “Simply Piano-like” vs realidad tap/select.
- Latencia/red en samples móvil.

### 19.5 Oportunidades

- Fase 2 audio asistido post-telemetría (decisiones O3/RM4).

### 19.6 Preguntas

- ¿AlphaTab/partituras (D-GOV-07) entran en roadmap Track A?

### 19.7 Evidencia

`src/app/utils/free-fundamento-lesson.ts`, `src/app/components/gmusic/lesson/*`, `server/lib/answerValidation.ts`, decisiones B3/C1

---

## 20. Pagos, suscripciones y entitlements

### 20.1 Estado actual

`Subscription` con `planId` string. Activación semestral dev endpoint. WhatsApp BRIDGE conversión. Stripe **WON'T**. Frontend planes marketing TS. `activateSemestralWithAccessVerification` en cliente.

### 20.2 Fortalezas

- Gate ACTIVE claro D-017.
- `selectBestActiveSubscription` determinista.
- Decisión consciente sin pasarela prematura.

### 20.3 Debilidades

- Sin módulo Entitlements (A7/D13) — solo subscription row.
- planId no validado contra catálogo.
- Familiar/multi-perfil no ligado a plan.

### 20.4 Riesgos

- Ops manual no escala.
- C5 referencia: flags locales vs derechos — parcialmente mitigado en access API pero no en todos los endpoints.

### 20.5 Oportunidades

- Tabla Plan + entitlements mapping (decisión futura).

### 20.6 Preguntas

- ¿Mercado Pago timeline?
- ¿Qué features gating por planId hoy?

### 20.7 Evidencia

`prisma/schema.prisma` Subscription, `server/lib/studentAccess.ts`, `src/app/utils/public-subscription-flow.ts`, `docs/product/01-mvp-gmusic.md` §6 planes

---

## 21. Administración editorial

### 21.1 Estado actual

`AdminPage.tsx` + `server/routes/admin.ts`: CRUD modules/path nodes, publish validator, reports. Course **BRIDGE** (seed). R-008 MVP Admin Creador. Opción C auditoría pre-F7 documentada.

### 21.2 Fortalezas

- Pipeline publish→alumno probado LOCAL (D-TPUB-01).
- requireAdmin middleware.
- Password reset gate tests.

### 21.3 Debilidades

- Sin UI publish Course completa.
- Credencial admin prod riesgo P0.
- Sin workflow revisión editorial multi-rol.

### 21.4 Riesgos

- Publicar contenido incompleto si validator SHOULD media no enforced.

### 21.5 Oportunidades

- Extender admin solo tras decisión — base sólida Module/PathNode.

### 21.6 Preguntas

- ¿Quién es editor vs admin en launch?

### 21.7 Evidencia

`src/app/pages/AdminPage.tsx`, `server/routes/admin.ts`, `docs/roadmap/auditoria-admin-editorial-pre-f7.md`, `docs/features/05-academia-cursos.md`

---

## 22. Escalabilidad

### 22.1 Estado actual

Monolito Express single instance típico. Postgres relacional. Sin colas, sin cache Redis, sin sharding. Stateless API (JWT cookie + DB). Vercel edge para estáticos.

### 22.2 Fortalezas

- Arquitectura simple operable para MVP validación.
- Prisma connection pooling vía host managed.

### 22.3 Debilidades

- Session/completion writes síncronos — cuello si picos.
- Sin CDN aplicación dinámica.
- Feed comunidad list sin paginación auditada aquí.

### 22.4 Riesgos

- Picos campaña marketing + DB pequeña.
- Long-running lesson sessions sin job queue.

### 22.5 Oportunidades

- Paginación cursor en posts/path si necesario.

### 22.6 Preguntas

- ¿Cuántos MAU target antes de redis/workers?

### 22.7 Evidencia

`server/app.ts`, `docs/architecture/02-arquitectura-sistema.md`, decisiones AR1

---

## 23. Rendimiento

### 23.1 Estado actual

Vite build, code splitting default. Imágenes `preloadCriticalImages`. API responses JSON moderados. Tests no incluyen benchmarks. Sentry performance opcional.

### 23.2 Fortalezas

- SPA ligera para zona alumno core.
- `Cache-Control: no-store` en endpoints sensibles access/community.

### 23.3 Debilidades

- `App.tsx` bundle potencialmente grande por legacy + marketing.
- Sin métricas CWV documentadas en repo.
- Map path carga todos los modules/nodes — OK para 12 bloques, no para 75+ sin paginación.

### 23.4 Riesgos

- LCP en landing con assets PNG por sección.
- N+1 queries no auditado exhaustivamente en esta pasada.

### 23.5 Oportunidades

- Lazy load legacy pages (ya parcial DEV_LEGACY).

### 23.6 Preguntas

- ¿Presupuesto bundle máximo móvil?

### 23.7 Evidencia

`package.json` build, `src/app/utils/image-config.ts`, `server/routes/me.ts`

---

## 24. Mantenibilidad

### 24.1 Estado actual

~100 archivos test. Skills y gobernanza `.agents/`. TypeScript estricto en scripts. Monorepo app path único. Vendor-sources courselit/elvis como análisis, no producto.

### 24.2 Fortalezas

- `npm run verify` = typecheck + test + build.
- Protocolo ciclo cerrado loop.mdc.
- Features docs 04–07 trazables.

### 24.3 Debilidades

- Working tree dirty histórico.
- Duplicación skills `.cursor` vs `.agents`.
- Legacy code paths en App.
- Cifras tests en CLAUDE.md desactualizadas.

### 24.4 Riesgos

- Onboarding dev lento por docs contradictorios.
- vendor-sources pesa repo.

### 24.5 Oportunidades

- Higiene post-fase repetible (F6/F7 pattern).

### 24.6 Preguntas

- ¿vendor-sources permanece en repo principal?

### 24.7 Evidencia

`package.json`, `.agents/PROJECT_STATUS.md`, `docs/roadmap/deuda-tecnica.md`, `CLAUDE.md`

---

## 25. Seguridad

### 25.1 Estado actual

JWT httpOnly, bcrypt, CORS middleware, requireAdmin, secureAnswer server-only, parse validators, dev routes separados, Sentry errors. Tests auth/community access.

### 25.2 Fortalezas

- No exponer secureAnswer en API pública.
- Role checks en middleware.
- URL validation en exercise payloads.

### 25.3 Debilidades

- R-002 authorization gap.
- Sin rate limit observado.
- Sin CSP audit en este informe.
- Admin credencial prod históricamente insegura (INC).

### 25.4 Riesgos

- OWASP API1 broken authz en lesson endpoints.
- XSS via contentPayload si sanitización FE incompleta (no auditado exhaustivo).

### 25.5 Oportunidades

- Centralizar entitlement middleware.
- Rotación credenciales playbook ops.

### 25.6 Preguntas

- ¿Pentest antes de launch público?

### 25.7 Evidencia

`server/middleware/*`, `server/lib/exercisePublic.ts`, `server/tests/me-access.test.ts`, `docs/quality/definition-of-done.md` §permisos

---

## 26. Deuda técnica (consolidado)

| ID | Ítem | Severidad | Evidencia |
|----|------|-----------|-----------|
| DT-01 | AGENTS Academia obsoleto | Media | `00-inventario-actual.md` |
| DT-02–03 | Docs auth/JWT contradictorios | Media–Alta | `deuda-tecnica.md` |
| DT-04 | Legacy App pages | Baja | `App.tsx` |
| DT-05 | Comunidad mocks | Media | `mock-community-data.ts` |
| DT-06 | Prisma prod baseline | Alta | R-OPS-01 |
| DT-07 | LessonRunner incompleto | Media | T-UX-LESSON-01 |
| DT-08 | Sin Mi Progreso UI | Media | `07`, inventario |
| DT-09 | Tree dirty / vendor-sources | Baja | PROJECT_STATUS |
| DT-11–12 | focus/duration editorial | Baja | `06` anti-demo |
| R-001 | Session sin snapshot contenido | Alta (condicional) | working map |
| R-002 | Entitlements no universal API | Alta (pre-usuarios reales) | working map |
| R-003 | Demo vs Academy dual source | Media | working map |
| R-OPS-MIGRATE-UUID | Migrate fresh local | Media | backlog |

---

## 27. Consistencia (código · docs · gobernanza · referencia)

### 27.1 Estado actual

**Fuerte:** Fases 0–7 documentales alineadas (`decisiones.md`, features `04`–`07`, MVP congelado). **Débil:** satélites AGENTS/CLAUDE, comentarios MVP vs schema, metodología 12m/FTC en decisiones JoyTunes vs 1 bloque publicado.

### 27.2 Matriz gap vs adopciones referencia (solo diagnóstico)

| ID ref. | Tema | En código/docs GMusic hoy |
|---------|------|---------------------------|
| A1 | Ruta 12 meses | Slug + diseño; **1 bloque** publicado local |
| A2 | FTC 5 tarjetas | **5 PathNode/StageType** por Module |
| A3 | Mi Camino centro | **Parcial** — existe; Estudio compite |
| A4 | Mi Progreso | **Docs sí; UI no** |
| A5 | Biblioteca | **No** (admin only) |
| A6 | Perfiles | **No** (User único) |
| A7 | Entitlements | **Parcial** (Subscription; R-002) |
| A8 | Comunidad cerrada | **Parcial** (API; mocks; nav lock) |
| B3 | Motor musical por fases | **Cumple** MVP guiado |
| C1 | Sin audio nativo MVP | **Cumple** |

### 27.3 Preguntas abiertas para Codex

1. ¿Prioridad P0: R-002 + ops P0 vs contenido T-PUB prod vs Mi Progreso UI?
2. ¿Perfiles y Biblioteca entran en Track A o post-MVP?
3. ¿Se formaliza mapping Mes 1..12 → Module.order?
4. ¿Comunidad se lanza con comentarios o reduce MUST?
5. ¿Cuándo se congela App.tsx legacy cleanup?
6. ¿Track B sigue bloqueado hasta conversión WhatsApp?
7. ¿Entitlements module es requisito pre-launch o post primeros 100 alumnos?

---

## 28. Tests y verificación

| Métrica | Valor observado |
|---------|-----------------|
| Archivos `*.test.ts(x)` | ~100 (`find` src+server) |
| Comando canónico | `npm run verify` (typecheck + test + build) |
| Cifra documentada | 563+ en PROJECT_STATUS (verificar en SHA limpio) |
| Cobertura dominios | auth, path, lesson payload, community, admin, curriculum, cors, routing |

**Debilidad:** verify no ejecutado en esta auditoría (mandato solo lectura). **Riesgo:** declarar verde sin corrida actual.

---

## 29. Índice de evidencia por archivo (top 40)

1. `prisma/schema.prisma` — dominio persistido  
2. `server/app.ts` — composición API  
3. `server/routes/me.ts` — path/dashboard/access  
4. `server/routes/lessonSessions.ts` — sesiones  
5. `server/routes/community.ts` — comunidad  
6. `server/routes/admin.ts` — editorial  
7. `server/services/coursePath.ts` — path alumno  
8. `server/services/communityService.ts` — feed + stub comments  
9. `server/lib/studentAccess.ts` — entitlement resolution  
10. `server/services/curriculum.ts` — publish validator  
11. `server/lib/nodeStatus.ts` — unlock logic  
12. `src/app/App.tsx` — navegación global  
13. `src/app/utils/student-zone-routing.ts` — URL sync  
14. `src/app/pages/GmusicPath.tsx` — Mi Camino UI  
15. `src/app/pages/GmusicWelcome.tsx` — Mi Estudio  
16. `src/app/components/gmusic/GmusicInternalHeader.tsx` — nav lock comunidad  
17. `src/app/pages/CommunityPage.tsx` — feed + mocks  
18. `src/app/data/mock-community-data.ts` — peers mock  
19. `src/app/components/gmusic/lesson/LessonRunnerShell.tsx` — consumo lección  
20. `docs/product/01-mvp-gmusic.md` — contrato  
21. `docs/architecture/02-modelo-datos.md` — modelo aprobado  
22. `docs/architecture/02-arquitectura-sistema.md` — capas  
23. `docs/architecture/gmusic-architecture-working-map.md` — riesgos  
24. `docs/features/04-auth-usuarios.md` — auth  
25. `docs/features/05-academia-cursos.md` — academia  
26. `docs/features/06-mi-camino.md` — camino  
27. `docs/features/07-mi-progreso.md` — progreso docs  
28. `docs/project-status/00-inventario-actual.md` — inventario  
29. `docs/roadmap/deuda-tecnica.md` — deuda  
30. `docs/roadmap/decisiones.md` — D-F1…D-F7  
31. `.agents/PROJECT_STATUS.md` — estado operativo  
32. `docs/quality/definition-of-done.md` — DoD  
33. `prisma/seed.ts` — contenido demo  
34. `server/config.ts` — defaultCourseSlug  
35. `package.json` — scripts/stack  
36. `vercel.json` — deploy SPA  
37. `docs/roadmap/fase-8-instruccion.md` — F8 pendiente  
38. `docs/roadmap/t-pub-01-evidencia-local.md` — piloto publish  
39. `docs/roadmap/auditoria-admin-editorial-pre-f7.md` — Course BRIDGE  
40. JoyTunes `decisiones_arquitectura_gmusic.md` — lente comparación  

---

## 30. Cierre de auditoría

Este documento es **evidencia diagnóstica** del estado al **2026-07-16**. No autoriza implementación, no sustituye decisiones D-F* ni el MVP congelado, y no cierra brechas R-001/R-002.

**Próximo paso sugerido (para humanos/Codex, no ejecutado aquí):** priorizar decisiones sobre R-002, contenido prod T-PUB, capa C Mi Progreso, y alcance F8 Comunidad — usando este informe + `decisiones_arquitectura_gmusic.md` como insumos separados (diagnóstico vs propuesta).

---

*Auditoría READ-ONLY · Cursor ejecutor · sin modificaciones al repositorio productivo · referencia JoyTunes solo conceptual*
