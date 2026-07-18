import { Router } from "express";
import { config } from "../config.js";
import { ApiError } from "../lib/errors.js";
import {
  assertProfileAccess,
  resolveLearnerContext,
  toImplicitProfileH1,
} from "../lib/learnerContextH1.js";
import {
  completeOnboardingH1,
  getOnboardingStateH1,
  patchProfileSettingsH1,
  savePartialOnboardingH1,
} from "../lib/onboardingH1.js";
import { parseLibraryQueryH1 } from "../lib/libraryH1.js";
import {
  buildLibraryItemDetailH1Async,
  buildLibraryViewH1Async,
} from "../lib/libraryCatalogBridge.js";
import { buildPathViewH1Async } from "../lib/pathViewH1.js";
import { buildProgressViewH1Async } from "../lib/progressViewH1.js";
import { assertStudent, realStudentAuth } from "../middleware/realStudentAuth.js";
import { buildAccessResponse } from "../services/accessService.js";
import { buildDashboardResponse, buildPathResponse } from "../services/meService.js";

export const meRouter = Router();

meRouter.use(realStudentAuth);

/** P0-01 H1: LearnerContextH1 (profileId = userId, puente temporal D-DOM-001). */
meRouter.get("/", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({ context });
  } catch (error) {
    next(error);
  }
});

/**
 * P0-01 H1: exactamente 1 perfil implícito (id = userId).
 * Multi-perfil (H2+) no implementado.
 */
meRouter.get("/profiles", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({ profiles: [toImplicitProfileH1(context)] });
  } catch (error) {
    next(error);
  }
});

meRouter.get("/profiles/:profileId", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    assertProfileAccess(student.id, req.params.profileId);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({ profile: toImplicitProfileH1(context) });
  } catch (error) {
    next(error);
  }
});

/** H1: crear segundo perfil prohibido. */
meRouter.post("/profiles", (_req, _res, next) => {
  next(
    new ApiError(
      405,
      "METHOD_NOT_ALLOWED",
      "Crear perfiles adicionales no está permitido en H1 (D-DOM-001)."
    )
  );
});

/** H1: activate solo es no-op si profileId = session.userId. */
meRouter.post("/profiles/:profileId/activate", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    assertProfileAccess(student.id, req.params.profileId);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({
      activated: true,
      profile: toImplicitProfileH1(context),
      note: "H1: perfil implícito 1:1; activate es no-op exitoso.",
    });
  } catch (error) {
    next(error);
  }
});

/** P0-02: estado onboarding (H1 proyección — memoria o DB vía PD-3). */
meRouter.get("/onboarding", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const state = await getOnboardingStateH1(student.id);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({
      status: state.status,
      partialAnswers: state.partialAnswers,
      result: state.result,
      context,
    });
  } catch (error) {
    next(error);
  }
});

/** P0-02: guardar parcial → in_progress. */
meRouter.put("/onboarding", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const projection = await savePartialOnboardingH1(student.id, req.body);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({
      status: projection.onboardingStatus,
      partialAnswers: projection.partialAnswers,
      context,
    });
  } catch (error) {
    next(error);
  }
});

/** P0-02: completar diagnóstico → escribe Perfil H1. */
meRouter.post("/onboarding/complete", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const { result } = await completeOnboardingH1(student.id, req.body);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.status(200).json({ result, context });
  } catch (error) {
    next(error);
  }
});

/** P0-02: edición ligera meta/goal (sin reabrir wizard). */
meRouter.patch("/profile", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    await patchProfileSettingsH1(student.id, req.body);
    const context = await resolveLearnerContext(student);
    res.set("Cache-Control", "no-store");
    res.json({ context, profile: toImplicitProfileH1(context) });
  } catch (error) {
    next(error);
  }
});

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

/**
 * P0-06 H1: ProgressViewH1 — evidencia derivada de eventos P0-05.
 * PD-3: meta.eventSource = db | memory_bridge_h1 según GMUSIC_H1_DURABLE.
 */
meRouter.get("/progress", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const context = await resolveLearnerContext(student);
    const accessPayload = await buildAccessResponse(student);
    const progressViewH1 = await buildProgressViewH1Async({
      context,
      access: accessPayload.entitlements,
      timezone: student.timezone || "America/Santiago",
    });

    res.set("Cache-Control", "no-store");
    res.json({
      progressViewH1,
      learnerContext: context,
      entitlements: accessPayload.entitlements,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * P0-08 H1: LibraryViewH1 — catálogo básico filtrado por Entitlements.
 * Refuerzo, no reemplazo de Mi Camino. Premium siempre locked (MVP).
 * PD-4: catálogo desde DB sembrada si GMUSIC_H1_DURABLE=1; fixture si OFF.
 */
meRouter.get("/library", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const context = await resolveLearnerContext(student);
    const accessPayload = await buildAccessResponse(student);
    const parsed = parseLibraryQueryH1(req.query);
    const libraryViewH1 = await buildLibraryViewH1Async({
      context,
      grants: accessPayload.entitlements.grants,
      filters: parsed,
    });

    res.set("Cache-Control", "no-store");
    res.json({ libraryViewH1 });
  } catch (error) {
    next(error);
  }
});

meRouter.get("/library/:id", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const context = await resolveLearnerContext(student);
    const accessPayload = await buildAccessResponse(student);
    const item = await buildLibraryItemDetailH1Async({
      context,
      grants: accessPayload.entitlements.grants,
      resourceId: req.params.id,
    });

    res.set("Cache-Control", "no-store");
    res.json({ item });
  } catch (error) {
    next(error);
  }
});

meRouter.get("/path", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const context = await resolveLearnerContext(student);
    const courseSlug =
      typeof req.query.courseSlug === "string" && req.query.courseSlug.length > 0
        ? req.query.courseSlug
        : config.defaultCourseSlug;

    const payload = await buildPathResponse(student, courseSlug);
    const accessPayload = await buildAccessResponse(student);
    const grants = accessPayload.entitlements.grants;
    const pathViewH1 = await buildPathViewH1Async({
      context,
      access: accessPayload.entitlements,
    });

    res.set("Cache-Control", "no-store");
    res.json({
      ...payload,
      /** P0-02 soft gate: Camino profundo aconseja completar onboarding. */
      onboarding: {
        required: !context.onboardingCompleted,
        completed: context.onboardingCompleted,
        currentMonth: context.currentMonth,
        firstUnitId: context.firstUnitId,
        nextCardId: context.nextCardId,
        instrument: context.instrument,
        activeRutaSlug: context.activeRutaSlug,
      },
      learnerContext: context,
      /** P0-07: blockers ENTITLEMENT amables (servidor; sin authz en UI). */
      entitlements: accessPayload.entitlements,
      /** P0-04: contrato backend de Mi Camino; UI futura solo renderiza esto. */
      pathViewH1,
      entitlementBlockers: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
        .filter((month) => !grants.monthsPlayable.includes(month))
        .slice(0, 3)
        .map((month) => ({
          code: "ENTITLEMENT" as const,
          monthIndex: month,
          requirement: `Plan que incluye el Mes ${month}`,
          reason: `Mes ${month} visible pero no jugable con tu acceso actual.`,
          actionLabel: "Ver planes",
          actionTarget: "/#planes",
        })),
    });
  } catch (error) {
    next(error);
  }
});
