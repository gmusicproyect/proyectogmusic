import type { AcademiaTierId } from "./academia-track-matrix";
import { ACADEMIA_INSTRUMENTS, type AcademiaInstrumentId } from "../data/academia-instruments";
import {
  type CommunityLevel,
  communityLevelFromAcademicTier,
  parseCommunityLevelFromProgramLabel,
} from "../data/community-level";

export const ENROLLMENT_STORAGE_KEY = "gmusic:community_enrollment_v1";

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
  /** Futuro: enrollment activo desde API (ej. "Guitarra Básico"). */
  enrollmentProgramLabel?: string | null;
  instrument?: string | null;
  currentLessonNumber?: number | null;
  currentLessonTitle?: string | null;
  /** Fallback cuando no hay enrollment explícito (mock Track A). */
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

function readPersistedCommunityEnrollment(): Partial<CommunityEnrollment> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ENROLLMENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<CommunityEnrollment>;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function buildCommunityProgramLabel(
  instrument: string,
  academicTierId: AcademiaTierId
): string {
  return `${instrument} ${TIER_PROGRAM_LABELS[academicTierId]}`;
}

/**
 * Persiste el sector de Comunidad cuando el alumno elige instrumento + nivel en Academia.
 * Fuente interna hasta que la API exponga enrollment activo.
 */
export function persistCommunityEnrollmentFromAcademiaSelection(input: {
  instrumentId: AcademiaInstrumentId;
  academicTierId: AcademiaTierId;
  currentLessonNumber?: number | null;
  currentLessonTitle?: string | null;
}): CommunityEnrollment {
  const instrument =
    ACADEMIA_INSTRUMENTS.find((item) => item.id === input.instrumentId)?.name ?? "Guitarra";
  const programLabel = buildCommunityProgramLabel(instrument, input.academicTierId);
  const enrollment: CommunityEnrollment = {
    instrument,
    academicTierId: input.academicTierId,
    communityLevel: communityLevelFromAcademicTier(input.academicTierId),
    programLabel,
    currentLessonNumber:
      input.currentLessonNumber ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.currentLessonNumber,
    currentLessonTitle: input.currentLessonTitle ?? null,
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(enrollment));
  }

  return enrollment;
}

export function resolveCommunityEnrollment(
  input: ResolveCommunityEnrollmentInput = {}
): CommunityEnrollment {
  const persisted = readPersistedCommunityEnrollment();
  const programLabel =
    persisted?.programLabel ??
    input.enrollmentProgramLabel?.trim() ??
    DEFAULT_MOCK_COMMUNITY_ENROLLMENT.programLabel;

  const parsedLevel = parseCommunityLevelFromProgramLabel(programLabel);
  const academicTierId =
    persisted?.academicTierId ??
    (parsedLevel
      ? ({
          BASIC: "basico",
          INTERMEDIATE: "intermedio",
          ADVANCED: "avanzado",
        } satisfies Record<CommunityLevel, AcademiaTierId>)[parsedLevel]
      : (input.defaultAcademicTierId ?? DEFAULT_MOCK_COMMUNITY_ENROLLMENT.academicTierId));

  const communityLevel =
    persisted?.communityLevel ?? communityLevelFromAcademicTier(academicTierId);

  return {
    instrument:
      persisted?.instrument ??
      input.instrument?.trim() ??
      DEFAULT_MOCK_COMMUNITY_ENROLLMENT.instrument,
    academicTierId,
    communityLevel,
    programLabel,
    currentLessonNumber:
      persisted?.currentLessonNumber ??
      input.currentLessonNumber ??
      DEFAULT_MOCK_COMMUNITY_ENROLLMENT.currentLessonNumber,
    currentLessonTitle:
      persisted?.currentLessonTitle ??
      input.currentLessonTitle ??
      DEFAULT_MOCK_COMMUNITY_ENROLLMENT.currentLessonTitle,
  };
}
