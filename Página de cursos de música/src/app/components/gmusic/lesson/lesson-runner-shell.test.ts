import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { findForbiddenLessonSessionKey } from "../../../services/gmusic-api/assert-safe-lesson-session";
import { GmusicApiError } from "../../../services/gmusic-api/client";
import type { LessonSessionResponse, PublicExercise } from "../../../services/gmusic-api/types";
import {
  canAdvanceLessonRunner,
  getLessonRunnerResetKey,
  isLessonRunnerInteractionDisabled,
} from "./LessonRunnerShell";
import {
  createInitialLessonRunnerState,
  lessonRunnerReducer,
} from "./lesson-runner-state";
import type { ParsedExerciseView } from "./lesson-runner-types";
import { prepareLessonRunner } from "./prepare-lesson-runner";
import {
  computeExpiryTimeoutMs,
  createLessonRunnerInitialState,
  isSessionExpired,
  parseExpiresAtMs,
  resolveCurrentExercise,
  resolveExpiryDispatch,
  resolveReadyExpiryEffect,
  shouldStartLessonRunnerExpired,
} from "./useLessonRunner";

const root = dirname(fileURLToPath(import.meta.url));
const shellSource = readFileSync(join(root, "LessonRunnerShell.tsx"), "utf8");
const hookSource = readFileSync(join(root, "useLessonRunner.ts"), "utf8");
const lessonSources = [shellSource, hookSource];

const VALID_EXERCISE: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440101",
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: "Identifica la nota.",
  contentPayload: {
    options: [
      { id: "a", text: "Mi" },
      { id: "b", text: "La" },
    ],
  },
};

const VALID_EXERCISE_B: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440102",
  type: "CHORD_SHAPE",
  difficulty: 1,
  instruction: "Elige la digitación.",
  contentPayload: {
    diagramLabel: "Am",
    options: [
      { id: "x", text: "Opción X" },
      { id: "y", text: "Opción Y" },
    ],
  },
};

const INCOMPATIBLE_EXERCISE: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440199",
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: "Sin opciones.",
  contentPayload: {
    options: [{ id: "a", text: "Solo una" }],
  },
};

const UNSAFE_EXERCISE: PublicExercise = {
  id: "550e8400-e29b-41d4-a716-446655440198",
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: "Con secreto.",
  contentPayload: {
    secureAnswer: { correctOptionId: "a" },
    options: [
      { id: "a", text: "Mi" },
      { id: "b", text: "La" },
    ],
  },
};

function buildSession(
  exercises: PublicExercise[],
  sessionId = "550e8400-e29b-41d4-a716-446655440010"
): LessonSessionResponse {
  return {
    sessionId,
    nodeId: "550e8400-e29b-41d4-a716-446655440001",
    status: "STARTED",
    startedAt: "2026-06-08T15:00:00.000Z",
    expiresAt: "2026-06-08T18:00:00.000Z",
    exercises,
  };
}

const PARSED_A: ParsedExerciseView = {
  id: VALID_EXERCISE.id,
  type: "IDENTIFY_NOTE",
  difficulty: 1,
  instruction: VALID_EXERCISE.instruction,
  options: [
    { id: "a", text: "Mi" },
    { id: "b", text: "La" },
  ],
  media: {},
};

const PARSED_B: ParsedExerciseView = {
  id: VALID_EXERCISE_B.id,
  type: "CHORD_SHAPE",
  difficulty: 1,
  instruction: VALID_EXERCISE_B.instruction,
  options: [
    { id: "x", text: "Opción X" },
    { id: "y", text: "Opción Y" },
  ],
  media: { diagramLabel: "Am" },
};

function reduce(
  state: ReturnType<typeof createInitialLessonRunnerState>,
  ...actions: Parameters<typeof lessonRunnerReducer>[1][]
) {
  return actions.reduce((current, action) => lessonRunnerReducer(current, action), state);
}

