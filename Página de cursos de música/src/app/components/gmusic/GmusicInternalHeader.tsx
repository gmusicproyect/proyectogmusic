import { useState } from "react";
import { Guitar, Home, Menu, Lock } from "lucide-react";
import { GM_GOLD, GM_SURFACE, GM_TEXT, GM_TEXT_SEC } from "./tokens";
import { deriveStudentInitials } from "../../utils/student-zone-identity";

export type GmusicNavId = "estudio" | "camino" | "comunidad";

/**
 * Comunidad bloqueada en header hasta feed/peers reales de launch
 * (T-F6-ANTI-DEMO-01 / T-MVP-COMMUNITY). Feed API existe; mocks curated ≠ launch.
 */
export type GmusicLockedNavId = "comunidad";

export const LOCKED_NAV_MODAL = {
  title: "Comunidad — fuera del MVP actual",
  subtitle:
    "Esta sección no forma parte del producto de launch hasta que haya feed y peers reales.",
  footer: "Mientras tanto, continúa en Mi Camino y Mi Estudio.",
} as const;

export function isLockedNav(id: string): id is GmusicLockedNavId {
  return id === "comunidad";
}

interface GmusicInternalHeaderProps {
  activeNav: GmusicNavId;
  userName: string;
  userSubtitle: string;
  setPage: (page: string) => void;
  onPlaceholder: (key: string) => void;
}

const NAV_ITEMS: {
  id: GmusicNavId;
  label: string;
  page?: string;
  locked?: boolean;
}[] = [
  { id: "camino", label: "Mi Camino", page: "mi-camino" },
  { id: "estudio", label: "Mi Estudio", page: "mi-estudio" },
  { id: "comunidad", label: "Comunidad", locked: true },
];

const HEADER_BORDER = "rgba(255, 255, 255, 0.08)";

export function GmusicInternalHeader({
  activeNav,
  userName,
  userSubtitle,
  setPage,
  onPlaceholder,
}: GmusicInternalHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const initials = deriveStudentInitials(userName);

  const navigateHome = () => {
    setMobileMenuOpen(false);
    setPage("home");
  };

  const handleNav = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.page) setPage(item.page);
    else if (item.locked) onPlaceholder(item.id);
    setMobileMenuOpen(false);
  };

  const navColor = (item: (typeof NAV_ITEMS)[number]) => {
    if (activeNav === item.id) return GM_GOLD;
    if (item.locked) return "rgba(160,160,165,0.45)";
    return GM_TEXT_SEC;
  };

  const NavLabel = ({ item }: { item: (typeof NAV_ITEMS)[number] }) => (
    <span className="inline-flex items-center gap-1.5">
      {item.label}
      {item.locked && (
        <Lock
          className="w-3 h-3 shrink-0"
          style={{ color: "rgba(160,160,165,0.4)", opacity: 0.9 }}
          aria-hidden
        />
      )}
    </span>
  );

  const homeButtonStyle = {
    color: GM_TEXT_SEC,
    background: "rgba(255, 255, 255, 0.04)",
    border: `1px solid ${HEADER_BORDER}`,
  } as const;

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: HEADER_BORDER,
        background: "rgba(10, 10, 10, 0.88)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center min-h-[85px] gap-6 py-1">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.15)]"
              style={{
                background: "rgba(212, 175, 55, 0.1)",
                border: "1px solid rgba(212, 175, 55, 0.25)",
              }}
            >
              <Guitar className="w-5 h-5 animate-pulse" style={{ color: GM_GOLD }} />
            </div>
            <span className="font-semibold text-lg tracking-tight text-white">
              Gmusic <span style={{ color: GM_GOLD, fontWeight: 500 }}>Estudio</span>
            </span>
            <button
              type="button"
              onClick={navigateHome}
              className="hidden md:inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors cursor-pointer"
              style={homeButtonStyle}
              aria-label="Inicio"
            >
              <Home className="w-4 h-4 shrink-0" style={{ color: GM_GOLD }} aria-hidden />
              Inicio
            </button>
          </div>

          <nav className="hidden md:flex items-center justify-center gap-4 lg:gap-6">
            {NAV_ITEMS.map((item) => {
              const active = activeNav === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item)}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-102 cursor-pointer"
                  style={{
                    color: navColor(item),
                    background: active ? "rgba(212, 175, 55, 0.08)" : "transparent",
                    border: active ? "1px solid rgba(212, 175, 55, 0.18)" : "1px solid transparent",
                    boxShadow: active ? "0 4px 15px rgba(212,175,55,0.05)" : "none",
                    opacity: item.locked ? 0.7 : 1,
                  }}
                >
                  <NavLabel item={item} />
                </button>
              );
            })}
          </nav>

          <div className="flex items-center justify-end gap-2">
            <div
              className="hidden md:flex items-center gap-3 rounded-2xl px-4 py-2.5"
              style={{
                background: "rgba(255, 255, 255, 0.04)",
                border: `1px solid ${HEADER_BORDER}`,
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold shrink-0"
                style={{
                  background: "rgba(212, 175, 55, 0.12)",
                  color: GM_GOLD,
                  border: "1px solid rgba(212, 175, 55, 0.2)",
                }}
              >
                {initials}
              </div>
              <div className="text-left leading-tight">
                <div className="text-sm font-medium" style={{ color: GM_TEXT }}>
                  {userName}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: GM_TEXT_SEC }}>
                  {userSubtitle}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
              style={{
                color: GM_GOLD,
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${HEADER_BORDER}`,
              }}
              aria-label="Menú"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div
          className="md:hidden border-t px-5 py-4"
          style={{ borderColor: HEADER_BORDER, background: GM_SURFACE }}
        >
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-4"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${HEADER_BORDER}`,
            }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-semibold"
              style={{ background: "rgba(212,175,55,0.12)", color: GM_GOLD }}
            >
              {initials}
            </div>
            <div>
              <div className="font-medium text-sm">{userName}</div>
              <div className="text-xs mt-0.5" style={{ color: GM_TEXT_SEC }}>
                {userSubtitle}
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <button
              type="button"
              onClick={navigateHome}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors inline-flex items-center gap-2"
              style={{ color: GM_TEXT_SEC }}
            >
              <Home className="w-4 h-4 shrink-0" style={{ color: GM_GOLD }} aria-hidden />
              Inicio
            </button>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item)}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium min-h-[44px] transition-colors"
                style={{
                  color: navColor(item),
                  background: activeNav === item.id ? "rgba(212,175,55,0.08)" : "transparent",
                  opacity: item.locked ? 0.85 : 1,
                }}
              >
                <NavLabel item={item} />
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
