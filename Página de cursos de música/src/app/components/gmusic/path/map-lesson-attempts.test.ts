import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapRunnerAttemptsToCompleteRequest } from "./map-lesson-attempts";

describe("mapRunnerAttemptsToCompleteRequest", () => {
  it("mapea attemptsDraft al body de complete", () => {
    const body = mapRunnerAttemptsToCompleteRequest([
      {
        microExerciseId: "ex-1",
        selectedAnswer: "b",
        responseTimeMs: 900,
      },
    ]);

    assert.deepEqual(body, {
      attempts: [
        {
          microExerciseId: "ex-1",
          selectedAnswer: "b",
          responseTimeMs: 900,
        },
      ],
    });
  });
});
