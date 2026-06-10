import { timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { errorBody } from "./errors.js";

const DEV_ACTIVATION_KEY_HEADER = "x-gmusic-dev-activation-key";
export const DEV_ACTIVATION_KEY_MIN_LENGTH = 24;
export const DEV_ACTIVATION_PLACEHOLDER = "change-me-in-local-env";

function respondNotFound(res: Response): void {
  res.status(404).json(errorBody("INTERNAL_ERROR", "Ruta no encontrada."));
}

export function isDevActivationKeyConfigured(rawKey: string | undefined): rawKey is string {
  const key = rawKey?.trim();
  if (!key) return false;
  if (key === DEV_ACTIVATION_PLACEHOLDER) return false;
  if (key.length < DEV_ACTIVATION_KEY_MIN_LENGTH) return false;
  return true;
}

function keysMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function devActivationGate(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === "production") {
    respondNotFound(res);
    return;
  }

  const expectedKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;
  if (!isDevActivationKeyConfigured(expectedKey)) {
    respondNotFound(res);
    return;
  }

  const providedKey = req.get(DEV_ACTIVATION_KEY_HEADER)?.trim();
  if (!providedKey || !keysMatch(expectedKey, providedKey)) {
    respondNotFound(res);
    return;
  }

  next();
}
