import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { GOLD, GOLD_SOFT, TEXT_SEC, WHITE_WARM } from "../tokens";

interface HeroSectionProps {
  scrollTo: (id: string) => void;
  setPage: (page: string) => void;
}

function ThresholdArch({ style }: { style?: CSSProperties }) {
  return (
    <svg
      viewBox="0 0 200 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block", ...style }}
      aria-hidden
    >
      <path
        d="M 28 300 L 28 120 Q 28 40 100 40 Q 172 40 172 120 L 172 300"
        stroke={GOLD}
        strokeOpacity={0.5}
        strokeWidth={2.5}
        fill="none"
      />
      <line
        x1={28}
        y1={300}
        x2={172}
        y2={300}
        stroke={GOLD}
        strokeOpacity={0.35}
        strokeWidth={2}
      />
    </svg>
  );
}

function GuitarSilhouette() {
  return (
    <svg
      viewBox="0 0 120 200"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: 200, height: "auto", color: "rgba(201,168,76,0.15)" }}
      aria-hidden
    >
      <ellipse cx={60} cy={148} rx={42} ry={48} />
      <rect x={54} y={20} width={12} height={130} rx={4} />
      <rect x={48} y={12} width={24} height={18} rx={3} />
      <circle cx={60} cy={148} r={14} fill="#080808" />
    </svg>
  );
}

function ParallaxLayer({
  x,
  y,
  factor,
  enabled,
  children,
  style,
}: {
  x: MotionValue<number>;
  y: MotionValue<number>;
  factor: number;
  enabled: boolean;
  children: ReactNode;
  style?: CSSProperties;
}) {
  const layerX = useTransform(x, (v) => (enabled ? v * factor : 0));
  const layerY = useTransform(y, (v) => (enabled ? v * factor : 0));

  return (
    <motion.div
      style={{
        position: "absolute",
        inset: 0,
        x: layerX,
        y: layerY,
        ...style,
      }}
    >
      {children}
    </motion.div>
  );
}

export function HeroSection({ setPage }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxEnabled, setParallaxEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [maxArchScale, setMaxArchScale] = useState(10);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const archScale = useTransform(scrollYProgress, [0, 0.55], [1, maxArchScale]);
  const archOpacity = useTransform(scrollYProgress, [0.35, 0.55], [1, 0]);
  const intOpacity = useTransform(scrollYProgress, [0.45, 0.65], [0, 1]);
  const intY = useTransform(scrollYProgress, [0.45, 0.65], [40, 0]);
  const copyOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const copyY = useTransform(scrollYProgress, [0.55, 0.75], [32, 0]);
  const exteriorOpacity = useTransform(scrollYProgress, [0, 0.35], [1, 0]);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchMq = window.matchMedia("(pointer: coarse)");

    const sync = () => {
      const reduced = motionMq.matches;
      const touch = touchMq.matches;
      setReducedMotion(reduced);
      setParallaxEnabled(!reduced && !touch);
      setMaxArchScale(reduced ? 1 : touch ? 5 : 10);
    };

    sync();
    motionMq.addEventListener("change", sync);
    touchMq.addEventListener("change", sync);
    return () => {
      motionMq.removeEventListener("change", sync);
      touchMq.removeEventListener("change", sync);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parallaxEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      style={{ height: "200vh", position: "relative" }}
    >
      <div
        style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background */}
        <ParallaxLayer
          x={springX}
          y={springY}
          factor={0.02}
          enabled={parallaxEnabled}
          style={{ background: "#080808", zIndex: 0 }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,168,76,0.04) 0%, transparent 65%)",
            }}
          />
        </ParallaxLayer>

        {/* Arch threshold */}
        <ParallaxLayer
          x={springX}
          y={springY}
          factor={0.04}
          enabled={parallaxEnabled}
          style={{
            zIndex: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <motion.div
            style={{
              width: "40vw",
              height: "65vh",
              maxWidth: 480,
              scale: archScale,
              opacity: archOpacity,
              transformOrigin: "center center",
            }}
          >
            <ThresholdArch />
          </motion.div>
        </ParallaxLayer>

        {/* Exterior copy */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "0 24px 120px",
            opacity: exteriorOpacity,
            pointerEvents: "none",
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(22px, 3.5vw, 32px)",
              fontWeight: 400,
              color: WHITE_WARM,
              textAlign: "center",
              lineHeight: 1.35,
              maxWidth: 520,
            }}
          >
            Estás a un paso de dominar la guitarra.
          </p>
          {!reducedMotion && (
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginTop: 32, opacity: 0.4 }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </motion.div>
          )}
        </motion.div>

        {/* Interior studio */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            opacity: intOpacity,
            y: intY,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background:
              "radial-gradient(ellipse 60% 70% at 50% 60%, rgba(201,168,76,0.08) 0%, transparent 70%), #080808",
            pointerEvents: "none",
          }}
        >
          <GuitarSilhouette />
        </motion.div>

        {/* Interior copy + CTA */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            opacity: copyOpacity,
            y: copyY,
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: "0 0 12px",
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(32px, 5vw, 52px)",
              fontWeight: 400,
              color: WHITE_WARM,
              letterSpacing: "-0.5px",
              lineHeight: 1.15,
            }}
          >
            Bienvenido a Gmusic Estudio
          </h1>
          <p
            style={{
              margin: "0 0 36px",
              fontFamily: "Inter, sans-serif",
              fontSize: 17,
              color: TEXT_SEC,
              lineHeight: 1.6,
              maxWidth: 420,
            }}
          >
            Tu camino comienza aquí
          </p>
          <motion.button
            type="button"
            whileHover={{
              background: GOLD_SOFT,
              boxShadow: "0 8px 32px rgba(201,168,76,0.35)",
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPage("mi-camino-demo")}
            style={{
              height: 50,
              padding: "0 32px",
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
            Ver clase gratuita
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
