import { findForbiddenLessonSessionKey } from "../../../services/gmusic-api/assert-safe-lesson-session";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import type { ExerciseType, PublicExercise } from "../../../services/gmusic-api/types";
import { stringNumberToId } from "./lesson-fretboard";
import type {
  AnswerInputMode,
  ExerciseParseResult,
  FretboardRole,
  ParsedExerciseView,
  SafeExerciseMedia,
  SafeExerciseOption,
  TapSequenceBeat,
} from "./lesson-runner-types";

export const MAX_EXERCISE_OPTIONS = 20;
export const MAX_OPTION_TEXT_LENGTH = 120;
export const MAX_PATTERN_BEATS = 32;
export const MAX_TAP_SEQUENCE = 32;
export const MAX_LABEL_OR_BEAT_LENGTH = 80;
export const MAX_TAP_STRING_NUMBER = 6;

const VALID_EXERCISE_TYPES = new Set<ExerciseType>([
  "IDENTIFY_NOTE",
  "CHORD_SHAPE",
  "EAR_TRAINING",
  "RHYTHM_TAP",
]);

const VALID_ANSWER_INPUT = new Set<AnswerInputMode>(["options", "fretboard", "sequence"]);

export function parseAnswerInput(raw: unknown): AnswerInputMode {
  if (typeof raw === "string" && VALID_ANSWER_INPUT.has(raw as AnswerInputMode)) {
    return raw as AnswerInputMode;
  }
  return "options";
}

/** Resolve P4 binary role. Rejects answerInput fretboard + showFretboard together. */
export function resolveFretboardRole(
  answerInput: AnswerInputMode,
  showFretboard: boolean
): { ok: true; role: FretboardRole } | { ok: false; reason: string } {
  if (answerInput === "fretboard" && showFretboard) {
    return {
      ok: false,
      reason:
        "Diapasón respuesta y estudio no pueden coexistir (answerInput: fretboard + showFretboard).",
    };
  }
  if (answerInput === "fretboard") return { ok: true, role: "response" };
  if (showFretboard) return { ok: true, role: "study" };
  return { ok: true, role: "none" };
}

function incompatible(exerciseId: string, reason: string): ExerciseParseResult {
  return { kind: "incompatible", exerciseId, reason };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && Number.isFinite(value) && value >= 0;
}

function resolveExerciseId(exercise: PublicExercise): string {
  return isNonEmptyString(exercise.id) ? exercise.id.trim() : String(exercise.id ?? "unknown");
}

function parseOptions(
  raw: unknown,
  exerciseId: string,
  options: { requireMinTwo: boolean }
): { ok: true; options: SafeExerciseOption[] } | { ok: false; result: ExerciseParseResult } {
  if (raw == null) {
    if (options.requireMinTwo) {
      return { ok: false, result: incompatible(exerciseId, "options debe ser un array.") };
    }
    return { ok: true, options: [] };
  }
  if (!Array.isArray(raw)) {
    return { ok: false, result: incompatible(exerciseId, "options debe ser un array.") };
  }
  if (options.requireMinTwo && raw.length < 2) {
    return { ok: false, result: incompatible(exerciseId, "Se requieren al menos 2 opciones.") };
  }
  if (raw.length > MAX_EXERCISE_OPTIONS) {
    return { ok: false, result: incompatible(exerciseId, "Demasiadas opciones.") };
  }

  const parsedOptions: SafeExerciseOption[] = [];
  const seenIds = new Set<string>();

  for (const item of raw) {
    if (!isPlainObject(item)) {
      return { ok: false, result: incompatible(exerciseId, "Cada opción debe ser un objeto.") };
    }

    const id = isNonEmptyString(item.id) ? item.id.trim() : "";
    const text = isNonEmptyString(item.text) ? item.text.trim() : "";

    if (!id || !text) {
      return {
        ok: false,
        result: incompatible(exerciseId, "Cada opción requiere id y text no vacíos."),
      };
    }
    if (text.length > MAX_OPTION_TEXT_LENGTH) {
      return { ok: false, result: incompatible(exerciseId, "Texto de opción demasiado largo.") };
    }
    if (seenIds.has(id)) {
      return { ok: false, result: incompatible(exerciseId, "IDs de opción duplicados.") };
    }

    seenIds.add(id);
    parsedOptions.push({ id, text });
  }

  return { ok: true, options: parsedOptions };
}

