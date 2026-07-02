import { ApiError } from "./errors.js";

const ACADEMIC_TIER_IDS = new Set(["basico", "intermedio", "avanzado"]);
const MAX_INSTRUMENT_LENGTH = 64;
const MAX_PROGRAM_LABEL_LENGTH = 120;
const MAX_LESSON_TITLE_LENGTH = 200;

export interface UpsertCommunityEnrollmentInput {
  instrument: string;
  academicTierId: string;
  programLabel: string | null;
  currentLessonNumber: number | null;
  currentLessonTitle: string | null;
}

function readRequiredString(
  value: unknown,
  fieldLabel: string,
  maxLength: number
): string {
  if (typeof value !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} inválido.`);
  }
  const trimmed = value.trim();
  if (!trimmed) {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} es obligatorio.`);
  }
  if (trimmed.length > maxLength) {
    throw new ApiError(400, "VALIDATION_ERROR", `${fieldLabel} demasiado largo.`);
  }
  return trimmed;
}

function readOptionalString(value: unknown, maxLength: number): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") {
    throw new ApiError(400, "VALIDATION_ERROR", "Campo de texto inválido.");
  }
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) {
    throw new ApiError(400, "VALIDATION_ERROR", "Texto demasiado largo.");
  }
  return trimmed;
}

function readOptionalLessonNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    throw new ApiError(400, "VALIDATION_ERROR", "Número de clase inválido.");
  }
  return value;
}

export function parseUpsertCommunityEnrollmentBody(
  body: unknown
): UpsertCommunityEnrollmentInput {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Datos de inscripción inválidos.");
  }

  const record = body as Record<string, unknown>;

  const instrument = readRequiredString(
    record.instrument ?? record.instrument_name,
    "Instrumento",
    MAX_INSTRUMENT_LENGTH
  );

  const academicTierRaw =
    typeof record.academic_tier_id === "string"
      ? record.academic_tier_id.trim()
      : typeof record.academicTierId === "string"
        ? record.academicTierId.trim()
        : "";

  if (!ACADEMIC_TIER_IDS.has(academicTierRaw)) {
    throw new ApiError(400, "VALIDATION_ERROR", "Nivel académico inválido.");
  }

  const programLabel = readOptionalString(
    record.program_label ?? record.programLabel,
    MAX_PROGRAM_LABEL_LENGTH
  );

  const currentLessonNumber = readOptionalLessonNumber(
    record.current_lesson_number ?? record.currentLessonNumber
  );

  const currentLessonTitle = readOptionalString(
    record.current_lesson_title ?? record.current_lessonTitle,
    MAX_LESSON_TITLE_LENGTH
  );

  return {
    instrument,
    academicTierId: academicTierRaw,
    programLabel,
    currentLessonNumber,
    currentLessonTitle,
  };
}

export function buildProgramLabelFromEnrollment(input: {
  instrument: string;
  academicTierId: string;
}): string {
  const tierLabels: Record<string, string> = {
    basico: "Básico",
    intermedio: "Intermedio",
    avanzado: "Avanzado",
  };
  const tierLabel = tierLabels[input.academicTierId] ?? "Básico";
  return `${input.instrument} ${tierLabel}`;
}
