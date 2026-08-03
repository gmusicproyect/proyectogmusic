# BRIEF Fable Max — Alineación IA navegación estudiante + demo + Comunidad + higiene docs

**Fecha:** 2026-08-02  
**Autor del brief:** agente Cursor (para Juan → pegar tal cual en Claude Fable Max)  
**Producto:** Academia GMusic · app `Página de cursos de música/`  
**Demo prod:** https://proyectogmusic.vercel.app  
**Copia en producto:** `Página de cursos de música/docs/operations/BRIEF-FABLE-MAX-ZONA-ESTUDIANTE-2026-08-02.md`  
**Regla madre:** maximizar avance **sin inventar cierres de producto** y **sin violar guards / DO_NOT_TOUCH**.

---

## 1. Rol de Fable Max

Sos **arquitecto + implementador disciplinado** de Gmusic Estudio.

- Idioma de trabajo y commits propuestos: **español**.
- Un **objetivo de misión** a la vez; dentro de ese objetivo podés abrir **oleadas internas** paralelizables (código / docs / tests) si no se cruzan ni rompen gobernanza.
- Preferís diffs mínimos, verificables, revertibles.
- Ante ambigüedad de producto: **dictamen + opciones A/B** para Juan; **cero implementación** hasta frase de control explícita.
- No sos un redactor de marketing: tono denso, preciso, operativo.
- No inventás tickets cerrados, decisiones aprobadas ni “ya está en prod” sin evidencia en repo/docs.

---

## 2. Fuentes de verdad — leer PRIMERO (en este orden)

### Ecosistema / mapa

| # | Path |
|---|------|
| 1 | `/Volumes/Juan lizama h/Academia GMusic/00-LEEME.md` |
| 2 | `Página de cursos de música/AGENTS.md` |
| 3 | `Página de cursos de música/CLAUDE.md` |
| 4 | `Página de cursos de música/.agents/PROJECT_STATUS.md` |
| 5 | `Página de cursos de música/.agents/MEMORY.md` |
| 6 | `Página de cursos de música/.agents/DECISIONS.md` |
| 7 | `Página de cursos de música/.agents/DO_NOT_TOUCH.md` |
| 8 | `Página de cursos de música/.agents/skills/gmusic-agent-workflow/SKILL.md` (si existe) |
| 9 | `Página de cursos de música/.agents/skills/gmusic-funnel-conversion/SKILL.md` |
| 10 | `Página de cursos de música/.agents/skills/gmusic-welcome/SKILL.md` |

### Flows / nav / comunidad / anti-demo

| # | Path |
|---|------|
| 11 | `docs/flows/00-mapa-maestro.md` |
| 12 | `docs/flows/01-funnel-auth-landing.md` |
| 13 | `docs/flows/02-mi-camino-suscriptor.md` |
| 14 | `docs/flows/05-comunidad-resumen.md` |
| 15 | `docs/flows/README.md` |
| 16 | `docs/vision/handoffs/2026-06-30-comunidad-mvp-handoff.md` |
| 17 | `docs/vision/referents/2026-06-15-yousician-perfil-progreso-estructura.md` (referente; **no** es contrato de nav actual) |
| 18 | `docs/operations/T-FLOW-05-gmusicpath-update-depth.md` |
| 19 | `docs/operations/t-flow-05-no-repro-estatico-2026-07-28.md` |
| 20 | `docs/operations/flicker-iphone-checklist.md` (cola secundaria) |
| 21 | `docs/architecture/D-GOV-16-registro-gratuito-liviano.md` (cola secundaria; **solo lectura**) |

### Código de nav / routing (inspección obligatoria antes de editar)

| # | Path |
|---|------|
| 22 | `src/app/components/gmusic/GmusicInternalHeader.tsx` — **zona real (suscriptor)** |
| 23 | `src/app/components/gmusic/DemoAcademyNav.tsx` — **demo funnel** |
| 24 | `src/app/pages/PathDemoPage.tsx` — handlers tabs demo |
| 25 | `src/app/pages/GmusicWelcome.tsx` — Mi Estudio (progreso vive aquí) |
| 26 | `src/app/utils/student-zone-routing.ts` (+ `student-zone-routing.test.ts`) |
| 27 | `src/app/App.tsx` — solo con scope explícito |
| 28 | `src/app/components/gmusic/gmusic-internal-header.test.ts` |
| 29 | `src/app/pages/path-demo-page.test.ts` |

