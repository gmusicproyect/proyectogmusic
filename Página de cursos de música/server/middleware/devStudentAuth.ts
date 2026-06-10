import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";
import { Role } from "@prisma/client";
import { config } from "../config.js";
import { resolveDevStudentEmail } from "../lib/devStudentCookie.js";
import { ApiError, errorBody } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      student?: User;
    }
  }
}

/**
 * Autenticación exclusiva de desarrollo.
 * Resuelve al alumno por cookie HttpOnly de sesión local o, si no existe,
 * por GMUSIC_DEV_USER_EMAIL. Reemplazar por JWT/sesión real antes de producción.
 */
export async function devStudentAuth(req: Request, res: Response, next: NextFunction) {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(401).json(
        errorBody(
          "UNAUTHORIZED",
          "Autenticación de desarrollo deshabilitada en producción."
        )
      );
    }

    const resolution = resolveDevStudentEmail(req.headers.cookie);

    if (resolution.kind === "invalid_cookie") {
      return res.status(401).json(
        errorBody("UNAUTHORIZED", "Sesión de desarrollo inválida.")
      );
    }

    const email =
      resolution.kind === "resolved" ? resolution.email : config.devStudentEmail;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json(
        errorBody(
          "UNAUTHORIZED",
          resolution.kind === "resolved"
            ? "Alumno de la sesión de desarrollo no encontrado."
            : `Alumno de desarrollo no encontrado (${config.devStudentEmail}). Ejecuta npm run db:seed.`
        )
      );
    }

    if (user.role !== Role.STUDENT) {
      return res.status(403).json(
        errorBody(
          "FORBIDDEN",
          resolution.kind === "resolved"
            ? "La sesión de desarrollo solo puede representar un usuario STUDENT."
            : "GMUSIC_DEV_USER_EMAIL debe apuntar a un usuario STUDENT."
        )
      );
    }

    req.student = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function assertStudent(req: Request): User {
  if (!req.student) {
    throw new ApiError(401, "UNAUTHORIZED", "Alumno no autenticado.");
  }
  return req.student;
}
