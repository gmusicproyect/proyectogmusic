import type { ExerciseType } from "../../../services/gmusic-api/types";
import type { FretboardStringId } from "./lesson-fretboard";
import type { LabNote } from "./lab-note";

export interface SafeExerciseOption {
  id: string;
  text: string;
}

export interface SafeExerciseMedia {
  audioUrl?: string;
  imageUrl?: string;
  diagramLabel?: string;
  patternBeats?: string[];
}

export interface TapSequenceBeat {
  stringNumber: number;
  /** Canonical id from stringNumber map (1→e … 6→E). */
  stringId: FretboardStringId;
  label: string;
  stringName: string;
}

/** UI modes the runner interprets from contentPayload.answerInput. */
export type AnswerInputMode = "options" | "fretboard" | "sequence";

/** Binary role: response = interactive attempts; study = inert; none = no fretboard chrome. */
export type FretboardRole = "response" | "study" | "none";

export type ParsedExerciseInteraction =
  | { mode: "mcq" }
  | {
      mode: "tap";
      submissionOptionId: string;
      tapSequence: TapSequenceBeat[];
      tapHeadline: string;
      tapDescription: string;
    }
  | {
      mode: "sequence";
      /** Option ids available to order (same as exercise.options). */
      tokenIds: string[];
    };

export interface ParsedExerciseView {
  id: string;
  type: ExerciseType;
  difficulty: number;
  instruction: string;
  options: SafeExerciseOption[];
  media: SafeExerciseMedia;
  interaction: ParsedExerciseInteraction;
  /** UI-only: from contentPayload.answerInput; default "options". */
  answerInput: AnswerInputMode;
  /** Derived: never response+study at once (GUITARRA-INTERACTIVA-REFERENCIA P4). */
  fretboardRole: FretboardRole;
  /**
   * LabNote[] from adaptPayloadToLabNotes(contentPayload).
   * Empty = free-choice single tap (fretboard) or no recognition sequence.
   */
  labNotes: LabNote[];
  /**
   * Highway/moving stub. Always false while HIGHWAY_FEATURE_ENABLED is off.
   */
  highwayEnabled: boolean;
}

export type ExerciseParseResult =
  | { kind: "supported"; exercise: ParsedExerciseView }
  | { kind: "incompatible"; exerciseId: string; reason: string };

/** Encode ordered ids for selectedAnswer / secureAnswer.correctOptionId (string contract). */
export function encodeSequenceAnswer(orderedIds: readonly string[]): string {
  return JSON.stringify(orderedIds);
}
