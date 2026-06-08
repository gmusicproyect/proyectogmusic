import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";
import { Role } from "@prisma/client";
import { config } from "../config.js";
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
 * Resuelve al alumno por GMUSIC_DEV_USER_EMAIL (default: carlos@gmusic.academy).
 * Reemplazar por JWT/sesión real antes de staging/producción.
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

    const user = await prisma.user.findUnique({
      where: { email: config.devStudentEmail },
    });

    if (!user) {
      return res.status(401).json(
        errorBody(
          "UNAUTHORIZED",
          `Alumno de desarrollo no encontrado (${config.devStudentEmail}). Ejecuta npm run db:seed.`
        )
      );
    }

    if (user.role !== Role.STUDENT) {
      return res.status(403).json(
        errorBody("FORBIDDEN", "GMUSIC_DEV_USER_EMAIL debe apuntar a un usuario STUDENT.")
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
