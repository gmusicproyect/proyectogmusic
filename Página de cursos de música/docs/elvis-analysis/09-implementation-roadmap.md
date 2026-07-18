# 09 — Roadmap de implementación (Fase 8 / entrega)

> **Condición:** no implementar hasta aprobación explícita de Juan (+ Opus si afecta producto Gmusic).  
> Basado en `07`–`08`. Fecha: 2026-07-13.

---

## Fase 0 — Gobernanza (bloqueante)

1. Decidir: ¿producto **ERP académico aparte** o módulo futuro bajo el monorepo Gmusic?  
2. Confirmación legal: **clean-room** (sin código GPL Elvis).  
3. Elegir stack target (Track A Express/Prisma vs Track B Next, etc.).  
4. Actualizar `DECISIONS.md` / ticket D-GOV si aplica.  
5. Congelar alcance MVP ERP (¿solo People+Enrollment+Billing o también Scheduling?).

**Criterio de salida:** decisión escrita + alcance MVP.

---

## Fase 1 — Cimientos

| Entrega | Detalle |
|---------|---------|
| Bounded contexts skeleton | carpetas/módulos + límites de dependencias |
| IAM mínimo | Account + roles admin/staff/guardian |
| Person + Household | miembros + roles Payer/Legal |
| AcademicPeriod | ventanas open/re-enroll/close + activate |
| Domain events bus | tipado; mismo comportamiento en todos los envs |
| Money VO | cents + currency |
| AuthZ policies | resource-based |
| Observability | structured logs + correlation id |
| Tests | contract tests del bus + policies |

**No incluir:** plugins estilo Elvis, ES obligatorio, OIDC.

---

## Fase 2 — Enrollment MVP

1. Catalog Offering básico.  
2. EnrollmentApplication + LineItems.  
3. State machine (submit → in_review → proposed → accepted/rejected/cancelled/stopped).  
4. UI staff: lista + detalle + cambio de estado.  
5. UI familia: solicitud simple (sin wizard 2k-LOC).  
6. Eventos → Communications (email confirmación).  
7. Seeds + factories + tests de transiciones ilegales.

**Criterio:** familia crea solicitud; staff acepta; mails salen una vez (idempotencia).

---

## Fase 3 — Billing MVP

1. FeeSchedule / PricingRule por periodo.  
2. PaymentPlan + Installments generation (equivalente SyncDuePayments).  
3. MembershipFee opcional.  
4. Prorrata on stop (puerto del `DuePayments::StopActivity` concept).  
5. Staff UI cartera (dues).  
6. Tests: generate plan, pay partial, reevaluate.

**Cablear** generación de plan al aceptar enrollment (cerrar gap Elvis wizard).

---

## Fase 4 — Payments MVP

1. RecordPayment contra installment.  
2. Fail/Refund mínimos.  
3. Import CSV con FailedImport reason codes.  
4. Reminders (upcoming / unpaid).  
5. Idempotency keys.  
6. Audit trail money.

---

## Fase 5 — Scheduling + Attendance

1. ClassGroup + Room/Site.  
2. GenerateSessionsForPeriod + conflict detection.  
3. Place student (AddStudent chain idea).  
4. Attendance sheet teacher.  
5. Absences export.

Puede **posponerse** si el MVP de negocio es solo inscripción+cobros.

---

## Fase 6 — Follow-up + Docs + Reporting

1. Notes/Tasks.  
2. Evaluations (si pedagógico).  
3. Consent documents.  
4. CSV exports parametrizados.  
5. Dashboards deuda / plazas.

---

## Fase 7 — Hardening

1. PII retention / erase.  
2. Load tests listing endpoints.  
3. Multi-sede **solo si** decidido.  
4. SSO client **solo si** decidido.  
5. Threat model pagos.

---

## Incrementos recomendados (slices verticales)

| Slice | Valor |
|-------|-------|
| A | Period + Household + empty enrollment |
| B | Submit + accept enrollment |
| C | Generate payment plan |
| D | Record payment + unpaid list |
| E | Place in class + attendance |

Cada slice: spec → tests → implementación → verify canónico del repo destino.

---

## Trazabilidad análisis → trabajo

| Doc | Guía |
|-----|------|
| `03` / `07` | Nombres de entidades y contextos |
| `04` | Flujos a reimplementar / gaps a no repetir |
| `05` | Extender con eventos/flags, no fat controllers |
| `06` | Riesgos a no importar (Ability boolean, async default) |
| `08` | Adoptar/adaptar/descartar |

---

## Fuera de roadmap (explícito)

- Fork de Elvis / mezcla GPL en Gmusic.  
- Plugin marketplace.  
- Port Inspinia/jQuery.  
- Confiar en OIDC Elvis del clone incompleto.  
- Multi-instrumento Track B pedagógica mezclada con ERP sin D-GOV.
