import { ApiError } from "./errors.js";

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

  return { question: record.question };
}
