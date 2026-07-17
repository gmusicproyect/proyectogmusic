import { Router } from "express";
import { assertStudent, realStudentAuth } from "../middleware/realStudentAuth.js";
import { completeLessonSession } from "../services/completeLessonSessionService.js";
import { createOrReuseLessonSession } from "../services/lessonSessionService.js";
import {
  abandonPracticeH1,
  completePracticeH1,
  progressPracticeH1,
} from "../services/practiceLifecycleH1Service.js";

export const lessonSessionsRouter = Router();

lessonSessionsRouter.use(realStudentAuth);

lessonSessionsRouter.post("/", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const { payload, created } = await createOrReuseLessonSession(student, req.body);
    res.status(created ? 201 : 200).json(payload);
  } catch (error) {
    next(error);
  }
});

lessonSessionsRouter.post("/:id/complete", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const isBinaryH1 =
      req.body &&
      typeof req.body === "object" &&
      req.body.binaryComplete !== undefined;
    const payload = isBinaryH1
      ? await completePracticeH1(student, req.params.id, req.body)
      : await completeLessonSession(student, req.params.id, req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

lessonSessionsRouter.post("/:id/progress", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const payload = await progressPracticeH1(student, req.params.id, req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

lessonSessionsRouter.post("/:id/abandon", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const payload = await abandonPracticeH1(student, req.params.id, req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});
