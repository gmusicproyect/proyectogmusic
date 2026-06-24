# Musicful en Gmusic — Instrucción de uso
**Cuenta:** selah / musicful.ai
**Vence:** septiembre 2026
**Derechos:** comerciales incluidos por audio generado
---
## Concepto
Musicful es la herramienta de generación de música IA
contratada por Gmusic. No se integra por API en esta 
etapa — JP genera el audio manualmente desde 
musicful.ai y Gmusic reproduce la URL pública directamente.
---
## Cómo se usa
1. JP genera el audio en musicful.ai con el prompt correcto
2. Descarga los derechos del audio generado
3. Guarda la URL pública en Sanity como asset
4. La página reproduce esa URL con audio HTML estándar
Sin backend. Sin API key expuesta. Sin CORS.
---
## Para qué se usa
**1. Música de celebración (activo — D-BRAND-02)**
Cuando el alumno completa una meta, suena una música
generada en Musicful automáticamente.
Prompt base aprobado:
"Short celebratory guitar melody, warm and uplifting,
acoustic guitar, no vocals, instrumental"
**2. Backing tracks pedagógicos (futuro)**
Acompañamiento para que el alumno toque encima.
Ejercicios de oído nivel intermedio.
Requiere validación pedagógica antes de activar.
---
## Lo que NO se hace
- No llamar la API directo desde el browser (CORS)
- No automatizar la generación sin decisión de producto explícita (ver D-BRAND-02 para celebración)
- No usar para reemplazar el aprendizaje del alumno
- La música celebra el logro — no lo reemplaza
---
## Conexión con decisiones
- D-BRAND-01 → emoción de marca: "el alumno logró algo"
- D-BRAND-02 → pantalla de celebración
