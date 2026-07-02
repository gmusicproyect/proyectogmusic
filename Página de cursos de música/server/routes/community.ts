import { Router } from "express";
import { assertStudent, realStudentAuth } from "../middleware/realStudentAuth.js";
import { parseCreateCommunityPostBody } from "../lib/parseCreateCommunityPostBody.js";
import {
  createCommunityPostForStudent,
  listCommunityPostsForStudent,
} from "../services/communityService.js";

export const communityRouter = Router();

communityRouter.use(realStudentAuth);

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
