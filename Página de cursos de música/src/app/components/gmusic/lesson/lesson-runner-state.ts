import type { ParsedExerciseView } from "./lesson-runner-types";

export const MAX_RESPONSE_TIME_MS = 3 * 60 * 60 * 1000;

export type LessonRunnerStatus = "ready" | "finished" | "expired";

export interface RunnerAttemptDraft {
  microExerciseId: string;
  selectedAnswer: string;
  responseTimeMs: number;
}

export interface LessonRunnerState {
  exercises: ParsedExerciseView[];
  currentIndex: number;
  selectedOptionId: string | null;
  exerciseStartedAtMs: number;
  attemptsDraft: RunnerAttemptDraft[];
  status: LessonRunnerStatus;
}

export type LessonRunnerAction =
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "NEXT_EXERCISE"; nowMs: number }
  | { type: "COMPLETE_TAP"; nowMs: number }
  | { type: "MARK_EXPIRED" }
  | { type: "RESET"; exercises: ParsedExerciseView[]; startedAtMs: number };

function normalizeTimestampMs(timestampMs: number): number {
  return Number.isFinite(timestampMs) ? timestampMs : 0;
}

export function createInitialLessonRunnerState(
  exercises: ParsedExerciseView[],
  startedAtMs: number
): LessonRunnerState {
  const isEmpty = exercises.length === 0;

  return {
    exercises,
    currentIndex: 0,
    selectedOptionId: null,
    exerciseStartedAtMs: normalizeTimestampMs(startedAtMs),
    attemptsDraft: [],
    status: isEmpty ? "finished" : "ready",
  };
}

function getCurrentExercise(state: LessonRunnerState): ParsedExerciseView | null {
  if (state.status !== "ready") {
    return null;
  }

  return state.exercises[state.currentIndex] ?? null;
}

function isValidOptionForCurrentExercise(
  state: LessonRunnerState,
  optionId: string
): boolean {
  const exercise = getCurrentExercise(state);
  if (!exercise) {
    return false;
  }

  return exercise.options.some((option) => option.id === optionId);
}

function hasAttemptForExercise(
  state: LessonRunnerState,
  microExerciseId: string
): boolean {
  return state.attemptsDraft.some(
    (attempt) => attempt.microExerciseId === microExerciseId
  );
}

export function computeResponseTimeMs(
  exerciseStartedAtMs: number,
  nowMs: number
): number {
  if (!Number.isFinite(exerciseStartedAtMs) || !Number.isFinite(nowMs)) {
    return 0;
  }

  const elapsed = Math.floor(nowMs - exerciseStartedAtMs);
  const nonNegative = Math.max(0, elapsed);
  return Math.min(nonNegative, MAX_RESPONSE_TIME_MS);
}

function selectOption(
  state: LessonRunnerState,
  optionId: string
): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  if (!isValidOptionForCurrentExercise(state, optionId)) {
    return state;
  }

  return {
    ...state,
    selectedOptionId: optionId,
  };
}

function advanceAfterAttempt(
  state: LessonRunnerState,
  attempt: RunnerAttemptDraft,
  normalizedNowMs: number
): LessonRunnerState {
  const attemptsDraft = [...state.attemptsDraft, attempt];
  const isLastExercise = state.currentIndex >= state.exercises.length - 1;

  if (isLastExercise) {
    return {
      ...state,
      selectedOptionId: null,
      attemptsDraft,
      status: "finished",
    };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    selectedOptionId: null,
    exerciseStartedAtMs: normalizedNowMs,
    attemptsDraft,
  };
}

function nextExercise(
  state: LessonRunnerState,
  nowMs: number
): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  const currentExercise = getCurrentExercise(state);
  if (!currentExercise || state.selectedOptionId === null) {
    return state;
  }

  if (hasAttemptForExercise(state, currentExercise.id)) {
    return state;
  }

  const normalizedNowMs = normalizeTimestampMs(nowMs);
  const attempt: RunnerAttemptDraft = {
    microExerciseId: currentExercise.id,
    selectedAnswer: state.selectedOptionId,
    responseTimeMs: computeResponseTimeMs(state.exerciseStartedAtMs, normalizedNowMs),
  };

  return advanceAfterAttempt(state, attempt, normalizedNowMs);
}

function completeTap(
  state: LessonRunnerState,
  nowMs: number
): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  const currentExercise = getCurrentExercise(state);
  if (!currentExercise || currentExercise.interaction.mode !== "tap") {
    return state;
  }

  if (hasAttemptForExercise(state, currentExercise.id)) {
    return state;
  }

  const normalizedNowMs = normalizeTimestampMs(nowMs);
  const attempt: RunnerAttemptDraft = {
    microExerciseId: currentExercise.id,
    selectedAnswer: currentExercise.interaction.submissionOptionId,
    responseTimeMs: computeResponseTimeMs(state.exerciseStartedAtMs, normalizedNowMs),
  };

  return advanceAfterAttempt(state, attempt, normalizedNowMs);
}

function markExpired(state: LessonRunnerState): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  return {
    ...state,
    selectedOptionId: null,
    status: "expired",
  };
}

export function lessonRunnerReducer(
  state: LessonRunnerState,
  action: LessonRunnerAction
): LessonRunnerState {
  switch (action.type) {
    case "SELECT_OPTION":
      return selectOption(state, action.optionId);
    case "NEXT_EXERCISE":
      return nextExercise(state, action.nowMs);
    case "COMPLETE_TAP":
      return completeTap(state, action.nowMs);
    case "MARK_EXPIRED":
      return markExpired(state);
    case "RESET":
      return createInitialLessonRunnerState(action.exercises, action.startedAtMs);
    default:
      return state;
  }
}
