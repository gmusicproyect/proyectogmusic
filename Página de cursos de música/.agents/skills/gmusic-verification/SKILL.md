---
name: gmusic-verification
description: >-
  Verificación antes de declarar trabajo completo en Gmusic: typecheck, tests,
  build, regresión de funnel y criterios de salida. Inspirado en patrones ECC
  y Superpowers verification; adaptado a tickets congelados y DECISIONS.
origin: ecc-patterns-curated
---

# Gmusic Verification

Activar **antes de reportar éxito**, hacer commit o pedir push. Complementa `gmusic-agent-workflow` y `.agents/cursor-rules/loop.mdc`.

---

## Comando canónico

```bash
npm run verify
```

Equivale a:

```bash
npm run typecheck && npm run app:test && npm run api:test && npm run build
```

Si la tarea es solo frontend: mínimo `app:typecheck && app:test && build`.  
Si solo backend: `api:typecheck && api:test` (requiere `DATABASE_URL` en `.env`).

---

## Checklist por tipo de cambio

### Cualquier cambio de código

- [ ] Typecheck limpio (`app` y/o `api`)
- [ ] Tests del área tocada en verde
- [ ] `npm run build` exitoso
- [ ] Sin warnings **nuevos** introducidos por el cambio

### Funnel / inscripción / quiz (Track A)

- [ ] Tests: `inscripcion-gate.test.ts`, `anonymous-funnel-storage.test.ts`, routing demo
- [ ] Si deploy: `npm run deploy:verify-funnel` y/o checklist `docs/deploy/checklist-track-a-t3-e2e.md`
- [ ] No usar email/state stale en submit — FormData es fuente de verdad (`900f1f4`)

### Zona protegida (auth, Prisma, pagos)

- [ ] Autorización explícita de Juan registrada
- [ ] Skill de dominio activo (`gmusic-learning-engine`, `gmusic-auth-email-verification`)
- [ ] Tests API server en verde

---

## Prohibido declarar “listo” si

- No corriste verificación real (no asumir conteos de tests de MEMORY)
- Hay fallos silenciados con `.catch(() => {})` en rutas críticas sin documentar
- El cambio contradice una decisión **Aprobada** en `DECISIONS.md`
- Mezclas scope de ticket congelado (T3/T3.5, T4 bloqueado)

---

## Tope de reintentos

Máximo **3** correcciones consecutivas tras fallo de verificación. Al 4.º fallo: **congelar** y reportar error + causa probable (ver `loop.mdc`).

---

## Reporte mínimo

```
Verificación: npm run verify → OK / FALLA
Tests: N pasando, M fallos
Build: OK / FALLA
Regresión funnel: N/A | OK | pendiente E2E
```
