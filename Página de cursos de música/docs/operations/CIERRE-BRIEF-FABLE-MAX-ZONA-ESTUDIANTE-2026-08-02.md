# CIERRE VERIFICADO — Brief Fable Max Zona Estudiante

**Fecha verificación:** 2026-08-02  
**Runbook:** CIERRE-MISIÓN (Fable → Cursor)  
**Tip canónico:** `origin/main` = `HEAD` = **`3928d1c`** (`3928d1c57e5a7aebf865bc203f432fc614863ab1`)  
**Naturaleza:** solo lectura + este informe (y copia en `99-Reportes/`). Sin fix, sin reopen, sin commit/push.

---

## 1. Tabla PASS/FAIL — bloques V0–V4

| Bloque | Resultado | Evidencia breve |
|--------|-----------|-----------------|
| **V0** Precondiciones | **PASS** | `rev-parse HEAD` y `origin/main` = `3928d1c…`. Ancestros OK: `e9e70ed`, `2311295`, `6803f0e`, `3928d1c`. Branch `main...origin/main` al día. Porcelain: **solo** untracked `BRIEF-FABLE-MAX-ZONA-ESTUDIANTE-2026-08-02.md`. |
| **V1** WS1 demo nav | **PASS** (código) · **MANUAL PENDIENTE Juan** (browser) | `DemoAcademyNav`: tabs `Inicio · Mi Camino · Inscribirme` (`Inscribirme` L15). Cero `mi-progreso` / `Mi Progreso` en nav. Funnel vivo en `student-zone-routing.ts` (`mi-camino-demo`, `demo-clase-1..5`, `inscripcion-gate`→`/inscripcion`). Residual anotado: `completedCount=` en `PathDemoPage` (prop `DemoPathLevelBar`, no tab muerta). Residual `mi-progreso` solo en asserts de test (`path-demo-page.test.ts` espera `false`). **Browser no ejecutado.** |
| **V2** WS2 B+ Comunidad | **PASS** (código/docs) · **MANUAL PENDIENTE Juan** (browser) | Cero UI «Canción del mes» (único hit: comentario de negación en `mock-community-data.ts`). `MOCK_ADMIN_CURATED` / `MOCK_COMMUNITY_PEERS` / `MOCK_COMMUNITY_POSTS` vacíos. «Próximamente» honesto en paneles Comunidad. `D-COMM-BPLUS-001` en `DECISIONS.md` + flows/handoffs. `05-comunidad-resumen.md`: ausente `NO HABILITADO` / `header locked`. Narrativa «lanzada» solo como **NO LANZADA** / UI parcial ≠ lanzada. Residual anotado (juicio humano): URLs `example` dentro de `SAMPLE_COMMUNITY_POSTS` (fixture; **no** importado fuera de tests). **Browser suscriptor no ejecutado.** |
| **V3** WS3 docs 06/07 + cuarentena | **PASS** | `PROJECT_STATUS` 06/07 llevan nota «ausente en main; histórico en cuarentena … @ bf986db». `docs/features/` **no existe** (Route R; 06/07 no portados). Cuarentena: `git log -1` → `bf986db chore: checkpoint pre-formateo F7 cerrada`. `status --porcelain`: exactamente `M …/.env.example` (plantilla post-saneo). Solo log/status/lectura. |
| **V4** Suite / build / guards | **FAIL parcial → GAP** | `app:test`: **619/619** pass (exit 0; cifra vigente >617). `build`: **exit 0**. Guards focales lesson-runner / student-zone: **75/75** PASS (exit 0). `api:test`: **FAIL** — 297 tests · **206 pass / 18 fail / 64 cancelled / 9 skipped** (exit 1). Causa: entorno DB `FATAL: (ENOTFOUND) tenant/user postgres.… not found` (Prisma init). **No se corrigió.** Sin secretos en este informe. |

---

## 2. Estado final del brief (según commits en tip)

| Workstream | Estado | Commit / decisión |
|------------|--------|-------------------|
| WS1 demo nav | **DONE** | `e9e70ed` |
| WS2 Comunidad B+ | **DONE** | `2311295` · `D-COMM-BPLUS-001` |
| WS3 higiene 06/07 | **DONE** (06 R + 07 R) | `3928d1c` |
| T-FLOW-05 | **cerrado** (no-repro) | `6803f0e` |
| WS4 polish progreso | **INACTIVO** | requiere frase Juan |

**Declaración de misión:** **NO se declara «misión cerrada»** mientras V4 tenga FAIL/GAP (`api:test` entorno) y queden manuales browser pendientes. DoD de código WS1–WS3 en tip `3928d1c`: evidenciado en V0–V3.

---

## 3. Cola pendiente (todo requiere palabra de Juan)

