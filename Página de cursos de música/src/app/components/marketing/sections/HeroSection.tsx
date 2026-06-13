import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  motion,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { GOLD, GOLD_SOFT, WHITE_WARM } from "../tokens";
import { THRESHOLD_ASSETS } from "./threshold-assets";

interface HeroSectionProps {
  scrollTo: (id: string) => void;
  setPage: (page: string) => void;
}

function FullBleedImage({
  src,
  alt,
  priority,
  style,
}: {
  src: string;
  alt: string;
  priority?: boolean;
  style?: CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      fetchPriority={priority ? "high" : "auto"}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center center",
        ...style,
      }}
    />
  );
}

export function HeroSection({ setPage }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [parallaxEnabled, setParallaxEnabled] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Refs para callbacks — evitan closures obsoletos
  const reducedMotionRef = useRef(false);
  const maxDoorScaleRef = useRef(12);
  const parallaxEnabledRef = useRef(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 60, damping: 25 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 25 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const facadeOpacity  = useTransform(scrollYProgress, [0.2,  0.5],  [1, 0]);
  const intOpacity     = useTransform(scrollYProgress, [0.42, 0.62], [0, 1]);
  const intScale       = useTransform(scrollYProgress, [0.42, 0.62], [1.08, 1]);
  const copyOpacity    = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const copyY          = useTransform(scrollYProgress, [0.55, 0.75], [32, 0]);
  const exteriorOpacity = useTransform(scrollYProgress, [0, 0.32], [1, 0]);

  // ─── Canvas draw ────────────────────────────────────────────────────────────
  // Lee directamente de los píxeles de la imagen original (6000×3360).
  // Sin intermediario CSS → sin pérdida de calidad al hacer zoom.
  const draw = useCallback((progress: number, mx: number, my: number) => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const w   = canvas.offsetWidth;
    const h   = canvas.offsetHeight;

    if (
      canvas.width  !== Math.round(w * dpr) ||
      canvas.height !== Math.round(h * dpr)
    ) {
      canvas.width  = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const maxScale = maxDoorScaleRef.current;
    const reduced  = reducedMotionRef.current;
    const t        = Math.max(0, Math.min(progress / 0.55, 1));
    const zoom     = reduced ? 1 : 1 + t * (maxScale - 1);

    const iW = img.naturalWidth;   // 6000
    const iH = img.naturalHeight;  // 3360

    // Centro de la puerta en la imagen
    const doorCX = iW * 0.50;
    const doorCY = iH * 0.62;

    // Parallax: desplaza el recorte según el mouse (máx ±1.5% del ancho)
    const pxShift = parallaxEnabledRef.current ? mx * 0.000015 * iW : 0;
    const pyShift = parallaxEnabledRef.current ? my * 0.000015 * iH : 0;

    const cropW = iW / zoom;
    const cropH = iH / zoom;

    const cropX = Math.max(0, Math.min(iW - cropW, doorCX + pxShift - cropW / 2));
    const cropY = Math.max(0, Math.min(iH - cropH, doorCY + pyShift - cropH / 2));

    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, w, h);
  }, []);

  // Suscripciones: scroll + spring del mouse
  useEffect(() => {
    const unsubScroll = scrollYProgress.on("change",
      (v) => draw(v, springX.get(), springY.get()));
    const unsubX = springX.on("change",
      (v) => draw(scrollYProgress.get(), v, springY.get()));
    const unsubY = springY.on("change",
      (v) => draw(scrollYProgress.get(), springX.get(), v));

    const handleResize = () =>
      draw(scrollYProgress.get(), springX.get(), springY.get());
    window.addEventListener("resize", handleResize);

    return () => {
      unsubScroll();
      unsubX();
      unsubY();
      window.removeEventListener("resize", handleResize);
    };
  }, [draw, scrollYProgress, springX, springY]);

  // Carga la imagen fuente; dibuja en cuanto esté lista
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      draw(scrollYProgress.get(), 0, 0);
    };
    img.src = THRESHOLD_ASSETS.facade;
  }, [draw, scrollYProgress]);

  // Sincroniza la opacidad CSS del canvas con el MotionValue
  useEffect(() => {
    return facadeOpacity.on("change", (v) => {
      if (canvasRef.current) canvasRef.current.style.opacity = String(v);
    });
  }, [facadeOpacity]);

  // Media queries: reduced-motion + touch
  useEffect(() => {
    const motionMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const touchMq  = window.matchMedia("(pointer: coarse)");

    const sync = () => {
      const reduced = motionMq.matches;
      const touch   = touchMq.matches;

      reducedMotionRef.current    = reduced;
      parallaxEnabledRef.current  = !reduced && !touch;
      maxDoorScaleRef.current     = reduced ? 1 : touch ? 6 : 12;

      setReducedMotion(reduced);
      setParallaxEnabled(!reduced && !touch);

      draw(scrollYProgress.get(), springX.get(), springY.get());
    };

    sync();
    motionMq.addEventListener("change", sync);
    touchMq.addEventListener("change",  sync);
    return () => {
      motionMq.removeEventListener("change", sync);
      touchMq.removeEventListener("change",  sync);
    };
  }, [draw, scrollYProgress, springX, springY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parallaxEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width  / 2);
    mouseY.set(e.clientY - rect.top  - rect.height / 2);
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
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          background: "#080808",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Capa 0 — Interior (estudio): se revela al atravesar la puerta */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            opacity: intOpacity,
            scale: intScale,
            transformOrigin: "center center",
          }}
        >
          <FullBleedImage
            src={THRESHOLD_ASSETS.interior}
            alt=""
            style={{ objectPosition: "center 35%" }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, rgba(8,8,8,0.55) 0%, rgba(8,8,8,0.25) 45%, rgba(8,8,8,0.75) 100%)",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 45%, rgba(201,168,76,0.12) 0%, transparent 65%)",
          }} />
        </motion.div>

        {/* Capa 1 — Canvas fachada: zoom desde píxeles originales, sin pérdida */}
        <canvas
          ref={canvasRef}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
        />

        {/* Gradiente sobre la fachada (sincronizado con facadeOpacity) */}
        <motion.div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            opacity: facadeOpacity,
            background: "linear-gradient(to bottom, transparent 0%, rgba(8,8,8,0.3) 50%, rgba(8,8,8,0.85) 100%)",
            pointerEvents: "none",
          }}
        />

        {/* Copy exterior */}
        <motion.div
          style={{
            position: "absolute", inset: 0, zIndex: 3,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "flex-end",
            padding: "0 24px 72px",
            opacity: exteriorOpacity,
            pointerEvents: "none",
          }}
        >
          <p style={{
            margin: 0,
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(22px, 3.5vw, 34px)",
            fontWeight: 400,
            color: WHITE_WARM,
            textAlign: "center",
            lineHeight: 1.35,
            maxWidth: 560,
            textShadow: "0 2px 24px rgba(0,0,0,0.8)",
          }}>
            Estás a un paso de dominar la guitarra.
          </p>
          {!reducedMotion && (
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ marginTop: 28, opacity: 0.5 }}
            >
              <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth={1.5}>
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
            </motion.div>
          )}
        </motion.div>

        {/* Copy interior + CTA */}
        <motion.div
          style={{
            position: "absolute", inset: 0, zIndex: 4,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: "0 24px",
            opacity: copyOpacity,
            y: copyY,
            textAlign: "center",
          }}
        >
          <h1 style={{
            margin: "0 0 12px",
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 400,
            color: WHITE_WARM,
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
            textShadow: "0 2px 32px rgba(0,0,0,0.75)",
          }}>
            Bienvenido a Gmusic Estudio
          </h1>
          <p style={{
            margin: "0 0 36px",
            fontFamily: "Inter, sans-serif",
            fontSize: 17,
            color: "rgba(245,240,232,0.85)",
            lineHeight: 1.6,
            maxWidth: 420,
            textShadow: "0 1px 16px rgba(0,0,0,0.6)",
          }}>
            Tu camino comienza aquí
          </p>
          <motion.button
            type="button"
            whileHover={{ background: GOLD_SOFT, boxShadow: "0 8px 32px rgba(201,168,76,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15 }}
            onClick={() => setPage("mi-camino-demo")}
            style={{
              height: 50, padding: "0 32px", borderRadius: 2,
              background: GOLD, color: "#080808",
              fontSize: 13, fontWeight: 700,
              border: "none", cursor: "pointer",
              letterSpacing: "1px", textTransform: "uppercase",
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
