# 08 — Matriz de adopción (Fase 8)

> Clasificación: **adoptar** · **adaptar** · **reemplazar** · **investigar** · **descartar**  
> Evidencia bajo `/Users/juanlizamah/Desktop/elvis` · Fecha: 2026-07-13

| Necesidad de nuestro sistema | Solución observada en ELVIS | Evidencia en el código | Reutilizable | Requiere adaptación | No recomendable | Propuesta | Decisión |
|---|---|---|---|---|---|---|---|
| Gestión de familias / roles | Grafo `FamilyMemberUser` por saison (sin entidad Family) | `family_member_user.rb`, `FamilyMemberUsers` service | Idea de roles (payer/legal/contact) | Sí — agregar agregado Household | Copiar FMU SQL inheritance tal cual | `Household` + memberships tipados por periodo | **adaptar** |
| Alumnos y responsables | `User` multi-rol + attached accounts | `user.rb` | Attached/dependent accounts | Sí — separar Person/Account | Mega-User 1100+ LOC | People + IAM contexts | **adaptar** |
| Temporadas / periodos | `Season` + ventanas + `next_season` | `season.rb`, `SeasonsController`, `SeasonListener` | Modelo de ventanas | Sí — cablear switch memberships | AR events solo kubernetes; SwitchSeasonJob desconectado | `AcademicPeriod` + evento `PeriodActivated` | **adaptar** |
| Matrícula | `ActivityApplication` + statuses ID fijos + wizard gordo | `activities_applications_controller.rb#create`, `activity_application_status.rb` | Flujo administratif + line items | Sí — state machine + use-cases | Controller 2k LOC + IDs mágicos | `EnrollmentApplication` + transitions tipadas | **adaptar** |
| Programas / cursos / catálogo | `ActivityRef` + `Formule` | `activity_ref.rb`, `formule.rb` | Separación catálogo vs clase | Sí | Pricing legacy dual | Offering + Package | **adaptar** |
| Planificación de grupos | `Activity` + teachers + capacity | `activity.rb`, `Activities::AddStudent` | Cadena assign→instances→attendance | Sí | Mezcla UI/controller | ClassGroup placement commands | **adaptar** |
| Calendarios y horarios | `TimeInterval` kinds + `create_instances` | `time_interval.rb`, `Activity#create_instances`, PlanningController | Kinds + generate over season | Sí — conflict service | Lógica de conflicto dispersa | Scheduling BC | **adaptar** |
| Disponibilidades | kind `p` + AvailabilitiesUtils | `TimeIntervals::AvailabilitiesUtils` | Preferencias de alumno | Ligera | — | AvailabilityPreference | **adoptar** (idea) |
| Asistencia | `StudentAttendance` + presence_sheet | `users#presence_sheet`, `StudentAttendancesController` | Sesión-level attendance | Ligera | — | AttendanceRecord | **adoptar** (idea) |
| Tarifas / cargos | DuePayment + terms + adhesion | `due_payment.rb`, `SyncDuePaymentWithPayerTermsJob`, `adhesion.rb` | Plan → cuotas | Sí — Billing BC | Wizard sin Sync; decimal ad-hoc | PaymentPlan + Charge | **adaptar** |
| Pagos / conciliación | Payment + reevaluate_status + CSV import | `payments_controller.rb`, `DuePayment#reevaluate_status` | Algoritmo de status | Sí — idempotencia + tests | Fat controller; statuses due≠payment | Payments BC | **adaptar** |
| Deuda | Listas UNPAID/FAILED + reminders | DuePaymentController list/mail | Operación cartera | Sí | Sin bloqueo por deuda | Debt views + policies | **adaptar** |
| Facturación fiscal | No modelo Invoice claro | — | — | — | Asumir que Payment = factura | Investigar necesidad legal CL/FR | **investigar** |
| Descuentos | `Discount` en desired/adhesion | models discount | Concepto | Sí | Reglas implícitas | Discount VO/policy | **adaptar** |
| Devoluciones | Status Remboursée (due) | due_payment_status seeds | Semilla | Sí — flujo Refund | Flujo UI incompleto en audit | Refund command | **investigar** |
| Seguimiento académico | Evaluations + comments | evaluation_* , CommentsController | Eval + notes | Sí | Sin Task CRM | Follow-up + Task | **adaptar** |
| Comunicaciones | NotificationListener + templates | `notification_listener.rb`, NotificationTemplate | Event → mail | Sí — activar reglas | EventRules muerto; assign sin trigger | Communications BC | **adaptar** |
| Documentos / consent | ConsentDocument* | models + wizard | Consent capture | Ligera | — | Documents BC | **adoptar** (idea) |
| Reportes | CSV list/export + Chewy | csv controllers, `app/chewy` | Export operativo | Sí | ES obligatorio day-1 | Reporting read models / CSV | **adaptar** |
| Roles y permisos | CanCanCan Ability | `ability.rb` + authorize boolean | Idea RBAC | Reescribir | Antipattern boolean | Policy objects / CASL / etc. | **reemplazar** |
| Auditoría / historial | Rails Event Store + soft-delete | ApplicationRecord, RES | Event log idea | Sí — scrub PII | Auto-emit env-gated; clean agresivo | Audit dedicado + domain events | **adaptar** |
| Plugins / white-label | PluginLoader gems | `plugin_loader.rb`, docs Plugin-* | Solo si hay marketplace | Pesado | GPL host + boot frágil | Módulos internos versionados | **descartar** (salvo decisión producto) |
| Feature flags | Parameter KV | `parameter.rb` | School config | Sí — sin secrets | SMTP password in DB | Config service + secrets vault | **adaptar** |
| Stack Rails/React islands | Rails 6.1 + Shakapacker + Inspinia | Gemfile, frontend/ | — | — | EOL + UI legacy | Stack propio (p.ej. ya Vite/Express Gmusic o Next futuro) | **descartar** |
| Bus de eventos API | EventHandler subscribe/trigger | `lib/elvis/event*.rb` | Contrato sender/args | Sí — estable en todos envs | method_missing + const_set | Typed domain events | **adaptar** |
| Multi-tenant escuela | School singleton + Organization opcional | `school.rb`, `organization.rb` | — | — | Confundir org con tenant | Decidir sede/tenant explícito | **investigar** |
| OIDC/SSO | Issuer parcial | oidc routes, endpoints | — | — | Modelos faltantes en clone | SSO client moderno | **descartar** Elvis path; **investigar** SSO propio |
| Dinero | money gem + decimal | Gemfile, payment amounts | — | Sí | Sin cents obligatorios | Money VO + integer cents | **reemplazar** patrón de storage |
| Tests de dominio | Escasos | spec/test thin | — | — | Confiar en Elvis sin tests | TDD en reglas de Billing/Enrollment | **reemplazar** práctica |
| Licencia / código | GPL-3 | LICENSE | Ideas/docs | — | Copiar módulos | Clean-room design | **descartar** copia |

---

## Resumen por decisión

| Decisión | Cantidad aprox. | Ejemplos |
|----------|-----------------|----------|
| **adoptar** (idea) | Pocas | Disponibilidades, attendance, consent |
| **adaptar** | Mayoría | Season, enrollment, billing, events, families |
| **reemplazar** | Críticas | AuthZ, money storage, test practice |
| **investigar** | Pocas | Invoice fiscal, refunds UI, multi-tenant |
| **descartar** | Stack/plugins/OIDC Elvis / copia GPL | — |

---

## Regla de oro

> Elvis es un **atlas de dominio escolar**, no un kit de piezas pegables.  
> Cada celda “adaptar” implica reimplementación en nuestro stack con tests y sin copy-paste.
