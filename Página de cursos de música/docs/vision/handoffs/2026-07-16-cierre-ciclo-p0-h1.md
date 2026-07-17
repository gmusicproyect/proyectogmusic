# Handoff — cierre ciclo P0 H1

Fecha: 16 Jul 2026
Rama / HEAD: `main` @ `e5b161c`
Estado Git: commit único P0 autorizado con alcance selectivo; push no autorizado

## Dictamen

Juan aprobó Gates G1–G8. El ciclo P0 H1 queda cerrado:

1. P0-01 — Identidad / Perfil H1
2. P0-02 — Onboarding diagnóstico
3. P0-03 — Ruta 12 meses + FTC
4. P0-07 — Pagos conceptuales + Entitlements
5. P0-05 — Sesión + Eventos
6. P0-04 — Mi Camino
7. P0-06 — Mi Progreso
8. P0-08 — Biblioteca básica

## Contratos H1 vigentes

- `profileId = userId` mediante `LearnerContextH1`; es un puente temporal, no
  autoriza tabla Profile ni migraciones.
- `/me/path` conserva payload legacy y agrega `pathViewH1`.
- `/me/progress` expone progreso derivado de eventos P0-05.
- `/me/library` expone catálogo básico filtrado por Entitlements.
- `/me/access` es la fuente única de autorización.
- Premium y Comunidad permanecen deshabilitados.
- Audio, pitch, accuracy y scoring están fuera del alcance.

## Puentes temporales aceptados

- Eventos y proyección de práctica: memoria de proceso
  (`memory_bridge_h1`).
- Onboarding / perfil implícito: proyección H1 en memoria.
- Catálogo Biblioteca: fixture de metadatos en memoria
  (`memory_fixture_h1`), sin seeds ni multimedia real.

Estos puentes no son persistencia productiva. Persistencia durable de eventos,
progreso y catálogo requiere un mandato arquitectónico separado.

## Verificación de cierre

- P0-01: H1 13/13.
- P0-03: dominio Ruta/FTC aprobado en G3.
- P0-05: T-SES 6/6.
- P0-04: T-CAM 10/10.
- P0-06: T-PRG 12/12.
- P0-08: T-LIB 13/13.
- P0-04 + P0-06 + P0-08 + timezone: 39/39.
- App: 578/578.
- Typecheck: OK.
- Build: OK; warnings preexistentes de chunks/imports.
- `npm run verify`: rojo por deuda seed/DB aceptada por Juan; no se atribuye a
  regresión P0.
- `prisma/`: sin cambios P0; no schema ni migraciones.

## Decisión de secuencia

Juan eligió:

1. cerrar documentación/evidencia final;
2. luego revisar y autorizar explícitamente un commit único P0;
3. después evaluar persistencia durable como mandato separado.

## Cierre Git

- Juan revisó y autorizó la lista exacta de 41 rutas P0.
- El commit usa staging selectivo; no incluye trabajo ajeno del árbol sucio.
- No se autoriza push.
- No iniciar persistencia durable, UI nueva, routing, premium ni Comunidad.
