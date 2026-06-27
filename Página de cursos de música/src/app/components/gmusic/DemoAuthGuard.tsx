import { useLayoutEffect, useRef, type ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { GM_BG, GM_BORDER, GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "./tokens";

interface DemoAuthGuardProps {
  children: ReactNode;
  setPage: (page: string) => void;
}

function SessionGateShell({ message }: { message: string }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: GM_BG,
        color: GM_TEXT_SEC,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      role="status"
    >
      {message}
    </div>
  );
}

export function DemoAuthGuard({ children, setPage }: DemoAuthGuardProps) {
  const { session, isLoggedIn } = useAuth();
  const redirectedRef = useRef(false);

  useLayoutEffect(() => {
    if (redirectedRef.current) return;
    if (session.status === "loading") return;
    if (isLoggedIn) return;
    redirectedRef.current = true;
    setPage("registro-cuenta");
  }, [session.status, isLoggedIn, setPage]);

  if (session.status === "loading") {
    return <SessionGateShell message="Verificando sesión…" />;
  }

  if (!isLoggedIn) {
    return <SessionGateShell message="Redirigiendo al registro…" />;
  }

  return <>{children}</>;
}

export function AuthFormShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: GM_BG,
        color: GM_TEXT,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "420px",
          border: `1px solid ${GM_BORDER}`,
          borderRadius: "16px",
          padding: "32px 24px",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <h1 style={{ margin: "0 0 8px", fontFamily: "'Playfair Display', Georgia, serif" }}>
          {title}
        </h1>
        <p style={{ margin: "0 0 24px", color: GM_TEXT_SEC, fontSize: "14px" }}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export const authPrimaryButtonStyle = {
  width: "100%",
  marginTop: "16px",
  padding: "12px 20px",
  borderRadius: "999px",
  border: "none",
  background: GM_GOLD,
  color: "#0A0A0A",
  fontWeight: 600,
  cursor: "pointer",
} as const;

export const authInputStyle = {
  width: "100%",
  marginTop: "8px",
  padding: "12px 14px",
  borderRadius: "10px",
  border: `1px solid ${GM_BORDER}`,
  background: "transparent",
  color: GM_TEXT,
} as const;
