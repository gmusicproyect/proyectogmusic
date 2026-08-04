import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";
import { isPublicFreeLessonPage } from "./academia-track-matrix";
import {
  CLASE_GRATUITA_LESSON_PAGE_PATTERN,
  CLASE_GRATUITA_MAP_PAGE,
} from "./clase-gratuita-routing";

/** Demo funnel entry pages that require an account (PR2). */
const DEMO_ENTRY_PAGES = new Set([
  CLASE_GRATUITA_MAP_PAGE,
  "onboarding-quiz",
  "onboarding-academia",
]);

export function isAnonymousSession(
  status: PublicStudentSessionState["status"]
): boolean {
  return status === "anonymous" || status === "error";
}

export function isLoggedInSession(
  status: PublicStudentSessionState["status"]
): boolean {
  return status === "registered_no_sub" || status === "authenticated";
}

/** Pages that require registered_no_sub or authenticated — never anonymous. */
export function requiresAccountForPage(page: string): boolean {
  if (DEMO_ENTRY_PAGES.has(page)) return true;
  if (CLASE_GRATUITA_LESSON_PAGE_PATTERN.test(page)) return true;
  if (isPublicFreeLessonPage(page)) return true;
  return false;
}

/**
 * Anonymous visitors are sent to registro before demo entry.
 * Logged-in users (registered_no_sub, authenticated) keep the target page.
 * While session is loading, protected targets stay blocked at render time (DemoAuthGuard).
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

/** True when anonymous must not see protected page content. */
export function shouldBlockProtectedPage(
  sessionStatus: PublicStudentSessionState["status"],
  page: string
): boolean {
  if (!requiresAccountForPage(page)) return false;
  if (sessionStatus === "loading") return true;
  return isAnonymousSession(sessionStatus);
}
