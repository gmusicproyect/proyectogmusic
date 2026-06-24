import { apiPost } from "./client";
import { getApiBaseUrl } from "./config";
import type {
  CompleteLessonSessionRequest,
  CompleteLessonSessionResponse,
} from "./types";

export async function completeLessonSession(
  sessionId: string,
  body: CompleteLessonSessionRequest,
  options?: { signal?: AbortSignal }
): Promise<CompleteLessonSessionResponse> {
  const trimmedId = sessionId.trim();
  const { data } = await apiPost<CompleteLessonSessionResponse>(
    `${getApiBaseUrl()}/lesson-sessions/${encodeURIComponent(trimmedId)}/complete`,
    body,
    options
  );
  return data;
}
