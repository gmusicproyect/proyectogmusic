import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";
import { isPublicFreeLessonPage } from "./academia-track-matrix";

/** Demo funnel entry pages that require an account (PR2). */
const DEMO_ENTRY_PAGES = new Set([
  "mi-camino-demo",
  "onboarding-quiz",
  "onboarding-academia",
]);

const DEMO_LESSON_PAGE_PATTERN = /^demo-clase-[1-5]$/;

export function isAnonymousSession(
  status: PublicStudentSessionState["status"]
): boolean {
  return status === "anonymous" || status === "error";
}

/** Pages that require registered_no_sub or authenticated — never anonymous. */
export function requiresAccountForPage(page: string): boolean {
  if (DEMO_ENTRY_PAGES.has(page)) return true;
  if (DEMO_LESSON_PAGE_PATTERN.test(page)) return true;
  if (isPublicFreeLessonPage(page)) return true;
  return false;
}

/**
 * Anonymous visitors are sent to registro before demo entry.
 * Logged-in users (registered_no_sub, authenticated) keep the target page.
 */
export function resolveDemoEntryPage(
  sessionStatus: PublicStudentSessionState["status"],
  targetPage: string
): string {
  if (!requiresAccountForPage(targetPage)) {
    return targetPage;
  }
  if (sessionStatus === "loading") {
    return targetPage;
  }
  if (isAnonymousSession(sessionStatus)) {
    return "registro-cuenta";
  }
  return targetPage;
}
