/**
 * PD-3 — bridge de proyección onboarding/contexto (LearnerProjectionH1).
 * Flag OFF → profileProjectionH1Store. Flag ON → tabla learner_projections_h1.
 */
import { isH1DurableEnabled } from "./h1DurableFlag.js";
import { prisma } from "./prisma.js";
import {
  getLearnerProjectionDurable,
  upsertLearnerProjectionDurable,
  type LearnerProjectionPatchH1,
  type LearnerProjectionRecordH1,
} from "./learnerProjectionRepo.js";
import {
  clearProfileProjectionH1,
  getProfileProjectionH1,
  upsertProfileProjectionH1,
  type ProfileProjectionH1,
} from "./profileProjectionH1Store.js";

function recordToProjection(record: LearnerProjectionRecordH1): ProfileProjectionH1 {
  return {
    profileId: record.userId,
    onboardingStatus: record.onboardingStatus,
    partialAnswers: record.partialAnswers,
    result: record.result,
    learningGoalOverride: record.learningGoalOverride,
    weeklyGoalMinutesOverride: record.weeklyGoalMinutesOverride,
  };
}

export async function getProfileProjection(
  profileId: string
): Promise<ProfileProjectionH1 | null> {
  if (!isH1DurableEnabled()) {
    return getProfileProjectionH1(profileId);
  }
  const record = await getLearnerProjectionDurable(prisma, profileId);
  return record ? recordToProjection(record) : null;
}

export async function upsertProfileProjection(
  profileId: string,
  patch: LearnerProjectionPatchH1
): Promise<ProfileProjectionH1> {
  if (!isH1DurableEnabled()) {
    return upsertProfileProjectionH1(profileId, patch);
  }
  const record = await upsertLearnerProjectionDurable(prisma, profileId, patch);
  // Espejo en memoria para callers sync del mismo proceso (p.ej. resolveLearnerContext sync).
  upsertProfileProjectionH1(profileId, {
    onboardingStatus: record.onboardingStatus,
    partialAnswers: record.partialAnswers,
    result: record.result,
    learningGoalOverride: record.learningGoalOverride,
    weeklyGoalMinutesOverride: record.weeklyGoalMinutesOverride,
  });
  return recordToProjection(record);
}

/** Tests: limpia memoria; en durable también borra fila DB si existe. */
export async function clearProfileProjection(profileId: string): Promise<void> {
  clearProfileProjectionH1(profileId);
  if (!isH1DurableEnabled()) return;
  await prisma.learnerProjectionH1.deleteMany({ where: { userId: profileId } });
}
