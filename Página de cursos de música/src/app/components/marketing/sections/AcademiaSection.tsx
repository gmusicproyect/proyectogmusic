import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AcademiaInstrumentSelector } from "../AcademiaInstrumentSelector";
import { InteractiveLevelSelector } from "../../music/InteractiveLevelSelector";
import { GOLD, GOLD_SOFT, WHITE_WARM, fadeUp, vp } from "../tokens";
import { useDemoUserState } from "../../../hooks/useDemoUserState";
import type { PublicStudentSessionState } from "../../../hooks/usePublicStudentSession";
import type { AcademiaInstrumentId } from "../../../data/academia-instruments";

type AcademiaStep = "instrument" | "program";

interface AcademiaSectionProps {
  setPage: (page: string) => void;
  setLevel: (level: string) => void;
  session: PublicStudentSessionState;
}

const INSTRUMENT_LABELS: Record<AcademiaInstrumentId, string> = {
  guitarra: "Guitarra",
  teclado: "Teclado",
  canto: "Canto",
};

export function AcademiaSection({ setPage, setLevel, session }: AcademiaSectionProps) {
  const cta = useDemoUserState(session.status);
  const [step, setStep] = useState<AcademiaStep>("instrument");
  const [selectedInstrument, setSelectedInstrument] = useState<AcademiaInstrumentId | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToContent = () => {
    const el = contentRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.pageYOffset - 88;
    window.scrollTo({ top, behavior: "smooth" });
  };

  const handleInstrumentSelect = (instrumentId: AcademiaInstrumentId) => {
    setSelectedInstrument(instrumentId);
    setStep("program");
    requestAnimationFrame(scrollToContent);
  };

  const handleBackToInstruments = () => {
    setStep("instrument");
    setSelectedInstrument(null);
    requestAnimationFrame(scrollToContent);
  };

  const isInstrumentStep = step === "instrument";

  return (
    <section
      id="academia"
      style={{
        position: "relative",
        background: "#0D0D0D",
        padding: "120px 0",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(180deg, rgba(13, 13, 13, 0.2) 0%, rgba(13, 13, 13, 0.5) 100%), url('/hero/threshold/fondoacademia.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 800,
          height: 600,
          background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 65%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        ref={contentRef}
        style={{ maxWidth: 1100, margin: "0 auto", padding: "0 80px", position: "relative", zIndex: 2 }}
      >
        <AnimatePresence mode="wait">
          {isInstrumentStep ? (
            <motion.div
              key="instrument-step"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={vp}
                variants={{ show: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.span
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: GOLD,
                    fontFamily: "Inter, sans-serif",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  La academia
                </motion.span>
                <motion.h2
                  variants={fadeUp}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(32px, 4vw, 52px)",
                    fontWeight: 400,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.15,
                    color: WHITE_WARM,
                    margin: "16px 0 0",
                    textShadow: "0 2px 10px rgba(0,0,0,0.95)",
                  }}
                >
                  Elige tu instrumento.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  style={{
                    color: "rgba(245,240,232,0.95)",
                    fontSize: 17,
                    lineHeight: 1.7,
                    maxWidth: 520,
                    marginTop: 20,
                    fontFamily: "Inter, sans-serif",
                    textShadow: "0 2px 8px rgba(0,0,0,0.95)",
                  }}
                >
                  Cada instrumento tiene su propio camino. Empieza por el tuyo.
                </motion.p>
              </motion.div>

              <AcademiaInstrumentSelector onSelect={handleInstrumentSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="program-step"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
            >
              <button
                type="button"
                onClick={handleBackToInstruments}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 24,
                  padding: "6px 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(245,240,232,0.55)",
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  letterSpacing: "0.3px",
                }}
              >
                ← Cambiar instrumento
              </button>

              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={vp}
                variants={{ show: { transition: { staggerChildren: 0.1 } } }}
              >
                <motion.span
                  variants={fadeUp}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: "inline-block",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "3px",
                    textTransform: "uppercase",
                    color: GOLD,
                    fontFamily: "Inter, sans-serif",
                    textShadow: "0 1px 4px rgba(0,0,0,0.9)",
                  }}
                >
                  El programa
                  {selectedInstrument ? (
                    <span style={{ color: "rgba(245,240,232,0.45)", fontWeight: 400 }}>
                      {" "}
                      · {INSTRUMENT_LABELS[selectedInstrument]}
                    </span>
                  ) : null}
                </motion.span>
                <motion.h2
                  variants={fadeUp}
                  transition={{ duration: 0.6, delay: 0.05 }}
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: "clamp(32px, 4vw, 52px)",
                    fontWeight: 400,
                    letterSpacing: "-1.5px",
                    lineHeight: 1.15,
                    color: WHITE_WARM,
                    margin: "16px 0 0",
                    textShadow: "0 2px 10px rgba(0,0,0,0.95)",
                  }}
                >
                  Elige tu punto de partida.
                </motion.h2>
                <motion.p
                  variants={fadeUp}
                  transition={{ duration: 0.5, delay: 0.12 }}
                  style={{
                    color: "rgba(245,240,232,0.95)",
                    fontSize: 17,
                    lineHeight: 1.7,
                    maxWidth: 520,
                    marginTop: 20,
                    fontFamily: "Inter, sans-serif",
                    textShadow: "0 2px 8px rgba(0,0,0,0.95)",
                  }}
                >
                  Cada etapa tiene su propio recorrido. Empieza donde estás.
                </motion.p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                style={{ marginTop: 56 }}
              >
                <InteractiveLevelSelector setPage={setPage} setLevel={setLevel} />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{ marginTop: 40 }}
              >
                <motion.button
                  whileHover={{
                    background: GOLD_SOFT,
                    boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setPage(cta.destination)}
                  style={{
                    height: 50,
                    padding: "0 36px",
                    borderRadius: 2,
                    background: GOLD,
                    color: "#080808",
                    fontSize: 13,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 4px 20px rgba(201,168,76,0.22)",
                  }}
                >
                  {cta.label}
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
