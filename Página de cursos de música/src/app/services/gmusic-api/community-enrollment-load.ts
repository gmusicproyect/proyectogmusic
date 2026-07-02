import { fetchCommunityEnrollment } from "./community";
import { GmusicApiError, isAbortError } from "./client";
import type { CommunityEnrollment } from "../../utils/community-enrollment";
import { resolveCommunityEnrollment } from "../../utils/community-enrollment";
import { mapCommunityEnrollmentApiRecord } from "./map-community-enrollment";

export type CommunityEnrollmentLoadOutcome =
  | { type: "success"; enrollment: CommunityEnrollment }
  | { type: "fallback"; enrollment: CommunityEnrollment }
  | { type: "aborted" };

export interface CommunityEnrollmentLoadInput {
  currentLessonTitle?: string | null;
}

export interface CommunityEnrollmentLoadDeps {
  fetchCommunityEnrollment: (options?: {
    signal?: AbortSignal;
  }) => Promise<import("./map-community-enrollment").CommunityEnrollmentApiRecord>;
}

const defaultDeps: CommunityEnrollmentLoadDeps = {
  fetchCommunityEnrollment,
};

export async function loadCommunityEnrollmentOnce(
  signal: AbortSignal,
  input: CommunityEnrollmentLoadInput = {},
  deps: CommunityEnrollmentLoadDeps = defaultDeps
): Promise<CommunityEnrollmentLoadOutcome> {
  if (signal.aborted) return { type: "aborted" };

  try {
    const record = await deps.fetchCommunityEnrollment({ signal });
    if (signal.aborted) return { type: "aborted" };
    return {
      type: "success",
      enrollment: mapCommunityEnrollmentApiRecord(record),
    };
  } catch (error) {
    if (isAbortError(error) || signal.aborted) return { type: "aborted" };

    const fallback = resolveCommunityEnrollment({
      currentLessonTitle: input.currentLessonTitle ?? null,
    });

    if (error instanceof GmusicApiError && (error.status === 401 || error.status === 403)) {
      return { type: "fallback", enrollment: fallback };
    }

    return { type: "fallback", enrollment: fallback };
  }
}
