import { Router } from "express";
import { appendSessionClearCookie, appendSessionCookie } from "../lib/jwtSession.js";
import { loginStudent, registerStudent } from "../services/authService.js";

export const authRouter = Router();

authRouter.post("/register", async (req, res, next) => {
  try {
    const result = await registerStudent(req.body);
    res.set("Cache-Control", "no-store");
    appendSessionCookie(res, result.token);
    res.status(201).json({ user: result.user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const result = await loginStudent(req.body);
    res.set("Cache-Control", "no-store");
    appendSessionCookie(res, result.token);
    res.status(200).json({ user: result.user });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.set("Cache-Control", "no-store");
  appendSessionClearCookie(res);
  res.status(204).send();
});
