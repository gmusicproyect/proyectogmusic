# T-INFRA-DONWEB-01 — preparación para VPS todo en uno

Estado: plan y plantillas para revisión. **No se contrató VPS, no se modificó producción ni DNS.** El corte requiere confirmación explícita del usuario después del informe de verificación. PR de storage local: #2; este plan no lo activa.

## Configuración a contratar

DonWeb **Cloud Server**, imagen **Node.js Hosting Cloud** (Ubuntu + Node/NPM + PM2 + Nginx + Certbot), **2 vCPU y 2 GB RAM como mínimo**, disco SSD **80 GB como punto inicial**, ampliable. Disco es presupuesto de este proyecto, no una cuota confirmada de un paquete comercial: antes de pagar, exigir espacio para archivos + DB + dump + copia temporal + 30% libre. Elegir datacenter de menor latencia disponible para Chile. No contratar hosting compartido.

Para servir videos y ejecutar base/API en el mismo equipo se recomienda subir a **4 GB RAM**, especialmente si se compila allí. Con 2 GB, compilar artefactos fuera del VPS, usar 1 proceso API, limitar concurrencia de subidas y probar carga. Confirmar transferencia mensual, backups externos, ampliación de disco y precio vigente en el presupuesto. No hay compra autorizada en este documento.

