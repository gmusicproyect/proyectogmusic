# 06 — Calidad y riesgos (Fase 6)

> **Fuente:** `/Users/juanlizamah/Desktop/elvis`  
> **Fecha:** 2026-07-13  
> **Complementa:** fases 01–05  

Clasificación: **fortaleza** · **riesgo bajo** · **riesgo medio** · **riesgo alto** · **información insuficiente**

Para cada riesgo: evidencia · impacto · recomendación (para uso como referencia o para un sistema propio).

---

## Mapa rápido

| Área | Clasificación |
|------|----------------|
| Plugin architecture documentada | **fortaleza** |
| Lenguaje de dominio escolar rico | **fortaleza** |
| Cobertura de tests | **riesgo alto** |
| Acoplamiento / controllers gordos | **riesgo alto** |
| Seguridad AuthZ (CanCan antipattern) | **riesgo alto** |
| Deuda técnica (Rails 6.1, lockfile, GPL) | **riesgo alto** |
| Manejo de dinero | **riesgo medio** |
| Jobs / escalabilidad | **riesgo medio** |
| PII / audit | **riesgo medio** |
| Timezones (Paris-centric) | **riesgo bajo** |
| Trazabilidad (RES + Sentry) | **riesgo bajo** (con matices) |
| OIDC / SSO client | **información insuficiente** / hueco |

---

## Fortalezas

### F1 — Extensibilidad por plugins **fortaleza**

- **Evidencia:** `PluginLoader.db_load`, generators, docs Plugin-*, marketplace webhook CI.  
- **Impacto positivo:** features opcionales sin necesariamente forkar todo (si el ecosistema de gems existe).  
- **Nota:** este clone no trae plugins activos.

### F2 — Dominio MIS completo **fortaleza**

- **Evidencia:** Season, inscriptions, planning, dues/payments, attendance, evaluations (fases 3–4).  
- **Impacto:** excelente como **mapa conceptual** para un producto de gestión académica.

### F3 — Event bus + Parameter **fortaleza** (parcial)

- **Evidencia:** EventHandler documentado; Parameter tipado + cache.  
- **Impacto:** permite desacoplar notificaciones y toggles escolares.

### F4 — Operación Docker / health **fortaleza**

- **Evidencia:** compose, `/ping`, Sidekiq opcional, Sentry gems.

---

## Claridad — **riesgo medio**

| | |
|--|--|
| Evidencia | Docs FR útiles; typos (`ParameterListner`); `plugin.json` vs `plugins.json`; Hook vs Event poco claros por call-sites |
| Impacto | Elegir mal el mecanismo de extensión |
| Recomendación | Guía única “cómo extender” + naming estable |

---

## Cohesión — **riesgo medio**

| | |
|--|--|
| Evidencia | Setting (Redmine) + Parameter; EventRules comentadas pero modelo vivo; notifs a veces mailer directo |
| Impacto | Dos verdades de configuración / notificaciones |
| Recomendación | Consolidar; decidir EventRules (reactivar o borrar) |

---

## Acoplamiento — **riesgo alto**

| | |
|--|--|
| Evidencia | Controllers 1–2k LOC; User 1132 LOC; ApplicationRecord emite eventos globales; RequestStore → dominio; plugins mutan routes globales |
| Impacto | Cambios locales con efectos no locales |
| Recomendación | Use-cases explícitos; eventos opt-in; API de plugin estable |

---

## Complejidad — **riesgo alto**

| | |
|--|--|
| Evidencia | `ActivitiesApplicationsController` ~1965; payments ~1379; Event `method_missing` + `const_set`; Plugin migrator |
| Impacto | Regresiones caras; reviews imposibles |
| Recomendación | Tope de tamaño en código nuevo; extracción gradual |

---

## Cobertura de pruebas — **riesgo alto**

| | |
|--|--|
| Evidencia | `spec/` + `test/` presentes pero **pocos archivos ejecutables** (~10 en exploración); sin suite visible de Ability/plugins/pagos críticos |
| Impacto | Refactors y plugins sin red de seguridad |
| Recomendación | Contract tests: PluginLoader, DuePayment#reevaluate_status, inscription create; CI obligatorio |

