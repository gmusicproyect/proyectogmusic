# D-INFRA-DB-01 — Keep-alive para Supabase free tier

**Estado:** Aprobada e implementada — 2026-08-03 (Juan: «ok keep-alive»)  
**Área:** Infraestructura / DB  
**Origen:** incidente D-500-REGISTER (`docs/operations/D-500-REGISTER-2026-08-03.md`) — el proyecto Supabase de prod se auto-pausó por inactividad (plan free, ~7 días sin tráfico) y dejó caído todo el path autenticado.

## Decisión

Mantener el plan **free** de Supabase por ahora y evitar el auto-pause con un **keep-alive automático**:

- **Mecanismo:** Vercel Cron Job declarado en `vercel.json` (`crons`), proyecto `proyectogmusic`.
- **Frecuencia:** diario, `0 11 * * *` UTC (plan Hobby: 1 ejecución/día, hora no exacta dentro de la ventana — suficiente contra la ventana de ~7 días de Supabase).
- **Qué toca:** `GET /api/v1/health` en el deployment de producción → el rewrite de `vercel.json` lo proxya a la API en Render, que ejecuta `SELECT 1` vía Prisma contra Supabase (`server/routes/health.ts`). Cuenta como actividad real de DB para Supabase y de paso calienta el servicio de Render (mitiga arranque frío).
- **Sin secretos:** endpoint público de solo lectura; el cron no usa credenciales.

## Verificación

- El cron se registra en el siguiente deploy de producción (Vercel → Settings → Cron Jobs).
- **Pendiente de confirmar en la primera ejecución programada:** que la invocación del cron atraviese el rewrite externo hacia Render. La limitación documentada de Vercel es que los crons no siguen *redirects* (3xx); los *rewrites* son ruteo del lado del servidor y deberían aplicar, pero no está confirmado explícitamente en docs. Verificar en los runtime logs de Vercel (`requestPath:/api/v1/health`) tras la primera corrida.
- **Fallback si el cron no atraviesa el rewrite:** GitHub Action con cron (`curl` al mismo endpoint cada 2 días). Quedó redactada pero no pusheada: el token OAuth de git/gh de esta máquina no tiene scope `workflow` y GitHub rechaza crear archivos en `.github/workflows/` sin él. Habilitarla requiere una re-autenticación única de Juan: `gh auth refresh -h github.com -s workflow`.

## Límites conocidos

- El cron de Vercel Hobby no notifica fallos por sí solo; la señal de falla sería Supabase pausado de nuevo. Si se quiere alerta activa, la GitHub Action (que falla con email) es la mejora natural.
- El keep-alive **no** sustituye el plan pago: cuando haya alumnos reales pagando, evaluar Supabase Pro (recomendación Fable en el cierre D-500).

## Relación

- D-500-REGISTER (incidente que la motiva) · decisiones estacionadas restantes: `connect_timeout` corto en Render (F-ADITIVA operativa pendiente, de Juan) · API key de Render para agentes (descartada por Fable).
