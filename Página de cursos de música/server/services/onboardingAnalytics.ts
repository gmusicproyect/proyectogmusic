import type { OnboardingAnalytics } from "@prisma/client";
import { prisma } from "../lib/prisma.js";
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
