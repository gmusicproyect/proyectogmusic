# Prueba en 5 pasos — Spike de audio (Paquete B)

**Qué necesitas:** tu guitarra y un navegador (Chrome o Safari) en tu Mac.
**Tiempo:** 3 minutos.

---

## Paso 1 — Servir la carpeta (el micrófono lo exige)

Los navegadores solo dan micrófono en contexto seguro (**localhost** o HTTPS). Abrir el archivo con doble click (`file://`) puede bloquearlo. Desde Terminal:

```bash
cd paquete-b-audio
python3 -m http.server 8000
```

Abre en el navegador: **http://localhost:8000**

## Paso 2 — Permiso de micrófono

Presiona **🎤 Activar micrófono**. El navegador pedirá permiso: acéptalo.
Si no aparece el permiso o falla, revisa en Mac: *Configuración del Sistema → Privacidad y seguridad → Micrófono → tu navegador activado*.

## Paso 3 — Toca UNA cuerda al aire

Con la guitarra afinada, toca la **cuerda E grave (6ª)** y deja sonar.
En pantalla debería aparecer: **E (6ª grave)** con la frecuencia detectada (~82 Hz) y la desviación en cents.

## Paso 4 — Recorre las 6 cuerdas

Toca una por una: E, A, D, G, B, e. Cada acierto enciende la fila correspondiente en dorado (tolerancia ±50 cents).

## Paso 5 — Registra el resultado del spike

Criterios de la decisión D-GOV (fase 0). Anota sí/no en cada uno:

| Criterio | Umbral | ¿Pasó? |
|---|---|---|
| Precisión en cuerda al aire | ≥ 90% de aciertos en ambiente casero | ☐ |
| Latencia percibida | < 100 ms en Mac (¿se siente instantáneo?) | ☐ |
| Falsos positivos (ruido tomado como nota) | < 10% (habla o golpea la mesa: ¿se dispara?) | ☐ |
| Sin instalar nada (solo navegador) | ☐ |

**Eso es todo.** Este prototipo es deliberadamente mínimo: no guarda datos, no califica, no se conecta al Paquete A. Su único trabajo es responder con evidencia si la detección monofónica en browser es viable — esa evidencia es la entrada de la siguiente decisión.
