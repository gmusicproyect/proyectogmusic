# Handoff Opus — Revisión Admin Creador MVP (2 Jul 2026)

**Palabra clave:** Retomar Gmusic  
**Audiencia:** Claude / Opus (arquitecto) — **revisión READ-ONLY, no implementar**  
**Solicitado por:** Juan — *«que lo revise Claude»*  
**HEAD remoto:** `main` @ **`fd65927`** (push OK 2 Jul 2026)

---

## 1. Qué revisar

Cursor implementó el **Admin Creador MVP (R-008)** en 5 commits sobre `main`:

| SHA | Mensaje |
|-----|---------|
| `bc2de81` | docs(d-gov-04): cerrar pedagogía Nivel 1 y teaser 6–15 |
| `3a239ba` | feat(schema): StageType y campos de materia en PathNode |
| `5b62e5f` | feat(api): Admin Creador con curriculum.ts y requireAdmin |
| `4265b05` | feat(ui): pantallas Admin Creador y routing /admin |
| `fd65927` | feat(admin): shell shadcn con sidebar y login directo |

**Verificación Cursor (confirmar si hace falta):**
- App: **554/554** · typecheck OK · build OK
- API: **152/153** — 1 flaky preexistente `phase3b2` concurrencia (T-API-01)

---

## 2. Orden de lectura para la revisión

| # | Archivo | Pregunta clave |
|---|---------|----------------|
| 1 | `.agents/DECISIONS.md` — **D-GOV-04** | ¿Implementación respeta bloque=5 etapas, publish rule, teaser alineado? |
| 2 | `AGENTS.md` — fila `/admin` | ¿Routing y zona admin coherentes con mapa autorizado? |
| 3 | `docs/product/mapa-bloques-nivel-1.md` | ¿Starter chips / copy admin alineados al mapa? |
| 4 | `server/services/curriculum.ts` | ¿Reglas de publicación = fuente de verdad server-side? |
| 5 | `server/routes/admin.ts` (o equivalente) | ¿requireAdmin + contratos API correctos? |
| 6 | `src/app/pages/AdminPage.tsx` | ¿Flujo UX completo: list → detail → edit → publish? |
| 7 | `src/app/components/gmusic/admin/AdminLayout.tsx` | ¿Shell admin aislado del funnel/alumno? |
| 8 | `prisma/schema.prisma` + migration `20260702200000_pathnode_stage_fields` | ¿StageType + campos materia sin modelo paralelo? |

**Contexto previo:** `docs/vision/handoffs/2026-07-02-contexto-opus-d-gov-04-admin-materia.md` (supersedes estado R-008 «no existe»)

---

## 3. Alcance implementado (resumen para auditoría)

### Dominio (D-GOV-04)
- **Module = bloque**, **PathNode = etapa** (5 `StageType` fijos)
- Publicar bloque exige **5 slots completos**: título + `completionCriteria` (video nullable)
- Seed admin: `admin@gmusic.academy` solo si `ADMIN_SEED_PASSWORD` está en env (nunca en repo ni UI)

### API
- `/api/v1/admin/modules` — list, create
- `/api/v1/admin/modules/:id` — detail + slots
- PUT slot, POST publish
- Guard: `requireAdmin` (rol ADMIN)

### UI (`/admin`, `currentPage === "admin"`)
- Login directo vía `loginAccount()` — **no** pasa por `/me/access` (403 ADMIN)
- Shell: sidebar desktop colapsable + Sheet móvil, breadcrumbs, stats, tabla, pipeline 5 etapas
- Estilos Obsidian & Gold en `admin-page.css`
- `App.tsx`: sin Navbar ni MusicPlayer en admin

### Fuera de alcance (confirmar que NO se tocó)
- Auth global, pagos, Track B, routing funnel legacy, R-001/R-002

---

## 4. Checklist de revisión Opus

Marcar **OK / GAP / BLOQUEANTE** en cada ítem:

### Pedagogía y producto
- [ ] Flujo admin refleja microciclo 5 etapas (`instruccion-maestra-clases.md`)
- [ ] Starter titles (Bloque 1–3) coherentes con `mapa-bloques-nivel-1.md`
- [ ] Publicar bloque → visible en **Mi Camino** suscriptor (contrato producto)
- [ ] Teaser 6–15 sigue alineado a **nombres de bloque**, no etapas internas

### Arquitectura (D-GOV-01 / working map)
- [ ] Admin UI es capa sobre contextos existentes — sin duplicar dominio
- [ ] `curriculum.ts` es única fuente de reglas publish (no lógica duplicada en UI)
- [ ] R-008: admin no se convierte en «dueño falso» de reglas de negocio alumno

### Seguridad y auth
- [ ] `requireAdmin` en todas las rutas admin API
- [ ] Login admin no rompe flujo alumno/demo (`public-student-session` 403 → anonymous)
- [ ] Sin exposición de secretos en responses admin

### UX / operación Juan
- [ ] Juan puede crear bloque → llenar 5 etapas → publicar **sin Cursor**
- [ ] Copy y hints de etapa útiles para carga de materia real
- [ ] Mobile usable (Sheet + pipeline)

### Deploy / ops
- [ ] `/admin` en SPA requiere rewrite `index.html` en prod (documentado?)
- [ ] Migración Prisma aplicada en Supabase prod

---

## 5. Entregables esperados de Opus

1. **Veredicto:** ✅ Aprobado para producción materia · ⚠️ Aprobado con gaps · ❌ Requiere ciclo Cursor
2. **Lista gaps** priorizada (P0/P1/P2) — máx. 10 ítems
3. **Actualización R-008** en working map / DECISIONS si corresponde (propuesta texto, no commit)
4. **Brief siguiente fase** (≤15 líneas) solo si Juan autoriza — ej. primer bloque Am en prod, deploy rewrites, E2E admin smoke

**NO hacer:** implementar código, commit, push, ampliar schema sin decisión.

---

## 6. Prompt sugerido para Claude Code

Copiar/pegar:

```text
Retomar Gmusic — revisión READ-ONLY Admin Creador MVP.

Lee primero:
docs/vision/handoffs/2026-07-02-admin-creador-opus-review.md
.agents/DECISIONS.md (D-GOV-04)
AGENTS.md (/admin)

HEAD: fd65927 en main.

Activa skill gmusic-opus-architect + superpowers-verification-before-completion.

Audita commits bc2de81..fd65927 contra checklist del handoff.
Entrega: veredicto OK/GAP/BLOQUEANTE, gaps P0–P2, propuesta actualización R-008, brief Cursor solo si hay P0.

No implementes código.
```

---

*Handoff Cursor → Opus · 2 Jul 2026 · post-push `fd65927`*
