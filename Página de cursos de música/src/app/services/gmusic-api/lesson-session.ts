import { assertSafeLessonSessionResponse } from "./assert-safe-lesson-session";
import { GmusicApiError, apiPost } from "./client";
import { getApiBaseUrl } from "./config";
import type {
  LessonSessionResponse,
  LessonSessionStartKind,
  LessonSessionStartResult,
} from "./types";

function mapLessonSessionKind(status: number): LessonSessionStartKind {
  if (status === 201) return "created";
  if (status === 200) return "reused";
  throw new GmusicApiError(
    `Respuesta inesperada al iniciar la sesión (HTTP ${status}).`,
    status,
    "UNEXPECTED_API_RESPONSE"
  );
}

export async function createLessonSession(
  nodeId: string,
  options?: { signal?: AbortSignal }
): Promise<LessonSessionStartResult> {
  const { data, status } = await apiPost<LessonSessionResponse>(
    `${getApiBaseUrl()}/lesson-sessions`,
    { nodeId },
    options
  );

  const kind = mapLessonSessionKind(status);
  assertSafeLessonSessionResponse(data, status);

  return {
    session: data,
    kind,
  };
}
