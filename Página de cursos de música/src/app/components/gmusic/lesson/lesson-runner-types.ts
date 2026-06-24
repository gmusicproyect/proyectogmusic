import type { ExerciseType } from "../../../services/gmusic-api/types";

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
  label: string;
  stringName: string;
}

export type ParsedExerciseInteraction =
  | { mode: "mcq" }
  | {
      mode: "tap";
      submissionOptionId: string;
      tapSequence: TapSequenceBeat[];
      tapHeadline: string;
      tapDescription: string;
    };

export interface ParsedExerciseView {
  id: string;
  type: ExerciseType;
  difficulty: number;
  instruction: string;
  options: SafeExerciseOption[];
  media: SafeExerciseMedia;
  interaction: ParsedExerciseInteraction;
}

export type ExerciseParseResult =
  | { kind: "supported"; exercise: ParsedExerciseView }
  | { kind: "incompatible"; exerciseId: string; reason: string };
