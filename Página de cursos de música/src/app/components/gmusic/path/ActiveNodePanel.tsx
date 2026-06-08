import { Button } from "../../ui/button";
import { GM_GOLD, GM_TEXT, GM_TEXT_SEC, GM_SURFACE, GM_BORDER } from "../tokens";

export interface ActiveNodePanelProps {
  compact?: boolean;
  eyebrow: string;
  title: string;
  typeLabel: string;
  description: string;
  onStartLesson: () => void;
  isLoading?: boolean;
}

export function ActiveNodePanel({
  compact,
  eyebrow,
  title,
  typeLabel,
  description,
  onStartLesson,
  isLoading = false,
}: ActiveNodePanelProps) {
  return (
    <div
      className={`rounded-lg border p-5 md:p-6 ${compact ? "" : "lg:sticky lg:top-6"}`}
      style={{
        background: GM_SURFACE,
        borderColor: GM_BORDER,
        borderLeftWidth: 3,
        borderLeftColor: GM_GOLD,
      }}
    >
      <p
        className="text-[10px] font-medium tracking-[0.2em] uppercase mb-3"
        style={{ color: "rgba(212, 175, 55, 0.65)" }}
      >
        {eyebrow}
      </p>
      <h2
        className={`font-medium mb-2 leading-snug ${compact ? "text-lg" : "text-xl"}`}
        style={{ color: GM_TEXT, fontFamily: "'Playfair Display', Georgia, serif" }}
      >
        {title}
      </h2>
      <p className="text-xs mb-4 tracking-wide" style={{ color: GM_GOLD }}>
        {typeLabel}
      </p>
      <p className="text-sm mb-6 leading-relaxed" style={{ color: GM_TEXT_SEC }}>
        {description}
      </p>
      <Button
        onClick={onStartLesson}
        disabled={isLoading}
        className="w-full font-medium min-h-[44px] tracking-wide disabled:opacity-55"
        style={{ background: GM_GOLD, color: "#0A0A0A" }}
      >
        {isLoading ? "Cargando…" : "Iniciar lección"}
      </Button>
    </div>
  );
}
