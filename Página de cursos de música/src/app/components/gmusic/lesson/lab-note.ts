/**
 * LabNote — contrato visual de reconocimiento (patrón Lab, Clean Room).
 * No importa código del volumen Laboratorio.
 */

export type LabNote = {
  id: number;
  time: number;
  /** 1 = e aguda (arriba) … 6 = E grave (abajo). */
  string: number;
  /** 0 = al aire. */
  fret: number;
  duration: number | null;
  type: string;
  isRest: boolean;
};

/** Raw note shape accepted before normalize (Lab / contentPayload.notes). */
export type RawLabNoteLike = {
  time?: unknown;
  string?: unknown;
  fret?: unknown;
  duration?: unknown;
  type?: unknown;
  isRest?: unknown;
};

/**
 * Highway / moving tempo+hit-line. Stub OFF for T-PRACTICE-CANVAS-01.
 * Payload may request moving; product ignores until phase 2.
 */
export const HIGHWAY_FEATURE_ENABLED = false;

export const LAB_STRING_COUNT = 6;

/** Normalize raw notes → LabNote[] (defaults from Juan extract). */
export function normalizeRawNotes(rawNotes: readonly RawLabNoteLike[]): LabNote[] {
  return rawNotes.map((n, i) => {
    const fret = Number(n.fret) || 0;
    return {
      id: i,
      time: Number(n.time) || 0,
      string: Number(n.string) || 1,
      fret,
      duration: n.duration != null ? Number(n.duration) : null,
      type: typeof n.type === "string" && n.type.trim() ? n.type : fret === 0 ? "open" : "normal",
      isRest: Boolean(n.isRest),
    };
  });
}

/** Playable notes in order (skips rests). */
export function playableLabNotes(notes: readonly LabNote[]): LabNote[] {
  return notes.filter((note) => !note.isRest);
}

/**
 * Layout: i=0 → string 1 (top); i=5 → string 6 (bottom).
 * getStringY(stringNum) → stringY[stringNum - 1]
 */
export function computeStringYPositions(
  height: number,
  paddingRatio = 0.12
): number[] {
  const pad = height * paddingRatio;
  const usable = Math.max(1, height - pad * 2);
  const step = usable / (LAB_STRING_COUNT - 1 || 1);
  const top = pad;
  return Array.from({ length: LAB_STRING_COUNT }, (_, i) => top + i * step);
}

export function getStringY(stringNum: number, stringY: readonly number[]): number {
  const index = stringNum - 1;
  if (index < 0 || index >= stringY.length) {
    return stringY[0] ?? 0;
  }
  return stringY[index] ?? 0;
}

export function clampStringNumber(value: number): number | null {
  if (!Number.isInteger(value) || value < 1 || value > LAB_STRING_COUNT) {
    return null;
  }
  return value;
}
