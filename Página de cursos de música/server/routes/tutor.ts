import { Router } from "express";
import { parseTutorAskBody } from "../lib/parseTutorAskBody.js";
import { askTutor } from "../lib/tutorAsk.js";
import { tutorRateLimit } from "../lib/tutorRateLimit.js";
import { requireTutorSessionIfConfigured } from "../middleware/tutorAccess.js";

/**
 * Tutor grounded: solo lectura.
 * POST /ask — citas o abstain. Rate limit in-memory. Auth opcional (TUTOR_REQUIRE_AUTH).
 */
export const tutorRouter = Router();

tutorRouter.post(
  "/ask",
  tutorRateLimit.middleware,
  requireTutorSessionIfConfigured,
  (req, res, next) => {
    try {
      const { question } = parseTutorAskBody(req.body);
      const result = askTutor(question);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
