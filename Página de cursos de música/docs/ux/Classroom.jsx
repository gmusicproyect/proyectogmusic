// components/Classroom.jsx
// GMusic Estudio - Plataforma de Clases de Guitarra
// Next.js 14+ / React 18+
// Paleta: fondo #0a0a0a, acento #c4956a, verde #6ecf8a, naranja #e8a84c

"use client";

import { useState } from "react";

/* ============================================================
   ICONOS SVG (inline, sin dependencias externas)
   ============================================================ */
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const LoopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
  </svg>
);

const MetronomeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MicIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
  </svg>
);

const ChevronDown = ({ open }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.2s" }}>
    <path d="M6 9l6 6 6-6" />
  </svg>
);

/* ============================================================
   DATOS DEL CURSO (ejemplo: Mundo 2 - Cejillo)
   ============================================================ */
const WORLDS = [
  {
    id: 1,
    title: "Mundo 1: Los acordes de la familia de Mi",
    subtitle: "Em, Am, D, G, C | Progresión I-V-vi-IV",
    theory: "Tonalidad: Mi menor / Sol mayor",
    completed: true,
    lessons: [
      { id: "1-1", name: "Notas del mástil", type: "theory", duration: "3 min", done: true },
      { id: "1-2", name: "Intervalos: 3ra y 5ta", type: "theory", duration: "4 min", done: true },
      { id: "1-3", name: "Em y Am (técnica)", type: "tech", duration: "5 min", done: true },
      { id: "1-4", name: "D y G (técnica)", type: "tech", duration: "6 min", done: true },
      { id: "1-5", name: "Progresión I-V-vi-IV", type: "theory", duration: "4 min", done: true },
      { id: "1-6", name: "Stand By Me", type: "song", duration: "8 min", done: true, isBoss: true },
    ],
  },
  {
    id: 2,
    title: "Mundo 2: Transporte y cejillo",
    subtitle: "Cejillo | Tonalidades | Progresión vi-IV-I-V",
    theory: "Tonalidad: Fa# menor / La mayor",
    completed: false,
    current: true,
    lessons: [
      { id: "2-1", name: "Semitonos y tonos", type: "theory", duration: "3 min", done: true },
      { id: "2-2", name: "Círculo de quintas", type: "theory", duration: "4 min", done: true },
      { id: "2-3", name: "El cejillo como transporte", type: "theory", duration: "3 min", done: false, current: true },
      { id: "2-4", name: "Rasgueo con cejillo", type: "tech", duration: "5 min", done: false, locked: true },
      { id: "2-5", name: "Progresión vi-IV-I-V", type: "theory", duration: "4 min", done: false, locked: true },
      { id: "2-6", name: "Wonderwall — Análisis", type: "theory", duration: "3 min", done: false, locked: true },
      { id: "2-7", name: "Wonderwall — Técnica", type: "tech", duration: "6 min", done: false, locked: true },
      { id: "2-8", name: "Desafío: Wonderwall", type: "song", duration: "10 min", done: false, locked: true, isBoss: true },
    ],
  },
  {
    id: 3,
    title: "Mundo 3: Arpegios y fingerpicking",
    subtitle: "Patrón PIMA | Técnica de dedos | Canción: Blackbird",
    theory: "Tonalidad: Sol mayor",
    completed: false,
    lessons: [
      { id: "3-1", name: "Melodía vs armonía", type: "theory", duration: "5 min", done: false, locked: true },
      { id: "3-2", name: "Patrón PIMA", type: "tech", duration: "6 min", done: false, locked: true },
      { id: "3-3", name: "Hammer-on y pull-off", type: "tech", duration: "6 min", done: false, locked: true },
      { id: "3-4", name: "Acordes con bajo en sol", type: "theory", duration: "4 min", done: false, locked: true },
      { id: "3-5", name: "Blackbird", type: "song", duration: "12 min", done: false, locked: true, isBoss: true },
    ],
  },
];

