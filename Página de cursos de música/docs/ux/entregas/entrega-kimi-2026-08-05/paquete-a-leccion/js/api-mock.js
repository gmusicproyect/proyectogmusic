/* ============================================================
   API MOCK — Academia GMusic · Paquete A (prototipo de referencia)
   ------------------------------------------------------------
   SIMULA el servidor con las FORMAS DE CONTRATO REALES:
     POST /api/v1/lesson-sessions            {nodeId}
       → {sessionId, status:"STARTED", startedAt, expiresAt, exercises[]}
     POST /api/v1/lesson-sessions/:id/complete  {attempts:[{microExerciseId, selectedAnswer, responseTimeMs}]}
       → {accuracy, xpEarned, streakUpdated, currentStreak, nodeCompleted, alreadyProcessed}
     GET  /api/v1/me/path      → bloque con etapas (PathNode) y activeNodeId
     GET  /api/v1/me/dashboard → {streak.currentDays, activeToday}

   IMPORTANTE (reglas duras respetadas aquí):
   - La CALIFICACIÓN vive en ESTE módulo (que simula el servidor).
     El cliente (engine.js) solo envía respuestas y MUESTRA resultados.
   - La lógica de racha ("qué día es", incremento 1 vez por día) vive
     aquí, nunca en el cliente.
   - Los datos son MOCK: espejo embebido de data/*.json (embebido para
     que el prototipo funcione con doble click, sin servidor ni fetch).
   ============================================================ */

