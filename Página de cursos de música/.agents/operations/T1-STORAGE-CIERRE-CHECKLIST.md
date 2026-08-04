# T1 Storage — Criterio de cierre

**Dictamen:** Claude/Fable · **4 Ago 2026**  
**Ruta canónica de firma (ítem 2):** `POST /api/v1/me/media/signed-url`  
**Estado global:** ✅ **CERRADO** — OK Juan · 4 Ago 2026 @ `f05b81e`

---

## Backend / infra

| # | Ítem | Sí/No | Evidencia Cursor (4 Ago 2026) |
|---|------|-------|-------------------------------|
| 1 | Claves en Render vía Secret File (`/etc/secrets/supabase.env`), deploy estable | **sí** | `server/lib/loadRenderSecretFile.ts` · commit `d96338d` · prod firma operativa (health OK + signed-url 200) |
| 2 | `POST /api/v1/me/media/signed-url` entrega video+PDF con suscripción ACTIVE | **sí*** | Integración `server/tests/media-signed-url.test.ts` (ACTIVE → 200, `expiresIn: 3600`, non-pilot URL). Prod: sesión autenticada firma pilot PDF/VIDEO 200. *Smoke suscriptor en app = ítems 7–8 (Juan).* |
| 3 | Material demo (`tu-guitarra-y-postura.*`) se firma sin suscripción | **sí** | `isPilotFreeMaterialUrl()` en `mediaAccessService.ts` · prod curl con sesión: PDF+VIDEO 200, `expiresIn=3600`, HEAD signed 200 |
| 4 | Anónimo → 401 · URL directa al bucket → 400/403 | **sí** | Prod: anon POST signed-url → **401** · GET directo PDF/VIDEO bucket → **400** · test unit anon 401 |
| 5 | TTL de la firma definido y documentado (horas, no días) | **sí** | Default **3600 s (1 h)** en `createSignedStorageUrl()` (`supabaseStorage.ts:99`) · API devuelve `expiresIn` en respuesta |
| 6 | Upload desde `/admin` escribe la ruta correcta en PathNode | **sí** | `POST /api/v1/admin/storage/upload` (`admin.ts`) · `AdminPage.tsx` asigna `materialUrl` a `videoUrl`/`guidePdfUrl` y persiste slot (`updateAdminSlot`) · commit `99e74d4` |

---

## Smoke manual — Juan (~5 min)

| # | Ítem | Sí/No | Notas |
|---|------|-------|-------|
| 7 | Login `carlos@gmusic.academy` (ACTIVE) → nodo «Tu guitarra y postura»: video carga y reproduce | **sí** | OK cierre T1 — Juan 4 Ago 2026 |
| 8 | Mismo nodo: PDF abre desde la app | **sí** | OK cierre T1 — Juan 4 Ago 2026 |

---

## Ops

| # | Ítem | Sí/No | Evidencia Cursor (4 Ago 2026) |
|---|------|-------|-------------------------------|
| 9 | Demo con UI `cb5c3e5` verificada en prod | **sí** | `/demo-clase-1`: fila PDF, título único bajo video, CTAs jerarquizados, micro-copia, sin pestañas |
| 10 | E2E prod re-ejecutado post-`d96338d` con PASS documentado | **sí** | `npm run deploy:verify-production` → OK (health, rutas SPA, CORS) · prod curl signed-url matrix · suite local **622/622** incl. `media-signed-url.test.ts` |

---

## Commits T1 relevantes

| Commit | Contenido |
|--------|-----------|
| `99e74d4` | T1.4 signed URL + T1.5 admin upload |
| `d96338d` | Secret File Render |
| `9ca003c` | PDF demo piloto |
| `cb5c3e5` | Rediseño UI demo (no bloquea infra) |

## Qué autoriza `OK cierre T1`

~~Pendiente.~~ **Ejecutado 4 Ago 2026:**

1. ✅ `PROJECT_STATUS.md` → T1 **CERRADO**
2. **T-URL-FUNNEL-01** autorizado — arrancar cuando Juan lo pida
