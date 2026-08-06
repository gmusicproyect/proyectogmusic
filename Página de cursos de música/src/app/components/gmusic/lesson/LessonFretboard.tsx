import {
  FRETBOARD_DISPLAY_ORDER,
  type FretboardStringId,
} from "./lesson-fretboard";
import {
  GM_GOLD,
  GM_GOLD_MATT,
  GM_SURFACE_ALT,
  GM_TEXT,
  GM_TEXT_SEC,
} from "../tokens";

export interface LessonFretboardProps {
  selectedStringId: string | null;
  interactive: boolean;
  disabled?: boolean;
  onSelectStringId?: (stringId: FretboardStringId) => void;
}

export function LessonFretboard({
  selectedStringId,
  interactive,
  disabled = false,
  onSelectStringId,
}: LessonFretboardProps) {
  const isDisabled = disabled || !interactive;

  return (
    <div
      className="w-full rounded-lg border px-4 py-4"
      style={{ background: GM_SURFACE_ALT, borderColor: GM_GOLD_MATT }}
      role="group"
      aria-label="Diapasón de guitarra"
    >
      <p
        className="text-[10px] font-medium tracking-[0.18em] uppercase mb-3"
        style={{ color: GM_TEXT_SEC }}
      >
        Diapasón
      </p>
      <div className="flex flex-col gap-2">
        {FRETBOARD_DISPLAY_ORDER.map((stringId) => {
          const isSelected = selectedStringId === stringId;
          const rowInteractive = interactive && !disabled;

          return (
            <button
              key={stringId}
              type="button"
              disabled={isDisabled}
              onClick={() => {
                if (rowInteractive && onSelectStringId) {
                  onSelectStringId(stringId);
                }
              }}
              className="flex items-center gap-3 rounded-md border px-3 py-2 min-h-[2.75rem] text-left transition-colors"
              style={{
                borderColor: isSelected ? GM_GOLD : "rgba(212, 175, 55, 0.25)",
                background: isSelected ? "rgba(212, 175, 55, 0.1)" : "rgba(0, 0, 0, 0.2)",
                opacity: isDisabled ? 0.55 : 1,
                cursor: rowInteractive ? "pointer" : "default",
              }}
              aria-pressed={rowInteractive ? isSelected : undefined}
              aria-label={`Cuerda ${stringId}`}
            >
              <span
                className="w-6 shrink-0 text-sm font-mono font-medium"
                style={{ color: isSelected ? GM_GOLD : GM_TEXT }}
              >
                {stringId}
              </span>
              <span
                className="flex-1 h-px"
                style={{
                  background: isSelected
                    ? "rgba(212, 175, 55, 0.65)"
                    : "rgba(255, 255, 255, 0.12)",
                }}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
