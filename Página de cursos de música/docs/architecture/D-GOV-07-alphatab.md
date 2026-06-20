# D-GOV-07 — Integración de alphaTab para lecciones interactivas

**Estado:** Propuesta — pendiente aprobación  
**Fecha:** 2026-06-20  
**Área:** Stack técnico / Experiencia de lección  
**Scope:** Nivel Intermedio — fuera de scope para fase actual

---

## Contexto

Durante el diseño del curriculum de guitarra (ver
`docs/skills/music/curriculum-guitarra.md`), se identificó la necesidad
de ejercicios interactivos que permitan al alumno ver y escuchar
tablaturas animadas dentro de la plataforma, sin instalar software externo.

JP usa Guitar Pro 8 para crear material pedagógico (tablaturas, ejercicios,
progresiones). El objetivo es que ese material aparezca dentro de Gmusic
de forma animada y con audio, exactamente como en Guitar Pro pero en el browser.

---

## La tecnología evaluada

**alphaTab** (`@coderline/alphatab`)
- Repositorio: https://github.com/CoderLine/alphaTab
- npm: `@coderline/alphatab`
- Licencia: MPL-2.0 (open source)
- Activo desde 2012, commits continuos

**Capacidades relevantes para Gmusic:**
- Renderiza archivos Guitar Pro (.gp, .gp3, .gp4, .gp5, .gpx)
- Partitura animada + tablatura sincronizada
- Reproducción con sintetizador MIDI incorporado (alphaSynth)
- Compatible con React y Web Audio API
- Responsive: se adapta al diseño de la página

---

## El flujo propuesto

```
JP crea ejercicio en Guitar Pro 8
    ↓ Exporta como .gp
        ↓ Sube archivo a Sanity (CMS)
            ↓ alphaTab lo renderiza en la lección
                ↓ Alumno ve tablatura animada + escucha audio
                  sin instalar nada
```

---

## Por qué en intermedio y no en básico

En básico el alumno aprende a leer tablatura estática.
Introducir animación antes genera sobrecarga cognitiva.

En intermedio ya conoce acordes, ritmo y tablatura básica.
La animación se convierte en herramienta de práctica real:
ve exactamente qué nota, cuándo, con qué ritmo.

**Módulos de intermedio donde aplica:**
- Módulo 7: acordes partidos (Re/Fa# en contexto de canción)
- Módulo 9: progresión I–IV–V–I animada
- Módulo 10: misma melodía en mayor vs menor (el alumno escucha la diferencia)

---

## Trade-offs

| Factor | Detalle |
|---|---|
| **A favor** | JP ya tiene Guitar Pro 8, flujo natural de creación |
| **A favor** | No requiere que el alumno instale nada |
| **A favor** | Compatible con stack React/Vite actual |
| **A favor** | Open source, activo, bien documentado |
| **Restricción** | Debe mostrar "Rendered using alphaTab" — no se puede remover |
| **Restricción** | Agrega ~500KB al bundle (mitigable con lazy loading) |
| **Riesgo** | Dependencia de librería externa de tercero |
| **Riesgo** | Bundle > 500KB ya es warning activo en el proyecto |

---

## Lo que NO se aprueba con esta decisión

- No se aprueba reconocimiento de audio en tiempo real
  (detectar si el alumno toca bien)
- No se aprueba integración MIDI con instrumentos físicos
- No se aprueba en nivel básico
- No se aprueba implementación antes de tener alumnos en nivel intermedio

Estas capacidades se evalúan en una D-GOV futura cuando haya
alumnos reales usando el nivel intermedio.

---

## Ejercicios interactivos sin alphaTab (para básico)

Para el nivel básico se pueden construir ejercicios interactivos
simples con el stack actual (React + Tone.js) sin alphaTab:

```
- Diagrama de acordes interactivo
- Quiz de teoría: ¿qué nota es esta?
- Constructor de progresiones: arrastra grados, escucha el resultado
- Visualizador del mástil: dónde están las notas de una escala
```

Estos no requieren D-GOV separada — son componentes React estándar.

---

## Criterio de aprobación

Esta D-GOV se aprueba cuando:

- [ ] D-GOV-04 (pedagogía lecciones 6–75) está resuelta
- [ ] Hay al menos 1 alumno real completando el nivel básico
- [ ] El bundle actual está optimizado (warning de 500KB resuelto)
- [ ] Se prueba alphaTab en un componente aislado sin afectar producción

---

## Decisión

**Estado actual: PROPUESTA — no implementar todavía.**

Registrada para no perder el contexto técnico ni repetir
la evaluación en el futuro. Se activa cuando se cumplan
los criterios de aprobación.

---

**Propuesta por:** Claude (sesión 2026-06-20)  
**Requiere aprobación de:** JP (fundador)  
**Afecta:** stack de lecciones, bundle size, CMS (Sanity)  
**No afecta:** server/, prisma/, auth, pagos, R-001, R-002
