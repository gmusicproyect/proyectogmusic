# Flicker de scroll iPhone (landing) — checklist de repro en dispositivo

**Estado:** observación sin ticket (repro formal pendiente) · **No fix a ciegas** (Oleada C · C4 · 28 Jul 2026)

## Qué se busca
Parpadeo/salto visual al hacer scroll en la landing pública (`/`) reportado en iPhone; nunca reproducido con evidencia formal.

## Checklist (5 min con el dispositivo)
1. iPhone físico (anotar modelo + versión iOS + Safari) · datos móviles y también WiFi.
2. Abrir `https://proyectogmusic.vercel.app` en frío (sin caché: pestaña privada).
3. Scroll lento continuo de Hero → Planes; luego scroll rápido con inercia; luego rebote en el tope.
4. Repetir con la barra de Safari colapsada y expandida (cambia el viewport dinámico iOS).
5. Grabar pantalla (Ajustes → Centro de control → Grabación) si aparece.

## Si se reproduce
Anotar: modelo/iOS/red · sección exacta · grabación → crear ticket en DECISIONS backlog con `docs/operations/` como evidencia. Sospechosos típicos iOS: `100vh` dinámico, animaciones `motion` on-scroll, `backdrop-filter`.

## Si no se reproduce en 2 dispositivos distintos
Cerrar la observación en `docs/flows/README.md` como «no repro <fecha> (2 dispositivos)».
