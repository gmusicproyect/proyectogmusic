import { isFretboardStringId } from "./lesson-fretboard";
import {
  encodeSequenceAnswer,
  type ParsedExerciseView,
} from "./lesson-runner-types";

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
  /** Ordered option ids while answering answerInput: "sequence". */
  sequenceDraft: string[];
  exerciseStartedAtMs: number;
  attemptsDraft: RunnerAttemptDraft[];
  status: LessonRunnerStatus;
}

export type LessonRunnerAction =
  | { type: "SELECT_OPTION"; optionId: string }
  | { type: "SELECT_FRETBOARD_STRING"; stringId: string; nowMs: number }
  | { type: "SEQUENCE_APPEND"; optionId: string }
  | { type: "SEQUENCE_REMOVE_LAST" }
  | { type: "SEQUENCE_CLEAR" }
  | { type: "CONFIRM_SEQUENCE"; nowMs: number }
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
    sequenceDraft: [],
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

  if (exercise.answerInput === "fretboard" || exercise.answerInput === "sequence") {
    return false;
  }

  return exercise.options.some((option) => option.id === optionId);
}

function isValidFretboardSelectionForCurrentExercise(
  state: LessonRunnerState,
  stringId: string
): boolean {
  const exercise = getCurrentExercise(state);
  if (!exercise || exercise.answerInput !== "fretboard") {
    return false;
  }
  // P4: study fretboard never records attempts
  if (exercise.fretboardRole !== "response") {
    return false;
  }

  return isFretboardStringId(stringId);
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
      sequenceDraft: [],
      attemptsDraft,
      status: "finished",
    };
  }

  return {
    ...state,
    currentIndex: state.currentIndex + 1,
    selectedOptionId: null,
    sequenceDraft: [],
    exerciseStartedAtMs: normalizedNowMs,
    attemptsDraft,
  };
}

function selectFretboardString(
  state: LessonRunnerState,
  stringId: string,
  nowMs: number
): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  const currentExercise = getCurrentExercise(state);
  if (!currentExercise || !isValidFretboardSelectionForCurrentExercise(state, stringId)) {
    return state;
  }

  if (hasAttemptForExercise(state, currentExercise.id)) {
    return state;
  }

  const normalizedNowMs = normalizeTimestampMs(nowMs);
  const attempt: RunnerAttemptDraft = {
    microExerciseId: currentExercise.id,
    selectedAnswer: stringId,
    responseTimeMs: computeResponseTimeMs(state.exerciseStartedAtMs, normalizedNowMs),
  };

  return advanceAfterAttempt(
    { ...state, selectedOptionId: stringId },
    attempt,
    normalizedNowMs
  );
}

function sequenceAppend(state: LessonRunnerState, optionId: string): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  const currentExercise = getCurrentExercise(state);
  if (!currentExercise || currentExercise.answerInput !== "sequence") {
    return state;
  }
  if (currentExercise.interaction.mode !== "sequence") {
    return state;
  }
  if (!currentExercise.interaction.tokenIds.includes(optionId)) {
    return state;
  }
  if (state.sequenceDraft.includes(optionId)) {
    return state;
  }
  if (state.sequenceDraft.length >= currentExercise.interaction.tokenIds.length) {
    return state;
  }

  return {
    ...state,
    sequenceDraft: [...state.sequenceDraft, optionId],
  };
}

function sequenceRemoveLast(state: LessonRunnerState): LessonRunnerState {
  if (state.status !== "ready" || state.sequenceDraft.length === 0) {
    return state;
  }
  return {
    ...state,
    sequenceDraft: state.sequenceDraft.slice(0, -1),
  };
}

function sequenceClear(state: LessonRunnerState): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }
  return { ...state, sequenceDraft: [] };
}

function confirmSequence(state: LessonRunnerState, nowMs: number): LessonRunnerState {
  if (state.status !== "ready") {
    return state;
  }

  const currentExercise = getCurrentExercise(state);
  if (!currentExercise || currentExercise.answerInput !== "sequence") {
    return state;
  }
  if (currentExercise.interaction.mode !== "sequence") {
    return state;
  }
  if (hasAttemptForExercise(state, currentExercise.id)) {
    return state;
  }

  const expectedCount = currentExercise.interaction.tokenIds.length;
  if (state.sequenceDraft.length !== expectedCount) {
    return state;
  }

  const normalizedNowMs = normalizeTimestampMs(nowMs);
  const attempt: RunnerAttemptDraft = {
    microExerciseId: currentExercise.id,
    selectedAnswer: encodeSequenceAnswer(state.sequenceDraft),
    responseTimeMs: computeResponseTimeMs(state.exerciseStartedAtMs, normalizedNowMs),
  };

  return advanceAfterAttempt(state, attempt, normalizedNowMs);
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

  if (currentExercise.answerInput === "sequence" || currentExercise.answerInput === "fretboard") {
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
    sequenceDraft: [],
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
    case "SELECT_FRETBOARD_STRING":
      return selectFretboardString(state, action.stringId, action.nowMs);
    case "SEQUENCE_APPEND":
      return sequenceAppend(state, action.optionId);
    case "SEQUENCE_REMOVE_LAST":
      return sequenceRemoveLast(state);
    case "SEQUENCE_CLEAR":
      return sequenceClear(state);
    case "CONFIRM_SEQUENCE":
      return confirmSequence(state, action.nowMs);
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
