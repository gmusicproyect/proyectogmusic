import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const GOLD = "#C9A84C";
const WHITE_WARM = "#F5F0E8";
const BORDER = "rgba(255,255,255,0.06)";

interface VideoPlayerLessonProps {
  title: string;
  subtitle: string;
  duration: string;
  lessonLabel: string;
  /** URL de embed de YouTube (https://www.youtube.com/embed/ID). Cuando se provee, muestra iframe real en lugar del player simulado. */
  videoUrl?: string;
  cinemaMode?: boolean;
  onCinemaToggle?: () => void;
  onPlaybackComplete?: () => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function VideoPlayerLesson({ title, subtitle, duration, lessonLabel, videoUrl, cinemaMode, onCinemaToggle, onPlaybackComplete }: VideoPlayerLessonProps) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100
  const [hovered, setHovered] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [muted, setMuted] = useState(false);
  // Tracks manual confirmation for YouTube iframe mode
  const [watched, setWatched] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideControlsRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackCompleteRef = useRef(false);

  // Simulate playback (only used in fake player mode — when videoUrl is absent)
  const totalSeconds = 12 * 60; // 12 min
  const currentSeconds = (progress / 100) * totalSeconds;

  useEffect(() => {
    if (playing) {
      timerRef.current = setInterval(() => {
        setProgress(p => {
          if (p >= 100) { setPlaying(false); return 100; }
          return p + 100 / (totalSeconds * 10); // increments every 100ms
        });
      }, 100);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [playing]);

  useEffect(() => {
    if (progress >= 100 && !playbackCompleteRef.current) {
      playbackCompleteRef.current = true;
      onPlaybackComplete?.();
    }
  }, [progress, onPlaybackComplete]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsRef.current) clearTimeout(hideControlsRef.current);
    if (playing) {
      hideControlsRef.current = setTimeout(() => setShowControls(false), 2800);
    }
  };

  const handlePlay = () => {
    setPlaying(p => !p);
    setShowControls(true);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setProgress(pct * 100);
  };

  const handleWatchConfirm = () => {
    if (!playbackCompleteRef.current) {
      playbackCompleteRef.current = true;
      setWatched(true);
      onPlaybackComplete?.();
    }
  };

  const chapters = [
    { label: "Introducción", pct: 0 },
    { label: "Las 6 cuerdas", pct: 18 },
    { label: "Acorde Am", pct: 42 },
    { label: "Acorde Em", pct: 65 },
    { label: "Progresión", pct: 82 },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {/* Video container */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => { if (playing) setShowControls(false); }}
        style={{
          position: "relative", width: "100%", paddingBottom: "56.25%",
          background: "#050505", borderRadius: "4px 4px 0 0",
          overflow: "hidden", cursor: playing && !showControls ? "none" : "pointer",
          border: `1px solid ${BORDER}`, borderBottom: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0 }}>
          {videoUrl ? (
            /* ── YouTube iframe mode ── */
            <iframe
              src={`${videoUrl}?rel=0&modestbranding=1`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              loading="lazy"
              title={title}
            />
          ) : (
            /* ── Fake simulated player (used while owned videos aren't ready) ── */
            <>
              {/* Background ambience - music class visual */}
              <div style={{
                position: "absolute", inset: 0,
                background: "radial-gradient(ellipse at 30% 60%, rgba(201,168,76,0.04) 0%, transparent 60%), radial-gradient(ellipse at 70% 30%, rgba(80,60,20,0.08) 0%, transparent 50%), #050505",
              }} />

              {/* Fretboard / visual */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: playing ? 0.6 : 1, transition: "opacity 0.5s" }}>
                <div style={{ textAlign: "center" }}>
                  {/* Guitar neck visual */}
                  <div style={{ position: "relative", width: 220, height: 90, margin: "0 auto" }}>
                    {/* Frets */}
                    {[0, 1, 2, 3, 4].map(f => (
                      <div key={f} style={{
                        position: "absolute", left: `${f * 22}%`, top: 0, bottom: 0,
                        width: f === 0 ? 3 : 1,
                        background: f === 0 ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.08)",
                      }} />
                    ))}
                    {/* Strings */}
                    {["E", "A", "D", "G", "B", "e"].map((s, idx) => (
                      <div key={s} style={{
                        position: "absolute", left: 0, right: 0,
                        top: `${(idx / 5) * 88}%`,
                        height: Math.max(1, 2.5 - idx * 0.3),
                        background: `rgba(255,255,255,${0.06 + idx * 0.02})`,
                      }} />
                    ))}
                    {/* Am chord dots */}
                    {[
                      { fret: 1, string: 1 },
                      { fret: 2, string: 2 },
                      { fret: 2, string: 3 },
                    ].map((dot, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: playing ? [1, 1.15, 1] : 1 }}
                        transition={{ delay: i * 0.1, repeat: playing ? Infinity : 0, duration: 1.8, repeatDelay: 1 }}
                        style={{
                          position: "absolute",
                          left: `${dot.fret * 20 + 8}%`,
                          top: `${(dot.string / 5) * 88 - 5}%`,
                          width: 14, height: 14, borderRadius: "50%",
                          background: GOLD, opacity: 0.85,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(201,168,76,0.4)", fontFamily: "Inter,sans-serif", letterSpacing: "2px", textTransform: "uppercase", marginTop: 16 }}>
                    {playing ? "Reproduciendo · Am" : "Lista para reproducir"}
                  </div>
                </div>
              </div>

              {/* Playing pulse overlay */}
              <AnimatePresence>
                {playing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(201,168,76,0.03) 0%, transparent 50%)" }}
                  />
                )}
              </AnimatePresence>

              {/* Big play button (only when paused) */}
              <AnimatePresence>
                {!playing && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.2 }}
                    onClick={handlePlay}
                    style={{
                      position: "absolute", inset: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.93 }}
                      style={{
                        width: 64, height: 64, borderRadius: "50%",
                        background: "rgba(201,168,76,0.12)",
                        border: "2px solid rgba(201,168,76,0.4)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill={GOLD}><path d="M5 3l14 9-14 9V3z" /></svg>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls overlay */}
              <motion.div
                animate={{ opacity: showControls ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  position: "absolute", bottom: 0, left: 0, right: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)",
                  padding: "32px 16px 12px",
                  pointerEvents: showControls ? "all" : "none",
                }}
              >
                {/* Chapter markers */}
                <div style={{ position: "relative", height: 14, marginBottom: 4 }}>
                  {chapters.map(ch => (
                    <div
                      key={ch.label}
                      style={{
                        position: "absolute", left: `${ch.pct}%`,
                        transform: "translateX(-50%)",
                        fontSize: 8, color: ch.pct <= progress ? "rgba(201,168,76,0.7)" : "rgba(255,255,255,0.2)",
                        fontFamily: "Inter,sans-serif", letterSpacing: "0.5px",
                        whiteSpace: "nowrap", transition: "color 0.3s",
                      }}
                    >
                      ▸ {ch.label}
                    </div>
                  ))}
                </div>

                {/* Progress bar */}
                <div
                  onClick={handleSeek}
                  style={{ height: 4, background: "rgba(255,255,255,0.1)", borderRadius: 2, cursor: "pointer", marginBottom: 10, position: "relative" }}
                  onMouseEnter={() => setHovered(true)}
                  onMouseLeave={() => setHovered(false)}
                >
                  <div style={{
                    height: "100%", width: `${progress}%`,
                    background: `linear-gradient(to right, rgba(201,168,76,0.6), ${GOLD})`,
                    borderRadius: 2, transition: "width 0.1s linear",
                  }} />
                  {/* Scrubber thumb */}
                  <div style={{
                    position: "absolute", top: "50%", left: `${progress}%`,
                    transform: "translate(-50%, -50%)",
                    width: hovered ? 12 : 8, height: hovered ? 12 : 8,
                    borderRadius: "50%", background: GOLD,
                    transition: "width 0.15s, height 0.15s",
                    boxShadow: "0 0 6px rgba(201,168,76,0.6)",
                  }} />
                </div>

                {/* Bottom controls */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Play/Pause */}
                    <button onClick={handlePlay} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: WHITE_WARM, display: "flex" }}>
                      {playing
                        ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                        : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
                      }
                    </button>

                    {/* Mute */}
                    <button onClick={() => setMuted(m => !m)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: muted ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.6)", display: "flex" }}>
                      {muted
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                      }
                    </button>

                    {/* Time */}
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "Inter,sans-serif", letterSpacing: "0.5px" }}>
                      {formatTime(currentSeconds)} <span style={{ color: "rgba(255,255,255,0.2)" }}>/ {duration}</span>
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 10, color: "rgba(201,168,76,0.5)", fontFamily: "Inter,sans-serif", letterSpacing: "1px", textTransform: "uppercase" }}>
                      {lessonLabel}
                    </span>
                    {onCinemaToggle && (
                      <button
                        onClick={onCinemaToggle}
                        title={cinemaMode ? "Salir del modo cine" : "Modo cine"}
                        style={{
                          background: cinemaMode ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.06)",
                          border: `1px solid ${cinemaMode ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.12)"}`,
                          borderRadius: 2, padding: "3px 8px", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                          color: cinemaMode ? "#C9A84C" : "rgba(255,255,255,0.45)",
                          fontSize: 10, fontFamily: "Inter,sans-serif", transition: "all 0.15s",
                        }}
                      >
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          {cinemaMode
                            ? <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                            : <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                          }
                        </svg>
                        Cine
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Video title bar */}
      <div style={{
        background: "#0D0D0D", border: `1px solid ${BORDER}`, borderTop: "none",
        borderRadius: videoUrl ? "0" : "0 0 4px 4px", padding: "14px 18px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <div style={{ fontSize: 13, color: WHITE_WARM, fontFamily: "Inter,sans-serif", fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Inter,sans-serif", marginTop: 3 }}>{subtitle}</div>
        </div>
        <div style={{
          fontSize: 10, color: "rgba(201,168,76,0.5)", fontFamily: "Inter,sans-serif",
          letterSpacing: "1.5px", textTransform: "uppercase",
          background: "rgba(201,168,76,0.05)", border: "1px solid rgba(201,168,76,0.12)",
          borderRadius: 2, padding: "3px 10px",
        }}>
          {duration}
        </div>
      </div>

      {/* Watch confirmation button — only shown in YouTube iframe mode */}
      {videoUrl && (
        <button
          type="button"
          onClick={handleWatchConfirm}
          disabled={watched}
          style={{
            width: "100%", padding: "13px 18px",
            borderRadius: "0 0 4px 4px",
            border: `1px solid ${BORDER}`, borderTop: "none",
            background: watched ? "rgba(88,204,2,0.06)" : "rgba(201,168,76,0.05)",
            color: watched ? "rgba(88,204,2,0.7)" : "rgba(201,168,76,0.65)",
            fontSize: 11, fontWeight: 700,
            fontFamily: "Inter,sans-serif",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: watched ? "default" : "pointer",
            transition: "all 0.2s",
          }}
        >
          {watched ? "Video marcado como visto ✓" : "He terminado de ver este video →"}
        </button>
      )}
    </div>
  );
}
