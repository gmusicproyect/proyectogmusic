import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";
import { Role } from "@prisma/client";
import { ApiError, errorBody } from "../lib/errors.js";
import { readSessionTokenFromRequest, verifySessionToken } from "../lib/jwtSession.js";
import { prisma } from "../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      student?: User;
    }
  }
}

export async function realStudentAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = readSessionTokenFromRequest(req);
    if (!token) {
      return res.status(401).json(errorBody("UNAUTHORIZED", "Sesión no autenticada."));
    }

    const verified = await verifySessionToken(token);
    if (!verified) {
      return res.status(401).json(errorBody("UNAUTHORIZED", "Sesión inválida o expirada."));
    }

    const user = await prisma.user.findUnique({
      where: { id: verified.userId },
    });

    if (!user) {
      return res.status(401).json(errorBody("UNAUTHORIZED", "Usuario no encontrado."));
    }

    if (user.role !== Role.STUDENT) {
      return res.status(403).json(errorBody("FORBIDDEN", "Solo alumnos pueden acceder."));
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
