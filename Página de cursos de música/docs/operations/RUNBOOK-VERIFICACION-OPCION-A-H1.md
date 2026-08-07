# Runbook — verificación humana Opción A (T-UX-LESSON-01)

**Fecha:** 2026-08-07  
**Objetivo:** producir la evidencia que falta para marcar §6 y autorizar merge de `fix/t-ux-lesson-01-f1-f2`.  
**No requiere:** grabar video ni YouTube.  
**Sí requiere:** cuenta ADMIN, alumno ACTIVE, Supabase configurado en smoke local (o Render QA).

Rama a probar: **`fix/t-ux-lesson-01-f1-f2`** (no `main`).

---

## 0. Prerrequisito entorno (local) — HACER PRIMERO

> **Sin estas claves, todo lo demás falla con 503 `STORAGE_NOT_CONFIGURED`.**  
> No parece un bug de F1: es config. Confírmalas **antes** de subir PDFs o stub.

En `.env.smoke.local` deben existir:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

**Quién ejecuta:** **tú (Juan) en tu Mac.** Cursor / Claude guían; **no** levantan Docker ni leen tus secretos.

Arranque (en tu terminal):

```bash
cd "Página de cursos de música"
zsh scripts/dev/start-smoke-local.sh
```

Login admin: `admin@gmusic.academy` (clave = `ADMIN_SEED_PASSWORD`).

Cuando hayas arrancado, di en qué pantalla estás (o pega el error) y te orientamos paso a paso — clicks y comandos los das tú.

---

## 1. Cinco PDFs distinguibles (prueba real F1)

1. `/admin` → bloque H1 / slots **1–5**.
2. En cada slot sube o pega un PDF **con nombre distinto** (ej. `etapa-1.pdf` … `etapa-5.pdf`) en `guidePdfUrl`.
3. Guardar / publicar según el flujo admin.
4. Login como **alumno ACTIVE** → `/mi-camino`.
5. Verificar:
   - **Tarjetas:** cada nodo muestra la etapa correcta.
   - **Resumen PDF:** al expandir cada etapa, el PDF firmado corresponde **1:1** (nodos 4 y 5 incluidos).
6. Evidencia: captura(s) Tarjetas + Resumen (puede ofuscar datos personales).

---

## 2. Video stub + signed-url (casilla §6 #2)

### Con stub

1. En `/admin`, en el nodo activo de práctica, pegar URL del stub piloto (ya en Storage T1) o subir un mp4 pequeño:
   - Objeto piloto típico: `clases-video/pilot/fundamentos/tu-guitarra-y-postura.mp4`  
     (o usar «Subir video» en admin).
2. Como alumno ACTIVE, abrir la tarjeta / prepare con video.
3. DevTools → Network: debe verse `POST /me/media/signed-url`.
4. En el DOM, el `<video src=…>` debe ser **URL firmada**, nunca la URL cruda del bucket.
5. Evidencia: captura Network **ofuscada** (token recortado).

### Sin video (vacío digno)

1. Dejar un slot **sin** `videoUrl`.
2. Verificar copy: **«Video próximamente»** (hero) y/o **«Esta etapa aún no tiene video publicado.»**
3. Evidencia: una captura.

---

## 3. Smokes (checklist)

Ver también `docs/operations/smoke-track-a.md`.

| # | Smoke | Qué mirar (Opción A) |
|---|-------|----------------------|
| 1 | ADMIN → `/admin` | Entra al panel |
| 2 | ACTIVE completa un nodo | Sesión → ejercicios → complete; XP/unlock; **video stub OK** |
| 3 | DEMO → clase → WhatsApp | Upsell `wa.me` |

Opcional: `node scripts/dev/qa-lesson-prepare-local.mjs`

---

## 4. Entregar a Fable / Claude

Cuando tengas las tres evidencias:

1. Resultado 5 PDFs (PASS/FAIL + capturas)  
2. Smokes 2 y 3 (PASS/FAIL)  
3. Captura ofuscada signed-url  

→ Fable marca §6 → tú autorizas merge → frase:

`OK T-UX-LESSON-01 — cierre con evidencia 6/6 infra (stubs OK) y smoke PASS.`

---

## Fuera de este runbook

- Video YouTube real Fundamento 1 = pendiente de contenido.  
- Merge/deploy sin OK Juan = prohibido.
