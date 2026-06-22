import { Router } from "express";
import { parseTemperamentQuizBody } from "../lib/parseTemperamentQuizBody.js";
import { persistTemperamentQuizSubmission } from "../services/onboardingAnalytics.js";

export const onboardingRouter = Router();

onboardingRouter.post("/temperament-quiz", async (req, res, next) => {
  try {
    const submission = parseTemperamentQuizBody(req.body);
    const record = await persistTemperamentQuizSubmission(submission, null);

    res.status(201).json({
      id: record.id,
      session_id: record.sessionId,
      calculated_temperament: record.calculatedTemperament,
      completed_at: record.completedAt.toISOString(),
    });
  } catch (error) {
    next(error);
  }
});
