---
name: gmusic-ci-deploy
description: >-
  CI, deploy y smoke tests de Gmusic: GitHub Actions, Vercel, Render, scripts
  verify-*, checklist Track A. Usar antes/después de push a main en funnel o API.
origin: ecc-patterns-curated
---

# Gmusic CI & Deploy

Patrones operativos para validar que producción refleja el commit esperado. No sustituye E2E manual con Juan.

---

## Entornos

| Superficie | URL / destino |
|------------|----------------|
| Frontend | `https://proyectogmusic.vercel.app` |
| API | `https://gmusic-api.onrender.com` |
| DB | Supabase Postgres (Prisma) |

---

## CI en GitHub (automático en PR/push)

- **Seguridad:** `.github/workflows/security-scan.yml` — gitleaks, env, npm audit
- **Calidad:** `.github/workflows/ci.yml` — typecheck, tests, build

---

## Scripts locales (agente)

```bash
npm run verify                    # typecheck + tests + build
npm run deploy:verify-config      # config Track A
npm run deploy:verify-funnel      # rutas funnel
npm run deploy:verify-production  # smoke T1 producción
```

Variables opcionales: `GMUSIC_FRONTEND_URL`, `GMUSIC_API_URL`.

---

## Checklist post-deploy (funnel / T3)

Ver `docs/deploy/checklist-track-a-t3-e2e.md`:

1. `/quiz-temperamento` → 200
2. Quiz → demo → gate → registro
3. `link-lead` → Supabase con email, plan, `lead_captured_at`
4. WhatsApp con mismo email del formulario
5. PostHog: quiz → demo → registro → WhatsApp

**No cerrar T3/T3.5** sin E2E incógnito completo.

---

## Reglas

- Push a `main` solo con autorización de Juan (AGENTS.md).
- No usar `prisma migrate deploy` en prod sin resolver R-OPS-01 (baseline).
- Confirmar bundle nuevo en Vercel (hash JS cambió) antes de declarar fix en producción.
- ECC deploy skills genéricos: referencia externa solo; este skill manda en Gmusic.
