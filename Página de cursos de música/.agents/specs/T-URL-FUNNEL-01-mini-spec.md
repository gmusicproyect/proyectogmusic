# T-URL-FUNNEL-01 — Ticket formal (D-GOV-19)

**Estado:** Ticket formal archivado · **NO implementar** hasta frase de control de Juan.  
**Gate previo:** ✅ T1 Storage cerrado (OK Juan · 4 Ago 2026 @ `dcbccd2`).  
**Decisión de cola:** Va **SOLO** — no empaquetar con Comunidad B+ ni otros tickets.

**Frase de arranque (Juan → Cursor):**

> OK T-URL-FUNNEL-01 — implementar D-GOV-19 según ticket formal; evidencia: criterio binario completo (6 ítems), push del código con mi OK final.

---

## Mapa `currentPage` ↔ pathname

| Página interna | Pathname nuevo | Reemplaza |
|----------------|--------------|-----------|
| `mi-camino-demo` | `/clase-gratuita` | `/mi-camino-demo` |
| `demo-clase-1` … `demo-clase-5` | `/clase-gratuita/1` … `/clase-gratuita/5` | `/demo-clase-1` … `/demo-clase-5` |
| `inscripcion-gate` | `/inscripcion` | sin cambio |

Esquema **numerado** (no slugs por título). Decisión: D-GOV-19.

---

## Redirects 301 en `vercel.json`

Sección **`redirects`**, `permanent: true` (301 en edge — no basta el rewrite catch-all SPA).

**Importante:** los redirects van **después** del routing en el mismo deploy (ver orden abajo). Si se despliegan redirects antes de rutas nuevas, las URLs viejas apuntan a páginas inexistentes y el funnel se cae.

```json
{ "source": "/mi-camino-demo", "destination": "/clase-gratuita", "permanent": true },
{ "source": "/demo-clase-1", "destination": "/clase-gratuita/1", "permanent": true },
{ "source": "/demo-clase-2", "destination": "/clase-gratuita/2", "permanent": true },
{ "source": "/demo-clase-3", "destination": "/clase-gratuita/3", "permanent": true },
{ "source": "/demo-clase-4", "destination": "/clase-gratuita/4", "permanent": true },
{ "source": "/demo-clase-5", "destination": "/clase-gratuita/5", "permanent": true }
```

---

## Orden de implementación

**Todo en UN solo commit de código, deploy único:**

1. **Routing** — rutas nuevas resuelven (`student-zone-routing.ts`, `App.tsx`, `PathDemoPage`, guards)
2. **Links internos** — reemplazar toda navegación a rutas viejas
3. **Redirects 301** en `vercel.json` (**después** del routing, nunca antes)
4. **`docs/flows/01-funnel-auth-landing.md`** actualizado en el **MISMO commit** de código (D-023b). *Excepción puntual a G1: este doc viaja con el commit de código; su push espera OK final de Juan.*
5. **Tests + suite completa**
6. **Deploy + verificación**

---

## Archivos a tocar

- `vercel.json` — redirects + rewrites SPA para rutas nuevas
- `src/app/utils/student-zone-routing.ts`
- `src/app/App.tsx`
- `src/app/pages/PathDemoPage.tsx`
- Guards (`demo-auth-gate.ts`, navegación funnel)
- Generadores de links internos (mapa, CTA continuar, CTAs landing)
- `docs/flows/01-funnel-auth-landing.md`
- Tests: `student-zone-routing.test.ts`, `funnel-navigation-targets.test.ts`, guards

---

## Criterio de cierre binario

Marcar sí/no cada ítem. Todo sí → reporte a Juan → `OK push` para código.

| # | Ítem |
|---|------|
| 1 | **Routing unit:** las 6 rutas nuevas resuelven a la página correcta |
| 2 | **Grep limpio:** cero `demo-clase-` / `mi-camino-demo` en `src/` |
| 3 | **Suite completa verde** (622/622 o número vigente) |
| 4 | **Post-deploy:** `curl -I` a las 6 URLs viejas → 301 + `Location` nueva; evidencia pegada |
| 5 | **Smoke Juan (~2 min):** funnel completo con URLs nuevas — mapa → clase 1 → inscripción |
| 6 | **Flows doc** actualizado en el commit de implementación |

---

## Fuera de alcance

Backend, auth, pagos, schema, copy UI, rediseño visual, player suscriptor, Comunidad B+, oleadas pendientes de commit.

---

## Dictamen Claude (4 Ago 2026)

- T1 cerrado — no reabrir.
- T-URL-FUNNEL-01 va solo; Comunidad B+ espera su turno como ticket propio.
- Orden routing → redirects (no al revés) — obligatorio.
