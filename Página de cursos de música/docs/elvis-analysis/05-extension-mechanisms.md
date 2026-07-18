# 05 — Mecanismos de extensión y personalización (Fase 5)

> **Fuente:** `/Users/juanlizamah/Desktop/elvis`  
> **Fecha:** 2026-07-13  
> **Complementa:** `02-architecture.md`, `04-business-flows.md`

Leyenda: **[F]** · **[I]** · **[R]** · **[?]**

---

## Resumen

Elvis ofrece **cuatro vías reales de extensión**:

1. **Plugin gems** (estilo Redmine) — el mecanismo oficial documentado.  
2. **EventHandler / Rails Event Store + listeners** (+ filas `EventSubscription`).  
3. **Parameter** — KV de configuración / feature flags.  
4. **Hooks de vista** (`Elvis::Hook`) — presentes pero **casi sin puntos de anclaje**.

**No hay** inyección de dependencias formal ni Flipper/LaunchDarkly.  
**En este clone [F]:** sin carpeta `plugins/`, sin `plugins.json` → se analiza el **core** de la plataforma de plugins, no plugins activos.

---

## 1. Sistema de plugins (end-to-end)

### 1.1 Cómo se crea una extensión **[F]**

| Paso | Evidencia |
|------|-----------|
| Generar | `rails generate elvis_plugin <name>` → `lib/generators/elvis_plugin/` |
| Scaffold | `plugins/<name>/`: `app/`, `db/migrate`, `config/routes.rb`, `config/config.json`, `init.rb`, `react_component/`, gemspec |
| Docs | `docs/Plugin-Create.md`, `Plugin-UtilisationAndConf.md`, `ElvisLib.md` |
| Empaquetar | rake gem / package (doc) → repo git propio |

### 1.2 Cómo se declara para Elvis **[F]**

Orígenes de lista (`PluginGemUtils` — `lib/elvis/plugin_gem_utils.rb`):

- Local: archivo JSON en raíz (**doc dice `plugin.json`**; naming real suele ser `plugins.json` — inconsistencia **[I]**)  
- Remoto: `ENV['PLUGINS_LIST_DOWNLOAD_URL']` + query `elvisVersion=` (`lib/elvis/version.rb`)

`Gemfile` L125–132 añade cada plugin como **gem git** (tag/branch).

Ops rake (`lib/tasks/elvis.rake` + doc):  
`discover` → `install_npm_dependencies` → `copy_react` → `assets` → `migrate`.

### 1.3 Contrato runtime — `Elvis::PluginLoader.db_load` **[F]**

Archivo: `lib/elvis/plugin_loader.rb`

Para cada `Plugin` con `activated_at` presente, en orden de `id`:

1. **Routes** — `routes.prepend` + `instance_eval` de `config/routes.rb`  
2. **Locales** — `config/locales/*.yml`  
3. **Views** — prepend `app/views`  
4. **Require** `#{plugin.name}.rb`  
5. **`config.json`** — settings + menus (`Elvis::MenuManager`)  
6. **`init.rb`** — `PluginPath#run_initializer`  
7. **Assets** — mirror a `public/plugin_assets`  
8. **`EventHandler.plugins.loaded.trigger`**  
9. **`reload_routes!`**

Resolución de path: ``bundle show #{name}`` vía `Plugin#absolute_path`.  
Descubrimiento de módulo: `ObjectSpace.each_object(Module)` — costoso/frágil **[I]**.

### 1.4 Boot / activación UI **[F]**

| Pieza | Evidencia |
|-------|-----------|
| Boot | `config/initializers/30-elvis.rb` → `PluginInitJob` (`perform_now` / `later` si kube start) |
| Job | `app/jobs/plugin_init_job.rb` — fuerza `queue_adapter = :async`; llama `db_load` |
| Modelo | `app/models/plugin.rb` — settings Redmine-like, menus, migrator versionado `"#{version}-#{plugin.id}"` |
| UI | `PluginsController#changed` — activa/desactiva, puede rollback migrate, `plugins_state.changed`, `tmp/restart.txt` |
| Listener | `PluginStateListener` → `EventHandler.plugin_<name>.activated|deactivated` |

### 1.5 Libraries vs plugins **[F]**

Flag `isLibrary: true` en lista JSON: gem instalada pero **no** pasa por `db_load` ni UI admin (doc `ElvisLib.md`).

### 1.6 Riesgos de este mecanismo **[F/I]**

- Mutación global de routes/views en boot.  
- Restart vía `tmp/restart.txt`.  
- Multi-pod: carga asíncrona puede divergir.  
- Migraciones de plugins ensucian `schema.rb` (doc: no commitear).  
- Licencia: núcleo **GPL-3**; template plugin MIT — ambigüedad legal de derivados **[I]**.  
- Este clone **no valida e2e** el camino sin restaurar lista de plugins.

### 1.7 Estrategia recomendada para añadir funciones **[R]**

1. Preferir **plugin gem** si la feature es opcional / white-label / marketplace.  
2. Emite/consume **EventHandler** en lugar de editar controllers 2k LOC.  
3. Flags de comportamiento vía **Parameter**.  
4. Formularios vía filas **Question** si el tipo cabe.  
5. Evitar crecer el core; si hace falta un `call_hook`, añadirlo deliberadamente (hoy casi no hay puntos).

---

## 2. Eventos de dominio

### 2.1 API **[F]**

```text
EventHandler.<group>.<event>.subscribe(async?) { |sender:, args:| ... }
EventHandler.<group>.<event>.trigger(sender:, args:)
```

Implementación: `lib/elvis/event_handler.rb`, `event_group.rb`, `event.rb`  
Async → subclase dinámica de `BaseEventJob` + Rails Event Store.

