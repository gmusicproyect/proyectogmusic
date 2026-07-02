# Incidente INC-2026-07-02 — Credencial admin expuesta

**Severidad:** P0 (seguridad)  
**Detectado:** Revisión Opus READ-ONLY Admin Creador MVP (2 Jul 2026)  
**Decisión interina (Cursor, Opus ausente):** 2 Jul 2026 — Juan delegó cierre operativo

---

## Resumen

La contraseña `GmusicAdmin2026!` quedó hardcodeada en `prisma/seed.ts` (commits `5b62e5f`–`fd65927`) y visible en la UI de login admin. Repo público → credencial tratada como **quemada**.

---

## Estado del incidente

| Capa | Estado | Evidencia |
|------|--------|-----------|
| **Repositorio** | ✅ **CERRADO** | `2134e71` — seed vía `ADMIN_SEED_PASSWORD`, sin hint en UI, script rotación |
| **Base de datos prod** | 🔴 **ABIERTO** | `admin@gmusic.academy` existe en Supabase con hash de contraseña quemada |
| **Criterio cierre prod** | Pendiente Juan | Rotar → login nuevo OK → login viejo rechazado |

**Regla permanente (R-008):** credenciales admin seed **solo** en env; nunca en git ni UI.

---

## Acción obligatoria (Juan)

```bash
# 1. .env local — clave nueva, única, en gestor de contraseñas
ADMIN_SEED_PASSWORD='...'

# 2. Rotar en Supabase
node --env-file=.env scripts/rotate-admin-password.mjs

# 3. Verificar
# - /admin con clave nueva → OK
# - clave vieja GmusicAdmin2026! → rechazada
```

**Hasta cerrar prod:** no publicar bloques reales desde `/admin` en producción.

---

## Fix aplicado (2134e71)

- `prisma/seed.ts` — omite admin si falta `ADMIN_SEED_PASSWORD`
- `AdminPage.tsx` — sin credenciales en pantalla
- `.env.example` — documentado
- `scripts/rotate-admin-password.mjs` — rotación repetible
- `gmusic-architecture-working-map.md` — R-008 actualizado

---

## Cierre del incidente

Marcar **CERRADO** cuando Juan confirme: *«rotada y login OK»*.

Próximo paso autorizado tras cierre: **Piloto Bloque 1** — ver `docs/operations/piloto-bloque-1-admin.md`.
