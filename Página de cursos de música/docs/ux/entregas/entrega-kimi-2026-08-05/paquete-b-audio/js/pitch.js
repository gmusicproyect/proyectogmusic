/* ============================================================
   PITCH.JS — Prototipo de spike: detección de pitch MONOFÓNICA
   Academia GMusic · Paquete B (separado del Paquete A)
   ------------------------------------------------------------
   Qué hace DE VERDAD: captura el micrófono (Web Audio API) y
   detecta la frecuencia fundamental por AUTOCORRELACIÓN.
   Qué NO hace: polifonía (acordes), tempo, juego rítmico.
   Alcance: fase 0 del spike (PROPUESTA-D-GOV-MOTOR-AUDIO).
   ============================================================ */

const Cuerdas = (() => {

  // Cuerdas estándar de guitarra: frecuencias fundamentales (Hz)
  const STRINGS = [
    { nombre: "E (6ª grave)", freq: 82.41 },
    { nombre: "A (5ª)",       freq: 110.00 },
    { nombre: "D (4ª)",       freq: 146.83 },
    { nombre: "G (3ª)",       freq: 196.00 },
    { nombre: "B (2ª)",       freq: 246.94 },
    { nombre: "e (1ª aguda)", freq: 329.63 }
  ];

  // Diferencia en cents entre dos frecuencias (1200 cents = 1 octava)
  function centsBetween(f1, f2){ return 1200 * Math.log2(f1 / f2); }

  // Cuerda más cercana a una frecuencia, y su distancia en cents
  function nearestString(freq){
    let best = null, bestCents = Infinity;
    for(const s of STRINGS){
      const c = centsBetween(freq, s.freq);
      if(Math.abs(c) < Math.abs(bestCents)){ best = s; bestCents = c; }
    }
    return { cuerda: best, cents: bestCents };
  }

  /* Autocorrelación: busca el periodo que mejor se repite en el buffer.
     Suficiente para pitch monofónico de guitarra en ambiente casero. */
  function autoCorrelate(buf, sampleRate){
    const SIZE = buf.length;
    let rms = 0;
    for(let i=0;i<SIZE;i++) rms += buf[i]*buf[i];
    rms = Math.sqrt(rms/SIZE);
    if(rms < 0.01) return -1; // silencio o ruido muy bajo: no hay nota

    let r1=0, r2=SIZE-1;
    const thres = 0.2;
    for(let i=0;i<SIZE/2;i++) if(Math.abs(buf[i])<thres){ r1=i; break; }
    for(let i=1;i<SIZE/2;i++) if(Math.abs(buf[SIZE-i])<thres){ r2=SIZE-i; break; }
    const b = buf.slice(r1, r2);
    const N = b.length;
    if(N < 32) return -1;

    const c = new Array(N).fill(0);
    for(let i=0;i<N;i++)
      for(let j=0;j<N-i;j++)
        c[i] += b[j]*b[j+i];

    let d=0; while(d<N-1 && c[d]>c[d+1]) d++;
    let maxval=-1, maxpos=-1;
    for(let i=d;i<N;i++) if(c[i]>maxval){ maxval=c[i]; maxpos=i; }
    if(maxpos<=0) return -1;

    // Interpolación parabólica para afinar el pico
    const x0 = maxpos>0 ? c[maxpos-1] : c[maxpos];
    const x1 = c[maxpos];
    const x2 = maxpos<N-1 ? c[maxpos+1] : c[maxpos];
    const a = (x0+x2-2*x1)/2, bq = (x2-x0)/2;
    const shift = a ? -bq/(2*a) : 0;

    return sampleRate / (maxpos + shift);
  }

  return { STRINGS, nearestString, autoCorrelate, centsBetween };
})();
