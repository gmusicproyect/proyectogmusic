import { useCallback, useEffect, useReducer, useRef } from "react";
import type { ParsedExerciseView } from "./lesson-runner-types";
import {
  createInitialLessonRunnerState,
  lessonRunnerReducer,
  type LessonRunnerAction,
  type LessonRunnerState,
  type LessonRunnerStatus,
} from "./lesson-runner-state";

export interface UseLessonRunnerOptions {
  exercises: ParsedExerciseView[];
  expiresAt: string;
  now?: () => number;
}

export interface LessonRunnerInitInput {
  exercises: ParsedExerciseView[];
  expiresAt: string;
  nowMs: number;
}

type LessonRunnerReducerAction =
  | LessonRunnerAction
  | {
      type: "REINIT";
      exercises: ParsedExerciseView[];
      expiresAt: string;
      nowMs: number;
    };

export function parseExpiresAtMs(expiresAt: string): number | null {
  const parsed = Date.parse(expiresAt);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isSessionExpired(expiresAtMs: number | null, nowMs: number): boolean {
  if (expiresAtMs === null || !Number.isFinite(nowMs)) {
    return true;
  }

  return nowMs >= expiresAtMs;
}

export function shouldStartLessonRunnerExpired(
  expiresAt: string,
  nowMs: number
): boolean {
  if (!Number.isFinite(nowMs)) {
    return true;
  }

  const expiresAtMs = parseExpiresAtMs(expiresAt);
  return isSessionExpired(expiresAtMs, nowMs);
}

export function createLessonRunnerInitialState(
  exercises: ParsedExerciseView[],
  expiresAt: string,
  nowMs: number
): LessonRunnerState {
  const startedAtMs = Number.isFinite(nowMs) ? nowMs : 0;
  let state = createInitialLessonRunnerState(exercises, startedAtMs);

  if (shouldStartLessonRunnerExpired(expiresAt, nowMs) && state.status === "ready") {
    state = lessonRunnerReducer(state, { type: "MARK_EXPIRED" });
  }

  return state;
}

export function resolveExpiryDispatch(
  expiresAt: string,
  nowMs: number,
  status: LessonRunnerStatus
): "mark_expired" | "schedule" | null {
  if (status !== "ready") {
    return null;
  }

  return resolveReadyExpiryEffect(expiresAt, nowMs);
}

export function resolveReadyExpiryEffect(
  expiresAt: string,
  nowMs: number
): "mark_expired" | "schedule" {
  if (shouldStartLessonRunnerExpired(expiresAt, nowMs)) {
    return "mark_expired";
  }

  return "schedule";
}

export function computeExpiryTimeoutMs(expiresAt: string, nowMs: number): number | null {
  if (!Number.isFinite(nowMs)) {
    return null;
  }

  const expiresAtMs = parseExpiresAtMs(expiresAt);
  if (expiresAtMs === null) {
    return null;
  }

  const delay = expiresAtMs - nowMs;
  return delay <= 0 ? 0 : delay;
}

export function resolveCurrentExercise(
  state: LessonRunnerState
): ParsedExerciseView | null {
  if (state.status === "finished") {
    return null;
  }

  return state.exercises[state.currentIndex] ?? null;
}

function lessonRunnerReducerWithReinit(
  state: LessonRunnerState,
  action: LessonRunnerReducerAction
): LessonRunnerState {
  if (action.type === "REINIT") {
    return createLessonRunnerInitialState(
      action.exercises,
      action.expiresAt,
      action.nowMs
    );
  }

  return lessonRunnerReducer(state, action);
}

export function useLessonRunner({
  exercises,
  expiresAt,
  now = () => Date.now(),
}: UseLessonRunnerOptions) {
  const nowRef = useRef(now);
  nowRef.current = now;

  const [state, dispatch] = useReducer(
    lessonRunnerReducerWithReinit,
    { exercises, expiresAt, nowMs: nowRef.current() },
    ({ exercises: initialExercises, expiresAt: initialExpiresAt, nowMs }) =>
      createLessonRunnerInitialState(initialExercises, initialExpiresAt, nowMs)
  );

  useEffect(() => {
    if (state.status !== "ready") {
      return;
    }

    const nowMs = nowRef.current();
    const expiryEffect = resolveReadyExpiryEffect(expiresAt, nowMs);

    if (expiryEffect === "mark_expired") {
      dispatch({ type: "MARK_EXPIRED" });
      return;
    }

    const timeoutMs = computeExpiryTimeoutMs(expiresAt, nowMs);
    if (timeoutMs === null || timeoutMs <= 0) {
      dispatch({ type: "MARK_EXPIRED" });
      return;
    }

    const timerId = window.setTimeout(() => {
      dispatch({ type: "MARK_EXPIRED" });
    }, timeoutMs);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [expiresAt, state.status]);

  const selectOption = useCallback((optionId: string) => {
    dispatch({ type: "SELECT_OPTION", optionId });
  }, []);

  const nextExercise = useCallback(() => {
    dispatch({ type: "NEXT_EXERCISE", nowMs: nowRef.current() });
  }, []);

  const completeTap = useCallback(() => {
    dispatch({ type: "COMPLETE_TAP", nowMs: nowRef.current() });
  }, []);

  const reset = useCallback(() => {
    dispatch({
      type: "REINIT",
      exercises,
      expiresAt,
      nowMs: nowRef.current(),
    });
  }, [exercises, expiresAt]);

  const currentExercise = resolveCurrentExercise(state);

  return {
    state,
    currentExercise,
    selectOption,
    nextExercise,
    completeTap,
    reset,
  };
}