**Nota shell:** la carpeta de la app tiene **acentos** (`Página de cursos de música`). En zsh/bash: **siempre comillas** en paths.

---

## 3. Estado del repo / qué NO reabrir (verificado 2026-08-02)

### Ecosistema

- Academia: `/Volumes/Juan lizama h/Academia GMusic/`
- Canónico producto: `…/01-Producto/proyectogmusic/`
- Tip local `main` (2026-08-02): incluye `6803f0e` (*docs(ops): anotar no-repro runtime T-FLOW-05*) **ahead of origin**; tip producto oleadas A–E `eb8605e` + ese commit docs.
- App: `Página de cursos de música/`
- Smoke local típico: `scripts/dev/start-smoke-local.sh` dentro de la app; login alumno de prueba `carlos@gmusic.academy` (password solo en `.env` local — **NO pegar secrets en diffs, commits, ni respuestas**).

### Ordenamiento / fuera de plan

- **4C–4C CERRADA** (ordenamiento carpetas Academia).
- **3C no autorizada.**
- **Jarvis / D-07 fuera de plan** de esta misión.
- **Oleada F:** no abrir sin pedido explícito de Juan.

### T-FLOW-05

- **CERRADO** — no-repro runtime **2026-08-02** (snippet v2 aria-label; sin Maximum update depth).
- **NO aplicar** fix PathCarouselCards / no “arreglar” GmusicPath por este ticket.
- Evidencia: `docs/operations/T-FLOW-05-gmusicpath-update-depth.md` + nota no-repro estático.

### Veredicto nav (crítico — no contradecir)

**Zona real (suscriptor) YA alineada** con lo decidido:

| Tab | Destino |
|-----|---------|
| Mi Camino | `/mi-camino` (`page` mi-camino) |
| Mi Estudio | `/alumno` / flujo mi-estudio (`GmusicWelcome`) |
| Comunidad | `page: "community"` (URL a veces `/` según routing; no inventar URL nueva sin scope) |

- **NO** hay tab **Mi Progreso** en zona real; el progreso del alumno vive **dentro de Mi Estudio** (`GmusicWelcome`).
- **D-F6-ANTI-DEMO-001** = zona real **sin mocks de demo** en el camino suscriptor. **NO** significa matar el funnel demo.

**Demo funnel SIGUE VIVO por diseño** (D-GOV-02/03, Track A):

- Rutas: `/mi-camino-demo`, `/demo-clase-1..5`, `/inscripcion`
- `DemoAcademyNav` hoy tiene **4 tabs:** Inicio · Mi Camino · Mi Estudio · Mi Progreso
- **Gap A:** tab **Mi Progreso** muerto — en `PathDemoPage.handleTabChange` el case `mi-progreso` **no hace nada** (solo `inicio` → home y `mi-estudio` → `inscripcion-gate`).
- **Gap B:** label **Mi Estudio** en demo = CTA a `inscripcion-gate` con **copy engañoso** (parece dashboard; en realidad es upsell/gate). Hay que **ser honesto en copy/CTA** sin romper el funnel D-GOV.

**Comunidad — gap docs ↔ código (requiere DECISIÓN Juan):**

- Docs (`flows/05`, handoff F8/T-MVP-COMMUNITY, narrativa “header locked / NO HABILITADO”): nav bloqueada hasta feed real / producto no lanzado.
- Código `main` actual: tab Comunidad **desbloqueada** desde ~30 Jun (`GmusicInternalHeader` → `page: "community"`; tests afirman “sin candado”); UI parcial + mocks residuales.
- **Fable NO elige solo.** Debe preparar dictamen A vs B (WS2) y **esperar frase de control**.

**Docs features 06/07:**

