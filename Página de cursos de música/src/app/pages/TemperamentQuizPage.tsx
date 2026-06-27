import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  TEMPERAMENT_QUIZ_QUESTIONS,
  buildQuizResult,
  type QuestionEvent,
  type QuizOptionId,
} from "../data/temperament-quiz";
import { analytics } from "../utils/analytics";
import {
  getOrCreateOnboardingSessionId,
  markTemperamentQuizSkipped,
  saveTemperamentQuizResult,
  shouldShowTemperamentQuiz,
} from "../utils/temperament-quiz-storage";
import { navigateToHomeSection } from "../utils/public-home-navigation";

const GOLD = "#C9A84C";
const BG = "#080808";
const TEXT = "#F5F0E8";

interface TemperamentQuizPageProps {
  setPage: (page: string) => void;
  instrumentSlug?: string | null;
  isSubscribedStudent?: boolean;
}

export function TemperamentQuizPage({
  setPage,
  instrumentSlug = "guitarra",
  isSubscribedStudent = false,
}: TemperamentQuizPageProps) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<QuizOptionId | null>(null);
  const [answerChanges, setAnswerChanges] = useState(0);
  const [events, setEvents] = useState<QuestionEvent[]>([]);
  const quizStartedAt = useRef(Date.now());
  const questionStartedAt = useRef(Date.now());

  const question = TEMPERAMENT_QUIZ_QUESTIONS[questionIndex];
  const isLastQuestion = questionIndex === TEMPERAMENT_QUIZ_QUESTIONS.length - 1;

  useEffect(() => {
    questionStartedAt.current = Date.now();
    setSelectedOption(null);
    setAnswerChanges(0);
  }, [questionIndex]);

  useEffect(() => {
    if (isSubscribedStudent) {
      setPage("mi-estudio");
      return;
    }
    if (!shouldShowTemperamentQuiz({ isSubscribedStudent })) {
      navigateToHomeSection(setPage, "academia");
    }
  }, [setPage, isSubscribedStudent]);

  const progressLabel = useMemo(
    () => `Pregunta ${questionIndex + 1} de ${TEMPERAMENT_QUIZ_QUESTIONS.length}`,
    [questionIndex]
  );

  const goToAcademia = useCallback(() => {
    navigateToHomeSection(setPage, "academia");
  }, [setPage]);

  const handleSkip = useCallback(() => {
    markTemperamentQuizSkipped();
    analytics.temperamentQuizSkipped();
    goToAcademia();
  }, [goToAcademia]);

  const handleSelect = (optionId: QuizOptionId) => {
    if (selectedOption && selectedOption !== optionId) {
      setAnswerChanges((count) => count + 1);
    }
    setSelectedOption(optionId);
  };

  const handleConfirm = () => {
    if (!selectedOption) return;

    const option = question.options.find((item) => item.id === selectedOption);
    if (!option) return;

    const nextEvent: QuestionEvent = {
      question_id: question.id,
      selected_option: selectedOption,
      temperament_tag: option.temperament,
      time_ms: Date.now() - questionStartedAt.current,
      answer_changes: answerChanges,
    };

    const nextEvents = [...events, nextEvent];

    if (!isLastQuestion) {
      setEvents(nextEvents);
      setQuestionIndex((index) => index + 1);
      return;
    }

    const result = buildQuizResult({
      sessionId: getOrCreateOnboardingSessionId(),
      events: nextEvents,
      totalDurationMs: Date.now() - quizStartedAt.current,
      instrumentSlug,
    });

    void saveTemperamentQuizResult(result, {
      referrerPath: window.location.pathname,
    }).then(({ persistedToDatabase }) => {
      analytics.temperamentQuizCompleted(result);
      if (!persistedToDatabase) {
        analytics.temperamentQuizSyncFailed(result.session_id);
      }
    });

    goToAcademia();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: BG,
        color: TEXT,
        fontFamily: "Inter, sans-serif",
        display: "flex",
        justifyContent: "center",
        padding: "48px 20px 64px",
      }}
    >
      <div style={{ width: "min(640px, 100%)" }}>
        <button
          type="button"
          onClick={() => setPage("home")}
          style={{
            background: "transparent",
            border: "none",
            color: "rgba(245,240,232,0.55)",
            fontSize: 13,
            cursor: "pointer",
            marginBottom: 24,
            padding: 0,
          }}
        >
          ← Volver
        </button>

        <p
          style={{
            margin: "0 0 8px",
            fontSize: 12,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: GOLD,
          }}
        >
          {progressLabel}
        </p>
        <h1
          style={{
            margin: "0 0 8px",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 5vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.15,
          }}
        >
          Conócete en 1 minuto
        </h1>
        <p style={{ margin: "0 0 28px", color: "rgba(245,240,232,0.72)", lineHeight: 1.6 }}>
          6 preguntas rápidas para acompañarte mejor en tu camino
        </p>

        <div
          style={{
            height: 4,
            borderRadius: 999,
            background: "rgba(255,255,255,0.08)",
            marginBottom: 28,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${((questionIndex + 1) / TEMPERAMENT_QUIZ_QUESTIONS.length) * 100}%`,
              background: GOLD,
              transition: "width 0.25s ease",
            }}
          />
        </div>

        <p
          style={{
            margin: "0 0 20px",
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "rgba(245,240,232,0.45)",
          }}
        >
          Situación
        </p>
        <p style={{ margin: "0 0 24px", fontSize: 18, lineHeight: 1.5 }}>{question.situation}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {question.options.map((option) => {
            const active = selectedOption === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                aria-pressed={active}
                style={{
                  textAlign: "left",
                  padding: "16px 18px",
                  borderRadius: 4,
                  border: `1px solid ${active ? "rgba(201,168,76,0.55)" : "rgba(255,255,255,0.1)"}`,
                  background: active ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.03)",
                  color: TEXT,
                  cursor: "pointer",
                  fontSize: 15,
                  lineHeight: 1.5,
                  transition: "border-color 0.2s, background 0.2s",
                }}
              >
                {option.text}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedOption}
          style={{
            width: "100%",
            height: 48,
            border: "none",
            borderRadius: 4,
            background: selectedOption ? GOLD : "rgba(255,255,255,0.08)",
            color: selectedOption ? BG : "rgba(245,240,232,0.35)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            fontSize: 12,
            cursor: selectedOption ? "pointer" : "not-allowed",
          }}
        >
          {isLastQuestion ? "Elegir mi camino" : "Siguiente"}
        </button>

        <button
          type="button"
          onClick={handleSkip}
          style={{
            marginTop: 16,
            width: "100%",
            background: "transparent",
            border: "none",
            color: "rgba(245,240,232,0.45)",
            fontSize: 13,
            cursor: "pointer",
            textDecoration: "underline",
            textUnderlineOffset: 3,
          }}
        >
          Saltar por ahora
        </button>
      </div>
    </div>
  );
}
