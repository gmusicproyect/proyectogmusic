import { motion } from "motion/react";
import { navigateToHomeSection } from "../utils/public-home-navigation";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";

interface FundamentoPreviewPageProps {
  setPage: (page: string) => void;
}

const LEARNING_POINTS = [
  "Postura cómoda y relajada para practicar sin tensión.",
  "Partes principales de la guitarra y cómo sostenerla.",
  "El hábito de practicar pocos minutos, todos los días.",
];

export function FundamentoPreviewPage({ setPage }: FundamentoPreviewPageProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        padding: "120px 24px 96px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
            Nivel 1 · Academia
          </span>

          <h1
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 400,
              letterSpacing: 0,
              lineHeight: 1.15,
              color: WHITE_WARM,
              margin: "0 0 16px",
            }}
          >
            Fundamento
          </h1>

          <p
            style={{
              color: TEXT_SEC,
              fontSize: 16,
              lineHeight: 1.7,
              fontFamily: "Inter, sans-serif",
              margin: "0 0 32px",
            }}
          >
            Tu punto de partida en Gmusic: aprende desde cero con una primera clase
            gratuita, sin registro ni tarjeta.
          </p>

          <section style={{ marginBottom: 32 }}>
            <h2
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: GOLD,
                fontFamily: "Inter, sans-serif",
                margin: "0 0 12px",
              }}
            >
              Qué aprenderás
            </h2>
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {LEARNING_POINTS.map((point) => (
                <li
                  key={point}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "rgba(255,255,255,0.72)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  <span style={{ color: GOLD, flexShrink: 0 }}>·</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section
            style={{
              padding: "20px 22px",
              borderRadius: 4,
              border: "1px solid rgba(201,168,76,0.22)",
              background: "rgba(255,255,255,0.02)",
              marginBottom: 32,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.75)",
                fontFamily: "Inter, sans-serif",
                marginBottom: 8,
              }}
            >
              Primera clase gratuita
            </div>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 24,
                fontWeight: 400,
                letterSpacing: 0,
                color: WHITE_WARM,
                margin: "0 0 8px",
              }}
            >
              Tu guitarra y postura
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.6,
                color: TEXT_SEC,
                fontFamily: "Inter, sans-serif",
              }}
            >
              Conoce las partes de la guitarra y encuentra una postura cómoda para
              empezar a practicar.
            </p>
          </section>

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
              onClick={() => setPage("fundamento-free-lesson")}
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
              Comenzar clase gratuita
            </motion.button>

            <button
              type="button"
              onClick={() => navigateToHomeSection(setPage, "academia")}
              style={{
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
              }}
            >
              Volver a Academia
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
