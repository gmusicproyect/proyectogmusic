# Diagramas de flujo — canon Track A

**Estado:** Canon doc-only · auditoría 6 Jul 2026  
**Fuente visión:** `docs/vision/specs/2026-07-02-admin-platform-vision.md`  
**Regla de mantenimiento:** ver `.agents/DECISIONS.md` → *Diagramas de flujo (canon)*

---

## Convención de colores (Mermaid)

| Estilo | Significado | Fill / stroke sugerido |
|--------|-------------|-------------------------|
| Nodo normal | Existe y funciona en prod/dev según spec | Sin estilo especial |
| `{{Parcial / deuda}}` | Implementado incompleto, bug conocido o decisión sin código | `#3a2a1a` / `#ffaa55` |
| `[["NO EXISTE"]]` | Por construir; sin UI/API de producto | `#3a1a1a` / `#ff5555` |
| Subgraph título | Sección o módulo agrupado | Según contexto |

En GitHub/Cursor el render puede variar; la leyenda de cada diagrama repite la convención.

---

## Índice de secciones

| # | Archivo | Zona | Orden visión admin | Sprint actual |
|---|---------|------|-------------------|---------------|
| 1 | [01-funnel-auth-landing.md](./01-funnel-auth-landing.md) | Visitante → registro/login → demo o suscriptor | — (público) | Mantenimiento |
| 2 | [02-mi-camino-suscriptor.md](./02-mi-camino-suscriptor.md) | Alumno pagante `/mi-camino` | Academia (consumo) | Piloto materia |
| 3 | [03-admin-contenido.md](./03-admin-contenido.md) | Admin Academia bloques 5 etapas | **Fase B** (activa) | Post Phase B |
| 4 | [04-usuarios-comunicacion-fase-f.md](./04-usuarios-comunicacion-fase-f.md) | Usuarios + comunicación | **Fase F propuesta** | **No siguiente sprint** |
| 5 | [05-comunidad-resumen.md](./05-comunidad-resumen.md) | Comunidad C2 + mapa completitud | Fase C (después Captación) | Referencia |

**Orden aprobado admin-platform-vision:** Academia → Evaluación / Captación (Fase E) → Comunidad (Fase C) → Landing (Fase D) → **Usuarios/Comunicación (Fase F, propuesta)**.

---

## Deuda de flujo (caminos sin cierre)

Caminos que el producto **no resuelve aún** — documentados en diagramas, no implementados.

| Camino | Diagrama | Backlog / nota |
|--------|----------|----------------|
| Login post-auth: suscriptor vs demo vs **ADMIN sin ruta `/admin`** | 01 | **T-FLOW-01** (fila backlog) |
| Registro prod / CORS / formulario liviano | 01 | **D-GOV-16 / T-REG-01** (decisión pendiente Juan) |
| Checkout / pago real | 01 | Fase 5 congelada hasta conversión WhatsApp |
| PDF alumno (`guidePdfUrl` no en path API) | 02 | **T-FLOW-02** |
| Retry ejercicios sin límite ni feedback pedagógico al fallar | 02 | Deuda confirmada; ticket cuando Opus priorice |
| Re-render / update depth GmusicPath | 02 | **T-FLOW-05** (R-009 A2, repro en runtime) |
| Pantalla fin de nivel / fin de todo el contenido | 02 | **T-FLOW-04** |
| Badge «Publicado legacy» (D-GOV-17 Opción B) | 03 | **T-FLOW-03** |
| Multi-curso (hardcoded `ruta-guitarra-12-meses`) | 03 | Post-piloto; decisión arquitectura |
| CRM usuarios + email admin | 04 | Fase F; requiere OK Juan/Opus + auth |
| Reengagement automatizado | 04 | D-PROD-03 Fase 2 (post-100 usuarios) |
| Moderación admin de posts | 05 | No existe; Fase C comunidad |
| Mensaje 403 rol incorrecto | 02 | **T-UX-01** (ticket existente) |

### Observaciones (no ticket hasta repro formal)

| Observación | Diagrama | Condición para ticket |
|-------------|----------|------------------------|
| Scroll flicker iPhone en landing | 01 | Repro en dispositivo + pasos en `docs/operations/` |

*(Re-render GmusicPath → **T-FLOW-05**, no observación suelta.)*

---

## Matriz de confianza (auditoría 6 Jul 2026)

Referencia al auditar prod o priorizar sprints.

| Confianza | Ítems |
|-----------|--------|
| **Alta** | Admin CRUD publish/delete; path suscriptor vía `loadPublishedCoursePath`; guard 403 → T-UX-01; checkout ausente; comunidad sin moderación admin; multi-curso hardcoded; badge legacy decidido sin UI |
| **Media** | Flicker iPhone; fin de camino UX; registro prod estable |
| **Baja (ticket)** | T-FLOW-05 update depth GmusicPath (R-009 A2) |
| **Corregido en canon** | Login no siempre demo; sin replay en nodos `completed`; PDF solo admin; D-BRAND-02 = éxito XP/racha; tests app **557/557** |

**Evidencia tests (6 Jul 2026):** `npm run app:test` → 557 pass / 0 fail.

---

## Backlog flujo (filas en DECISIONS)

| ID | Título |
|----|--------|
| T-FLOW-01 | Post-auth routing login (demo / suscriptor / admin) |
| T-FLOW-02 | Exponer `guidePdfUrl` en path API + UI alumno |
| T-FLOW-03 | Badge «Publicado legacy» en admin UI |
| T-FLOW-04 | Pantalla fin de camino / fin de nivel |
| T-FLOW-05 | Maximum update depth `GmusicPath` (R-009 A2) |

Detalle mínimo en `.agents/DECISIONS.md` → *Backlog operativo*.
