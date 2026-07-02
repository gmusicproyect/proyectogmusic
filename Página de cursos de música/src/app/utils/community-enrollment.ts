import type { AcademiaTierId } from "./academia-track-matrix";
import { ACADEMIA_INSTRUMENTS, type AcademiaInstrumentId } from "../data/academia-instruments";
import {
  type CommunityLevel,
  communityLevelFromAcademicTier,
  parseCommunityLevelFromProgramLabel,
} from "../data/community-level";
import {
  buildUpsertCommunityEnrollmentBody,
  mapCommunityEnrollmentApiRecord,
} from "../services/gmusic-api/map-community-enrollment";
import { upsertCommunityEnrollment } from "../services/gmusic-api/community";

const TIER_PROGRAM_LABELS: Record<AcademiaTierId, string> = {
  basico: "Básico",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
};

export interface CommunityEnrollment {
  instrument: string;
  academicTierId: AcademiaTierId;
  communityLevel: CommunityLevel;
  programLabel: string;
  currentLessonNumber: number | null;
  currentLessonTitle: string | null;
}

export interface ResolveCommunityEnrollmentInput {
  /** Enrollment activo desde API (ej. "Guitarra Básico"). */
  enrollmentProgramLabel?: string | null;
  instrument?: string | null;
  currentLessonNumber?: number | null;
  currentLessonTitle?: string | null;
  /** Fallback cuando no hay enrollment explícito (Track A sin API). */
  defaultAcademicTierId?: AcademiaTierId;
}

export const DEFAULT_MOCK_COMMUNITY_ENROLLMENT: CommunityEnrollment = {
  instrument: "Guitarra",
  academicTierId: "basico",
  communityLevel: "BASIC",
  programLabel: "Guitarra Básico",
  currentLessonNumber: 3,
  currentLessonTitle: "Acordes abiertos",
};

export function buildCommunityProgramLabel(
  instrument: string,
  academicTierId: AcademiaTierId
): string {
  return `${instrument} ${TIER_PROGRAM_LABELS[academicTierId]}`;
}

function buildCommunityEnrollmentFromAcademiaSelection(input: {
  instrumentId: AcademiaInstrumentId;
  academicTierId: AcademiaTierId;
  currentLessonNumber?: number | null;
  currentLessonTitle?: string | null;
}): CommunityEnrollment {
  const instrument =
    ACADEMIA_INSTRUMENTS.find((item) => item.id === input.instrumentId)?.name ?? "Guitarra";
  const programLabel = buildCommunityProgramLabel(instrument, input.academicTierId);
  return {
    instrument,
    academicTierId: input.academicTierId,
    communityLevel: communityLevelFromAcademicTier(input.academicTierId),
    programLabel,
    currentLessonNumber:
      input.currentLessonNumber ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.currentLessonNumber,
    currentLessonTitle: input.currentLessonTitle ?? null,
  };
}

/**
 * Persiste el sector de Comunidad cuando el alumno elige instrumento + nivel en Academia.
 * Suscriptores sincronizan vía API PostgreSQL; demo anónimo conserva solo estado local derivado.
 */
export async function persistCommunityEnrollmentFromAcademiaSelection(
  input: {
    instrumentId: AcademiaInstrumentId;
    academicTierId: AcademiaTierId;
    currentLessonNumber?: number | null;
    currentLessonTitle?: string | null;
  },
  options?: { syncToApi?: boolean }
): Promise<CommunityEnrollment> {
  const enrollment = buildCommunityEnrollmentFromAcademiaSelection(input);

  if (options?.syncToApi === false) {
    return enrollment;
  }

  try {
    const record = await upsertCommunityEnrollment(
      buildUpsertCommunityEnrollmentBody({
        instrument: enrollment.instrument,
        academicTierId: enrollment.academicTierId,
        programLabel: enrollment.programLabel,
        currentLessonNumber: enrollment.currentLessonNumber,
        currentLessonTitle: enrollment.currentLessonTitle,
      })
    );
    return mapCommunityEnrollmentApiRecord(record);
  } catch {
    return enrollment;
  }
}

export function resolveCommunityEnrollment(
  input: ResolveCommunityEnrollmentInput = {}
): CommunityEnrollment {
  const programLabel =
    input.enrollmentProgramLabel?.trim() ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.programLabel;

  const parsedLevel = parseCommunityLevelFromProgramLabel(programLabel);
  const academicTierId =
    parsedLevel
      ? ({
          BASIC: "basico",
          INTERMEDIATE: "intermedio",
          ADVANCED: "avanzado",
        } satisfies Record<CommunityLevel, AcademiaTierId>)[parsedLevel]
      : (input.defaultAcademicTierId ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.academicTierId);

  const communityLevel = communityLevelFromAcademicTier(academicTierId);

  return {
    instrument:
      input.instrument?.trim() ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.instrument,
    academicTierId,
    communityLevel,
    programLabel,
    currentLessonNumber:
      input.currentLessonNumber ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.currentLessonNumber,
    currentLessonTitle:
      input.currentLessonTitle ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.currentLessonTitle,
  };
}
