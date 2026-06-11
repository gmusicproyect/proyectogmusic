import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { getPlanById } from "../data/subscription-plans";
import type { PlanId } from "../data/subscription-plans";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";

// Formato wa.me: código país + número, sin "+" ni espacios (ej. "56912345678")
const WHATSAPP_NUMBER = "56953429676";

const SELECTED_PLAN_KEY = "gmusic:selected_plan_v1";

function readSelectedPlan(): PlanId {
  try {
    const raw = localStorage.getItem(SELECTED_PLAN_KEY);
    if (!raw) return "semester";
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "planId" in parsed &&
      (["monthly", "semester", "annual"] as unknown[]).includes(
        (parsed as { planId: unknown }).planId
      )
    ) {
      return (parsed as { planId: PlanId }).planId;
    }
    return "semester";
  } catch {
    return "semester";
  }
}

function buildWhatsappMessage(planName: string, nombre: string, email: string, wsp: string): string {
  let msg = `Hola, quiero inscribirme en Gmusic Academy.\nCompleté el primer camino gratuito.\nMe interesa el plan ${planName}.`;
  if (nombre.trim()) msg += `\nMi nombre es: ${nombre.trim()}`;
  if (email.trim()) msg += `\nMi email: ${email.trim()}`;
  if (wsp.trim()) msg += `\nMi WhatsApp: ${wsp.trim()}`;
  return msg;
}

