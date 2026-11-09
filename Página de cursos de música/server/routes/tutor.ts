import { Router } from "express";
import { recordTutorAsk } from "../lib/tutorAudit.js";
import { parseTutorAskBody } from "../lib/parseTutorAskBody.js";
import { askTutor } from "../lib/tutorAsk.js";
import { tutorRateLimit } from "../lib/tutorRateLimit.js";
import { requireTutorSessionIfConfigured } from "../middleware/tutorAccess.js";

/**
 * Tutor grounded: solo lectura.
 * POST /ask — citas o abstain. Rate limit. Auth opcional. Audit JSONL (Paso 9).
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
      try {
        recordTutorAsk(result, { ip: req.ip ?? null });
      } catch {
        // Audit no debe tumbar la respuesta.
      }
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);