describe("prepareLessonRunner", () => {
  it("devuelve ParsedExerciseView[] cuando todos son compatibles", () => {
    const result = prepareLessonRunner(buildSession([VALID_EXERCISE, VALID_EXERCISE_B]));

    assert.equal(result.kind, "supported");
    if (result.kind !== "supported") return;

    assert.equal(result.exercises.length, 2);
    assert.equal(result.exercises[0]?.id, VALID_EXERCISE.id);
    assert.equal(result.exercises[1]?.media.diagramLabel, "Am");
    assert.equal(JSON.stringify(result).includes("contentPayload"), false);
    assert.equal(findForbiddenLessonSessionKey(result), null);
  });

  it("devuelve incompatible con exerciseId y reason del primer incompatible", () => {
    const result = prepareLessonRunner(buildSession([VALID_EXERCISE, INCOMPATIBLE_EXERCISE]));

    assert.deepEqual(result, {
      kind: "incompatible",
      exerciseId: INCOMPATIBLE_EXERCISE.id,
      reason: "Se requieren al menos 2 opciones.",
    });
  });

  it("propaga UNSAFE_API_RESPONSE fail-closed", () => {
    assert.throws(
      () => prepareLessonRunner(buildSession([VALID_EXERCISE, UNSAFE_EXERCISE])),
      (error: unknown) =>
        error instanceof GmusicApiError && error.code === "UNSAFE_API_RESPONSE"
    );
  });

  it("[incompatible, unsafe] lanza UNSAFE_API_RESPONSE y no devuelve incompatible", () => {
    assert.throws(
      () => prepareLessonRunner(buildSession([INCOMPATIBLE_EXERCISE, UNSAFE_EXERCISE])),
      (error: unknown) =>
        error instanceof GmusicApiError && error.code === "UNSAFE_API_RESPONSE"
    );
  });

  it("acepta sesión vacía sin ejercicios crudos en el resultado", () => {
    const result = prepareLessonRunner(buildSession([]));

    assert.equal(result.kind, "supported");
    if (result.kind !== "supported") return;

    assert.deepEqual(result.exercises, []);
    assert.equal(JSON.stringify(result).includes("contentPayload"), false);
  });
});

describe("resolveCurrentExercise e integración reducer", () => {
  it("currentExercise corresponde a currentIndex en ready", () => {
    const initial = createInitialLessonRunnerState([PARSED_A, PARSED_B], 1_000);
    const current = resolveCurrentExercise(initial);

    assert.equal(current?.id, PARSED_A.id);
    assert.equal(initial.currentIndex, 0);
  });

  it("conserva ejercicio actual en expired y lo oculta en finished", () => {
    const expired = reduce(
      createInitialLessonRunnerState([PARSED_A, PARSED_B], 1_000),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "MARK_EXPIRED" }
    );

    assert.equal(expired.status, "expired");
    assert.equal(resolveCurrentExercise(expired)?.id, PARSED_A.id);

    const finished = reduce(
      createInitialLessonRunnerState([PARSED_A, PARSED_B], 1_000),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: 1_500 },
      { type: "SELECT_OPTION", optionId: "x" },
      { type: "NEXT_EXERCISE", nowMs: 2_200 }
    );

    assert.equal(finished.status, "finished");
    assert.equal(resolveCurrentExercise(finished), null);
  });

  it("selección, siguiente y finished", () => {
    const finished = reduce(
      createInitialLessonRunnerState([PARSED_A, PARSED_B], 1_000),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: 1_500 },
      { type: "SELECT_OPTION", optionId: "x" },
      { type: "NEXT_EXERCISE", nowMs: 2_200 }
    );

    assert.equal(finished.status, "finished");
    assert.equal(finished.attemptsDraft.length, 2);
    assert.equal(finished.attemptsDraft[0]?.selectedAnswer, "a");
    assert.equal(finished.attemptsDraft[1]?.selectedAnswer, "x");
  });

  it("MARK_EXPIRED bloquea avance", () => {
    const expired = reduce(
      createInitialLessonRunnerState([PARSED_A, PARSED_B], 1_000),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "MARK_EXPIRED" },
      { type: "NEXT_EXERCISE", nowMs: 1_500 }
    );

    assert.equal(expired.status, "expired");
    assert.equal(expired.attemptsDraft.length, 0);
  });
});

