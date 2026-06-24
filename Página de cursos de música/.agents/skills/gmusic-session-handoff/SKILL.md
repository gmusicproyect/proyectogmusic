---
name: gmusic-session-handoff
description: >-
  Handoff entre sesiones de agente en Gmusic: estado real del repo, tickets
  abiertos, próximo paso y qué no tocar. Evita drift de memoria y números stale.
origin: ecc-patterns-curated
---

# Gmusic Session Handoff

Usar al **inicio** (“Retomar Gmusic”) y al **fin** de sesión (antes de compactar contexto).

---

## Inicio de sesión

1. Leer `.agents/MEMORY.md` y `.agents/DECISIONS.md` (tickets abiertos).
2. Correr estado real:

```bash
./scripts/agent-status.sh
```

3. Declarar skill de dominio + archivos previstos (`gmusic-agent-workflow`).
4. No confiar en conteos de tests de docs viejos — usar salida de `agent-status.sh`.

---

## Fin de sesión (handoff)

Entregar bloque fijo:

```markdown
## Handoff Gmusic — YYYY-MM-DD

**Rama / HEAD:** `main` @ `<sha corto>`
**Ticket activo:** T3/T3.5 E2E | otro
**Hecho:** …
**Verificación:** `npm run verify` → OK/FALLA
**Pendiente:** …
**No tocar:** auth, pagos, Prisma, T4, D-GOV-11 sin aprobación
**Archivos en progreso:** …
```

Si el cambio es arquitectónico: actualizar handoff en `docs/vision/handoffs/` (Juan/Fable aprueban).

---

## Memoria: qué persiste dónde

| Dato | Fuente de verdad |
|------|------------------|
| Decisiones producto | `.agents/DECISIONS.md` |
| Estado operativo | `.agents/MEMORY.md`, `PROJECT_STATUS.md` |
| Progreso demo visitante | `localStorage` temporal (`gmusic:demo_v1`, quiz keys) |
| Lead / quiz analytics | Supabase `onboarding_analytics` |
| Progreso alumno real | Backend Postgres (futuro; no localStorage) |

No mezclar reset anónimo post-lead con progreso de alumno registrado (T3.5).

---

## ECC vs Gmusic

ECC promueve memoria continua entre sesiones. En Gmusic:

- **Sí:** handoff explícito, `agent-status.sh`, MEMORY actualizado por Fable
- **No:** auto-exportar sesión a skills sin revisión humana
- **No:** escribir en `DECISIONS.md` sin aprobación de Juan
