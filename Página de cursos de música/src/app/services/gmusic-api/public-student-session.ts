import { assertValidAccessResponse } from "./access";
import { GmusicApiError, isAbortError } from "./client";
import { getApiBaseUrl } from "./config";
import type { AccessSubscription, AccessUser } from "./types";

export type PublicStudentSessionState =
  | { status: "loading" }
  | { status: "anonymous" }
  | { status: "registered_no_sub"; user: AccessUser }
  | { status: "authenticated"; user: AccessUser; subscription: AccessSubscription }
  | { status: "error"; message: string };

export type PublicStudentSessionOutcome =
  | { type: "anonymous" }
  | { type: "registered_no_sub"; user: AccessUser }
  | { type: "authenticated"; user: AccessUser; subscription: AccessSubscription }
  | { type: "error"; message: string }
  | { type: "aborted" };

export function mapPublicStudentSessionOutcome(
  outcome: PublicStudentSessionOutcome
): PublicStudentSessionState | null {
  if (outcome.type === "aborted") return null;
  if (outcome.type === "anonymous") return { status: "anonymous" };
  if (outcome.type === "registered_no_sub") {
    return { status: "registered_no_sub", user: outcome.user };
  }
  if (outcome.type === "error") return { status: "error", message: outcome.message };
  return {
    status: "authenticated",
    user: outcome.user,
    subscription: outcome.subscription,
  };
}

export async function loadPublicStudentSessionOnce(
  signal: AbortSignal
): Promise<PublicStudentSessionOutcome> {
  if (signal.aborted) return { type: "aborted" };

  try {
    const response = await fetch(`${getApiBaseUrl()}/me/access`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      signal,
    });

    if (signal.aborted) return { type: "aborted" };

    if (response.status === 401) {
      return { type: "anonymous" };
    }

    if (response.status === 403) {
      return { type: "anonymous" };
    }

    if (!response.ok) {
      let code = "INTERNAL_ERROR";
      let message = `Error ${response.status} al consultar la API.`;

      try {
        const body = (await response.json()) as { error?: { code?: string; message?: string } };
        if (body.error?.code) code = body.error.code;
        if (body.error?.message) message = body.error.message;
      } catch {
        // Respuesta no JSON; mantener mensaje genérico.
      }

      return { type: "error", message: new GmusicApiError(message, response.status, code).message };
    }

    const raw = await response.json();
    if (signal.aborted) return { type: "aborted" };

    const data = assertValidAccessResponse(raw);
    if (!data.access.canAccessStudentZone || !data.subscription) {
      return {
        type: "registered_no_sub",
        user: data.user,
      };
    }

    return {
      type: "authenticated",
      user: data.user,
      subscription: data.subscription,
    };
  } catch (error) {
    if (isAbortError(error) || signal.aborted) return { type: "aborted" };
    const message =
      error instanceof GmusicApiError
        ? error.message
        : "No pudimos verificar tu sesión. Comprueba la conexión e inténtalo de nuevo.";
    return { type: "error", message };
  }
}
