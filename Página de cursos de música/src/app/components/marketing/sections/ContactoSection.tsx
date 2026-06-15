import { useState } from "react";
import { motion } from "motion/react";
import { GOLD, GOLD_SOFT, WHITE_WARM, TEXT_SEC, fadeUp, vp } from "../tokens";

interface ContactoSectionProps {
  setPage: (page: string) => void;
}

export function ContactoSection({ setPage: _setPage }: ContactoSectionProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setEmail("");
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <section id="contacto" style={{ position: "relative", background: "#080808", padding: "120px 0", overflow: "hidden" }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(180deg, rgba(8, 8, 8, 0.15) 0%, rgba(8, 8, 8, 0.45) 100%), url('/hero/threshold/fondocontacto.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
      <div style={{
        maxWidth: 560, margin: "0 auto", padding: "0 40px",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
        position: "relative", zIndex: 2,
      }}>
        <motion.div
          initial="hidden" whileInView="show" viewport={vp}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          style={{ width: "100%" }}
        >
          <motion.span variants={fadeUp} transition={{ duration: 0.5 }} style={{
            display: "inline-block", fontSize: 11, fontWeight: 500,
            letterSpacing: "3px", textTransform: "uppercase",
            color: GOLD, fontFamily: "Inter, sans-serif",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}>
            Contacto
          </motion.span>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6, delay: 0.06 }} style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 400, letterSpacing: "-1.2px",
            lineHeight: 1.15, color: WHITE_WARM, margin: "16px 0 16px",
            textShadow: "0 2px 10px rgba(0,0,0,0.95)",
          }}>
            ¿Tienes preguntas?
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.12 }} style={{
            color: "rgba(245,240,232,0.95)", fontSize: 16, lineHeight: 1.7,
            fontFamily: "Inter, sans-serif", margin: "0 0 40px",
            textShadow: "0 2px 8px rgba(0,0,0,0.95)",
          }}>
            Escríbenos antes de empezar.<br />Respondemos cada mensaje.
          </motion.p>

          <motion.form
            variants={fadeUp} transition={{ duration: 0.5, delay: 0.18 }}
            onSubmit={handleSend}
            style={{ width: "100%", display: "flex", gap: 8 }}
          >
            <input
              type="email" required
              value={email} onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="Tu correo electrónico"
              style={{
                flex: 1, height: 48, padding: "0 18px",
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${focused ? "rgba(201,168,76,0.45)" : "rgba(255,255,255,0.1)"}`,
                borderRadius: 2, color: WHITE_WARM,
                fontSize: 14, fontFamily: "Inter, sans-serif",
                outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
              }}
            />
            <motion.button
              type="submit"
              whileHover={{ background: GOLD_SOFT }}
              whileTap={{ scale: 0.97 }}
              style={{
                height: 48, padding: "0 24px", borderRadius: 2,
                background: sent ? "rgba(76,175,80,0.85)" : GOLD,
                color: sent ? "#fff" : "#080808",
                fontSize: 13, fontWeight: 700, border: "none",
                cursor: "pointer", letterSpacing: "0.5px",
                fontFamily: "Inter, sans-serif", transition: "background 0.3s",
                whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6,
              }}
            >
              {sent ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  Enviado
                </>
              ) : "Enviar →"}
            </motion.button>
          </motion.form>

          <motion.div variants={fadeUp} transition={{ duration: 0.4, delay: 0.26 }} style={{ marginTop: 20 }}>
            <a
              href="mailto:hola@gmusicestudio.com"
              style={{
                color: "rgba(201,168,76,0.55)", fontSize: 13,
                fontFamily: "Inter, sans-serif", textDecoration: "none", letterSpacing: "0.3px",
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = GOLD}
              onMouseLeave={(e) => e.currentTarget.style.color = "rgba(201,168,76,0.55)"}
            >
              hola@gmusicestudio.com
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
