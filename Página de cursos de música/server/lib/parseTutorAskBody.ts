import { ApiError } from "./errors.js";

export const TUTOR_QUESTION_MAX_CHARS = 500;

export interface TutorAskInput {
  question: string;
}

/** Valida body de POST /api/v1/tutor/ask. No escribe nada. */
export function parseTutorAskBody(body: unknown): TutorAskInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Body JSON requerido con question.");
  }

  const record = body as Record<string, unknown>;
  if (!("question" in record)) {
    throw new ApiError(400, "VALIDATION_ERROR", "question es requerido.");
  }
  if (typeof record.question !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "question debe ser string.");
  }

  const question = record.question.trim();
  if (question.length > TUTOR_QUESTION_MAX_CHARS) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `question supera ${TUTOR_QUESTION_MAX_CHARS} caracteres.`
    );
  }

  return { question: record.question };
}
