import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, CheckCircle } from "lucide-react";
import { useDemoProgress } from "../hooks/useDemoProgress";
import {
  PLAN_TIERS,
  BILLING_PERIODS,
  getPlanPrice,
  getPlanTier,
  getBillingPeriod,
  formatCLP,
} from "../data/subscription-plans";
import type {
  PlanTier,
  BillingPeriod,
  PlanTierDef,
  BillingPeriodDef,
  PlanPrice,
} from "../data/subscription-plans";
import { GOLD, TEXT_SEC, WHITE_WARM, BORDER } from "../components/marketing/tokens";
import { analytics } from "../utils/analytics";

// Gamification tokens — CSS vars from design-system/tokens.css
const EDU_SUCCESS = "var(--edu-success)";
const EDU_ACHIEVEMENT = "var(--edu-achievement)";

const SELECTED_PLAN_KEY = "gmusic:selected_plan_v1";

function saveSelectedPlan(tier: PlanTier, period: BillingPeriod) {
  try {
    const planId = `${tier}-${period}`;
    localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify({ planId }));
  } catch {
    // localStorage indisponible
  }
}

// ─── Plan card ───────────────────────────────────────────────────────────────

interface PlanCardProps {
  tier: PlanTierDef;
  price: PlanPrice;
  period: BillingPeriodDef;
  selected: boolean;
  onSelect: () => void;
}