function parseMedia(
  payload: Record<string, unknown>,
  exerciseId: string
): { ok: true; media: SafeExerciseMedia } | { ok: false; result: ExerciseParseResult } {
  const media: SafeExerciseMedia = {};

  if ("audioUrl" in payload && payload.audioUrl != null) {
    if (!isSafeHttpUrl(payload.audioUrl)) {
      return { ok: false, result: incompatible(exerciseId, "audioUrl inválida.") };
    }
    media.audioUrl = payload.audioUrl;
  }

  if ("imageUrl" in payload && payload.imageUrl != null) {
    if (!isSafeHttpUrl(payload.imageUrl)) {
      return { ok: false, result: incompatible(exerciseId, "imageUrl inválida.") };
    }
    media.imageUrl = payload.imageUrl;
  }

  if ("diagramLabel" in payload && payload.diagramLabel != null) {
    const label = isNonEmptyString(payload.diagramLabel) ? payload.diagramLabel.trim() : "";
    if (!label) {
      return { ok: false, result: incompatible(exerciseId, "diagramLabel inválido.") };
    }
    if (label.length > MAX_LABEL_OR_BEAT_LENGTH) {
      return { ok: false, result: incompatible(exerciseId, "diagramLabel demasiado largo.") };
    }
    media.diagramLabel = label;
  }

  if ("patternBeats" in payload && payload.patternBeats != null) {
    if (!Array.isArray(payload.patternBeats)) {
      return { ok: false, result: incompatible(exerciseId, "patternBeats debe ser un array.") };
    }
    if (payload.patternBeats.length > MAX_PATTERN_BEATS) {
      return { ok: false, result: incompatible(exerciseId, "Demasiados patternBeats.") };
    }

    const beats: string[] = [];
    for (const beat of payload.patternBeats) {
      const value = isNonEmptyString(beat) ? beat.trim() : "";
      if (!value) {
        return {
          ok: false,
          result: incompatible(exerciseId, "patternBeats contiene valores inválidos."),
        };
      }
      if (value.length > MAX_LABEL_OR_BEAT_LENGTH) {
        return { ok: false, result: incompatible(exerciseId, "patternBeat demasiado largo.") };
      }
      beats.push(value);
    }
    media.patternBeats = beats;
  }

  return { ok: true, media };
}

function parseTapSequence(
  raw: unknown,
  exerciseId: string
): { ok: true; beats: TapSequenceBeat[] } | { ok: false; result: ExerciseParseResult } {
  if (!Array.isArray(raw)) {
    return { ok: false, result: incompatible(exerciseId, "tapSequence debe ser un array.") };
  }
  if (raw.length === 0) {
    return { ok: false, result: incompatible(exerciseId, "tapSequence no puede estar vacío.") };
  }
  if (raw.length > MAX_TAP_SEQUENCE) {
    return { ok: false, result: incompatible(exerciseId, "Demasiados beats en tapSequence.") };
  }

  const beats: TapSequenceBeat[] = [];

  for (const item of raw) {
    if (!isPlainObject(item)) {
      return { ok: false, result: incompatible(exerciseId, "Cada beat de tapSequence debe ser un objeto.") };
    }

    const stringNumber = item.stringNumber;
    const label = isNonEmptyString(item.label) ? item.label.trim() : "";
    const stringName = isNonEmptyString(item.stringName) ? item.stringName.trim() : "";

    if (
      !isNonNegativeInteger(stringNumber) ||
      stringNumber < 1 ||
      stringNumber > MAX_TAP_STRING_NUMBER
    ) {
      return {
        ok: false,
        result: incompatible(exerciseId, "stringNumber inválido en tapSequence."),
      };
    }
    const stringId = stringNumberToId(stringNumber);
    if (!stringId) {
      return {
        ok: false,
        result: incompatible(exerciseId, "stringNumber fuera del mapa canónico 1–6."),
      };
    }
    if (!label || label.length > MAX_LABEL_OR_BEAT_LENGTH) {
      return { ok: false, result: incompatible(exerciseId, "label inválido en tapSequence.") };
    }
    if (!stringName || stringName.length > MAX_LABEL_OR_BEAT_LENGTH) {
      return { ok: false, result: incompatible(exerciseId, "stringName inválido en tapSequence.") };
    }

    beats.push({ stringNumber, stringId, label, stringName });
  }

  return { ok: true, beats };
}

