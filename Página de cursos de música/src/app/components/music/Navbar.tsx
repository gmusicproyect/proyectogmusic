import { useState, useEffect, type CSSProperties } from "react";
import { GM_GOLD } from "../gmusic/tokens";
import { BrandLogo } from "../brand/BrandLogo";
import type { PublicStudentSessionState } from "../../hooks/usePublicStudentSession";

const WHITE_WARM = "#F5F0E8";
const BORDER = "rgba(255,255,255,0.06)";

interface NavbarProps {
  currentPage?: string;
  setPage?: (page: string) => void;
  onSignIn?: () => void;
  onRegister?: () => void;
  session?: PublicStudentSessionState;
  onGoToStudio?: () => void;
  onLogout?: () => void | Promise<void>;
  onRetrySession?: () => void | Promise<void>;
  logoutError?: string | null;
  logoutProcessing?: boolean;
}

export function Navbar({
  currentPage,
  setPage,
  onSignIn,
  onRegister,
  session = { status: "anonymous" },
  onGoToStudio,
  onLogout,
  onRetrySession,
  logoutError = null,
  logoutProcessing = false,
}: NavbarProps) {
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
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) {
          window.scrollTo({
            top: el.getBoundingClientRect().top + window.pageYOffset - 80,
            behavior: "smooth",
          });
        }
      });
    } else {
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({
          top: el.getBoundingClientRect().top + window.pageYOffset - 80,
          behavior: "smooth",
        });
      }
    }
    setMenuOpen(false);
  };

  const menuItems: [string, string][] = [
    ["Inicio", "hero"],
    ["Academia", "academia"],
    ["Comunidad", "comunidad"],
    ["Planes", "planes"],
    ["Contacto", "contacto"],
  ];

  const authButtonStyle = (primary: boolean): CSSProperties => ({
    background: primary ? GM_GOLD : "rgba(0,0,0,0)",
    color: primary ? "#0A0A0A" : GM_GOLD,
    fontSize: 13,
    fontWeight: primary ? 600 : 500,
    padding: "0 18px",
    height: 36,
    borderRadius: 2,
    border: primary ? "none" : "1px solid rgba(201,168,76,0.35)",
    cursor: "pointer",
    letterSpacing: "0.3px",
    fontFamily: "Inter,sans-serif",
  });

  const authShellStyle: CSSProperties = {
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexShrink: 0,
    minHeight: 36,
    justifyContent: "flex-end",
  };

  const renderLoadingAuth = (stacked = false) => (
    <div
      className="gmusic-ctas"
      style={{
        ...authShellStyle,
        flexDirection: stacked ? "column" : "row",
        width: stacked ? "100%" : undefined,
      }}
      aria-hidden="true"
    >
      <div
        style={{
          width: stacked ? "100%" : 108,
          height: 36,
          borderRadius: 2,
          background: "rgba(255,255,255,0.06)",
        }}
      />
      <div
        style={{
          width: stacked ? "100%" : 108,
          height: 36,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
        }}
      />
    </div>
  );

  const renderAnonymousAuth = (stacked = false) => (
    <div
      className="gmusic-ctas"
      style={{
        ...authShellStyle,
        flexDirection: stacked ? "column" : "row",
        width: stacked ? "100%" : undefined,
      }}
    >
      <button
        type="button"
        onClick={onSignIn}
        style={{ ...authButtonStyle(false), width: stacked ? "100%" : undefined }}
      >
        Alumno
      </button>
      <button
        type="button"
        onClick={onRegister}
        style={{ ...authButtonStyle(true), width: stacked ? "100%" : undefined }}
      >
        Regístrate
      </button>
    </div>
  );

  const renderAuthenticatedAuth = (stacked = false) => (
    <div
      className="gmusic-ctas"
      style={{
        ...authShellStyle,
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "stretch" : "center",
        width: stacked ? "100%" : undefined,
      }}
    >
      <span
        style={{
          color: WHITE_WARM,
          fontSize: 13,
          fontWeight: 500,
          maxWidth: stacked ? "100%" : 160,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {session.status === "authenticated" ? session.user.name : ""}
      </span>
      <button
        type="button"
        onClick={onGoToStudio}
        disabled={logoutProcessing}
        style={{ ...authButtonStyle(true), width: stacked ? "100%" : undefined }}
      >
        Mi Estudio
      </button>
      <button
        type="button"
        onClick={() => void onLogout?.()}
        disabled={logoutProcessing}
        style={{ ...authButtonStyle(false), width: stacked ? "100%" : undefined }}
      >
        {logoutProcessing ? "Cerrando…" : "Cerrar sesión"}
      </button>
    </div>
  );

  const renderSessionAuth = (stacked = false) => {
    if (session.status === "loading") return renderLoadingAuth(stacked);
    if (session.status === "authenticated") return renderAuthenticatedAuth(stacked);
    if (session.status === "error") {
      // API caída: no bloquear nav ni CTAs públicos
      return renderAnonymousAuth(stacked);
    }
    return renderAnonymousAuth(stacked);
  };

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
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: 24,
          maxWidth: 1440, margin: "0 auto", boxSizing: "border-box",
        }}>
          <div onClick={() => scrollToSection("hero")} style={{ display: "flex", alignItems: "center", cursor: "pointer", flexShrink: 0 }}>
            <BrandLogo className="h-[3.25rem] w-auto -translate-y-0.5" />
          </div>

          <nav className="gmusic-nav" style={{
            display: "flex",
            gap: 36,
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}>
            {menuItems.map(([label, id]) => {
              const isActive = activeSection === id;
              return (
                <span
                  key={label}
                  className="gmusic-nav-link"
                  onClick={() => scrollToSection(id)}
                  style={{
                  color: isActive ? WHITE_WARM : "#9A958C",
                  fontSize: 15, fontWeight: 500, letterSpacing: "0.4px",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer", transition: "color 0.15s ease", position: "relative",
                }}
                  onMouseEnter={(e) => e.currentTarget.style.color = WHITE_WARM}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = "#9A958C"; }}
                >
                  {label}
                  {isActive && <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 5, height: 5, borderRadius: "50%", background: GM_GOLD, display: "block" }} />}
                </span>
              );
            })}
          </nav>

          <div className="gmusic-header-actions" style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            justifySelf: "end",
          }}>
            <div className="gmusic-auth-shell" style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 4,
            }}>
              {renderSessionAuth()}
              {logoutError && (
                <span role="alert" style={{ color: "#fca5a5", fontSize: 11, maxWidth: 280, textAlign: "right" }}>
                  {logoutError}
                </span>
              )}
            </div>

            <button
              type="button"
              className="gmusic-hamburger"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                display: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 8,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {menuOpen ? <path d="M18 6L6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
              </svg>
            </button>
          </div>
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
            {renderSessionAuth(true)}
            {logoutError && (
              <span role="alert" style={{ color: "#fca5a5", fontSize: 12, marginTop: 8 }}>
                {logoutError}
              </span>
            )}
          </div>
        )}
      </header>
    </>
  );
}
