# Paso 0 — Base de la copia cursor

Fecha: 2026-11-09  
Repo: `proyectogmusic-cursor` (aislado; no tocar el original)

## Hecho

- [x] Clon en `/Volumes/Juan lizama h/gmusic/Academia GMusic/01-Producto/proyectogmusic-cursor`
- [x] `npm install` en `Página de cursos de música/`
- [x] `.env` desde `.env.example` (local; no commitear)
- [x] `npm run prisma:generate`
- [x] `npm run app:typecheck` OK
- [x] `npm run app:test` → **652/652** pass
- [ ] `npm run api:test` — requiere Postgres local/CI (pendiente Paso 0b)
- [x] `npm run api:typecheck` OK
- [x] `npm run build` OK (warning de chunk size preexistente)

## Comandos de verificación

```bash
cd "Página de cursos de música"
npm run app:typecheck
npm run app:test
# Con DB local:
# docker compose up -d
# npm run db:migrate:deploy
# npm run api:test
```

## Siguiente

**Paso 1** — ✅ hecho — ver `PASO-1-WORKBENCH.md`.
