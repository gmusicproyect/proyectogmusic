# T-INFRA-DONWEB-01 — Servidor DonWeb (staging), estado real

Registro de lo que quedó efectivamente provisionado el 2026-09-16 en el Cloud Server de DonWeb, para que no se repita el trabajo a ciegas. No es un plan hipotético: describe la instancia real.

## Servidor

- Proveedor: DonWeb Cloud Servers. Plan: 2 vCPU / 2GB RAM / 20GB NVMe.
- Imagen: `Node.js 22 en Ubuntu 24.04` (Node instalado en la práctica: v24.18.0 — cumple `engines.node >=22.9.0`).
- Hostname con SSL ya emitido por Certbot al crear el server: `vps-6399830-x.dattaweb.com`. IP: `149.50.155.31`.
- SSH en puerto **5753** (no 22). Acceso solo por llave (`PasswordAuthentication no` en `/etc/ssh/sshd_config`).
- Firewall `ufw` activo: solo 5753/tcp, 80/tcp, 443/tcp permitidos; default deny incoming.
- La app corre como usuario del sistema `gmusic` (no root), home `/home/gmusic`.

## Base de datos

- PostgreSQL **15.19** instalado desde el repo oficial `apt.postgresql.org` (Ubuntu 24.04 trae 16 por defecto; se forzó 15 para igualar Supabase/local).
- Escucha solo en `127.0.0.1:5432` — no expuesta a internet, ni siquiera necesita regla de firewall.
- DB `gmusic_learning_db`, owner `gmusic_admin`. Password generada con `openssl rand`, vive únicamente en el `.env` del servidor (permisos 600, dueño `gmusic`).
- **Esquema aplicado con `prisma db push`, no `migrate deploy`.** `migrate deploy` falla con el mismo error P3018 que documentó la auditoría de Astra (hallazgo #2: `User.id` TEXT vs `onboarding_analytics.user_id` UUID). No se intentó arreglar la cadena de migraciones — sigue fuera de alcance. Cuando se resuelva esa tarea, hay que re-aplicar correctamente en este servidor también.
- Consecuencia práctica: la tabla `_prisma_migrations` no refleja el historial real. No correr `prisma migrate dev` contra esta base sin revisar antes — puede generar drift.

## Storage

- `STORAGE_DRIVER=local` (el driver de PR #2). Archivos en `/opt/gmusic-storage/{clases-video,clases-pdf,ejercicios-media}`, dueño `gmusic`, `chmod 700`.
- `LOCAL_STORAGE_PUBLIC_ORIGIN=https://vps-6399830-x.dattaweb.com` y `CORS_ALLOWED_ORIGINS` igual — corregido para usar el dominio HTTPS, no la IP sin TLS.
- No se corrió el script `scripts/storage/migrate-supabase.ts` — no hay archivos reales migrados todavía, el bucket local está vacío.

## App

- Repo clonado en `/opt/gmusic` (público, clonado por HTTPS sin credenciales).
- `npm ci` + `npm approve-scripts --all` (npm 11 bloquea scripts de instalación por default; hubo que aprobar bcrypt, prisma, esbuild, etc. explícitamente) + `npm rebuild`.
- API corriendo con PM2 (`pm2 start 'npx tsx --env-file=.env --import ./sentry.server.instrument.ts server/index.ts' --name gmusic-api`), como usuario `gmusic`. `pm2 save` + `pm2 startup systemd` configurados — sobrevive a reinicio del servidor.
- No existe script `npm run start` de producción en `package.json`; se usó el mismo comando que `api:dev` pero sin forzar `NODE_ENV=development` (queda seteado por `.env`, en `production`).
- Build de frontend (`npm run build`) servido como estático por Nginx desde `dist/`.
- Nginx: `/etc/nginx/sites-available/vps-6399830-x` — reemplaza la app de ejemplo que traía la imagen. `location /api/` proxya a `127.0.0.1:3001`; el resto sirve `dist/` con fallback SPA a `index.html`. Certificados Certbot ya existentes se reutilizaron sin cambios.
- Base de datos vacía de contenido (sin `db:seed` corrido) — el landing carga pero no hay cursos/lecciones reales todavía.

## Pendiente para el corte real a producción (NO hecho todavía)

1. Resolver la cadena de migraciones (hallazgo #2) antes de confiar en `migrate deploy` aquí.
2. Migrar datos reales desde Supabase (Postgres + Storage) con verificación, no solo empezar en blanco.
3. Dominio propio del proyecto (hoy sigue siendo el subdominio `dattaweb.com` que dio DonWeb) — si se define uno, hay que emitir cert nuevo con Certbot y actualizar `CORS_ALLOWED_ORIGINS` / `LOCAL_STORAGE_PUBLIC_ORIGIN`.
4. Mientras no se apague Vercel/Render/Supabase, este servidor es staging/pruebas — no cambiar DNS del dominio de producción hasta confirmación explícita.
5. Revisar si conviene mover la app fuera de `/opt/gmusic` (clonado manualmente) a un flujo de deploy repetible (git pull + build + pm2 reload) en vez de un checkout manual.
6. Log de arranque confuso: `server/index.ts:16` imprime siempre `[dev-auth] Alumno resuelto por GMUSIC_DEV_USER_EMAIL...` aunque el middleware sí bloquea ese bypass en producción (`devStudentAuth.ts:23`). Limpieza cosmética, no es un bug de seguridad — pero conviene condicionar el log a `NODE_ENV !== "production"` para no confundir en los logs de PM2.
