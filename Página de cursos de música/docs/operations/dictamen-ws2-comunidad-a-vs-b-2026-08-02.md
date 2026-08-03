<style id="__eh-preload">span.w-full.text-start.block.truncate,div > button > div:nth-of-type(2) > div:nth-of-type(1) > span:nth-of-type(1),div.\!mt-0 > div > div > div > span,div.\!mt-0 > div:nth-of-type(1) > div:nth-of-type(2) > div > span,div[class*="dframe-recents-by-mode"] > div:nth-of-type(1) > div > div:nth-of-type(2),button#base-ui-_r_o_ > span:nth-of-type(2) > span:nth-of-type(1),button#base-ui-_r_o_ > span:nth-of-type(2) > span:nth-of-type(1){display:none!important;visibility:hidden!important;opacity:0!important;height:0!important;}</style># Dictamen WS2 v2 — Comunidad: A (re-lock) vs B+ (formalizar abierta + saneo de mocks)

**Fecha:** 2026-08-02
**Para:** Juan
**Estado:** DICTAMEN ENMENDADO — cero implementación hasta frase de control §9
**Verificación:** Cursor cotejó la v1 contra `main` (2026-08-02): **coincide**. Mocks confirmados en Comunidad: panel curado con links `example` y «Canción del mes» falsa, visibles a suscriptores.
**Enmienda clave:** **B puro queda descartado** — mantener la tab abierta sin tocar los mocks choca con D-F6-ANTI-DEMO-001 (zona real sin mocks de demo). B pasa a ser **B+**.

---

## 1. Evidencia (verificada contra main)

| Fuente | Dice |
|---|---|
| `docs/flows/05-comunidad-resumen.md` + handoff `2026-06-30-comunidad-mvp-handoff.md` (F8 / T-MVP-COMMUNITY) | Nav Comunidad **bloqueada** («header locked / NO HABILITADO») hasta feed real |
| `main`: `GmusicInternalHeader.tsx` → `page: "community"`; tests «sin candado» | Tab **desbloqueada** desde ~30 Jun 2026 |
| `main`: UI Comunidad | **Mocks visibles**: panel curado con links `example`, «Canción del mes» falsa |

**Contradicción activa:** docs dicen cerrada, código la abre, y lo abierto muestra contenido simulado a alumnos reales. Cualquier opción elegida cierra el gap; el estado mixto no puede quedar.

## 2. Opción A — Bloquear hasta feed real

**Efecto:** re-lock del tab (candado/modal) alineado a `flows/05` y T-MVP-COMMUNITY; nadie ve contenido falso; docs quedan coherentes casi sin editarse.
**Riesgos:** regresión de UX percibida (~1 mes abierta → «me sacaron algo»); tercer cambio futuro cuando llegue el feed real; los tests «sin candado» se invierten (ajuste legítimo de contrato, prohibición 13).
**Costo:** diff código + tests; docs casi intactos.

## 3. Opción B+ — Formalizar abierta + saneo de mocks (mismo diff)

**Efecto:** la tab queda abierta y, **en el mismo trabajo**, se quitan o etiquetan los mocks: estado vacío honesto o «próximamente»; cero «Canción del mes» falsa, cero links `example`. Se actualizan `flows/05`, `docs/flows/README.md`, `PROJECT_STATUS` y handoffs con la narrativa «UI parcial habilitada en nav ≠ producto lanzado».
**Límites duros:** sin tocar entitlements/`communityAccess` ni backend; sin inventar feed; tests ajustados al nuevo contrato o agregados; jamás narrar «Comunidad LANZADA».
**Riesgos:** expectativa de feed real (mitigada por el copy honesto); el diff ya no es solo docs — incluye limpieza de UI.
**Costo:** diff docs + limpieza acotada de UI + tests.

## 4. Recomendación técnica (opcional — NO es decisión)

Fable y Cursor convergen de forma independiente: si **no hubo quejas ni confusión de alumnos este mes** → **B+** (camino corto y honesto); si preferís **cero riesgo de expectativa** → **A**. El dato de quejas es tuyo y define el desempate.

## 5. Pregunta binaria (una sola frase)

- `OK Comunidad: bloquear hasta feed` → implemento **A**
- `OK Comunidad: formalizar abierta` → implemento **B+ tal como está definido en §3** (no B puro)
- `STOP` / `solo dictamen` → congelo; queda solo este análisis

---

*Fin del dictamen v2. Sin frase de control no se toca código ni docs de Comunidad.*
