import type { OnboardingAnalytics } from "@prisma/client";
import { ApiError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import type { LinkOnboardingLeadInput } from "../lib/parseLinkOnboardingLeadBody.js";
import type { TemperamentQuizSubmission } from "../lib/parseTemperamentQuizBody.js";

export async function persistTemperamentQuizSubmission(
  submission: TemperamentQuizSubmission,
  userId: string | null
): Promise<OnboardingAnalytics> {
  return prisma.onboardingAnalytics.upsert({
    where: { sessionId: submission.sessionId },
    create: {
      sessionId: submission.sessionId,
      userId,
      calculatedTemperament: submission.calculatedTemperament,
      scores: submission.scores,
      isTie: submission.isTie,
      totalDurationMs: submission.totalDurationMs,
      totalAnswerChanges: submission.totalAnswerChanges,
      questionsAnswered: submission.questionsAnswered,
      questionEvents: submission.questionEvents,
      instrumentSlug: submission.instrumentSlug,
      referrerPath: submission.referrerPath,
      completedAt: submission.completedAt,
    },
    update: {
      userId: userId ?? undefined,
      calculatedTemperament: submission.calculatedTemperament,
      scores: submission.scores,
      isTie: submission.isTie,
      totalDurationMs: submission.totalDurationMs,
      totalAnswerChanges: submission.totalAnswerChanges,
      questionsAnswered: submission.questionsAnswered,
      questionEvents: submission.questionEvents,
      instrumentSlug: submission.instrumentSlug,
      referrerPath: submission.referrerPath,
      completedAt: submission.completedAt,
    },
  });
}

export async function linkOnboardingLead(
  input: LinkOnboardingLeadInput
): Promise<OnboardingAnalytics> {
  const existing = await prisma.onboardingAnalytics.findUnique({
    where: { sessionId: input.sessionId },
  });

  if (!existing) {
    throw new ApiError(
      404,
      "SESSION_NOT_FOUND",
      "No hay quiz de temperamento para este session_id."
    );
  }

  return prisma.onboardingAnalytics.update({
    where: { sessionId: input.sessionId },
    data: {
      email: input.email,
      leadCapturedAt: new Date(),
      selectedPlanId: input.selectedPlanId,
    },
  });
}
