# Recuperación de contraseña admin (MVP clave ops)

**Alcance:** solo cuenta `admin@gmusic.academy` · **sin email** (Fase 4 auth pendiente).

---

## Variables

| Variable | Dónde | Uso |
|----------|-------|-----|
| `ADMIN_PASSWORD_RESET_KEY` | **Render (API)** + `.env` local | Clave ops para restablecer desde `/admin` |
| `ADMIN_SEED_PASSWORD` | `.env` local | Seed + script `rotate-admin-password.mjs` |

**Reglas (R-008):** nunca commitear claves · mínimo **24 caracteres** · no usar placeholder `change-me-admin-reset-key`.

---

## Configurar en producción (Render)

1. Generar clave ops (gestor de contraseñas): 24+ chars aleatorios.
2. Render → servicio API → Environment → añadir:
   - `ADMIN_PASSWORD_RESET_KEY` = tu clave ops
3. Redeploy (automático al guardar env).
4. Guardar clave ops en gestor de contraseñas (junto a contraseña admin).

**No configurar en Vercel** — el frontend no usa esta variable.

---

## Flujo UI (prod)

1. Ir a `/admin`
2. Clic **«¿Olvidaste tu contraseña?»**
3. Completar:
   - Correo: `admin@gmusic.academy`
   - Clave de recuperación: `ADMIN_PASSWORD_RESET_KEY`
   - Nueva contraseña + confirmación (mín. 8 chars)
4. **Restablecer contraseña**
5. Volver al login e iniciar sesión con la **nueva** contraseña

---

## Fallback local (sin UI)

Si `ADMIN_PASSWORD_RESET_KEY` no está configurada (503) o tienes acceso a `.env` + Supabase:

```bash
# .env — define ADMIN_SEED_PASSWORD='tu-clave-nueva'
node --env-file=.env scripts/rotate-admin-password.mjs
```

Ver también: [`incident-2026-07-02-admin-credential.md`](incident-2026-07-02-admin-credential.md)

---

## API

```http
POST /api/v1/auth/admin/reset-password
Content-Type: application/json

{
  "email": "admin@gmusic.academy",
  "recoveryKey": "...",
  "newPassword": "..."
}
```

| Respuesta | Significado |
|-----------|-------------|
| `204` | Contraseña actualizada |
| `401 INVALID_RESET` | Clave ops o correo inválidos (mensaje genérico) |
| `503 RESET_NOT_CONFIGURED` | Falta `ADMIN_PASSWORD_RESET_KEY` en API |
| `422 WEAK_PASSWORD` | Menos de 8 caracteres |

No emite cookie de sesión — login manual después.

---

## Seguridad

- Tratar `ADMIN_PASSWORD_RESET_KEY` como secreto de producción (nivel `JWT_SECRET`).
- Si se expone: rotar clave ops en Render **y** contraseña admin.
- Reset por email para alumnos queda fuera de alcance (Track A).

---

*7 Jul 2026 · extensión R-008 · sin D-GOV nueva*