function parseTapInteraction(
  payload: Record<string, unknown>,
  exerciseId: string,
  instruction: string
):
  | { ok: true; interaction: ParsedExerciseView["interaction"] }
  | { ok: false; result: ExerciseParseResult } {
  if (!("tapSequence" in payload) || payload.tapSequence == null) {
    return { ok: false, result: incompatible(exerciseId, "tapSequence requerido.") };
  }

  const sequenceResult = parseTapSequence(payload.tapSequence, exerciseId);
  if (!sequenceResult.ok) return sequenceResult;

  const submissionOptionId = isNonEmptyString(payload.submissionOptionId)
    ? payload.submissionOptionId.trim()
    : "";
  if (!submissionOptionId || submissionOptionId.length > MAX_LABEL_OR_BEAT_LENGTH) {
    return {
      ok: false,
      result: incompatible(exerciseId, "submissionOptionId inválido."),
    };
  }

  const tapHeadline = isNonEmptyString(payload.tapHeadline)
    ? payload.tapHeadline.trim()
    : instruction;
  const tapDescription = isNonEmptyString(payload.tapDescription)
    ? payload.tapDescription.trim()
    : instruction;

  if (tapHeadline.length > 200 || tapDescription.length > 400) {
    return { ok: false, result: incompatible(exerciseId, "Texto TAP demasiado largo.") };
  }

  return {
    ok: true,
    interaction: {
      mode: "tap",
      submissionOptionId,
      tapSequence: sequenceResult.beats,
      tapHeadline,
      tapDescription,
    },
  };
}

export function parsePublicExercise(exercise: PublicExercise): ExerciseParseResult {
  const forbiddenKey = findForbiddenLessonSessionKey(exercise);
  if (forbiddenKey) {
    throw new GmusicApiError(
      `El ejercicio contiene el campo prohibido "${forbiddenKey}".`,
      200,
      "UNSAFE_API_RESPONSE"
    );
  }

  const exerciseId = resolveExerciseId(exercise);

  if (!isNonEmptyString(exercise.id)) {
    return incompatible(exerciseId, "id de ejercicio inválido.");
  }

  if (!VALID_EXERCISE_TYPES.has(exercise.type)) {
    return incompatible(exerciseId, "Tipo de ejercicio no soportado.");
  }

  if (!isNonEmptyString(exercise.instruction)) {
    return incompatible(exerciseId, "instruction inválida.");
  }

  if (!isNonNegativeInteger(exercise.difficulty)) {
    return incompatible(exerciseId, "difficulty inválida.");
  }

  if (!isPlainObject(exercise.contentPayload)) {
    return incompatible(exerciseId, "contentPayload debe ser un objeto.");
  }

  const payload = exercise.contentPayload;
  const answerInput = parseAnswerInput(payload.answerInput);
  const showFretboard = payload.showFretboard === true;
  const roleResult = resolveFretboardRole(answerInput, showFretboard);
  if (!roleResult.ok) {
    return incompatible(exerciseId.trim(), roleResult.reason);
  }
  const fretboardRole = roleResult.role;

  if (exercise.type === "RHYTHM_TAP" && "tapSequence" in payload && payload.tapSequence != null) {
    const tapResult = parseTapInteraction(payload, exerciseId.trim(), exercise.instruction.trim());
    if (!tapResult.ok) return tapResult.result;

    const mediaResult = parseMedia(payload, exerciseId.trim());
    if (!mediaResult.ok) return mediaResult.result;

    const parsed: ParsedExerciseView = {
      id: exerciseId.trim(),
      type: exercise.type,
      difficulty: exercise.difficulty,
      instruction: exercise.instruction.trim(),
      options: [],
      media: mediaResult.media,
      interaction: tapResult.interaction,
      answerInput,
      fretboardRole,
    };

    return { kind: "supported", exercise: parsed };
  }

  const optionsResult = parseOptions(payload.options, exerciseId.trim(), {
    requireMinTwo: answerInput !== "fretboard",
  });
  if (!optionsResult.ok) return optionsResult.result;

  const mediaResult = parseMedia(payload, exerciseId.trim());
  if (!mediaResult.ok) return mediaResult.result;

  if (answerInput === "sequence") {
    if (optionsResult.options.length < 2) {
      return incompatible(exerciseId.trim(), "sequence requiere al menos 2 opciones.");
    }
    const parsed: ParsedExerciseView = {
      id: exerciseId.trim(),
      type: exercise.type,
      difficulty: exercise.difficulty,
      instruction: exercise.instruction.trim(),
      options: optionsResult.options,
      media: mediaResult.media,
      interaction: {
        mode: "sequence",
        tokenIds: optionsResult.options.map((option) => option.id),
      },
      answerInput,
      fretboardRole,
    };
    return { kind: "supported", exercise: parsed };
  }

  const parsed: ParsedExerciseView = {
    id: exerciseId.trim(),
    type: exercise.type,
    difficulty: exercise.difficulty,
    instruction: exercise.instruction.trim(),
    options: optionsResult.options,
    media: mediaResult.media,
    interaction: { mode: "mcq" },
    answerInput,
    fretboardRole,
  };

  return { kind: "supported", exercise: parsed };
}
