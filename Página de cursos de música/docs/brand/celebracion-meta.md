# Gmusic — Pantalla de Celebración de Meta
**Decisión:** D-BRAND-02
**Fecha:** 2026-06-21
**Estado:** Aprobada
## Concepto
Cuando el alumno completa una meta (módulo, mundo, 
racha de días), aparece una pantalla de celebración 
con música generada en Musicful que se reproduce 
automáticamente. No hay reproductor visible — 
la música simplemente suena.
## Elementos visuales aprobados
- Fondo: rgba(8,8,8,0.92) con borde dorado sutil
- Estrellas: ★ ★ ★ en dorado
- Badge: "Meta cumplida" en uppercase, dorado
- Título: Playfair Display, "Completaste el Mundo X"
- Subtítulo: Inter, descripción del logro
- Barra de progreso: animada, dorada, llega al 100%
- CTA principal: botón dorado "Continuar al Mundo X"
- CTA secundario: "Ver mi progreso"
## Audio
- Generado en Musicful manualmente por JP
- URL pública del audio guardada en Sanity
- Se reproduce automáticamente al aparecer la pantalla
- Fallback: texto discreto "Toca aquí para escuchar 
  tu música de celebración" si el browser bloquea autoplay
- Sin reproductor visible
## Flujo
1. Alumno completa meta
2. Aparece pantalla de celebración
3. Música suena automáticamente
4. Alumno hace clic en "Continuar al Mundo X"
## Conexión con D-BRAND-01
La música celebra el logro del alumno — 
"Esto lo lograste tú". Refuerza la emoción:
"El deseo de tocar se convierte en realidad."
