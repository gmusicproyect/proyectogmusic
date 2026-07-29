import { GmusicApiError } from "./client";
import type { PublicStudentSessionOutcome } from "./public-student-session";

/**
 * Tras register/login la cookie debe dejar al usuario en registered_no_sub o authenticated.
 * Si /me/access responde anonymous/error, no redirigir silenciosamente al funnel.
 */
export function assertAuthSessionEstablished(
  outcome: PublicStudentSessionOutcome,
  context: "register" | "login" = "register"
): void {
  if (outcome.type === "registered_no_sub" || outcome.type === "authenticated") {
    return;
  }

  if (outcome.type === "anonymous") {
    /** T-UX-COPY-LOGIN: copy según origen — login no dice «tu cuenta se creó». */
    throw new GmusicApiError(
      context === "login"
        ? "Iniciaste sesión, pero no pudimos verificarla. Comprueba que las cookies estén habilitadas e inténtalo de nuevo."
        : "Tu cuenta se creó, pero no pudimos iniciar sesión. Comprueba que las cookies estén habilitadas e inténtalo de nuevo.",
      401,
      "SESSION_NOT_ESTABLISHED"
    );
  }

  if (outcome.type === "error") {
    throw new GmusicApiError(outcome.message, 500, "SESSION_REFRESH_FAILED");
  }

  throw new GmusicApiError(
    "No pudimos verificar tu sesión. Inténtalo de nuevo.",
    0,
    "SESSION_REFRESH_ABORTED"
  );
}