### 2.2 Emisión automática desde AR **[F]**

`ApplicationRecord` (solo `kubernetes`):

- `create` / `update` / `destroy` → `EventHandler.<model>.*`  
- Payload incluye `changes` + `controller_params` (RequestStore)

### 2.3 Listeners in-tree **[F]**

`UserListener`, `SeasonListener`, `NotificationListener`, `PluginStateListener`, `ParameterListner` (typo), pricing listeners, `BddListeners`, `ErrorCatcher`.

Boot: `config/initializers/50-event_subscriber.rb` → `BaseListener.subclasses.each(&:subscribe)`.

### 2.4 `EventSubscription` (DB-driven) **[F]**

Modelo `app/models/event_subscription.rb`: filas con group/event/class/async; clase debe implementar `execute(sender:, args:, sauv_params:)`.  
`BddListeners` recarga suscripciones.

### 2.5 `EventRules` **[P/F]**

Diseñado para filtrar notificaciones por roles (`is_admin`, `is_teacher`, `is_paying`); **uso comentado** en `NotificationListener` → hoy las notifs gated no aplican.

### 2.6 Contrato a respetar **[R]**

- Bloques con exactamente `sender:` y `args:`.  
- Preferir triggers explícitos en services (portables entre envs).  
- No confiar en auto-AR fuera de kubernetes.  
- Evitar payloads con PII completa en RES si hay retención limitada.

---

## 3. Hooks estilo Redmine **[F]**

| Pieza | Path |
|-------|------|
| API | `Elvis::Hook.call_hook` — `lib/elvis/hook.rb` |
| Listeners | `lib/elvis/hook/listener.rb`, `view_listener.rb` |
| Helper | `ApplicationHelper` incluye Hook::Helper |

**Únicos call sites observados en app:**

- `app/views/layouts/application.html.erb` — `:view_layouts_application_html_head` / `_html_body`

**[I]** Extensión por hooks de vista **infrautilizada** frente a EventHandler/plugins.

---

## 4. Parameter (config / feature flags) **[F]**

`app/models/parameter.rb`:

- Tipos: json, float, int, boolean, duration, string  
- `Parameter.get_value(label, default:)` con cache 1h  
- Invalidación vía `ParameterListner`

Ejemplos de labels: `activity_applications.authorize_teachers`, `adhesion.enabled`, `planning.recurrence_activated`, `system.show_plugins`, `app.cache.*`, SMTP `app.email.*`.

**Paralelo [F]:** Redmine `Setting` + `config/settings.yml` — **doble superficie** de config.

**[R]** Unificar criterios: Parameter = school runtime; secrets fuera de DB (SMTP password en Parameter es riesgo).

---

## 5. Otros mecanismos

| Mecanismo | Estado | Evidencia |
|-----------|--------|-----------|
| DI container | **No observado** | Services con `.new(...).execute` |
| Feature flags SaaS | **No** | Solo Parameter / plugin activated / booleans |
| Menús | **Sí** | `Elvis::MenuManager` + plugin `config.json` |
| Questionnaires | **Parcial** | `Question` DB-driven (`field_type`, opciones); nuevos tipos = código |
| Serializers / React plugin UI | **Sí** | `rake elvis:plugins:copy_react` → `frontend/components/plugins/<name>` |
| Ability extensible | **Débil** | Central en `Ability`; plugins no tienen contrato claro de authz |

---

## 6. Cómo añadir una capacidad sin alterar el núcleo (receta) **[R]**

```text
1. Definir evento de dominio (nombre estable)
2. Implementar use-case en service del plugin
3. Suscribir listener (código o EventSubscription)
4. Exponer UI React vía copy_react + route plugin
5. Toggle con Parameter / activated_at
6. Tests de contrato del evento + migración aislada
7. No modificar ActivitiesApplicationsController salvo hook/event indirection
```

Si la feature es **core de producto** (no opcional): mejor bounded context en el monólito **propio** (no copiar GPL), no plugin Elvis.

---

## 7. Acoplamientos peligrosos al extender **[F/I]**

| Acoplamiento | Por qué duele |
|--------------|---------------|
| Fat controllers | Cualquier “pequeño” cambio toca 1–2k LOC |
| RequestStore en eventos AR | Filtra params HTTP al bus de dominio |
| `authorize! …is_admin` | Authz falsa |
| Jobs `:async` forzados | Sidekiq no recibe plugin init / async events |
| ObjectSpace + `bundle show` | Boot frágil |
| Season/User hubs | Plugin que toque familia/pagos arrastra todo |

---

## 8. Archivos revisados (Fase 5)

- `lib/elvis/plugin_loader.rb`, `plugin_gem_utils.rb`, `hook.rb`, `event*.rb`
- `app/models/plugin.rb`, `parameter.rb`, `event_subscription.rb`, `event_rules.rb`
- `app/jobs/plugin_init_job.rb`, `app/listeners/*`, `PluginsController`
- `docs/Plugin-*.md`, `ElvisLib.md`, `EventListeners.md`
- `Gemfile` (bloque plugins), `30-elvis.rb`, `50-event_subscriber.rb`
- Layout `application.html.erb` (hooks)
- Generators `lib/generators/elvis_plugin/`
- Exploración: [plugins & risks](3de2e84f-73c4-4d8c-a7ee-2c03c9e410db)

---

## 9. Incertidumbres **[?]**

1. Contenido real del marketplace `elvis-plugins-marketplace` (Stripe, etc.).  
2. `plugin.json` vs `plugins.json` en deploys reales.  
3. Si EventRules se reactivará.  
4. Política legal exacta de plugins MIT sobre host GPL.
