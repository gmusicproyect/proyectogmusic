import type { NextFunction, Request, Response } from "express";
import { errorBody } from "../lib/errors.js";
import { readSessionTokenFromRequest, verifySessionToken } from "../lib/jwtSession.js";

/**
 * Auth ligera del tutor:
 * - Default OFF (lab /api/v1/tutor público + rate limit).
 * - Con TUTOR_REQUIRE_AUTH=1 exige cookie JWT válida (cualquier usuario).
 */
export function tutorRequireAuthEnabled(): boolean {
  const raw = (process.env.TUTOR_REQUIRE_AUTH ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

export async function requireTutorSessionIfConfigured(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!tutorRequireAuthEnabled()) {
    next();
    return;
  }

  try {
    const token = readSessionTokenFromRequest(req);
    if (!token) {
      res.status(401).json(errorBody("UNAUTHORIZED", "Sesión requerida para usar el tutor."));
      return;
    }
    const verified = await verifySessionToken(token);
    if (!verified) {
      res.status(401).json(errorBody("UNAUTHORIZED", "Sesión inválida o expirada."));
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
