import { useState } from "react";
import { motion } from "motion/react";

const LEVELS = [
  {
    id: "fundamento",
    subtitle: "NIVEL 1",
    title: "Fundamento",
    description: "Empieza desde cero. Postura, oído, primeros acordes y el hábito de practicar 7 minutos al día.",
    forWho: "Nunca has tocado o quieres volver a empezar",
    duracion: "Meses 1–4 del programa",
    bgImage: "https://images.unsplash.com/photo-1603661850942-3b922be12831?w=900&q=80",
    nextStep: "Ver clase gratuita",
    nextHint: "Guitarra · Sin tarjeta · 7 min",
    comingSoon: false,
  },
  {
    id: "tecnica",
    subtitle: "NIVEL 2",
    title: "Técnica",
    description: "Ya tienes la base. Ahora construyes limpieza, velocidad y control real sobre el instrumento.",
    forWho: "Tocas, pero quieres más precisión y fluidez",
    duracion: "Meses 4–8 del programa",
    bgImage: "https://images.unsplash.com/photo-1579797990179-4ca11c8b47fd?w=900&q=80",
    nextStep: "Próximamente",
    nextHint: "Disponible en una próxima etapa",
    comingSoon: true,
  },
  {
    id: "crea",
    subtitle: "NIVEL 3",
    title: "Crea",
    description: "Técnica tienes. Ahora construyes tu sonido propio: composición, improvisación e identidad musical.",
    forWho: "Tienes técnica y quieres expresarte",
    duracion: "Meses 9–12 del programa",
    bgImage: "https://images.unsplash.com/photo-1444623151656-030273ddb785?w=900&q=80",
    nextStep: "Próximamente",
    nextHint: "Disponible en una próxima etapa",
    comingSoon: true,
  },
];

const GOLD = "#C9A84C";
const GOLD_BORDER = "rgba(201,168,76,0.3)";
const WHITE_WARM = "#F5F0E8";