function PlanCard({ tier, price, period, selected, onSelect }: PlanCardProps) {
  const isHighlighted = tier.highlighted;
  const borderColor = selected
    ? `rgba(201,168,76,0.55)`
    : isHighlighted
    ? `rgba(206,130,255,0.28)`
    : BORDER;

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileHover={{ y: -2, borderColor: "rgba(201,168,76,0.4)" }}
      whileTap={{ scale: 0.98 }}
      style={{
        position: "relative",
        width: "100%",
        textAlign: "left",
        padding: isHighlighted ? "20px 18px 18px" : "18px 16px",
        borderRadius: 6,
        border: `1px solid ${borderColor}`,
        background: selected
          ? "rgba(201,168,76,0.07)"
          : isHighlighted
          ? "rgba(206,130,255,0.04)"
          : "rgba(255,255,255,0.02)",
        cursor: "pointer",
        transition: "background 0.18s, border-color 0.18s",
        outline: selected ? `2px solid rgba(201,168,76,0.22)` : "none",
        outlineOffset: 2,
      }}
      aria-pressed={selected}
      aria-label={`Seleccionar ${tier.name}`}
    >
      {/* Highlighted badge */}
      {tier.badge && (
        <span
          style={{
            position: "absolute",
            top: -10,
            left: "50%",
            transform: "translateX(-50%)",
            background: EDU_ACHIEVEMENT,
            color: "#080808",
            fontSize: 9,
            fontWeight: 800,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            padding: "3px 10px",
            borderRadius: 99,
            fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
          }}
        >
          {tier.badge}
        </span>
      )}

      {/* Selection indicator */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          border: `2px solid ${selected ? GOLD : "rgba(255,255,255,0.2)"}`,
          background: selected ? GOLD : "transparent",
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {selected && (
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#080808",
            }}
          />
        )}
      </div>

      {/* Plan name */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: WHITE_WARM,
            letterSpacing: "-0.01em",
          }}
        >
          {tier.name}
        </span>
      </div>

      {/* Price display */}
      <div style={{ marginBottom: 8 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            fontFamily: "Inter, sans-serif",
            color: WHITE_WARM,
          }}
        >
          {formatCLP(price.pricePerMonth)}
        </span>
        <span
          style={{
            fontSize: 11,
            color: TEXT_SEC,
            fontFamily: "Inter, sans-serif",
          }}
        >
          {" "}
          / mes
        </span>
        {period.id !== "monthly" && (
          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.3)",
              fontFamily: "Inter, sans-serif",
              marginTop: 2,
            }}
          >
            {formatCLP(price.totalPrice)} {period.intervalLabel}
          </div>
        )}
      </div>

      {/* Features */}
      <ul
        style={{
          margin: "8px 0 0",
          padding: "0 0 0 14px",
          listStyle: "none",
        }}
      >
        {tier.features.map((f) => (
          <li
            key={f}
            style={{
              fontSize: 11,
              color: TEXT_SEC,
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.6,
              marginBottom: 2,
              display: "flex",
              alignItems: "flex-start",
              gap: 6,
            }}
          >
            <span style={{ color: "var(--edu-success)", flexShrink: 0, marginTop: 1 }}>✓</span>
            {f}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

// ─── Locked gate (demo not finished) ─────────────────────────────────────────

interface LockedGateProps {
  completedCount: number;
  onGoBack: () => void;
}

function LockedGate({ completedCount, onGoBack }: LockedGateProps) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        textAlign: "center",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ maxWidth: 420 }}
      >
        {/* Lock icon */}
        <div
          style={{
            width: 72,
            height: 72,
            margin: "0 auto 24px",
            borderRadius: "50%",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          <Lock size={28} strokeWidth={1.5} />
        </div>

        <p
          style={{
            margin: "0 0 12px",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.25)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Zona bloqueada
        </p>

        <h1
          style={{
            margin: "0 0 16px",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(24px, 4vw, 32px)",
            fontWeight: 400,
            color: WHITE_WARM,
            lineHeight: 1.2,
          }}
        >
          Completa tu primer camino para desbloquear esta zona
        </h1>

        {/* Progress bar */}
        <div style={{ marginBottom: 28 }}>
          <p
            style={{
              margin: "0 0 10px",
              fontSize: 12,
              color: TEXT_SEC,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {completedCount} de 5 clases completadas
          </p>
          <div
            style={{
              width: "100%",
              height: 6,
              borderRadius: 99,
              background: "rgba(255,255,255,0.06)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 5) * 100}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 99,
                background: EDU_SUCCESS,
              }}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={onGoBack}
          style={{
            height: 48,
            width: "100%",
            maxWidth: 320,
            borderRadius: 2,
            background: GOLD,
            color: "#080808",
            fontSize: 11,
            fontWeight: 700,
            border: "none",
            cursor: "pointer",
            letterSpacing: "1px",
            textTransform: "uppercase",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Volver a mi camino gratuito
        </button>
      </motion.div>
    </div>
  );
}

// ─── Inscription gate (demo finished) ────────────────────────────────────────

interface InscripcionGatePageProps {
  setPage: (page: string) => void;
}

export function InscripcionGatePage({ setPage }: InscripcionGatePageProps) {
  const { demoFinished, completedLessons } = useDemoProgress();
  const [selectedPeriod, setSelectedPeriod] = useState<BillingPeriod>("semester");
  const [selectedTier, setSelectedTier] = useState<PlanTier>("plus");

  useEffect(() => {
    analytics.gateViewed(!demoFinished);
  }, [demoFinished]);

  if (!demoFinished) {
    return (
      <LockedGate
        completedCount={completedLessons.length}
        onGoBack={() => setPage("mi-camino-demo")}
      />
    );
  }

  const handleBegin = () => {
    const price = getPlanPrice(selectedTier, selectedPeriod);
    const planId = `${selectedTier}-${selectedPeriod}`;
    analytics.planSelected(selectedTier, selectedPeriod, price.totalPrice, planId);
    saveSelectedPlan(selectedTier, selectedPeriod);
    setPage("inscripcion-registro");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: WHITE_WARM,
      }}
    >
      <main
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "48px 20px 64px",
        }}
      >
        {/* ── Celebration header ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: 40 }}
        >
          {/* World completion badge */}
          <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
            <motion.div
              animate={{ boxShadow: ["0 0 0 0 rgba(88,204,2,0)", "0 0 0 14px rgba(88,204,2,0)"] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                border: `2px solid ${EDU_SUCCESS}`,
                background: "rgba(88,204,2,0.1)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto",
              }}
            >
              <CheckCircle size={28} color={EDU_SUCCESS} strokeWidth={2} />
            </motion.div>
          </div>

          <p
            style={{
              margin: "0 0 10px",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: EDU_SUCCESS,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Mundo 1 completado
          </p>

          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(26px, 5vw, 38px)",
              fontWeight: 400,
              lineHeight: 1.15,
              color: WHITE_WARM,
            }}
          >
            Completaste tu primer camino en Gmusic
          </h1>

          <p
            style={{
              margin: "0 0 20px",
              fontSize: 15,
              lineHeight: 1.6,
              color: TEXT_SEC,
              fontFamily: "Inter, sans-serif",
            }}
          >
            Terminaste el Mundo 1: Fundamentos de la guitarra
          </p>

          {/* Emotional bridge */}
          <div
            style={{
              margin: "0 auto",
              maxWidth: 520,
              padding: "16px 20px",
              borderRadius: 6,
              border: `1px solid rgba(201,168,76,0.15)`,
              background: "rgba(201,168,76,0.04)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.75,
                color: "rgba(245,240,232,0.75)",
                fontFamily: "Inter, sans-serif",
                fontStyle: "italic",
              }}
            >
              Ya conociste cómo funciona la academia. Ahora puedes desbloquear el camino completo y seguir avanzando.
            </p>
          </div>
        </motion.div>

        {/* ── Gate divider ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: GOLD,
              fontFamily: "Inter, sans-serif",
              padding: "4px 10px",
              border: `1px solid rgba(201,168,76,0.25)`,
              borderRadius: 99,
              background: "rgba(201,168,76,0.06)",
            }}
          >
            Elige tu plan
          </span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.07)" }} />
        </motion.div>

        {/* ── Plan selector ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          style={{ marginBottom: 32 }}
        >
          {/* Period toggle */}
          <div
            style={{
              display: "flex",
              gap: 6,
              justifyContent: "center",
              marginBottom: 24,
              padding: "4px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {BILLING_PERIODS.map((bp) => {
              const isActive = selectedPeriod === bp.id;
              return (
                <button
                  key={bp.id}
                  type="button"
                  onClick={() => setSelectedPeriod(bp.id)}
                  style={{
                    flex: 1,
                    padding: "8px 10px",
                    borderRadius: 6,
                    border: "none",
                    background: isActive ? "rgba(201,168,76,0.12)" : "transparent",
                    color: isActive ? GOLD : "rgba(255,255,255,0.45)",
                    fontSize: 11,
                    fontWeight: isActive ? 700 : 500,
                    fontFamily: "Inter, sans-serif",
                    cursor: "pointer",
                    textAlign: "center",
                    transition: "all 0.15s",
                  }}
                >
                  <div>{bp.label}</div>
                  {bp.savingsLabel && (
                    <div
                      style={{
                        fontSize: 9,
                        fontWeight: 700,
                        color: isActive ? "var(--edu-reward)" : "rgba(255,150,0,0.4)",
                        letterSpacing: "0.05em",
                        marginTop: 2,
                      }}
                    >
                      {bp.savingsLabel}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Plan tier cards */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {PLAN_TIERS.map((tier) => {
              const price = getPlanPrice(tier.id, selectedPeriod);
              const period = getBillingPeriod(selectedPeriod);
              return (
                <PlanCard
                  key={tier.id}
                  tier={tier}
                  price={price}
                  period={period}
                  selected={selectedTier === tier.id}
                  onSelect={() => setSelectedTier(tier.id)}
                />
              );
            })}
          </div>
        </motion.div>

        {/* ── CTA row ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.35 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.button
              key={`${selectedTier}-${selectedPeriod}`}
              type="button"
              initial={{ opacity: 0.7, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              whileHover={{
                background: "rgba(201,168,76,0.82)",
                boxShadow: "0 10px 30px rgba(201,168,76,0.22)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBegin}
              style={{
                height: 52,
                width: "100%",
                maxWidth: 400,
                borderRadius: 2,
                background: GOLD,
                color: "#080808",
                fontSize: 12,
                fontWeight: 800,
                border: "none",
                cursor: "pointer",
                letterSpacing: "1px",
                textTransform: "uppercase",
                fontFamily: "Inter, sans-serif",
              }}
            >
              Comenzar con {getPlanTier(selectedTier).name} →
            </motion.button>
          </AnimatePresence>

          <p
            style={{
              margin: "8px 0 0",
              fontSize: 13,
              lineHeight: 1.5,
              textAlign: "center",
              color: "rgba(245,240,232,0.45)",
              fontFamily: "Inter, sans-serif",
              maxWidth: 400,
            }}
          >
            Al continuar abriremos WhatsApp con tu selección lista para confirmar. Sin pagos
            automáticos.
          </p>

          <button
            type="button"
            onClick={() => setPage("mi-camino-demo")}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              color: TEXT_SEC,
              fontFamily: "Inter, sans-serif",
              padding: "6px 12px",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            Volver al mapa
          </button>
        </motion.div>
      </main>
    </div>
  );
}
