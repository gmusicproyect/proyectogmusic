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
