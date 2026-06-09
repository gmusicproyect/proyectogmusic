import { fetchAccess } from "./access";
import { GmusicApiError, isAbortError } from "./client";
import type { AccessReason, AccessSubscription, AccessUser } from "./types";

export type AccessLoadOutcome =
  | { type: "allowed"; user: AccessUser; subscription: AccessSubscription }
  | { type: "denied"; user: AccessUser; reason: AccessReason }
  | { type: "error"; message: string }
  | { type: "aborted" };

export interface AccessLoadDeps {
  fetchAccess: (options?: { signal?: AbortSignal }) => Promise<
    import("./types").AccessResponse
  >;
}

const defaultDeps: AccessLoadDeps = {
  fetchAccess,
};

export async function loadAccessOnce(
  signal: AbortSignal,
  deps: AccessLoadDeps = defaultDeps
): Promise<AccessLoadOutcome> {
  if (signal.aborted) return { type: "aborted" };

  try {
    const response = await deps.fetchAccess({ signal });
    if (signal.aborted) return { type: "aborted" };

    if (response.access.canAccessStudentZone) {
      if (!response.subscription) {
        return {
          type: "error",
          message: "La respuesta de acceso no es confiable. Inténtalo de nuevo.",
        };
      }
      return {
        type: "allowed",
        user: response.user,
        subscription: response.subscription,
      };
    }

    return {
      type: "denied",
      user: response.user,
      reason: response.access.reason,
    };
  } catch (error) {
    if (isAbortError(error) || signal.aborted) return { type: "aborted" };
    const message =
      error instanceof GmusicApiError
        ? error.message
        : "No pudimos verificar tu acceso. Comprueba la conexión e inténtalo de nuevo.";
    return { type: "error", message };
  }
}
