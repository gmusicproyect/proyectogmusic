import { apiGet } from "./client";
import { GmusicApiError } from "./client";
import { getApiBaseUrl } from "./config";
import type { AccessResponse, AccessSubscription } from "./types";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidIsoDateString(value: string): boolean {
  const parsed = Date.parse(value);
  return Number.isFinite(parsed);
}

function parseAccessSubscription(value: unknown): AccessSubscription | null {
  if (value === null) return null;
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  if (record.status !== "ACTIVE") return null;
  if (!isNonEmptyString(record.planId)) return null;
  if (record.endsAt !== null && typeof record.endsAt !== "string") return null;
  if (
    typeof record.endsAt === "string" &&
    !isValidIsoDateString(record.endsAt)
  ) {
    return null;
  }

  return {
    status: "ACTIVE",
    planId: record.planId,
    endsAt: record.endsAt as string | null,
  };
}

function invalidResponse(message: string): never {
  throw new GmusicApiError(message, 200, "INVALID_RESPONSE");
}

export function assertValidAccessResponse(data: unknown): AccessResponse {
  if (!data || typeof data !== "object") {
    throw new GmusicApiError(
      "La respuesta de acceso no tiene el formato esperado.",
      200,
      "INVALID_RESPONSE"
    );
  }

  const body = data as Record<string, unknown>;
  const user = body.user;
  if (!user || typeof user !== "object") {
    throw new GmusicApiError(
      "La respuesta de acceso no incluye usuario válido.",
      200,
      "INVALID_RESPONSE"
    );
  }

  const userRecord = user as Record<string, unknown>;
  if (!isNonEmptyString(userRecord.id)) {
    throw new GmusicApiError(
      "La respuesta de acceso no incluye usuario válido.",
      200,
      "INVALID_RESPONSE"
    );
  }
  if (!isNonEmptyString(userRecord.name)) {
    throw new GmusicApiError(
      "La respuesta de acceso no incluye usuario válido.",
      200,
      "INVALID_RESPONSE"
    );
  }
  if (!isNonEmptyString(userRecord.email)) {
    throw new GmusicApiError(
      "La respuesta de acceso no incluye usuario válido.",
      200,
      "INVALID_RESPONSE"
    );
  }

  const access = body.access;
  if (!access || typeof access !== "object") {
    throw new GmusicApiError(
      "La respuesta de acceso no incluye estado de acceso válido.",
      200,
      "INVALID_RESPONSE"
    );
  }

  const accessRecord = access as Record<string, unknown>;
  if (typeof accessRecord.canAccessStudentZone !== "boolean") {
    throw new GmusicApiError(
      "La respuesta de acceso no incluye estado de acceso válido.",
      200,
      "INVALID_RESPONSE"
    );
  }

  const reason = accessRecord.reason;
  if (reason !== "ACTIVE_SUBSCRIPTION" && reason !== "NO_ACTIVE_SUBSCRIPTION") {
    invalidResponse("La respuesta de acceso no incluye motivo válido.");
  }

  const canAccess = accessRecord.canAccessStudentZone;
  if (canAccess && reason !== "ACTIVE_SUBSCRIPTION") {
    invalidResponse(
      "La respuesta de acceso permitido no coincide con el motivo declarado."
    );
  }
  if (!canAccess && reason !== "NO_ACTIVE_SUBSCRIPTION") {
    invalidResponse(
      "La respuesta de acceso denegado no coincide con el motivo declarado."
    );
  }

  const subscription = parseAccessSubscription(body.subscription);
  if (canAccess && !subscription) {
    invalidResponse(
      "La respuesta de acceso permitido no incluye suscripción válida."
    );
  }
  if (!canAccess && body.subscription !== null) {
    invalidResponse(
      "La respuesta de acceso denegado incluye suscripción inesperada."
    );
  }

  return {
    user: {
      id: userRecord.id,
      name: userRecord.name,
      email: userRecord.email,
    },
    access: {
      canAccessStudentZone: accessRecord.canAccessStudentZone,
      reason,
    },
    subscription,
  };
}

export async function fetchAccess(options?: {
  signal?: AbortSignal;
}): Promise<AccessResponse> {
  const raw = await apiGet<unknown>(`${getApiBaseUrl()}/me/access`, options);
  return assertValidAccessResponse(raw);
}
