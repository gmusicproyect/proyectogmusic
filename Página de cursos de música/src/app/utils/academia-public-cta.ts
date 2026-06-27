import { getDemoUserState, hasDemoProgress, isDemoFullyCompleted } from "../hooks/useDemoUserState";
import type { PublicStudentSessionState } from "../hooks/usePublicStudentSession";

export interface AcademiaPublicCta {
  label: string;
  destination: string;
  disabled?: boolean;
}

export function resolveAcademiaPublicCta(
  sessionStatus: PublicStudentSessionState["status"]
): AcademiaPublicCta {
  if (sessionStatus === "loading") {
    return {
      label: "Probar mis 5 clases gratis",
      destination: "registro-cuenta",
      disabled: true,
    };
  }

  if (sessionStatus === "authenticated") {
    return {
      label: "Entrar a mi academia",
      destination: "mi-estudio",
    };
  }

  if (sessionStatus === "registered_no_sub") {
    if (isDemoFullyCompleted()) {
      const demo = getDemoUserState("registered_no_sub");
      return {
        label: demo.label,
        destination: demo.destination,
      };
    }
    if (hasDemoProgress()) {
      return {
        label: "Continuar mi camino",
        destination: "mi-camino-demo",
      };
    }
    return {
      label: "Continuar mi camino",
      destination: "onboarding-academia",
    };
  }

  return {
    label: "Probar mis 5 clases gratis",
    destination: "registro-cuenta",
  };
}
