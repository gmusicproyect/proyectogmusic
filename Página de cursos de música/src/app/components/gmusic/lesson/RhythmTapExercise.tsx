import { ExPulsoAire } from "../../dashboard/exercises/ExPulsoAire";
import type { ParsedExerciseView } from "./lesson-runner-types";

export interface RhythmTapExerciseProps {
  exercise: ParsedExerciseView;
  disabled?: boolean;
  onComplete: () => void;
}

export function RhythmTapExercise({
  exercise,
  disabled = false,
  onComplete,
}: RhythmTapExerciseProps) {
  if (exercise.interaction.mode !== "tap") {
    return null;
  }

  const { tapHeadline, tapDescription, tapSequence } = exercise.interaction;

  return (
    <ExPulsoAire
      headline={tapHeadline}
      description={tapDescription}
      sequence={tapSequence}
      onComplete={disabled ? () => {} : onComplete}
    />
  );
}
