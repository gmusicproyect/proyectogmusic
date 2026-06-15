import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
} from "motion/react";
import { BrandLogo } from "../../brand/BrandLogo";
import { GOLD } from "../tokens";

interface HeroSectionProps {
  scrollTo: (id: string) => void;
  setPage: (page: string) => void;
}

const welcomeLineStyle = {
  margin: 0,
  fontFamily: '"bebas-neue-pro", sans-serif',
  fontSize: "clamp(24px, 3.8vw, 38px)",
  fontWeight: 400,
  fontStyle: "normal" as const,
  lineHeight: 1.3,
  color: "rgba(245,240,232,0.95)",
  letterSpacing: "0.03em",
  maxWidth: 1000,
  textShadow: "0 2px 24px rgba(0,0,0,0.55)",
};

function HeroAtmosphere() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(180deg, rgba(8, 8, 8, 0.55) 0%, rgba(8, 8, 8, 0.9) 100%), url('/hero/threshold/fondoinicio.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 75% 50% at 50% 50%, rgba(201,168,76,0.12) 0%, transparent 62%), linear-gradient(180deg, transparent 40%, #080808 100%)",
        }}
      />
    </>
  );
}

export function HeroSection(_props: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const scrollYProgress = useMotionValue(0);

  /** Scroll Apple: zoom lento → fade en último 14% → Academia ya visible abajo */
  const taglineOpacity = useTransform(scrollYProgress, [0, 0.18, 0.28], [1, 1, 0]);
  const logoScale      = useTransform(scrollYProgress, [0.06, 0.82], [1, 2.75]);
  const logoOpacity    = useTransform(scrollYProgress, [0.82, 0.96], [1, 0]);
  const logoGlow       = useTransform(scrollYProgress, [0.06, 0.82, 0.96], [0.12, 0.38, 0]);
  const backdropDim    = useTransform(scrollYProgress, [0.35, 0.82, 0.96], [0, 0.38, 0]);
  const hintOpacity    = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  const readScrollProgress = useCallback((): number => {
    const section = sectionRef.current;
    if (!section) return 0;
    const range = section.offsetHeight - window.innerHeight;
    if (range <= 0) return 0;
    return Math.min(1, Math.max(0, -section.getBoundingClientRect().top / range));
  }, []);

  const syncFromScroll = useCallback(() => {
    scrollYProgress.set(readScrollProgress());
  }, [readScrollProgress, scrollYProgress]);

  useEffect(() => {
    syncFromScroll();
    window.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", syncFromScroll);
    return () => {
      window.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", syncFromScroll);
    };
  }, [syncFromScroll]);

  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(motionMq.matches);
    sync();
    motionMq.addEventListener("change", sync);
    return () => motionMq.removeEventListener("change", sync);
  }, []);

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative"
      style={{ height: "160vh" }}
      aria-label="Gmusic Estudio"
    >
      <h1 className="sr-only">
        Gmusic Estudio — Bienvenidos a esta nueva experiencia de academia
      </h1>
      <div
        className="relative overflow-hidden bg-obsidian"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <HeroAtmosphere />

        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background: "#080808",
            opacity: backdropDim,
            pointerEvents: "none",
          }}
        />

        <div
          className="hero-welcome"
          style={{
            position: "relative",
            zIndex: 2,
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            boxSizing: "border-box",
            padding: "24px",
          }}
        >
          <motion.div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: logoOpacity,
              scale: reducedMotion ? 1 : logoScale,
              transformOrigin: "center center",
              willChange: "transform, opacity",
              marginBottom: 32,
            }}
          >
            <motion.div
              aria-hidden
              style={{
                position: "absolute",
                inset: "-35%",
                borderRadius: "50%",
                background: "radial-gradient(circle, rgba(201,168,76,0.4) 0%, transparent 70%)",
                opacity: logoGlow,
                filter: "blur(32px)",
                pointerEvents: "none",
              }}
            />
            <BrandLogo
              className="relative z-[1] h-[7rem] w-auto sm:h-40 md:h-44 lg:h-48"
              style={{ transform: "translateX(16%)" }}
              alt=""
            />
          </motion.div>

          <motion.p
            style={{
              ...welcomeLineStyle,
              width: "min(1100px, calc(100vw - 48px))",
              textAlign: "center",
              opacity: taglineOpacity,
              transform: "translateX(-8px)",
              pointerEvents: "none",
            }}
          >
            Bienvenidos a esta nueva experiencia de academia
          </motion.p>
        </div>

        {!reducedMotion && (
          <motion.div
            style={{
              position: "relative",
              zIndex: 2,
              display: "flex",
              justifyContent: "center",
              paddingBottom: 28,
              opacity: hintOpacity,
            }}
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5}>
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </motion.div>
        )}
      </div>
    </section>
  );
}
