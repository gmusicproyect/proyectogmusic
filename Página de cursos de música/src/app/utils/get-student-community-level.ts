import type { CommunityLevel } from "../data/community-level";
import type { CommunityEnrollment } from "./community-enrollment";

/** Contrato futuro: student.activeEnrollment.level */
export interface StudentActiveEnrollment {
  instrument: string;
  level: CommunityLevel;
  programLabel: string;
  currentLessonNumber: number | null;
  currentLessonTitle: string | null;
}

export function getStudentCommunityLevel(
  enrollment: Pick<CommunityEnrollment, "communityLevel"> | null | undefined
): CommunityLevel {
  return enrollment?.communityLevel ?? "BASIC";
}

export function toStudentActiveEnrollment(enrollment: CommunityEnrollment): StudentActiveEnrollment {
  return {
    instrument: enrollment.instrument,
    level: enrollment.communityLevel,
    programLabel: enrollment.programLabel,
    currentLessonNumber: enrollment.currentLessonNumber,
    currentLessonTitle: enrollment.currentLessonTitle,
  };
}
