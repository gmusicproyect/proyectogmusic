import { SESSION_COOKIE_NAME } from "../../lib/jwtSession.js";
import { signSessionToken } from "../../lib/jwtSession.js";
import { createApp } from "../../app.js";
import request, { type Test } from "supertest";
import { getDevStudent } from "./db.js";

export async function buildSessionCookieHeader(userId: string): Promise<string> {
  const token = await signSessionToken(userId);
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}`;
}

let cachedDevStudentCookie: string | null = null;

export async function getDevStudentSessionCookie(): Promise<string> {
  if (!cachedDevStudentCookie) {
    const student = await getDevStudent();
    cachedDevStudentCookie = await buildSessionCookieHeader(student.id);
  }
  return cachedDevStudentCookie;
}

export async function authedGet(path: string, app = createApp()): Promise<Test> {
  const cookie = await getDevStudentSessionCookie();
  return request(app).get(path).set("Cookie", cookie);
}

export async function authedPost(path: string, app = createApp()): Promise<Test> {
  const cookie = await getDevStudentSessionCookie();
  return request(app).post(path).set("Cookie", cookie);
}

export async function authedPut(path: string, app = createApp()): Promise<Test> {
  const cookie = await getDevStudentSessionCookie();
  return request(app).put(path).set("Cookie", cookie);
}

export function withSessionCookie(
  req: { set: (field: string, value: string) => unknown },
  cookieHeader: string
) {
  return req.set("Cookie", cookieHeader);
}
