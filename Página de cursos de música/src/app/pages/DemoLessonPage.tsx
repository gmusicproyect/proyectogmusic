import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, FileText, X } from "lucide-react";
import { VideoPlayerLesson } from "../components/dashboard/VideoPlayerLesson";
import { MultipleChoiceExercise } from "../components/gmusic/lesson/MultipleChoiceExercise";
import { Ex1Cuerdas } from "../components/dashboard/exercises/Ex1Cuerdas";
import { ExPulsoAire } from "../components/dashboard/exercises/ExPulsoAire";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { useSignedMaterialUrl } from "../hooks/useSignedMaterialUrl";
import { DEMO_LESSONS } from "../data/demo-lessons";
import { playFreeFundamentoSuccessFeedback } from "../utils/free-fundamento-lesson";
import { analytics } from "../utils/analytics";
import { isPrivateSupabaseStorageMaterialUrl } from "../utils/supabase-storage";
import { toYoutubeNocookieEmbedUrl } from "../utils/youtube-embed";
import type { ParsedExerciseView } from "../components/gmusic/lesson/lesson-runner-types";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";
import { CLASE_GRATUITA_MAP_PAGE, claseGratuitaLessonPage } from "../utils/clase-gratuita-routing";

const DEMO_BORDER = "rgba(255,255,255,0.08)";

type DemoPhase = "video" | "exercise" | "success";

const STATION_ORDER: DemoPhase[] = ["video", "exercise", "success"];
const STATION_LABELS: Record<DemoPhase, string> = {
  video: "Video",
  exercise: "Ejercicio",
  success: "Éxito",
};

