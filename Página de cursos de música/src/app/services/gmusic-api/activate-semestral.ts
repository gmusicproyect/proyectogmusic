import { assertValidAccessResponse, fetchAccess } from "./access";
import { apiPost, GmusicApiError } from "./client";
import { getApiBaseUrl } from "./config";
import type { AccessResponse } from "./types";

export const SEMESTRAL_PLAN_ID = "gmusic-semester-6-months";

export interface ActivateSemestralRequest {
  name: string;
  email: string;
  planId: typeof SEMESTRAL_PLAN_ID;
}

export interface ActivateSemestralResponse {
  user: {
    id: string;
    name: string;
    email: string;
  };
  subscription: {
    status: "ACTIVE";
    planId: string;
    endsAt: string;
  };
  access: {
    canAccessStudentZone: true;
    reason: "ACTIVE_SUBSCRIPTION";
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoDateString(value: string): boolean {
  return Number.isFinite(Date.parse(value));
}

function invalidActivation(message: string): never {
  throw new GmusicApiError(message, 200, "INVALID_RESPONSE");
}

export function normalizeRegisteredEmail(email: string): string {
  return email.trim().toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function assertSemestralActivationVerified(
  requestedEmail: string,
  activation: ActivateSemestralResponse,
  access: AccessResponse
): void {
  const normalizedEmail = normalizeRegisteredEmail(requestedEmail);

  if (!EMAIL_RE.test(normalizedEmail)) {
    throw new GmusicApiError("Email inválido para activar el plan.", 400, "VALIDATION_ERROR");
  }

  if (normalizeRegisteredEmail(activation.user.email) !== normalizedEmail) {
    throw new GmusicApiError(
      "La activación no coincide con el usuario registrado.",
      200,
      "EMAIL_MISMATCH"
    );
  }

  if (normalizeRegisteredEmail(access.user.email) !== normalizedEmail) {
    throw new GmusicApiError(
      "La sesión verificada no coincide con el usuario registrado.",
      200,
      "EMAIL_MISMATCH"
    );
  }

  if (activation.user.id !== access.user.id) {
    throw new GmusicApiError(
      "La sesión verificada no coincide con el usuario activado.",
      200,
      "USER_MISMATCH"
    );
  }

  if (activation.subscription.planId !== SEMESTRAL_PLAN_ID) {
    throw new GmusicApiError(
      "La activación no confirmó el plan semestral.",
      200,
      "PLAN_MISMATCH"
    );
  }

  if (!access.subscription || access.subscription.planId !== SEMESTRAL_PLAN_ID) {
    throw new GmusicApiError(
      "El acceso verificado no incluye plan semestral activo.",
      200,
      "PLAN_MISMATCH"
    );
  }

  if (!access.access.canAccessStudentZone) {
    throw new GmusicApiError(
      "La activación no otorgó acceso a la zona del alumno.",
      200,
      "ACCESS_DENIED"
    );
  }
}

export function assertValidActivateSemestralResponse(
  data: unknown
): ActivateSemestralResponse {
  if (!data || typeof data !== "object") {
    invalidActivation("La respuesta de activación no tiene el formato esperado.");
  }

  const body = data as Record<string, unknown>;
  const user = body.user;
  if (!user || typeof user !== "object") {
    invalidActivation("La respuesta de activación no incluye usuario válido.");
  }

  const userRecord = user as Record<string, unknown>;
  if (!isNonEmptyString(userRecord.id)) {
    invalidActivation("La respuesta de activación no incluye usuario válido.");
  }
  if (!isNonEmptyString(userRecord.name)) {
    invalidActivation("La respuesta de activación no incluye usuario válido.");
  }
  if (!isNonEmptyString(userRecord.email)) {
    invalidActivation("La respuesta de activación no incluye usuario válido.");
  }

  const subscription = body.subscription;
  if (!subscription || typeof subscription !== "object") {
    invalidActivation("La respuesta de activación no incluye suscripción válida.");
  }

  const subscriptionRecord = subscription as Record<string, unknown>;
  if (subscriptionRecord.status !== "ACTIVE") {
    invalidActivation("La respuesta de activación no incluye suscripción válida.");
  }
  if (subscriptionRecord.planId !== SEMESTRAL_PLAN_ID) {
    invalidActivation("La respuesta de activación no incluye plan semestral válido.");
  }
  if (
    typeof subscriptionRecord.endsAt !== "string" ||
    !isValidIsoDateString(subscriptionRecord.endsAt)
  ) {
    invalidActivation("La respuesta de activación no incluye suscripción válida.");
  }

  const access = body.access;
  if (!access || typeof access !== "object") {
    invalidActivation("La respuesta de activación no incluye acceso válido.");
  }

  const accessRecord = access as Record<string, unknown>;
  if (accessRecord.canAccessStudentZone !== true) {
    invalidActivation("La respuesta de activación no confirma acceso alumnos.");
  }
  if (accessRecord.reason !== "ACTIVE_SUBSCRIPTION") {
    invalidActivation("La respuesta de activación no confirma acceso alumnos.");
  }

  return {
    user: {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
    },
    subscription: {
      status: "ACTIVE",
      planId: subscriptionRecord.planId,
      endsAt: subscriptionRecord.endsAt,
    },
    access: {
      canAccessStudentZone: true,
      reason: "ACTIVE_SUBSCRIPTION",
    },
  };
}

export type ActivateSemestralWithAccessResult = {
  activation: ActivateSemestralResponse;
  access: AccessResponse;
};

export async function activateSemestralWithAccessVerification(input: {
  name: string;
  email: string;
}): Promise<ActivateSemestralWithAccessResult> {
  const normalizedEmail = normalizeRegisteredEmail(input.email);
  const trimmedName = input.name.trim();

  if (!trimmedName) {
    throw new GmusicApiError("Nombre requerido para activar el plan.", 400, "VALIDATION_ERROR");
  }
  if (!normalizedEmail.includes("@")) {
    throw new GmusicApiError("Email inválido para activar el plan.", 400, "VALIDATION_ERROR");
  }

  const { data } = await apiPost<unknown>(
    `${getApiBaseUrl()}/dev/activate-semestral`,
    {
      name: trimmedName,
      email: normalizedEmail,
      planId: SEMESTRAL_PLAN_ID,
    } satisfies ActivateSemestralRequest
  );

  const activation = assertValidActivateSemestralResponse(data);
  const access = await fetchAccess();
  assertSemestralActivationVerified(normalizedEmail, activation, access);

  return { activation, access };
}