1. **WS4** — polish UX progreso en Mi Estudio (frase tipo `OK WS4 polish progreso`).
2. **Commit opcional** del brief untracked `BRIEF-FABLE-MAX-ZONA-ESTUDIANTE-2026-08-02.md` (solo si Juan lo dice al dar `OK commit`).
3. **Commit de este informe** — frase `OK commit` (alcance = informe; brief solo si lo pide).
4. **Push** — solo con `OK push`.
5. **Flicker iPhone** — checklist; 2 devices de Juan.
6. **D-GOV-16 / T-REG-01** — decisión de Juan (cola secundaria).
7. **Padre `Proyectos/gmusic/` / Fase 3C** — ordenamiento; hilo aparte.
8. **Manual browser V1/V2** — demo nav 3 tabs + handlers; Comunidad suscriptor sin candado / vacío honesto.
9. **Re-run `api:test`** cuando DB local/Neon esté alcanzable (GAP V4).

---

## 4. GAPs (FAIL / hallazgos — sin fix)

| ID | Origen | Hallazgo | Acción Cursor |
|----|--------|----------|---------------|
| **GAP-V4-API** | V4 | `npm run api:test` exit 1; fallos/cancelaciones por DB `ENOTFOUND` tenant Postgres (entorno). Cifras: 206 pass / 18 fail / 64 cancelled / 9 skipped. | Reportado; **no arreglado**. |
| **GAP-MANUAL-V1** | V1 | Smoke browser demo nav no ejecutado en esta corrida. | `MANUAL PENDIENTE Juan`. |
| **GAP-MANUAL-V2** | V2 | Smoke browser Comunidad suscriptor no ejecutado. | `MANUAL PENDIENTE Juan`. |
| **NOTA-V1** | V1 | Grep `completedCount` en `PathDemoPage` (barra demo). | Anotado; no es tab «Mi Progreso». |
| **NOTA-V2** | V2 | `SAMPLE_COMMUNITY_POSTS` aún contiene URLs `example` (solo fixture de tests; `MOCK_COMMUNITY_POSTS=[]`). | Anotado para juicio humano. |
| **NOTA-DECISIONS** | docs | Fila `D-COMM-BPLUS-001` aún dice «sin commit hasta OK commit» pese a tip con `2311295` en main. | Anotado; no editado. |

---

## 5. Comandos V4 (referencia, sin secretos)

```text
cd "$APP"
npm run app:test     # → 619 pass / 0 fail
npm run api:test     # → FAIL entorno DB (ver GAP-V4-API)
npm run build        # → exit 0
node --import tsx --test \
  src/app/components/gmusic/lesson/lesson-runner-shell.test.ts \
  src/app/components/gmusic/lesson/lesson-runner-state.test.ts \
  src/app/components/gmusic/path/path-lesson-runner-open.test.ts \
  src/app/components/gmusic/student-zone-guard-admin.test.ts \
  src/app/components/gmusic/student-zone-guard.test.ts
# → 75 pass / 0 fail
```

Logs locales de corrida (fuera del repo): `/tmp/cierre-fable-max-2026-08-02/`.

---

## 6. Frases de control (STOP)

- **STOP** — sin `OK commit` no hay commit de este informe.
- Sin `OK push` no hay push.
- Alcance commit propuesto = **solo este informe** (salvo que Juan pida incluir el brief untracked).

**Mensaje de commit propuesto:**

```text
docs(ops): informe de cierre verificado del brief Zona Estudiante (DoD WS1-WS3 sobre 3928d1c)
```

---

## 7. DoD del runbook CIERRE-MISIÓN

- [x] V0–V4 ejecutados; evidencias registradas; cero cambios en `src/` / tests.
- [x] Informe creado (tabla, estado final, cola, GAPs).
- [x] FAILs como GAP, no corregidos.
- [x] Cuarentena intacta (solo log/status); cero secretos en informe.

*Fin del informe de cierre verificado.*

## Apéndice B — Evidencia browser PASS (2026-08-02)

V1 (demo nav) y V2 (Comunidad): **PASS ambos** — ejecutor **Cursor (evidencia de agente, no de Juan)**, entorno **smoke local @ a6c612b**. Corrección de método: el paso «sin login» del checklist original era inválido — anónimo en `/mi-camino-demo` redirige a `/registro-cuenta` por `DemoAuthGuard` (diseño, verificado local+Vercel). V1 con cuenta `registered_no_sub` creada al efecto: registro → onboarding → `/mi-camino-demo`; header exacto Inicio · Mi Camino · Inscribirme; handlers OK (Inscribirme → `/inscripcion`, gate); `/demo-clase-1` carga «Conoce tu guitarra» (1 de 5). V2 con Carlos marcado ACTIVE mediante **grant manual en la DB local de smoke** (prueba el estado UI de un ACTIVE; no prueba el flujo de otorgamiento): Comunidad abre sin candado; vacío honesto «Próximamente… No hay enlaces de demostración»; sin «Canción del mes» ni links `example`; sin narrativa «lanzada»; Mi Estudio muestra Progreso del módulo / XP y constancia. Observación benigna: el menú de zona real muestra Inicio · Mi Camino · Mi Estudio · Comunidad — el ítem Inicio no figura en la tabla del veredicto nav 2026-08-02 y no lo contradice (sin tab Mi Progreso, que era la exigencia). Con V0–V4, el GAP api:test resuelto (`a6c612b`) y esta evidencia, la misión del brief se declara **CERRADA en sentido Apéndice B**, con la salvedad explícita de que la evidencia browser es de agente en smoke, no humana en prod.
