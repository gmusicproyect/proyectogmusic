# Paso 7 — Tutor en producto (clase gratuita + Mi Camino)

Fecha: 2026-11-09

## Intención
Sacar el tutor del lab puro: el alumno/demo puede abrirlo desde pantallas reales.

## Hecho

- [x] Link **Preguntas con citas** en `/clase-gratuita` (`PathDemoPage`)
- [x] Botón **Tutor** en header zona alumno (`GmusicInternalHeader` → Mi Camino / Mi Estudio)
- [x] Admin ya tenía **Tutor corpus** (Paso 6)
- [x] `/tutor` vuelve a clase gratuita o inicio

## Cómo verlo

1. API + Vite locales.
2. Abrí **http://127.0.0.1:5173/clase-gratuita** → link dorado **Preguntas con citas**.
3. O zona alumno (sesión ACTIVE) → header **Tutor**.

## Tests

```bash
cd "Página de cursos de música"
node --import ./scripts/app-test-import.mjs --import tsx --test \
  src/app/pages/path-demo-tutor-entry.test.ts \
  src/app/components/gmusic/gmusic-internal-header.test.ts
```
