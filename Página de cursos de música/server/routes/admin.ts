import { Router } from "express";
import { config } from "../config.js";
import {
  parseCreateAdminModuleBody,
  parseSlotOrderParam,
  parseUpdateAdminSlotBody,
} from "../lib/parseAdminBody.js";
import { assertAdmin, requireAdmin } from "../middleware/requireAdmin.js";
import {
  createAdminModule,
  getAdminModuleDetail,
  listAdminModules,
  publishAdminModule,
  updateAdminSlot,
} from "../services/curriculum.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/modules", async (req, res, next) => {
  try {
    assertAdmin(req);
    const courseSlug =
      typeof req.query.courseSlug === "string" && req.query.courseSlug.length > 0
        ? req.query.courseSlug
        : config.defaultCourseSlug;

    const payload = await listAdminModules(courseSlug);
    res.set("Cache-Control", "no-store");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/modules", async (req, res, next) => {
  try {
    assertAdmin(req);
    const input = parseCreateAdminModuleBody(req.body);
    const courseSlug = input.courseSlug ?? config.defaultCourseSlug;
    const module = await createAdminModule(courseSlug, input.title);
    res.status(201).json({ module });
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/modules/:moduleId", async (req, res, next) => {
  try {
    assertAdmin(req);
    const payload = await getAdminModuleDetail(req.params.moduleId);
    res.set("Cache-Control", "no-store");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

adminRouter.put("/modules/:moduleId/slots/:slotOrder", async (req, res, next) => {
  try {
    assertAdmin(req);
    const slotOrder = parseSlotOrderParam(req.params.slotOrder);
    const input = parseUpdateAdminSlotBody(req.body);
    const node = await updateAdminSlot(req.params.moduleId, slotOrder, input);
    res.json({ node });
  } catch (error) {
    next(error);
  }
});

adminRouter.post("/modules/:moduleId/publish", async (req, res, next) => {
  try {
    assertAdmin(req);
    const payload = await publishAdminModule(req.params.moduleId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});
