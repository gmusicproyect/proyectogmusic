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

export async function apiGet<T>(
  path: string,
  options?: { signal?: AbortSignal }
): Promise<T> {
  const response = await fetch(path, {
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
  const response = await fetch(path, {
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
