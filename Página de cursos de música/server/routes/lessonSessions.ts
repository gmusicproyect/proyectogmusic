import { Router } from "express";
import { assertStudent, realStudentAuth } from "../middleware/realStudentAuth.js";
import { completeLessonSession } from "../services/completeLessonSessionService.js";
import { createOrReuseLessonSession } from "../services/lessonSessionService.js";

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
    const payload = await completeLessonSession(student, req.params.id, req.body);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});
