# Instrucción Fase 1 — Definir y planear (MVP)

> **Audiencia:** Cursor (ejecutor) + Juan (aprobador).  
> **Tipo:** brief ejecutable de producto — **no** es el MVP final.  
> **Duración poster Fase 1:** ~1 semana (solo documentación).  
> **Estado de esta instrucción:** lista · **ejecución Fase 1 AUTORIZADA** 2026-07-14 (Juan vía supervisor GPT · decisiones A–D · D-ROAD-005).  
> **Validación arquitecto:** `fase-1-validacion-arquitecto.md` → **APROBADA** (ajustes menores abajo aplicados).

---

## Propósito de esta instrucción

Esta instrucción es el **contrato de trabajo** para producir el documento de producto:

`docs/product/01-mvp-gmusic.md`

| Es | No es |
|----|--------|
| Una guía profunda, sin ambigüedad, para redactar el MVP | El MVP en sí |
| Un mapa de qué validar con Juan vs qué ya está decidido | Código, schema, UI o tickets de implementación |
| La plantilla exacta que el doc MVP debe rellenar | Un plan de Track B / Next / Stripe |
| El puente entre inventario real (`00`) y alcance escrito | Autorización para empezar Fase 2+ |

**Regla de oro:** el MVP escrito debe describir el producto que **lanzamos a usuarios reales**, contrastado con lo que el inventario dice que **ya existe**, **está parcial**, **está simulado** o **no existe**. No reinventar el repo.

---

## Prerrequisitos

Antes de que el ejecutor redacte `01-mvp-gmusic.md`, deben cumplirse:

| # | Prerrequisito | Estado (al escribir esta instrucción) |
|---|---------------|----------------------------------------|
| 1 | Inventario cerrado: `docs/project-status/00-inventario-actual.md` | ✅ Doc entregado · pendiente OK formal Juan |
| 2 | Estructura 10 fases canónica (D-ROAD-003) en `roadmap-general.md` | ✅ |
| 3 | Esta instrucción leída y aceptada como método | ✅ creada · pendiente aceptación Juan |
| 4 | **OK Juan para iniciar Fase 1** (gate explícito: “OK / SÍ, escribe el MVP”) | ✅ **2026-07-14** — paquete supervisor GPT + decisiones A–D |

Punto 4 cumplido. Redactar `01-mvp-gmusic.md` aplicando A–D (ver D-ROAD-005). Sin A–D / sin OK: **congelar**.

---

## Objetivo de la Fase 1

Definir por escrito, en un solo documento denso y accionable:

1. **Visión** del MVP Track A (qué problema resuelve y para quién).
2. **Alcance MVP** (MUST / SHOULD / WON'T) anclado al estado real del repo.
3. **Usuario principal** y **recorrido principal** (happy path verificable).
4. **Condiciones de lanzamiento** (definition of done de producto).
5. **Roadmap detallado** de post-MVP inmediato: qué queda en Fases 2–10 del diagrama y qué entra en colas T-*.

**Entregable único de código/docs de producto:** `docs/product/01-mvp-gmusic.md`  
**Entregables de control:** actualizar `etapa-actual.md`, `changelog.md`, ítems de `backlog.md` derivados del MVP (al cierre).

---

## Por qué es prioritaria ahora

- El repo **ya tiene** funnel demo, auth JWT, zona alumno, admin creador y bridge WhatsApp. Sin MVP escrito, agentes y humanos pelean entre “auth pausada” (docs) vs “JWT shipped” (código), y entre colas T-PUB / T-UX-LESSON vs protocolo de fases.
- Lanzar sin definición de MUST genera **feature creep** (Elvis, CourseLit, Stripe, email verify, Track B).
- El inventario (Fase 0) ya clasificó superficies; Fase 1 convierte esa verdad en **decisiones de producto** y criterios de lanzamiento.
- Poster: 1 semana de enfoque ENFOCAR antes de CONSTRUIR más.

---

## Entradas (fuentes de verdad)

Leer en este orden. Extraer solo lo indicado. **No** inventar cifras ni estados.

| Path | Qué extraer |
|------|-------------|
| `docs/project-status/00-inventario-actual.md` | Clasificaciones completa/parcial/simulada/inexistente; gaps (Mi Progreso, email verify, pagos); order §13; riesgos B1–B7 |
| `docs/roadmap/roadmap-general.md` | Fases 1–10; equivalencia protocolo 0–15; duración poster |
| `docs/roadmap/etapa-actual.md` | Gate de OK Juan; qué está fuera de alcance ahora |
| `docs/roadmap/decisiones.md` | D-ROAD-001…004; no contradecir D-ROAD-003 |
| `docs/roadmap/backlog.md` | T-PUB-01, T-UX-LESSON-01, R-OPS-01, INC-admin-cred → mapear IN/OUT/post-MVP |
| `.agents/PROJECT_STATUS.md` | Colas operativas, smoke prod, desbloqueo WhatsApp, tests reales |
| `.agents/DECISIONS.md` | D-005/D-006 (auth/pagos gated), D-007 (solo guitarra), D-017 (Subscription ACTIVE), D-024/D-025/D-027 (WhatsApp + Mercado Pago north star), D-GOV-02/03/05/06/11/15 (funnel) |
| `AGENTS.md` (mapa rutas) | URLs autorizadas; cruzar con inventario (docs desfasados → **gana el inventario + código**) |
| `docs/architecture/gmusic-architecture-working-map.md` | Solo si hace falta anclar dominio; no reabrir R-001/R-002 |
| Diagrama Fase 1 (poster) | Objetivos: alcance, audiencia, valor, priorizar módulos; entregables: visión, alcance, roadmap |

**Conflicto docs vs código:** el MVP debe citar la contradicción y proponer resolución (pregunta a Juan), no silenciarla.

---

## Salida única

Crear **solo tras OK Juan**:

`docs/product/01-mvp-gmusic.md`

### Outline EXACTO (plantilla a rellenar — no dejar secciones vacías sin “N/A justificado”)

```markdown
# 01 — MVP GMusic (Track A)

## 0. Metadatos
- Fecha · autor · versión · estado (borrador / aprobado Juan)
- SHA / inventario de referencia (`00-inventario-actual.md` fecha)
- Track: A (Vite+React+Express+Prisma) — explícito

## 1. Visión (≤8 líneas)
Qué es GMusic MVP en una frase + promesa al alumno + qué deja fuera a propósito.

## 2. Problema y propuesta de valor
- Problema del alumno
- Solución entregada en el MVP
- Diferenciador (metodología Fundamento→Técnica→Crea + demo + camino gamificado)

## 3. Usuario principal
- Perfil (quién)
- Contexto (dónde / canal: Chile, WhatsApp, etc.)
- Jobs-to-be-done (2–4)
- No-usuario del MVP (quién queda fuera)

## 4. Recorrido principal (happy path)
Diagrama textual paso a paso + tabla:
| Paso | Página/URL | Ya existe? (completa/parcial/simulada/inexistente) | Gap MVP |
Referencia mínima de flujo inventario §12.

## 5. Matriz MUST / SHOULD / WON'T
Tabla por módulo (ver sección Matriz de esta instrucción).  
Cada MUST con criterio verificable en §7.

## 6. Alcance por superficie (detalle)
Subsecciones cortas: Landing · Academia/onboarding · Demo · Auth · Mi Estudio · Mi Camino · Lección · Mi Progreso · Comunidad · Planes/pagos · Admin · Responsive.

## 7. Criterios de lanzamiento MVP (DoD producto)
Checklist numerado verificable (manual + smoke + ops).

## 8. Fuera de alcance explícito
Lista WON'T + por qué + cuándo reabrir.

## 9. Decisiones resueltas en Fase 1
Tabla: decisión · opción elegida · fecha Juan.

## 10. Roadmap post-MVP inmediato
Mapeo MUST residual / SHOULD → Fases 2–10 + tickets T-* / ops (sin implementar).

## 11. Riesgos y dependencias
B1–B7 del inventario + condiciones WhatsApp / ops.

## 12. Aprobación
Casilla: Juan aprueba MVP · fecha · restricciones.
```

**Densidad:** 1–2 páginas equivalentes densas (puede ser más largo si las tablas lo exigen; **no** ensayo). Cero vaguedades (“mejorar UX”, “comunidad más rica”) sin criterio.

---

## Usuario principal del MVP

### Hipótesis de trabajo (a confirmar / ajustar con Juan)

| Atributo | Hipótesis | Origen | Pedir a Juan? |
|----------|-----------|--------|---------------|
| Instrumento | Guitarra (única activa) | D-007 ✅ | No — no reabrir |
| Etapa | Principiante / Fundamento básico (demo Conc→Canción) | Funnel publicado | Confirmar si MVP también apunta a “ya toca algo” |
| Geografía | Chile (CLP, WhatsApp `+569…`) | Planes + D-024 | Confirmar exclusividad Chile vs extranjero soft |
| Canal de conversión | WhatsApp humano post-gate | D-024, D-027 | Confirmar sigue siendo único cierre de pago |
| Edad / perfil | Persona que quiere aprender en casa, no academia ERP | Inventario / visión | Confirmar rango (¿incluye apoderados? schema tiene GuardianLink latente) |
| Estado técnico | Quiere probar 5 clases gratis → pagar semestre | Funnel | Confirmar |

### Ya decidido (no repreguntar salvo cambio explícito)

- Solo **Guitarra** en MVP (D-007).
- Demo = **5 clases** + teaser bloqueado (D-003 / D-GOV-06).
- Acceso zona alumno = sesión autenticada + **Subscription ACTIVE** (D-017).
- Conversión comercial MVP = **WhatsApp bridge**, no pasarela (D-024 / D-027 north star diferido).
- Track A stack; no Track B en MVP.

### Preguntas abiertas (usuario)

Ver sección **Decisiones que DEBEN resolverse** (ítems U1–U3).

---

## Recorrido principal (happy path) a documentar

Mapear en el MVP este journey (ajustar copy; no inventar URLs fuera de AGENTS + inventario):

```text
# Núcleo educativo (contrato happy path MVP — D-ROAD-005)
Registro → login → Academia (/onboarding-academia) → curso/ruta → lección
  → consume → completa → progreso persistido → sabe qué estudiar después
  (+ Mi Progreso mínimo · Comunidad feed real si está en nav)

# Adquisición / conversión (acompañan; no reemplazan el núcleo)
Landing (/)
  → Crear acceso / registro (D-GOV-11)
  → [Quiz temperamento opcional según reglas vigentes]
  → Onboarding Academia (/onboarding-academia)  // #academia = CTA landing, no wizard
  → Mi Camino Demo (/mi-camino-demo) + 5 clases (/demo-clase-*)
  → Inscripción gate (/inscripcion) → WhatsApp BRIDGE
  → [Ops humano] Subscription ACTIVE → zona alumno
```

### Existente vs gap (desde inventario §6)

| Tramo | Estado repo | Implicación MVP |
|-------|-------------|-----------------|
| Landing Visual A | completa | MUST IN |
| Registro/login JWT | parcial (sin email verify) | **IN** auth liviana (A); email verify **WON'T** |
| Quiz / onboarding Academia | completa (`/onboarding-academia`) | MUST IN — canónica URL dedicada; `#academia` = marketing CTA |
| Funnel demo 5 clases | completa | MUST IN |
| Gate + WhatsApp | completa (bridge) / pago simulada | MUST IN como BRIDGE; pasarela OUT |
| Protección zona alumno | completa | MUST IN |
| Mi Estudio | parcial | MUST IN (usable) · UX evolución SHOULD/post |
| Mi Camino suscriptor | parcial | MUST IN con umbral de contenido (ligado a T-PUB-01) |
| LessonRunner / práctica | parcial | **MUST** T-UX-LESSON-01 si afecta consumo correcto (D) |
| Mi Progreso (página) | inexistente | **MUST** página mínima (B) — ver IN/OUT en D-ROAD-005 |
| Comunidad alumno | parcial (mocks peers) | **IN** feed real básico (C); mocks ≠ contrato launch |
| Admin publicación | parcial | BRIDGE ops: Juan publica; T-PUB-01 = cierre de pipeline |
| Responsive | no auditado en §6 como fila explícita | MUST: criterios mobile en DoD |

El doc MVP debe dibujar el happy path **una sola vez** y marcar cada nodo con etiqueta de inventario.

---

## Matriz MUST / SHOULD / WON'T (MVP)

Propuesta del ejecutor para el primer borrador (Juan confirma/altera).  
**BRIDGE** = aceptable en lanzamiento con mock/humana/WhatsApp/localStorage controlado.

| Módulo (fases 4–9 + landing/admin) | Estado en repo | Decisión MVP propuesta | Justificación |
|-----------------------------------|----------------|------------------------|---------------|
| **Auth** — registro/login/sesión | parcial | **MUST IN** (JWT liviana) / email verify **WON'T** | Decisión **A** · D-ROAD-005 |
| **Roles / control acceso** | completa (ACTIVE) | **MUST IN** | D-017 — sin sub no hay alumno; ops manual OK |
| **Roles avanzados** | parcial | **SHOULD** | Decisión A |
| **Recuperación password** | — | **SHOULD** o **BRIDGE** documentado | Decisión A |
| **Landing + planes marketing** | completa | **MUST IN** | Embudaje y precios visibles; cobro no automático |
| **Academia / onboarding 2 pasos** | completa (`/onboarding-academia`) | **MUST IN** | Solo Guitarra (D-007); no wizard `#academia` |
| **Cursos / módulos / lecciones (catálogo publicado)** | parcial | **MUST IN** + **T-PUB-01 MUST** si afecta disponibilidad | Decisión D |
| **Demo funnel** | completa | **MUST IN** | Adquisición; acompaña al núcleo educativo |
| **Reproducción / consumo lección** | parcial | **MUST IN** · **T-UX-LESSON-01 MUST** si afecta consumo correcto | Decisión D |
| **Progreso por lección** | parcial (demo LS + BD suscriptor) | **MUST IN** | Persistir avance en happy path |
| **Mi Camino (suscriptor)** | parcial | **MUST IN** | Promesa post-activación |
| **Mi Estudio** | parcial | **MUST IN** | Home alumno |
| **Mi Progreso (superficie dedicada)** | inexistente | **MUST IN** (mínimo B) | Lecciones/%/ruta/siguiente; rachas avanzadas OUT |
| **Comunidad alumno** | parcial | **MUST IN** feed real reducido (C) | Mocks solo dev/demo; no contrato launch |
| **Comunidad landing** | completa | **MUST IN** | Marketing |
| **Pagos / suscripción automática** | simulada | **BRIDGE** WhatsApp + alta ACTIVE · Stripe **WON'T** | Decisiones D / D-024/D-027 |
| **Admin creador** | parcial | **MUST IN** (Juan) + P0 ops | Credencial insegura / Prisma rotos = bloqueo launch |
| **Responsive** | implícito / deuda | **MUST IN** | Criterio mobile en DoD |
| **Email verification** | inexistente | **WON'T** | Decisión A |
| **Track B / Next / Sanity** | inexistente producto | **WON'T** | Dual-track · D |
| **Elvis ERP / familias UI** | inexistente | **WON'T** | GuardianLink latente no cuenta |
| **CourseLit clone / LMS creator full** | análisis only | **WON'T** | Referencia, no producto |
| **AlphaTab / MIDI / audio AI** | no MVP | **WON'T** | D-GOV-07 no autorizado |
| **Legacy checkout/catálogo** | simulada/legacy | **WON'T** (ocultar/ignorar) | No parte del happy path |
| **DM / chat realtime / notificaciones complejas** | — | **WON'T** | Decisión C |

---

## Criterios de lanzamiento MVP (definition of done producto)

Checklist verificable para §7 del doc MVP (ajustar tras respuestas Juan):

1. **Happy path E2E manual** documentado y ejecutado 1 vez en prod o staging equivalente: registro → demo 5/5 → gate → WhatsApp (o simulación ops) → sub ACTIVE → login → `/alumno` → `/mi-camino` → abrir ≥1 lección publicada.
2. **Auth:** registro + login + logout funcionan; sesión cookie; sin exigir email verify si OUT.
3. **Acceso:** usuario sin `Subscription ACTIVE` no entra a zona alumno (comportamiento D-017).
4. **Demo:** 5 clases jugables; teaser 6–15 bloqueado según D-GOV-05/06; URLs funnel rewrites OK (smoke ya existió 2 Jul — revalidar si deploy cambió).
5. **Contenido suscriptor:** ≥ **N bloques/etapas** publicados vía admin visibles en Mi Camino (definir N con Juan; default propuesto N=1 bloque completo de 5 etapas = T-PUB-01).
6. **Progreso lección:** completar ejercicio/sesión incrementa progreso observable (demo y/o suscriptor según alcance).
7. **Conversión:** CTA WhatsApp correcto (`wa.me` + número canónico); analytics de funnel no rompe el flujo.
8. **Responsive:** happy path usable en viewport móvil principal (definir breakpoint, p.ej. 390×844) sin bloqueos P0.
9. **Ops seguridad:** INC credencial admin resuelta **o** explícitamente aceptada por Juan como riesgo residual documentado.
10. **Verify:** `npm run verify` verde en el SHA de lanzamiento (cifra real del repo, no hardcode histórico).
11. **OUT documentado:** email verify · Stripe · Track B · Comunidad avanzada · rachas/logros sofisticados — según A–D.  
12. **IN documentado:** Mi Progreso mínimo · Comunidad feed básica · auth JWT liviana.  
13. **Juan firma** §12 del MVP doc.

No usar criterios vagos (“comunidad atractiva”, “buen feeling”).

---

## Fuera de alcance explícito

En Fase 1 (definición) y en el MVP lanzable, **fuera** salvo decisión nueva de Juan:

| Ítem | Por qué |
|------|---------|
| Track B (Next + Sanity + Railway + Cloudflare Stream) | Dual-track; no mezclar |
| Stack del cartel (NextAuth, Stripe, Discourse, Docker como obligación) | D-ROAD-003 referencia ≠ adopción |
| Elvis ERP / periodos / familias UI | Análisis only; `GuardianLink` ≠ producto |
| CourseLit clone / LMS marketplace | Análisis only |
| Pasarela Stripe / Mercado Pago implementación | D-027 diferido a 1ª conversión WhatsApp |
| Email verification + Resend flow completo | Inexistente; D-005/D-006 tensión — OUT por defecto hasta Juan diga IN |
| React Router global / R-001 / R-002 mitigación | Sin fase arquitectura aprobada |
| Rediseño Visual D / hero assets sin autorización | Visual A baseline |
| Currículo completo 6–75 jugable | Teaser comercial; contenido real vía admin por bloques |
| AlphaTab / reconocimiento audio | D-GOV-07 no aprobado para implementar |
| Investigación repos externos | No es trabajo de Fase 1 |

---

## Decisiones de Fase 1 — **RESUELTAS** (D-ROAD-005 · 2026-07-14)

Fuente: autorización Juan vía supervisor GPT. Detalle canónico en `docs/roadmap/decisiones.md` → **D-ROAD-005** y matriz del MVP.

| # | Tema | Resolución |
|---|------|------------|
| 1 | Auth JWT vs “pausada” | **A** — JWT liviana **IN**; email verify **WON’T**; docs “pausada” = desfasados |
| 2 | Alta suscripción | **BRIDGE** WhatsApp + ops/admin concede `ACTIVE` (sin pasarela); Stripe **WON’T** |
| 3 | Mi Progreso | **MUST** página mínima (IN/OUT de decisión B) |
| 4 | Comunidad alumno | **IN** feed real básico; mocks solo dev/demo; OUT social avanzado (C) |
| 5 | T-UX-LESSON-01 | **MUST** si afecta consumo correcto de lección (D) |
| 6 | T-PUB-01 | **MUST** si afecta publicación/disponibilidad real (D) |
| 7 | Usuario | Adulto/principiante guitarra Chile (hipótesis); apoderados/Elvis **WON’T** UI |
| 8 | “Lanzado” | Happy path alumno real + DoD §7; conversión WhatsApp BRIDGE; soft-launch aceptable si DoD verde |
| 9 | Ops P0 | Credencial admin insegura = **P0 bloqueo**; Prisma pérdida/corrupción/imposibilidad persistir = **P0 bloqueo**; ops no críticos = launch OK con riesgo documentado |

---

## Decisiones que NO se reabren en Fase 1

Lista corta — no debatir en el MVP doc:

1. **D-007** — solo Guitarra activa.  
2. **D-003 / D-GOV-06** — 5 clases gratis + teaser bloqueado (no 6ª jugable).  
3. **D-ROAD-003** — 10 fases del diagrama = estructura canónica.  
4. **Track A** como stack del MVP (no migración Next en Fase 1).  
5. **Visual D Canva** — SUPERSEDED.  
6. **D-017** — zona alumno requiere Subscription ACTIVE.  
7. **D-024** — post-demo = solicitud + WhatsApp (no “reservar cupo” falso).  
8. **Mitigar R-001 / R-002** sin decisión de arquitectura nueva.  
9. **Integrar Elvis / CourseLit en producto** como alcance MVP.

---

## Cómo escribir el doc (método)

Pasos obligatorios para el ejecutor **después** del OK Juan:

1. **Releer** `00-inventario-actual.md` completo + matriz de esta instrucción.  
2. **Obtener respuestas** a las preguntas 1–9 (o subset que Juan priorice); registrar en §9 del MVP.  
3. **Copiar la plantilla** de “Salida única” a `docs/product/01-mvp-gmusic.md`.  
4. **Rellenar §1–3** (visión, valor, usuario) en prosa densa — sin features list dumping.  
5. **Dibujar happy path** (§4) con tabla estado inventario vs gap.  
6. **Cerrar matriz** MUST/SHOULD/WON'T (§5) — cada celda con decisión Juan cuando haya duda.  
7. **Detalle por superficie** (§6) — 3–6 bullets máx por superficie.  
8. **DoD lanzamiento** (§7) — cada MUST del §5 debe mapear a ≥1 ítem del checklist.  
9. **Fuera de alcance** (§8) — copiar WON'T + colas post-MVP.  
10. **Contrastar con Juan** — marcar contradicciones docs (AGENTS Academia obsoleto, “auth pausada”) en una caja “Deuda documental post-MVP”.  
11. **Mapear colas T-*** (§10) — IN lanzamiento vs post (ver sección Relación con colas).  
12. **No implementar código.** Entregar borrador → Juan aprueba o pide diff → solo entonces cerrar Fase 1.  
13. **Cierre de control:** actualizar `etapa-actual.md`, `changelog.md`, `backlog.md` (ítems nacidos del MVP).

**Tope:** si Juan no responde preguntas MUST, el borrador lleva bloque `⚠ BLOQUEADO` en esas celdas — no inventar.

---

## Criterios de aceptación de Fase 1

Fase 1 se declara **cerrada** solo si:

- [ ] Existe `docs/product/01-mvp-gmusic.md` con **todas** las secciones de la plantilla.  
- [ ] Documento denso (≈1–2 páginas equivalentes o tablas claras; legible en una sentada).  
- [ ] Sin contradicciones internas (si A≠B, queda pregunta resuelta o riesgo explícito).  
- [ ] Cada **MUST** tiene criterio verificable en DoD.  
- [ ] **OUT / WON'T** explícitos (Track B, Elvis, CourseLit, Stripe, etc.).  
- [ ] Happy path dibujado y alineado al inventario (no al wish list).  
- [ ] Decisiones 1–9 respondidas o degradadas a OUT con OK Juan.  
- [ ] Relación T-PUB / T-UX-LESSON / ops documentada (IN vs post).  
- [ ] Juan marca **aprobado** en §12.  
- [ ] `etapa-actual.md` apunta a Fase 2 como siguiente (aún NO iniciada sin OK).  
- [ ] **Cero** commits de código de app en el nombre de “Fase 1”.

---

## Qué NO hacer en Fase 1

- Escribir código de aplicación, CSS, schema Prisma, migraciones.  
- Crear stubs de features “para adelantar”.  
- Empezar T-PUB-01 / T-UX-LESSON-01 “porque el MVP lo menciona” (solo planificar).  
- Investigar o clonar CourseLit / Elvis / open-source LMS.  
- Rediseñar UI, hero, brand.  
- Adoptar NextAuth / Stripe / Discourse / Docker porque figuren en el cartel.  
- Reabrir D-007, Visual D, R-001/R-002.  
- Crear `01-mvp-gmusic.md` **antes** del OK Juan.  
- Commit / push autónomo.  
- Declarar Fase 1 “lista” sin checklist de aceptación arriba.

---

## Relación con colas T-*

Propuesta (sin ejecutar). El MVP §10 debe elegir una columna final tras Juan.

| Cola / ítem | Decisión (D-ROAD-005) | Nota |
|-------------|------------------------|------|
| **T-PUB-01** Piloto publicación admin→alumno | **MUST** si afecta publicación/disponibilidad real | Sin contenido usable en path → no hay MVP educativo |
| **T-UX-LESSON-01** LessonRunner video-first | **MUST** si afecta consumo correcto de lección | Umbral = alumno completa y guarda progreso |
| **T-UX-COPY-LOGIN** | Post-MVP / Fase 10 pulido | SHOULD copy |
| **R-OPS-01** Baseline Prisma prod | **P0 bloqueo** si impide persistir / corrupción / pérdida | Ops no críticos = riesgo documentado OK |
| **INC-admin-cred** | **P0 bloqueo** si credencial admin insegura | — |
| Cola histórica “Fase 4 auth pausada” | **Desfasada** — JWT IN MVP (A) | Sync docs post-lectura Juan; no código en Fase 1 |

**Regla:** mencionar tickets en el MVP **no autoriza** implementarlos. Autorización = ticket + OK Juan separado.

---

## Formato de cierre Fase 1

Cuando el MVP esté **aprobado por Juan**, el ejecutor (misma sesión o siguiente):

1. **`docs/roadmap/etapa-actual.md`**  
   - Nombre: Fase 1 DEFINIR Y PLANEAR — **TERMINADA**.  
   - Próxima: Fase 2 ARQUITECTURA Y DISEÑO — **NO INICIADA** hasta OK.  
   - Link al `01-mvp-gmusic.md` aprobado.

2. **`docs/roadmap/changelog.md`**  
   - Entrada: Fecha — Fase 1 cerrada · link MVP · decisiones Juan resumidas (1–9).

3. **`docs/roadmap/backlog.md`**  
   - Promover/degradar ítems según matriz (ej. “Mi Progreso OUT → idea”; “T-PUB-01 MUST → etapa activa post-Fase 1”).  
   - Añadir ítems nuevos solo si el MVP los nombra y no existían.

4. **`docs/roadmap/decisiones.md`**  
   - Registrar decisiones de producto nuevas como D-ROAD-00X o apuntar a filas en `.agents/DECISIONS.md` si Juan las eleva a D-GOV/D-*.

5. **`.agents/PROJECT_STATUS.md`** (ligero)  
   - Una línea: MVP aprobado · fecha · siguiente fase.

6. **No** iniciar Fase 2 ni código hasta OK explícito.

---

## Anexo A — Protocolo maestro (aspiración Juan) vs realidad inventario

El protocolo de Juan lista capacidades del MVP aspiracional. Fase 1 debe **clasificar** cada una:

| Capacidad aspiracional | Inventario | Tratamiento en MVP doc |
|------------------------|------------|------------------------|
| Registro/login | parcial | Decisión 1 |
| Perfil | parcial (en auth/me) | Confirmar mínimo |
| Academia | completa (onboarding) | IN |
| Cursos/módulos/lecciones | parcial | + T-PUB-01 |
| Reproducción contenido | parcial | + T-UX-LESSON |
| Progreso por lección | parcial | IN |
| Mi Camino | parcial | IN |
| Mi Progreso | inexistente | **MUST** mínimo (B) |
| Comunidad funcional | parcial | **MUST** feed básico (C) |
| Control acceso básico | completa | IN |
| Responsive | a validar en DoD | IN criterio |

---

## Anexo B — Gate de inicio (mensaje tipo a Juan)

> Inventario `00` y instrucción `fase-1-instruccion.md` listos.  
> Fase 1 **no** está iniciada.  
> ¿Autorizas que Cursor redacté `docs/product/01-mvp-gmusic.md` con esta plantilla?  
> Respuestas críticas pendientes: auth JWT (A/B/C), Mi Progreso, Comunidad, T-PUB vs T-UX-LESSON MUST, ops P0 bloquea lanzamiento.

---

*Fin de la instrucción. Próximo artefacto autorizado tras OK Juan: `docs/product/01-mvp-gmusic.md`.*
