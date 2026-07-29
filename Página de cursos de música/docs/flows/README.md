# Diagramas de flujo — Track A

**Estado:** **CANON CANDIDATO — PARCIALMENTE DESACTUALIZADO**  
**Alineación propuesta:** 20 Jul 2026 · producción observada `d48d163` · local inspeccionado `bf986db`  
**Fuente visión:** `docs/vision/specs/2026-07-02-admin-platform-vision.md`  
**Autoridad de decisiones:** Laboratorio de Decisiones → decisión firmada → proyección en estos archivos.  
**Regla de sync (D-023b, proyección):** un cambio de contrato de flujo de usuario debe actualizar el diagrama de su sección en el mismo lote documental.  
**Índice/resumen posterior (no autoridad):** `.agents/DECISIONS.md` solo como proyección trazable **después** de resolución firmada en el Laboratorio.  
**Decisión Lab:** PENDIENTE-LAB: incorporar ID, ruta, commit y firma después de la aprobación formal

## Condiciones para declarar CANON OPERATIVO DE LOS FLUJOS DE USUARIO

1. Diff aprobado por Juan y lote documental aplicado.  
2. Mermaid válido + enlaces internos OK.  
3. Coherencia con código y producción.  
4. Este README actualizado.  
5. Decisión registrada y firmada en el Laboratorio.  
6. Documentos contradictorios marcados secundarios/históricos.

---

## Convención de colores (Mermaid)

| Estilo | Significado | Fill / stroke sugerido |
|--------|-------------|-------------------------|
| Nodo normal | Existe y funciona en prod/dev según spec | Sin estilo especial |
| `{{Parcial / deuda}}` | Implementado incompleto, bug conocido o decisión sin código | `#3a2a1a` / `#ffaa55` |
| `[["NO EXISTE"]]` | Por construir; sin UI/API de producto | `#3a1a1a` / `#ff5555` |
| LEGACY / residual | Paralelo no canónico o histórico útil | `#2a2a3a` / `#8888aa` |
| Subgraph título | Sección o módulo agrupado | Según contexto |

En GitHub/Cursor el render puede variar; la leyenda de cada diagrama repite la convención.

---

## Índice de secciones

| # | Archivo | Zona | Estado del diagrama | Sprint actual |
|---|---------|------|---------------------|---------------|
| 0 | [00-mapa-maestro.md](./00-mapa-maestro.md) | Mapa global del producto (todas las zonas) | Definitivo 28 Jul 2026 · nodos verificados contra `main` ~`0705032` | Índice vivo |
| 1 | [01-funnel-auth-landing.md](./01-funnel-auth-landing.md) | Visitante → registro/login → demo / WA / suscriptor | Candidato · Track A actual · WA = cierre comercial canónico actual (J-FLOW-01) | Mantenimiento |
| 2 | [02-mi-camino-suscriptor.md](./02-mi-camino-suscriptor.md) | Alumno pagante `/mi-camino` | Candidato · T-FLOW-02 resuelto técnicamente en prod; formalización Lab pendiente · PD-5 documentar | Piloto materia |
| 3 | [03-admin-contenido.md](./03-admin-contenido.md) | Admin Academia bloques 5 etapas | Candidato · alineado CRUD · deuda UI/legacy (T-FLOW-03) separada | Post Phase B |
| 4 | [04-usuarios-comunicacion-fase-f.md](./04-usuarios-comunicacion-fase-f.md) | Usuarios + comunicación | **PROPUESTA — NO IMPLEMENTADO** · **SIN CAMBIOS** en este lote | **No siguiente sprint** |
| 5 | [05-comunidad-resumen.md](./05-comunidad-resumen.md) | Comunidad C2 | **NO LANZADO** · construido (API/persistencia) · no habilitado · UI parcial | Referencia |

**Orden aprobado admin-platform-vision:** Academia → Evaluación / Captación (Fase E) → Comunidad (Fase C) → Landing (Fase D) → **Usuarios/Comunicación (Fase F, propuesta)**.

---

## Deuda de flujo (caminos sin cierre)

Caminos que el producto **no resuelve aún** — o con cierre documental pendiente — documentados en diagramas.

