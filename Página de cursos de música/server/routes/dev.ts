import { Router } from "express";
import { appendSessionClearCookie, appendSessionCookie } from "../lib/jwtSession.js";
import { config } from "../config.js";
import { devActivationGate } from "../lib/devActivationGate.js";
import {
  buildDevStudentLoggedOutSessionCookie,
  buildDevStudentSessionCookie,
} from "../lib/devStudentCookie.js";
import { parseActivateSemestralBody } from "../lib/parseActivateSemestralBody.js";
import { signSessionToken } from "../lib/jwtSession.js";
import { prisma } from "../lib/prisma.js";
import { activateSemestralSubscription } from "../services/activateSemestralService.js";

export const devRouter = Router();

devRouter.use(devActivationGate);

devRouter.post("/activate-semestral", async (req, res, next) => {
  try {
    const input = parseActivateSemestralBody(req.body);
    const result = await activateSemestralSubscription(input);
    const token = await signSessionToken(result.payload.user.id);
    const status = result.kind === "created" ? 201 : 200;
    res.set("Cache-Control", "no-store");
    res.append("Set-Cookie", buildDevStudentSessionCookie(input.email));
    appendSessionCookie(res, token);
    res.status(status).json(result.payload);
  } catch (error) {
    next(error);
  }
});

devRouter.post("/logout", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.append("Set-Cookie", buildDevStudentLoggedOutSessionCookie());
  appendSessionClearCookie(res);
  res.status(204).send();
});

devRouter.post("/login", async (_req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email: config.devStudentEmail },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: `Alumno de desarrollo no encontrado (${config.devStudentEmail}). Ejecuta npm run db:seed.`,
        },
      });
    }

    const token = await signSessionToken(user.id);
    res.set("Cache-Control", "no-store");
    appendSessionCookie(res, token);
    res.status(200).json({ user: { id: user.id, name: user.name, email: user.email } });
  } catch (error) {
    next(error);
  }
});