export function InteractiveLevelSelector({
  setPage,
  setLevel,
}: {
  setPage: (page: string) => void;
  setLevel: (level: string) => void;
}) {
  const [active, setActive] = useState(0);

  const handleSelect = (levelId: string) => {
    if (levelId !== "fundamento") return;
    setLevel(levelId);
    setPage("fundamento-preview");
  };

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 24 }}>

      {/* Indicador de camino */}
      <div style={{
        display: "flex", alignItems: "center", gap: 0,
        maxWidth: 480,
      }}>
        {LEVELS.map((l, i) => (
          <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div
              onClick={() => setActive(i)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "4px 14px", borderRadius: 2, cursor: "pointer",
                background: active === i ? "rgba(201,168,76,0.1)" : "transparent",
                border: `1px solid ${active === i ? GOLD_BORDER : "transparent"}`,
                transition: "all 0.2s",
              }}
            >
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                color: active === i ? GOLD : "rgba(255,255,255,0.25)",
                transition: "color 0.2s",
              }}>{l.subtitle}</span>
              <span style={{
                fontSize: 13, fontFamily: "Inter, sans-serif",
                color: active === i ? WHITE_WARM : "rgba(255,255,255,0.25)",
                fontWeight: active === i ? 500 : 400,
                transition: "color 0.2s",
              }}>{l.title}</span>
            </div>
            {i < LEVELS.length - 1 && (
              <div style={{ width: 20, height: 1, background: "rgba(255,255,255,0.1)", flexShrink: 0 }} />
            )}
          </div>
        ))}
      </div>

      {/* Cards expandibles */}
      <div style={{
        display: "flex", flexDirection: "row", gap: 12,
        height: "min(360px, 42vh)", width: "100%",
      }}>
        {LEVELS.map((level, i) => {
          const isActive = active === i;
          return (
            <motion.div
              key={level.id}
              onMouseEnter={() => setActive(i)}
              animate={{ flex: isActive ? 4 : 1 }}
              transition={{ type: "spring", stiffness: 280, damping: 28 }}
              style={{
                position: "relative", minWidth: isActive ? 260 : 72,
                height: "100%", borderRadius: 4, overflow: "hidden",
                cursor: "pointer", background: "#111",
                border: `1px solid ${isActive ? GOLD_BORDER : "rgba(255,255,255,0.05)"}`,
                boxShadow: isActive ? "0 20px 60px rgba(201,168,76,0.08)" : "none",
                transition: "border-color 0.3s, box-shadow 0.3s",
              }}
            >
              {/* Imagen de fondo */}
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1 }}
                transition={{ duration: 0.8 }}
                style={{
                  position: "absolute", inset: 0,
                  backgroundImage: `url(${level.bgImage})`,
                  backgroundSize: "cover", backgroundPosition: "center",
                  opacity: isActive ? 0.45 : 0.15,
                  filter: isActive ? "grayscale(20%)" : "grayscale(70%)",
                  transition: "opacity 0.4s, filter 0.4s",
                }}
              />

              {/* Overlay oscuro */}
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(to top, rgba(8,8,8,0.95) 0%, rgba(8,8,8,0.5) 50%, rgba(8,8,8,0.15) 100%)",
              }} />

              {/* Glow dorado sutil en activo */}
              {isActive && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: "50%",
                  background: "linear-gradient(to top, rgba(201,168,76,0.08) 0%, transparent 100%)",
                  pointerEvents: "none",
                }} />
              )}

              {/* Contenido */}
              <div style={{
                position: "absolute", inset: 0, padding: isActive ? "28px 24px" : "20px 0",
                display: "flex", flexDirection: "column",
                alignItems: isActive ? "flex-start" : "center",
                justifyContent: isActive ? "flex-end" : "center",
              }}>
                {isActive ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.05 }}
                    style={{ width: "100%" }}
                  >
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "2.5px",
                      textTransform: "uppercase", color: GOLD,
                      fontFamily: "Inter, sans-serif", marginBottom: 6,
                    }}>
                      {level.subtitle}
                    </div>
                    <h3 style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 26, fontWeight: 400, letterSpacing: "-0.5px",
                      color: WHITE_WARM, margin: "0 0 10px", lineHeight: 1.15,
                    }}>
                      {level.title}
                    </h3>
                    <p style={{
                      color: "rgba(255,255,255,0.58)", fontSize: 13,
                      lineHeight: 1.6, fontFamily: "Inter, sans-serif",
                      margin: "0 0 16px", maxWidth: 300,
                    }}>
                      {level.description}
                    </p>

                    {/* Datos compactos */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 12px", borderRadius: 2,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="5"/><path d="M3 21v-2a7 7 0 0 1 7-7h4a7 7 0 0 1 7 7v2"/></svg>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>{level.forWho}</span>
                      </div>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "7px 12px", borderRadius: 2,
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.06)",
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", fontFamily: "Inter, sans-serif" }}>{level.duracion}</span>
                      </div>
                    </div>

                    {/* CTA con hint del siguiente paso */}
                    {level.comingSoon ? (
                      <div
                        aria-disabled="true"
                        style={{
                          width: "100%", height: 44, borderRadius: 2,
                          background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)",
                          fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.08)",
                          letterSpacing: "1px", textTransform: "uppercase",
                          fontFamily: "Inter, sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          cursor: "not-allowed",
                        }}
                      >
                        {level.nextStep}
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ background: "rgba(201,168,76,0.85)", boxShadow: "0 8px 24px rgba(201,168,76,0.25)" }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSelect(level.id)}
                        style={{
                          width: "100%", height: 44, borderRadius: 2,
                          background: GOLD, color: "#080808",
                          fontSize: 12, fontWeight: 700, border: "none",
                          cursor: "pointer", letterSpacing: "1px",
                          textTransform: "uppercase", fontFamily: "Inter, sans-serif",
                          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                        }}
                      >
                        {level.nextStep}
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                      </motion.button>
                    )}
                    <div style={{
                      fontSize: 11, color: "rgba(201,168,76,0.45)",
                      fontFamily: "Inter, sans-serif", marginTop: 8,
                      letterSpacing: "0.5px",
                    }}>
                      {level.nextHint}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      writingMode: "vertical-rl",
                      textOrientation: "mixed",
                      transform: "rotate(180deg)",
                      display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 10,
                    }}
                  >
                    <span style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: "2px",
                      textTransform: "uppercase", color: "rgba(201,168,76,0.4)",
                      fontFamily: "Inter, sans-serif",
                    }}>{level.subtitle}</span>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 20, fontWeight: 400, letterSpacing: "1px",
                      color: "rgba(255,255,255,0.4)",
                    }}>{level.title}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
