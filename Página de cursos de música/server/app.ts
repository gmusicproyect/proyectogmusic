import * as Sentry from "@sentry/node";
import express from "express";
import { createCorsMiddleware } from "./lib/cors.js";
import { ApiError, errorBody } from "./lib/errors.js";
import { adminRouter } from "./routes/admin.js";
import { authRouter } from "./routes/auth.js";
import { communityRouter } from "./routes/community.js";
import { devRouter } from "./routes/dev.js";
import { healthRouter } from "./routes/health.js";
import { lessonSessionsRouter } from "./routes/lessonSessions.js";
import { meRouter } from "./routes/me.js";
import { onboardingRouter } from "./routes/onboarding.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(createCorsMiddleware());
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      service: "gmusic-learning-engine",
      version: "v1",
      docs: "/api/v1/health",
      auth: "JWT httpOnly cookie (gmusic_session)",
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/me", meRouter);
  app.use("/api/v1/onboarding", onboardingRouter);
  app.use("/api/v1/lesson-sessions", lessonSessionsRouter);
  app.use("/api/v1/community", communityRouter);
  app.use("/api/v1/admin", adminRouter);
  app.use("/api/v1/dev", devRouter);

  app.use((_req, res) => {
    res.status(404).json(errorBody("INTERNAL_ERROR", "Ruta no encontrada."));
  });

  if (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.setupExpressErrorHandler(app);
  }

  app.use(
    (
      err: unknown,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof ApiError) {
        return res.status(err.status).json(errorBody(err.code, err.message));
      }

      console.error("[api]", err);
      if (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) {
        Sentry.captureException(err);
      }
      return res.status(500).json(errorBody("INTERNAL_ERROR", "Error interno del servidor."));
    }
  );

  return app;
}
