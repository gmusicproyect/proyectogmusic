# T-URL-FUNNEL-01 — Mini-spec (D-GOV-19)

**Estado:** Archivado · **NO implementar** hasta `OK cierre T1` + autorización explícita de Juan.

## Mapa `currentPage` ↔ pathname

| Página interna | Pathname nuevo | Reemplaza |
|----------------|--------------|-----------|
| `mi-camino-demo` | `/clase-gratuita` | `/mi-camino-demo` |
| `demo-clase-1` … `demo-clase-5` | `/clase-gratuita/1` … `/clase-gratuita/5` | `/demo-clase-1` … `/demo-clase-5` |
| `inscripcion-gate` | `/inscripcion` | sin cambio |

Esquema **numerado** (no slugs por título). Decisión: D-GOV-19.

## Redirects 301 en `vercel.json`

Sección **`redirects`**, `permanent: true` (301 en edge — no basta el rewrite catch-all SPA):

```json
{ "source": "/mi-camino-demo", "destination": "/clase-gratuita", "permanent": true },
{ "source": "/demo-clase-1", "destination": "/clase-gratuita/1", "permanent": true },
{ "source": "/demo-clase-2", "destination": "/clase-gratuita/2", "permanent": true },
{ "source": "/demo-clase-3", "destination": "/clase-gratuita/3", "permanent": true },
{ "source": "/demo-clase-4", "destination": "/clase-gratuita/4", "permanent": true },
{ "source": "/demo-clase-5", "destination": "/clase-gratuita/5", "permanent": true }
```

## Archivos a tocar

- `vercel.json` — redirects + rewrites SPA para rutas nuevas
- `src/app/utils/student-zone-routing.ts`
- `src/app/App.tsx`
- `src/app/pages/PathDemoPage.tsx`
- Guards (`demo-auth-gate.ts`, navegación funnel)
- Generadores de links internos (mapa, CTA continuar, CTAs landing)
- Tests: `student-zone-routing.test.ts`, `funnel-navigation-targets.test.ts`, guards

## Tests mínimos

1. **Routing unit:** los 6 pathnames nuevos resuelven a la página correcta en carga directa y `pushState`.
2. **Grep limpio:** cero referencias a `demo-clase-` / `mi-camino-demo` en `src/` (salvo comentarios de migración si se documentan).
3. **Post-deploy:** `curl -I` a las 6 URLs viejas en prod → `301` + `Location` nueva; evidencia en reporte.

## Criterio de cierre

Los 3 tests PASS + funnel completo navegable con URLs nuevas. Links viejos redirigen en edge.

## Fuera de alcance

Backend, auth, pagos, schema, copy UI, rediseño visual, player suscriptor.
