/**
 * P0-02 / H1 — proyección pedagógica del Perfil implícito.
 * Store en memoria (sin tabla Profile, sin migraciones).
 * Clave = profileId = userId (D-DOM-001).
 */
import type { OnboardingResultH1, OnboardingStatusH1, PartialOnboardingAnswersH1 } from "./onboardingH1.js";

export type ProfileProjectionH1 = {
  profileId: string;
  onboardingStatus: OnboardingStatusH1;
  partialAnswers: PartialOnboardingAnswersH1 | null;
  result: OnboardingResultH1 | null;
  /** Settings ligeros editables post-complete (meta/goal). */
  learningGoalOverride: OnboardingResultH1["learningGoal"] | null;
  weeklyGoalMinutesOverride: number | null;
};

const store = new Map<string, ProfileProjectionH1>();

export function getProfileProjectionH1(profileId: string): ProfileProjectionH1 | null {
  return store.get(profileId) ?? null;
}

export function upsertProfileProjectionH1(
  profileId: string,
  patch: Partial<Omit<ProfileProjectionH1, "profileId">>
): ProfileProjectionH1 {
  const prev = store.get(profileId) ?? {
    profileId,
    onboardingStatus: "not_started" as const,
    partialAnswers: null,
    result: null,
    learningGoalOverride: null,
    weeklyGoalMinutesOverride: null,
  };
  const next: ProfileProjectionH1 = {
    ...prev,
    ...patch,
    profileId,
  };
  store.set(profileId, next);
  return next;
}

/** Tests / reset local: limpia proyección de un perfil. */
export function clearProfileProjectionH1(profileId: string): void {
  store.delete(profileId);
}

/** Tests: limpia todo el store. */
export function clearAllProfileProjectionsH1(): void {
  store.clear();
}
