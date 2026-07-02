import type { ApiErrorBody } from "./types";

export class GmusicApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "GmusicApiError";
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

function isLikelyNetworkOrCorsError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  if (error instanceof DOMException && error.name === "NetworkError") return true;
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("failed to fetch") ||
      message.includes("networkerror") ||
      message.includes("load failed")
    );
  }
  return false;
}

export function toFetchGmusicError(error: unknown): GmusicApiError {
  if (error instanceof GmusicApiError) return error;
  if (isAbortError(error)) {
    throw error;
  }
  if (isLikelyNetworkOrCorsError(error)) {
    return new GmusicApiError(
      "No pudimos conectar con la API (red o bloqueo CORS). En local usa VITE_API_BASE_URL=/api/v1 y el proxy de Vite hacia Render; evita llamar a Render directo desde 127.0.0.1.",
      0,
      "NETWORK_ERROR"
    );
  }
  const message =
    error instanceof Error && error.message.trim()
      ? error.message
      : "Error de red al contactar la API.";
  return new GmusicApiError(message, 0, "NETWORK_ERROR");
}

export function formatAuthFormError(err: unknown, fallback: string): string {
  if (err instanceof GmusicApiError) return err.message;
  if (err instanceof Error && err.message.trim()) return err.message;
  return fallback;
}

export async function runFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init);
  } catch (error) {
    if (isAbortError(error)) throw error;
    throw toFetchGmusicError(error);
  }
}

export async function apiGet<T>(
  path: string,
  options?: { signal?: AbortSignal }
): Promise<T> {
  const response = await runFetch(path, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
    signal: options?.signal,
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Error ${response.status} al consultar la API.`;

    try {
      const body = (await response.json()) as ApiErrorBody;
      if (body.error?.code) code = body.error.code;
      if (body.error?.message) message = body.error.message;
    } catch {
      // Respuesta no JSON; mantener mensaje genérico.
    }

    throw new GmusicApiError(message, response.status, code);
  }

  return (await response.json()) as T;
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  options?: { signal?: AbortSignal }
): Promise<{ data: T; status: number }> {
  const response = await runFetch(path, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Error ${response.status} al consultar la API.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      if (errorBody.error?.code) code = errorBody.error.code;
      if (errorBody.error?.message) message = errorBody.error.message;
    } catch {
      // Respuesta no JSON; mantener mensaje genérico.
    }

    throw new GmusicApiError(message, response.status, code);
  }

  const data = (await response.json()) as T;
  return { data, status: response.status };
}

export async function apiPut<T>(
  path: string,
  body: unknown,
  options?: { signal?: AbortSignal }
): Promise<{ data: T; status: number }> {
  const response = await runFetch(path, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(body),
    signal: options?.signal,
  });

  if (!response.ok) {
    let code = "INTERNAL_ERROR";
    let message = `Error ${response.status} al consultar la API.`;

    try {
      const errorBody = (await response.json()) as ApiErrorBody;
      if (errorBody.error?.code) code = errorBody.error.code;
      if (errorBody.error?.message) message = errorBody.error.message;
    } catch {
      // Respuesta no JSON; mantener mensaje genérico.
    }

    throw new GmusicApiError(message, response.status, code);
  }

  const data = (await response.json()) as T;
  return { data, status: response.status };
}