const ApiMock = (() => {

  /* ---- Datos MOCK (espejo de data/bloque-1.json) ---- */
  const PATH = {
    bloqueId: "bloque-1-acordes-abiertos",
    titulo: "Habilidad del Bloque 1: Tocar acordes abiertos limpios",
    descripcion: "Al finalizar estas 5 etapas, podrás tocar Em, Am, D y G sin trasteo, y cambiar entre ellos al ritmo de una canción.",
    activeNodeId: "n3-cuerdas-al-aire",
    etapas: [
      { nodeId:"n1-conoce-tu-guitarra", stageType:"FUNDAMENTO_UNO", orden:1, titulo:"Conoce tu guitarra", estado:"DONE",
        videoUrl:"enlace firmado (1 h) — MOCK",
        guidePdfUrl:"enlace firmado (1 h) — MOCK · partes de la guitarra, diagrama ilustrado",
        videos:[
          {modo:"R",titulo:"Repaso (video)",detalle:"Partes de la guitarra: cuerpo, mástil, trastes, clavijas",min:4},
          {modo:"E",titulo:"Ejercicio en video",detalle:"Identifica cada parte junto al profesor",min:5},
          {modo:"T",titulo:"Toca conmigo",detalle:"Nombra las 6 cuerdas al aire siguiendo al profesor",min:3}]},
      { nodeId:"n2-afina-y-posturea", stageType:"FUNDAMENTO_DOS", orden:2, titulo:"Afina y posturea", estado:"DONE",
        videoUrl:"enlace firmado (1 h) — MOCK",
        guidePdfUrl:"enlace firmado (1 h) — MOCK · postura paso a paso, tabla de afinación estándar",
        videos:[
          {modo:"R",titulo:"Repaso (video)",detalle:"Postura correcta: espalda, brazos, ángulo del mástil",min:4},
          {modo:"E",titulo:"Ejercicio en video",detalle:"Afinar cuerda por cuerda con afinador",min:6},
          {modo:"T",titulo:"Toca conmigo",detalle:"Afina tu guitarra junto al profesor, cuerda por cuerda",min:5}]},
      { nodeId:"n3-cuerdas-al-aire", stageType:"TECNICA", orden:3, titulo:"Cuerdas al aire", estado:"CURRENT",
        videoUrl:"enlace firmado (1 h) — MOCK",
        guidePdfUrl:"enlace firmado (1 h) — MOCK · nombres de cuerdas, ejercicios de memoria",
        videos:[
          {modo:"R",titulo:"Repaso (video)",detalle:"Orden y nombre de las cuerdas: E A D G B e",min:4},
          {modo:"E",titulo:"Ejercicio en video",detalle:"Cómo pulsar para que la cuerda suene limpia",min:5},
          {modo:"T",titulo:"Toca conmigo",detalle:"Secuencia completa de las 6 cuerdas con el profesor",min:5}]},
      { nodeId:"n4-em-am-limpios", stageType:"PRACTICA", orden:4, titulo:"Em y Am limpios", estado:"LOCKED",
        videoUrl:"enlace firmado (1 h) — MOCK",
        guidePdfUrl:"enlace firmado (1 h) — MOCK · diagramas de acordes, errores comunes",
        videos:[
          {modo:"R",titulo:"Repaso (video)",detalle:"Digitación de Em y Am, dedo por dedo",min:5},
          {modo:"E",titulo:"Ejercicio en video",detalle:"Errores comunes: cuerdas apagadas y zumbidos",min:6},
          {modo:"T",titulo:"Toca conmigo",detalle:"Cambio Em ↔ Am a tempo lento junto al profesor",min:7}]},
      { nodeId:"n5-primera-cancion", stageType:"TOCAR", orden:5, titulo:"Tu primera canción", estado:"LOCKED",
        videoUrl:"enlace firmado (1 h) — MOCK",
        guidePdfUrl:"enlace firmado (1 h) — MOCK · tabla de cambios Em→Am→D→G con conteo",
        videos:[
          {modo:"R",titulo:"Repaso (video)",detalle:"La progresión de la canción: Em → Am → D → G",min:4},
          {modo:"E",titulo:"Ejercicio en video",detalle:"Cambios con conteo en voz alta",min:6},
          {modo:"T",titulo:"Toca conmigo",detalle:"La canción completa junto al profesor",min:6}]}
    ]
  };

  /* ---- Datos MOCK (espejo de data/dashboard.json) ---- */
  const DASHBOARD = {
    streak: { currentDays: 12 },
    activeToday: false,
    progreso: { gratisUsadas: 2, gratisTotal: 5, totalLecciones: 75 }
  };

  /* ---- Datos MOCK (espejo de data/ejercicios-etapa-3.json) ----
     Ejercicios de RESPUESTA. Ninguno usa micrófono ni audio en vivo. */
  const EXERCISES_N3 = [
    { microExerciseId:"me-01-cuerda-6", tipo:"SELECCION",
      prompt:"¿Cuál es la cuerda 6, la más grave de la guitarra?",
      opciones:["E","A","D","G"], respuestaCorrecta:"E" },
    { microExerciseId:"me-02-cuerda-marcada", tipo:"SELECCION_DIAPASON",
      prompt:"En el diapasón hay una cuerda marcada en dorado. ¿Cuál es?",
      cuerdaMarcada:"D", opciones:["G","D","A","B"], respuestaCorrecta:"D" },
    { microExerciseId:"me-03-orden-grave-aguda", tipo:"ORDENAR",
      prompt:"Ordena estas cuerdas de grave a aguda, tocándolas en secuencia:",
      items:["A","e","D"], respuestaCorrecta:["A","D","e"] },
    { microExerciseId:"me-04-identifica-sonido", tipo:"SELECCION_AUDIO",
      prompt:"Escucha el audio y elige qué cuerda sonó:",
      audioRef:"audio pregrabado — SIMULADO en este prototipo (sin archivo real)",
      opciones:["B","G","e","A"], respuestaCorrecta:"G" },
    { microExerciseId:"me-05-toca-en-diapason", tipo:"TOCAR_CUERDA_DIAPASON",
      prompt:"Toca en el diapasón la cuerda B:",
      respuestaCorrecta:"B" }
  ];

  /* ---- Estado interno del "servidor" ---- */
  let session = null;          // sesión activa
  let streakDays = DASHBOARD.streak.currentDays;
  let practicedToday = DASHBOARD.activeToday;
  const STRINGS = ["e","B","G","D","A","E"];

  const delay = (ms=250) => new Promise(r => setTimeout(r, ms)); // latencia simulada

  /* ---- GET /api/v1/me/path ---- */
  async function getPath(){ await delay(120); return JSON.parse(JSON.stringify(PATH)); }

  /* ---- GET /api/v1/me/dashboard ---- */
  async function getDashboard(){
    await delay(120);
    return { streak:{ currentDays: streakDays }, activeToday: practicedToday, progreso: DASHBOARD.progreso };
  }

  /* ---- POST /api/v1/lesson-sessions  {nodeId} ---- */
  async function createSession(nodeId){
    await delay();
    const node = PATH.etapas.find(e => e.nodeId === nodeId);
    if(!node) throw new Error("nodeId desconocido: " + nodeId);
    const now = new Date();
    session = {
      sessionId: "mock-" + Math.random().toString(36).slice(2,10),
      nodeId,
      status: "STARTED",
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30*60*1000).toISOString(), // 30 min
      alreadyCompleted: false,
      exercises: JSON.parse(JSON.stringify(EXERCISES_N3)) // en real: payload de MicroExercise[] de ESA etapa
    };
    const { sessionId, status, startedAt, expiresAt, exercises } = session;
    return { sessionId, status, startedAt, expiresAt, exercises };
  }

  /* ---- POST /api/v1/lesson-sessions/:id/complete  {attempts} ----
     AQUÍ califica el "servidor". El cliente jamás calcula accuracy. */
  async function complete(sessionId, attempts){
    await delay();
    if(!session || session.sessionId !== sessionId) throw new Error("sesión inválida o expirada");

    // Calificación en servidor: compara selectedAnswer con respuestaCorrecta
    let correctas = 0;
    for(const a of attempts){
      const ex = session.exercises.find(e => e.microExerciseId === a.microExerciseId);
      if(!ex) continue;
      const ok = Array.isArray(ex.respuestaCorrecta)
        ? JSON.stringify(a.selectedAnswer) === JSON.stringify(ex.respuestaCorrecta)
        : a.selectedAnswer === ex.respuestaCorrecta;
      if(ok) correctas++;
    }
    const accuracy = attempts.length ? correctas / attempts.length : 0;
    const nodeCompleted = accuracy >= 0.7;           // umbral real: 0.7 por etapa, en servidor
    const xpEarned = nodeCompleted ? Math.round(accuracy * 100) : 0;

    // Racha: lógica de "día" SOLO en servidor. Sube 1 vez por día.
    let streakUpdated = false;
    if(nodeCompleted && !practicedToday){
      practicedToday = true;
      streakDays += 1;
      streakUpdated = true;
    }

    const alreadyProcessed = session.alreadyCompleted;
    session.alreadyCompleted = true;
    session.status = "COMPLETED";

    return {
      accuracy, xpEarned, streakUpdated,
      currentStreak: streakDays,
      nodeCompleted, alreadyProcessed
    };
  }

  return { getPath, getDashboard, createSession, complete, STRINGS };
})();
