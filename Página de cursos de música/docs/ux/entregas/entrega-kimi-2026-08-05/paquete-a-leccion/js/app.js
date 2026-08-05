/* ============================================================
   APP — Academia GMusic · Paquete A (prototipo de referencia)
   ------------------------------------------------------------
   Pinta las 3 pestañas leyendo SOLO del ApiMock (contratos reales):
     - GET /me/path      → tarjetas (etapas/PathNode) + banner + hero
     - GET /me/dashboard → chip de racha del header
   Léxico oficial: Bloque → 5 Etapas (StageType) → MicroExercise[].
   «Tarjeta» se usa solo como palabra visual de UI, nunca en el modelo.
   ============================================================ */

const App = (() => {

  const $ = id => document.getElementById(id);
  let path = null;

  const EMOJI = { FUNDAMENTO_UNO:'🎸', FUNDAMENTO_DOS:'📖', TECNICA:'🎵', PRACTICA:'🎶', TOCAR:'🎤' };
  const LABEL = { FUNDAMENTO_UNO:'Fundamento Uno', FUNDAMENTO_DOS:'Fundamento Dos', TECNICA:'Técnica', PRACTICA:'Práctica', TOCAR:'Tocar' };
  const ABOUT = {
    FUNDAMENTO_UNO:'La primera etapa: conocer el instrumento antes de tocar. Qué es cada parte, para qué sirve y cómo se sostiene.',
    FUNDAMENTO_DOS:'Cómo sentarse con la guitarra, posición de las manos, y afinar cada cuerda usando el afinador.',
    TECNICA:'Tocar cada cuerda al aire con sonido limpio, en orden y sin mirar. Se practica en la pestaña Práctica (5 ejercicios).',
    PRACTICA:'Los dos primeros acordes: digitación, presión justa y cambio entre ellos sin que se apague el sonido.',
    TOCAR:'El cierre del bloque: aplicar Em, Am, D y G en una canción real, cambiando de acorde al ritmo.'
  };

  /* ---------- Arranque ---------- */
  async function init(){
    bindTabs();
    path = await ApiMock.getPath();           // GET /api/v1/me/path (MOCK)
    await refreshDashboard();                 // GET /api/v1/me/dashboard (MOCK)
    renderHero(path);
    renderSkillBanner(path);
    renderCards(path);
    renderPdfList(path);
    bindPractice(path);
  }

  async function refreshDashboard(){
    const d = await ApiMock.getDashboard();
    $('streakChip').textContent = `🔥 ${d.streak.currentDays}`;
    // Regla dura: si la racha fuera 0 no se mostraría (decisión del doc de racha);
    // aquí el MOCK siempre devuelve ≥ 1. Nada de lógica de día en cliente.
  }

  /* ---------- Pestañas ---------- */
  function bindTabs(){
    document.querySelectorAll('.tab').forEach(t=>{
      t.onclick = () => {
        document.querySelectorAll('.tab').forEach(x=>x.classList.remove('on'));
        t.classList.add('on');
        ['tarjetas','practica','pdf'].forEach(v=>$('v-'+v).classList.toggle('hidden', v !== t.dataset.tab));
      };
    });
  }

  /* ---------- Hero ---------- */
  function renderHero(p){
    const done = p.etapas.filter(e=>e.estado==='DONE').length;
    $('heroSub').textContent = `Continúa con la siguiente clase gratuita. 60 lecciones más te esperan con tu plan.`;
    $('heroNum').textContent = `${done} / ${p.etapas.length} etapas · 75 total`;
    $('heroBar').style.width = (done / p.etapas.length * 100) + '%';
  }

  /* ---------- Banner de habilidad ---------- */
  function renderSkillBanner(p){
    const done = p.etapas.filter(e=>e.estado==='DONE').length;
    $('skillBanner').innerHTML = `
      <div class="skill-icon">🎯</div>
      <div style="flex:1">
        <h2>${p.titulo} <span class="frac">${done} / ${p.etapas.length}</span></h2>
        <p>${p.descripcion}</p>
      </div>`;
  }

  /* ---------- Tarjetas (etapas) ---------- */
  function renderCards(p){
    $('cardsRow').innerHTML = p.etapas.map(e=>{
      const state = e.estado; // DONE | CURRENT | LOCKED
      const cls = state==='CURRENT' ? 'active' : state==='LOCKED' ? 'locked' : '';
      const btn = state==='DONE'    ? '<div class="btn done">✓ Completada</div>'
                : state==='CURRENT' ? '<button class="btn go" data-goto="practica">Ir a Práctica</button><div class="sub-note">Etapa activa</div>'
                : '<div class="btn locked-b">Completa la anterior</div>';
      const lock = state==='LOCKED' ? '<span class="lock">🔒</span>' : '';
      return `
        <div class="card ${cls}">
          <div class="tag-row"><span class="kind">${LABEL[e.stageType]}</span>${lock}</div>
          <div class="emoji">${EMOJI[e.stageType]}</div>
          <div class="clase">Etapa ${e.orden} · ${LABEL[e.stageType]}</div>
          <h3>${e.titulo}</h3>
          <div class="meta"><span class="vid">▶ ${e.videos.length} videos</span> · ${e.videos.reduce((a,v)=>a+v.min,0)} min total</div>
          ${btn}
        </div>`;
    }).join('');
    const go = document.querySelector('[data-goto="practica"]');
    if(go) go.onclick = () => document.querySelector('[data-tab="practica"]').click();
  }

  /* ---------- Resumen PDF (expandible) ---------- */
  function renderPdfList(p){
    $('pdfList').innerHTML = p.etapas.map((e,i)=>`
      <div class="pdf-item" id="pdf-item-${i}">
        <div class="pdf-row" data-idx="${i}">
          <span class="ic">🎸</span>
          <div>
            <div class="t">Etapa ${e.orden} · ${e.titulo}</div>
            <div class="s">${LABEL[e.stageType]} · ${e.videos.length} videos · toca para ver de qué trata</div>
          </div>
          <span class="chev">▼</span>
        </div>
        <div class="pdf-detail">
          <div class="about">${ABOUT[e.stageType]}</div>
          ${e.videos.map(v=>`
            <div class="vid-row">
              <span class="m-ic">${v.modo}</span>
              <div><div class="vt">${v.titulo}</div><div class="vs">${v.detalle}</div></div>
              <span class="vd">${v.min} min</span>
            </div>`).join('')}
          <div class="pdf-actions"><span class="dl">📄 Ver PDF · ${e.guidePdfUrl}</span></div>
        </div>
      </div>`).join('');
    document.querySelectorAll('.pdf-row').forEach(r=>{
      r.onclick = () => {
        const item = $('pdf-item-'+r.dataset.idx);
        const wasOpen = item.classList.contains('open');
        document.querySelectorAll('.pdf-item').forEach(x=>x.classList.remove('open'));
        if(!wasOpen) item.classList.add('open');
      };
    });
  }

  /* ---------- Práctica: arranca con el nodo activo ---------- */
  function bindPractice(p){
    // Al entrar por primera vez a Práctica: POST /lesson-sessions {nodeId: activeNodeId}
    let started = false;
    document.querySelector('[data-tab="practica"]').addEventListener('click', async ()=>{
      if(started) return;
      started = true;
      await Engine.start(p.activeNodeId);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  return { refreshDashboard };
})();
