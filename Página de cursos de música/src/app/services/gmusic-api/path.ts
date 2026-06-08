import { apiGet } from "./client";
import { getApiBaseUrl } from "./config";
import type { PathResponse } from "./types";

export async function fetchPath(options?: { signal?: AbortSignal }): Promise<PathResponse> {
  return apiGet<PathResponse>(`${getApiBaseUrl()}/me/path`, options);
}
