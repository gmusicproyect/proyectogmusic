import { Router } from "express";
import { devActivationGate } from "../lib/devActivationGate.js";
import {
  buildDevStudentSessionClearCookie,
  buildDevStudentSessionCookie,
} from "../lib/devStudentCookie.js";
import { parseActivateSemestralBody } from "../lib/parseActivateSemestralBody.js";
import { activateSemestralSubscription } from "../services/activateSemestralService.js";

export const devRouter = Router();

devRouter.use(devActivationGate);

devRouter.post("/activate-semestral", async (req, res, next) => {
  try {
    const input = parseActivateSemestralBody(req.body);
    const result = await activateSemestralSubscription(input);
    const status = result.kind === "created" ? 201 : 200;
    res.set("Cache-Control", "no-store");
    res.append("Set-Cookie", buildDevStudentSessionCookie(input.email));
    res.status(status).json(result.payload);
  } catch (error) {
    next(error);
  }
});

devRouter.post("/logout", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.append("Set-Cookie", buildDevStudentSessionClearCookie());
  res.status(204).send();
});
