# Backlog GMusic

Ideas y trabajos **no** insertados en la etapa activa. Priorizar tras cierre de etapa.

## Activos (cola operativa — anclados a MVP D-ROAD-005)

| ID | Ítem | Prioridad | Etapa sugerida | Nota MVP |
|----|------|-----------|----------------|----------|
| T-UX-LESSON-01 | LessonRunner / consumo lección | **MUST** si afecta consumo | 5 / 6 | Umbral: completa + persiste |
| T-MVP-PROGRESS | Página Mi Progreso mínima (capa C) | **MUST** pre-launch | 7 | **D-F7-001** · contrato `07` v1.0 · docs cerrados ≠ launch · capa C: UI + PUBLISHED env + progreso persistido |
| T-MVP-COMMUNITY | Feed real sin mocks de launch (C) | **MUST** si en nav | 8 | Brief F8 listo · ejecución **NO** · Header **bloqueado** (D-F6-ANTI-DEMO); desbloquear con feed API real (mocks ≠ launch) |
| T-UX-COPY-LOGIN | Copy login vs registro | Baja | 4 / 11 | SHOULD pulido |
| R-OPS-01 | Baseline Prisma prod | **P0** si bloquea persistir | 3 / 12 | Decisión D |
| INC-admin-cred | Rotación credencial admin prod | **P0 bloqueo** | 3 | Decisión D |
| R-OPS-MIGRATE-UUID | `prisma migrate deploy` fresh local UUID vs TEXT | Ops deuda | 3 / 12 | Deuda post T-PUB-01 · **D-TPUB-01** · no bloquea cierre local · sin fix repo sin OK Juan |
| T-PUB-01-UI | Screenshot FE Vite `/mi-camino` post piloto | Baja / opcional | 5 / 10 | **No** bloquea T-PUB-01 DONE LOCAL · API `GET /me/path` ya validada · **D-TPUB-01** |

> Ticket nuevo en backlog **no** autoriza implementación. Esperar OK Juan + fase correspondiente.

## Cerrados

| ID | Ítem | Cierre | Evidencia / decisión |
|----|------|--------|----------------------|
| **T-F6-ANTI-DEMO-01** | Eliminar verdad mock/hardcode Mi Camino | **CERRADO** · **DONE LOCAL** · 2026-07-15 · **D-F6-ANTI-DEMO-001** · veredicto `coherente` (`t-f6-anti-demo-01-auditoria-final.md`) | pathLabel/order · duration vacío · Comunidad OUT MVP · `06` anti-demo · F6 hoy **TERMINADA** (**D-F6-001**; al cerrar el ticket aún PAUSADA) · **sin** commit/push · **sin** F7 · **sin** prod |
| **T-PUB-01** | Piloto publicación admin→alumno | **DONE LOCAL** · 2026-07-15 · **D-TPUB-01** | `docs/roadmap/t-pub-01-evidencia-local.md` · alcance **local** · **no** prod · **no** launch staging · F6 **NO** · sin código producto · sin commit/push |

## Ideas (protocolo — no implementar ahora)

### Idea — Manual Operativo de GMusic
- **Problema:** roles y puertas de gobernanza (Jp / GPT supervisor / Cursor / Opus) viven repartidos en AGENTS, skills y chat; riesgo de avanzar fases sin criterios claros.
- **Alcance del manual (cuando se escriba):** roles; cómo se registran decisiones; quién aprueba fases; criterios para avanzar; relación con DoD (`docs/quality/definition-of-done.md`) y MVP congelado (D-F1-001).
- **Impacto:** alto en orden operativo y handoffs.
- **Esfuerzo:** medio (doc dedicado).
- **Prioridad:** **alta gobernanza**.
- **Etapa sugerida:** documento separado **post / paralelo a Fase 2** — **no** escribir el manual completo ahora (stub opcional; idea registrada basta).
- **Estado:** solo backlog · **no** autorizado a redactar el manual completo en esta pasada.

### ~~Idea — Página Mi Progreso~~ → promovida
- **Estado:** promovida a **MUST MVP** (D-ROAD-005 B / `T-MVP-PROGRESS`).
- Mantener OUT de rachas avanzadas / rankings / gráficos / predictivo.

### Idea — Email verification
- **Problema:** cuentas sin verificar correo.
- **Impacto:** seguridad/confianza.
- **Esfuerzo:** medio (Resend + estados).
- **Prioridad:** **WON'T MVP** (D-ROAD-005 A) — reabrir solo con decisión Juan.
- **Etapa:** 4 (extensión post-MVP).

### Idea — Pasarela de pago
- **Problema:** cobro manual WhatsApp no escala.
- **Impacto:** alto negocio.
- **Esfuerzo:** alto + decisión Juan.
- **Prioridad:** bloqueada hasta conversión real.
- **Etapa:** 9.

### Idea — ERP familias/periodos (Elvis)
- **Problema:** ops de academia presencial/híbrida.
- **Prioridad:** fuera MVP Track A.
- **Etapa:** producto aparte / post-15.

### Idea — Completar docs CourseLit 04–20
- **Problema:** análisis LMS incompleto.
- **Prioridad:** baja vs MVP alumno.
- **Etapa:** referencia solo cuando haga falta patrón LMS concreto.
