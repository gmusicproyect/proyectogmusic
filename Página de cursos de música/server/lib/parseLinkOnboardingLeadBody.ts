import { ApiError } from "./errors.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface LinkOnboardingLeadInput {
  sessionId: string;
  email: string;
  selectedPlanId: string | null;
}

export function parseLinkOnboardingLeadBody(body: unknown): LinkOnboardingLeadInput {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Cuerpo JSON inválido.");
  }

  const record = body as Record<string, unknown>;
  const sessionId = typeof record.session_id === "string" ? record.session_id.trim() : "";
  if (sessionId.length < 8) {
    throw new ApiError(400, "VALIDATION_ERROR", "session_id debe tener al menos 8 caracteres.");
  }

  const email = typeof record.email === "string" ? record.email.trim().toLowerCase() : "";
  if (!EMAIL_PATTERN.test(email)) {
    throw new ApiError(400, "VALIDATION_ERROR", "email debe ser una dirección válida.");
  }

  let selectedPlanId: string | null = null;
  if (record.plan_id !== undefined && record.plan_id !== null) {
    if (typeof record.plan_id !== "string" || !record.plan_id.trim()) {
      throw new ApiError(400, "VALIDATION_ERROR", "plan_id debe ser texto si se envía.");
    }
    selectedPlanId = record.plan_id.trim();
  }

  return { sessionId, email, selectedPlanId };
}
