import { Router } from "express";
import { assertStudent, realStudentAuth } from "../middleware/realStudentAuth.js";
import { parseCreateCommunityPostBody } from "../lib/parseCreateCommunityPostBody.js";
import { parseUpsertCommunityEnrollmentBody } from "../lib/parseUpsertCommunityEnrollmentBody.js";
import {
  createCommunityPostForStudent,
  getCommunityEnrollmentForStudent,
  listCommunityPostsForStudent,
  upsertCommunityEnrollmentForStudent,
} from "../services/communityService.js";

export const communityRouter = Router();

communityRouter.use(realStudentAuth);

communityRouter.get("/enrollment", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const enrollment = await getCommunityEnrollmentForStudent(student);
    res.set("Cache-Control", "no-store");
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
});

communityRouter.put("/enrollment", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const input = parseUpsertCommunityEnrollmentBody(req.body);
    const enrollment = await upsertCommunityEnrollmentForStudent(student, input);
    res.json({ enrollment });
  } catch (error) {
    next(error);
  }
});

communityRouter.get("/posts", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const posts = await listCommunityPostsForStudent(student);
    res.set("Cache-Control", "no-store");
    res.json({ posts });
  } catch (error) {
    next(error);
  }
});

communityRouter.post("/posts", async (req, res, next) => {
  try {
    const student = assertStudent(req);
    const input = parseCreateCommunityPostBody(req.body);
    const post = await createCommunityPostForStudent(student, input);
    res.status(201).json({ post });
  } catch (error) {
    next(error);
  }
});
