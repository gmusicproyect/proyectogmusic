# 02 — Inventario técnico (Fase 1)

> **Fuente local:** `vendor-sources/courselit` (clone shallow de `codelitdev/courselit` @ `main`, ~2026-07-13)  
> **Leyenda:** **[F]** hecho · **[I]** interpretación · **[?]** no confirmado · **[R]** recomendación

---

## Tabla de componentes

| Componente | Tecnología | Responsabilidad | Evidencia | Riesgo o comentario |
|------------|------------|-----------------|-----------|---------------------|
| Monorepo | pnpm workspace (`pnpm@10.22.0`) | apps + packages | `pnpm-workspace.yaml`, root `package.json:packageManager` | Sin Turbo/Nx **[F]** |
| App principal | Next.js `^16.2.9` + React `19.2.0` | UI admin/público, GraphQL, REST | `apps/web/package.json` (`@courselit/web@0.74.1`) | Stack moderno |
| Worker | Express + BullMQ | Jobs async (mail, sequences) | `apps/queue/package.json` | Redis obligatorio en cola |
| Docs | Astro (`apps/docs`) + Next/Fumadocs (`apps/docs-new`) | Documentación producto | apps/docs* | Dual docs |
| Lenguaje | TypeScript `^5.6–5.9` | Tipado shared | root + apps package.json | Node `>=18` engines; CI Node 24 |
| Persistencia | MongoDB + Mongoose `^8.22` | Multi-tenant por `domain` | `packages/orm-models`, `auth.ts` DB string | No Prisma/SQL **[F]** |
| Tipos dominio | `@courselit/common-models` | Constants/types compartidos | `packages/common-models` | — |
| Modelos ORM | `@courselit/orm-models` | Schemas Mongoose | `packages/orm-models/src/models/*` | membership, course, invoice, etc. |
| Lógica compartida | `@courselit/common-logic` | Business logic cross-app | `packages/common-logic` | Incluye JWT hacia queue |
| Auth | better-auth `1.6.11` + `@better-auth/sso` | OTP email, SSO, sesión | `apps/web/auth.ts`, `app/api/auth/[...all]/route.ts` | Multi-tenant school |
| Pagos | Stripe, Razorpay, LemonSqueezy | Checkout / webhooks | `apps/web/payments-new/`, `package.json` deps; PayPal/Paytm stubs | No ERP fiscal |
| Media | MediaLit + S3-compatible | Uploads | `apps/web/services/medialit.ts`, compose | Dep externa |
| Email | Nodemailer + email-editor | Transaccional + marketing | queue `mail.ts`, `packages/email-editor` | SMTP en env |
| Colas / caché | Redis + BullMQ | Background | `apps/queue`, compose | — |
| UI site builder | page-blocks, page-primitives, themes | Páginas públicas / temas | packages/page-* | Creator CMS |
| Comunidad | community* models | Posts/comments | orm-models community* | No familia escolar |
| i18n strings | `apps/web/config/strings.ts` | Copy centralizado | AGENTS.md | — |
| Tests | Jest + mongodb-memory-server | Unit/integration | root jest, CI `test.yaml` | Cobertura **[?]** no medida aquí |
| CI/CD | GitHub Actions | lint, test, CodeQL, publish, docker | `.github/workflows/*` | — |
| Deploy | Docker compose / Vercel docs | Self-host | `deployment/docker/`, docs self-hosting | — |
| Observabilidad | PostHog + OTEL (queue) | Analytics/telemetry | queue package deps | Opcional |
| Licencia código | **AGPL-3.0** (`LICENSE.md`) | Copyleft red | `LICENSE.md` | `package.json` dice MIT → inconsistencia **[F]** |

---

## Mapa de carpetas relevantes

| Path | Responsabilidad **[F]** |
|------|-------------------------|
| `apps/web` | Producto: Next App Router, GraphQL (`apps/web/graphql`), REST (`app/api`), admin, viewer de curso, auth, payments |
| `apps/queue` | Worker Express/BullMQ: mail, drip sequences, notifications |
| `apps/docs` / `apps/docs-new` | Sitios de documentación |
| `packages/orm-models` | Schemas Mongo (course, lesson, membership, invoice, domain, payment-plan, media, community…) |
| `packages/common-models` | Tipos/enums (`Constants`, payment methods, membership status) |
| `packages/common-logic` | Lógica compartida web↔queue |
| `packages/components-library` | UI reutilizable |
| `packages/page-blocks` | Widgets del page builder |
| `packages/page-primitives` / `page-models` | Temas y modelos de página |
| `packages/email-editor` / `text-editor` | Editores contenido |
| `packages/utils` / `tsconfig` / `tailwind-config` / `icons` / `scripts` | Tooling |
| `deployment/` | Compose + install.sh |
| `services/` | Dockerfiles app/queue |
| `docs/` | Notas/PRD internas |
| `AGENTS.md` | Mapa de trabajo para contribuidores/IA |

---

## Modelos ORM observados (lista)

`packages/orm-models/src/models/`: activity, apikey, certificate(+template), community*, course, domain, download-link, email*, invoice, lesson(+evaluation), media, **membership**, notification*, ongoing-sequence, page, **payment-plan**, product-discussion, rate-limit-event, rule, sequence/, site-info, subscriber, theme, typeface, user/, widget, …

**No hay** modelos `family`, `guardian`, `season`, `attendance`, `room`, `schedule` en ese directorio **[F]** (búsqueda de family/guardian solo halló `parentThemeId` / comment parents).

---

## Multitenancy preliminar **[F/I]**

- Unidad de aislamiento: **`Domain`** (school) — `packages/orm-models/.../domain.ts` (`name`, `customDomain`, `email` owner).  
- `Membership.domain` ObjectId required.  
- `AGENTS.md`: “`apps/web` is a multi-tenant app” + invariante owner `domain.email`.

---

## Membership ≠ matrícula institucional **[F/I]**

`Membership` une `userId` + `paymentPlanId` + `entityId`/`entityType` + `status` (PENDING…) + opcional `subscriptionId` — acceso a entidad (curso/community/product) tras compra/plan, **no** temporada/grupo/familia.

---

## Archivos revisados (Fase 1)

- `LICENSE.md`, root/`apps/web`/`packages/common-models` `package.json`
- `pnpm-workspace.yaml`, `AGENTS.md`
- `packages/orm-models/src/models/*` (listado + `membership.ts`, `domain.ts`)
- `apps/web/app/api/*` (top-level)
- Inventario remoto cruzado (agente explore) validado localmente tras clone

## Pendiente inmediato

- Lectura GraphQL resolvers, payment initiate/webhook, membership create  
- Fase 2 product-scope formal (`03`)  
- Medir tests / seguridad en fases posteriores

## Incertidumbres **[?]**

1. Cobertura real de tests.  
2. Alcance de `activity.ts` (¿calendario o learning activity?).  
3. Compatibilidad MIT en package.json vs AGPL LICENSE.md (¿error metadata?).  
4. Capacidad de PayPal/Paytm (stubs).  
5. Si existe capa “invoice” fiscal o solo recibo interno (`invoice.ts`).
