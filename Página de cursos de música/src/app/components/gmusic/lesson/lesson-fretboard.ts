/** Case-sensitive string ids per T-UX-LESSON-01: "E" (6th) ≠ "e" (1st). */
export const FRETBOARD_STRING_IDS = ["E", "A", "D", "G", "B", "e"] as const;

export type FretboardStringId = (typeof FRETBOARD_STRING_IDS)[number];

/** Visual order: high e at top → low E at bottom (player perspective). */
export const FRETBOARD_DISPLAY_ORDER: readonly FretboardStringId[] = [
  "e",
  "B",
  "G",
  "D",
  "A",
  "E",
];

/** Grosor visual por cuerda (6ª gruesa → 1ª fina), ref. Paquete A Kimi v2. */
export const FRETBOARD_STRING_THICKNESS_PX: Readonly<Record<FretboardStringId, number>> = {
  e: 2,
  B: 2.5,
  G: 3,
  D: 4,
  A: 5,
  E: 6,
};

/** Paquete A — 6 filas × 34px + padding vertical 12px×2 ≈ 228px (sin hint). */
export const FRETBOARD_ROW_HEIGHT_PX = 34;
export const FRETBOARD_PADDING_Y_PX = 24;
export const FRETBOARD_ROWS_BLOCK_HEIGHT_PX =
  FRETBOARD_DISPLAY_ORDER.length * FRETBOARD_ROW_HEIGHT_PX;
export const FRETBOARD_HINT_HEIGHT_PX = 28;
export const FRETBOARD_COMPACT_HEIGHT_PX = FRETBOARD_ROWS_BLOCK_HEIGHT_PX + FRETBOARD_PADDING_Y_PX;
export const FRETBOARD_COMPACT_HEIGHT_WITH_HINT_PX =
  FRETBOARD_COMPACT_HEIGHT_PX + FRETBOARD_HINT_HEIGHT_PX;

/** Modo inmersivo — madera de borde a borde; filas siguen compactas. */
export const FRETBOARD_IMMERSIVE_PADDING_Y_PX = 48;
export const FRETBOARD_IMMERSIVE_MIN_HEIGHT_PX =
  FRETBOARD_ROWS_BLOCK_HEIGHT_PX + FRETBOARD_IMMERSIVE_PADDING_Y_PX * 2;
export const FRETBOARD_IMMERSIVE_HEIGHT_WITH_HINT_PX =
  FRETBOARD_IMMERSIVE_MIN_HEIGHT_PX + FRETBOARD_HINT_HEIGHT_PX;

const FRETBOARD_STRING_ID_SET = new Set<string>(FRETBOARD_STRING_IDS);

export function isFretboardStringId(value: string): value is FretboardStringId {
  return FRETBOARD_STRING_ID_SET.has(value);
}

export function areDistinctFretboardStringIds(
  left: FretboardStringId,
  right: FretboardStringId
): boolean {
  return left !== right;
}

/** Paquete A: si todas las opciones son ids de cuerda, el diapasón responde al toque. */
export function exerciseOptionsAreFretboardStrings(
  options: readonly { id: string; text: string }[]
): boolean {
  return options.length > 0 && options.every((option) => isFretboardStringId(option.text.trim()));
}