describe("resolveExpiryDispatch y expiración", () => {
  it("parseExpiresAtMs e isSessionExpired con fecha válida", () => {
    const expiresAtMs = parseExpiresAtMs("2026-06-08T18:00:00.000Z");
    assert.equal(typeof expiresAtMs, "number");
    assert.equal(isSessionExpired(expiresAtMs, Date.parse("2026-06-08T17:59:59.000Z")), false);
    assert.equal(isSessionExpired(expiresAtMs, Date.parse("2026-06-08T18:00:00.000Z")), true);
    assert.equal(isSessionExpired(null, Date.parse("2026-06-08T17:00:00.000Z")), true);
    assert.equal(isSessionExpired(expiresAtMs, Number.NaN), true);
  });

  it("fecha vencida resuelve mark_expired", () => {
    const nowMs = Date.parse("2026-06-08T19:00:00.000Z");
    assert.equal(
      resolveExpiryDispatch("2026-06-08T18:00:00.000Z", nowMs, "ready"),
      "mark_expired"
    );
  });

  it("fecha futura programa timer", () => {
    const nowMs = Date.parse("2026-06-08T17:00:00.000Z");
    assert.equal(
      resolveExpiryDispatch("2026-06-08T18:00:00.000Z", nowMs, "ready"),
      "schedule"
    );
    assert.equal(
      computeExpiryTimeoutMs("2026-06-08T18:00:00.000Z", nowMs),
      3_600_000
    );
  });

  it("MARK_EXPIRED desde estado ready vía reducer", () => {
    const expired = lessonRunnerReducer(
      createInitialLessonRunnerState([PARSED_A], 1_000),
      { type: "MARK_EXPIRED" }
    );
    assert.equal(expired.status, "expired");
  });
});

describe("createLessonRunnerInitialState", () => {
  const futureExpiresAt = "2026-06-08T18:00:00.000Z";
  const pastNowMs = Date.parse("2026-06-08T19:00:00.000Z");
  const futureNowMs = Date.parse("2026-06-08T17:00:00.000Z");

  it("expiresAt vencido inicia directamente expired", () => {
    const state = createLessonRunnerInitialState(
      [PARSED_A, PARSED_B],
      futureExpiresAt,
      pastNowMs
    );

    assert.equal(state.status, "expired");
    assert.equal(shouldStartLessonRunnerExpired(futureExpiresAt, pastNowMs), true);
  });

  it("expiresAt inválido inicia directamente expired", () => {
    const state = createLessonRunnerInitialState(
      [PARSED_A],
      "invalid",
      futureNowMs
    );

    assert.equal(state.status, "expired");
    assert.equal(shouldStartLessonRunnerExpired("invalid", futureNowMs), true);
  });

  it("nowMs NaN e Infinity inician directamente expired", () => {
    for (const nowMs of [Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY]) {
      const state = createLessonRunnerInitialState(
        [PARSED_A],
        futureExpiresAt,
        nowMs
      );

      assert.equal(state.status, "expired", `nowMs=${String(nowMs)}`);
      assert.equal(shouldStartLessonRunnerExpired(futureExpiresAt, nowMs), true);
    }
  });

  it("expiresAt futuro inicia ready", () => {
    const state = createLessonRunnerInitialState(
      [PARSED_A, PARSED_B],
      futureExpiresAt,
      futureNowMs
    );

    assert.equal(state.status, "ready");
    assert.equal(shouldStartLessonRunnerExpired(futureExpiresAt, futureNowMs), false);
    assert.equal(state.currentIndex, 0);
    assert.equal(resolveCurrentExercise(state)?.id, PARSED_A.id);
  });

  it("no existe primer estado ready para sesiones inválidas o vencidas", () => {
    const cases = [
      { expiresAt: "invalid", nowMs: futureNowMs },
      { expiresAt: futureExpiresAt, nowMs: pastNowMs },
      { expiresAt: futureExpiresAt, nowMs: Number.NaN },
    ] as const;

    for (const { expiresAt, nowMs } of cases) {
      const state = createLessonRunnerInitialState([PARSED_A], expiresAt, nowMs);
      assert.notEqual(state.status, "ready");
    }
  });
});

