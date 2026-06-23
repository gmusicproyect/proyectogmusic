import { getApiBaseUrl } from "./config";
import { apiPost } from "./client";

export interface LinkOnboardingLeadResponse {
  session_id: string;
  email: string;
  calculated_temperament: string;
  lead_captured_at: string | null;
  selected_plan_id: string | null;
}

export async function linkOnboardingLead(input: {
  sessionId: string;
  email: string;
  planId?: string | null;
}): Promise<LinkOnboardingLeadResponse> {
  const { data } = await apiPost<LinkOnboardingLeadResponse>(
    `${getApiBaseUrl()}/onboarding/link-lead`,
    {
      session_id: input.sessionId,
      email: input.email,
      plan_id: input.planId ?? null,
    }
  );
  return data;
}
