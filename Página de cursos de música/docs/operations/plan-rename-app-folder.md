# Plan (solo plan) — rename `Página de cursos de música/` → `app/`

**Estado:** PROPUESTA · **cero moves ejecutados** (Oleada E · E5 · 28 Jul 2026) · ejecutar solo con OK explícito de Juan y ventana sin trabajo en vuelo.

## Por qué
Espacios+tildes en la raíz de la app rompen tooling ingenuo (patch/CI/scripts), obligan a comillar todo y complican onboarding. El rename es barato **si** se hace de una vez, con todo verde antes y después.

## Precondiciones
1. `main` limpio, sin patches pendientes de aplicar (todas las oleadas commiteadas).
2. `npm run typecheck && npm run app:test && npm run api:test && npm run build` verdes ANTES.
3. Nadie más trabajando en el repo esa ventana.

## Pasos (un solo commit)
1. `git mv "Página de cursos de música" app` — git preserva historia (rename detection).
2. Actualizar referencias de ruta **fuera** de la carpeta (los imports internos son relativos y no cambian):
   - `.github/workflows/*.yml` (working-directory / paths)
   - Vercel: Root Directory en el dashboard del proyecto (no hay ruta en `vercel.json`… verificar) 
   - `scripts/dev/start-smoke-local.sh` (ya autolocalizado — solo el fallback de `GMUSIC_APP_DIR` en docs)
   - Docs que citan la ruta: `README.md` raíz, `.agents/*`, `docs/flows/00-mapa-maestro.md`, informes activos
3. `rg "Página de cursos de música" -l` → debe quedar solo en docs históricos (99-Reportes / handoffs), nunca en tooling vivo.
4. Verificación: los 4 comandos de la precondición 2, verdes DESPUÉS + deploy preview en Vercel.

## Riesgos y mitigación
- **Vercel Root Directory** apunta a la ruta vieja → deploy roto: cambiarlo en el mismo momento del push; probar con preview.
- Scripts personales de Juan con la ruta hardcodeada: `rg` del paso 3 los delata.
- Historia git: `git log --follow` funciona tras `git mv`; no usar borrar+crear.

## Rollback
Un solo `git revert` del commit de rename + restaurar Root Directory en Vercel.
