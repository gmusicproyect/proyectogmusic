import "./lesson-fretboard.css";
import {
  FRETBOARD_COMPACT_HEIGHT_PX,
  FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX,
  FRETBOARD_DISPLAY_ORDER,
  FRETBOARD_IMMERSIVE_HEIGHT_WITH_HINT_PX,
  FRETBOARD_IMMERSIVE_MIN_HEIGHT_PX,
  FRETBOARD_ROW_HEIGHT_PX,
  FRETBOARD_ROWS_BLOCK_HEIGHT_PX,
  FRETBOARD_STRING_THICKNESS_PX,
  type FretboardStringId,
} from "./lesson-fretboard";
import { usePathPracticaLayout } from "../path/path-practica-layout";

export {
  FRETBOARD_COMPACT_HEIGHT_PX,
  FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX,
  FRETBOARD_IMMERSIVE_HEIGHT_WITH_HINT_PX,
  FRETBOARD_IMMERSIVE_MIN_HEIGHT_PX,
  FRETBOARD_ROW_HEIGHT_PX,
  FRETBOARD_ROWS_BLOCK_HEIGHT_PX,
  FRETBOARD_STRING_THICKNESS_PX,
} from "./lesson-fretboard";

const CUERDA_ROW_STYLE = {
  height: FRETBOARD_ROW_HEIGHT_PX,
  minHeight: FRETBOARD_ROW_HEIGHT_PX,
  maxHeight: FRETBOARD_ROW_HEIGHT_PX,
  flex: "none",
} as const;

const INLAY_DOT_LEFT = [
  "calc(40px + (100% - 56px) * 0.5)",
  "calc(40px + (100% - 56px) * 0.9)",
] as const;

export interface LessonFretboardProps {
  selectedStringId: string | null;
  interactive: boolean;
  disabled?: boolean;
  /** @deprecated Se ignora. */
  variant?: "card" | "compact";
  /** @deprecated Se ignora. */
  muted?: boolean;
  onSelectStringId?: (stringId: FretboardStringId) => void;
}

export function LessonFretboard({
  selectedStringId,
  interactive,
  disabled = false,
  onSelectStringId,
}: LessonFretboardProps) {
  const layoutMode = usePathPracticaLayout();
  const immersive = layoutMode === "immersive";
  const isDisabled = disabled || !interactive;
  const showHint = interactive && !disabled;
  const inlineHeight = showHint
    ? FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX
    : FRETBOARD_COMPACT_HEIGHT_PX;
  const immersiveMinHeight = showHint
    ? FRETBOARD_IMMERSIVE_HEIGHT_WITH_HINT_PX
    : FRETBOARD_IMMERSIVE_MIN_HEIGHT_PX;

  const diapasonClassName = immersive
    ? "lesson-fretboard diapason diapason--immersive"
    : "lesson-fretboard diapason";

  const diapasonStyle = immersive
    ? ({
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        width: "100%",
        minHeight: immersiveMinHeight,
        flex: "1 1 auto",
      } as const)
    : ({
        display: "block",
        width: "100%",
        height: inlineHeight,
        minHeight: inlineHeight,
        maxHeight: inlineHeight,
        flex: "none",
        alignSelf: "stretch",
      } as const);

  const stringRows = FRETBOARD_DISPLAY_ORDER.map((stringId) => {
    const isSelected = selectedStringId === stringId;
    const rowInteractive = interactive && !disabled;
    const className = ["cuerda", isSelected ? "marcada" : "", rowInteractive && isSelected ? "pick" : ""]
      .filter(Boolean)
      .join(" ");
    const lineHeight = FRETBOARD_STRING_THICKNESS_PX[stringId];

    const rowStyle = immersive ? undefined : CUERDA_ROW_STYLE;

    if (rowInteractive) {
      return (
        <button
          key={stringId}
          type="button"
          className={className}
          style={rowStyle}
          data-string={stringId}
          disabled={isDisabled}
          onClick={() => onSelectStringId?.(stringId)}
          aria-pressed={isSelected}
          aria-label={`Cuerda ${stringId}`}
        >
          <span className="nombre">{stringId}</span>
          <span className="linea" style={{ height: lineHeight }} aria-hidden="true" />
        </button>
      );
    }

    return (
      <div key={stringId} className={className} style={rowStyle} data-string={stringId}>
        <span className="nombre">{stringId}</span>
        <span className="linea" style={{ height: lineHeight }} aria-hidden="true" />
      </div>
    );
  });

  return (
    <div
      className={diapasonClassName}
      style={diapasonStyle}
      role="group"
      aria-label="Diapasón de guitarra"
    >
      <div
        className="trastes"
        style={immersive ? undefined : { height: FRETBOARD_ROWS_BLOCK_HEIGHT_PX }}
        aria-hidden="true"
      />
      {INLAY_DOT_LEFT.map((left) => (
        <div key={left} className="punto" style={{ left }} aria-hidden="true" />
      ))}

      <div
        className="lesson-fretboard__cuerdas"
        style={
          immersive
            ? undefined
            : { height: FRETBOARD_ROWS_BLOCK_HEIGHT_PX }
        }
      >
        {stringRows}
      </div>

      {showHint && !immersive ? (
        <p className="lesson-fretboard__hint">Toca la cuerda en pantalla para responder.</p>
      ) : null}
    </div>
  );
}
