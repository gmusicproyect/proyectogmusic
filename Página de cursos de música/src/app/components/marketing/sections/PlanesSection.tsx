import { motion } from "motion/react";
import { SEMESTRAL_PLAN_NAME } from "../../../utils/public-subscription-flow";
import { GOLD, WHITE_WARM, TEXT_SEC, BG_SURFACE, BORDER, fadeUp, vp } from "../tokens";

interface PlanesSectionProps {
  onSelectSemestralPlan: () => void;
}

export function PlanesSection({ onSelectSemestralPlan }: PlanesSectionProps) {
  const planes = [
    { nombre: "Mensual", tag: null, selectable: false },
    { nombre: SEMESTRAL_PLAN_NAME, tag: "El más elegido", selectable: true },
    { nombre: "Anual", tag: null, selectable: false },
  ];

  return (
    <section id="planes" style={{
      background: "#0D0D0D", padding: "120px 0", overflow: "hidden", position: "relative",
    }}>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(180deg, rgba(13, 13, 13, 0.2) 0%, rgba(13, 13, 13, 0.5) 100%), url('/hero/threshold/fondoplanes.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 1,
          pointerEvents: "none",
        }}
      />
      <div style={{
        position: "absolute", width: 600, height: 500,
        background: "radial-gradient(ellipse, rgba(201,168,76,0.04) 0%, transparent 70%)",
        filter: "blur(80px)", pointerEvents: "none",
        top: "50%", left: "50%", transform: "translate(-50%, -50%)",
      }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 clamp(20px, 5vw, 80px)", position: "relative", zIndex: 2 }}>
        <motion.div
          initial="hidden" whileInView="show" viewport={vp}
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          style={{ textAlign: "center", marginBottom: 64 }}
        >
          <motion.span variants={fadeUp} transition={{ duration: 0.5 }} style={{
            display: "inline-block", fontSize: 11, fontWeight: 500,
            letterSpacing: "3px", textTransform: "uppercase",
            color: GOLD, fontFamily: "Inter, sans-serif",
            textShadow: "0 1px 4px rgba(0,0,0,0.9)",
          }}>
            Planes
          </motion.span>
          <motion.h2 variants={fadeUp} transition={{ duration: 0.6, delay: 0.06 }} style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(30px, 4vw, 48px)",
            fontWeight: 400, letterSpacing: "-1.2px",
            lineHeight: 1.2, color: WHITE_WARM, margin: "16px auto 0",
            textShadow: "0 2px 10px rgba(0,0,0,0.95)",
          }}          >
            Elige el plan que más te acomode.
          </motion.h2>
          <motion.p variants={fadeUp} transition={{ duration: 0.5, delay: 0.12 }} style={{
            color: "rgba(245,240,232,0.95)", fontSize: 16, lineHeight: 1.7,
            fontFamily: "Inter, sans-serif", maxWidth: 480, margin: "20px auto 0",
            textShadow: "0 2px 8px rgba(0,0,0,0.95)",
          }}>
            No pagarás aquí todavía — te contactamos por WhatsApp para confirmar tu
            inscripción y resolver cualquier duda antes de comenzar.
          </motion.p>
        </motion.div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 16, maxWidth: 900, margin: "0 auto",
        }}>
          {planes.map((plan, i) => {
            const isCenter = i === 1;
            const CardWrapper = plan.selectable ? motion.button : motion.div;

            return (
              <CardWrapper
                key={plan.nombre}
                type={plan.selectable ? "button" : undefined}
                onClick={plan.selectable ? onSelectSemestralPlan : undefined}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={vp} transition={{ duration: 0.55, delay: 0.1 + i * 0.1 }}
                whileHover={plan.selectable ? { borderColor: "rgba(201,168,76,0.5)" } : undefined}
                whileTap={plan.selectable ? { scale: 0.98 } : undefined}
                style={{
                  background: isCenter ? "rgba(201,168,76,0.04)" : BG_SURFACE,
                  border: `1px solid ${isCenter ? "rgba(201,168,76,0.28)" : BORDER}`,
                  borderRadius: 4, padding: "36px 28px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 16, textAlign: "center",
                  ...(isCenter ? { marginTop: -12, marginBottom: -12 } : {}),
                  ...(plan.selectable
                    ? {
                        cursor: "pointer",
                        width: "100%",
                        color: "inherit",
                        font: "inherit",
                      }
                    : {}),
                }}
              >
                {plan.tag && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: "2px",
                    textTransform: "uppercase", color: GOLD, fontFamily: "Inter, sans-serif",
                  }}>{plan.tag}</span>
                )}
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22, fontWeight: 400,
                  color: WHITE_WARM, letterSpacing: "-0.5px",
                }}>{plan.nombre}</div>
                <div style={{
                  fontSize: 11, color: plan.selectable ? GOLD : "rgba(201,168,76,0.5)",
                  fontFamily: "Inter, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase",
                }}>
                  {plan.selectable ? "Inscribirme" : "Próximamente"}
                </div>
                <div style={{ width: 32, height: 1, background: "rgba(201,168,76,0.2)" }} />
              </CardWrapper>
            );
          })}
        </div>

      </div>
    </section>
  );
}
