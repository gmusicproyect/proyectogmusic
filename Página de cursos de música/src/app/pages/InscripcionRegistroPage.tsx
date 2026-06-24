import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import {
  parsePlanId,
  getPlanTier,
  getBillingPeriod,
  getPlanPrice,
  isValidPlanId,
  formatCLP,
} from "../data/subscription-plans";
import type { PlanId } from "../data/subscription-plans";
import { GOLD, TEXT_SEC, WHITE_WARM } from "../components/marketing/tokens";
import { analytics } from "../utils/analytics";
import {
  getOrCreateOnboardingSessionId,
  readTemperamentQuizResult,
} from "../utils/temperament-quiz-storage";
import { linkOnboardingLead } from "../services/gmusic-api/link-onboarding-lead";
import { resetAnonymousFunnelAfterLeadCapture, anonymousFunnelRestartPage } from "../utils/anonymous-funnel-storage";

// Formato wa.me: código país + número, sin "+" ni espacios (ej. "56912345678")
const WHATSAPP_NUMBER = "56953429676";

const SELECTED_PLAN_KEY = "gmusic:selected_plan_v1";

interface InscripcionLeadFormValues {
  nombre: string;
  email: string;
  whatsapp: string;
  tipoDoc: "boleta" | "factura";
  rut: string;
  razonSocial: string;
  direccion: string;
}

function readLeadFromForm(form: HTMLFormElement): InscripcionLeadFormValues {
  const fd = new FormData(form);
  const tipoDocRaw = fd.get("tipoDoc");
  return {
    nombre: String(fd.get("nombre") ?? "").trim(),
    email: String(fd.get("email") ?? "").trim().toLowerCase(),
    whatsapp: String(fd.get("whatsapp") ?? "").trim(),
    tipoDoc: tipoDocRaw === "factura" ? "factura" : "boleta",
    rut: String(fd.get("rut") ?? "").trim(),
    razonSocial: String(fd.get("razonSocial") ?? "").trim(),
    direccion: String(fd.get("direccion") ?? "").trim(),
  };
}

function resolveOnboardingSessionIdForLead(): string {
  const quizSessionId = readTemperamentQuizResult()?.session_id?.trim();
  if (quizSessionId && quizSessionId.length >= 8) return quizSessionId;
  return getOrCreateOnboardingSessionId();
}

function readSelectedPlan(): PlanId {
  try {
    const raw = localStorage.getItem(SELECTED_PLAN_KEY);
    if (!raw) return "plus-semester";
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      "planId" in parsed &&
      isValidPlanId((parsed as { planId: unknown }).planId)
    ) {
      return (parsed as { planId: PlanId }).planId;
    }
    return "plus-semester";
  } catch {
    return "plus-semester";
  }
}

function buildWhatsappMessage(
  tierName: string,
  periodLabel: string,
  nombre: string,
  email: string,
  wsp: string,
  tipoDoc: "boleta" | "factura",
  rut?: string,
  razonSocial?: string,
  direccion?: string
): string {
  let msg = `Hola, quiero inscribirme en Gmusic Estudio.`;
  msg += `\nCompleté las 5 clases gratuitas y quiero el camino completo.`;
  msg += `\nPlan elegido: ${tierName} (${periodLabel.toLowerCase()})`;
  msg += `\n\nMis datos:`;
  if (nombre.trim()) msg += `\nNombre: ${nombre.trim()}`;
  if (email.trim()) msg += `\nEmail: ${email.trim()}`;
  if (wsp.trim()) msg += `\nWhatsApp: ${wsp.trim()}`;
  if (tipoDoc === "boleta") {
    msg += `\nDocumento: Boleta`;
  } else {
    msg += `\nDocumento: Factura`;
    if (rut?.trim()) msg += `\nRUT: ${rut.trim()}`;
    if (razonSocial?.trim()) msg += `\nRazón social: ${razonSocial.trim()}`;
    if (direccion?.trim()) msg += `\nDirección: ${direccion.trim()}`;
  }
  return msg;
}

