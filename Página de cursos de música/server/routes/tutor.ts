import { Router } from "express";
import { parseTutorAskBody } from "../lib/parseTutorAskBody.js";
import { askTutor } from "../lib/tutorAsk.js";

/**
 * Tutor grounded (Paso 5): solo lectura.
 * POST /ask — responde con citas del corpus o abstain. Sin DB writes.
 */
export const tutorRouter = Router();

tutorRouter.post("/ask", (req, res, next) => {
  try {
    const { question } = parseTutorAskBody(req.body);
    const result = askTutor(question);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});
