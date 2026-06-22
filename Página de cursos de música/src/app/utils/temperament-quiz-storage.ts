import type { TemperamentQuizResult } from "../data/temperament-quiz";
import {
  mapTemperamentQuizResultToApiBody,
  submitTemperamentQuiz,
} from "../services/gmusic-api/submit-temperament-quiz";

const SESSION_KEY = "gmusic_onboarding_session_id";
const RESULT_KEY = "gmusic_temperament_quiz_result";
const SKIPPED_KEY = "gmusic_temperament_quiz_skipped";
const PENDING_SYNC_KEY = "gmusic_temperament_quiz_pending_sync";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getOrCreateOnboardingSessionId(): string {
  if (!canUseStorage()) return "anonymous-session";

  const existing = localStorage.getItem(SESSION_KEY);
  if (existing) return existing;

  const sessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}`;

  localStorage.setItem(SESSION_KEY, sessionId);
  return sessionId;
}

export function isTemperamentQuizCompleted(): boolean {
  if (!canUseStorage()) return false;
  return Boolean(localStorage.getItem(RESULT_KEY));
}

export function wasTemperamentQuizSkipped(): boolean {
  if (!canUseStorage()) return false;
  return localStorage.getItem(SKIPPED_KEY) === "true";
}

export function shouldShowTemperamentQuiz(): boolean {
  return !isTemperamentQuizCompleted() && !wasTemperamentQuizSkipped();
}

function writeLocalQuizResult(result: TemperamentQuizResult): void {
  if (!canUseStorage()) return;
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
  localStorage.removeItem(SKIPPED_KEY);
}

function writePendingSyncPayload(result: TemperamentQuizResult, referrerPath?: string | null): void {
  if (!canUseStorage()) return;
  localStorage.setItem(
    PENDING_SYNC_KEY,
    JSON.stringify(mapTemperamentQuizResultToApiBody(result, { referrerPath }))
  );
}

function clearPendingSyncPayload(): void {
  if (!canUseStorage()) return;
  localStorage.removeItem(PENDING_SYNC_KEY);
}

export async function saveTemperamentQuizResult(
  result: TemperamentQuizResult,
  options?: { referrerPath?: string | null }
): Promise<{ persistedToDatabase: boolean }> {
  try {
    await submitTemperamentQuiz(result, { referrerPath: options?.referrerPath ?? null });
    writeLocalQuizResult(result);
    clearPendingSyncPayload();
    return { persistedToDatabase: true };
  } catch {
    writeLocalQuizResult(result);
    writePendingSyncPayload(result, options?.referrerPath ?? null);
    return { persistedToDatabase: false };
  }
}

export async function flushPendingTemperamentQuizSync(): Promise<boolean> {
  if (!canUseStorage()) return false;

  const raw = localStorage.getItem(PENDING_SYNC_KEY);
  if (!raw) return false;

  try {
    const payload = JSON.parse(raw) as ReturnType<typeof mapTemperamentQuizResultToApiBody>;
    const { apiPost } = await import("../services/gmusic-api/client");
    const { getApiBaseUrl } = await import("../services/gmusic-api/config");
    await apiPost(`${getApiBaseUrl()}/onboarding/temperament-quiz`, payload);
    clearPendingSyncPayload();
    return true;
  } catch {
    return false;
  }
}

export function readTemperamentQuizResult(): TemperamentQuizResult | null {
  if (!canUseStorage()) return null;
  const raw = localStorage.getItem(RESULT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TemperamentQuizResult;
  } catch {
    return null;
  }
}

export function markTemperamentQuizSkipped(): void {
  if (!canUseStorage()) return;
  localStorage.setItem(SKIPPED_KEY, "true");
}

export function hasPendingTemperamentQuizSync(): boolean {
  if (!canUseStorage()) return false;
  return Boolean(localStorage.getItem(PENDING_SYNC_KEY));
}
