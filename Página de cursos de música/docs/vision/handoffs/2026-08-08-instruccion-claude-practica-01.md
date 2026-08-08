# Instrucción a Claude (Opus) — 8 Ago 2026

**De:** Juan (vía Cursor)  
**Para:** Claude / Opus — arquitecto  
**Decisión:** `D-GOV-PRACTICA-01` @ `49d0547` (rama `fix/t-ux-lesson-01-f1-f2`)

---

## Retomar Gmusic

### Contexto

Juan confirma el norte de producto: **primero la plataforma de guitarra interactiva** (crear un ejercicio → funciona en Práctica / en cualquier etapa), **después** el montaje completo de clases (teoría, armonía, orden pedagógico — aún no 100% cerrado). Material YouTube/PDF finales = a su tiempo.

Diferenciador vs Simply Guitar / Yousician: ellos empujan tocar canciones; Gmusic quiere **motor de práctica + teoría/armonía** encima — pero el motor no debe esperar a tener el currículo 100% cerrado.

### Qué ya está (no reabrir como bloqueador)

- **F1/F2** en `fix/t-ux-lesson-01-f1-f2`: PDF 1:1 + sin id interno en UI; evidencia local OK (smoke + video stub firmado en tarjeta).
- Cáscara **Tarjetas · Práctica · Resumen PDF** = layout aprobado (`D-UX-LAYOUT-01`); es cimiento, **no** el ticket activo.
- Merge H1 = **secundario** (cuando Juan diga OK); no es la prioridad de diseño ahora.
- Referencia: `docs/ux/GUITARRA-INTERACTIVA-REFERENCIA.md`
- WIP código aparcado (sin ticket): rama `wip/guitarra-interactiva-sin-ticket` — **no merge** a F1/F2 ni `main` hasta brief + «arrancar».

### Tu trabajo (Opus) — ahora

1. Leer: `D-GOV-PRACTICA-01` · `PRIORIDAD-INFRA-ANTES-QUE-MATERIAL.md` · `GUITARRA-INTERACTIVA-REFERENCIA.md` · `ESTRUCTURA-JSON-MODO-PRACTICA.md` · WIP branch solo como inventario (no proponer merge ciego).
2. **Brainstorming** (Superpowers): ¿cuál es el MVP mínimo del motor para que “nuevo ejercicio = datos + enganche”, sin depender de YouTube ni del mapa completo de clases?
3. Entregar **spec + plan** (no código):
   - Contratos de ejercicio (payload / MicroExercise / fretboardRole / invariantes).
   - Dónde se enchufa en pestaña **Práctica** (runner, diapasón, complete/sesión).
   - Criterios done verificables para Cursor.
   - Fuera de alcance explícito: auth, pagos, schema grande, Track B, material producción, rediseño de Tarjetas/Resumen.
4. Brief ≤15 líneas para Cursor con palabra **Retomar Gmusic**.
5. **HARD-GATE:** no autorizar implementación hasta Juan apruebe el spec y diga **«arrancar»** (o frase equivalente explícita).

### Qué NO hacer

- No pedir material YouTube/PDF como siguiente paso.
- No convertir el cierre H1 / merge F1-F2 en el epic principal.
- No codear ni pedir a Cursor que fusione el WIP sin ticket + «arrancar».
- No diseñar ahora el currículo completo de teoría/armonía como prerequisito del motor (puede ir en paralelo documental).

### Criterio de éxito de esta fase Opus

Juan tiene un **plan aprobable** para arrancar el motor de Práctica: un ejercicio de prueba se define una vez y corre en la plataforma sin rehacer infra.