- Existen en rama wip `trabajo/wip-2026-07-18` @ `bf986db` (ahora en **cuarentena**), **NO en `main`**.
- `PROJECT_STATUS.md` referencia paths `docs/features/06-mi-camino.md` y `docs/features/07-mi-progreso.md` que **están ausentes** en working tree de main.
- WS3: portar desde cuarentena/bundle **o** corregir referencias — **sin secretos**; leer solo docs.

### Tracks en cola (secundarios — NO mezclar en el mismo PR sin OK Juan)

| Track | Estado | Acción en esta misión |
|-------|--------|------------------------|
| Flicker iPhone | `docs/operations/flicker-iphone-checklist.md` | No fix a ciegas; Juan 2 devices |
| D-GOV-16 / T-REG-01 | Propuesta registro liviano; **bloqueado** | Solo decisión Juan; no implementar |
| T-MVP-PROGRESS completo | Cola MVP | Fuera de scope salvo WS4 **opcional** y acotado |

---

## 4. Objetivo principal de esta misión

**Alineación IA de navegación estudiante + demo + Comunidad + higiene docs.**

Traducción operativa:

1. Demo nav coherente y honesta (sin tab muerto; sin mentir “Mi Estudio”).
2. Dictamen + (solo tras OK) implementación Comunidad A o B.
3. Higiene docs features 06/07 / referencias `PROJECT_STATUS` rotas.
4. Opcional: polish UX progreso en Mi Estudio **sin** inventar cierre T-MVP-PROGRESS.

**Éxito de misión ≠ “rediseñar la academia”.** Éxito = gaps nav/docs cerrados o explícitamente deferidos con decisión de Juan.

---

## 5. Workstreams (DoD obligatorio)

### WS1 — DemoAcademyNav: matar Mi Progreso muerto + copy honesto CTA

**Problema verificado**

- `DemoAcademyNav.tsx`: 4 tabs incluyendo `mi-progreso` + badge `completedCount/5`.
- `PathDemoPage.tsx` `handleTabChange`: ignora `mi-progreso` y `mi-camino`; `mi-estudio` → `inscripcion-gate`.

**Alcance permitido**

- Quitar tab **Mi Progreso** del demo nav **o** cablearlo solo si Juan pide explícitamente un destino demo real (default de esta misión: **eliminar** el tab muerto).
- Renombrar / retarget copy del tab que hoy dice “Mi Estudio” para que el alumno entienda que es **CTA de inscripción / acceso**, no el dashboard suscriptor.
- Mantener funnel: Inicio → home; camino demo; gate `/inscripcion`; D-GOV-02/03 intactos.
- Actualizar tests de `path-demo-page` / cualquier assert de 4 tabs.

**DoD WS1**

- [ ] No existe tab clickeable sin handler (cero dead ends en nav demo).
- [ ] Copy del CTA upsell **no** se confunde con Mi Estudio real del suscriptor.
- [ ] Rutas `/mi-camino-demo`, `/demo-clase-1..5`, `/inscripcion` siguen resolviendo.
- [ ] Tests tocados/agregados verdes; guards PASS.
- [ ] Diff acotado a demo nav + PathDemoPage (+ tests); **sin** tocar `GmusicPath` / zona real salvo typo docs.

**Fuera de WS1:** rediseño visual completo del path demo; matar funnel; unificar DemoAcademyNav con GmusicInternalHeader.

---

### WS2 — Decisión Comunidad (dictamen A vs B → implementar SOLO con frase OK)

**Preparar para Juan (sin merge de producto hasta OK):**

| Opción | Significado | Efecto código/docs |
|--------|------------|--------------------|
| **A** | Bloquear hasta feed real | Re-lock tab Comunidad (modal/candado) alineado a `flows/05` / T-MVP-COMMUNITY; docs quedan coherentes |
| **B** | Formalizar abierta + corregir docs | Mantener tab abierta; actualizar `flows/05`, README flows, PROJECT_STATUS, handoffs para reflejar “UI parcial habilitada en nav ≠ producto lanzado”; aclarar mocks residuales |

**DoD dictamen (antes de código)**

- [ ] 1 página corta: evidencia docs vs código (paths + commits/fechas conocidas).
- [ ] Riesgos A (fricción alumno / deuda “candado otra vez”) y B (expectativa de feed real / mocks).
- [ ] Recomendación técnica **opcional** de Fable, marcada como no-decisión.
- [ ] Pregunta binaria a Juan con frases de control (§9).

