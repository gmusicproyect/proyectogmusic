import type { TemperamentQuizResult } from "../../data/temperament-quiz";
import { apiPost } from "./client";
import { getApiBaseUrl } from "./config";

export interface TemperamentQuizSubmissionResponse {
  id: string;
  session_id: string;
  calculated_temperament: string;
  completed_at: string;
}

export function mapTemperamentQuizResultToApiBody(
  result: TemperamentQuizResult,
  options?: { referrerPath?: string | null }
) {
  return {
    session_id: result.session_id,
    calculated_temperament: result.calculated_temperament,
    scores: result.scores,
    is_tie: result.is_tie,
    total_duration_ms: result.total_duration_ms,
    total_answer_changes: result.total_answer_changes,
    questions_answered: result.question_events.length,
    question_events: result.question_events,
    instrument_slug: result.instrument_slug,
    referrer_path: options?.referrerPath ?? null,
    completed_at: result.completed_at,
  };
}

export async function submitTemperamentQuiz(
  result: TemperamentQuizResult,
  options?: { signal?: AbortSignal; referrerPath?: string | null }
): Promise<TemperamentQuizSubmissionResponse> {
  const { data } = await apiPost<TemperamentQuizSubmissionResponse>(
    `${getApiBaseUrl()}/onboarding/temperament-quiz`,
    mapTemperamentQuizResultToApiBody(result, options),
    options
  );
  return data;
}
