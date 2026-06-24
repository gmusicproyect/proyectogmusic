import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { findForbiddenLessonSessionKey } from "../../../services/gmusic-api/assert-safe-lesson-session";
import type { ParsedExerciseView } from "./lesson-runner-types";
import {
  MAX_RESPONSE_TIME_MS,
  computeResponseTimeMs,
  createInitialLessonRunnerState,
  lessonRunnerReducer,
  type LessonRunnerState,
} from "./lesson-runner-state";

const EXERCISE_A: ParsedExerciseView = {
  id: "ex-a",
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: "Identifica la nota.",
  options: [
    { id: "a", text: "Mi" },
    { id: "b", text: "La" },
  ],
  media: {},
  interaction: { mode: "mcq" },
};

const EXERCISE_B: ParsedExerciseView = {
  id: "ex-b",
  type: "CHORD_SHAPE",
  difficulty: 1,
  instruction: "Elige la digitación correcta.",
  options: [
    { id: "x", text: "Opción X" },
    { id: "y", text: "Opción Y" },
  ],
  media: { diagramLabel: "Am abierto" },
  interaction: { mode: "mcq" },
};

const EXERCISE_C: ParsedExerciseView = {
  id: "ex-c",
  type: "EAR_TRAINING",
  difficulty: 2,
  instruction: "Escucha y elige.",
  options: [
    { id: "1", text: "Sí" },
    { id: "2", text: "No" },
  ],
  media: { audioUrl: "https://cdn.example.com/chord.mp3" },
  interaction: { mode: "mcq" },
};

const EXERCISE_TAP: ParsedExerciseView = {
  id: "ex-tap",
  type: "RHYTHM_TAP",
  difficulty: 1,
  instruction: "Marca el pulso.",
  options: [],
  media: {},
  interaction: {
    mode: "tap",
    submissionOptionId: "tap-complete",
    tapHeadline: "Pulso en cuerda 6",
    tapDescription: "Toca la cuerda 6 al aire en cada TAP.",
    tapSequence: [
      { stringNumber: 6, label: "6", stringName: "Mi grave" },
      { stringNumber: 6, label: "6", stringName: "Mi grave" },
    ],
  },
};

const STARTED_AT_MS = 1_000_000;

function reduce(state: LessonRunnerState, ...actions: Parameters<typeof lessonRunnerReducer>[1][]) {
  return actions.reduce((current, action) => lessonRunnerReducer(current, action), state);
}

describe("createInitialLessonRunnerState", () => {
  it("ejercicios vacíos inicia finished", () => {
    const state = createInitialLessonRunnerState([], STARTED_AT_MS);

    assert.equal(state.status, "finished");
    assert.equal(state.currentIndex, 0);
    assert.equal(state.selectedOptionId, null);
    assert.equal(state.exerciseStartedAtMs, STARTED_AT_MS);
    assert.deepEqual(state.attemptsDraft, []);
  });

  it("con ejercicios inicia ready en el primer índice", () => {
    const state = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);

    assert.equal(state.status, "ready");
    assert.equal(state.currentIndex, 0);
    assert.equal(state.selectedOptionId, null);
    assert.equal(state.exerciseStartedAtMs, STARTED_AT_MS);
    assert.deepEqual(state.exercises, [EXERCISE_A, EXERCISE_B]);
    assert.deepEqual(state.attemptsDraft, []);
  });

  it("normaliza startedAtMs no finito a 0", () => {
    for (const startedAtMs of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const state = createInitialLessonRunnerState([EXERCISE_A], startedAtMs);
      assert.equal(state.exerciseStartedAtMs, 0);
      assert.equal(Number.isFinite(state.exerciseStartedAtMs), true);
    }
  });
});

describe("SELECT_OPTION", () => {
  it("acepta option.id existente en el ejercicio actual", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const next = lessonRunnerReducer(initial, {
      type: "SELECT_OPTION",
      optionId: "b",
    });

    assert.equal(next.selectedOptionId, "b");
    assert.equal(next.status, "ready");
  });

  it("rechaza option.id inexistente", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const next = lessonRunnerReducer(initial, {
      type: "SELECT_OPTION",
      optionId: "z",
    });

    assert.equal(next, initial);
    assert.equal(next.selectedOptionId, null);
  });

  it("no permite selección tras finished", () => {
    const finished = reduce(
      createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 500 }
    );

    assert.equal(finished.status, "finished");
    const blocked = lessonRunnerReducer(finished, {
      type: "SELECT_OPTION",
      optionId: "b",
    });
    assert.equal(blocked, finished);
  });

  it("no permite selección tras expired", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const expired = lessonRunnerReducer(initial, { type: "MARK_EXPIRED" });
    const blocked = lessonRunnerReducer(expired, {
      type: "SELECT_OPTION",
      optionId: "a",
    });

    assert.equal(blocked, expired);
    assert.equal(blocked.selectedOptionId, null);
  });
});