**Información insuficiente:** % cobertura exacto no medido en esta fase (no se ejecutó suite completa).

---

## Mantenibilidad — **riesgo alto**

| | |
|--|--|
| Evidencia | Sin `Gemfile.lock` (gitignore); TODOs PluginInitJob; código muerto EventRules; dual AMS/`as_json` |
| Impacto | Builds no reproducibles; bit-rot |
| Recomendación | Lockfile; limpiar dead code; modularizar User |

---

## Seguridad — **riesgo alto**

| | |
|--|--|
| Evidencia | Antipattern masivo `authorize! :manage, @current_user.is_admin` (autoriza un **boolean**); admin `can :manage, :all`; teachers `can :read, User` amplio; SMTP password en Parameter; PluginsController sin Ability clara en análisis |
| Impacto | Falsa sensación de AuthZ; escalada de privilegios plausible |
| Recomendación | Solo subjects de recurso; auditoría CanCan; secretos fuera de DB; endpoints admin protegidos |

---

## Rendimiento — **riesgo medio**

| | |
|--|--|
| Evidencia | ObjectSpace por plugin; `bundle show` en shell; RES guarda commits AR; limpieza event_store por tamaño |
| Impacto | Boot lento; tablas de eventos crecen |
| Recomendación | Emisión AR selectiva; cache paths plugins; retención/archivo |

---

## Escalabilidad — **riesgo medio**

| | |
|--|--|
| Evidencia | Production ActiveJob `:async` por defecto; PluginInitJob/BaseEventJob fuerzan `:async`; Sidekiq solo con `USE_SIDEKIQ`; races multi-pod en load |
| Impacto | Jobs perdidos al reiniciar; plugins inconsistentes entre réplicas |
| Recomendación | Sidekiq default en prod; carga de plugins síncrona en boot controlado |

---

## Integridad de datos — **riesgo medio**

| | |
|--|--|
| Evidencia | Activate plugin puede ignorar errores de `save`; amounts `decimal` sin Money object obligatorio; unicidad email custom (attached accounts) |
| Impacto | Activaciones parciales; edge cases monetarios |
| Recomendación | Activate+migrate atómico; cents + currency; invariantes en tests |

---

## Concurrencia — **riesgo medio**

| | |
|--|--|
| Evidencia | Mutex en EventHandler; RES `expected_version: :any`; PluginStateListener muta string con `prepend` |
| Impacto | Carreras / bugs raros |
| Recomendación | Jobs idempotentes; no mutar nombres de plugin |

---

## Idempotencia — **riesgo medio**

| | |
|--|--|
| Evidencia | Pocos `find_or_create` en jobs críticos; mailers `deliver_later` sin dedupe; retries Sidekiq/async |
| Impacto | Mails/pagos duplicados |
| Recomendación | Idempotency keys; uniqueness job; correlación RES |

---

## Trazabilidad — **riesgo bajo**

| | |
|--|--|
| Evidencia | `rails_event_store`, Sentry, semantic logger |
| Impacto | Base razonable si se opera |
| Recomendación | Correlation IDs request→job; no borrarse el event store sin archivo |

---

## Auditoría — **riesgo medio**

| | |
|--|--|
| Evidencia | RES como audit de facto, pero se limpia; no ledger inmutable dedicado a dinero/admin |
| Impacto | Disputas / compliance |
| Recomendación | Audit trail separado para payments y acciones admin |

---

## Protección de datos personales (PII) — **riesgo medio**

| | |
|--|--|
| Evidencia | Email, birthday, handicap, addresses, phones, IPs; flags GDPR; soft-delete; eventos pueden snapshotear modelos |
| Impacto | PII en RES/logs |
| Recomendación | Scrub payloads; retention; erase paths que incluyan eventos |

---

## Manejo de dinero — **riesgo medio**