function buildWhatsappUrl(planName: string, nombre = "", email = "", wsp = ""): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsappMessage(planName, nombre, email, wsp))}`;
}

const FIELD_BASE: React.CSSProperties = {
  width: "100%",
  height: 44,
  padding: "0 14px",
  borderRadius: 2,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "rgba(255,255,255,0.03)",
  color: WHITE_WARM,
  fontSize: 14,
  fontFamily: "Inter, sans-serif",
  outline: "none",
  boxSizing: "border-box",
};

const LABEL_BASE: React.CSSProperties = {
  display: "block",
  marginBottom: 5,
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.4)",
  fontFamily: "Inter, sans-serif",
};

interface InscripcionRegistroPageProps {
  setPage: (page: string) => void;
}

export function InscripcionRegistroPage({ setPage }: InscripcionRegistroPageProps) {
  const [planId] = useState<PlanId>(() => readSelectedPlan());
  const plan = getPlanById(planId);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [formSent, setFormSent] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    window.open(buildWhatsappUrl(plan.name, nombre, email, whatsapp), "_blank", "noopener,noreferrer");
    setFormSent(true);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#080808", color: WHITE_WARM }}>
      <main style={{ maxWidth: 580, margin: "0 auto", padding: "52px 20px 72px" }}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          style={{ textAlign: "center", marginBottom: 32 }}
        >
          {/* Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: 99,
            border: "1px solid rgba(201,168,76,0.22)",
            background: "rgba(201,168,76,0.05)",
            marginBottom: 20,
          }}>
            <span style={{ fontSize: 13 }}>✓</span>
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: GOLD,
              fontFamily: "Inter, sans-serif",
            }}>
              Tu lugar está reservado
            </span>
          </div>

          <h1 style={{
            margin: "0 0 14px",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 5vw, 36px)",
            fontWeight: 400,
            lineHeight: 1.15,
            color: WHITE_WARM,
          }}>
            Completaste el primer camino.
            <br />
            <em style={{ color: "rgba(245,240,232,0.55)" }}>Ahora es el momento de continuar.</em>
          </h1>

          <p style={{
            margin: 0,
            fontSize: 15,
            lineHeight: 1.7,
            color: TEXT_SEC,
            fontFamily: "Inter, sans-serif",
          }}>
            Escríbenos por WhatsApp y te confirmamos tu acceso al camino completo.
          </p>
        </motion.div>

        {/* Plan selected */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          style={{
            padding: "16px 20px",
            borderRadius: 4,
            border: plan.highlighted ? "1px solid rgba(206,130,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
            background: plan.highlighted ? "rgba(206,130,255,0.04)" : "rgba(255,255,255,0.02)",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "Inter, sans-serif", color: WHITE_WARM }}>
                Plan {plan.name}
              </span>
              {plan.savingsLabel && (
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.1em",
                  textTransform: "uppercase", color: "var(--edu-reward)",
                  fontFamily: "Inter, sans-serif",
                }}>
                  {plan.savingsLabel}
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: 12, color: TEXT_SEC, fontFamily: "Inter, sans-serif" }}>
              {plan.description}
            </p>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif", color: "rgba(255,150,0,0.8)" }}>
              Cupos de apertura
            </p>
            <p style={{ margin: "2px 0 0", fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
              Precio por confirmar · {plan.intervalLabel}
            </p>
          </div>
        </motion.div>

        {/* Primary WhatsApp CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.4 }}
          style={{ marginBottom: 28 }}
        >
          <motion.a
            href={buildWhatsappUrl(plan.name, nombre, email, whatsapp)}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ background: "#1fad55", boxShadow: "0 8px 24px rgba(37,211,102,0.22)" }}
            whileTap={{ scale: 0.985 }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              height: 54,
              width: "100%",
              borderRadius: 2,
              background: "#25D366",
              color: "#fff",
              fontSize: 13,
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.5px",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Reservar mi lugar por WhatsApp
          </motion.a>
        </motion.div>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "rgba(255,255,255,0.25)",
            fontFamily: "Inter, sans-serif",
          }}>
            o déjanos tus datos
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
        </div>

        {/* Lead form */}
        {!formSent ? (
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.32, duration: 0.4 }}
            onSubmit={handleFormSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}
          >
            <div>
              <label htmlFor="nombre" style={LABEL_BASE}>
                Nombre <span style={{ color: GOLD }}>*</span>
              </label>
              <input
                id="nombre"
                type="text"
                required
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Tu nombre"
                style={FIELD_BASE}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <div>
              <label htmlFor="email" style={LABEL_BASE}>
                Email <span style={{ color: GOLD }}>*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="tu@email.com"
                style={FIELD_BASE}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <div>
              <label htmlFor="whatsapp" style={LABEL_BASE}>
                WhatsApp
              </label>
              <input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="+56 9 XXXX XXXX"
                style={FIELD_BASE}
                onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ background: "rgba(201,168,76,0.82)" }}
              whileTap={{ scale: 0.985 }}
              style={{
                height: 48, width: "100%",
                borderRadius: 2,
                background: GOLD,
                color: "#080808",
                fontSize: 11, fontWeight: 700,
                border: "none", cursor: "pointer",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
                marginTop: 4,
              }}
            >
              Enviar y contactar por WhatsApp
            </motion.button>
          </motion.form>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: "18px 20px",
              borderRadius: 4,
              border: "1px solid rgba(88,204,2,0.18)",
              background: "rgba(88,204,2,0.04)",
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            <p style={{
              margin: 0,
              fontSize: 14,
              color: "var(--edu-success)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 600,
            }}>
              ¡Datos enviados! Si WhatsApp no se abrió, usa el botón verde de arriba.
            </p>
          </motion.div>
        )}

        {/* Secondary nav */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setPage("inscripcion-gate")}
            style={{
              height: 44, padding: "0 22px",
              borderRadius: 2,
              background: "transparent",
              color: TEXT_SEC,
              fontSize: 11, fontWeight: 600,
              border: "1px solid rgba(255,255,255,0.1)",
              cursor: "pointer",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
            }}
          >
            ← Cambiar plan
          </button>

          <button
            type="button"
            onClick={() => setPage("home")}
            style={{
              height: 44, padding: "0 22px",
              borderRadius: 2,
              background: "transparent",
              color: "rgba(255,255,255,0.2)",
              fontSize: 11, fontWeight: 600,
              border: "none",
              cursor: "pointer",
              letterSpacing: "1px",
              textTransform: "uppercase",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Ir al inicio
          </button>
        </div>

      </main>
    </div>
  );
}
