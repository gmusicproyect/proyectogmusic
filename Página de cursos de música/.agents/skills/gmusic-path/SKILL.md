---
name: gmusic-path
description: >-
  Trabaja en Mi Camino (GmusicPath): ruta pedagógica premium, mapa serpenteante,
  intro, próxima práctica integrada y módulos. Usar cuando la tarea toque
  mi-camino, GmusicPath o el mapa del camino del alumno.
---

# Gmusic Path — Mi Camino

Pantalla de ruta pedagógica. Ruta: `mi-camino` → `/mi-camino`.

## Archivos clave

| Archivo | Rol |
|---------|-----|
| `src/app/pages/GmusicPath.tsx` | Orquestador de la pantalla |
| `src/app/components/gmusic/path/*` | Mapa, nodos, intro, panel activo |
| `src/app/data/gmusic-path-data.ts` | Módulos, nodos, ACTIVE_NODE_PANEL |
| `src/app/components/gmusic/GmusicInternalHeader.tsx` | Header (Mi Camino activo) |

## Principios

- Ruta seria de guitarra, no estética videojuego infantil.
- Mapa serpenteante vertical; solo módulo activo expandido cuando aplique.
- Header: Mi Camino en oro; Comunidad bloqueada con candado hasta T-MVP-COMMUNITY (D-F6-ANTI-DEMO).
- Copy bloqueado: "Disponible en el plan completo", no "Etapa 03/04".

## Reestructura visual (ir 1×1)

1. Header interno — candados + modal
2. Intro/hero Mi Camino — padding, eyebrow, meta
3. Card Próxima práctica horizontal
4. Card Módulo actual + mapa contenido
5. Lista compacta módulos (completado/en curso/bloqueado)

Implementar por puntos; no saltar etapas sin aprobación.

## Prohibiciones

- No tocar GmusicWelcome, landing, Navbar, rutas, backend, Tonal.js, LessonPage, CommunityPage real.
- No commit salvo autorización explícita.

## QA

1. Header → Mi Camino o `http://localhost:5174/mi-camino`
2. Mapa visible con nodos completado/activo/bloqueado
3. Panel próxima práctica coherente con `ACTIVE_NODE_PANEL`
