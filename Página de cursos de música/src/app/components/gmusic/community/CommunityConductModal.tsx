import { COMMUNITY_CONDUCT_RULES } from "../../../data/mock-community-data";

interface CommunityConductModalProps {
  open: boolean;
  onClose: () => void;
}

export function CommunityConductModal({ open, onClose }: CommunityConductModalProps) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="community-conduct-title"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,0.72)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: 420,
          width: "100%",
          background: "#111",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 16,
          padding: 24,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="community-conduct-title" style={{ margin: "0 0 12px", fontSize: 18, color: "#fff" }}>
          Reglas de convivencia
        </h2>
        <ul style={{ margin: "0 0 20px", paddingLeft: 18, color: "rgba(255,255,255,0.7)", lineHeight: 1.7 }}>
          {COMMUNITY_CONDUCT_RULES.map((rule) => (
            <li key={rule} style={{ fontSize: 14 }}>
              {rule}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onClose}
          style={{
            width: "100%",
            background: "#C9A84C",
            color: "#0A0A0A",
            border: "none",
            borderRadius: 999,
            padding: "10px 16px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}
