import { motion } from "motion/react";
import { GOLD, BORDER, vp } from "../tokens";

/** Imagen representativa — guitarra en estudio (distinta del fondo de sección). */
const ACADEMIA_FEATURE_IMAGE =
  "https://images.unsplash.com/photo-1750131418942-1638bdc87b06?w=900&q=85";

const PATH_STEPS = [
  { label: "Fundamento", detail: "Primeras notas y bases" },
  { label: "Técnica", detail: "Precisión y fluidez" },
  { label: "Crea", detail: "Tu propia música" },
] as const;

export function AcademiaPublicVisual() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={vp}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{ position: "relative" }}
    >
      <div
        style={{
          borderRadius: 4,
          overflow: "hidden",
          border: `1px solid ${BORDER}`,
          boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
          minHeight: 360,
          position: "relative",
          background: "#0a0a0a",
        }}
      >
        <img
          src={ACADEMIA_FEATURE_IMAGE}
          alt="Práctica de guitarra en estudio musical"
          loading="lazy"
          style={{
            display: "block",
            width: "100%",
            height: "100%",
            minHeight: 360,
            objectFit: "cover",
            objectPosition: "center 35%",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(8,8,8,0.05) 0%, rgba(8,8,8,0.55) 55%, rgba(8,8,8,0.92) 100%)",
          }}
        />
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 70% 20%, rgba(201,168,76,0.14) 0%, transparent 55%)",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "clamp(16px, 4vw, 24px)",
            right: "clamp(16px, 4vw, 24px)",
            bottom: "clamp(16px, 4vw, 24px)",
            padding: "18px 20px",
            borderRadius: 4,
            border: "1px solid rgba(201,168,76,0.22)",
            background: "rgba(8,8,8,0.82)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <p
            style={{
              margin: "0 0 14px",
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Tu ruta de aprendizaje
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {PATH_STEPS.map((step, index) => (
              <div
                key={step.label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: 12,
                  alignItems: "start",
                }}
              >
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    border: `1px solid ${index === 0 ? GOLD : "rgba(201,168,76,0.35)"}`,
                    background: index === 0 ? "rgba(201,168,76,0.18)" : "rgba(255,255,255,0.04)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: index === 0 ? GOLD : "rgba(245,240,232,0.45)",
                    fontFamily: "Inter, sans-serif",
                    flexShrink: 0,
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      fontWeight: 600,
                      color: "rgba(245,240,232,0.95)",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.2,
                    }}
                  >
                    {step.label}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: 12,
                      color: "rgba(245,240,232,0.55)",
                      fontFamily: "Inter, sans-serif",
                      lineHeight: 1.4,
                    }}
                  >
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
