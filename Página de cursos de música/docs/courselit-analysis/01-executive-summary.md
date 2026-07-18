# 01 — Resumen ejecutivo (actualizado tras Fase 2)

> Documento vivo. Adopción final → `18` cuando exista.

## Qué es CourseLit **[F/I]**

Suite **open-source** de tipo **creador LMS + ecommerce de cursos/downloads + memberships + page builder**, multi-tenant por **`Domain` (school)**. Visión: alternativa a Teachable/Thinkific/Podia (`vision.mdx`, `docs/README.md`).

## Qué no es **[F]**

ERP/académico de familias, temporadas, grupos horarios, asistencia o deuda familiar. `Membership` = acceso comercial a `course|community`, no matrícula institucional.

## Stack **[F]**

Next 16 · React 19 · Mongo/Mongoose · better-auth · Stripe/Razorpay/LemonSqueezy · BullMQ · MediaLit · **AGPL-3.0** (`LICENSE.md`; metadata MIT conflictiva).

## Implicación **[R]**

- **Referencia útil:** tenancy, paid access, LMS online, sales pages, email/community secundarios.
- **No base** para MIS escolar. Preferir diseño propio (+ ideas Elvis ops) sin fork AGPL.
- Confianza alta en clasificación de producto; media hasta auditar webhooks/pagos en profundidad.

## Docs

- Inventario: `02-repository-inventory.md`
- Alcance: `03-product-scope.md`