/* ============================================================
   COMPONENTE PRINCIPAL: CLASSROOM
   ============================================================ */
export default function Classroom() {
  const [activeWorld] = useState(2);
  const [activeLesson, setActiveLesson] = useState("2-3");
  const [activeTab, setActiveTab] = useState("tablatura"); // tablatura | recursos | notas
  const [isPlaying, setIsPlaying] = useState(false);
  const [tempo, setTempo] = useState(75);

  const world = WORLDS.find((w) => w.id === activeWorld);
  const lesson = world.lessons.find((l) => l.id === activeLesson);

  const typeColors = {
    theory: { bg: "rgba(196,149,106,0.12)", text: "#c4956a", label: "T" },
    tech: { bg: "rgba(110,207,138,0.12)", text: "#6ecf8a", label: "X" },
    song: { bg: "rgba(232,168,76,0.12)", text: "#e8a84c", label: "♫" },
  };

  return (
    <div className="gmc-classroom">
      {/* ===== HEADER ===== */}
      <header className="gmc-header">
        <div className="gmc-logo">
          <div className="gmc-logo-icon">🎸</div>
          <span className="gmc-logo-text">
            G<span style={{ color: "#c4956a" }}>Music</span> Estudio
          </span>
        </div>
        <nav className="gmc-nav">
          {["Mi ruta", "Clases en vivo", "Práctica", "Comunidad"].map((item, i) => (
            <span key={item} className={`gmc-nav-item${i === 0 ? " active" : ""}`}>
              {item}
            </span>
          ))}
        </nav>
        <div className="gmc-user">
          <span className="gmc-streak">🔥 12 días</span>
          <div className="gmc-avatar">JL</div>
        </div>
      </header>

      {/* ===== SUBHEADER ===== */}
      <div className="gmc-subheader">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span className="gmc-live-badge">
            <span className="gmc-live-dot" /> EN VIVO
          </span>
          <span className="gmc-class-info">
            <strong>Mundo {world.id}</strong> — {world.title.split(": ")[1]}{" "}
            <span style={{ color: "#555" }}>|</span> Lección{" "}
            {world.lessons.findIndex((l) => l.id === activeLesson) + 1} de {world.lessons.length}
          </span>
        </div>
        <span className="gmc-timer">00:18:42</span>
      </div>

      {/* ===== PROGRESS BAR ===== */}
      <div className="gmc-progress-wrap">
        <div className="gmc-progress-labels">
          <span>Progreso de la clase</span>
          <span>35%</span>
        </div>
        <div className="gmc-progress-bar">
          <div className="gmc-progress-fill" style={{ width: "35%" }} />
        </div>
      </div>

      {/* ===== MAIN LAYOUT ===== */}
      <div className="gmc-main">
        {/* ---- SIDEBAR ---- */}
        <aside className="gmc-sidebar">
          <div className="gmc-sidebar-header">
            <div>
              <div className="gmc-sidebar-title">🗺️ Mundo {world.id}</div>
              <div className="gmc-sidebar-subtitle">{world.title.split(": ")[1]}</div>
            </div>
            <span className="gmc-world-progress">
              {world.lessons.filter((l) => l.done).length}/{world.lessons.length}
            </span>
          </div>

          {world.lessons.map((l) => {
            const tc = typeColors[l.type];
            return (
              <div
                key={l.id}
                className={`gmc-lesson-item${l.id === activeLesson ? " active" : ""}${l.locked ? " locked" : ""}`}
                onClick={() => !l.locked && setActiveLesson(l.id)}
              >
                <div className={`gmc-lesson-num${l.done ? " done" : ""}${l.current ? " current" : ""}`}>
                  {l.done ? "✓" : l.isBoss ? "★" : world.lessons.indexOf(l) + 1}
                </div>
                <div className="gmc-lesson-info">
                  <div className="gmc-lesson-name">{l.name}</div>
                  <div className="gmc-lesson-meta">{l.duration}</div>
                </div>
                <span className="gmc-lesson-tag" style={{ background: tc.bg, color: tc.text }}>
                  {tc.label}
                </span>
              </div>
            );
          })}
        </aside>

        {/* ---- CONTENT AREA ---- */}
        <main className="gmc-content">
          <div className="gmc-breadcrumb">
            Mundo {world.id} <span>›</span> Lección{" "}
            {world.lessons.findIndex((l) => l.id === activeLesson) + 1} de {world.lessons.length}{" "}
            <span>›</span>{" "}
            {lesson.type === "theory" ? "Fundamento Teórico" : lesson.type === "tech" ? "Técnica" : "Canción"}
          </div>
          <h1 className="gmc-lesson-title">{lesson.name}</h1>
          <p className="gmc-lesson-subtitle">
            {lesson.type === "theory"
              ? "Fundamento musical que aplica a todo lo que tocarás después"
              : lesson.type === "tech"
              ? "Ejercicio práctico con corrección paso a paso"
              : "Aplica todo lo aprendido en una canción real"}
            {" "}• {lesson.duration}
          </p>

          {/* Video Player */}
          <div className="gmc-video-box">
            <button className="gmc-video-play" onClick={() => setIsPlaying(!isPlaying)}>
              {isPlaying ? <PauseIcon /> : <PlayIcon />}
            </button>
            <div className="gmc-video-overlay">
              {lesson.type === "theory"
                ? "🧠 Explicación teórica + demostración en diapasón"
                : lesson.type === "tech"
                ? "🎸 Close-up de manos + metrónomo integrado"
                : "🎵 Play-along con backing track"}
            </div>
          </div>

          {/* Theory Box (solo si es teoría) */}
          {lesson.type === "theory" && (
            <div className="gmc-theory-box">
              <div className="gmc-theory-header">
                <span className="gmc-theory-badge">🧠 FUNDAMENTO TEÓRICO</span>
                <span style={{ fontSize: "10px", color: "#666" }}>
                  Este concepto aplica a TODO lo que tocarás después
                </span>
              </div>
              <div className="gmc-theory-text">
                <strong style={{ color: "#f5f5f0" }}>El problema:</strong> Aprendiste Em, Am, D, G en el Mundo 1. Pero
                el cantor de tu iglesia dice "la canción está muy baja, súbela un tono". ¿Ahora qué?
                <br />
                <br />
                <strong style={{ color: "#f5f5f0" }}>La solución:</strong> El <strong>cejillo</strong> es un
                "transportador invisible". Cuando pones cejillo en el 2do traste y haces la forma de Em, ya no estás
                tocando Em — estás tocando <code className="gmc-code">Fa#m</code>.
                <br />
                <br />
                <strong style={{ color: "#f5f5f0" }}>¿Por qué?</strong> Cada traste sube{" "}
                <code className="gmc-code">½ tono</code>. Dos trastes = <code className="gmc-code">1 tono</code>. Em
                (mi) + 1 tono = Fa# (fa sostenido).
                <br />
                <br />
                <strong style={{ color: "#f5f5f0" }}>La magia:</strong> Las <em>formas</em> de tus dedos no cambian.
                Solo cambia dónde pones el cejillo. Con 5 formas de acordes puedes tocar en{" "}
                <strong>cualquier tonalidad</strong>.
              </div>
            </div>
          )}

          {/* Content Tabs */}
          <div className="gmc-content-tabs">
            {[
              { id: "tablatura", label: "📋 Tablatura" },
              { id: "recursos", label: "📎 Recursos" },
              { id: "notas", label: "📝 Notas" },
            ].map((t) => (
              <button
                key={t.id}
                className={`gmc-content-tab${activeTab === t.id ? " active" : ""}`}
                onClick={() => setActiveTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          {activeTab === "tablatura" && (
            <div className="gmc-tab-panel">
              <div className="gmc-fb-header">
                <span className="gmc-fb-title">🎸 Diapasón — Transporte de Em → Fa#m</span>
                <span className="gmc-fb-chord">Cejillo en traste 2</span>
              </div>
              <FretboardSVG />
              <div style={{ fontSize: "11px", color: "#666", marginTop: "8px" }}>
                💡 <strong style={{ color: "#c4956a" }}>Tip:</strong> Presiona con el <strong>borde</strong> del dedo
                índice, no la yema. El pulgar va al centro del mástil, opuesto al índice.
              </div>
            </div>
          )}

          {activeTab === "recursos" && (
            <div className="gmc-resources">
              {[
                { icon: "📄", name: "Guía: Transporte y cejillo.pdf", size: "3.1 MB", type: "pdf" },
                { icon: "🎵", name: "Amazing Grace — 3 tonalidades.mp3", size: "6.2 MB", type: "mp3" },
                { icon: "🎸", name: "Tabla de transporte.gp5", size: "12 KB", type: "gp" },
              ].map((r, i) => (
                <div key={i} className="gmc-resource">
                  <div className={`gmc-res-icon gmc-res-${r.type}`}>{r.icon}</div>
                  <div className="gmc-res-info">
                    <div className="gmc-res-name">{r.name}</div>
                    <div className="gmc-res-size">{r.size}</div>
                  </div>
                  <span className="gmc-res-dl">Descargar ↓</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notas" && (
            <div className="gmc-tab-panel">
              <div className="gmc-notes">
                <p>
                  <strong style={{ color: "#f5f5f0" }}>Para recordar:</strong>
                </p>
                <ul>
                  <li>
                    Cada traste = <code className="gmc-code">½ tono</code> (semitono)
                  </li>
                  <li>
                    Cejillo en traste 2 = subir <code className="gmc-code">1 tono</code> completo
                  </li>
                  <li>Cejillo en traste 3 = subir 1 tono y ½</li>
                  <li>Cejillo en traste 5 = subir 2 tonos y ½ (perfecta cuarta)</li>
                </ul>
                <div className="gmc-notes-tip">
                  🎯 <strong style={{ color: "#c4956a" }}>Práctica de la semana:</strong> Toma "Amazing Grace" (acordes:
                  G, D, Em, C). Pon cejillo en traste 2 y toca la misma forma. Ahora estás en La mayor. Graba 30
                  segundos y súbelo al Discord.
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ===== CONTROLS BAR ===== */}
      <div className="gmc-controls">
        <button className="gmc-btn gmc-btn-primary" onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
          {isPlaying ? "Pausa" : "Reproducir"}
        </button>
        <button className="gmc-btn">
          <LoopIcon /> Loop
        </button>
        <button className="gmc-btn">
          <MetronomeIcon /> Metrónomo
        </button>
        <button className="gmc-btn">
          <MicIcon /> Grabar
        </button>
        <div className="gmc-tempo-wrap">
          <span className="gmc-tempo-label">Tempo</span>
          <input
            type="range"
            className="gmc-tempo-slider"
            min={50}
            max={120}
            value={tempo}
            onChange={(e) => setTempo(Number(e.target.value))}
          />
          <span className="gmc-tempo-val">{tempo}%</span>
        </div>
      </div>

      {/* ===== STYLES ===== */}
      <style jsx>{`
        .gmc-classroom {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          color: #f5f5f0;
          background: #0a0a0a;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        /* Header */
        .gmc-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 20px;
          background: linear-gradient(90deg, #0a0a0a 0%, #1a1208 100%);
          border-bottom: 1px solid #2a1f15;
        }
        .gmc-logo {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .gmc-logo-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: linear-gradient(135deg, #c4956a 0%, #8b6239 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
        }
        .gmc-logo-text {
          font-size: 16px;
          font-weight: 500;
          color: #f5f5f0;
          letter-spacing: 0.5px;
        }
        .gmc-nav {
          display: flex;
          gap: 20px;
        }
        .gmc-nav-item {
          font-size: 12px;
          color: #999;
          cursor: pointer;
          transition: color 0.15s;
        }
        .gmc-nav-item:hover,
        .gmc-nav-item.active {
          color: #c4956a;
        }
        .gmc-user {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .gmc-streak {
          font-size: 11px;
          color: #c4956a;
          font-weight: 500;
        }
        .gmc-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c4956a 0%, #8b6239 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 500;
          color: #0a0a0a;
        }

        /* Subheader */
        .gmc-subheader {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          background: #111;
          border-bottom: 1px solid #1a1a1a;
        }
        .gmc-live-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(196, 149, 106, 0.1);
          color: #c4956a;
          font-size: 11px;
          font-weight: 500;
          padding: 4px 12px;
          border-radius: 6px;
          border: 1px solid rgba(196, 149, 106, 0.25);
        }
        .gmc-live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #c4956a;
          animation: livePulse 2s infinite;
        }
        @keyframes livePulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }
        .gmc-class-info {
          font-size: 12px;
          color: #888;
        }
        .gmc-class-info strong {
          color: #f5f5f0;
          font-weight: 500;
        }
        .gmc-timer {
          font-size: 13px;
          color: #c4956a;
          font-variant-numeric: tabular-nums;
          font-weight: 500;
        }

        /* Progress */
        .gmc-progress-wrap {
          padding: 10px 20px;
          background: #111;
          border-bottom: 1px solid #1a1a1a;
        }
        .gmc-progress-labels {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #666;
          margin-bottom: 4px;
        }
        .gmc-progress-bar {
          height: 3px;
          background: #1a1a1a;
          border-radius: 2px;
          overflow: hidden;
        }
        .gmc-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #c4956a 0%, #8b6239 100%);
          border-radius: 2px;
          transition: width 0.3s ease;
        }

        /* Main */
        .gmc-main {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 0;
          flex: 1;
        }
        @media (max-width: 768px) {
          .gmc-main {
            grid-template-columns: 1fr;
          }
          .gmc-sidebar {
            max-height: 200px;
            border-right: none;
            border-bottom: 1px solid #1a1a1a;
          }
        }

        /* Sidebar */
        .gmc-sidebar {
          background: #0d0d0d;
          border-right: 1px solid #1a1a1a;
          padding: 14px;
          overflow-y: auto;
        }
        .gmc-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
          padding-bottom: 10px;
          border-bottom: 1px solid #1a1a1a;
        }
        .gmc-sidebar-title {
          font-size: 12px;
          font-weight: 500;
          color: #c4956a;
        }
        .gmc-sidebar-subtitle {
          font-size: 10px;
          color: #666;
        }
        .gmc-world-progress {
          font-size: 10px;
          color: #666;
        }
        .gmc-lesson-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
          margin-bottom: 3px;
          border: 1px solid transparent;
        }
        .gmc-lesson-item:hover {
          background: #151515;
        }
        .gmc-lesson-item.active {
          background: rgba(196, 149, 106, 0.06);
          border-color: rgba(196, 149, 106, 0.2);
        }
        .gmc-lesson-item.locked {
          opacity: 0.35;
          cursor: not-allowed;
        }
        .gmc-lesson-num {
          width: 22px;
          height: 22px;
          border-radius: 6px;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 500;
          color: #666;
          flex-shrink: 0;
        }
        .gmc-lesson-num.done {
          background: #2d5a3d;
          color: #6ecf8a;
        }
        .gmc-lesson-num.current {
          background: #c4956a;
          color: #0a0a0a;
        }
        .gmc-lesson-info {
          flex: 1;
          min-width: 0;
        }
        .gmc-lesson-name {
          font-size: 11px;
          font-weight: 500;
          color: #ccc;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .gmc-lesson-item.active .gmc-lesson-name {
          color: #f5f5f0;
        }
        .gmc-lesson-meta {
          font-size: 9px;
          color: #555;
        }
        .gmc-lesson-tag {
          font-size: 8px;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: 500;
          flex-shrink: 0;
        }

        /* Content */
        .gmc-content {
          padding: 16px 20px;
          background: #0a0a0a;
          overflow-y: auto;
        }
        .gmc-breadcrumb {
          font-size: 11px;
          color: #555;
          margin-bottom: 8px;
        }
        .gmc-breadcrumb span {
          color: #c4956a;
          margin: 0 6px;
        }
        .gmc-lesson-title {
          font-size: 18px;
          font-weight: 500;
          color: #f5f5f0;
          margin: 0 0 2px 0;
        }
        .gmc-lesson-subtitle {
          font-size: 12px;
          color: #888;
          margin: 0 0 14px 0;
        }

        /* Video */
        .gmc-video-box {
          aspect-ratio: 16 / 9;
          background: linear-gradient(135deg, #1a1208 0%, #0d0d0d 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          position: relative;
          border: 1px solid #2a1f15;
          overflow: hidden;
        }
        .gmc-video-box::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(circle at 30% 50%, rgba(196, 149, 106, 0.06) 0%, transparent 60%);
          pointer-events: none;
        }
        .gmc-video-play {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          background: linear-gradient(135deg, #c4956a 0%, #8b6239 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.2s;
          position: relative;
          z-index: 1;
          border: none;
          box-shadow: 0 4px 20px rgba(196, 149, 106, 0.25);
        }
        .gmc-video-play:hover {
          transform: scale(1.08);
        }
        .gmc-video-overlay {
          position: absolute;
          bottom: 12px;
          left: 14px;
          font-size: 11px;
          color: rgba(245, 245, 240, 0.7);
          background: rgba(0, 0, 0, 0.5);
          padding: 3px 10px;
          border-radius: 6px;
          z-index: 1;
        }

        /* Theory Box */
        .gmc-theory-box {
          background: linear-gradient(135deg, #1a1208 0%, #0d0d0d 100%);
          border: 1px solid #2a1f15;
          border-radius: 10px;
          padding: 14px;
          margin-bottom: 14px;
          position: relative;
          overflow: hidden;
        }
        .gmc-theory-box::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 3px;
          height: 100%;
          background: linear-gradient(180deg, #c4956a 0%, #8b6239 100%);
        }
        .gmc-theory-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .gmc-theory-badge {
          font-size: 10px;
          font-weight: 500;
          color: #c4956a;
          background: rgba(196, 149, 106, 0.1);
          padding: 2px 10px;
          border-radius: 4px;
          border: 1px solid rgba(196, 149, 106, 0.15);
        }
        .gmc-theory-text {
          font-size: 12px;
          line-height: 1.7;
          color: #aaa;
        }
        .gmc-code {
          background: #1a1a1a;
          padding: 1px 5px;
          border-radius: 4px;
          font-family: "SF Mono", Monaco, monospace;
          font-size: 11px;
          color: #c4956a;
        }

        /* Content Tabs */
        .gmc-content-tabs {
          display: flex;
          gap: 4px;
          border-bottom: 1px solid #1a1a1a;
          margin-bottom: 12px;
        }
        .gmc-content-tab {
          padding: 8px 16px;
          font-size: 12px;
          font-weight: 500;
          color: #666;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          margin-bottom: -1px;
          transition: all 0.15s;
          font-family: inherit;
        }
        .gmc-content-tab:hover {
          color: #aaa;
        }
        .gmc-content-tab.active {
          color: #c4956a;
          border-bottom-color: #c4956a;
        }

        /* Tab Panel */
        .gmc-tab-panel {
          background: #111;
          border: 1px solid #1a1a1a;
          border-radius: 10px;
          padding: 14px;
        }
        .gmc-fb-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        .gmc-fb-title {
          font-size: 12px;
          font-weight: 500;
          color: #ccc;
        }
        .gmc-fb-chord {
          font-size: 11px;
          color: #c4956a;
        }

        /* Resources */
        .gmc-resources {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .gmc-resource {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #1a1a1a;
          background: #0d0d0d;
          cursor: pointer;
          transition: all 0.15s;
        }
        .gmc-resource:hover {
          border-color: #2a1f15;
          background: #151515;
        }
        .gmc-res-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          flex-shrink: 0;
        }
        .gmc-res-pdf {
          background: rgba(196, 149, 106, 0.1);
        }
        .gmc-res-mp3 {
          background: rgba(232, 168, 76, 0.1);
        }
        .gmc-res-gp {
          background: rgba(110, 207, 138, 0.1);
        }
        .gmc-res-info {
          flex: 1;
        }
        .gmc-res-name {
          font-size: 12px;
          font-weight: 500;
          color: #ccc;
        }
        .gmc-res-size {
          font-size: 10px;
          color: #555;
        }
        .gmc-res-dl {
          font-size: 11px;
          color: #c4956a;
          font-weight: 500;
        }

        /* Notes */
        .gmc-notes {
          font-size: 12px;
          line-height: 1.7;
          color: #999;
        }
        .gmc-notes ul {
          padding-left: 18px;
          margin: 6px 0;
        }
        .gmc-notes li {
          margin-bottom: 4px;
        }
        .gmc-notes-tip {
          margin-top: 10px;
          padding: 10px;
          background: rgba(196, 149, 106, 0.05);
          border: 1px solid rgba(196, 149, 106, 0.1);
          border-radius: 8px;
          font-size: 11px;
          color: #aaa;
        }

        /* Controls */
        .gmc-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #111;
          border-top: 1px solid #1a1a1a;
          flex-wrap: wrap;
        }
        .gmc-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: 8px;
          border: 1px solid #2a1f15;
          background: #1a1208;
          color: #c4956a;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: inherit;
        }
        .gmc-btn:hover {
          background: #2a1f15;
        }
        .gmc-btn-primary {
          background: linear-gradient(135deg, #c4956a 0%, #8b6239 100%);
          color: #0a0a0a;
          border-color: transparent;
        }
        .gmc-btn-primary:hover {
          opacity: 0.9;
        }
        .gmc-tempo-wrap {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-left: auto;
        }
        .gmc-tempo-label {
          font-size: 10px;
          color: #555;
        }
        .gmc-tempo-slider {
          width: 80px;
          height: 3px;
          -webkit-appearance: none;
          appearance: none;
          background: #1a1a1a;
          border-radius: 2px;
          outline: none;
        }
        .gmc-tempo-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c4956a;
          cursor: pointer;
        }
        .gmc-tempo-slider::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #c4956a;
          cursor: pointer;
          border: none;
        }
        .gmc-tempo-val {
          font-size: 11px;
          color: #c4956a;
          font-weight: 500;
          min-width: 28px;
        }
      `}</style>
    </div>
  );
}

/* ============================================================
   DIAPASÓN SVG (componente separado)
   ============================================================ */
function FretboardSVG() {
  return (
    <svg viewBox="0 0 520 130" style={{ width: "100%", maxWidth: "600px" }}>
      {/* Fretboard background */}
      <rect x="15" y="10" width="490" height="95" fill="#1a1208" rx="4" stroke="#2a1f15" />
      {/* Frets */}
      <line x1="55" y1="10" x2="55" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="110" y1="10" x2="110" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="165" y1="10" x2="165" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="220" y1="10" x2="220" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="275" y1="10" x2="275" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="330" y1="10" x2="330" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="385" y1="10" x2="385" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      <line x1="440" y1="10" x2="440" y2="105" stroke="#3a2a1a" strokeWidth="2" />
      {/* Nut */}
      <rect x="13" y="8" width="5" height="99" fill="#c4956a" rx="2" />
      {/* Strings */}
      <line x1="20" y1="22" x2="505" y2="22" stroke="#888" strokeWidth="0.8" />
      <line x1="20" y1="36" x2="505" y2="36" stroke="#888" strokeWidth="1" />
      <line x1="20" y1="50" x2="505" y2="50" stroke="#888" strokeWidth="1.2" />
      <line x1="20" y1="64" x2="505" y2="64" stroke="#888" strokeWidth="1.5" />
      <line x1="20" y1="78" x2="505" y2="78" stroke="#888" strokeWidth="2" />
      <line x1="20" y1="92" x2="505" y2="92" stroke="#888" strokeWidth="2.5" />
      {/* Fret markers */}
      <circle cx="137" cy="57" r="4" fill="#5a4a3a" opacity="0.6" />
      <circle cx="247" cy="57" r="4" fill="#5a4a3a" opacity="0.6" />
      <circle cx="357" cy="57" r="4" fill="#5a4a3a" opacity="0.6" />
      {/* Cejillo bar (traste 2) */}
      <rect x="53" y="18" width="5" height="79" fill="#c4956a" rx="2" opacity="0.9" />
      <text x="55" y="115" textAnchor="middle" fontSize="8" fill="#c4956a" fontWeight="500">
        CEJILLO
      </text>
      {/* Finger positions (Em shape with capo on 2 = F#m) */}
      <circle cx="30" cy="22" r="8" fill="#2d5a3d" opacity="0.9" />
      <text x="30" y="26" textAnchor="middle" fontSize="9" fill="#6ecf8a" fontWeight="500">
        O
      </text>
      <circle cx="30" cy="36" r="8" fill="#2d5a3d" opacity="0.9" />
      <text x="30" y="40" textAnchor="middle" fontSize="9" fill="#6ecf8a" fontWeight="500">
        O
      </text>
      <circle cx="30" cy="50" r="8" fill="#2d5a3d" opacity="0.9" />
      <text x="30" y="54" textAnchor="middle" fontSize="9" fill="#6ecf8a" fontWeight="500">
        O
      </text>
      <circle cx="137" cy="64" r="8" fill="#c4956a" opacity="0.9" />
      <text x="137" y="68" textAnchor="middle" fontSize="9" fill="#0a0a0a" fontWeight="500">
        2
      </text>
      <circle cx="137" cy="78" r="8" fill="#c4956a" opacity="0.9" />
      <text x="137" y="82" textAnchor="middle" fontSize="9" fill="#0a0a0a" fontWeight="500">
        3
      </text>
      <text x="30" y="96" textAnchor="middle" fontSize="11" fill="#c4956a" fontWeight="500">
        X
      </text>
      {/* Labels */}
      <text x="30" y="6" textAnchor="middle" fontSize="8" fill="#555">
        0
      </text>
      <text x="82" y="6" textAnchor="middle" fontSize="8" fill="#555">
        1
      </text>
      <text x="137" y="6" textAnchor="middle" fontSize="8" fill="#555">
        2
      </text>
      <text x="192" y="6" textAnchor="middle" fontSize="8" fill="#555">
        3
      </text>
      <text x="247" y="6" textAnchor="middle" fontSize="8" fill="#555">
        4
      </text>
      <text x="302" y="6" textAnchor="middle" fontSize="8" fill="#555">
        5
      </text>
      <text x="357" y="6" textAnchor="middle" fontSize="8" fill="#555">
        6
      </text>
      <text x="412" y="6" textAnchor="middle" fontSize="8" fill="#555">
        7
      </text>
      {/* Legend */}
      <text x="280" y="125" fontSize="9" fill="#666">
        ● = dedo 2/3
      </text>
      <text x="360" y="125" fontSize="9" fill="#666">
        O = cuerda al aire
      </text>
      <text x="450" y="125" fontSize="9" fill="#c4956a">
        X = no tocar
      </text>
    </svg>
  );
}
