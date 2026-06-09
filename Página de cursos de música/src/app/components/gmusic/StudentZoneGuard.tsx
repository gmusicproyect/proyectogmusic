import { useEffect, useRef, type ReactNode } from "react";
import { useStudentAccess } from "../../hooks/useStudentAccess";
import { GM_BG, GM_BORDER, GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "./tokens";
import {
  navigateDeniedToHomePlans,
  navigateStudentZoneAware,
} from "../../utils/student-zone-routing";

interface StudentZoneGuardProps {
  children: ReactNode;
  setPage: (page: string) => void;
  currentPage: string;
}

const guardShellStyle = {
  minHeight: "100vh",
  background: GM_BG,
  color: GM_TEXT,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "24px",
} as const;

const panelStyle = {
  maxWidth: "420px",
  width: "100%",
  textAlign: "center" as const,
  border: `1px solid ${GM_BORDER}`,
  borderRadius: "16px",
  padding: "32px 24px",
  background: "rgba(255,255,255,0.02)",
};

const primaryButtonStyle = {
  marginTop: "20px",
  padding: "12px 20px",
  borderRadius: "999px",
  border: "none",
  background: GM_GOLD,
  color: "#0A0A0A",
  fontWeight: 600,
  cursor: "pointer",
} as const;

const secondaryButtonStyle = {
  marginTop: "12px",
  padding: "12px 20px",
  borderRadius: "999px",
  border: `1px solid ${GM_BORDER}`,
  background: "transparent",
  color: GM_TEXT,
  fontWeight: 500,
  cursor: "pointer",
} as const;

export function StudentZoneGuard({
  children,
  setPage,
  currentPage,
}: StudentZoneGuardProps) {
  const access = useStudentAccess();
  const deniedRedirectRef = useRef(false);

  useEffect(() => {
    if (access.status !== "denied" || deniedRedirectRef.current) return;
    deniedRedirectRef.current = true;
    navigateDeniedToHomePlans(setPage, currentPage);
  }, [access.status, setPage, currentPage]);

  if (access.status === "loading") {
    return (
      <div style={guardShellStyle} role="status" aria-live="polite">
        <p style={{ margin: 0, color: GM_TEXT_SEC }}>Verificando acceso…</p>
      </div>
    );
  }

  if (access.status === "error") {
    return (
      <div style={guardShellStyle}>
        <div style={panelStyle}>
          <p style={{ margin: 0, fontSize: "1.05rem" }}>
            No pudimos verificar tu acceso
          </p>
          <button type="button" style={primaryButtonStyle} onClick={() => void access.retry()}>
            Reintentar
          </button>
          <div>
            <button
              type="button"
              style={secondaryButtonStyle}
              onClick={() => navigateStudentZoneAware("home", setPage, currentPage)}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (access.status === "denied") {
    return null;
  }

  return <>{children}</>;
}
