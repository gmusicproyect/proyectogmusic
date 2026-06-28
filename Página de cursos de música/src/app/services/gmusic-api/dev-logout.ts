import { getApiBaseUrl } from "./config";
import { GmusicApiError } from "./client";

export async function postDevLogout(options?: {
  signal?: AbortSignal;
}): Promise<void> {
  const response = await fetch(`${getApiBaseUrl()}/dev/logout`, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
    signal: options?.signal,
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Error ${response.status} al cerrar sesión.`;

    try {
      const body = (await response.json()) as { error?: { code?: string; message?: string } };
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // Respuesta no JSON; mantener mensaje genérico.
    }

    throw new GmusicApiError(message, response.status, code);
  }

  if (response.status !== 204) {
    throw new GmusicApiError(
      "La respuesta de cierre de sesión no es válida.",
      response.status,
      "INVALID_RESPONSE"
    );
  }
}
