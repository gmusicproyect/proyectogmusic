import type { AcademiaTierId } from "../../utils/academia-track-matrix";
import type { CommunityLevel } from "../../data/community-level";
import type { CommunityEnrollment } from "../../utils/community-enrollment";

export interface CommunityEnrollmentApiRecord {
  instrument: string;
  academic_tier_id: AcademiaTierId;
  community_level: CommunityLevel;
  program_label: string;
  current_lesson_number: number | null;
  current_lesson_title: string | null;
}

export interface UpsertCommunityEnrollmentRequest {
  instrument: string;
  academic_tier_id: AcademiaTierId;
  program_label?: string | null;
  current_lesson_number?: number | null;
  current_lesson_title?: string | null;
}

export function mapCommunityEnrollmentApiRecord(
  record: CommunityEnrollmentApiRecord
): CommunityEnrollment {
  return {
    instrument: record.instrument,
    academicTierId: record.academic_tier_id,
    communityLevel: record.community_level,
    programLabel: record.program_label,
    currentLessonNumber: record.current_lesson_number,
    currentLessonTitle: record.current_lesson_title,
  };
}

export function buildUpsertCommunityEnrollmentBody(input: {
  instrument: string;
  academicTierId: AcademiaTierId;
  programLabel: string;
  currentLessonNumber?: number | null;
  currentLessonTitle?: string | null;
}): UpsertCommunityEnrollmentRequest {
  return {
    instrument: input.instrument,
    academic_tier_id: input.academicTierId,
    program_label: input.programLabel,
    current_lesson_number: input.currentLessonNumber ?? null,
    current_lesson_title: input.currentLessonTitle ?? null,
  };
}
