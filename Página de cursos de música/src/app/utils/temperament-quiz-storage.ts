import type { TemperamentQuizResult } from "../data/temperament-quiz";

const SESSION_KEY = "gmusic_onboarding_session_id";
const RESULT_KEY = "gmusic_temperament_quiz_result";
const SKIPPED_KEY = "gmusic_temperament_quiz_skipped";

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

export function saveTemperamentQuizResult(result: TemperamentQuizResult): void {
  if (!canUseStorage()) return;
  localStorage.setItem(RESULT_KEY, JSON.stringify(result));
  localStorage.removeItem(SKIPPED_KEY);
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
