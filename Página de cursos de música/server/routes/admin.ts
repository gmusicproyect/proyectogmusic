import { Router, type NextFunction, type Request, type Response } from "express";
import multer from "multer";
import { config } from "../config.js";
import {
  adminStorageUploadMiddleware,
  resolveAdminUploadTarget,
} from "../lib/adminStorageUpload.js";
import { ApiError } from "../lib/errors.js";
import {
  parseCreateAdminModuleBody,
  parseSlotOrderParam,
  parseUpdateAdminSlotBody,
} from "../lib/parseAdminBody.js";
import { assertAdmin, requireAdmin } from "../middleware/requireAdmin.js";
import {
  createAdminModule,
  deleteAdminModule,
  getAdminModuleDetail,
  listAdminModules,
  publishAdminModule,
  updateAdminSlot,
} from "../services/curriculum.js";
import { getAdminNodeAttempts } from "../services/adminReports.js";
import { uploadStorageObject } from "../lib/supabaseStorage.js";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

function handleMulterError(
  err: unknown,
  _req: Request,
  _res: Response,
  next: NextFunction
) {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(
        new ApiError(413, "INVALID_UPLOAD", "El archivo supera el límite de 50 MB.")
      );
    }
    return next(new ApiError(400, "INVALID_UPLOAD", "No pudimos leer el archivo subido."));
  }
  return next(err);
}

/** T1.5 — subida de video/PDF al bucket correcto (solo admin autenticado). */
adminRouter.post("/storage/upload", (req, res, next) => {
  adminStorageUploadMiddleware(req, res, (err) => {
    if (err) {
      return handleMulterError(err, req, res, next);
    }
    next();
  });
}, async (req, res, next) => {
  try {
    assertAdmin(req);
    const target = resolveAdminUploadTarget(req);
    const materialUrl = await uploadStorageObject(target);
    res.status(201).json({
      kind: target.kind,
      bucket: target.bucket,
      objectPath: target.objectPath,
      materialUrl,
    });
  } catch (error) {
    next(error);
  }
});

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

adminRouter.delete("/modules/:moduleId", async (req, res, next) => {
  try {
    assertAdmin(req);
    const payload = await deleteAdminModule(req.params.moduleId);
    res.json(payload);
  } catch (error) {
    next(error);
  }
});

adminRouter.get("/nodes/:nodeId/attempts", async (req, res, next) => {
  try {
    assertAdmin(req);
    const payload = await getAdminNodeAttempts(req.params.nodeId);
    res.set("Cache-Control", "no-store");
    res.json(payload);
  } catch (error) {
    next(error);
  }
});
