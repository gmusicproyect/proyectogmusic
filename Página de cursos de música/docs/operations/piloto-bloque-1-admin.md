# Piloto Bloque 1 — Admin Creador (autorizado 2 Jul 2026)

**Decisión interina:** Opus ausente; Juan delegó a Cursor.  
**Prerequisito:** INC-2026-07-02 **cerrado en prod** (rotación + login OK).  
**Fuente pedagógica:** `docs/product/mapa-bloques-nivel-1.md` · Bloque 1

---

## Objetivo

Primera carga real de materia: **Bloque 1 — Tu primer acorde: La menor**.  
Validar el ciclo completo: admin → publish → visible en **Mi Camino** suscriptor.

**Criterio done:** bloque publicado; alumno con sub ACTIVE ve el bloque en path; etapas navegables con título + criterio (video opcional).

---

## Pasos operativos

1. API local: `NODE_ENV=development npm run api:dev`
2. Frontend: `npm run dev`
3. Ir a `/admin` → login con credencial **rotada**
4. **Crear bloque** — título: `Tu primer acorde: La menor`
5. Completar **5 etapas** (copiar títulos y criterios abajo)
6. **Publicar bloque**
7. Como alumno (`carlos@gmusic.academy` o QA prod): `/mi-camino` → confirmar bloque visible

---

## Contenido sugerido — 5 etapas

| # | Etapa | Título visible | Criterio de completado |
|---|--------|----------------|------------------------|
| 1 | Fundamento uno | Qué es un acorde y por qué Am es la puerta | El alumno puede explicar con sus palabras qué es un acorde |
| 2 | Fundamento dos | Diagrama de Am: dedos, trastes, cuerdas | Identifica dedos y trastes del diagrama Am |
| 3 | Técnica | Presión limpia sin trasteo | Cada cuerda suena clara al pulsar el acorde |
| 4 | Práctica | Armar el acorde por cuerdas | Arma Am 3 veces seguidas sin ayuda visual |
| 5 | Tocar | Am al pulso | Am suena limpio 4 tiempos al pulso |

**Video:** YouTube placeholder o vacío en piloto — no bloquea publicación.  
**Texto guía:** observaciones del profesor por etapa (opcional en MVP).

**Outcome del bloque (mapa):** Am suena limpio 4 tiempos.

---

## Alcance del piloto

| SÍ | NO |
|----|-----|
| 1 bloque publicado vía admin | Bloques 2–12 masivos |
| Smoke Mi Camino suscriptor | MicroExercise / lesson runner por etapa |
| Video YouTube si Juan tiene URL | Auth, pagos, schema |
| Reportar bugs UX admin | Track B / Sanity |

---

## Si algo falla

| Síntoma | Revisar |
|---------|---------|
| 401/403 en admin | Rol ADMIN, cookie sesión, API apuntando a local |
| Publish 400 | 5 etapas con título + criterio |
| No aparece en Mi Camino | `PublishStatus.PUBLISHED`, curso correcto, sub alumno ACTIVE |
| Path mock activo | `VITE_USE_PATH_MOCK=false` |

---

*Autorizado: decisión interina Cursor · 2 Jul 2026 · post R-008 MVP `fd65927` + fix P0 `2134e71`*
