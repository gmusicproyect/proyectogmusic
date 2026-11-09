import { BookOpenText } from "lucide-react";
import { GM_GOLD, GM_TEXT_SEC } from "./tokens";

interface TutorEntryLinkProps {
  onOpen: () => void;
  /** Texto visible (default: Preguntas con citas). */
  label?: string;
  className?: string;
}

/** Entrada de producto al tutor grounded (`/tutor`). */
export function TutorEntryLink({
  onOpen,
  label = "Preguntas con citas",
  className,
}: TutorEntryLinkProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        margin: 0,
        padding: "8px 0",
        background: "transparent",
        border: "none",
        color: GM_GOLD,
        cursor: "pointer",
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <BookOpenText size={14} aria-hidden style={{ color: GM_TEXT_SEC }} />
      <span>{label}</span>
    </button>
  );
}
