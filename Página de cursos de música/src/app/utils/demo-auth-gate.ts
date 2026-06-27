import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";

/** Demo funnel entry pages that require an account (PR2). */
const DEMO_ENTRY_PAGES = new Set([
  "mi-camino-demo",
  "onboarding-quiz",
  "onboarding-academia",
]);

export function isAnonymousSession(
  status: PublicStudentSessionState["status"]
): boolean {
  return status === "anonymous" || status === "error";
}

/**
 * Anonymous visitors are sent to registro before demo entry.
 * Logged-in users (registered_no_sub, authenticated) keep the target page.
 */
export function resolveDemoEntryPage(
  sessionStatus: PublicStudentSessionState["status"],
  targetPage: string
): string {
  if (sessionStatus === "loading") {
    return targetPage;
  }
  if (isAnonymousSession(sessionStatus) && DEMO_ENTRY_PAGES.has(targetPage)) {
    return "registro-cuenta";
  }
  return targetPage;
}
