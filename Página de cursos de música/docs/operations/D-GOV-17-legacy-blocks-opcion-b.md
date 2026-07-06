# D-GOV-17 — Bloques legacy seed (B1/B2) vs modelo admin 5 etapas

**Estado:** Aprobada — Opción B (Juan, 3 Jul 2026)  
**Fecha smoke:** 3 Jul 2026  
**Relacionado:** R-008 Admin · D-GOV-04 · seed `prisma/seed.ts`

---

## Pregunta

Los módulos **Fundamentos** y **Acordes abiertos** del seed (3 + 2 nodos publicados) no siguen el contrato admin de **5 etapas por bloque**. ¿Qué hace el producto con ellos?

| Opción | Descripción |
|--------|-------------|
| **A — Backfill** | Migrar B1/B2 a 5 etapas admin antes de seguir publicando |
| **B — Badge legacy** | Mantener seed tal cual; admin muestra “Publicado legacy”; alumno sigue viendo path jugable vía `loadPublishedCoursePath` |

---

## Smoke alumno — `carlos@gmusic.academy` (3 Jul 2026)

**Mock path:** OFF (`VITE_USE_PATH_MOCK` no definido).  
**Función confirmada:** `/mi-camino` suscriptor → `GET /me/path` → `buildPathResponse` → **`loadPublishedCoursePath`** (no mezcla con pipeline admin 5 slots).

### Nodos legacy expuestos al alumno

| Bloque | Nodos | Progreso API (Carlos) | Contenido |
|--------|-------|------------------------|-----------|
| B1 Fundamentos | 3 | 3/3 | Tu guitarra y postura · Primer acorde Am · Escucha el pulso |
| B2 Acordes abiertos | 2 | 0/2 | Acorde G mayor (active) · Progresión Am–Em (locked) |

- **5 nodos** publicados con título + **2 microejercicios** cada uno (instrucciones completas en DB).
- **`guideText` vacío** en seed legacy (deuda contenido; no bloquea juego).
- **`completionCriteria`** solo en nodo 1 B1.
- **Señal admin “0/5”:** **no llega al alumno** — métricas alumno son 3/3 y 0/2; rail global **3 de 5 pasos** (suma nodos reales).

### Verificación visual (browser, misma sesión)

Tras `dev/logout` + `activate-semestral` (Carlos) → `/mi-camino` OK: header Carlos, carrusel 5 clases, foco “Acorde G mayor”, sin pantalla en blanco.

### Falso positivo descartado

Error **“No pudimos verificar tu acceso”** en smoke anterior = **sesión `admin@` (403)**, no colisión Juan/Carlos. Ver ticket **T-UX-01**.

---

## Recomendación

**Opción B** — badge “Publicado legacy” en admin; no backfill bloqueante. El path alumno ya funciona con evidencia API + browser.

---

## Decisión (completar Juan)

| Campo | Valor |
|-------|-------|
| **Decisión** | ☐ Opción A (backfill) · ☑ **Opción B (badge legacy)** |
| **Aprobado por** | Juan Lizama |
| **Fecha** | 3 Jul 2026 |
| **Registro** | ✅ `D-GOV-17` en `.agents/DECISIONS.md` (Gobernanza y producto) |

---

## Referencias

- Smoke script: `scripts/dev/smoke-mi-camino-path.ts` (`npx tsx --env-file=.env scripts/dev/smoke-mi-camino-path.ts`)
- Ticket UX: `docs/operations/T-UX-01-student-zone-guard-403-admin-session.md`
- Admin Phase B commits: `2fdf740`, `168b5b5`, `f62623e` (Jul 2026)