describe("LessonRunnerShell — lógica de interacción y reset", () => {
  it("expired deshabilita interacción pero mantiene ejercicio visible", () => {
    const expired = reduce(
      createInitialLessonRunnerState([PARSED_A], 1_000),
      { type: "MARK_EXPIRED" }
    );

    assert.equal(isLessonRunnerInteractionDisabled(expired.status), true);
    assert.equal(canAdvanceLessonRunner(expired.status, "a"), false);
    assert.equal(resolveCurrentExercise(expired)?.id, PARSED_A.id);
  });

  it("ready con selección permite avanzar", () => {
    const ready = reduce(
      createInitialLessonRunnerState([PARSED_A], 1_000),
      { type: "SELECT_OPTION", optionId: "a" }
    );

    assert.equal(isLessonRunnerInteractionDisabled(ready.status), false);
    assert.equal(canAdvanceLessonRunner(ready.status, ready.selectedOptionId), true);
  });

  it("ready sin selección bloquea avance", () => {
    const ready = createInitialLessonRunnerState([PARSED_A], 1_000);
    assert.equal(canAdvanceLessonRunner(ready.status, ready.selectedOptionId), false);
  });

  it("cambiar sessionId reinicia progreso local", () => {
    const progressed = reduce(
      createInitialLessonRunnerState([PARSED_A, PARSED_B], 1_000),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: 1_500 }
    );

    assert.equal(progressed.currentIndex, 1);
    assert.equal(progressed.attemptsDraft.length, 1);

    const freshSession = createInitialLessonRunnerState(
      [PARSED_A, PARSED_B],
      2_000
    );

    assert.notEqual(freshSession.currentIndex, progressed.currentIndex);
    assert.deepEqual(freshSession.attemptsDraft, []);
    assert.equal(getLessonRunnerResetKey(buildSession([], "session-a").sessionId), "session-a");
    assert.notEqual(
      getLessonRunnerResetKey(buildSession([], "session-a").sessionId),
      getLessonRunnerResetKey(buildSession([], "session-b").sessionId)
    );
  });
});

describe("LessonRunnerShell — seguridad", () => {
  it("no contiene grading, POST complete, contentPayload ni legacy", () => {
    const forbidden = [
      "isCorrect",
      "xpEarned",
      "accuracy",
      "contentPayload",
      "secureAnswer",
      "correctOptionId",
      "ExerciseEngine",
      "LessonPage",
      "Ex1",
      "Tonal",
      "console.log",
      "lesson-sessions",
      "/complete",
    ];

    for (const source of lessonSources) {
      for (const token of forbidden) {
        assert.equal(source.includes(token), false, `source no debe incluir ${token}`);
      }
    }
  });

  it("full-view aislado sin overlay conectado en shell", () => {
    assert.equal(shellSource.includes("GmusicPath"), false);
    assert.equal(shellSource.includes("activeRunner"), false);
    assert.equal(shellSource.includes("fixed inset-0"), false);
  });
});

describe("serialización segura del shell", () => {
  it("preparación supported no expone secretos", () => {
    const result = prepareLessonRunner(buildSession([VALID_EXERCISE]));
    assert.equal(result.kind, "supported");
    if (result.kind !== "supported") return;

    const serialized = JSON.stringify(result);
    assert.equal(findForbiddenLessonSessionKey(result), null);
    assert.equal(serialized.includes("contentPayload"), false);
    assert.equal(serialized.includes("secureAnswer"), false);
  });

  it("estado finished local no incluye campos prohibidos", () => {
    const finished = reduce(
      createInitialLessonRunnerState([PARSED_A], 1_000),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: 1_200 }
    );

    assert.equal(findForbiddenLessonSessionKey(finished), null);
    assert.equal(JSON.stringify(finished).includes("isCorrect"), false);
  });
});

