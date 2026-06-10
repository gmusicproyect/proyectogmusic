import { createHmac, timingSafeEqual } from "node:crypto";
import { isDevActivationKeyConfigured } from "./devActivationGate.js";

export const DEV_STUDENT_COOKIE_NAME = "gmusic_dev_student_email";
export const DEV_STUDENT_COOKIE_PATH = "/api/v1";
export const DEV_STUDENT_COOKIE_MAX_AGE_SECONDS = 28800;
export const DEV_STUDENT_EMAIL_MAX_LENGTH = 254;
export const DEV_STUDENT_COOKIE_SIGNATURE_HEX_LENGTH = 64;
export const DEV_STUDENT_COOKIE_MAX_PAYLOAD_LENGTH = 400;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SIGNATURE_HEX_RE = /^[a-f0-9]{64}$/;

function normalizeDevStudentEmail(email: string): string | null {
  const normalized = email.trim().toLowerCase();
  if (!normalized || normalized.length > DEV_STUDENT_EMAIL_MAX_LENGTH) return null;
  if (!EMAIL_RE.test(normalized)) return null;
  return normalized;
}

export function parseCookieHeader(header: string | undefined): Map<string, string> {
  const cookies = new Map<string, string>();
  if (!header) return cookies;

  for (const segment of header.split(";")) {
    const trimmed = segment.trim();
    if (!trimmed) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex <= 0) continue;

    const name = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    if (!name) continue;

    cookies.set(name, rawValue);
  }

  return cookies;
}

function computeDevStudentCookieSignature(email: string, signingKey: string): string {
  return createHmac("sha256", signingKey).update(email).digest("hex");
}

function signaturesMatch(expectedHex: string, providedHex: string): boolean {
  if (!SIGNATURE_HEX_RE.test(expectedHex) || !SIGNATURE_HEX_RE.test(providedHex)) {
    return false;
  }

  const expectedBuffer = Buffer.from(expectedHex, "hex");
  const providedBuffer = Buffer.from(providedHex, "hex");
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function signDevStudentCookiePayload(email: string, signingKey: string): string {
  const normalized = normalizeDevStudentEmail(email);
  if (!normalized) {
    throw new Error("Email inválido para firmar cookie de sesión de desarrollo.");
  }

  const signature = computeDevStudentCookieSignature(normalized, signingKey);
  return `${normalized}.${signature}`;
}

export function verifyDevStudentCookiePayload(
  rawPayload: string,
  signingKey: string
): string | null {
  if (!rawPayload || rawPayload.length > DEV_STUDENT_COOKIE_MAX_PAYLOAD_LENGTH) {
    return null;
  }

  if (rawPayload.length <= DEV_STUDENT_COOKIE_SIGNATURE_HEX_LENGTH + 1) {
    return null;
  }

  const separatorIndex = rawPayload.length - DEV_STUDENT_COOKIE_SIGNATURE_HEX_LENGTH - 1;
  if (rawPayload.charAt(separatorIndex) !== ".") {
    return null;
  }

  const email = rawPayload.slice(0, separatorIndex);
  const signature = rawPayload.slice(separatorIndex + 1);
  const normalized = normalizeDevStudentEmail(email);
  if (!normalized) return null;

  const expectedSignature = computeDevStudentCookieSignature(normalized, signingKey);
  if (!signaturesMatch(expectedSignature, signature)) {
    return null;
  }

  return normalized;
}

function decodeCookieRawValue(rawValue: string): string | null {
  if (!rawValue) return null;

  try {
    return decodeURIComponent(rawValue);
  } catch {
    return null;
  }
}

export function readDevStudentEmailFromCookieHeader(
  header: string | undefined,
  signingKey: string
): string | null {
  const cookies = parseCookieHeader(header);
  const rawValue = cookies.get(DEV_STUDENT_COOKIE_NAME);
  if (rawValue === undefined) return null;

  const payload = decodeCookieRawValue(rawValue);
  if (!payload) return null;
  return verifyDevStudentCookiePayload(payload, signingKey);
}

export type DevStudentEmailResolution =
  | { kind: "resolved"; email: string }
  | { kind: "invalid_cookie" }
  | { kind: "fallback" };

export function resolveDevStudentEmail(
  cookieHeader: string | undefined
): DevStudentEmailResolution {
  const cookies = parseCookieHeader(cookieHeader);
  if (!cookies.has(DEV_STUDENT_COOKIE_NAME)) {
    return { kind: "fallback" };
  }

  const signingKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;
  if (!isDevActivationKeyConfigured(signingKey)) {
    return { kind: "invalid_cookie" };
  }

  const payload = decodeCookieRawValue(cookies.get(DEV_STUDENT_COOKIE_NAME) ?? "");
  if (!payload) {
    return { kind: "invalid_cookie" };
  }

  const email = verifyDevStudentCookiePayload(payload, signingKey);
  if (!email) {
    return { kind: "invalid_cookie" };
  }

  return { kind: "resolved", email };
}

export function buildDevStudentSessionCookie(email: string): string {
  const signingKey = process.env.GMUSIC_DEV_ACTIVATION_KEY;
  if (!isDevActivationKeyConfigured(signingKey)) {
    throw new Error("GMUSIC_DEV_ACTIVATION_KEY no está configurada para emitir sesión.");
  }

  const payload = signDevStudentCookiePayload(email, signingKey);
  const encoded = encodeURIComponent(payload);
  return `${DEV_STUDENT_COOKIE_NAME}=${encoded}; HttpOnly; SameSite=Strict; Path=${DEV_STUDENT_COOKIE_PATH}; Max-Age=${DEV_STUDENT_COOKIE_MAX_AGE_SECONDS}`;
}

export function buildDevStudentSessionClearCookie(): string {
  return `${DEV_STUDENT_COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=${DEV_STUDENT_COOKIE_PATH}; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

export function buildDevStudentCookieHeaderValue(
  email: string,
  signingKey: string
): string {
  return encodeURIComponent(signDevStudentCookiePayload(email, signingKey));
}
