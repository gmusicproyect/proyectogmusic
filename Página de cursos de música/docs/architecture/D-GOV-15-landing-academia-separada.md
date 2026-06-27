# D-GOV-15 — Landing pública separada del onboarding académico

**Estado:** Aprobada — pendiente implementación (Juan, 27 Jun 2026)  
**Fecha:** 2026-06-27  
**Área:** Producto / UX / Funnel / Landing — **regla de experiencia/onboarding**  
**Ticket de implementación:** **T4A** — ⛔ bloqueado por gates (ver abajo)  
**Relación:** **Complementa D-GOV-11 (no fusionar).** D-GOV-11 = regla de acceso; D-GOV-15 = presentación del camino. Complementa **D-GOV-08**. Reemplazará wizard 2 pasos en `#academia` del landing público (`f20e795`) cuando T4A se implemente.  
**No autoriza implementación** hasta gates T4A completos.

---

## Problema

La landing actual (`GmusicLanding` → `#academia` / `AcademiaSection`) mezcla:

- Presentación emocional de la academia
- Selección de instrumento y nivel (`AcademiaInstrumentSelector`, `InteractiveLevelSelector`)
- CTAs de clase gratis / demo

Eso expone **decisiones internas del camino** (instrumento, nivel, enfoque) **antes** de que el visitante cree su acceso gratis. Genera fricción cognitiva y promete rutas que aún no están implementadas.

---

## Decisión propuesta

La **landing pública** no es el selector de instrumento/nivel.  
La landing **presenta**, **da bienvenida** y **conduce a crear acceso gratis**.

La **selección de instrumento + nivel** vive **después** de registro + quiz, en un paso dedicado del onboarding (no en `#academia` del home anónimo).

---

## Flujo canónico propuesto

```
Landing pública (home)
  └── Sección bienvenida Academia (emocional, sin wizard)
        └── CTA principal: «Crear acceso gratis»
              └── registro-cuenta
                    └── registro-exito («Gracias por inscribirte… 5 clases»)
                          └── onboarding-quiz (/quiz-temperamento)
                                └── Selección instrumento
                                      └── Selección nivel / enfoque
                                            └── CTA «Iniciar mis clases gratis»
                                                  └── mi-camino-demo
```

**Regla:** el visitante anónimo en `/` **no** ve el wizard 2 pasos de Academia. Solo ve bienvenida + CTA de acceso.

---

## Cambio visual recomendado — `#academia` en landing pública

Reemplazar `AcademiaInstrumentSelector` + `InteractiveLevelSelector` por una **sección de bienvenida**:

| Elemento | Contenido |
|----------|-----------|
| Imagen | Academia / alumno practicando / instrumentos (asset existente o futuro) |
| Copy | Texto emocional alineado a **D-BRAND-01** |
| CTA principal | **«Crear acceso gratis»** → `registro-cuenta` |
| CTA secundario (opcional) | **«Ver cómo funciona»** → scroll a demo preview o sección explicativa (sin iniciar quiz/demo) |

**Prohibido en landing anónima:** CTAs que prometan clase gratis sin cuenta · wizard instrumento/nivel · navegación directa a `mi-camino-demo` desde `#academia`.

---

## Reglas de niveles (post-registro)

Aplica en el paso **Selección nivel** del onboarding (no en landing):

| Ruta | CTA |
|------|-----|
| **Fundamento Básico** (única ruta demo implementada — D-003 / `isFreeClassTrack`) | **«Iniciar mis clases gratis»** → `mi-camino-demo` |
| Resto de combinaciones 3×3 no implementadas | **«Próximamente»** o **«Disponible en el camino completo»** — sin navegación al demo |

**Principio:** evitar que todos los niveles prometan clase gratis si no tienen contenido jugable.

---

## Estado actual del repo (referencia — jun 2026)

| Item | Estado |
|------|--------|
| Auth registro + cookie cross-origin | `dd7c11e` + deploy Render |
| Post-registro → quiz → `#academia` | `5c46ec1` (quiz redirige a home#academia) |
| Wizard 2 pasos en landing `#academia` | **Sigue publicado** — D-GOV-15 lo reemplazaría |
| `registered_no_sub` → demo | `5c46ec1` — CTA «Iniciar mis clases gratis» |

---

## Gates de implementación T4A (orden obligatorio)

1. **Deploy API Render** con auth JWT + `JWT_SECRET` + CORS — smoke OK  
2. **Smoke auth** — `POST /auth/register` 201 + cookie + `/me/access` → `registered_no_sub`  
3. **QA registro prod** (incógnito): registro → regalo → quiz → instrumento/nivel → demo sin re-login  
4. **Brief Opus T4A** aprobado  
5. **Implementación Cursor** (solo entonces)

**No iniciar T4A** mientras falte cualquier gate anterior.

**Aprobación de dirección D-GOV-15:** ✅ Juan, 27 Jun 2026 — **no autoriza código todavía.**

---

## Archivos afectados (futuro — no tocar hasta gate)

| Archivo | Cambio previsto |
|---------|-----------------|
| `AcademiaSection.tsx` | Modo landing (bienvenida) vs modo onboarding (wizard) |
| `GmusicLanding.tsx` | Pasar modo/contexto a Academia |
| Nueva página o sub-flujo | `onboarding-academia` post-quiz (instrumento → nivel) |
| `InteractiveLevelSelector.tsx` | CTAs «Próximamente» en rutas no free |
| `fundamento-funnel.test.ts` | Actualizar contratos landing vs onboarding |
| `AGENTS.md` | Actualizar tabla Academia 2 pasos |

**Fuera de scope T4A:** auth schema, pagos, Ticket 4 UI adaptativa por temperamento, Track B, R-001/R-002.

---

## Relación con otras decisiones

| ID | Relación |
|----|----------|
| **D-GOV-11** | **Separada — no fusionar.** D-GOV-11 = regla de acceso («demo requiere cuenta»). D-GOV-15 = experiencia visual/onboarding («landing ≠ selector»). |
| **D-GOV-02/03** | `#academia` sigue sin URL pública. Onboarding post-quiz puede ser `currentPage` interno o nueva ruta — requiere extensión D-GOV-02 si se expone URL. |
| **D-GOV-10** | Quiz sigue en `/quiz-temperamento`; CTAs landing ya no enrutan anónimos al quiz desde `#academia` (post T4A). |
| **D-007** | Solo Guitarra activa en instrumentos — se mantiene. |
| **D-003** | Solo Fundamento Básico = clase gratis jugable. |

---

## Criterio de cierre

| Fase | Estado |
|------|--------|
| Dirección de producto | ✅ Aprobada (Juan, 27 Jun 2026) |
| Implementación T4A | ⛔ Bloqueada — gates pendientes |

---

## Preguntas abiertas (implementación T4A)

1. ¿«Ver cómo funciona» hace scroll a una sección nueva o abre modal/video?
2. ¿Onboarding instrumento/nivel en `home#academia` post-login o página dedicada (`onboarding-academia`)?
3. ~~¿D-GOV-11 se fusiona en D-GOV-15?~~ **Resuelto:** mantener **separadas** (Juan, 27 Jun 2026).
4. ¿Copy final del CTA: «Crear acceso gratis» vs «Crea tu acceso gratis» (D-GOV-11)?
