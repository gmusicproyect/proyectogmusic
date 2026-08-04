# MANDATO — Cierre del guard + insumos UX (docs/ux)

**Producto:** Academia GMusic
**De:** Juan (director) · **Para:** Cursor
**Fecha:** agosto 2026
**Alcance:** 2 tareas ordenadas · 2 commits separados · nada fuera de este documento

---

## 0. Contexto en tres líneas

Quedan dos cosas pendientes del ciclo anterior. Primera: T-OPS-MIGRATE-GUARD-01 tiene su evidencia 6/6 validada pero sigue en working tree sin commit. Segunda: llegaron tres insumos de diseño para el futuro ticket T-UX-LESSON-01 que Juan colocó en `docs/ux/`, y la propuesta trae cuatro pendientes de §8.1 que son hechos del repo — se resuelven leyendo código, no decidiendo nada.

**Este documento, entregado por Juan, constituye el «OK cierre T-OPS-MIGRATE-GUARD-01».** Si ese OK ya se ejecutó antes de leer esto, reporta la Tarea 1 como ya hecha con su hash y pasa a la Tarea 2.

---

## 1. Prerrequisito — verificar antes de tocar nada

Juan copió a mano estos tres archivos a `docs/ux/`:

1. `propuesta-t-ux-lesson-01.md` — la propuesta FINAL (el documento a completar)
2. `evaluacion-y-mejora-Classroom.md` — la evaluación que originó la propuesta
3. `Classroom.jsx` — el mockup original. **Solo referencia visual.** No es código de producción, no se importa desde `src/`, no se ejecuta su README.

Verifica que los tres existen. Si falta alguno → **STOP** y avisa a Juan qué falta. No sigas con archivos parciales.

---

## 2. Tarea 1 — Cerrar el guard (código, commit propio)

Commit y push de **solo** los archivos del guard, ya validados con evidencia 6/6:

- `scripts/lib/prisma-migrate-status-guard.mjs`
- `scripts/lib/prisma-migrate-status-guard.test.mjs`
- `scripts/verify-production-t1.mjs`
- `docs/deploy/checklist-track-a.md`
- `docs/operations/T-OPS-MIGRATE-GUARD-01-cierre-evidencia.md`
- `.agents/operations/t-ops-migrate-guard-evidence/report.json`

Más la actualización de `PROJECT_STATUS.md`: T-OPS-MIGRATE-GUARD-01 → CERRADO 6/6.

El fail-closed sin `DATABASE_URL` queda **exactamente como está** — no se suaviza ahora ni después.

**Evidencia a reportar:** hash del commit, push confirmado, y `git status` limpio al terminar (esa limpieza es la razón de que esta tarea vaya primero).

---

## 3. Tarea 2 — Pasada docs-only sobre docs/ux (G1)

### 3.1 Qué debes LEER (en este orden)

| # | Qué ver | Para qué |
|---|---|---|
| 1 | `docs/ux/propuesta-t-ux-lesson-01.md` | El documento a completar — en especial su inventario §8 |
| 2 | `docs/ux/evaluacion-y-mejora-Classroom.md` | Contexto: por qué el mockup no se instala y qué se extrae |
| 3 | `docs/ux/Classroom.jsx` | Solo referencia visual del layout y el FretboardSVG |
| 4 | CSS de la vista demo rediseñada (commit `cb5c3e5`) | §8.1 #1 — tokens reales de color |
| 5 | Backend del signed-url (commit `99e74d4`, ruta `POST /api/v1/me/media/signed-url`) | §8.1 #3 — contrato real |
| 6 | Rutas del runner certificado en T-PUB-02 (`POST /lesson-sessions`, `POST /lesson-sessions/:id/complete`) | §8.1 #4 — payload real |
| 7 | Estructura real bajo `src/app/components/` | §8.1 #6 — carpetas reales |

### 3.2 Qué debes HACER

Rellenar en `propuesta-t-ux-lesson-01.md` **únicamente** los pendientes de §8.1 (hechos del repo), sustituyendo cada `[PENDIENTE]` por el valor real encontrado:

- **#1** — Hex reales de los tokens del CSS de `cb5c3e5`: fondo, sidebar, bordes, dorado, texto primario y secundario.
- **#3** — Contrato exacto de `POST /api/v1/me/media/signed-url`: método, path, body de request, forma de la respuesta, y quién define el TTL.
- **#4** — Payload real de `POST /lesson-sessions` y de `/complete` (request y respuesta, incluyendo `nodeCompleted`, XP e idempotencia).
- **#6** — Ruta real de carpetas donde vivirían los componentes de lección.

Un solo commit de documentación, bajo la regla G1 (commit + push automático de docs), **separado** del commit de la Tarea 1.

### 3.3 Qué NO debes hacer

- **No tocar §8.2** — colores por tipo y path de URL son decisiones de Juan y de D-GOV, no hechos del repo.
- **No tocar §8.3** — verificaciones post-implementación; se quedan como están.
- **No implementar** `Fretboard.jsx`, `LessonView.jsx` ni `lesson-view.css`. Cero componentes nuevos.
- **No importar** `Classroom.jsx` desde ningún archivo de `src/`.
- **No crear** rutas, tickets ni decisiones D-GOV nuevas.
- Si un valor real del repo **contradice** lo que la propuesta afirma (p. ej. el contrato del signed-url difiere del flujo descrito), no "corrijas" la propuesta por tu cuenta más allá de rellenar el pendiente: registra la discrepancia en el reporte y Juan decide.

---

## 4. Reporte esperado (plantilla — rellenar y responder en chat)

```
Tarea 1 — guard: commit [hash] pushed · PROJECT_STATUS 6/6 · git status limpio.
Tarea 2 — docs: commit [hash] (G1, separado).
§8.1 resuelto con valores reales:
  #1 tokens cb5c3e5:
      --[var]: [hex]
      --[var]: [hex]
      (todos los leídos)
  #3 contrato signed-url: [método + path + body + respuesta + TTL definido por servidor]
  #4 payload lesson-sessions: [request/respuesta de sesión y de complete]
  #6 carpetas reales: [ruta]
§8.2 y §8.3: intactos.
Componentes implementados: ninguno. Classroom.jsx: no importado.
Discrepancias encontradas: [ninguna / detalle]
```

---

## 5. Condiciones de STOP

Detente y reporta sin ejecutar si: falta alguno de los tres archivos de `docs/ux/`; el working tree tiene cambios ajenos al guard antes de la Tarea 1; o cualquier paso te exigiría tocar código de producto, §8.2/§8.3, o algo no listado aquí.

---

*Mandato único. Dos commits, dos evidencias, un reporte. Nada más.*
