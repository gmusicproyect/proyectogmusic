import { motion } from "motion/react";
import { GOLD, GOLD_BORDER, WHITE_WARM, TEXT_SEC, BORDER, fadeUp, vp } from "../tokens";

interface ComunidadSectionProps {
  setPage: (page: string) => void;
}

export function ComunidadSection({ setPage }: ComunidadSectionProps) {
  return (
    <section id="comunidad" style={{
      position: "relative", background: "#080808",
      padding: "120px 0", overflow: "hidden",
    }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(180deg, rgba(8, 8, 8, 0.2) 0%, rgba(8, 8, 8, 0.45) 100%), url('/hero/threshold/fondocomunidad.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
      <div style={{
        maxWidth: 1100, margin: "0 auto", padding: "0 80px",
        display: "grid", gridTemplateColumns: "40fr 60fr",
        gap: 80, alignItems: "center",
        position: "relative", zIndex: 2,
      }}>
        {/* Copy */}
        <motion.div initial="hidden" whileInView="show" viewport={vp}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span variants={fadeUp} transition={{ duration: 0.5 }} style={{
            display: "inline-block", fontSize: 11, fontWeight: 500,
            letterSpacing: "3px", textTransform: "uppercase",
            color: GOLD, fontFamily: "Inter, sans-serif",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}>
            Comunidad
          </motion.span>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6, delay: 0.06 }} style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(30px, 3.8vw, 46px)",
            fontWeight: 400, letterSpacing: "-1.2px",
            lineHeight: 1.2, color: WHITE_WARM, margin: "16px 0 20px",
            textShadow: "0 2px 10px rgba(0,0,0,0.95)",
          }}>
            No practicas solo.
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.12 }} style={{
            color: "rgba(245,240,232,0.95)", fontSize: 16, lineHeight: 1.75,
            fontFamily: "Inter, sans-serif", margin: 0, maxWidth: 360,
            textShadow: "0 2px 8px rgba(0,0,0,0.95)",
          }}>
            Hay alumnos que llevan meses antes que tú. Y otros que empiezan
            justo donde estás. El avance se comparte.
          </motion.p>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.18 }} style={{
            color: "rgba(245,240,232,0.7)", fontSize: 15, lineHeight: 1.7,
            fontFamily: "Inter, sans-serif", margin: "16px 0 0", maxWidth: 360,
            textShadow: "0 2px 8px rgba(0,0,0,0.95)",
          }}>
            El profesor acompaña. La comunidad motiva. El ritmo es tuyo.
          </motion.p>
          <motion.button
            variants={fadeUp} transition={{ duration: 0.45, delay: 0.26 }}
            whileHover={{ background: "rgba(201,168,76,0.06)", borderColor: "rgba(201,168,76,0.5)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setPage("community")}
            style={{
              marginTop: 36, height: 46, padding: "0 24px", borderRadius: 2,
              background: "rgba(0,0,0,0)", border: `1px solid rgba(201,168,76,0.3)`,
              color: GOLD, fontSize: 13, fontWeight: 500, cursor: "pointer",
              letterSpacing: "0.3px", fontFamily: "Inter, sans-serif",
              display: "inline-flex", alignItems: "center", gap: 8,
            }}
          >
            Ver la comunidad
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </motion.button>
        </motion.div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={vp} transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ position: "relative" }}
        >
          <div style={{
            borderRadius: 4, overflow: "hidden",
            border: `1px solid ${BORDER}`,
            boxShadow: "0 32px 64px rgba(0,0,0,0.6)",
          }}>
            <img
              src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=900&q=85"
              alt="Estudio de grabación musical"
              style={{ width: "100%", height: 420, objectFit: "cover", display: "block" }}
            />
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(to top, rgba(8,8,8,0.5) 0%, transparent 50%)",
            }} />
          </div>

          {/* Card práctica compartida */}
          <motion.div
            initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={vp} transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              position: "absolute", bottom: -20, left: -20, right: 40,
              background: "rgba(17,17,17,0.9)", backdropFilter: "blur(14px)",
              border: `1px solid ${GOLD_BORDER}`, borderRadius: 4, padding: "18px 22px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 2,
                background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.25)`,
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span style={{ fontSize: 12, color: GOLD, fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.5px" }}>Práctica compartida</span>
            </div>
            <p style={{
              color: "rgba(245,240,232,0.6)", fontSize: 13, lineHeight: 1.6,
              fontFamily: "Inter, sans-serif", margin: 0,
            }}>
              Un espacio para compartir avances, resolver dudas y mantener el ritmo de práctica.
            </p>
          </motion.div>

          {/* Badge comunidad activa */}
          <motion.div
            initial={{ opacity: 0, x: 16 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={vp} transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              position: "absolute", top: 20, right: -16,
              background: "rgba(17,17,17,0.85)", backdropFilter: "blur(12px)",
              border: `1px solid rgba(255,255,255,0.07)`,
              borderRadius: 4, padding: "10px 16px",
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span style={{ fontSize: 12, color: WHITE_WARM, fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
              Comunidad activa
            </span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
