import { apiPost } from "./client";
import { getApiBaseUrl } from "./config";

export type TutorAskStatus = "answered" | "abstain";

export interface TutorCitation {
  id: string;
  title: string;
  source_path: string | null;
  excerpt: string;
}

export interface TutorAskResponse {
  question: string;
  status: TutorAskStatus;
  answer: string;
  citations: TutorCitation[];
  refusal_reason: string | null;
}

export async function askTutor(
  question: string,
  options?: { signal?: AbortSignal }
): Promise<TutorAskResponse> {
  const { data } = await apiPost<TutorAskResponse>(
    `${getApiBaseUrl()}/tutor/ask`,
    { question },
    options
  );
  return data;
}
