import type { NextFunction, Request, Response } from "express";
import { ApiError } from "./errors.js";

export interface TutorRateLimitOptions {
  /** Ventana en ms (default 60s). */
  windowMs?: number;
  /** Máx. requests por clave en la ventana (default 20). */
  max?: number;
  now?: () => number;
  keyFromRequest?: (req: Request) => string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

/**
 * Rate limit in-memory por IP (o clave). Sin deps nuevas.
 * Exporta factory para tests con reloj/contadores inyectables.
 */
export function createTutorRateLimit(options: TutorRateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 20;
  const now = options.now ?? Date.now;
  const keyFromRequest =
    options.keyFromRequest ??
    ((req: Request) => {
      const forwarded = req.headers["x-forwarded-for"];
      if (typeof forwarded === "string" && forwarded.trim()) {
        return forwarded.split(",")[0]?.trim() || "unknown";
      }
      return req.ip || req.socket.remoteAddress || "unknown";
    });

  const buckets = new Map<string, Bucket>();

  function resetForTests() {
    buckets.clear();
  }

  function middleware(req: Request, _res: Response, next: NextFunction) {
    try {
      const key = keyFromRequest(req);
      const t = now();
      let bucket = buckets.get(key);
      if (!bucket || t >= bucket.resetAt) {
        bucket = { count: 0, resetAt: t + windowMs };
        buckets.set(key, bucket);
      }
      bucket.count += 1;
      if (bucket.count > max) {
        throw new ApiError(
          429,
          "RATE_LIMITED",
          "Demasiadas preguntas al tutor. Esperá un momento e intentá de nuevo."
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  }

  return { middleware, resetForTests, windowMs, max };
}

export const tutorRateLimit = createTutorRateLimit();