describe("NEXT_EXERCISE", () => {
  it("requiere selección previa", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const next = lessonRunnerReducer(initial, {
      type: "NEXT_EXERCISE",
      nowMs: STARTED_AT_MS + 1_000,
    });

    assert.equal(next, initial);
  });

  it("avanza índice y registra attempt draft", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);
    const selected = lessonRunnerReducer(initial, {
      type: "SELECT_OPTION",
      optionId: "a",
    });
    const advanced = lessonRunnerReducer(selected, {
      type: "NEXT_EXERCISE",
      nowMs: STARTED_AT_MS + 2_500,
    });

    assert.equal(advanced.status, "ready");
    assert.equal(advanced.currentIndex, 1);
    assert.equal(advanced.selectedOptionId, null);
    assert.equal(advanced.exerciseStartedAtMs, STARTED_AT_MS + 2_500);
    assert.deepEqual(advanced.attemptsDraft, [
      {
        microExerciseId: "ex-a",
        selectedAnswer: "a",
        responseTimeMs: 2_500,
      },
    ]);
  });

  it("calcula responseTimeMs normal al avanzar", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);
    const advanced = reduce(
      initial,
      { type: "SELECT_OPTION", optionId: "b" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 42_000 }
    );

    assert.equal(advanced.attemptsDraft[0]?.responseTimeMs, 42_000);
  });

  it("limita responseTimeMs negativo a 0", () => {
    assert.equal(computeResponseTimeMs(STARTED_AT_MS, STARTED_AT_MS - 500), 0);

    const initial = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);
    const advanced = reduce(
      initial,
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS - 1 }
    );

    assert.equal(advanced.attemptsDraft[0]?.responseTimeMs, 0);
  });

  it("limita responseTimeMs superior a 3 horas", () => {
    const overLimit = STARTED_AT_MS + MAX_RESPONSE_TIME_MS + 1;
    assert.equal(
      computeResponseTimeMs(STARTED_AT_MS, overLimit),
      MAX_RESPONSE_TIME_MS
    );

    const initial = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);
    const advanced = reduce(
      initial,
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: overLimit }
    );

    assert.equal(advanced.attemptsDraft[0]?.responseTimeMs, MAX_RESPONSE_TIME_MS);
  });

  it("último ejercicio cambia status a finished", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const finished = reduce(
      initial,
      { type: "SELECT_OPTION", optionId: "b" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 900 }
    );

    assert.equal(finished.status, "finished");
    assert.equal(finished.currentIndex, 0);
    assert.equal(finished.selectedOptionId, null);
    assert.equal(finished.attemptsDraft.length, 1);
  });

  it("no duplica attempt draft para el mismo ejercicio", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const selected = reduce(initial, { type: "SELECT_OPTION", optionId: "a" });
    const finished = lessonRunnerReducer(selected, {
      type: "NEXT_EXERCISE",
      nowMs: STARTED_AT_MS + 100,
    });
    const duplicateAttempt = lessonRunnerReducer(
      { ...finished, selectedOptionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 200 }
    );

    assert.equal(duplicateAttempt.attemptsDraft.length, 1);
    assert.equal(duplicateAttempt.status, "finished");
  });

  it("no avanza tras finished", () => {
    const finished = reduce(
      createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 100 }
    );

    const blocked = lessonRunnerReducer(finished, {
      type: "NEXT_EXERCISE",
      nowMs: STARTED_AT_MS + 200,
    });

    assert.equal(blocked, finished);
  });

  it("no avanza tras expired", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);
    const selected = reduce(initial, { type: "SELECT_OPTION", optionId: "a" });
    const expired = lessonRunnerReducer(selected, { type: "MARK_EXPIRED" });
    const blocked = lessonRunnerReducer(expired, {
      type: "NEXT_EXERCISE",
      nowMs: STARTED_AT_MS + 500,
    });

    assert.equal(blocked, expired);
    assert.deepEqual(blocked.attemptsDraft, []);
  });
});

