# P0-04 — PathViewH1 / Mi Camino

- Backend responde “qué practico ahora” en `GET /api/v1/me/path`.
- El payload legacy se conserva; `pathViewH1` agrega contrato H1 para UI futura.
- Entrada obligatoria: `LearnerContextH1`.
- Dominio: Ruta 12m + FTC desde `rutaFtcDomainH1`.
- Progreso: proyección de eventos P0-05 (`practiceEventsH1`), no frontend.
- Acceso: Entitlements P0-07 (`monthsPlayable`).
- Comunidad y premium: no se exponen como links/CTA.
- Sin schema, migraciones, UI o routing nuevo.

Limitación H1:

El progreso basado en eventos usa el store en memoria de P0-05. Es fuente
temporal aceptada para el puente H1; la durabilidad requiere decisión futura.