describe("useLessonRunner — limpieza de timers", () => {
  it("schedule devuelve delay positivo solo para expiresAt válido futuro", () => {
    const nowMs = Date.parse("2026-06-08T17:00:00.000Z");
    assert.equal(resolveExpiryDispatch("2026-06-08T18:00:00.000Z", nowMs, "ready"), "schedule");
    assert.equal(computeExpiryTimeoutMs("invalid", nowMs), null);
    assert.equal(
      createLessonRunnerInitialState([PARSED_A], "2026-06-08T18:00:00.000Z", nowMs).status,
      "ready"
    );
  });
});

describe("useLessonRunner — reset y efecto de expiración", () => {
  const futureExpiresAt = "2026-06-08T18:00:00.000Z";
  const pastExpiresAt = "2026-06-08T16:00:00.000Z";
  const futureNowMs = Date.parse("2026-06-08T17:00:00.000Z");
  const pastNowMs = Date.parse("2026-06-08T19:00:00.000Z");

  function simulateReset(
    exercises: ParsedExerciseView[],
    expiresAt: string,
    nowMs: number
  ) {
    return createLessonRunnerInitialState(exercises, expiresAt, nowMs);
  }

  it("reset de sesión vencida permanece expired", () => {
    const progressed = reduce(
      createLessonRunnerInitialState([PARSED_A, PARSED_B], futureExpiresAt, futureNowMs),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: futureNowMs + 1_000 }
    );

    assert.equal(progressed.status, "ready");
    assert.equal(progressed.currentIndex, 1);
    assert.equal(progressed.attemptsDraft.length, 1);

    const afterReset = simulateReset([PARSED_A, PARSED_B], futureExpiresAt, pastNowMs);

    assert.equal(afterReset.status, "expired");
    assert.equal(afterReset.currentIndex, 0);
    assert.deepEqual(afterReset.attemptsDraft, []);
  });

  it("reset con expiresAt inválido permanece expired", () => {
    const progressed = reduce(
      createLessonRunnerInitialState([PARSED_A], futureExpiresAt, futureNowMs),
      { type: "SELECT_OPTION", optionId: "a" }
    );

    assert.equal(progressed.status, "ready");

    const afterReset = simulateReset([PARSED_A], "invalid", futureNowMs);

    assert.equal(afterReset.status, "expired");
    assert.equal(afterReset.selectedOptionId, null);
    assert.deepEqual(afterReset.attemptsDraft, []);
  });

  it("cambio de expiresAt futuro a vencido marca expired", () => {
    const ready = createLessonRunnerInitialState([PARSED_A], futureExpiresAt, futureNowMs);

    assert.equal(ready.status, "ready");
    assert.equal(resolveReadyExpiryEffect(futureExpiresAt, futureNowMs), "schedule");
    assert.equal(resolveReadyExpiryEffect(pastExpiresAt, futureNowMs), "mark_expired");

    const expired = lessonRunnerReducer(ready, { type: "MARK_EXPIRED" });

    assert.equal(expired.status, "expired");
    assert.equal(resolveCurrentExercise(expired)?.id, PARSED_A.id);
  });

  it("sesión futura sigue permitiendo reset a ready", () => {
    const progressed = reduce(
      createLessonRunnerInitialState([PARSED_A, PARSED_B], futureExpiresAt, futureNowMs),
      { type: "SELECT_OPTION", optionId: "a" },
      { type: "NEXT_EXERCISE", nowMs: futureNowMs + 500 }
    );

    assert.equal(progressed.currentIndex, 1);
    assert.equal(progressed.attemptsDraft.length, 1);

    const afterReset = simulateReset([PARSED_A, PARSED_B], futureExpiresAt, futureNowMs);

    assert.equal(afterReset.status, "ready");
    assert.equal(afterReset.currentIndex, 0);
    assert.equal(afterReset.selectedOptionId, null);
    assert.deepEqual(afterReset.attemptsDraft, []);
    assert.equal(resolveCurrentExercise(afterReset)?.id, PARSED_A.id);
  });
});
