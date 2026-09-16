# Storage local — preparación, sin corte de producción

`STORAGE_DRIVER` ausente o `supabase` conserva el comportamiento actual. `local` activa lectura y escritura locales. Un valor desconocido falla cerrado. No se ejecutó migración contra Supabase ni se cambiaron DNS/proveedores.

## Configuración y contrato

- `LOCAL_STORAGE_ROOT`: carpeta absoluta privada, fuera de `dist`, `public` y del document root de Nginx. Crear como usuario de API, modo 0700. Solo ese usuario debe poder modificar el árbol; no montar carpetas compartidas ni permitir symlinks.
- `LOCAL_STORAGE_PUBLIC_ORIGIN`: origen público del API, sin path; HTTPS obligatorio también en staging para conservar la validación actual de `materialUrl` en el endpoint. Las pruebas HTTP de loopback usan solo el pathname firmado con Supertest.
- `LOCAL_STORAGE_SIGNING_SECRET`: secreto aleatorio independiente, mínimo 32 caracteres. Rotarlo invalida inmediatamente todos los enlaces anteriores.
- Los buckets siguen siendo `clases-video`, `clases-pdf`, `ejercicios-media`.
- `POST /api/v1/me/media/signed-url` conserva body `{ materialUrl }` y respuesta `{ signedUrl, expiresIn }`, además de autenticación y reglas de suscripción existentes. TTL default 3600 s, máximo 86400 s.
- `GET/HEAD /api/v1/media/local/:bucket/*` verifica HMAC-SHA256 y caducidad antes de servir. Soporta Range/206 para video. Un enlace válido es una credencial temporal compartible hasta su caducidad; no se registra su query en Nginx.
- La URL canónica devuelta al subir conserva `/storage/v1/object/bucket/path`, por compatibilidad con el detector del frontend. Es un identificador: **no se sirve sin firma**. El frontend sigue solicitando la firma sin modificaciones.
- Referencias Supabase existentes se resuelven al mismo bucket/path local; no hace falta reescribir la base de datos. No hay fallback silencioso a Supabase si falta un archivo local.
- Tamaño de subida sigue limitado a 50 MiB por el middleware existente. Se mantienen las dependencias actuales por alcance.

## Copia desde staging

Usar copia/staging sin escrituras concurrentes durante la copia. No cargar `.env` de producción. El script requiere variables separadas `MIGRATION_SUPABASE_URL`, `MIGRATION_SUPABASE_KEY`, `MIGRATION_STORAGE_ROOT` y confirmación `--staging-copy`:

```sh
node --import tsx scripts/storage/migrate-supabase.ts --staging-copy
```

El origen debe ser HTTPS (HTTP solo loopback). La clave debe permitir listar y descargar los tres buckets de staging. La carpeta destino debe ser absoluta. Lista paginada y recursivamente, descarga secuencialmente a temporales sin cargar videos completos en RAM, calcula SHA-256 de los bytes recibidos y vuelve a leer el archivo para contrastarlo. También compara tamaño del listado cuando está disponible. Un archivo idéntico conserva su fecha de modificación; uno distinto se reemplaza atómicamente. Los archivos ajenos al origen no se borran.

`migration-manifest.json` contiene origen, bucket, ruta, tamaño, SHA-256 y acción de cada archivo. Se publica solamente después de completar los tres buckets. Ante un fallo, un manifiesto anterior permanece histórico: **la salida no cero significa copia incompleta**, incluso si existe un manifiesto viejo. La verificación es fuente descargada vs disco, no una certificación independiente de integridad del proveedor. Congelar subidas y repetir inventario/checksums al preparar el corte real.

Probar en staging: subida admin → persistir URL en nodo → alumno autorizado solicita firma → reproducir y adelantar video → abrir PDF; firma modificada/expirada debe fallar y URL canónica directa no debe exponer bytes.

## Rollback

Mientras producción sigue en Supabase, este PR no cambia su comportamiento. Para volver a Supabase después de probar subidas locales, copiar primero **los nuevos archivos locales** al bucket/ruta equivalente y verificar checksums. Cambiar solo el flag no replica esos archivos. Mantener las tres infraestructuras anteriores hasta que se apruebe el corte y su ventana de rollback; no borrar archivos ni buckets como parte de este script.

## Verificación automatizada

```sh
NODE_ENV=test node --import tsx --test server/tests/localStorage.test.ts server/tests/storageMigration.test.ts server/tests/supabaseStorage.test.ts
```

Usa directorios temporales y un origen simulado en memoria, sin credenciales ni conexiones a Supabase. Cubre Range/HEAD, HMAC, caducidad, traversal, symlinks, referencias antiguas, reemplazos, default Supabase, paginación, recursión, checksums e idempotencia. La prueba contra un Supabase staging real queda pendiente de sus credenciales.
