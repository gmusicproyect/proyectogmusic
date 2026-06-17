import { useState, type CSSProperties } from "react";
import { CheckCircle, X } from "lucide-react";
import { GM_GOLD, GM_TEXT, GM_TEXT_SEC } from "./tokens";

const GOLD = "#C9A84C";

export interface DemoPathCompletedFabProps {
  onInscribirse: () => void;
  onPreviewFirst: () => void;
  onReset: () => void;
}

export function DemoPathCompletedFab({
  onInscribirse,
  onPreviewFirst,
  onReset,
}: DemoPathCompletedFabProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-end",
        gap: 10,
      }}
    >
      {open && (
        <div
          style={{
            width: 240,
            padding: 14,
            borderRadius: 12,
            background: "rgba(14,14,14,0.96)",
            border: "1px solid rgba(201,168,76,0.28)",
            boxShadow: "0 16px 48px rgba(0,0,0,0.55)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
            <p
              style={{
                margin: 0,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "rgba(201,168,76,0.8)",
              }}
            >
              5/5 completado
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar"
              style={iconBtnStyle}
            >
              <X size={14} />
            </button>
          </div>
          <p style={{ margin: "0 0 12px", fontSize: 12, lineHeight: 1.5, color: GM_TEXT_SEC }}>
            Elige un plan para continuar o repasa las clases.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <button type="button" onClick={onInscribirse} style={primaryFabActionStyle}>
              Elegir mi plan
            </button>
            <button type="button" onClick={onPreviewFirst} style={secondaryFabActionStyle}>
              Ver como primera vez
            </button>
            <button type="button" onClick={onReset} style={secondaryFabActionStyle}>
              Reiniciar progreso
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Cerrar menú de camino completado" : "Camino completado — abrir opciones"}
        title="Camino completado"
        style={{
          width: 52,
          height: 52,
          borderRadius: "50%",
          border: `2px solid ${GOLD}`,
          background: "rgba(201,168,76,0.12)",
          boxShadow: "0 0 24px rgba(201,168,76,0.25), 0 8px 24px rgba(0,0,0,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: GM_TEXT,
        }}
      >
        <CheckCircle size={22} color={GM_GOLD} strokeWidth={1.75} />
      </button>
    </div>
  );
}

const iconBtnStyle: CSSProperties = {
  background: "transparent",
  border: "none",
  color: "rgba(255,255,255,0.4)",
  cursor: "pointer",
  padding: 2,
};

const primaryFabActionStyle: CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 8,
  border: "none",
  background: GM_GOLD,
  color: "#0A0A0A",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  cursor: "pointer",
};

const secondaryFabActionStyle: CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.1)",
  background: "transparent",
  color: "rgba(245,240,232,0.55)",
  fontSize: 10,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
};