describe("COMPLETE_TAP", () => {
  it("registra attempt con submissionOptionId y avanza", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_TAP, EXERCISE_A], STARTED_AT_MS);
    const advanced = lessonRunnerReducer(initial, {
      type: "COMPLETE_TAP",
      nowMs: STARTED_AT_MS + 3_000,
    });

    assert.equal(advanced.status, "ready");
    assert.equal(advanced.currentIndex, 1);
    assert.deepEqual(advanced.attemptsDraft, [
      {
        microExerciseId: "ex-tap",
        selectedAnswer: "tap-complete",
        responseTimeMs: 3_000,
      },
    ]);
  });

  it("último ejercicio TAP cambia status a finished", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_TAP], STARTED_AT_MS);
    const finished = lessonRunnerReducer(initial, {
      type: "COMPLETE_TAP",
      nowMs: STARTED_AT_MS + 500,
    });

    assert.equal(finished.status, "finished");
    assert.equal(finished.attemptsDraft[0]?.selectedAnswer, "tap-complete");
  });

  it("ignora COMPLETE_TAP en ejercicio MCQ", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const unchanged = lessonRunnerReducer(initial, {
      type: "COMPLETE_TAP",
      nowMs: STARTED_AT_MS + 100,
    });

    assert.equal(unchanged, initial);
  });

  it("no duplica attempt TAP para el mismo ejercicio", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_TAP], STARTED_AT_MS);
    const finished = lessonRunnerReducer(initial, {
      type: "COMPLETE_TAP",
      nowMs: STARTED_AT_MS + 100,
    });
    const duplicate = lessonRunnerReducer(finished, {
      type: "COMPLETE_TAP",
      nowMs: STARTED_AT_MS + 200,
    });

    assert.equal(duplicate.attemptsDraft.length, 1);
  });
});

describe("MARK_EXPIRED", () => {
  it("marca expired solo desde ready y limpia selección", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    const selected = lessonRunnerReducer(initial, {
      type: "SELECT_OPTION",
      optionId: "a",
    });
    const expired = lessonRunnerReducer(selected, { type: "MARK_EXPIRED" });

    assert.equal(expired.status, "expired");
    assert.equal(expired.selectedOptionId, null);
    assert.deepEqual(expired.attemptsDraft, []);
  });

  it("no cambia estado ya finished", () => {
    const finished = reduce(
      createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 100 }
    );
    const unchanged = lessonRunnerReducer(finished, { type: "MARK_EXPIRED" });

    assert.equal(unchanged, finished);
  });
});

describe("RESET", () => {
  it("crea estado nuevo sin conservar intentos", () => {
    const progressed = reduce(
      createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 300 }
    );

    assert.equal(progressed.attemptsDraft.length, 1);
    assert.equal(progressed.currentIndex, 1);

    const reset = lessonRunnerReducer(progressed, {
      type: "RESET",
      exercises: [EXERCISE_C],
      startedAtMs: STARTED_AT_MS + 9_000,
    });

    assert.deepEqual(reset, createInitialLessonRunnerState([EXERCISE_C], STARTED_AT_MS + 9_000));
    assert.equal(reset.status, "ready");
    assert.equal(reset.currentIndex, 0);
    assert.equal(reset.selectedOptionId, null);
    assert.deepEqual(reset.attemptsDraft, []);
  });

  it("normaliza startedAtMs no finito a 0", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A], STARTED_AT_MS);
    for (const startedAtMs of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const reset = lessonRunnerReducer(initial, {
        type: "RESET",
        exercises: [EXERCISE_B],
        startedAtMs,
      });

      assert.equal(reset.exerciseStartedAtMs, 0);
      assert.equal(Number.isFinite(reset.exerciseStartedAtMs), true);
    }
  });
});

