import type { RunnerAttemptDraft } from "../lesson/lesson-runner-state";
import type { CompleteLessonSessionRequest } from "../../../services/gmusic-api/types";

export function mapRunnerAttemptsToCompleteRequest(
  attempts: RunnerAttemptDraft[]
): CompleteLessonSessionRequest {
  return {
    attempts: attempts.map((attempt) => ({
      microExerciseId: attempt.microExerciseId,
      selectedAnswer: attempt.selectedAnswer,
      responseTimeMs: attempt.responseTimeMs,
    })),
  };
}
