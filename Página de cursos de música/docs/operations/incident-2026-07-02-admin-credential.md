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

**Recuperación admin (Jul 2026):** flujo UI + clave ops — ver [`admin-recuperacion-contrasena.md`](admin-recuperacion-contrasena.md). El script `rotate-admin-password.mjs` sigue válido como fallback local.

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

---

## Adendo de cierre — 2026-08-03

**Estado vigente:** ✅ **INCIDENTE CERRADO**
**Frase de acta:** «INC verificado: rotada».

Evidencia read-only ejecutada por Cursor con autorización de Juan («hazlo tu»):

1. Consulta directa a prod: existe exactamente **1** fila `User` con `role=ADMIN`.
2. Comparación bcrypt en memoria: su `passwordHash` **no corresponde** a la credencial quemada. El hash no se imprimió ni salió del proceso.
3. Probe único previo contra `POST /api/v1/auth/login` usando la credencial ya pública: **401 `INVALID_CREDENTIALS`** en 2.2 s.
4. Scan SEC-PRELAUNCH: ningún secreto real nuevo en árbol o historial; `.env` productivo no está trackeado.

El adendo supersede el estado «Base de datos prod 🔴 ABIERTO» de la tabla histórica superior. R-008 permanece vigente: credenciales admin solo en variables de entorno/flujo operativo seguro; nunca en git, UI ni `seed.ts`.
