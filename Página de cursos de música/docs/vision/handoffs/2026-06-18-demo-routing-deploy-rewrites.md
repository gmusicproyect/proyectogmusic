# Deploy — Rewrites SPA del funnel demo

**Fecha:** 18 Jun 2026  
**De:** Juan Pablo (Director) + Cursor (Cursos)  
**Para:** Juan · DevOps · quien configure hosting de producción  
**Tipo:** Nota operativa de deploy — **no** fuente superior a `.agents/DECISIONS.md`

> **Jerarquía (D-GOV-01):** ante conflicto, prevalece `.agents/DECISIONS.md` → código + tests → esta nota.

---

## 1. Estado actual

| Item | Valor |
|------|-------|
| **`origin/main` / `HEAD`** | `851b6af` |
| **D-GOV-02** | Aprobada (`4cdc911`) — URLs canónicas funnel demo |
| **D-GOV-03** | Aprobada (`4cdc911`) — fase routing corta solo funnel demo |
| **Implementación routing** | `e047ac3` — `feat(routing): sync demo funnel URLs` |
| **Docs agentes sincronizados** | `851b6af` — `docs: sync agent docs after demo routing e047ac3` |
| **Motor cliente** | `src/app/utils/student-zone-routing.ts` + `handlePageChange` en `App.tsx` |
| **Tests app** | 389/389 |

La app es una **SPA Vite + React**. En desarrollo, Vite ya sirve `index.html` para rutas desconocidas. En **producción**, el host debe configurar **fallback SPA** para las rutas del funnel demo; el código del repo no incluye rewrites de hosting.

---

## 2. Rutas que requieren fallback SPA

Estas pathnames deben devolver **`index.html`** (mismo documento que `/`), para que el cliente resuelva `currentPage` vía `pageFromPathname`:

| Pathname | `currentPage` |
|----------|---------------|
| `/mi-camino-demo` | `mi-camino-demo` |
| `/demo-clase-1` | `demo-clase-1` |
| `/demo-clase-2` | `demo-clase-2` |
| `/demo-clase-3` | `demo-clase-3` |
| `/demo-clase-4` | `demo-clase-4` |
| `/demo-clase-5` | `demo-clase-5` |
| `/inscripcion` | `inscripcion-gate` |

**También aplican** (ya existían antes de D-GOV-02/03):

| Pathname | `currentPage` |
|----------|---------------|
| `/` | `home` |
| `/alumno` | `mi-estudio` |
| `/mi-camino` | `mi-camino` |

---

## 3. Regla requerida en el host

Para cada pathname de la tabla anterior (y, en la práctica, **cualquier ruta de la SPA que no sea un asset estático**):

1. Si el request es un archivo estático existente (`.js`, `.css`, imágenes, favicon, etc.) → servir el archivo.
2. En caso contrario → responder **`index.html`** con status **200** (rewrite / fallback SPA).

**Objetivo:** que un refresh o un link compartido (`https://tudominio.com/demo-clase-3`) cargue la app y muestre la pantalla correcta, no un 404 del servidor.

### Ejemplos de configuración (referencia)

**Netlify** — `public/_redirects` o `netlify.toml`:

```text
/*    /index.html   200
```

**Vercel** — `vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Nginx** — bloque `location /`:

```nginx
try_files $uri $uri/ /index.html;
```

**Cloudflare Pages** — `_redirects`:

```text
/*    /index.html   200
```

Ajustar según el proveedor real de Gmusic. Un rewrite global `/* → index.html` es el patrón habitual para SPAs y cubre funnel + zona alumno.

---

## 4. Qué NO implica esta nota

Configurar rewrites SPA **no** autoriza ni requiere:

- Cambios en **backend** (Express, API, Prisma)
- **Auth** (JWT, cookies, registro real)
- **Pagos** (Flow, webhooks, checkout)
- Cambios de **schema** de base de datos
- Mitigación de **R-001** ni **R-002**
- **React Router global** ni sync URL de páginas legacy
- URL pública para **`inscripcion-registro`** (sigue sin pathname en D-GOV-02)
- Commit de assets locales como `public/hero/threshold/logogmusic.png` (fuera del repo; fase visual futura)

---

## 5. Riesgo si no se configura el rewrite

| Escenario | Sin rewrite SPA | Con rewrite SPA |
|-----------|-----------------|-----------------|
| Navegación interna (click en la app) | ✅ Funciona (`pushState`) | ✅ Funciona |
| Link compartido (`/demo-clase-3`) | ❌ 404 del host | ✅ Carga demo clase 3 |
| Refresh (F5) en `/inscripcion` | ❌ 404 del host | ✅ Carga gate |
| Back / forward del navegador | ⚠️ Depende del host | ✅ Esperado |

**Impacto producto:** links compartibles del funnel (objetivo de D-GOV-02) fallan en producción aunque el código en `e047ac3` sea correcto.

---

## 6. Checklist QA post-deploy

Ejecutar en **producción** (o preview con rewrites activos), no solo en `npm run dev`:

### Funnel demo — carga directa y refresh

- [ ] Abrir `/mi-camino-demo` directo → mapa demo (PathDemoPage)
- [ ] Refrescar en `/mi-camino-demo` → misma pantalla, sin 404
- [ ] Abrir `/demo-clase-3` directo → DemoLessonPage clase 3
- [ ] Refrescar en `/demo-clase-3` → misma clase, sin 404
- [ ] Abrir `/inscripcion` directo → InscripcionGatePage
- [ ] Refrescar en `/inscripcion` → gate, sin 404

### Navegación history API

- [ ] Desde demo → clase → **Back** → vuelve al mapa demo
- [ ] Desde demo → **Ver planes** → URL `/` y sección planes en home
- [ ] Gate → registro → URL permanece `/inscripcion` (registro sin URL propia)

### Zona suscriptor — regresión

- [ ] Abrir `/alumno` directo → Mi Estudio (según sesión)
- [ ] Abrir `/mi-camino` directo → Mi Camino (según sesión)
- [ ] Refrescar en `/alumno` y `/mi-camino` → sin 404

### Raíz

- [ ] Abrir `/` → landing home
- [ ] Volver a `/` desde funnel → URL `/`, landing visible

---

## 7. Notas adicionales

### `inscripcion-registro` sin URL pública

En esta fase, `inscripcion-registro` **no tiene pathname**. La transición gate → registro mantiene `/inscripcion`. No crear rutas como `/inscripcion-registro` en el host.

### Pathname desconocido

El cliente mapea pathnames no reconocidos a `home` (`pageFromPathname`). Un rewrite global a `index.html` es suficiente; no hace falta un rewrite por cada ruta funnel.

### Dev vs prod

| Entorno | Fallback SPA |
|---------|--------------|
| `npm run dev` (Vite) | ✅ Incluido |
| Build estático sin rewrite | ❌ 404 en refresh |
| Build + rewrite host | ✅ Comportamiento esperado |

---

## Referencias

- Decisiones: `.agents/DECISIONS.md` — D-GOV-02, D-GOV-03
- Implementación: commit `e047ac3`, `src/app/utils/student-zone-routing.ts`
- Mapa rutas agentes: `AGENTS.md`
- Handoff estado repo: `docs/vision/handoffs/2026-06-18-gmusic-repo-canonico-estado-actual.md`

---

*Nota de deploy · Funnel demo SPA rewrites · 18 Jun 2026 · Base `851b6af`*
