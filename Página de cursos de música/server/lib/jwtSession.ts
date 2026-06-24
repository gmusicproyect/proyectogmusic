import { SignJWT, jwtVerify } from "jose";
import type express from "express";
import { config } from "../config.js";

export const SESSION_COOKIE_NAME = "gmusic_session";
export const SESSION_COOKIE_PATH = "/api/v1";
export const SESSION_MAX_AGE_SECONDS = 28800;

function getJwtSecretKey(): Uint8Array {
  const secret = config.jwtSecret;
  if (!secret) {
    throw new Error("JWT_SECRET no configurada.");
  }
  return new TextEncoder().encode(secret);
}

export async function signSessionToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt(now)
    .setExpirationTime(now + SESSION_MAX_AGE_SECONDS)
    .sign(getJwtSecretKey());
}

export async function verifySessionToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey(), {
      algorithms: ["HS256"],
    });
    const userId = payload.sub;
    if (typeof userId !== "string" || !userId.trim()) {
      return null;
    }
    return { userId };
  } catch {
    return null;
  }
}

function buildCookieValue(token: string | null, maxAge: number, isProduction: boolean): string {
  const value = token ? encodeURIComponent(token) : "";
  const parts = [
    `${SESSION_COOKIE_NAME}=${value}`,
    "HttpOnly",
    "SameSite=Strict",
    `Path=${SESSION_COOKIE_PATH}`,
    `Max-Age=${maxAge}`,
  ];
  if (isProduction) {
    parts.push("Secure");
  }
  return parts.join("; ");
}

export function buildSessionCookie(token: string, isProduction: boolean): string {
  return buildCookieValue(token, SESSION_MAX_AGE_SECONDS, isProduction);
}

export function buildSessionClearCookie(isProduction: boolean): string {
  return buildCookieValue(null, 0, isProduction);
}

export function readSessionTokenFromRequest(req: express.Request): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  for (const segment of cookieHeader.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed.startsWith(`${SESSION_COOKIE_NAME}=`)) continue;
    const rawValue = trimmed.slice(SESSION_COOKIE_NAME.length + 1).trim();
    if (!rawValue) return null;
    try {
      return decodeURIComponent(rawValue);
    } catch {
      return null;
    }
  }

  return null;
}

export function appendSessionCookie(res: express.Response, token: string): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.append("Set-Cookie", buildSessionCookie(token, isProduction));
}

export function appendSessionClearCookie(res: express.Response): void {
  const isProduction = process.env.NODE_ENV === "production";
  res.append("Set-Cookie", buildSessionClearCookie(isProduction));
}
