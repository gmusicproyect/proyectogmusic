import type { CommunityLevel } from "../data/community-level";
import { isCommunityLevel } from "../data/community-level";
import type { CommunityEnrollment } from "./community-enrollment";
import { getStudentCommunityLevel } from "./get-student-community-level";

export class CommunityAccessDeniedError extends Error {
  readonly code = "COMMUNITY_LEVEL_MISMATCH" as const;

  constructor(message = "El nivel solicitado no coincide con tu inscripción activa.") {
    super(message);
    this.name = "CommunityAccessDeniedError";
  }
}

/** Nivel autorizado — ignora level enviado por el cliente si no coincide. */
export function resolveAuthorizedCommunityLevel(
  enrollment: Pick<CommunityEnrollment, "communityLevel"> | null | undefined,
  clientRequestedLevel?: CommunityLevel | string | null
): CommunityLevel {
  const authorized = getStudentCommunityLevel(enrollment);

  if (clientRequestedLevel == null || clientRequestedLevel === "") {
    return authorized;
  }

  if (!isCommunityLevel(String(clientRequestedLevel))) {
    return authorized;
  }

  if (clientRequestedLevel !== authorized) {
    return authorized;
  }

  return authorized;
}

/** Validación estricta para backend — rechaza level distinto al enrollment. */
export function assertAuthorizedCommunityLevel(
  enrollmentLevel: CommunityLevel,
  clientRequestedLevel?: CommunityLevel | string | null
): CommunityLevel {
  if (
    clientRequestedLevel != null &&
    clientRequestedLevel !== "" &&
    isCommunityLevel(String(clientRequestedLevel)) &&
    clientRequestedLevel !== enrollmentLevel
  ) {
    throw new CommunityAccessDeniedError();
  }

  return enrollmentLevel;
}

export interface CommunityPostCreateContext {
  level: CommunityLevel;
  instrument: string;
  lessonNumber: number | null;
  lessonTitle: string | null;
  programLabel: string;
}

/** Metadatos obligatorios al crear publicación — derivados del enrollment, no del UI. */
export function buildCommunityPostCreateContext(
  enrollment: CommunityEnrollment
): CommunityPostCreateContext {
  return {
    level: enrollment.communityLevel,
    instrument: enrollment.instrument,
    lessonNumber: enrollment.currentLessonNumber,
    lessonTitle: enrollment.currentLessonTitle,
    programLabel: enrollment.programLabel,
  };
}
