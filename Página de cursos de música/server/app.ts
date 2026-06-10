import express from "express";
import { ApiError, errorBody } from "./lib/errors.js";
import { devRouter } from "./routes/dev.js";
import { healthRouter } from "./routes/health.js";
import { lessonSessionsRouter } from "./routes/lessonSessions.js";
import { meRouter } from "./routes/me.js";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      service: "gmusic-learning-engine",
      version: "v1",
      docs: "/api/v1/health",
      auth: "development-only via GMUSIC_DEV_USER_EMAIL",
    });
  });

  app.use("/api/v1/health", healthRouter);
  app.use("/api/v1/me", meRouter);
  app.use("/api/v1/lesson-sessions", lessonSessionsRouter);
  app.use("/api/v1/dev", devRouter);

  app.use((_req, res) => {
    res.status(404).json(errorBody("INTERNAL_ERROR", "Ruta no encontrada."));
  });

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
      return res.status(500).json(errorBody("INTERNAL_ERROR", "Error interno del servidor."));
    }
  );

  return app;
}
