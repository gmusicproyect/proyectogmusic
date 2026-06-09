import { useState, useEffect, type CSSProperties } from "react";
import { GM_GOLD } from "../gmusic/tokens";
const WHITE_WARM = "#F5F0E8";
const BORDER = "rgba(255,255,255,0.06)";
const AUTH_COMING_SOON_HINT = "Disponible próximamente";

interface NavbarProps {
  currentPage?: string;
  setPage?: (page: string) => void;
}

export function Navbar({ currentPage, setPage }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
      const sections = ["hero", "academia", "comunidad", "planes", "contacto"];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    if (currentPage && currentPage !== "home" && setPage) {
      setPage("home");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 80, behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  const menuItems: [string, string][] = [
    ["Inicio", "hero"],
    ["Academia", "academia"],
    ["Comunidad", "comunidad"],
    ["Ver planes", "planes"],
    ["Contacto", "contacto"],
  ];

  const disabledAuthButtonStyle = (primary: boolean): CSSProperties => ({
    background: primary ? "rgba(201,168,76,0.16)" : "rgba(255,255,255,0.03)",
    color: primary ? "rgba(10,10,10,0.42)" : "rgba(201,168,76,0.42)",
    fontSize: 13,
    fontWeight: primary ? 600 : 500,
    padding: "0 18px",
    height: 36,
    borderRadius: 2,
    border: primary ? "1px solid rgba(201,168,76,0.12)" : "1px solid rgba(255,255,255,0.08)",
    cursor: "not-allowed",
    letterSpacing: "0.3px",
    fontFamily: "Inter,sans-serif",
  });

  const renderAuthControls = (stacked = false) => (
    <div
      className="gmusic-ctas"
      style={{
        display: "flex",
        gap: 10,
        alignItems: stacked ? "stretch" : "center",
        flexDirection: stacked ? "column" : "row",
        flexShrink: 0,
        width: stacked ? "100%" : undefined,
      }}
    >
      <button
        type="button"
        disabled
        title={AUTH_COMING_SOON_HINT}
        aria-label="Iniciar sesión — disponible próximamente"
        style={{ ...disabledAuthButtonStyle(false), width: stacked ? "100%" : undefined }}
      >
        Iniciar sesión
      </button>
      <button
        type="button"
        disabled
        title={AUTH_COMING_SOON_HINT}
        aria-label="Regístrate — disponible próximamente"
        style={{ ...disabledAuthButtonStyle(true), width: stacked ? "100%" : undefined }}
      >
        Regístrate
      </button>
    </div>
  );

  return (
    <>
      <header style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 72, zIndex: 999,
        background: scrolled ? "rgba(8,8,8,0.92)" : "rgba(8,8,8,0.4)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        borderBottom: scrolled ? `1px solid ${BORDER}` : "1px solid transparent",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}>
        <div className="gmusic-header-bar" style={{
          width: "100%", height: "100%", padding: "0 48px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          maxWidth: 1440, margin: "0 auto", boxSizing: "border-box",
        }}>
          <div onClick={() => scrollToSection("hero")} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", flexShrink: 0 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GM_GOLD} strokeWidth="2" strokeLinecap="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </div>
            <span style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600, color: WHITE_WARM, letterSpacing: "-0.3px" }}>
              Gmusic <span style={{ color: GM_GOLD, fontWeight: 400 }}>Estudio</span>
            </span>
          </div>

          <nav className="gmusic-nav" style={{ display: "flex", gap: 32, alignItems: "center" }}>
            {menuItems.map(([label, id]) => {
              const isActive = activeSection === id;
              return (
                <span key={label} onClick={() => scrollToSection(id)} style={{
                  color: isActive ? WHITE_WARM : "#6B6B6B",
                  fontSize: 13, fontWeight: 500, letterSpacing: "0.2px",
                  cursor: "pointer", transition: "color 0.15s ease", position: "relative",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = WHITE_WARM}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#6B6B6B"; }}
                >
                  {label}
                  {isActive && <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: GM_GOLD, display: "block" }} />}
                </span>
              );
            })}
          </nav>

          {renderAuthControls()}

          <button className="gmusic-hamburger" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 8, color: "#fff" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div style={{
            position: "absolute", top: 72, left: 0, right: 0,
            background: "rgba(8,8,8,0.97)", backdropFilter: "blur(20px)",
            borderBottom: `1px solid ${BORDER}`, padding: "16px 24px 24px",
            display: "flex", flexDirection: "column", gap: 4, zIndex: 998,
          }}>
            {menuItems.map(([label, id]) => (
              <button key={label} onClick={() => scrollToSection(id)} style={{
                background: "none", border: "none",
                color: activeSection === id ? WHITE_WARM : "#6B6B6B",
                fontSize: 16, fontWeight: 500, cursor: "pointer",
                textAlign: "left", padding: "12px 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}>{label}</button>
            ))}
            {renderAuthControls(true)}
          </div>
        )}
      </header>
    </>
  );
}
