import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { VideoPlayerLesson } from "../components/dashboard/VideoPlayerLesson";
import { MultipleChoiceExercise } from "../components/gmusic/lesson/MultipleChoiceExercise";
import { navigateToHomeSection } from "../utils/public-home-navigation";
import {
  buildFreeFundamentoChallengeExercise,
  FREE_FUNDAMENTO_LESSON_TITLE,
  FREE_FUNDAMENTO_STATIONS,
  isExpectedFreeFundamentoAnswer,
  nextFreeFundamentoLessonPhase,
  playFreeFundamentoSuccessFeedback,
  type FreeFundamentoLessonPhase,
} from "../utils/free-fundamento-lesson";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";

interface FreeFundamentoLessonPageProps {
  setPage: (page: string) => void;
}

const STATION_INDEX: Record<FreeFundamentoLessonPhase, number> = {
  video: 0,
  challenge: 1,
  success: 2,
};

function FreeFundamentoStationStepper({ phase }: { phase: FreeFundamentoLessonPhase }) {
  const activeIndex = STATION_INDEX[phase];

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={activeIndex + 1}
      aria-label={`Estación ${activeIndex + 1} de 3`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      {FREE_FUNDAMENTO_STATIONS.map((station, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;

        return (
          <div key={station.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 12px",
                borderRadius: 999,
                border: `1px solid ${isActive ? "rgba(201,168,76,0.45)" : isComplete ? "rgba(201,168,76,0.22)" : "rgba(255,255,255,0.08)"}`,
                background: isActive ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.02)",
              }}
            >
              <span
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: isActive || isComplete ? "#080808" : "rgba(255,255,255,0.45)",
                  background: isActive || isComplete ? GOLD : "rgba(255,255,255,0.08)",
                }}
              >
                {index + 1}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  color: isActive ? WHITE_WARM : isComplete ? "rgba(201,168,76,0.75)" : "rgba(255,255,255,0.35)",
                }}
              >
                {station.label}
              </span>
            </div>
            {index < FREE_FUNDAMENTO_STATIONS.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  width: 28,
                  height: 1,
                  background: index < activeIndex ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function FreeFundamentoLessonPage({ setPage }: FreeFundamentoLessonPageProps) {
  const [phase, setPhase] = useState<FreeFundamentoLessonPhase>("video");
  const [videoComplete, setVideoComplete] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [challengeResolved, setChallengeResolved] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const challengeExercise = useMemo(() => buildFreeFundamentoChallengeExercise(), []);

  const handleVideoComplete = () => {
    setVideoComplete(true);
  };

  const handleOptionSelect = (optionId: string) => {
    if (challengeResolved) return;

    setSelectedOptionId(optionId);

    if (isExpectedFreeFundamentoAnswer(optionId)) {
      setChallengeResolved(true);
      setFeedbackMessage("¡Exacto! El cuerpo es el apoyo estable sobre tu pierna.");
      playFreeFundamentoSuccessFeedback();
      return;
    }

    setFeedbackMessage("Casi. Piensa en la caja resonante del instrumento.");
  };

  const handleContinue = () => {
    if (phase === "video" && videoComplete) {
      setPhase(nextFreeFundamentoLessonPhase(phase));
      return;
    }

    if (phase === "challenge" && challengeResolved) {
      setPhase(nextFreeFundamentoLessonPhase(phase));
    }
  };

  const canContinue =
    (phase === "video" && videoComplete) ||
    (phase === "challenge" && challengeResolved);

  return (
    <div
      style={{
        height: "100vh",
        minHeight: "100vh",
        width: "100%",
        background: "#080808",
        color: WHITE_WARM,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,8,8,0.96)",
          backdropFilter: "blur(16px)",
          padding: "16px 20px 14px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            marginBottom: 14,
          }}
        >
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.65)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Clase gratuita · Fundamento
            </p>
            <h1
              style={{
                margin: "4px 0 0",
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(20px, 3vw, 28px)",
                fontWeight: 400,
                letterSpacing: 0,
                lineHeight: 1.2,
                color: WHITE_WARM,
              }}
            >
              {FREE_FUNDAMENTO_LESSON_TITLE}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigateToHomeSection(setPage, "academia")}
            aria-label="Salir de la clase gratuita"
            style={{
              width: 36,
              height: 36,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.65)",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          <FreeFundamentoStationStepper phase={phase} />
        </div>
      </header>

      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
          overflow: "hidden",
        }}
      >
        <div style={{ width: "100%", maxWidth: phase === "challenge" ? 720 : 960, minHeight: 0 }}>
          <AnimatePresence mode="wait">
            {phase === "video" && (
              <motion.div
                key="video-stage"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                style={{ width: "100%" }}
              >
                <VideoPlayerLesson
                  title={FREE_FUNDAMENTO_LESSON_TITLE}
                  subtitle="Postura, apoyo y primer contacto con la guitarra"
                  duration="7 min"
                  lessonLabel="Fundamento"
                  onPlaybackComplete={handleVideoComplete}
                />
              </motion.div>
            )}

            {phase === "challenge" && (
              <motion.div
                key="challenge-stage"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.28 }}
                style={{
                  width: "100%",
                  padding: "8px 4px",
                }}
              >
                <MultipleChoiceExercise
                  exercise={challengeExercise}
                  selectedOptionId={selectedOptionId}
                  disabled={challengeResolved}
                  onSelect={handleOptionSelect}
                />

                {feedbackMessage && (
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      margin: "18px 0 0",
                      fontSize: 14,
                      lineHeight: 1.6,
                      fontFamily: "Inter, sans-serif",
                      color: challengeResolved ? GOLD : "rgba(255,255,255,0.58)",
                    }}
                  >
                    {feedbackMessage}
                  </motion.p>
                )}
              </motion.div>
            )}

            {phase === "success" && (
              <motion.div
                key="success-stage"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.32 }}
                style={{
                  width: "100%",
                  maxWidth: 560,
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "24px 12px",
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    margin: "0 auto 20px",
                    borderRadius: "50%",
                    border: "1px solid rgba(201,168,76,0.35)",
                    background: "rgba(201,168,76,0.1)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    color: GOLD,
                  }}
                >
                  ✓
                </div>

                <h2
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(28px, 4vw, 36px)",
                    fontWeight: 400,
                    letterSpacing: 0,
                    color: WHITE_WARM,
                  }}
                >
                  ¡Primera clase completada!
                </h2>

                <p
                  style={{
                    margin: "0 0 28px",
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: TEXT_SEC,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Ya tienes la base para empezar con confianza. El siguiente paso es
                  elegir tu plan en Gmusic Estudio.
                </p>

                <motion.button
                  type="button"
                  whileHover={{
                    background: "rgba(201,168,76,0.85)",
                    boxShadow: "0 8px 24px rgba(201,168,76,0.25)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigateToHomeSection(setPage, "planes")}
                  style={{
                    height: 48,
                    width: "100%",
                    maxWidth: 360,
                    borderRadius: 2,
                    background: GOLD,
                    color: "#080808",
                    fontSize: 12,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Ver planes
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {phase !== "success" && (
        <footer
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(8,8,8,0.96)",
            padding: "16px 20px 24px",
          }}
        >
          <div style={{ maxWidth: 720, margin: "0 auto" }}>
            <button
              type="button"
              disabled={!canContinue}
              onClick={handleContinue}
              style={{
                width: "100%",
                height: 48,
                borderRadius: 2,
                background: canContinue ? GOLD : "rgba(201,168,76,0.18)",
                color: canContinue ? "#080808" : "rgba(255,255,255,0.35)",
                fontSize: 12,
                fontWeight: 700,
                border: "none",
                cursor: canContinue ? "pointer" : "not-allowed",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {phase === "video" ? "Continuar al desafío" : "Continuar"}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
