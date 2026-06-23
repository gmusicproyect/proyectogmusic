import type express from "express";

function parseAllowedOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getCorsAllowedOriginsFromEnv(env: NodeJS.ProcessEnv = process.env): string[] {
  return parseAllowedOrigins(env.CORS_ALLOWED_ORIGINS);
}

export function createCorsMiddleware(allowedOrigins?: readonly string[]) {
  const origins = allowedOrigins ?? getCorsAllowedOriginsFromEnv();

  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const origin = req.headers.origin;
    if (origin && origins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
      res.setHeader("Vary", "Origin");
    }

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    return next();
  };
}
