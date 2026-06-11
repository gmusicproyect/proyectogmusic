import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Lock, CheckCircle } from "lucide-react";
import { useDemoProgress } from "../hooks/useDemoProgress";
import { SUBSCRIPTION_PLANS, getPlanById } from "../data/subscription-plans";
import type { PlanId } from "../data/subscription-plans";
import { GOLD, TEXT_SEC, WHITE_WARM, BORDER } from "../components/marketing/tokens";

// Gamification tokens — CSS vars from design-system/tokens.css
const EDU_SUCCESS = "var(--edu-success)";
const EDU_REWARD = "var(--edu-reward)";
const EDU_ACHIEVEMENT = "var(--edu-achievement)";

const SELECTED_PLAN_KEY = "gmusic:selected_plan_v1";

function saveSelectedPlan(planId: PlanId) {
  try {
    localStorage.setItem(SELECTED_PLAN_KEY, JSON.stringify({ planId }));
  } catch {
    // localStorage indisponible
  }
}

// ─── Plan card ───────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: (typeof SUBSCRIPTION_PLANS)[number];
  selected: boolean;
  onSelect: () => void;
}

function PlanCard({ plan, selected, onSelect }: PlanCardProps) {
  const isHighlighted = plan.highlighted;
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
      aria-label={`Seleccionar plan ${plan.name}`}
    >
      {/* Highlighted badge */}
      {isHighlighted && (
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
          Recomendado
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

      {/* Plan name + savings */}
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
          {plan.name}
        </span>
        {plan.savingsLabel && (
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: EDU_REWARD,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {plan.savingsLabel}
          </span>
        )}
      </div>

      {/* Price display */}
      <div style={{ marginBottom: 10 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            fontFamily: "Inter, sans-serif",
            color: "rgba(255,255,255,0.35)",
            fontStyle: "italic",
          }}
        >
          Cupos de apertura · {plan.intervalLabel}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          margin: 0,
          fontSize: 12,
          lineHeight: 1.6,
          fontFamily: "Inter, sans-serif",
          color: TEXT_SEC,
        }}
      >
        {plan.description}
      </p>
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
  const [selectedPlan, setSelectedPlan] = useState<PlanId>("semester");

  if (!demoFinished) {
    return (
      <LockedGate
        completedCount={completedLessons.length}
        onGoBack={() => setPage("mi-camino-demo")}
      />
    );
  }

  const plan = getPlanById(selectedPlan);

  const handleBegin = () => {
    saveSelectedPlan(selectedPlan);
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
          {/* Pricing soon notice */}
          <p
            style={{
              margin: "0 0 20px",
              fontSize: 12,
              textAlign: "center",
              color: "rgba(255,150,0,0.75)",
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
            }}
          >
            Cupos de apertura — precio por confirmar vía WhatsApp
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 12,
            }}
          >
            {SUBSCRIPTION_PLANS.map((p) => (
              <PlanCard
                key={p.id}
                plan={p}
                selected={selectedPlan === p.id}
                onSelect={() => setSelectedPlan(p.id)}
              />
            ))}
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
              key={selectedPlan}
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
              Comenzar con {plan.name} →
            </motion.button>
          </AnimatePresence>

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
