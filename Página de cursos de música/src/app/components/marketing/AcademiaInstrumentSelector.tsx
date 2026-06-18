import { motion } from "motion/react";
import {
  ACADEMIA_INSTRUMENTS,
  type AcademiaInstrumentId,
} from "../../data/academia-instruments";
import { GOLD, GOLD_BORDER, WHITE_WARM, fadeUp, vp } from "./tokens";

interface AcademiaInstrumentSelectorProps {
  onSelect: (instrumentId: AcademiaInstrumentId) => void;
}

export function AcademiaInstrumentSelector({ onSelect }: AcademiaInstrumentSelectorProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={vp}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
        gap: 16,
        marginTop: 56,
      }}
    >
      {ACADEMIA_INSTRUMENTS.map((instrument) => {
        const isAvailable = instrument.available;
        const CardTag = isAvailable ? motion.button : motion.div;

        return (
          <CardTag
            key={instrument.id}
            type={isAvailable ? "button" : undefined}
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            onClick={isAvailable ? () => onSelect(instrument.id) : undefined}
            whileHover={
              isAvailable
                ? { borderColor: "rgba(201,168,76,0.55)", y: -4 }
                : undefined
            }
            whileTap={isAvailable ? { scale: 0.98 } : undefined}
            aria-disabled={!isAvailable}
            style={{
              position: "relative",
              minHeight: 320,
              borderRadius: 4,
              overflow: "hidden",
              border: `1px solid ${isAvailable ? GOLD_BORDER : "rgba(255,255,255,0.08)"}`,
              background: "#111",
              cursor: isAvailable ? "pointer" : "default",
              opacity: isAvailable ? 1 : 0.72,
              padding: 0,
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
            }}
          >
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: `linear-gradient(180deg, rgba(8,8,8,0.15) 0%, rgba(8,8,8,0.92) 100%), url('${instrument.bgImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: isAvailable ? "none" : "grayscale(0.35) brightness(0.65)",
              }}
            />
            <div style={{ position: "relative", zIndex: 1, padding: "20px 18px 22px" }}>
              <span
                style={{
                  display: "inline-block",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  padding: "5px 10px",
                  borderRadius: 2,
                  marginBottom: 14,
                  color: isAvailable ? "#080808" : "rgba(245,240,232,0.55)",
                  background: isAvailable ? GOLD : "rgba(255,255,255,0.08)",
                  border: isAvailable ? "none" : "1px solid rgba(255,255,255,0.12)",
                }}
              >
                {isAvailable ? "Disponible" : "Próximamente"}
              </span>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(22px, 2.2vw, 28px)",
                  fontWeight: 400,
                  color: WHITE_WARM,
                  margin: 0,
                  lineHeight: 1.15,
                  textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                }}
              >
                {instrument.name}
              </h3>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 12,
                  lineHeight: 1.5,
                  color: "rgba(245,240,232,0.65)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {instrument.variants}
              </p>
            </div>
          </CardTag>
        );
      })}
    </motion.div>
  );
}
