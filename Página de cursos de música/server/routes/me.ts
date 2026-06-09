import { Router } from "express";
import { config } from "../config.js";
import { assertStudent, devStudentAuth } from "../middleware/devStudentAuth.js";
import { buildAccessResponse } from "../services/accessService.js";
import { buildDashboardResponse, buildPathResponse } from "../services/meService.js";

export const meRouter = Router();

meRouter.use(devStudentAuth);

meRouter.get("/access", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const payload = await buildAccessResponse(student);
    res.set("Cache-Control", "no-store");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

meRouter.get("/dashboard", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const payload = await buildDashboardResponse(student);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

meRouter.get("/path", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const courseSlug =
      typeof req.query.courseSlug === "string" && req.query.courseSlug.length > 0
        ? req.query.courseSlug
        : config.defaultCourseSlug;

    const payload = await buildPathResponse(student, courseSlug);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});