| | |
|--|--|
| Evidencia | Gem `money` presente; schema decimal; `DuePayment#reevaluate_status`; import CSV con FailedPaymentImport; statuses due≠payment |
| Impacto | Redondeos / semántica inconsistente / conciliación manual |
| Recomendación | Value object único; state machine testeada; separar Billing vs Payments |

---

## Zonas horarias — **riesgo bajo**

| | |
|--|--|
| Evidencia | `config.time_zone = "Paris"`; tzinfo-data; settings user TZ |
| Impacto | OK para despliegue FR; frágil multi-país |
| Recomendación | Evitar `DateTime.now` bare; UTC storage + TZ display |

---

## Evolución de esquemas — **riesgo medio**

| | |
|--|--|
| Evidencia | ~127 migraciones; squash antiguo; migraciones plugin alteran schema.rb |
| Impacto | Conflictos core/plugin |
| Recomendación | Política de dump separada; CI |

---

## Dependencias abandonadas / EOL — **riesgo medio**

| | |
|--|--|
| Evidencia | Rails **6.1.7.10** (EOL); chewy pin; mimemagic; liquid-rails git; panoramic GitHub; sin lockfile en clone |
| Impacto | Seguridad y supply-chain |
| Recomendación | Plan upgrade; pins por SHA; publicar lockfile |

---

## Deuda técnica agregada — **riesgo alto**

Incluye: Ability antipattern · EventRules muerto · fat MVC · async vs Sidekiq · dual Setting/Parameter · GPL/Redmine forks · OIDC issuer sin modelos claros en clone · SwitchSeasonJob desconectado · activity_assigned sin trigger · k8s-only AR events.

**Orden sugerido de deuda (si se mantuviera Elvis):**  
1) AuthZ · 2) lockfile+tests · 3) plugin CI fixture · 4) EventRules decisión · 5) Rails upgrade · 6) extraer use-cases.

---

## Licencia y reutilización — **riesgo alto** (legal/producto)

| | |
|--|--|
| Evidencia | `LICENSE` GPL-3.0; headers Redmine GPL en Hook/Setting |
| Impacto | Copiar código al producto propio puede obligar copyleft |
| Recomendación | **Adoptar ideas/patrones; no volcar módulos.** Consulta legal antes de cualquier reuso de código |

---

## OIDC / SSO — **información insuficiente** / hueco

| | |
|--|--|
| Evidencia | Rutas OIDC + `AuthorizationEndpoint`/`TokenEndpoint` + tablas schema; modelos/controllers ausentes en clone; gems OAuth no en Gemfile |
| Impacto | No afirmar SSO listo; Elvis parece **issuer** más que cliente IdP |
| Recomendación | Tratar SSO como proyecto aparte en producto propio |

---

## Implicaciones para *nuestro* sistema (solo análisis) **[R]**

| Del Elvis | Acción |
|-----------|--------|
| Mapa dominio Season/Family/Enrollment/Billing | **Adoptar como referencia** |
| Plugin marketplace GPL | **No clonar**; decidir módulos internos |
| EventHandler idea | **Adaptar** con contratos + tests + mismo comportamiento en todos los envs |
| Parameter flags | **Adaptar** sin secretos en DB |
| Fat controllers / Ability boolean | **Descartar** |
| Money/due/payment tree | **Adaptar** con Bounded Contexts claros e idempotencia |

Detalle tabular → Fase 8 (`08-adoption-matrix.md`).

---

## Archivos / fuentes (Fase 6)

- Hallazgos de fases 01–05 + exploración [plugins & risks](3de2e84f-73c4-4d8c-a7ee-2c03c9e410db)  
- Contadores LOC y Ability patterns ya citados en `02`/`04`/`05`  
- `LICENSE`, `Gemfile`, `.gitignore` (lockfile), `Ability`, jobs async, Parameter SMTP

---

## Siguiente

**Fases 7–8 + roadmap + open questions:**  
`07-target-domain-proposal.md`, `08-adoption-matrix.md`, `09-implementation-roadmap.md`, `10-open-questions.md`.
