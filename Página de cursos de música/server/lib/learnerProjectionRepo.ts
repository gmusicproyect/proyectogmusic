/**
 * PD-2 Persistencia Durable H1 — repositorio de LearnerProjectionH1.
 *
 * Reemplazo durable de profileProjectionH1Store (onboarding/contexto).
 * Sin tabla Profile. Clave = userId = profileId (D-DOM-001).
 * NO se cablea a servicios en PD-2 (eso es PD-3).
 */
import type { Prisma } from "@prisma/client";
import type {
  OnboardingResultH1,
  OnboardingStatusH1,
  PartialOnboardingAnswersH1,
} from "./onboardingH1.js";
import type { DbClient } from "./practiceEventRepo.js";

export type LearnerProjectionRecordH1 = {
  userId: string;
  onboardingStatus: OnboardingStatusH1;
  partialAnswers: PartialOnboardingAnswersH1 | null;
  result: OnboardingResultH1 | null;
  learningGoalOverride: OnboardingResultH1["learningGoal"] | null;
  weeklyGoalMinutesOverride: number | null;
};

export type LearnerProjectionPatchH1 = Partial<
  Omit<LearnerProjectionRecordH1, "userId">
>;

function toRecord(row: {
  userId: string;
  onboardingStatus: string;
  partialAnswers: Prisma.JsonValue | null;
  result: Prisma.JsonValue | null;
  learningGoalOverride: string | null;
  weeklyGoalMinutesOverride: number | null;
}): LearnerProjectionRecordH1 {
  return {
    userId: row.userId,
    onboardingStatus: row.onboardingStatus as OnboardingStatusH1,
    partialAnswers: (row.partialAnswers as PartialOnboardingAnswersH1 | null) ?? null,
    result: (row.result as OnboardingResultH1 | null) ?? null,
    learningGoalOverride:
      (row.learningGoalOverride as OnboardingResultH1["learningGoal"] | null) ?? null,
    weeklyGoalMinutesOverride: row.weeklyGoalMinutesOverride,
  };
}

export async function getLearnerProjectionDurable(
  db: DbClient,
  userId: string
): Promise<LearnerProjectionRecordH1 | null> {
  const row = await db.learnerProjectionH1.findUnique({ where: { userId } });
  return row ? toRecord(row) : null;
}

/**
 * Upsert parcial: preserva campos no incluidos en el patch.
 * onboardingStatus por defecto "not_started" al crear.
 */
export async function upsertLearnerProjectionDurable(
  db: DbClient,
  userId: string,
  patch: LearnerProjectionPatchH1
): Promise<LearnerProjectionRecordH1> {
  const jsonOrNull = (
    value: unknown
  ): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined => {
    if (value === undefined) return undefined;
    if (value === null) return undefined;
    return value as Prisma.InputJsonValue;
  };

  const row = await db.learnerProjectionH1.upsert({
    where: { userId },
    create: {
      userId,
      onboardingStatus: patch.onboardingStatus ?? "not_started",
      partialAnswers: jsonOrNull(patch.partialAnswers),
      result: jsonOrNull(patch.result),
      learningGoalOverride: patch.learningGoalOverride ?? null,
      weeklyGoalMinutesOverride: patch.weeklyGoalMinutesOverride ?? null,
    },
    update: {
      ...(patch.onboardingStatus !== undefined
        ? { onboardingStatus: patch.onboardingStatus }
        : {}),
      ...(patch.partialAnswers !== undefined
        ? {
            partialAnswers:
              patch.partialAnswers === null
                ? undefined
                : (patch.partialAnswers as unknown as Prisma.InputJsonValue),
          }
        : {}),
      ...(patch.result !== undefined
        ? {
            result:
              patch.result === null
                ? undefined
                : (patch.result as unknown as Prisma.InputJsonValue),
          }
        : {}),
      ...(patch.learningGoalOverride !== undefined
        ? { learningGoalOverride: patch.learningGoalOverride }
        : {}),
      ...(patch.weeklyGoalMinutesOverride !== undefined
        ? { weeklyGoalMinutesOverride: patch.weeklyGoalMinutesOverride }
        : {}),
    },
  });
  return toRecord(row);
}
