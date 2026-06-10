import { ApiError } from "./errors.js";

export const SEMESTRAL_PLAN_ID = "gmusic-semester-6-months";

const ALLOWED_BODY_KEYS = new Set(["name", "email", "planId"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface ActivateSemestralInput {
  name: string;
  email: string;
  planId: typeof SEMESTRAL_PLAN_ID;
}

export function parseActivateSemestralBody(body: unknown): ActivateSemestralInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Body inválido.");
  }

  const record = body as Record<string, unknown>;

  for (const key of Object.keys(record)) {
    if (!ALLOWED_BODY_KEYS.has(key)) {
      throw new ApiError(400, "VALIDATION_ERROR", `Campo desconocido: ${key}.`);
    }
  }

  const name = record.name;
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "name es requerido.");
  }
  if (name.trim().length > 100) {
    throw new ApiError(400, "VALIDATION_ERROR", "name no puede superar 100 caracteres.");
  }

  const emailRaw = record.email;
  if (typeof emailRaw !== "string" || emailRaw.trim().length === 0) {
    throw new ApiError(400, "VALIDATION_ERROR", "email es requerido.");
  }
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    throw new ApiError(400, "VALIDATION_ERROR", "email debe ser válido.");
  }

  const planId = record.planId;
  if (planId !== SEMESTRAL_PLAN_ID) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      `planId debe ser ${SEMESTRAL_PLAN_ID}.`
    );
  }

  return {
    name: name.trim(),
    email,
    planId: SEMESTRAL_PLAN_ID,
  };
}
