import type { NextFunction, Request, Response } from "express";
import type { User } from "@prisma/client";
import { Role } from "@prisma/client";
import { ApiError, errorBody } from "../lib/errors.js";
import { readSessionTokenFromRequest, verifySessionToken } from "../lib/jwtSession.js";
import { prisma } from "../lib/prisma.js";

declare global {
  namespace Express {
    interface Request {
      admin?: User;
    }
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
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

    if (user.role !== Role.ADMIN) {
      return res.status(403).json(errorBody("FORBIDDEN", "Solo administradores pueden acceder."));
    }

    req.admin = user;
    next();
  } catch (error) {
    next(error);
  }
}

export function assertAdmin(req: Request): User {
  if (!req.admin) {
    throw new ApiError(401, "UNAUTHORIZED", "Administrador no autenticado.");
  }
  return req.admin;
}