function buildDudasUrl(tierName: string, periodLabel: string): string {
  const msg = `Hola, completé el camino gratuito de Gmusic Estudio.\nTengo dudas sobre el plan ${tierName} (${periodLabel.toLowerCase()}).\n¿Me pueden orientar?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function buildWhatsappUrl(
  tierName: string,
  periodLabel: string,
  nombre = "",
  email = "",
  wsp = "",
  tipoDoc: "boleta" | "factura" = "boleta",
  rut = "",
  razonSocial = "",
  direccion = ""
): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    buildWhatsappMessage(
      tierName,
      periodLabel,
      nombre,
      email,
      wsp,
      tipoDoc,
      rut,
      razonSocial,
      direccion
    )
  )}`;
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
  const { tier: tierId, period: periodId } = parsePlanId(planId);
  const tier = getPlanTier(tierId);
  const period = getBillingPeriod(periodId);
  const price = getPlanPrice(tierId, periodId);

  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [formSent, setFormSent] = useState(false);
  const [tipoDoc, setTipoDoc] = useState<"boleta" | "factura">("boleta");
  const [rut, setRut] = useState("");
  const [razonSocial, setRazonSocial] = useState("");
  const [direccion, setDireccion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    analytics.registroViewed(planId);
  }, [planId]);

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    const form = e.currentTarget;
    const currentLead = readLeadFromForm(form);
    const currentPlanId = readSelectedPlan();
    const sessionId = resolveOnboardingSessionIdForLead();
    const currentTier = getPlanTier(parsePlanId(currentPlanId).tier);
    const currentPeriod = getBillingPeriod(parsePlanId(currentPlanId).period);

    setIsSubmitting(true);
    analytics.whatsappCtaClicked("inscripcion", currentPlanId);

    try {
      await linkOnboardingLead({
        sessionId,
        email: currentLead.email,
        planId: currentPlanId,
      });
    } catch {
      // El puente WhatsApp sigue aunque falle la persistencia del lead.
    }

    window.open(
      buildWhatsappUrl(
        currentTier.name,
        currentPeriod.label,
        currentLead.nombre,
        currentLead.email,
        currentLead.whatsapp,
        currentLead.tipoDoc,
        currentLead.rut,
        currentLead.razonSocial,
        currentLead.direccion
      ),
      "_blank",
      "noopener,noreferrer"
    );

    resetAnonymousFunnelAfterLeadCapture();
    setFormSent(true);
    setIsSubmitting(false);
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
              5 de 5 · Camino completado
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
            Elige cómo continuar: envía tu solicitud con tus datos o escríbenos
            si tienes dudas sobre el plan o los precios.
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
            border: tier.highlighted ? "1px solid rgba(206,130,255,0.2)" : "1px solid rgba(255,255,255,0.07)",
            background: tier.highlighted ? "rgba(206,130,255,0.04)" : "rgba(255,255,255,0.02)",
            marginBottom: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
            <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "Inter, sans-serif", color: WHITE_WARM }}>
              {tier.name}
            </span>
            <span style={{ fontSize: 11, color: TEXT_SEC, fontFamily: "Inter, sans-serif" }}>
              · {period.label}
            </span>
            {period.savingsLabel && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--edu-reward)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {period.savingsLabel}
              </span>
            )}
          </div>

          <div style={{ marginBottom: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 800, fontFamily: "Inter, sans-serif", color: WHITE_WARM }}>
              {formatCLP(price.pricePerMonth)}
            </span>
            <span style={{ fontSize: 11, color: TEXT_SEC, fontFamily: "Inter, sans-serif" }}> / mes</span>
            {periodId !== "monthly" && (
              <p style={{ margin: "4px 0 0", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
                {formatCLP(price.totalPrice)} {period.intervalLabel}
              </p>
            )}
          </div>

          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {tier.features.slice(0, 3).map((f) => (
              <li
                key={f}
                style={{
                  fontSize: 11,
                  color: TEXT_SEC,
                  fontFamily: "Inter, sans-serif",
                  lineHeight: 1.5,
                  marginBottom: 2,
                }}
              >
                ✓ {f}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Lead form */}
        {!formSent ? (
          <>
            <div style={{
              padding: "12px 16px",
              borderRadius: 3,
              border: "1px solid rgba(255,255,255,0.06)",
              background: "rgba(255,255,255,0.02)",
              marginBottom: 20,
            }}>
              <p style={{
                margin: 0,
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                fontFamily: "Inter, sans-serif",
                lineHeight: 1.6,
              }}>
                Aún no pagas aquí. Revisamos tu solicitud y te confirmamos
                acceso y forma de pago por WhatsApp.
              </p>
            </div>

            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.4 }}
              onSubmit={handleFormSubmit}
              autoComplete="off"
              style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}
            >
              <div>
                <label htmlFor="nombre" style={LABEL_BASE}>
                  Nombre <span style={{ color: GOLD }}>*</span>
                </label>
                <input
                  id="nombre"
                  name="nombre"
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
                  name="email"
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
                  WhatsApp <span style={{ color: GOLD }}>*</span>
                </label>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  required
                  value={whatsapp}
                  onChange={e => setWhatsapp(e.target.value)}
                  placeholder="+56 9 XXXX XXXX"
                  style={FIELD_BASE}
                  onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                />
              </div>

              <div>
                <label style={LABEL_BASE}>Tipo de documento</label>
                <div style={{ display: "flex", gap: 12 }}>
                  {(["boleta", "factura"] as const).map((doc) => (
                    <label key={doc} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      fontSize: 13, fontFamily: "Inter, sans-serif",
                      color: tipoDoc === doc ? WHITE_WARM : "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                    }}>
                      <input
                        type="radio"
                        name="tipoDoc"
                        value={doc}
                        checked={tipoDoc === doc}
                        onChange={() => setTipoDoc(doc)}
                        style={{ accentColor: GOLD }}
                      />
                      {doc.charAt(0).toUpperCase() + doc.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {tipoDoc === "factura" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div>
                    <label htmlFor="rut" style={LABEL_BASE}>RUT empresa</label>
                    <input id="rut" name="rut" type="text" value={rut}
                      onChange={e => setRut(e.target.value)}
                      placeholder="76.123.456-7"
                      style={FIELD_BASE}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                  <div>
                    <label htmlFor="razonSocial" style={LABEL_BASE}>Razón social</label>
                    <input id="razonSocial" name="razonSocial" type="text" value={razonSocial}
                      onChange={e => setRazonSocial(e.target.value)}
                      placeholder="Empresa SpA"
                      style={FIELD_BASE}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                  <div>
                    <label htmlFor="direccion" style={LABEL_BASE}>Dirección</label>
                    <input id="direccion" name="direccion" type="text" value={direccion}
                      onChange={e => setDireccion(e.target.value)}
                      placeholder="Av. Ejemplo 123, Santiago"
                      style={FIELD_BASE}
                      onFocus={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.35)"; }}
                      onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
                    />
                  </div>
                </motion.div>
              )}

              <motion.button
                type="submit"
                disabled={isSubmitting}
                whileHover={{ background: "rgba(201,168,76,0.82)" }}
                whileTap={{ scale: 0.985 }}
                style={{
                  height: 48, width: "100%",
                  borderRadius: 2,
                  background: GOLD,
                  color: "#080808",
                  fontSize: 11, fontWeight: 700,
                  border: "none", cursor: isSubmitting ? "wait" : "pointer",
                  opacity: isSubmitting ? 0.72 : 1,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  fontFamily: "Inter, sans-serif",
                  marginTop: 4,
                }}
              >
                Enviar solicitud de inscripción
              </motion.button>
            </motion.form>
          </>
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
              ¡Datos enviados! Si WhatsApp no se abrió, usa el botón Despejar dudas o escríbenos
              directamente al +56 9 5342 9676.
            </p>
          </motion.div>
        )}

        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <motion.a
            href={buildDudasUrl(tier.name, period.label)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => analytics.whatsappCtaClicked("dudas", planId)}
            whileHover={{ color: WHITE_WARM }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 44,
              padding: "0 24px",
              borderRadius: 2,
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "rgba(255,255,255,0.45)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "1px",
              textTransform: "uppercase",
              textDecoration: "none",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
            }}
          >
            Despejar dudas por WhatsApp
          </motion.a>
        </div>

        {/* Secondary nav */}
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          {formSent ? (
            <button
              type="button"
              onClick={() => setPage(anonymousFunnelRestartPage())}
              style={{
                height: 44, padding: "0 22px",
                borderRadius: 2,
                background: GOLD,
                color: "#080808",
                fontSize: 11, fontWeight: 700,
                border: "none",
                cursor: "pointer",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Repetir quiz y clases gratis
            </button>
          ) : (
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
          )}

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
