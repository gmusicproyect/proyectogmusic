/* ============================================================
   ENGINE — Pestaña Práctica · Academia GMusic (Paquete A)
   ------------------------------------------------------------
   Flujo REAL (simulado contra ApiMock con las formas de contrato):
     1. Al entrar: POST /lesson-sessions {nodeId}
        → llegan sessionId, expiresAt y exercises[] (los ejercicios
          LLEGAN por la sesión autenticada, nunca de un CDN público)
     2. El alumno responde los 5 ejercicios EN EL MISMO CUADRO
        (cada respuesta = {microExerciseId, selectedAnswer, responseTimeMs})
     3. Al terminar: POST /lesson-sessions/:id/complete {attempts}
        → el SERVIDOR califica; el cliente solo MUESTRA el resultado.

   REGLA DURA: este archivo NUNCA decide si el alumno aprobó.
   Los puntos/combo durante el juego son FEEDBACK VISUAL (SIMULADO),
   con fórmula propia de utilería — no son accuracy ni XP.
   ============================================================ */

const Engine = (() => {

  let sessionId = null;
  let exercises = [];
  let idx = 0;
  let attempts = [];
  let exerciseStartedAt = 0;

  /* Feedback visual SIMULADO (no califica — ver README, fila "Puntos y combo") */
  let puntosVisuales = 0;
  let comboVisual = 0;

  const $ = id => document.getElementById(id);

  /* ---------- Inicio: crear sesión ---------- */
  async function start(nodeId){
    idx = 0; attempts = []; puntosVisuales = 0; comboVisual = 0;
    const s = await ApiMock.createSession(nodeId);
    sessionId = s.sessionId;
    exercises = s.exercises;
    $('sessionNote').innerHTML =
      `Sesión autenticada (MOCK, forma real): <code>sessionId ${s.sessionId}</code>` +
      `<code>expira ${new Date(s.expiresAt).toLocaleTimeString()}</code>` +
      `<code>${exercises.length} ejercicios llegaron en exercises[]</code>`;
    renderExercise();
  }

  /* ---------- Render de chips ---------- */
  function renderChips(){
    $('exChips').innerHTML = exercises.map((ex,i)=>{
      let cls, ico;
      if(i < idx){ cls='done'; ico='✓'; }
      else if(i === idx){ cls='current'; ico='▶'; }
      else { cls='locked'; ico='🔒'; }
      return `<div class="chip ${cls}"><span class="n-ic">${ico}</span> Ejercicio ${i+1}</div>`;
    }).join('');
  }

  /* ---------- Render del ejercicio actual ---------- */
  function renderExercise(){
    const ex = exercises[idx];
    exerciseStartedAt = performance.now();
    $('exTitle').textContent = 'Etapa: Cuerdas al aire — Práctica';
    $('exPrompt').textContent = ex.prompt;
    $('exPos').textContent = `Ejercicio ${idx+1} de ${exercises.length} · id: ${ex.microExerciseId}`;
    $('exPoints').textContent = puntosVisuales;
    $('exCombo').textContent = comboVisual;

    const area = $('gameArea');
    area.innerHTML = '<div class="q-body" id="qBody"></div><div class="feedback" id="fb"></div>';
    const q = $('qBody');

    if(ex.tipo === 'SELECCION')            q.appendChild(renderOpciones(ex));
    if(ex.tipo === 'SELECCION_DIAPASON'){  q.appendChild(renderDiapason(ex.cuerdaMarcada, false));
                                           q.appendChild(renderOpciones(ex)); }
    if(ex.tipo === 'ORDENAR')              q.appendChild(renderOrdenar(ex));
    if(ex.tipo === 'SELECCION_AUDIO'){     q.appendChild(renderAudioFake(ex));
                                           q.appendChild(renderOpciones(ex)); }
    if(ex.tipo === 'TOCAR_CUERDA_DIAPASON') q.appendChild(renderDiapason(null, true, ex));

    renderChips();
  }

  /* ---------- Tipo: SELECCION (opciones) ---------- */
  function renderOpciones(ex){
    const box = document.createElement('div');
    box.className = 'opciones';
    ex.opciones.forEach(op=>{
      const b = document.createElement('button');
      b.className = 'opcion';
      b.textContent = op;
      b.onclick = () => answer(ex, op, b, box);
      box.appendChild(b);
    });
    return box;
  }

  /* ---------- Tipo: diapasón (marcado o clicable) ---------- */
  function renderDiapason(marcada, clicable, ex){
    const d = document.createElement('div');
    d.className = 'diapason';
    ApiMock.STRINGS.forEach(s=>{
      const row = document.createElement('div');
      row.className = 'cuerda' + (s === marcada ? ' marcada' : '');
      row.innerHTML = `<span class="nombre">${s}</span><span class="linea"></span>`;
      if(clicable){
        row.onclick = () => {
          d.querySelectorAll('.cuerda').forEach(r=>r.classList.remove('pick'));
          row.classList.add('pick');
          answer(ex, s, null, null);
        };
      }
      d.appendChild(row);
    });
    return d;
  }

  /* ---------- Tipo: ORDENAR (secuencia) ---------- */
  function renderOrdenar(ex){
    const wrap = document.createElement('div');
    const display = document.createElement('div');
    display.className = 'seq-display';
    const picked = [];
    ex.items.forEach(()=>{ const s=document.createElement('div'); s.className='seq-slot'; display.appendChild(s); });
    const box = document.createElement('div');
    box.className = 'opciones';
    ex.items.forEach(op=>{
      const b = document.createElement('button');
      b.className = 'opcion';
      b.textContent = op;
      b.onclick = () => {
        if(picked.includes(op)) return;
        picked.push(op); b.disabled = true; b.classList.add('pick');
        const slot = display.children[picked.length-1];
        slot.textContent = op; slot.classList.add('full');
        if(picked.length === ex.items.length) answer(ex, picked.slice(), null, null);
      };
      box.appendChild(b);
    });
    wrap.appendChild(display); wrap.appendChild(box);
    return wrap;
  }

  /* ---------- Tipo: audio pregrabado (SIMULADO — sin archivo real) ---------- */
  function renderAudioFake(ex){
    const d = document.createElement('div');
    d.className = 'audio-fake';
    d.innerHTML = `<div class="play">▶</div><div class="txt">${ex.audioRef}.<br>En producción: audio pregrabado por enlace firmado (1 h). El alumno ESCUCHA y ELIGE — la app no escucha.</div>`;
    d.querySelector('.play').onclick = () => { d.querySelector('.txt').innerHTML = '🔊 (sonaría la cuerda — SIMULADO)'; };
    return d;
  }

  /* ---------- Registrar respuesta (nunca califica aquí) ---------- */
  function answer(ex, selectedAnswer, btn, box){
    const responseTimeMs = Math.round(performance.now() - exerciseStartedAt);
    attempts.push({ microExerciseId: ex.microExerciseId, selectedAnswer, responseTimeMs });

    /* Feedback visual SIMULADO: utilería de juego, NO es calificación.
       La corrección real la dirá el complete del servidor al final. */
    const aciertoVisual = Array.isArray(ex.respuestaCorrecta)
      ? JSON.stringify(selectedAnswer) === JSON.stringify(ex.respuestaCorrecta)
      : selectedAnswer === ex.respuestaCorrecta;
    if(aciertoVisual){ puntosVisuales += 20; comboVisual += 1; } else { comboVisual = 0; }
    $('exPoints').textContent = puntosVisuales;
    $('exCombo').textContent = comboVisual;

    if(btn){ btn.classList.add(aciertoVisual ? 'ok' : 'bad'); }
    if(box){ box.querySelectorAll('.opcion').forEach(o=>o.disabled=true); }

    const fb = $('fb');
    fb.className = 'feedback ' + (aciertoVisual ? 'ok' : 'bad');
    fb.textContent = aciertoVisual ? '✓ ¡Bien! (feedback visual — la calificación oficial llega al completar la etapa)' : 'Anotado — la calificación oficial la emite el servidor al completar la etapa';

    setTimeout(()=>{
      if(idx < exercises.length - 1){
        idx++;
        const b = $('practiceBox'); b.style.opacity = 0;
        setTimeout(()=>{ renderExercise(); b.style.opacity = 1; }, 180);
      } else {
        finish();
      }
    }, 900);
  }

  /* ---------- Finalizar: complete en el "servidor" ---------- */
  async function finish(){
    $('gameArea').innerHTML = `<div class="module-done"><div class="big">⏳</div><h3>Enviando al servidor…</h3><p>POST /lesson-sessions/${sessionId}/complete con ${attempts.length} respuestas</p></div>`;
    renderChips();
    const result = await ApiMock.complete(sessionId, attempts);
    showResult(result);
    $('gameArea').innerHTML = `<div class="module-done"><div class="big">${result.nodeCompleted ? '🎉' : '📘'}</div>
      <h3>${result.nodeCompleted ? '¡Etapa completada!' : 'Etapa enviada'}</h3>
      <p>accuracy oficial (servidor): <b>${Math.round(result.accuracy*100)}%</b> · XP: <b>${result.xpEarned}</b></p></div>`;
    idx = exercises.length;
    renderChips();
    App.refreshDashboard(); // la racha del header se actualiza desde /me/dashboard
  }

  /* ---------- Modal: SOLO muestra lo que emitió el servidor ---------- */
  function showResult(r){
    const celebra = r.streakUpdated === true; // regla: celebrar racha SOLO si streakUpdated
    $('modalContent').innerHTML = `
      <div class="fire">${celebra ? '🔥' : '🎸'}</div>
      <h2>${celebra ? '¡Racha incrementada!' : (r.alreadyProcessed ? 'Etapa ya procesada' : '¡Etapa completada!')}</h2>
      <p>${r.nodeCompleted
          ? `Aprobaste con ${Math.round(r.accuracy*100)}% de precisión (umbral del servidor: 70%).`
          : `Precisión ${Math.round(r.accuracy*100)}% — el servidor pide ≥ 70% para aprobar la etapa.`}</p>
      ${celebra ? `<div class="streak-big">🔥 ${r.currentStreak} días consecutivos</div>` : ''}
      <div class="xp">+<b>${r.xpEarned} XP</b> · racha actual: <b>${r.currentStreak}</b>${r.alreadyProcessed ? ' · <b>alreadyProcessed: no se suma de nuevo</b>' : ''}</div>
      <div class="contract"><code>${JSON.stringify(r,null,2)}</code></div>
      <button class="btn-main" onclick="document.getElementById('overlay').classList.remove('show')">Continuar →</button>`;
    $('overlay').classList.add('show');
  }

  return { start };
})();
