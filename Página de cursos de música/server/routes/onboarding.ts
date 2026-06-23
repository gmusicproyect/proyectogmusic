import { Router } from "express";
import { parseLinkOnboardingLeadBody } from "../lib/parseLinkOnboardingLeadBody.js";
import { parseTemperamentQuizBody } from "../lib/parseTemperamentQuizBody.js";
import {
  linkOnboardingLead,
  persistTemperamentQuizSubmission,
} from "../services/onboardingAnalytics.js";

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

onboardingRouter.post("/link-lead", async (req, res, next) => {
  try {
    const input = parseLinkOnboardingLeadBody(req.body);
    const record = await linkOnboardingLead(input);

    res.status(200).json({
      session_id: record.sessionId,
      email: record.email,
      calculated_temperament: record.calculatedTemperament,
      lead_captured_at: record.leadCapturedAt?.toISOString() ?? null,
      selected_plan_id: record.selectedPlanId,
    });
  } catch (error) {
    next(error);
  }
});
