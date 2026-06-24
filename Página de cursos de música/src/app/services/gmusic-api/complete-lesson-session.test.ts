import assert from "node:assert/strict";
import { afterEach, before, describe, it } from "node:test";
import type { CompleteLessonSessionResponse } from "./types";

const SESSION_ID = "550e8400-e29b-41d4-a716-446655440010";
const COMPLETE_RESPONSE: CompleteLessonSessionResponse = {
  sessionId: SESSION_ID,
  status: "COMPLETED",
  alreadyProcessed: false,
  accuracy: 1,
  xpEarned: 25,
  streakUpdated: true,
  currentStreak: 3,
  nodeCompleted: true,
  completedAt: "2026-06-24T17:00:00.000Z",
};

const originalFetch = globalThis.fetch;
let completeLessonSession: typeof import("./complete-lesson-session").completeLessonSession;

before(async () => {
  Object.defineProperty(import.meta, "env", {
    value: {},
    configurable: true,
  });
  ({ completeLessonSession } = await import("./complete-lesson-session"));
});

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("completeLessonSession", () => {
  it("envía POST a lesson-sessions/:id/complete con attempts", async () => {
    let capturedUrl = "";
    let capturedBody: unknown;

    globalThis.fetch = (async (url, init) => {
      capturedUrl = String(url);
      capturedBody = JSON.parse(String(init?.body));
      return new Response(JSON.stringify(COMPLETE_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const result = await completeLessonSession(SESSION_ID, {
      attempts: [
        {
          microExerciseId: "550e8400-e29b-41d4-a716-446655440020",
          selectedAnswer: "a",
          responseTimeMs: 1200,
        },
      ],
    });

    assert.match(capturedUrl, /\/lesson-sessions\/550e8400-e29b-41d4-a716-446655440010\/complete$/);
    assert.deepEqual(capturedBody, {
      attempts: [
        {
          microExerciseId: "550e8400-e29b-41d4-a716-446655440020",
          selectedAnswer: "a",
          responseTimeMs: 1200,
        },
      ],
    });
    assert.equal(result.xpEarned, 25);
    assert.equal(result.currentStreak, 3);
  });
});
