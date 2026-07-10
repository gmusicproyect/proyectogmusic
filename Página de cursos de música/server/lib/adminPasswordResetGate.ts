import { timingSafeEqual } from "node:crypto";

export const ADMIN_PASSWORD_RESET_KEY_MIN_LENGTH = 24;
export const ADMIN_PASSWORD_RESET_PLACEHOLDER = "change-me-admin-reset-key";

export function isAdminPasswordResetKeyConfigured(rawKey: string | undefined): rawKey is string {
  const key = rawKey?.trim();
  if (!key) return false;
  if (key === ADMIN_PASSWORD_RESET_PLACEHOLDER) return false;
  if (key.length < ADMIN_PASSWORD_RESET_KEY_MIN_LENGTH) return false;
  return true;
}

export function adminRecoveryKeysMatch(expected: string, provided: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function getConfiguredAdminPasswordResetKey(): string | undefined {
  const key = process.env.ADMIN_PASSWORD_RESET_KEY?.trim();
  return isAdminPasswordResetKeyConfigured(key) ? key : undefined;
}
