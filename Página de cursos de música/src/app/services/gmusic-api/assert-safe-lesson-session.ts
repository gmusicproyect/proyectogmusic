import { GmusicApiError } from "./client";
import type { LessonSessionResponse } from "./types";

const FORBIDDEN_LESSON_SESSION_KEYS = new Set([
  "secureAnswer",
  "correctOptionId",
  "explanationAfterAnswer",
  "isCorrect",
  "accuracy",
  "xpEarned",
]);

export function findForbiddenLessonSessionKey(value: unknown): string | null {
  if (value === null || typeof value !== "object") {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findForbiddenLessonSessionKey(item);
      if (found) return found;
    }
    return null;
  }

  for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
    if (FORBIDDEN_LESSON_SESSION_KEYS.has(key)) {
      return key;
    }
    const found = findForbiddenLessonSessionKey(nested);
    if (found) return found;
  }

  return null;
}

export function assertSafeLessonSessionResponse(
  payload: unknown,
  httpStatus: number
): asserts payload is LessonSessionResponse {
  const forbiddenKey = findForbiddenLessonSessionKey(payload);
  if (forbiddenKey) {
    throw new GmusicApiError(
      `La respuesta de la sesión contiene el campo prohibido "${forbiddenKey}".`,
      httpStatus,
      "UNSAFE_API_RESPONSE"
    );
  }
}
