# P0-08 — LibraryViewH1 / Biblioteca básica

- Backend lista catálogo curado en `GET /api/v1/me/library` (+ detalle `/:id`).
- Biblioteca es **refuerzo**; Mi Camino sigue siendo el CTA primario
  (empty states apuntan a `/mi-camino`, nunca al catálogo como home).
- Acceso: `AccessGrants.libraryTier` de Entitlements P0-07 (fuente única
  `/me/access`); el frontend no duplica reglas.
- `accessTier basic` → available/recommended · `premium` → **siempre locked**
  con blocker ENTITLEMENT (grants MVP nunca dan premium).
- Política de mes: actual ±1; DRAFT/ARCHIVED nunca visibles al alumno.
- Consumir un recurso **no** completa tarjetas (progreso = eventos P0-05).
- Sin schema, seeds DB, multimedia real (`mediaRef = null`), Comunidad ni UGC.

Limitación H1:

El catálogo es un fixture en memoria (`meta.catalogSource = memory_fixture_h1`)
con metadatos placeholder. Contenido real y persistencia durable requieren
mandato editorial y autorización aparte.