**DoD implementación (solo tras frase OK)**

- [ ] Código + docs + tests alineados a la opción elegida.
- [ ] No declarar “Comunidad LANZADA” si feed/moderación siguen parciales.
- [ ] No tocar entitlements/`communityAccess` backend sin scope explícito adicional.

---

### WS3 — Higiene docs features 06/07

**Problema:** `PROJECT_STATUS` apunta a `docs/features/06-mi-camino.md` y `07-mi-progreso.md` ausentes en main; contenido histórico en cuarentena `trabajo/wip-2026-07-18` @ `bf986db`.

**Alcance**

- Portar **solo docs** (sin secretos, sin `.env`, sin dumps) desde cuarentena/bundle **o**
- Corregir referencias en `PROJECT_STATUS` / índice flows para no mentir paths, con nota “ausente en main / ver cuarentena”.

**DoD WS3**

- [ ] Ninguna referencia canónica en docs activos apunta a path inexistente sin nota.
- [ ] Si se portan 06/07: revisar que no contradigan veredicto nav 2026-08-02 (zona real **sin** tab Mi Progreso).
- [ ] Diff solo docs (o docs + índice); cero lógica de runtime.
- [ ] No exfiltrar secrets de la rama/cuarentena.

---

### WS4 — (Opcional) Polish UX progreso en Mi Estudio

**Solo si Juan aprueba en el mismo hilo** (frase tipo “OK WS4 polish progreso”).

- Mejoras cosméticas/claridad de progreso **dentro** de `GmusicWelcome` (jerarquía, a11y, copy).
- **No** inventar ticket T-MVP-PROGRESS completo, ni tab Mi Progreso en zona real, ni rediseño total (DO_NOT_TOUCH lista GmusicWelcome como zona estable — requiere OK explícito).

**DoD WS4**

- [ ] Frase OK de Juan citada en el plan.
- [ ] Diff mínimo; tests a11y/regresión si aplica.
- [ ] Zona real sigue sin tab Mi Progreso.

---

## 6. Prohibiciones duras

1. **No debilitar lexical guards** ni bypass de StudentZoneGuard / auth.
2. **No editar zonas DO_NOT_TOUCH** sin OK explícito Juan/Fable CTO (`GmusicPath`, auth real, Prisma, pagos, skills agente, tokens globales, MEMORY.md, etc.).
3. **No commit / no push** sin frases `OK commit` / `OK push`.
4. **No Fase 3C.** No reabrir 4C–4C. No Jarvis/D-07.
5. **No Oleada F** sin pedido.
6. **No fix T-FLOW-05** / no PathCarouselCards “por las dudas”.
7. **No tocar core GmusicPath** (D-028 / Track A: path suscriptor no se rediseña aquí).
8. **No romper routing funnel** D-GOV-02/03 (`student-zone-routing`, URLs demo, `inscripcion` sin inventar `inscripcion-registro` público).
9. **No pegar secrets** (passwords, tokens, cookies, `.env`) en brief, PR, commit, chat.
10. **No matar demo funnel** en nombre de anti-demo (D-F6-ANTI-DEMO-001 ≠ delete demo).
11. **No mezclar** flicker iPhone, D-GOV-16/T-REG-01, pagos, Next.js, rename app folder, en el mismo PR sin OK.
12. **No inventar** cierre T-MVP-COMMUNITY / T-MVP-PROGRESS / “Comunidad lanzada”.
13. **No modificar tests verdes** para hacer pasar un cambio malo — solo ajustar asserts que reflejen el nuevo contrato, o agregar tests nuevos.
14. **No** `git push --force`, amend de commits ajenos, ni editar git config.

---

## 7. Criterios de calidad — “dejar la página al máximo” (dentro del scope)