| Camino | Diagrama | Backlog / nota |
|--------|----------|----------------|
| Login post-auth: suscriptor vs demo vs **ADMIN sin ruta `/admin`** | 01 | **T-FLOW-01** — fix en lote 28 Jul, ver Backlog |
| Registro prod / CORS / formulario liviano | 01 | **D-GOV-16 / T-REG-01** |
| Checkout / pago real | 01 | Fase 5 congelada; **no** es cierre comercial actual (WhatsApp sí, J-FLOW-01) |
| `guidePdfUrl` alumno — formalización Lab | 02 | **T-FLOW-02 — RESUELTO TÉCNICAMENTE EN PRODUCCIÓN `d48d163`, PENDIENTE FORMALIZACIÓN DOCUMENTAL** |
| PD-5 entitlements en práctica (documentar) | 02 | Deuda documental / gate técnico presente |
| Retry ejercicios sin límite ni feedback pedagógico al fallar | 02 | Deuda confirmada |
| Re-render / update depth GmusicPath | 02 | **T-FLOW-05** |
| Pantalla fin de nivel / fin de todo el contenido | 02 | **T-FLOW-04 — CERRADO 28 Jul 2026** |
| Badge «Publicado legacy» (D-GOV-17 Opción B) | 03 | **T-FLOW-03 — CERRADO 28 Jul 2026** |
| Multi-curso (hardcoded `ruta-guitarra-12-meses`) | 03 | Post-piloto |
| CRM usuarios + email admin | 04 | Fase F; PROPUESTA — NO IMPLEMENTADO |
| Reengagement automatizado | 04 | D-PROD-03 Fase 2 |
| Moderación admin de posts / lanzamiento Comunidad | 05 | PRODUCTO NO LANZADO |
| Mensaje 403 rol incorrecto | 02 | **T-UX-01** |

### Observaciones (no ticket hasta repro formal)

| Observación | Diagrama | Condición para ticket |
|-------------|----------|------------------------|
| Scroll flicker iPhone en landing | 01 | Repro en dispositivo + pasos en `docs/operations/` |

*(Re-render GmusicPath → **T-FLOW-05**, no observación suelta.)*

---

## Matriz de confianza (referencia)

| Confianza | Ítems |
|-----------|--------|
| **Alta** | Admin CRUD publish/delete; path suscriptor; guards; WhatsApp como cierre Track A actual en código `d48d163`; `guidePdfUrl` en path API+UI `d48d163`; `communityAccess: false` |
| **Media** | Flicker iPhone; fin de camino UX; registro prod estable; UI Comunidad parcial |
| **Baja (ticket)** | T-FLOW-05 update depth GmusicPath |
| **No usar como cifra actual** | tests **557/557** (6 Jul histórico) |

---

## Backlog flujo (proyección; autoridad = Laboratorio)

| ID | Título | Estado técnico / documental |
|----|--------|------------------------------|
| T-FLOW-01 | Post-auth routing login (demo / suscriptor / admin) | **Fix implementado 28 Jul 2026** (lote flujos): `role` expuesto en `/me/access` + rama ADMIN → `/admin` en `resolve-post-login-page` · pendiente OK Juan + `app:test`/`api:test` en máquina local |
| T-FLOW-02 | `guidePdfUrl` path API + UI alumno | **Resuelto técnicamente en producción `d48d163`** · formalización Lab pendiente · PENDIENTE-LAB: incorporar ID, ruta, commit y firma después de la aprobación formal |
| T-FLOW-03 | Badge «Publicado legacy» admin UI | **Cerrado 28 Jul 2026** — `adminModuleStatusLabel` (D-GOV-17 Opción B) en chip de detalle y listado admin · pendiente OK Juan + commit |
| T-FLOW-04 | Pantalla fin de camino / fin de nivel | **Cerrado 28 Jul 2026** — `CompletedPathPanel` al spec (título/frase/CTA Mi Estudio + revisión sin replay); detector `isComplete` ya existente con tests · pendiente OK Juan + commit |
| T-FLOW-05 | Maximum update depth `GmusicPath` | Abierto · **sin repro estático 28 Jul 2026** — evidencia estática + **receta runtime lista para Juan**: `docs/operations/t-flow-05-repro-runtime.md` |

Proyección operativa posterior (no autoridad): `.agents/DECISIONS.md` *Backlog operativo* — solo tras decisión Lab firmada.
