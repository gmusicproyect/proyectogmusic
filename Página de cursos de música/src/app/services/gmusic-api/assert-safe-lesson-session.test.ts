import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { GmusicApiError } from "./client";
import {
  assertSafeLessonSessionResponse,
  findForbiddenLessonSessionKey,
} from "./assert-safe-lesson-session";

describe("findForbiddenLessonSessionKey", () => {
  it("detecta claves prohibidas en cualquier nivel", () => {
    assert.equal(findForbiddenLessonSessionKey({ ok: true }), null);
    assert.equal(findForbiddenLessonSessionKey({ xpEarned: 10 }), "xpEarned");
    assert.equal(
      findForbiddenLessonSessionKey({
        exercises: [{ contentPayload: { nested: { isCorrect: true } } }],
      }),
      "isCorrect"
    );
  });
});

describe("assertSafeLessonSessionResponse", () => {
  it("lanza UNSAFE_API_RESPONSE cuando encuentra accuracy anidada", () => {
    assert.throws(
      () =>
        assertSafeLessonSessionResponse(
          {
            sessionId: "s1",
            exercises: [{ contentPayload: { hints: [{ accuracy: 1 }] } }],
          },
          200
        ),
      (error: unknown) => {
        assert.ok(error instanceof GmusicApiError);
        assert.equal(error.code, "UNSAFE_API_RESPONSE");
        assert.equal(error.status, 200);
        return true;
      }
    );
  });
});
