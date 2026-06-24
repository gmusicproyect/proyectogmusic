import { useState } from "react";
import { motion } from "motion/react";
import {
  ACADEMIA_TIERS,
  getTracksForTier,
  isFreeClassTrack,
  type AcademiaTierId,
  type AcademiaTrackCombination,
} from "../../utils/academia-track-matrix";
import { analytics } from "../../utils/analytics";
import { shouldShowTemperamentQuiz } from "../../utils/temperament-quiz-storage";

const GOLD = "#C9A84C";
const GOLD_BORDER = "rgba(201,168,76,0.3)";
const WHITE_WARM = "#F5F0E8";

export function InteractiveLevelSelector({
  setPage,
  setLevel,
  isSubscribedStudent = false,
}: {
  setPage: (page: string) => void;
  setLevel: (level: string) => void;
  isSubscribedStudent?: boolean;
}) {
  const [activeTierId, setActiveTierId] = useState<AcademiaTierId>("basico");
  const [activeFocusIndex, setActiveFocusIndex] = useState(0);

  const tracks = getTracksForTier(activeTierId);

  const handleStart = (track: AcademiaTrackCombination) => {
    if (!isFreeClassTrack(track)) return;
    analytics.demoCtaClicked();
    setLevel(track.focusId);
    setPage(shouldShowTemperamentQuiz({ isSubscribedStudent }) ? "onboarding-quiz" : "mi-camino-demo");
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 0, maxWidth: 560 }}>
        {ACADEMIA_TIERS.map((tier, i) => {
          const isActive = activeTierId === tier.id;
          return (
            <div key={tier.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              <button
                type="button"
                onClick={() => {
                  setActiveTierId(tier.id);
                  setActiveFocusIndex(0);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "4px 14px", borderRadius: 2, cursor: "pointer",
                  background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
                  border: `1px solid ${isActive ? GOLD_BORDER : "transparent"}`,
                  transition: "all 0.2s",
                  color: isActive ? GOLD : "rgba(255,255,255,0.25)",
                  fontSize: 13, fontFamily: "Inter, sans-serif",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {tier.selectorLabel}
              </button>
              {i < ACADEMIA_TIERS.length - 1 && (
                <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        display: "flex", flexDirection: "row", gap: 12,
        height: "min(360px, 42vh)", width: "100%",
      }}>
        {tracks.map((track, i) => {
          const isActive = activeFocusIndex === i;
          const showFreeClass = isFreeClassTrack(track);

          return (
            <motion.div
              key={`${track.tierId}-${track.focusId}`}
              onMouseEnter={() => setActiveFocusIndex(i)}
              animate={{ flex: isActive ? 4 : 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{
                position: "relative", minWidth: isActive ? 260 : 72,
                height: "100%", borderRadius: 4, overflow: "hidden",
                cursor: "pointer", background: "#111",
                border: `1px solid ${isActive ? GOLD_BORDER : "rgba(255,255,255,0.05)"}`,
                boxShadow: isActive ? "0 20px 60px rgba(201,168,76,0.08)" : "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
            >
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${track.bgImage})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: isActive ? 0.45 : 0.15,
                  filter: isActive ? "grayscale(20%)" : "grayscale(70%)",
                  transition: "opacity 0.4s, filter 0.4s",
                }}
              />

              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.15) 100%)",
              }} />

              {isActive && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                  background: "linear-gradient(to top, rgba(201,168,76,0.08) 0%, transparent 100%)",
                  pointerEvents: "none",
                }} />
              )}

              <div style={{
                position: "absolute", inset: 0, padding: isActive ? "28px 24px" : "20px 0",
                display: "flex", flexDirection: "column",
                alignItems: isActive ? "flex-start" : "center",
                justifyContent: isActive ? "flex-end" : "center",
              }}>
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    style={{ width: "100%" }}
                  >
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.3px",
                      color: GOLD, fontFamily: "Inter, sans-serif", marginBottom: 6,
                    }}>
                      {track.tierSelectorLabel}
                    </div>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 26, fontWeight: 400, letterSpacing: 0,
                      color: WHITE_WARM, margin: "0 0 10px", lineHeight: 1.15,
                    }}>
                      {track.focusTitle}
                    </h3>
                    <p style={{
                      color: "rgba(255,255,255,0.58)", fontSize: 13,
                      lineHeight: 1.6, fontFamily: "Inter, sans-serif",
                      margin: "0 0 16px", maxWidth: 300,
                    }}>
                      {track.description}
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 12px", borderRadius: 2,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>{track.forWho}</span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 12px", borderRadius: 2,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>{track.duracion}</span>
                      </div>
                    </div>

                    {showFreeClass ? (
                      <motion.button
                        type="button"
                        whileHover={{ background: "rgba(201,168,76,0.85)", boxShadow: "0 8px 24px rgba(201,168,76,0.25)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleStart(track)}
                        style={{
                          width: "100%", height: 44, borderRadius: 2,
                          background: GOLD, color: "#080808",
                          fontSize: 12, fontWeight: 700, border: "none",
                          cursor: "pointer", letterSpacing: "1px",
                          textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                      >
                        Ver clase gratuita
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </motion.button>
                    ) : (
                      <div
                        aria-disabled="true"
                        style={{
                          width: "100%", height: 44, borderRadius: 2,
                          background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)",
                          fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.08)",
                          letterSpacing: "1px", textTransform: "uppercase",
                          fontFamily: "Inter, sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "not-allowed",
                        }}
                      >
                        Próximamente
                      </div>
                    )}
                    <div style={{
                      fontSize: 11, color: "rgba(201,168,76,0.45)",
                      fontFamily: "Inter, sans-serif", marginTop: 8,
                      letterSpacing: "0.5px",
                    }}>
                      {showFreeClass ? "Guitarra · Sin tarjeta · 7 min" : "Disponible en una próxima etapa"}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "0.3px",
                      color: "rgba(201,168,76,0.4)",
                      fontFamily: "Inter, sans-serif",
                    }}>{track.tierSelectorLabel}</span>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20, fontWeight: 400, letterSpacing: "1px",
                      color: "rgba(255,255,255,0.4)",
                    }}>{track.focusTitle}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
