import { motion } from "motion/react";
import { PUBLIC_FREE_LESSON_PAGE } from "../../../utils/academia-track-matrix";
import { GOLD, GOLD_SOFT, GOLD_BORDER, WHITE_WARM, TEXT_SEC, BORDER, fadeUp } from "../tokens";

interface HeroSectionProps {
  setPage: (page: string) => void;
  scrollTo: (id: string) => void;
}

export function HeroSection({ setPage, scrollTo }: HeroSectionProps) {
  return (
    <section id="hero" style={{
      position: "relative", minHeight: "100vh",
      display: "flex", alignItems: "center", overflow: "hidden",
    }}>
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 70% 80% at 72% 50%, rgba(201,168,76,0.05) 0%, transparent 65%)",
      }} />

      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "120px 80px 100px",
        width: "100%", display: "grid", gridTemplateColumns: "55fr 45fr",
        gap: 80, alignItems: "center", boxSizing: "border-box",
      }}>
        {/* Columna izquierda */}
        <motion.div initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
          <motion.div variants={fadeUp} transition={{ duration: 0.55 }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              fontSize: 11, fontWeight: 500, letterSpacing: "3px",
              textTransform: "uppercase", color: GOLD, fontFamily: "Inter, sans-serif",
            }}>
              <span style={{ width: 24, height: 1, background: GOLD, display: "inline-block", opacity: 0.6 }} />
              Academia de música · Primer curso: Guitarra
            </span>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.65, delay: 0.05 }} style={{ marginTop: 24 }}>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(44px, 5.5vw, 72px)",
              fontWeight: 400, lineHeight: 1.1,
              color: WHITE_WARM, margin: 0, letterSpacing: "-1.5px",
            }}>
              Aprende música<br />con constancia.
            </h1>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 4vw, 54px)",
              fontWeight: 300, lineHeight: 1.2,
              color: "rgba(245,240,232,0.5)", margin: 0,
              letterSpacing: "-1px", marginTop: 8,
            }}>
              Empieza con guitarra.<br />Avanza a tu propio ritmo.
            </h1>
          </motion.div>

          <motion.p variants={fadeUp} transition={{ duration: 0.55, delay: 0.15 }} style={{
            fontFamily: "Inter, sans-serif", fontSize: 17, fontWeight: 400,
            lineHeight: 1.75, color: TEXT_SEC, maxWidth: 460, margin: "28px 0 0",
          }}>
            Gmusic es una academia de música online. El primer programa
            disponible es guitarra — diseñado para que practiques con hábito
            y avances de verdad.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.5, delay: 0.22 }} style={{
            display: "flex", gap: 14, alignItems: "center", marginTop: 44,
          }}>
            <motion.button
              whileHover={{ background: GOLD_SOFT, boxShadow: "0 8px 32px rgba(201,168,76,0.35)" }}
              whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
              onClick={() => setPage(PUBLIC_FREE_LESSON_PAGE)}
              style={{
                height: 50, padding: "0 32px", borderRadius: 2,
                background: GOLD, color: "#080808", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer", letterSpacing: "1px",
                textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 20px rgba(201,168,76,0.22)",
              }}
            >
              Ver clase gratuita
            </motion.button>
            <motion.button
              whileHover={{ background: "rgba(201,168,76,0.06)", borderColor: "rgba(201,168,76,0.5)" }}
              whileTap={{ scale: 0.97 }} transition={{ duration: 0.15 }}
              onClick={() => scrollTo("academia")}
              style={{
                height: 50, padding: "0 28px", borderRadius: 2,
                background: "rgba(0,0,0,0)", border: "1px solid rgba(201,168,76,0.3)",
                color: GOLD, fontSize: 13, fontWeight: 500, cursor: "pointer",
                letterSpacing: "0.5px", fontFamily: "Inter, sans-serif",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              Conocer academia
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </motion.button>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.45, delay: 0.3 }} style={{
            display: "flex", gap: 6, alignItems: "center", marginTop: 20,
          }}>
            {["Sin tarjeta de crédito", "7 min al día", "Método completo"].map((item, i) => (
              <span key={item} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {i > 0 && <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.15)", display: "inline-block" }} />}
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", fontFamily: "Inter, sans-serif" }}>{item}</span>
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Columna derecha */}
        <motion.div
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
          style={{ position: "relative" }}
        >
          <div style={{
            position: "absolute", left: -20, top: "50%", transform: "translateY(-50%)",
            width: 1, height: 120,
            background: `linear-gradient(to bottom, transparent, ${GOLD}, transparent)`,
            opacity: 0.4,
          }} />
          <div style={{
            position: "relative", borderRadius: 4, overflow: "hidden",
            boxShadow: "0 40px 80px rgba(0,0,0,0.7)", border: `1px solid ${BORDER}`,
          }}>
            <img
              src="https://images.unsplash.com/photo-1579797990179-4ca11c8b47fd?w=900&q=85"
              alt="Guitarrista tocando guitarra en estudio"
              style={{ width: "100%", height: 560, objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to left, transparent 40%, rgba(8,8,8,0.55) 100%)" }} />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(8,8,8,0.6) 0%, transparent 40%)" }} />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            style={{
              position: "absolute", bottom: 32, left: -24, zIndex: 10,
              background: "rgba(17,17,17,0.85)", backdropFilter: "blur(16px)",
              border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "14px 18px",
              display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 12px 32px rgba(0,0,0,0.5)", minWidth: 200,
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 2,
              background: "rgba(201,168,76,0.12)", border: `1px solid rgba(201,168,76,0.25)`,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill={GOLD}><path d="M5 3l14 9-14 9V3z" /></svg>
            </div>
            <div>
              <div style={{ color: WHITE_WARM, fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif" }}>Clase de muestra</div>
              <div style={{ color: TEXT_SEC, fontSize: 11, fontFamily: "Inter, sans-serif", marginTop: 2 }}>Primeros acordes · 7 min</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
