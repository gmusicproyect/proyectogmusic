import {
  HIGHWAY_FEATURE_ENABLED,
  normalizeRawNotes,
  type LabNote,
  type RawLabNoteLike,
} from "./lab-note";

/**
 * Result of bridging product contentPayload → LabNote[].
 * See ADAPTER.md for field mapping.
 */
export type AdaptPayloadResult = {
  notes: LabNote[];
  /**
   * True only if payload asks for moving/highway AND the product feature flag is on.
   * Today HIGHWAY_FEATURE_ENABLED is false → always false (stub).
   */
  highwayEnabled: boolean;
  /** Payload intent (informational); UI ignores moving until flag on. */
  stageType: string | null;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isRawNoteLike(value: unknown): value is RawLabNoteLike {
  return isPlainObject(value);
}

function collectNotesFromPatterns(patterns: unknown): RawLabNoteLike[] {
  if (!Array.isArray(patterns)) return [];
  const collected: RawLabNoteLike[] = [];
  for (const pattern of patterns) {
    if (!isPlainObject(pattern) || !Array.isArray(pattern.notes)) continue;
    for (const note of pattern.notes) {
      if (isRawNoteLike(note)) collected.push(note);
    }
  }
  return collected;
}

/**
 * Map existing RHYTHM_TAP tapSequence beats → open-string LabNotes.
 * Uses stringNumber (1–6); fret defaults to 0; time = index.
 */
function collectNotesFromTapSequence(tapSequence: unknown): RawLabNoteLike[] {
  if (!Array.isArray(tapSequence)) return [];
  const collected: RawLabNoteLike[] = [];
  for (let i = 0; i < tapSequence.length; i += 1) {
    const beat = tapSequence[i];
    if (!isPlainObject(beat)) continue;
    const stringNumber = beat.stringNumber;
    if (typeof stringNumber !== "number" || !Number.isInteger(stringNumber)) continue;
    collected.push({
      time: i,
      string: stringNumber,
      fret: 0,
      duration: null,
      type: "open",
      isRest: false,
    });
  }
  return collected;
}

function resolveStageType(payload: Record<string, unknown>): string | null {
  if (typeof payload.stageType === "string" && payload.stageType.trim()) {
    return payload.stageType.trim();
  }
  if (typeof payload.visualMode === "string" && payload.visualMode.trim()) {
    return payload.visualMode.trim();
  }
  return null;
}

function payloadRequestsHighway(
  payload: Record<string, unknown>,
  stageType: string | null
): boolean {
  if (payload.highwayEnabled === true) return true;
  if (stageType === "moving" || stageType === "highway") return true;
  return false;
}

/**
 * Bridge product contentPayload → LabNote[].
 *
 * Priority (first non-empty wins):
 * 1. `notes[]` — Lab contract
 * 2. `patterns[].notes` — Lab stage patterns flattened
 * 3. `tapSequence[]` — existing product rhythm beats → open notes
 *
 * Does **not** invent notes from `options` / `answerInput` / `showFretboard`.
 * Empty array = free-choice fretboard (single tap) or no recognition sequence.
 */
export function adaptPayloadToLabNotes(contentPayload: unknown): AdaptPayloadResult {
  if (!isPlainObject(contentPayload)) {
    return { notes: [], highwayEnabled: false, stageType: null };
  }

  const stageType = resolveStageType(contentPayload);
  const wantsHighway = payloadRequestsHighway(contentPayload, stageType);
  const highwayEnabled = HIGHWAY_FEATURE_ENABLED && wantsHighway;

  let raw: RawLabNoteLike[] = [];

  if (Array.isArray(contentPayload.notes) && contentPayload.notes.length > 0) {
    raw = contentPayload.notes.filter(isRawNoteLike);
  } else {
    const fromPatterns = collectNotesFromPatterns(contentPayload.patterns);
    if (fromPatterns.length > 0) {
      raw = fromPatterns;
    } else {
      raw = collectNotesFromTapSequence(contentPayload.tapSequence);
    }
  }

  return {
    notes: normalizeRawNotes(raw),
    highwayEnabled,
    stageType,
  };
}