Referencias consultadas el 16-09-2026: [oferta Node.js](https://donweb.com/es-cl/cloud-nodejs-hosting) y [guía oficial Nginx/PM2/SSL](https://soporte.donweb.com/hc/es/articles/19492126815124-Configurar-mi-Cloud-Server-con-Node-JS-Nginx). Verificar las versiones efectivas de la imagen; fijar Node 22, mínimo 22.9.0, aunque la imagen instale otra.

## Arquitectura y carpetas

```text
HTTPS dominio real → Nginx
  /api/* → 127.0.0.1:3001 → Node 22/PM2 (1 proceso)
  resto → /srv/gmusic/current/Página de cursos de música/dist
API → PostgreSQL 15 en Docker, puerto solo loopback
API → /srv/gmusic/storage/{clases-video,clases-pdf,ejercicios-media}
```

Elegimos **PostgreSQL 15 en Docker con volumen persistente**: fija la versión independiente de Ubuntu y permite ensayar backup/restauración sin mezclar paquetes del sistema. El pequeño coste operativo es Docker Compose; no se añade MinIO/S3. El volumen no es backup. Nunca ejecutar `docker compose down -v` sobre este servicio.

Usar usuario `gmusic` sin privilegios administrativos para PM2. Releases en `/srv/gmusic/releases/<commit>` y enlace `current`; archivos y base fuera de releases. `/etc/gmusic/api.env` modo 0600, legible por `gmusic`; storage 0700 propiedad `gmusic`. Nginx solo puede leer `dist`; no recibe alias a storage ni a la raíz del repositorio. Abrir públicamente solo 80/443 y SSH restringido; bloquear 3001/5432 (API actual escucha en todas las interfaces, por lo que este firewall es obligatorio).

## Preparación, cuando exista el VPS

1. Inventariar versiones de Ubuntu, Node, npm, PM2, Nginx, Certbot y Docker. Instalar Docker Engine/Compose desde repositorio oficial de Ubuntu/Docker si falta; no ejecutar instaladores desconocidos. No detener el sitio antiguo.
2. Preparar usuario, carpetas, firewall, actualizaciones del sistema, zona horaria UTC y monitorización de RAM/disco.
3. Guardar `POSTGRES_PASSWORD` en archivo externo al repo y levantar la plantilla:

   ```sh
   docker compose --env-file /etc/gmusic/postgres.env -f ops/donweb/compose.postgres.yml up -d --wait
   ```

   Registrar digest de la imagen resuelta para el ensayo y mantenerlo para el corte. Crear una base vacía para restauración y separar usuarios de administración y aplicación antes del corte.
4. Instalar el release revisado: `npm ci`, `npm run prisma:generate`, `npm run typecheck`, `npm run app:test`, `npm run build`. Se requieren devDependencies porque la ejecución actual utiliza `tsx`; **no usar `npm ci --omit=dev`** con esta plantilla. No ejecutar seed ni migrate deploy contra la base restaurada. Para 2 GB, hacer build en un entorno Linux compatible y publicar `dist`; instalar dependencias de runtime en el VPS, no copiar `node_modules` desde macOS.
5. Guardar variables de API en `/etc/gmusic/api.env`. Ejecutar como `gmusic`: `pm2 start ops/donweb/ecosystem.config.cjs`, comprobar health y logs, luego `pm2 save`. Configurar `pm2 startup` para ese usuario y probar reinicio del VPS de staging. Configurar rotación de logs para no llenar el disco.
6. `bash ops/donweb/render-nginx.sh DOMINIO_REAL /tmp/gmusic.conf` solo genera archivo. Revisarlo, instalarlo manualmente en sites-available, enlazarlo a sites-enabled, ejecutar `nginx -t` y solo entonces recargar Nginx. Antes del corte, probar por resolución local/hosts o proxy de staging; **no cambiar DNS** para probar.
7. TLS: tras autorización expresa para la fase real, usar Certbot con el dominio efectivamente confirmado: `certbot --nginx -d DOMINIO_REAL`. No inventar `www`. Antes del cambio A/AAAA se puede obtener certificado mediante DNS-01, pero también implica cambios DNS y requiere autorización; en esta ronda no se hace. HTTP-01 necesita que el dominio resuelva al VPS: coordinar la emisión con el corte o usar DNS-01 previamente aprobado. Verificar renovación con `certbot renew --dry-run` y HTTPS/redirect final. No aceptar TLS autofirmado como validación de producción.

## Variables necesarias (nombres; secretos fuera del repo)

| Grupo | Variables |
|---|---|
| API | `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS` |
| Storage local | `STORAGE_DRIVER`, `LOCAL_STORAGE_ROOT`, `LOCAL_STORAGE_PUBLIC_ORIGIN`, `LOCAL_STORAGE_SIGNING_SECRET` |
| Recuperación admin | `ADMIN_PASSWORD_RESET_KEY` |
| PostgreSQL Compose | `POSTGRES_PASSWORD` |
| Build frontend | `VITE_API_BASE_URL` (ruta relativa `/api/v1`), `VITE_USE_DASHBOARD_MOCK`, `VITE_USE_PATH_MOCK` (ambos desactivados) |
| Opcionales existentes | `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `VITE_SENTRY_DSN`, `VITE_SENTRY_ENVIRONMENT`, `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` |
| Source maps opcionales | `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT` (solo build) |
| Flags de dominio | `GMUSIC_H1_DURABLE` mantener configuración aprobada, no activar por migrar infraestructura |
| Preparación/copia | `MIGRATION_SUPABASE_URL`, `MIGRATION_SUPABASE_KEY`, `MIGRATION_STORAGE_ROOT`, `COUNT_DATABASE_URL` |

En destino local no se requieren `SUPABASE_URL` ni `SUPABASE_SERVICE_ROLE_KEY` para servir archivos; conservarlas únicamente en entorno antiguo/rollback. No instalar el Secret File de Render en el VPS. No llevar credenciales de seed, `GMUSIC_DEV_ACTIVATION_KEY` ni flags mock a producción. `JWT_SECRET` debe conservarse durante el corte si se desea mantener sesiones; evaluar las cookies si cambia el dominio.

## Checklist de migración de datos — ensayo primero

**Bloqueo conocido:** migraciones históricas no reproducibles desde cero. Esta tarea no las repara. Restaurar el esquema real y `_prisma_migrations`; si `db:migrate:status` no queda limpio, detener el corte y resolver en la tarea de migraciones. Nunca disimularlo con `migrate resolve` automático, reset o db push en producción.

1. Inventariar `SHOW server_version` del origen. PostgreSQL 15 es el destino solicitado, pero un origen de versión mayor **no garantiza downgrade**: usar pg_dump al menos de la versión del servidor y ensayar la restauración en 15. Si falla por incompatibilidad, detener y proponer actualizar destino; no degradar datos ni SQL a ciegas.
2. Ensayar con copia/staging. Inventariar tamaño DB y storage, extensiones, funciones, políticas/RLS y referencias a esquemas administrados de Supabase (`auth`, `storage`, etc.). La app usa Prisma/usuarios propios. El dump de `public` solo es suficiente si se confirma que no depende de objetos externos. Si aparecen dependencias, detener y definir exportación selectiva.
3. Durante la ventana real autorizada, congelar escrituras (registro, progreso, admin y subidas) **en ambos entornos**. Hacer dump y conteos bajo ese congelamiento. No comparar contra un origen que siga cambiando.
4. Con cliente pg_dump compatible y secretos fuera de historial de shell:

   ```sh
   pg_dump --dbname="$SOURCE_DATABASE_URL" --format=custom --schema=public --no-owner --no-acl --file=gmusic-public.dump
   sha256sum gmusic-public.dump > gmusic-public.dump.sha256
   COUNT_DATABASE_URL="$SOURCE_DATABASE_URL" bash ops/donweb/count-public-rows.sh > source-counts.jsonl
   pg_restore --dbname="$TARGET_DATABASE_URL" --no-owner --no-acl --exit-on-error --single-transaction gmusic-public.dump
   COUNT_DATABASE_URL="$TARGET_DATABASE_URL" bash ops/donweb/count-public-rows.sh > target-counts.jsonl
   diff -u source-counts.jsonl target-counts.jsonl
   DATABASE_URL="$TARGET_DATABASE_URL" npm run db:migrate:status
   ```

   Destino vacío; no usar `--clean` contra una base con datos. Incluir `_prisma_migrations`. Cualquier error, tabla ausente, diferencia de filas o estado de migraciones no limpio bloquea el corte. Conteos no prueban identidad de contenido: verificar además muestras por IDs, relaciones, usuarios/roles, suscripciones vigentes y progreso de alumnos.
5. Copiar buckets con el script del PR #2 a staging primero. Comparar inventario, tamaño y SHA-256; repetir bajo freeze antes del corte. El manifiesto solo certifica bytes copiados, no la presencia de todas las referencias de la DB: revisar `videoUrl`, `guidePdfUrl` y referencias de medios de ejercicios. Probar todas las referencias o generar listado de ausentes.
6. Validación funcional: health/DB; login alumno/admin; catálogo/lección; avance persistente tras refrescar; archivos video/PDF, Range 206 y expiración/firma inválida; administración de subida; incógnito y móvil. No ejecutar la suite destructiva API contra la copia final con alumnos: usar otra DB descartable.
7. Ensayar backup y restore completo de DB+storage en un destino vacío. Mantener backup cifrado externo al VPS (mínimo diario, retención 7 días/4 semanas como punto inicial), respaldar antes de cada cambio y monitorizar restaurabilidad y capacidad. No almacenar el único backup junto al disco principal.

## Informe de aceptación antes de DNS

Registrar commit de release, versiones, recursos/capacidad, fecha del dump, checksums e inventario, conteos iguales, estado limpio de migraciones, URLs comprobadas sin tokens, evidencias de login/progreso/archivos y prueba de restauración. Listar pendientes. Adjuntar el informe al usuario y **esperar confirmación explícita del corte**.

## Corte y rollback (solo con autorización futura)

- Antes de DNS: Vercel, Render y Supabase siguen activos; el VPS permanece en staging sin aceptar escrituras de usuarios reales. Abortar significa mantener infraestructura anterior, sin pérdida de datos.
- Corte: freeze, exportación/copia final, verificaciones, TLS validado, aprobación del informe y del cambio A/AAAA, cambio DNS, smoke, apertura de escrituras **solo en un destino**. Registrar valores DNS anteriores y TTL. No configurar dos backends escribiendo independientemente durante propagación.
- Rollback antes de abrir escrituras VPS: restaurar DNS anterior, mantener frontend/API anteriores y descongelar solo origen. Mantener VPS bloqueado.
- Rollback después de nuevas escrituras VPS: congelar ambos, respaldar destino y reconciliar/exportar nuevas filas y archivos al origen antes de reabrir. Volver solo DNS perdería progreso, registros y archivos nuevos. Requiere operación supervisada, no se automatiza en este PR.
- No cancelar proveedores antiguos ni borrar buckets/backups hasta que el usuario acepte la ventana posterior de observación y el rollback esté probado.

## Evidencia disponible y límites

Plantillas sin ejecutar en VPS. Verificación local: sintaxis de scripts/config PM2, render de Nginx, conteos de filas en PostgreSQL temporal. El driver del PR #2 se probó por HTTP con Supertest, archivos temporales y PostgreSQL 16 local. Docker está detenido: no se declara probado el conjunto Ubuntu/Nginx/PM2/PostgreSQL 15 ni TLS/DNS. Ese ensayo completo es un gate antes del corte, no una razón para tocar producción ahora.
