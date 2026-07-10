import { createLessonSession } from "./lesson-session";
import { GmusicApiError, isAbortError } from "./client";
import type { LessonSessionStartResult } from "./types";

export type LessonSessionLoadOutcome =
  | { type: "success"; result: LessonSessionStartResult }
  | { type: "error"; message: string }
  | { type: "aborted" };

export interface LessonSessionLoadDeps {
  createLessonSession: (
    nodeId: string,
    options?: { signal?: AbortSignal }
  ) => Promise<LessonSessionStartResult>;
}

export const LESSON_SESSION_TIMEOUT_MS = 30_000;

const defaultDeps: LessonSessionLoadDeps = {
  createLessonSession,
};

function combineAbortSignals(signals: AbortSignal[]): AbortSignal {
  const abortSignalAny = (
    AbortSignal as typeof AbortSignal & { any?: (signals: AbortSignal[]) => AbortSignal }
  ).any;
  if (abortSignalAny) return abortSignalAny(signals);

  const controller = new AbortController();
  const abortCombined = () => controller.abort();

  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener("abort", abortCombined, { once: true });
  }

  return controller.signal;
}

function formatLessonSessionError(error: GmusicApiError): string {
  if (error.code === "INVALID_NODE") {
    return "Este nodo no está disponible para iniciar la lección. Vuelve al camino y elige una práctica activa.";
  }
  if (error.code === "UNAUTHORIZED") {
    return "Tu sesión expiró. Vuelve a iniciar sesión e inténtalo de nuevo.";
  }
  if (error.code === "NETWORK_ERROR") {
    return "No pudimos conectar con la API. Comprueba que el servidor local esté corriendo (npm run api:dev).";
  }
  return error.message;
}

export async function loadLessonSessionOnce(
  nodeId: string,
  signal: AbortSignal,
  deps: LessonSessionLoadDeps = defaultDeps
): Promise<LessonSessionLoadOutcome> {
  if (signal.aborted) return { type: "aborted" };

  const timeoutSignal = AbortSignal.timeout(LESSON_SESSION_TIMEOUT_MS);
  const combinedSignal = combineAbortSignals([signal, timeoutSignal]);

  try {
    const result = await deps.createLessonSession(nodeId, { signal: combinedSignal });
    if (signal.aborted) return { type: "aborted" };
    return { type: "success", result };
  } catch (error) {
    if (signal.aborted || (isAbortError(error) && signal.aborted)) {
      return { type: "aborted" };
    }
    if (isAbortError(error) && timeoutSignal.aborted) {
      return {
        type: "error",
        message:
          "La lección tardó demasiado en responder. Comprueba tu conexión e inténtalo de nuevo.",
      };
    }
    if (isAbortError(error)) return { type: "aborted" };
    const message =
      error instanceof GmusicApiError
        ? formatLessonSessionError(error)
        : "No pudimos iniciar la lección. Comprueba la conexión e inténtalo de nuevo.";
    return { type: "error", message };
  }
}