- **a11y básica tabs:** roles/labels coherentes; foco visible; no botones decorativos sin acción.
- **Copy coherente** zona real vs demo: vocabulario distinto cuando el destino es distinto.
- **Mobile:** nav usable en viewport angosto; sin overflow absurdo del sticky nav demo.
- **No cards de más en hero**; respetar atmósfera/tokens existentes (`GM_*`, gold `#C9A84C` en demo) — sin rediseño púrpura/cream genérico.
- **Tests nuevos** si el contrato de nav cambia; suite **617+ verdes** (o la cifra vigente del repo al correr); **guards PASS**.
- Smoke: `scripts/dev/start-smoke-local.sh` + recorrido manual demo → gate; suscriptor Mi Camino / Mi Estudio / Comunidad según decisión WS2.
- Docs del cambio: actualizar solo lo necesario (flows/status), sin essays.

---

## 8. Protocolo de entrega a Juan

1. **Plan corto** (≤15 líneas): WS activos, archivos, riesgos, qué espera de Juan.
2. **Diffs** por workstream (no un megapatch opaco).
3. **Tests** corridos + resultado (número pass/fail); guards.
4. **Mensaje de commit propuesto** (español, 1–2 frases “por qué”).
5. **Esperar** `OK commit` → commit; luego `OK push` → push. Sin esas frases: **stop**.
6. Si hace falta decisión Comunidad: **parar en dictamen** hasta frase §9.

---

## 9. Frases de control (Fable debe respetar literalmente)

| Frase de Juan | Efecto |
|---------------|--------|
| `OK Comunidad: bloquear hasta feed` | Autoriza implementar **opción A** (WS2) |
| `OK Comunidad: formalizar abierta` | Autoriza implementar **opción B** (WS2) |
| `OK WS4 polish progreso` | Autoriza WS4 acotado en GmusicWelcome |
| `OK WS1` / `OK demo nav` | Autoriza implementar WS1 si aún no lo hizo tras el plan |
| `OK commit` | Autoriza crear commit(s) del scope acordado |
| `OK push` | Autoriza push al remote |
| `STOP` / `solo dictamen` | Congela código; solo análisis/docs de decisión |

Cualquier otra redacción ambigua → **pedir confirmación**; no asumir.

---

## 10. Prompt de arranque (1 párrafo — Juan pega esto a Fable)

> Leé el brief `BRIEF-FABLE-MAX-ZONA-ESTUDIANTE-2026-08-02.md` (copia en `99-Reportes` y en `docs/operations`) y las fuentes de verdad de la §2. Misión: alineación IA navegación estudiante + demo + Comunidad + higiene docs. Empezá por WS1 (DemoAcademyNav: eliminar Mi Progreso muerto + copy honesto del CTA a inscripción sin romper D-GOV-02/03) y en paralelo prepará el dictamen Comunidad A vs B (§5 WS2) sin implementar hasta mi frase de control. WS3: higiene docs 06/07 o referencias PROJECT_STATUS. No toques T-FLOW-05, GmusicPath, 3C, Oleada F, D-GOV-16, ni hagas commit/push sin `OK commit`/`OK push`. Primero devolvé plan corto + evidencia del gap demo nav.

---

## Apéndice A — Mapa mental rápido (no sustituye fuentes)

```text
SUSCRIPTOR (GmusicInternalHeader)
  Mi Camino  → /mi-camino
  Mi Estudio → dashboard (progreso AQUÍ)
  Comunidad  → community  ⚠ docs dicen locked; código open → DECISIÓN

DEMO (DemoAcademyNav) — funnel vivo
  Inicio     → home
  Mi Camino  → (activo en PathDemoPage; path demo)
  Mi Estudio → hoy: inscripcion-gate  ⚠ copy engañoso → WS1
  Mi Progreso→ MUERTO                 → WS1 eliminar
```

## Apéndice B — Checklist anti-alucinación

Antes de afirmar “cerrado / aprobado / en main”:

1. ¿Está en `PROJECT_STATUS` **y** el path existe?
2. ¿Hay decisión en `DECISIONS.md` con estado ≠ “propuesta”?
3. ¿El código en `main` coincide (grep + test)?
4. Si no: marcar **NO DETERMINADO** o **GAP** — no inventar cierre.

---

**Fin del brief.** Ejecutar con disciplina. Maximizar avance en WS1+dictamen; el resto solo con frases de control.
