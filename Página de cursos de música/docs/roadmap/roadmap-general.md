# Roadmap general GMusic

**Estructura canónica:** las **10 fases del diagrama** (infográfico GMusic).  
Confirmado Juan (D-ROAD-003): *"La estructura está bien como el de la diagrama."*

Stack real = **Track A** (Vite + React + Express + Prisma). Herramientas del cartel (NextAuth, Stripe, Discourse, Docker, etc.) = **referencia**, no obligación de adopción.

**Pilares:** ENFOCAR · CONSTRUIR · PROBAR · LANZAR · ESCALAR  

**Reglas:** una fase a la vez · 100% antes de la siguiente · usuarios reales temprano · documentar · calidad > cantidad.

El **protocolo 0–15** queda como **checklist detallado subordinado** (columna “Equivalencia”), no como estructura primaria.

Inventario pre-fase (auditoría): **Fase 0 / pre-Fase 1** — `docs/project-status/00-inventario-actual.md` · **TERMINADA** (pendiente OK Juan).

---

## Tabla de fases (diagrama)

| Fase | Nombre | Objetivo | Entregable | Estado real (ETAPA 0 inventario) | Equivalencia protocolo 0–15 | Duración estimada (poster) |
|------|--------|----------|------------|----------------------------------|-----------------------------|----------------------------|
| **0** | Inventario (pre-fase) | Entender estado verdadero del repo antes de planear | `00-inventario-actual.md` + `docs/roadmap/*` | **TERMINADA** (pendiente OK Juan) | Etapa 0 | — (auditoría) |
| **1** | DEFINIR Y PLANEAR | MVP, audiencia, alcance, roadmap escrito | `docs/product/01-mvp-gmusic.md` | **TERMINADA / APROBADA** — **D-F1-001** (2026-07-14) · MVP congelado · DoD en `docs/quality/definition-of-done.md` | Etapa 1 | 1 semana |
| **2** | ARQUITECTURA Y DISEÑO | Arquitectura, modelo de datos, reglas de dominio | `02-modelo-datos.md` · `02-arquitectura-sistema.md` | **TERMINADA / APROBADA** — **D-F2-001** (2026-07-14) | Etapa 2 | 1–2 semanas |
| **3** | INFRAESTRUCTURA BASE | Entorno, verify, DB/ops, deploy SPA | `docs/setup/03-entorno-desarrollo.md` (+ anexos si aplican) | **TERMINADA / APROBADA** — **D-F3-001** (2026-07-14) · guía oficial entorno Track A · **D-F3-WIP** supersedido | Etapa 3 (+ ops de 12) | 1 semana |
| **4** | AUTENTICACIÓN Y USUARIOS | Cuentas, sesión, permisos, roles | Auth usable + política de verify/sesión (`docs/features/04-auth-usuarios.md`) | **TERMINADA / APROBADA** — **D-F4-001** (2026-07-15) · `04` canónico Auth Track A · **D-F4-WIP** supersedido · recovery **BRIDGE** · Fase 5 **NO** | Etapa 4 | 1–2 semanas |
| **5** | ACADEMIA / CURSOS | Catálogo, onboarding instrumento→nivel, currículo publicable | Academia + pipeline contenido (admin→alumno) · entregable docs: `docs/features/05-academia-cursos.md` | **TERMINADA / APROBADA** — **D-F5-001** (2026-07-15) · `05` canónico · **T-PUB-01 DONE LOCAL** (**D-TPUB-01**, evidencia `t-pub-01-evidencia-local.md`) · F6 **NO** · sin prod · sin código | Etapas 5 + 10 (admin como soporte) | 2–3 semanas |
| **6** | MI CAMINO | Path alumno: nodos, lecciones, práctica | Camino demo + suscriptor sólidos · entregable docs: `docs/features/06-mi-camino.md` | **TERMINADA / APROBADA** — **D-F6-001** (2026-07-15) · `06` canónico v1.0 · T-PUB DONE LOCAL · T-F6-ANTI-DEMO CERRADO · F7 **NO** | Etapa 6 | 1–2 semanas |
| **7** | MI PROGRESO | Superficie de progreso mínima para el alumno | Página “Mi Progreso” (MUST mínimo D-ROAD-005 B) | **TERMINADA / APROBADA** — **D-F7-001** (2026-07-15) · `07` canónico v1.0 · fase documental · **≠ launch-ready** (capa C abierta) · Course BRIDGE · T-PUB DONE LOCAL · F8 **NO** | Etapa 7 | 1–2 semanas |
| **8** | COMUNIDAD | Feed real básico | Comunidad alumno sin mocks de launch | **Brief listo · ejecución NO** — `fase-8-instruccion.md` · sin `08` · código **PARCIAL** (feed API; peers mock ≠ launch · D-ROAD-005 C) · nav bloqueada · F9 **NO** | Etapa 8 | 2–3 semanas |
| **9** | PAGOS Y SUSCRIPCIONES | Acceso de pago y suscripción | Bridge humano → (luego) pasarela si se decide | **SIMULADA / PARCIAL** — WhatsApp + modelo Subscription; sin pasarela | Etapa 9 | 1–2 semanas |
| **10** | PULIR, PROBAR Y LANZAR | UX, tests, piloto usuarios, lanzamiento MVP | Checklist lanzamiento + piloto real | **EN CURSO / PARCIAL** — 563 tests + smoke; conversión WhatsApp y cierre MVP abiertos | Etapas 11–14 (+ 15 post-lanzamiento) | 1–2 semanas |

---

## Checklist subordinado (protocolo 0–15)

Usar solo para detalle operativo; **no** redefine el orden canónico.

| Protocolo | Tema | Dónde cae en el diagrama |
|-----------|------|--------------------------|
| 0 | Inventario | Fase 0 |
| 1 | MVP escrito | Fase 1 |
| 2 | Arquitectura / datos | Fase 2 |
| 3 | Infra base | Fase 3 |
| 4 | Auth | Fase 4 |
| 5 | Academia | Fase 5 |
| 6 | Mi Camino | Fase 6 |
| 7 | Mi Progreso | Fase 7 |
| 8 | Comunidad | Fase 8 |
| 9 | Planes / pagos | Fase 9 |
| 10 | Administración | Soporte de Fase 5 (contenido) |
| 11 | Calidad visual UX | Fase 10 |
| 12 | Pruebas / estabilización | Fase 10 (+ continua) |
| 13 | Piloto usuarios reales | Fase 10 |
| 14 | Lanzamiento MVP | Fase 10 |
| 15 | Mejora continua | Post–Fase 10 (ESCALAR) |

**Regla:** no iniciar Fase N+1 hasta cierre formal de N (salvo excepción autorizada por Juan).
