/**
 * PD-2 Persistencia Durable H1 — policy backend de entitlements (D-PD-05 / R-002).
 *
 * Helper compartido y PURO para decidir acceso a endpoints de aprendizaje.
 * `/me/access` NO basta como única capa de authz: cada endpoint privado debe
 * poder invocar esta policy.
 *
 * IMPORTANTE (alcance PD-2): este módulo se ENTREGA como helper reutilizable y
 * testeado, pero NO se cablea todavía a los endpoints existentes. El enforcement
 * real en rutas (endurecer requireZone, matriz de tests DEMO vs zone) es PD-3/PD-5,
 * porque cambia comportamiento y puede afectar cuentas DEMO de QA.
 */
import { ApiError } from "./errors.js";
import {
  buildEntitlementBlocker,
  isMonthPlayable,
  type AccessViewH1,
} from "./entitlementsH1.js";

export type LearningAccessRequirementH1 = {
  /** Exige zona de alumno (Subscription ACTIVE). */
  requireZone?: boolean;
  /** Exige que el mes esté en monthsPlayable. */
  monthIndex?: number;
  /** "read" exige libraryTier !== "none". */
  library?: "read" | "none";
  /**
   * Si true, una cuenta con grants.canStartPractice (p.ej. grant demo del catálogo)
   * satisface requireZone sin ACTIVE. Evita bypass silencioso (PD-1 §6.2).
   */
  allowDemoGrant?: boolean;
};

export type LearningAccessDenialH1 =
  | {
      reasonCode: "NO_ZONE";
      message: string;
    }
  | {
      reasonCode: "MONTH_NOT_PLAYABLE";
      monthIndex: number;
      message: string;
    }
  | {
      reasonCode: "LIBRARY_LOCKED";
      message: string;
    };

export type LearningAccessDecisionH1 =
  | { allowed: true }
  | { allowed: false; denial: LearningAccessDenialH1 };

/**
 * Evaluación pura de acceso. No lanza — devuelve la decisión.
 * El orden de checks es determinista: zona → mes → biblioteca.
 */
export function evaluateStudentLearningAccess(
  view: AccessViewH1,
  requirement: LearningAccessRequirementH1
): LearningAccessDecisionH1 {
  if (requirement.requireZone) {
    const demoOk = requirement.allowDemoGrant && view.grants.canStartPractice;
    if (!view.canAccessStudentZone && !demoOk) {
      return {
        allowed: false,
        denial: {
          reasonCode: "NO_ZONE",
          message:
            "Necesitas una suscripción activa para acceder a la zona de alumno.",
        },
      };
    }
  }

  if (requirement.monthIndex !== undefined) {
    const monthIndex = requirement.monthIndex;
    if (!Number.isInteger(monthIndex) || monthIndex < 1 || monthIndex > 12) {
      return {
        allowed: false,
        denial: {
          reasonCode: "MONTH_NOT_PLAYABLE",
          monthIndex,
          message: "monthIndex inválido.",
        },
      };
    }
    if (!isMonthPlayable(view.grants, monthIndex)) {
      return {
        allowed: false,
        denial: {
          reasonCode: "MONTH_NOT_PLAYABLE",
          monthIndex,
          message: buildEntitlementBlocker(monthIndex).reason,
        },
      };
    }
  }

  if (requirement.library === "read" && view.grants.libraryTier === "none") {
    return {
      allowed: false,
      denial: {
        reasonCode: "LIBRARY_LOCKED",
        message: "Tu acceso actual no incluye la Biblioteca.",
      },
    };
  }

  return { allowed: true };
}

/**
 * Variante imperativa: lanza ApiError(403 ENTITLEMENT) si la policy deniega.
 * monthIndex inválido → 400 VALIDATION_ERROR (coherente con assertMonthPlayableForPractice).
 */
export function assertStudentLearningAccess(
  view: AccessViewH1,
  requirement: LearningAccessRequirementH1
): void {
  const decision = evaluateStudentLearningAccess(view, requirement);
  if (decision.allowed) return;

  const { denial } = decision;
  if (
    denial.reasonCode === "MONTH_NOT_PLAYABLE" &&
    (denial.monthIndex < 1 || denial.monthIndex > 12 || !Number.isInteger(denial.monthIndex))
  ) {
    throw new ApiError(400, "VALIDATION_ERROR", denial.message);
  }
  throw new ApiError(403, "ENTITLEMENT", denial.message);
}
