# 01 — Inventario técnico (Fase 1)

> **Fuente del código:** clone local `/Users/juanlizamah/Desktop/elvis` (remoto: [ELVIS-SOFTWARE/elvis](https://github.com/ELVIS-SOFTWARE/elvis)).  
> **Versión observada:** `Elvis::VERSION = "2.13.3"` (`lib/elvis/version.rb`).  
> **Fecha de análisis:** 2026-07-13.  
> **Alcance de esta fase:** inventario; no propuesta de arquitectura objetivo.

### Leyenda de certeza

| Marca | Significado |
|-------|-------------|
| **[F]** | Hecho comprobado en el repo |
| **[I]** | Interpretación razonable |
| **[?]** | Información insuficiente / no verificable en este clone |

---

## 1. Comprensión del objetivo (contexto del análisis)

Analizar Elvis como **sistema de gestión de escuela de música** (miembros, matrículas/`inscriptions`, temporadas, planning, cobros, seguimiento) para usarlo como **referencia de dominio y arquitectura**, no como dependencia ni fork automático en el producto Gmusic Track A.

**Restricción legal [F]:** licencia **GNU GPL-3.0** (`LICENSE`). Cualquier reutilización de código enlazado o derivado impone copyleft. Las fases posteriores deben priorizar **adaptar ideas/patrones** frente a copiar módulos.

---

## 2. Tecnologías detectadas

### Lenguajes y runtime

| Tecnología | Evidencia |
|------------|-----------|
| Ruby **3.3.6** | `.ruby-version`, imagen Docker `ruby:3.3.6-alpine` |
| Rails **6.1.7.10** | `Gemfile:gem "rails", "6.1.7.10"` |
| JavaScript (Babel 7) + **React 16.14** | `package.json` |
| SCSS / CSS (Webpack) | `frontend/packs/application.scss`, Shakapacker |
| SQL / PostgreSQL | `gem "pg"`, `config/database.yml`, `docker-compose.yml` servicio `postgres:14.0` |

### Frameworks y bibliotecas (núcleo)

| Área | Stack [F] | Evidencia |
|------|-----------|-----------|
| Web | Rails MVC + Puma | `Gemfile`, `config/puma.rb` |
| AuthN | Devise + `devise-token_authenticatable` | `Gemfile`, `app/models/user.rb`, `config/initializers/devise.rb` |
| AuthZ | CanCanCan | `app/models/ability.rb:Ability` |
| Frontend | `react-rails` + **Shakapacker** `< 9` | `Gemfile`, `config/shakapacker.yml` (`source_path: frontend`) |
| UI legacy | jQuery, Bootstrap 4, Inspinia | `frontend/packs/app.js`, `package.json` |
| Eventos | `rails_event_store` + wrapper propio | `Gemfile`, `lib/elvis/event_handler.rb`, `docs/EventListeners.md` |
| Jobs | ActiveJob; Sidekiq opcional | `config/initializers/sidekiq.rb`, `USE_SIDEKIQ` |
| Búsqueda | Chewy → Elasticsearch | `gem "chewy"`, `app/chewy/*`, compose ES 7.16.3 |
| PDF | wicked_pdf / wkhtmltopdf | `Gemfile` |
| Dinero / teléfonos | `money`, `phony_rails`, `phonelib` | `Gemfile` |
| Soft-delete | `acts_as_paranoid` | `Gemfile` |
| Observabilidad | Sentry, rails_semantic_logger, rails_performance, rack-mini-profiler | `Gemfile` |
| Plugins | carga dinámica desde lista remota / local | `lib/elvis/plugin_gem_utils.rb`, `lib/elvis/plugin_loader.rb` |
| Cron | whenever | `config/schedule.rb`, `gem "whenever"` |

### Dependencias frágiles / legado [F]

- `liquid-rails` desde git (`Countable-us`), `panoramic` desde `ELVIS-SOFTWARE/panoramic`
- Dual `active_model_serializers` + `fast_jsonapi`
- Dual traces de Webpacker (`@rails/webpacker@5.4.4`) junto a Shakapacker 8
- `composite_primary_keys`, `mimemagic`, `connection_pool < 3` (comentario de patch en Gemfile)
- **No hay `Gemfile.lock`** en este clone → builds no reproducibles [F]

### Dependencias npm (señal)

~100 dependencias; UI administrativa rico (FullCalendar, react-table v6, react-final-form, toastify, calendarios SIXMON forks). Scripts `start`/`build` apuntan a `react-scripts` — **probable residual [I]**; el bundling real va por Shakapacker.

---

## 3. Estructura de carpetas (mapa inicial)

```
elvis/
├── app/                    # Rails: models (~101), controllers (~72), jobs, listeners,
│                           # views ERB, serializers, mailers, abilities, chewy
├── frontend/               # Shakapacker source_path
│   ├── packs/              # app.js, server_rendering.js, SCSS
│   └── components/         # ~70+ islas React montadas vía react_component
├── config/                 # routes, envs (incl. kubernetes), sidekiq, chewy,
│                           # schedule (whenever), settings.yml (legado Redmine)
├── db/                     # migrate (~127), schema.rb, seeds.rb, seeds/, Scripts/, init_data.json
├── lib/elvis/              # PluginLoader, EventHandler, Hook (estilo Redmine), version
├── lib/                    # AuthorizationEndpoint, TokenEndpoint (OIDC/OAuth2 rack)
├── docs/                   # Plugin-*, EventListeners, ElvisLib, RemoveController
├── entrypoints/            # Docker init / app
├── docker-compose.yml      # elvis + init + sidekiq + postgres + ES + redis
├── Dockerfile              # multi-stage build (node + ruby alpine)
├── spec/                   # RSpec (poca cobertura aparente: ~7 archivos listados en scan)
├── test/                   # minitest (~20 archivos)
└── LICENSE                 # GPL-3.0
```

### Función de módulos relevantes

| Módulo | Función [F] |
|--------|-------------|
| `app/models` | Dominio AR: User, Season, Planning, ActivityApplication, payments, rooms, evaluations… |
| `app/controllers` | Entrada HTTP; `inscriptions` → `ActivitiesApplicationsController` |
| `app/abilities` + `ability.rb` | Reglas CanCanCan |
| `app/listeners` | Suscriptores EventHandler / RES |
| `app/jobs` | Cálculos de precios, CSV, switch season, sync due payments, plugin init |
| `app/chewy` | Índices ES: users, activities, applications, adhesions, rooms |
| `frontend/components` | Wizards de inscripción, planning, usuarios, pagos, plugins UI |
| `lib/elvis` | Extensibilidad (plugins + eventos + hooks) |
| `db/seeds.rb` | Datos de referencia (estados, métodos de pago, templates…) |

---

## 4. Sistema de construcción y entornos

| Aspecto | Hecho [F] | Evidencia |
|---------|-----------|-----------|
| Build app | Docker multi-stage + `bundle` / `yarn` | `Dockerfile` |
| Compose | `elvis_init` → `elvis` + `sidekiq` + deps | `docker-compose.yml` (puerto **7212→80**) |
| Token build | `GITHUB_TOKEN` requerido por defecto en compose | `docker-compose.yml` args |
| Imagen publicada | `ghcr.io/elvis-software/elvis` | README |
| Env especial | `Rails_ENV=kubernetes` en compose; eventos AR gated a `kubernetes?` | compose + `ApplicationRecord` |
| Front pack | `shakapacker.yml`: `source_path: frontend`, `packs` | config |
| Install scripts | `dev-install/ubuntu22.sh` | repo |

**[I]** El entorno `kubernetes` no implica solo K8s: se usa en Docker compose local como perfil de despliegue “completo” (Redis, Sidekiq, eventos).

---

## 5. Base de datos y migraciones

| Item | Valor [F] |
|------|-----------|
| Motor | PostgreSQL 14 (compose) |
| Migraciones | ~127 bajo `db/migrate/` |
| Baseline | `20220113150945_merge_all_migrations.rb` (squash) |
| Schema | `db/schema.rb` — orden de **~116 tablas** |
| Soft-delete | `acts_as_paranoid` en gemset |
| Seeds | `db/seeds.rb` (voluminoso) + `db/seeds/*.rb` scripts de corrección |

**Temas de esquema observados [F]:** users/family_member_users, seasons, plannings/time_intervals/activities/activity_instances, activity_applications/desired_*, payments/due_payments/payment_schedules/payer_payment_terms, adhesions, rooms, evaluations, formules, plugins, OIDC tables, event_store_*.

---

## 6. Autenticación y autorización

### AuthN [F]

- Devise en `User` (`:database_authenticatable`, `:token_authenticatable`, `:registerable`, `:recoverable`, `:rememberable`, `:trackable`, `:validatable`) — `app/models/user.rb`
- Rutas Devise bajo path `u` — `config/routes.rb`
- Controllers propios: `SessionsController` (login email o `adherent_number`, multi-cuenta, token), registrations/confirmations/passwords
- `ApplicationController` → `before_action :authenticate_user!`

### AuthZ [F]

- `Ability#initialize` (`app/models/ability.rb`):
  - admin → `can :manage, :all`
  - teacher → planning propio, usuarios, mensajes
  - todos → self + familia + `attached_accounts`; pagos/applications acotados
  - teachers opcionales sobre applications vía parámetro + `Abilities::ActivityApplicationAbilities`

**Riesgo observado [F]:** uso ad-hoc de `authorize!` y a veces con booleanos (`is_admin`) en controllers (anti-patrón CanCanCan). Cobertura inconsistente [I].

### OIDC / OAuth2 [F/?]

- Endpoints Rack: `lib/authorization_endpoint.rb`, `lib/token_endpoint.rb`
- Rutas `namespace :oidc` + tablas OIDC en schema
- **[?]Falta en este clone:** modelos/controllers `Oidc*` bajo `app/`; gems `rack-oauth2` / `openid_connect` **no** aparecen en `Gemfile` → posible plugin privado no presente aquí

---

## 7. API, servicios y background

| Tipo | Estado [F] | Evidencia |
|------|------------|-----------|
| API | Principalmente **HTML/ERB + JSON de controllers** (no API versionada pública clara) | `routes.rb` flat resources |
| Serializers | AMS + fast_jsonapi | `Gemfile`, `app/serializers` |
| Sidekiq | Opt-in `USE_SIDEKIQ=true` | `config/initializers/sidekiq.rb` |
| ActiveJob default | `:async` en development/production | `config/environments/*` |
| Jobs clave | precios max, CSV import, switch season, sync due payments, plugin init, notificaciones AA | `app/jobs/*` |
| Cron | `elvis:clean_big_tables`, `elvis:fix_activities_ti` | `config/schedule.rb` |
| Eventos modelo | create/update/destroy → EventHandler **solo si** `Rails.env.kubernetes?` | `ApplicationRecord` |

---

## 8. Frontend / UI

| Aspecto | Hecho [F] |
|---------|-----------|
| Patrón | **Multi-page + islas React** (`react_component` UJS), no SPA única |
| Entry | `frontend/packs/app.js` → `ReactRailsUJS.useContext(require.context('components'))` |
| Dominios UI | Planning, ActivitiesApplications (wizard), Users, Payments, PreApplication, Practice, Plugins… |
| Calendarios | FullCalendar React 5, tui-calendar, week/year calendars forks SIXMON |

---

## 9. Pruebas automatizadas

| Suite | Observación [F] |
|-------|-----------------|
| RSpec | `spec/` presente (`rails_helper`, factories, models, services) — **volumen bajo** (~7 archivos en listado; no se midió cobertura %) |
| Minitest | `test/` (~20 files) + `minitest-rails` |
| Capybara | en Gemfile grupo test |

**[I]** La densidad de tests parece insuficiente frente al tamaño del dominio (~116 tablas).  
**[?]** No se ejecutó la suite en esta fase (fuera de inventario estático).

---

## 10. CI / CD

| Workflow | Función [F] |
|----------|-------------|
| `.github/workflows/main.yml` | Auto-release al cambiar `lib/elvis/version.rb`; notifica marketplace de plugins |
| `.github/workflows/public_tag_container.yml` | (tagging/container — no expandido aquí) |

**No hay [F]** en `main.yml` un pipeline de `rspec`/`test` como gate de merge en el fragmento leído → CI orientado a **release/versión**, no a quality gate [I].

---

## 11. Despliegue

- Docker Compose / imagen GHCR / script Ubuntu — `README.md`
- Storage: local / Azure blob / AWS S3 (`Gemfile`, `STORAGE_ACCOUNT` en compose)
- Health: `/ping`, `/health` — routes + healthcheck compose

---

## 12. Observabilidad y errores

| Mecanismo | Evidencia [F] |
|-----------|---------------|
| Sentry | `sentry-ruby`, `sentry-rails` |
| Semantic logger | `rails_semantic_logger` |
| Performance | `rails_performance`, mini-profiler |
| ErrorRegisterJob + ErrorCatcher | listeners / jobs |
| Soft domain errors | tablas `error_codes` / `error_histories` en schema (por confirmar uso) |

---

## 13. Plugins y personalización

Documentado en `docs/Plugin-Create.md`, `Plugin-UtilisationAndConf.md`, `ElvisLib.md`.

Mecanismos [F]:

1. **Plugin gems** listados vía `plugins.json` / `PLUGINS_LIST_DOWNLOAD_URL` → `PluginGemUtils` → entradas dinámicas en `Gemfile`
2. **`Elvis::PluginLoader.db_load`** — rutas, locales, views, `init.rb`, assets, menús desde `config.json`
3. **EventHandler** + `EventSubscription` (DB-driven)
4. **`Elvis::Hook`** (patrón Redmine `call_hook`) — paralelo al event store
5. **Parameters** (`Parameter.get_value`) — configuración runtime

**En este clone [F]:** no hay carpeta `plugins/` ni `plugins.json` → core sin plugins instalados.

---

## 14. Licencia y reutilización

| Aspecto | Detalle [F] |
|---------|-------------|
| SPDX | GPL-3.0 (`LICENSE`) |
| Linaje | README: código originado como **Ziggy** (Le CEM / Sixmon); `config/settings.yml` aún cita copyright **Redmine** |
| Implicación | Código derivado enlazado → obligaciones copyleft GPL-3; documentación/ideas ≠ copia de código |
| Recomendación preliminar [I] | Tratar Elvis como **referencia conceptual**; implementar dominio propio en stack del producto (p.ej. Track A/B de Gmusic) sin volcar código GPL al monorepo sin decisión legal explícita |

---

## 15. Conteos rápidos (este clone)

| Recurso | Cantidad aprox. [F] |
|---------|---------------------|
| Modelos `.rb` en `app/models` | ~101 |
| Controllers | ~72 |
| Componentes React top-level | ~72 |
| Migraciones | ~127 |
| Gems declaradas (sin plugins dinámicos) | ~73 |
| Líneas `routes.rb` | 659 |
| Spec files (scan) | ~7 |
| Test files (scan) | ~20 |

---

## 16. Riesgos / limitaciones iniciales (pre-Fase 2)

1. **GPL-3** — límite duro a copiar código.  
2. **Rails 6.1 EOL** + Ruby 3.3 — deuda de plataforma.  
3. **Sin Gemfile.lock** — incertidumbre de versiones exactas.  
4. **OIDC incompleto en disco** — no afirmar SSO listo sin más evidencia.  
5. **Eventos AR solo en `kubernetes`** — comportamiento distinto entre entornos.  
6. **Sidekiq no default en production.rb** — riesgo de jobs en `:async`.  
7. **CanCanCan irregular** — permisos pueden depender de UI.  
8. **Linaje Redmine/Ziggy** — hooks/settings residuales pueden confundir el diseño “puro”.  
9. **Plugins fuera del clone** — marketplace y Stripe libs no inspeccionables aquí.  
10. **Cobertura de tests aparentemente baja** — flujos críticos poco blindados.

---

## 17. Archivos revisados (Fase 1)

- `README.md`, `LICENSE`, `Gemfile`, `.ruby-version`, `package.json`, `lib/elvis/version.rb`
- `docker-compose.yml`, `Dockerfile` (cabeza)
- `config/routes.rb`, `config/settings.yml`, `config/schedule.rb`, `config/shakapacker.yml`
- `.github/workflows/main.yml`
- `app/models/ability.rb`, inventario `app/models`, `app/controllers`, `app/jobs`, `app/listeners`, `app/chewy`
- `lib/elvis/*` (plugin + event), `lib/authorization_endpoint.rb`, `lib/token_endpoint.rb`
- `docs/Plugin-*.md`, `docs/EventListeners.md`, `docs/ElvisLib.md`
- `db/migrate` (conteo + temas), `db/schema.rb` (temas), `db/seeds.rb` (existencia)
- `frontend/packs/app.js`, inventario `frontend/components`

Exploración asistida: agente de inventario [Phase 1 Elvis](49141659-377f-4caf-a9f3-95b5822a58f2).

---

## 18. Qué falta revisar (siguiente etapa)

Prioridad para **Fase 2–4**:

1. Agregados de dominio: `User`/`FamilyMemberUser`, `Season`, `ActivityApplication`, `Planning`/`TimeInterval`/`Activity`, `Payment`/`DuePayment`/`PaymentSchedule`
2. Servicios en `app/services` (si existen) y lógica gruesa en controllers
3. Wizard frontend `ActivitiesApplications` / `PreApplication`
4. Máquinas de estado de `ActivityApplicationStatus`
5. Flujo `SwitchSeasonJob` y generation de due payments
6. Contratos exactos de plugins (`PluginLoader` línea a línea)
7. Ejecutar o muestrear specs reales
8. Confirmar tablas OIDC vs código ausente (¿plugin?)

---

## 19. Documentos a crear (plan de entregables)

| # | Archivo | Estado |
|---|---------|--------|
| 1 | `01-repository-overview.md` | **Este documento** |
| 2 | `02-architecture.md` | Pendiente Fase 2 |
| 3 | `03-domain-model.md` | Pendiente Fase 3 |
| 4 | `04-business-flows.md` | Pendiente Fase 4 |
| 5 | `05-extension-mechanisms.md` | Pendiente Fase 5 |
| 6 | `06-quality-risks.md` | Pendiente Fase 6 |
| 7 | `07-target-domain-proposal.md` | Pendiente Fase 7 |
| 8 | `08-adoption-matrix.md` | Pendiente Fase 8 |
| 9 | `09-implementation-roadmap.md` | Tras análisis |
| 10 | `10-open-questions.md` | Continuo |

**Ubicación:** `docs/elvis-analysis/` (workspace Gmusic). Código fuente citado: Desktop `/Users/juanlizamah/Desktop/elvis`.
