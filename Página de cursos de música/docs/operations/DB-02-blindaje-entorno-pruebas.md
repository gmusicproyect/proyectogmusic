# DB-02 — Blindaje del entorno de pruebas (api:test)

**Estado:** DB-02A correcciones Codex · 11 Jul 2026  
**Gate previo:** DB-01 CERRADO — prod = `tosbwmqijmtxchvcgrkj` (us-east-1)

---

## Matriz de archivos

| Archivo | Rol | ¿Para tests? |
|---------|-----|----------------|
| **`.env`** | **PRODUCCIÓN** | **PROHIBIDO** — no sobrescribir ni usar en tests |
| **`.env.ci`** | CI `wdrrqbclhrzghcewygdj` @ `aws-1-us-east-2.pooler.supabase.com` | **Sí** — el runner lee **solo** `DATABASE_URL` |
| **`.env.docker`** | `localhost:5432/gmusic_learning_db` | **Sí** — solo `DATABASE_URL` |
| **GitHub secret `DATABASE_URL`** | Misma URI CI | **Obligatorio** — si falta → **exit 1** (no skip) |

---

## Fail-closed

- Falta secret / `.env.ci` / URL → **exit 1**
- Prod ref o host prod → rechazado
- CI permitido **solo** si ref **y** host canónicos coinciden
- Docker: solo `localhost` / `127.0.0.1` / `::1` + base `gmusic_learning_db` + puerto `5432`
- Nunca imprime URI completa ni password

---

## Comandos

```bash
npm run ops:test-db-guard   # unitarios sintéticos (sin BD)
npm run api:test            # .env.ci → guard → suite (cuando Codex autorice)
npm run api:test:docker     # .env.docker estricto
```

T-PUB-02 sigue **congelado**.
