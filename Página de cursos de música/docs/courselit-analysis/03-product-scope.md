# 03 — Tipo de producto / alcance (Fase 2)

> **Fuente:** `vendor-sources/courselit`  
> **Fecha:** 2026-07-13  
> **Complementa:** `02-repository-inventory.md`  

Leyenda: **[F]** · **[I]** · **[R]** · **[?]**  
Clasificación por categoría: **principal** · **secundaria** · **parcial** · **no implementada** · **información insuficiente**

---

## Veredicto

**CourseLit es principalmente** una suite **creador LMS + ecommerce de productos digitales + memberships-as-access + page builder**, multi-tenant por **“school” = `Domain`**.

Se autodefine como alternativa open-source a Teachable / Thinkific / Podia (`docs/README.md`, `apps/docs-new/.../vision.mdx`: *“WordPress of course and membership platforms”*).

**No es** un ERP/académico de conservatorio: no hay familias, temporadas lectivas, grupos horarios físicos, asistencia ni deuda familiar en el modelo.

---

## Autoposicionamiento de marketing **[F]**

| Afirmación | Evidencia |
|------------|-----------|
| Vender cursos + downloads desde sitio propio | `docs/README.md` |
| LMS “batteries included” | `docs/README.md` §“A modern LMS…” |
| Authoring, students, Stripe, website builder, sales pages | `docs/README.md` Features |
| Vision vs Teachable/Thinkific/Podia/Learnworlds | `apps/docs-new/content/docs/getting-started/vision.mdx` |
| Features: courses, downloads, website, blog, communities (beta), email marketing (beta), gateways | docs features / getting-started |
| Multi-tenant app | `AGENTS.md` |

---

## Matriz de categorías

| Categoría | Clasificación | Evidencia breve |
|-----------|---------------|-----------------|
| Creador de cursos / authoring | **principal** | `CourseType`, lessons, quizzes, SCORM, drip (`common-models` / `course.ts`) |
| Venta / ecommerce de cursos | **principal** | `PaymentPlan`, `Invoice`, Stripe/Razorpay/LS, sales pages |
| LMS (consumo + progreso) | **principal** | Viewer + `User.purchases`/`Progress`, certificates, quizzes |
| Plataforma de membresías | **principal** | `Membership` → `course\|community` + planes FREE/ONE_TIME/EMI/SUBSCRIPTION |
| Contenido / CMS / page builder | **principal** | `Page` + `packages/page-blocks` |
| Multiusuario | **secundaria** | Users por domain + permission strings |
| Multitenant | **principal** | `Domain` + `MULTITENANT` host resolve |
| Marketplace multi-vendedor | **no implementada** | Una school vende su catálogo; no multi-seller |
| Backoffice educativo escolar | **parcial** | Admin de students/progress/comunidad — no ops institucional |
| Sistema académico (periodos, notas, cohortes SIS) | **no implementada** | Solo quiz `passingGrade`; “cohort” como tag ejemplo |
| Administrativo / ERP (familias, deuda, salas) | **no implementada** | Sin modelos family/season/attendance/room |

---

## Qué significa “school” y “membership”

### School = tenant **[F]**

`Domain` (`packages/orm-models/.../domain.ts`): nombre, customDomain, settings, theme, owner email.  
Docs: school = contenedor de marca/subdominio, no matrícula académica.

### Membership = entitlement comercial **[F]**

```text
Membership {
  domain, userId, paymentPlanId,
  entityId, entityType: course | community,
  status: active | payment_failed | expired | pending | rejected | paused,
  subscriptionId?
}
```

Evidencia: `packages/common-models/src/membership.ts`, `constants.ts:MembershipEntityType|Status`, `orm-models/.../membership.ts`.

**Interpretación [I]:** “Enrollment” en CourseLit ≈ **acceso al producto tras compra/plan**, no matrícula institucional con temporada, grupo, responsable y deuda.

---

## Capacidades adyacentes

| Capacidad | Estado | Evidencia |
|-----------|--------|-----------|
| Digital downloads | Secundaria (mismo pipeline Course) | `CourseType.DOWNLOAD`, `download-link.ts` |
| Communities | Secundaria / beta | `community*.ts`, docs communities |
| Email marketing | Secundaria / beta | `sequence`, `email-editor`, `apps/queue` |
| Certificates | Secundaria LMS | course/certificate models + docs |
| Blog | Secundaria CMS | `CourseType.BLOG` / PageType |

### Pagos — verdad de código **[F]**

| Gateway | Estado |
|---------|--------|
| Stripe | Implementado |
| Razorpay | Implementado |
| LemonSqueezy | Implementado (docs: experimental a veces) |
| PayPal / Paytm | Listados en constants; **not implemented** en factory de payment methods |

Planes: `PaymentPlanType` FREE | ONE_TIME | EMI | SUBSCRIPTION (`constants.ts`).

---

## CourseLit vs necesidades de una institución educativa

| Necesidad institucional | ¿CourseLit? | Notas |
|-------------------------|-------------|-------|
| Familias / apoderados / pagador ≠ alumno | **No** | Sin entidades |
| Temporadas / periodos / renovación | **No** | Sin Season |
| Matrícula administrativa + cupos + waitlist | **Parcial / no** | Membership PENDING/REJECTED (comunidad) ≠ cupos de sede |
| Grupos y horarios presenciales | **No** | Sin rooms/schedule |
| Asistencia por sesión | **No** | — |
| Mensualidades / deuda familiar / caja | **Parcial comercial** | EMI/subscription + invoice digital; no AR familiar ni caja |
| Contenido online + progreso | **Sí** | Fortaleza |
| Cobro online tarjeta | **Sí** | Gateways |
| Sitio de captación / sales page | **Sí** | Page builder |
| Multisede escuela / branding | **Sí (tenant)** | Domain |

**[R]** Usar CourseLit como referencia de **funnel creator + tenancy + paid access**; para MIS escolar, seguir el atlas Elvis/`docs/elvis-analysis` + diseño propio — no CourseLit como base funcional.

---

## Diferencia crítica de productos **[I]**

```text
CourseLit:  Creator → Course/Product → Checkout → Membership → Learn
Institución: Familia → Periodo → Matrícula → Grupo/Horario → Asistencia → Cargo → Pago → Deuda
```

Solapan solo en: usuario, producto de aprendizaje, pago online, admin básico.

---

## Archivos revisados (Fase 2)

- `docs/README.md`
- `apps/docs-new/content/docs/getting-started/vision.mdx`, `features.mdx`, `quick-start.mdx`
- `AGENTS.md`
- `packages/common-models/src/{constants,membership,course,payment-plan,domain}.ts`
- `packages/orm-models/src/models/{membership,course,domain,invoice,payment-plan}.ts`
- Búsqueda family/guardian/attendance/season (sin dominio)
- Exploración [product scope](65698afd-368a-4624-8bf7-fd5b85f3a8be)

## Pendiente

- Diagramas y capas formales (Fase 3 → `04-architecture.md`)
- Glosario fino de entidades (Fase 4 → `05-domain-model.md`)

## Incertidumbres **[?]**

1. Madurez production de communities/email beta.  
2. Roadmap Notion vs código (marketplace futuro no observado).  
3. Detalle de “analytics limited” del README vs implementation.