function DemoStepper({ phase }: { phase: DemoPhase }) {
  const activeIndex = STATION_ORDER.indexOf(phase);

  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={activeIndex + 1}
      aria-label={`Etapa ${activeIndex + 1} de 3`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        width: "100%",
      }}
    >
      {STATION_ORDER.map((station, index) => {
        const isActive = index === activeIndex;
        const isComplete = index < activeIndex;
        return (
          <div key={station} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "5px 11px",
                borderRadius: 999,
                border: `1px solid ${
                  isActive
                    ? "rgba(201,168,76,0.4)"
                    : isComplete
                    ? "rgba(201,168,76,0.2)"
                    : "rgba(255,255,255,0.07)"
                }`,
                background: isActive ? "rgba(201,168,76,0.1)" : "transparent",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: "Inter, sans-serif",
                  color: isActive || isComplete ? "#080808" : "rgba(255,255,255,0.35)",
                  background: isActive || isComplete ? GOLD : "rgba(255,255,255,0.07)",
                  flexShrink: 0,
                }}
              >
                {isComplete ? "✓" : index + 1}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase" as const,
                  fontFamily: "Inter, sans-serif",
                  color: isActive
                    ? WHITE_WARM
                    : isComplete
                    ? "rgba(201,168,76,0.7)"
                    : "rgba(255,255,255,0.3)",
                }}
              >
                {STATION_LABELS[station]}
              </span>
            </div>
            {index < STATION_ORDER.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  width: 24,
                  height: 1,
                  background:
                    index < activeIndex
                      ? "rgba(201,168,76,0.4)"
                      : "rgba(255,255,255,0.07)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

interface DemoLessonPageProps {
  lessonId: number;
  setPage: (page: string) => void;
}

export function DemoLessonPage({ lessonId, setPage }: DemoLessonPageProps) {
  const lesson = DEMO_LESSONS[lessonId - 1];
  const { markComplete } = useDemoProgress();

  const [phase, setPhase] = useState<DemoPhase>("video");
  const [videoComplete, setVideoComplete] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [mcqResolved, setMcqResolved] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const mcqExercise = useMemo((): ParsedExerciseView | null => {
    if (!lesson || lesson.exercise.kind !== "mcq") return null;
    const ex = lesson.exercise;
    return {
      id: `demo-mcq-l${lessonId}`,
      type: "IDENTIFY_NOTE",
      difficulty: 1,
      instruction: ex.question,
      options: ex.options.map((o) => ({ id: o.id, text: o.text })),
      media: {},
      interaction: { mode: "mcq" },
      answerInput: "options",
      fretboardRole: "none",
    };
  }, [lesson, lessonId]);

  const signedPdf = useSignedMaterialUrl(
    isPrivateSupabaseStorageMaterialUrl(lesson?.guidePdfUrl) ? lesson?.guidePdfUrl : null
  );
  const publicPdfUrl = isPrivateSupabaseStorageMaterialUrl(lesson?.guidePdfUrl)
    ? null
    : lesson?.guidePdfUrl ?? null;
  const resolvedPdfUrl = signedPdf.resolvedUrl ?? publicPdfUrl;
  const demoEmbedUrl = useMemo(
    () => toYoutubeNocookieEmbedUrl(lesson?.videoUrl ?? "") ?? lesson?.videoUrl ?? "",
    [lesson?.videoUrl]
  );

  useEffect(() => {
    if (!lesson) setPage(CLASE_GRATUITA_MAP_PAGE);
  }, [lesson, setPage]);

  if (!lesson) return null;

  const isMcq = lesson.exercise.kind === "mcq";

  const handleMcqSelect = (optionId: string) => {
    if (mcqResolved || lesson.exercise.kind !== "mcq") return;
    setSelectedOptionId(optionId);
    if (optionId === lesson.exercise.correctId) {
      setMcqResolved(true);
      setFeedbackMsg("¡Exacto! " + lesson.completionMessage);
      playFreeFundamentoSuccessFeedback();
    } else {
      setFeedbackMsg("Casi. Piénsalo un momento e inténtalo de nuevo.");
    }
  };

  const handleStandaloneComplete = () => {
    markComplete(lessonId);
    analytics.demoLessonCompleted(lessonId, lesson.title);
    setPhase("success");
  };

  const handleContinue = () => {
    if (phase === "video" && videoComplete) {
      setPhase("exercise");
      return;
    }
    if (phase === "exercise" && isMcq && mcqResolved) {
      markComplete(lessonId);
      analytics.demoLessonCompleted(lessonId, lesson.title);
      setPhase("success");
    }
  };

  const handleSuccessContinue = () => {
    if (lessonId >= 5) {
      analytics.demoCompleted();
      setPage("inscripcion-gate");
    } else {
      setPage(CLASE_GRATUITA_MAP_PAGE);
    }
  };

  const canContinue =
    (phase === "video" && videoComplete) ||
    (phase === "exercise" && isMcq && mcqResolved);

  const showFooter = phase === "exercise" && isMcq;

  return (
    <div
      style={{
        minHeight: "100vh",
        height: "100vh",
        width: "100%",
        background: "#080808",
        color: WHITE_WARM,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <header
        style={{
          flexShrink: 0,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(8,8,8,0.95)",
          backdropFilter: "blur(16px)",
          padding: "16px 20px 14px",
        }}
      >
        <div
          style={{
            maxWidth: 960,
            margin: "0 auto 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
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
                color: "rgba(201,168,76,0.6)",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Clase gratuita · {lessonId} de 5
            </p>
            <h1
              style={{
                margin: "4px 0 0",
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(20px, 3vw, 26px)",
                fontWeight: 400,
                lineHeight: 1.2,
                color: WHITE_WARM,
              }}
            >
              {lesson.title}
            </h1>
          </div>

          <button
            type="button"
            onClick={() => setPage(CLASE_GRATUITA_MAP_PAGE)}
            aria-label="Salir de la clase"
            style={{
              width: 36,
              height: 36,
              borderRadius: 4,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.6)",
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
          <DemoStepper phase={phase} />
        </div>
      </header>

      {/* Main */}
      <main
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
          overflow: "auto",
        }}
      >
        <div style={{ width: "100%", maxWidth: 960 }}>
          <AnimatePresence mode="wait">
            {phase === "video" && (
              <motion.div
                key="video"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                style={{
                  border: `1px solid ${DEMO_BORDER}`,
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "#0A0A0A",
                }}
              >
                <VideoPlayerLesson
                  title={lesson.videoTitle}
                  subtitle={lesson.videoSubtitle}
                  duration={lesson.videoDuration}
                  lessonLabel={`Clase ${lessonId} · Fundamento`}
                  videoUrl={demoEmbedUrl}
                  hideWatchButton
                  onPlaybackComplete={() => setVideoComplete(true)}
                />

                <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
                  {signedPdf.error ? (
                    <p
                      style={{
                        margin: 0,
                        padding: "12px 14px",
                        borderRadius: 4,
                        border: "1px solid rgba(248,113,113,0.25)",
                        background: "rgba(40,18,18,0.55)",
                        color: TEXT_SEC,
                        fontSize: 14,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      {signedPdf.error}
                    </p>
                  ) : null}

                  {resolvedPdfUrl && !signedPdf.loading ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 16,
                        padding: "14px 16px",
                        borderRadius: 4,
                        border: `1px solid ${DEMO_BORDER}`,
                        background: "rgba(255,255,255,0.02)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                        <FileText
                          size={18}
                          strokeWidth={1.75}
                          color={GOLD}
                          aria-hidden="true"
                          style={{ flexShrink: 0 }}
                        />
                        <span
                          style={{
                            fontSize: 13,
                            lineHeight: 1.45,
                            color: "rgba(245,240,232,0.82)",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          También tienes la guía PDF de esta clase
                        </span>
                      </div>
                      <a
                        href={resolvedPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          flexShrink: 0,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: 40,
                          padding: "0 16px",
                          borderRadius: 2,
                          border: `1px solid rgba(201,168,76,0.45)`,
                          background: "transparent",
                          color: GOLD,
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          fontFamily: "Inter, sans-serif",
                          textDecoration: "none",
                        }}
                      >
                        Ver guía PDF
                      </a>
                    </div>
                  ) : signedPdf.loading ? (
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        color: TEXT_SEC,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Preparando la guía PDF…
                    </p>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setVideoComplete(true)}
                    disabled={videoComplete}
                    style={{
                      width: "100%",
                      minHeight: 48,
                      borderRadius: 2,
                      border: `1px solid ${videoComplete ? "rgba(88,204,2,0.35)" : "rgba(255,255,255,0.14)"}`,
                      background: videoComplete ? "rgba(88,204,2,0.06)" : "transparent",
                      color: videoComplete ? "rgba(88,204,2,0.85)" : WHITE_WARM,
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      fontFamily: "Inter, sans-serif",
                      cursor: videoComplete ? "default" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <Check size={16} strokeWidth={2} aria-hidden="true" />
                    {videoComplete ? "Video marcado como visto" : "He terminado de ver este video"}
                  </button>

                  {!videoComplete ? (
                    <p
                      style={{
                        margin: 0,
                        textAlign: "center",
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.38)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Marca el video como visto para continuar
                    </p>
                  ) : null}

                  <button
                    type="button"
                    disabled={!videoComplete}
                    onClick={handleContinue}
                    style={{
                      width: "100%",
                      minHeight: 48,
                      borderRadius: 2,
                      border: "none",
                      background: GOLD,
                      color: "#080808",
                      opacity: videoComplete ? 1 : 0.4,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      fontFamily: "Inter, sans-serif",
                      cursor: videoComplete ? "pointer" : "not-allowed",
                    }}
                  >
                    Continuar al ejercicio →
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "exercise" && (
              <motion.div
                key="exercise"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                style={{
                  width: "100%",
                  maxWidth: isMcq ? 720 : 960,
                  margin: "0 auto",
                }}
              >
                {isMcq && mcqExercise && (
                  <>
                    <MultipleChoiceExercise
                      exercise={mcqExercise}
                      selectedOptionId={selectedOptionId}
                      disabled={mcqResolved}
                      onSelect={handleMcqSelect}
                    />
                    {feedbackMsg && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          margin: "18px 0 0",
                          fontSize: 14,
                          lineHeight: 1.6,
                          fontFamily: "Inter, sans-serif",
                          color: mcqResolved ? GOLD : TEXT_SEC,
                        }}
                      >
                        {feedbackMsg}
                      </motion.p>
                    )}
                  </>
                )}
                {lesson.exercise.kind === "ex1-cuerdas" && (
                  <Ex1Cuerdas onComplete={handleStandaloneComplete} />
                )}
                {lesson.exercise.kind === "ex-pulso-aire" && (
                  <ExPulsoAire
                    headline={lesson.exercise.headline}
                    description={lesson.exercise.description}
                    sequence={lesson.exercise.sequence}
                    onComplete={handleStandaloneComplete}
                  />
                )}
              </motion.div>
            )}

            {phase === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.3 }}
                style={{
                  width: "100%",
                  maxWidth: 520,
                  margin: "0 auto",
                  textAlign: "center",
                  padding: "16px 12px",
                }}
              >
                <div
                  style={{
                    width: 68,
                    height: 68,
                    margin: "0 auto 20px",
                    borderRadius: "50%",
                    border: "1px solid rgba(201,168,76,0.3)",
                    background: "rgba(201,168,76,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                    color: GOLD,
                  }}
                >
                  ✓
                </div>

                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: 10,
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(201,168,76,0.6)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {lessonId} de 5 clases completadas
                </p>

                <h2
                  style={{
                    margin: "0 0 12px",
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(24px, 4vw, 32px)",
                    fontWeight: 400,
                    color: WHITE_WARM,
                  }}
                >
                  {lessonId >= 5
                    ? "¡Completaste el Mundo 1!"
                    : `¡Clase ${lessonId} completada!`}
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
                  {lessonId >= 5
                    ? "Has completado tu primer desafío musical. El camino completo de la academia te espera."
                    : `${lesson.completionMessage} Continúa con la siguiente clase en tu mapa.`}
                </p>

                <motion.button
                  type="button"
                  whileHover={{
                    background: "rgba(201,168,76,0.82)",
                    boxShadow: "0 8px 24px rgba(201,168,76,0.22)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSuccessContinue}
                  style={{
                    height: 48,
                    width: "100%",
                    maxWidth: 340,
                    borderRadius: 2,
                    background: GOLD,
                    color: "#080808",
                    fontSize: 11,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {lessonId >= 5 ? "Elegir mi plan" : "Continuar al mapa"}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer continue button */}
      {showFooter && (
        <footer
          style={{
            flexShrink: 0,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(8,8,8,0.95)",
            padding: "14px 20px 24px",
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
                background: canContinue ? GOLD : "rgba(201,168,76,0.15)",
                color: canContinue ? "#080808" : "rgba(255,255,255,0.3)",
                fontSize: 11,
                fontWeight: 700,
                border: "none",
                cursor: canContinue ? "pointer" : "not-allowed",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Continuar
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}
