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

const defaultDeps: LessonSessionLoadDeps = {
  createLessonSession,
};

function formatLessonSessionError(error: GmusicApiError): string {
  if (error.code === "INVALID_NODE") {
    return "Este nodo no está disponible para iniciar la lección. Vuelve al camino y elige una práctica activa.";
  }
  return error.message;
}

export async function loadLessonSessionOnce(
  nodeId: string,
  signal: AbortSignal,
  deps: LessonSessionLoadDeps = defaultDeps
): Promise<LessonSessionLoadOutcome> {
  if (signal.aborted) return { type: "aborted" };

  try {
    const result = await deps.createLessonSession(nodeId, { signal });
    if (signal.aborted) return { type: "aborted" };
    return { type: "success", result };
  } catch (error) {
    if (isAbortError(error) || signal.aborted) return { type: "aborted" };
    const message =
      error instanceof GmusicApiError
        ? formatLessonSessionError(error)
        : "No pudimos iniciar la lección. Comprueba la conexión e inténtalo de nuevo.";
    return { type: "error", message };
  }
}