describe("computeResponseTimeMs — timestamps no finitos", () => {
  it("devuelve 0 cuando nowMs es NaN, Infinity o -Infinity", () => {
    for (const nowMs of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      assert.equal(computeResponseTimeMs(STARTED_AT_MS, nowMs), 0);
      assert.equal(Number.isInteger(computeResponseTimeMs(STARTED_AT_MS, nowMs)), true);
    }
  });

  it("devuelve 0 cuando exerciseStartedAtMs es NaN, Infinity o -Infinity", () => {
    for (const exerciseStartedAtMs of [
      Number.NaN,
      Number.POSITIVE_INFINITY,
      Number.NEGATIVE_INFINITY,
    ]) {
      assert.equal(computeResponseTimeMs(exerciseStartedAtMs, STARTED_AT_MS + 500), 0);
      assert.equal(
        Number.isInteger(computeResponseTimeMs(exerciseStartedAtMs, STARTED_AT_MS + 500)),
        true
      );
    }
  });

  it("siempre devuelve entero entre 0 y MAX_RESPONSE_TIME_MS", () => {
    const samples = [
      [STARTED_AT_MS, STARTED_AT_MS + 500],
      [STARTED_AT_MS, STARTED_AT_MS - 500],
      [STARTED_AT_MS, STARTED_AT_MS + MAX_RESPONSE_TIME_MS + 1],
      [Number.NaN, STARTED_AT_MS],
      [STARTED_AT_MS, Number.NaN],
      [Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY],
    ] as const;

    for (const [startedAt, nowMs] of samples) {
      const value = computeResponseTimeMs(startedAt, nowMs);
      assert.equal(Number.isInteger(value), true);
      assert.equal(value >= 0, true);
      assert.equal(value <= MAX_RESPONSE_TIME_MS, true);
    }
  });
});

describe("NEXT_EXERCISE — timestamps no finitos", () => {
  it("nowMs no finito produce responseTimeMs 0 y timestamp siguiente válido", () => {
    const initial = createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], STARTED_AT_MS);

    for (const nowMs of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const advanced = reduce(
        initial,
        { type: "SELECT_OPTION", optionId: "a" },
        { type: "NEXT_EXERCISE", nowMs }
      );

      assert.equal(advanced.attemptsDraft[0]?.responseTimeMs, 0);
      assert.equal(advanced.exerciseStartedAtMs, 0);
      assert.equal(Number.isFinite(advanced.exerciseStartedAtMs), true);
    }
  });
});

describe("serialización segura del estado", () => {
  it("no incluye campos secretos ni prohibidos", () => {
    const state = reduce(
      createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B, EXERCISE_C], STARTED_AT_MS),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 1_000 },
      { type: "SELECT_OPTION", optionId: "x" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 4_000 },
      { type: "SELECT_OPTION", optionId: "1" },
      { type: "NEXT_EXERCISE", nowMs: STARTED_AT_MS + 8_000 }
    );

    assert.equal(state.status, "finished");

    const serialized = JSON.stringify(state);
    assert.equal(findForbiddenLessonSessionKey(state), null);
    assert.equal(serialized.includes("secureAnswer"), false);
    assert.equal(serialized.includes("correctOptionId"), false);
    assert.equal(serialized.includes("explanationAfterAnswer"), false);
    assert.equal(serialized.includes("isCorrect"), false);
    assert.equal(serialized.includes("accuracy"), false);
    assert.equal(serialized.includes("xpEarned"), false);
    assert.equal(serialized.includes("contentPayload"), false);

    for (const attempt of state.attemptsDraft) {
      assert.equal(typeof attempt.microExerciseId, "string");
      assert.equal(typeof attempt.selectedAnswer, "string");
      assert.equal(Number.isInteger(attempt.responseTimeMs), true);
      assert.equal(attempt.responseTimeMs >= 0, true);
      assert.equal(attempt.responseTimeMs <= MAX_RESPONSE_TIME_MS, true);
    }
  });

  it("no serializa null por NaN/Infinity en timestamps numéricos", () => {
    const state = reduce(
      createInitialLessonRunnerState([EXERCISE_A, EXERCISE_B], Number.NaN),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: Number.POSITIVE_INFINITY },
      { type: "SELECT_OPTION", optionId: "x" },
      { type: "NEXT_EXERCISE", nowMs: Number.NEGATIVE_INFINITY }
    );

    assert.equal(state.status, "finished");
    assert.equal(Number.isFinite(state.exerciseStartedAtMs), true);

    const serialized = JSON.stringify(state);
    const parsed = JSON.parse(serialized) as LessonRunnerState;

    assert.notEqual(parsed.exerciseStartedAtMs, null);
    assert.equal(Number.isFinite(parsed.exerciseStartedAtMs), true);
    assert.equal(parsed.exerciseStartedAtMs, 0);

    for (const attempt of parsed.attemptsDraft) {
      assert.notEqual(attempt.responseTimeMs, null);
      assert.equal(attempt.responseTimeMs, 0);
      assert.equal(Number.isFinite(attempt.responseTimeMs), true);
      assert.equal(Number.isInteger(attempt.responseTimeMs), true);
    }
  });
});
