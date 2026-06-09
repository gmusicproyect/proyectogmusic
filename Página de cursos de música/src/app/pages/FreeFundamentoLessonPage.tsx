import { useId, useState, type CSSProperties } from "react";
import { motion } from "motion/react";
import { navigateToHomeSection } from "../utils/public-home-navigation";
import {
  canAdvanceFreeFundamentoLesson,
  FREE_FUNDAMENTO_GUITAR_IMAGE_ALT,
  FREE_FUNDAMENTO_GUITAR_IMAGE_URL,
  FREE_FUNDAMENTO_LESSON_OPTIONS,
  FREE_FUNDAMENTO_LESSON_QUESTION,
  nextFreeFundamentoLessonPhase,
  type FreeFundamentoLessonPhase,
} from "../utils/free-fundamento-lesson";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";

interface FreeFundamentoLessonPageProps {
  setPage: (page: string) => void;
}

const secondaryButtonStyle: CSSProperties = {
  height: 44,
  borderRadius: 2,
  background: "transparent",
  color: "rgba(255,255,255,0.55)",
  fontSize: 12,
  fontWeight: 600,
  border: "1px solid rgba(255,255,255,0.12)",
  cursor: "pointer",
  letterSpacing: "0.5px",
  fontFamily: "Inter, sans-serif",
};

export function FreeFundamentoLessonPage({ setPage }: FreeFundamentoLessonPageProps) {
  const [phase, setPhase] = useState<FreeFundamentoLessonPhase>("lesson");
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const groupName = useId();
  const questionId = useId();

  const canContinue = canAdvanceFreeFundamentoLesson(selectedOptionId);

  const handleContinue = () => {
    if (!canContinue) return;
    setPhase(nextFreeFundamentoLessonPhase(phase));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        padding: "120px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {phase === "lesson" ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <span
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "3px",
                textTransform: "uppercase",
                color: GOLD,
                fontFamily: "Inter, sans-serif",
                marginBottom: 16,
              }}
            >
              Clase gratuita · Fundamento
            </span>

            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4.5vw, 40px)",
                fontWeight: 400,
                letterSpacing: 0,
                lineHeight: 1.2,
                color: WHITE_WARM,
                margin: "0 0 24px",
              }}
            >
              Tu guitarra y postura
            </h1>

            <img
              src={FREE_FUNDAMENTO_GUITAR_IMAGE_URL}
              alt={FREE_FUNDAMENTO_GUITAR_IMAGE_ALT}
              width={720}
              height={405}
              loading="lazy"
              decoding="async"
              style={{
                width: "100%",
                maxWidth: 720,
                height: "auto",
                aspectRatio: "16 / 9",
                objectFit: "cover",
                borderRadius: 4,
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: 28,
                display: "block",
              }}
            />

            <section style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: GOLD,
                  fontFamily: "Inter, sans-serif",
                  margin: "0 0 10px",
                }}
              >
                Postura básica
              </h2>
              <p
                style={{
                  margin: "0 0 12px",
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: TEXT_SEC,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Siéntate con la espalda recta pero relajada. Apoya el cuerpo de la
                guitarra sobre tu pierna y mantén el cuello inclinado hacia arriba para
                ver las cuerdas con comodidad.
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.7,
                  color: TEXT_SEC,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                La mano que no rasguea va en el mástil; la otra, cerca del puente. No
                aprietes: la tensión frena el aprendizaje.
              </p>
            </section>

            <section style={{ marginBottom: 32 }}>
              <h2
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  color: GOLD,
                  fontFamily: "Inter, sans-serif",
                  margin: "0 0 10px",
                }}
              >
                Partes principales
              </h2>
              <ul
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {[
                  "Cuerpo (caja): donde suena y apoyas el instrumento.",
                  "Mástil: donde presionas las cuerdas para cambiar notas.",
                  "Cuerdas: se rasguean o pulsan para crear sonido.",
                ].map((item) => (
                  <li
                    key={item}
                    style={{
                      fontSize: 14,
                      lineHeight: 1.6,
                      color: "rgba(255,255,255,0.72)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <fieldset
              style={{
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 4,
                padding: "20px 18px",
                margin: "0 0 20px",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              <legend
                id={questionId}
                style={{
                  padding: "0 6px",
                  fontSize: 15,
                  fontWeight: 500,
                  color: WHITE_WARM,
                  fontFamily: "'Playfair Display', Georgia, serif",
                }}
              >
                {FREE_FUNDAMENTO_LESSON_QUESTION}
              </legend>

              <div
                role="radiogroup"
                aria-labelledby={questionId}
                style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}
              >
                {FREE_FUNDAMENTO_LESSON_OPTIONS.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  return (
                    <label
                      key={option.id}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        padding: "12px 14px",
                        borderRadius: 4,
                        border: `1px solid ${isSelected ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.08)"}`,
                        background: isSelected ? "rgba(201,168,76,0.08)" : "transparent",
                        cursor: "pointer",
                        fontSize: 14,
                        lineHeight: 1.5,
                        color: "rgba(255,255,255,0.78)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      <input
                        type="radio"
                        name={groupName}
                        value={option.id}
                        checked={isSelected}
                        onChange={() => setSelectedOptionId(option.id)}
                        style={{ marginTop: 3, accentColor: GOLD }}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxWidth: 420,
              }}
            >
              <button
                type="button"
                disabled={!canContinue}
                onClick={handleContinue}
                style={{
                  height: 48,
                  width: "100%",
                  borderRadius: 2,
                  background: canContinue ? GOLD : "rgba(201,168,76,0.25)",
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
                Continuar
              </button>

              <button
                type="button"
                onClick={() => navigateToHomeSection(setPage, "academia")}
                style={{ ...secondaryButtonStyle, width: "100%" }}
              >
                Volver a Academia
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            <h1
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4.5vw, 40px)",
                fontWeight: 400,
                letterSpacing: 0,
                lineHeight: 1.25,
                color: WHITE_WARM,
                margin: "0 0 16px",
              }}
            >
              Completaste tu primera clase gratuita
            </h1>

            <p
              style={{
                margin: "0 0 32px",
                fontSize: 15,
                lineHeight: 1.7,
                color: TEXT_SEC,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Ya conoces lo esencial para empezar. Cuando quieras seguir, explora los
              planes de Gmusic.
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                maxWidth: 420,
              }}
            >
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
                Conocer los planes
              </motion.button>

              <button
                type="button"
                onClick={() => navigateToHomeSection(setPage, "academia")}
                style={secondaryButtonStyle}
              >
                Volver a Academia
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
