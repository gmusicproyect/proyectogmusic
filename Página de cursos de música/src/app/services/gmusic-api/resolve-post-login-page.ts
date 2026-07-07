import type { PublicStudentSessionOutcome } from "./public-student-session";

export type PostLoginResolution =
  | { type: "navigate"; page: "mi-camino" | "mi-camino-demo" }
  | { type: "stay"; message: string };

/**
 * Destino post-login según matriz canónica (student-access-states + Opción B piloto).
 * `stay` = no navegar; mostrar mensaje en LoginCuentaPage.
 */
export function resolvePostLoginPage(
  outcome: PublicStudentSessionOutcome
): PostLoginResolution {
  if (outcome.type === "authenticated") {
    return { type: "navigate", page: "mi-camino" };
  }

  if (outcome.type === "registered_no_sub") {
    return { type: "navigate", page: "mi-camino-demo" };
  }

  if (outcome.type === "anonymous") {
    return {
      type: "stay",
      message:
        "Iniciaste sesión, pero no pudimos verificar tu acceso. Comprueba que las cookies estén habilitadas e inténtalo de nuevo.",
    };
  }

  if (outcome.type === "error") {
    return { type: "stay", message: outcome.message };
  }

  return {
    type: "stay",
    message: "No pudimos verificar tu sesión. Inténtalo de nuevo.",
  };
}
