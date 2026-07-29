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
    /** T-UX-01: sesión ADMIN no se redirige en silencio; ve panel con CTA /admin. */
    if (access.user.role === "ADMIN") return;
    deniedRedirectRef.current = true;
    navigateDeniedToHomePlans(setPage, currentPage);
  }, [access, setPage, currentPage]);

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
    if (access.user.role === "ADMIN") {
      return (
        <div style={guardShellStyle}>
          <div style={panelStyle} role="alert">
            <p style={{ margin: 0, fontSize: "1.05rem" }}>Esta zona es del alumno</p>
            <p style={{ margin: "10px 0 0", color: GM_TEXT_SEC, fontSize: "0.9rem" }}>
              Tu sesión es de administrador. El panel de creación de contenido vive en /admin.
            </p>
            <button type="button" style={primaryButtonStyle} onClick={() => setPage("admin")}>
              Ir al panel admin
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
    return null;
  }

  return <>{children}</>;
}
