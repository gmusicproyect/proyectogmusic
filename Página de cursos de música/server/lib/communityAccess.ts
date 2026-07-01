export type CommunityLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";

const COMMUNITY_LEVELS = new Set<string>(["BASIC", "INTERMEDIATE", "ADVANCED"]);

export class CommunityAccessDeniedError extends Error {
  readonly code = "COMMUNITY_LEVEL_MISMATCH" as const;

  constructor(message = "El nivel solicitado no coincide con la inscripción activa del alumno.") {
    super(message);
    this.name = "CommunityAccessDeniedError";
  }
}

function isCommunityLevel(value: string): value is CommunityLevel {
  return COMMUNITY_LEVELS.has(value);
}

/** Deriva nivel desde programLabel de inscripción (ej. "Guitarra Básico"). */
export function parseCommunityLevelFromProgramLabel(label: string): CommunityLevel | null {
  const normalized = label
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();

  if (/\b(basico|basica|basic)\b/.test(normalized)) return "BASIC";
  if (/\bintermedio\b/.test(normalized)) return "INTERMEDIATE";
  if (/\bavanzado\b/.test(normalized)) return "ADVANCED";
  return null;
}

/**
 * Resuelve el nivel autorizado desde enrollment activo.
 * Ignora `clientRequestedLevel` si no coincide — nunca confía en el cliente.
 */
export function resolveAuthorizedCommunityLevel(
  enrollmentLevel: CommunityLevel,
  clientRequestedLevel?: string | null
): CommunityLevel {
  if (
    clientRequestedLevel != null &&
    clientRequestedLevel !== "" &&
    isCommunityLevel(clientRequestedLevel) &&
    clientRequestedLevel !== enrollmentLevel
  ) {
    return enrollmentLevel;
  }

  return enrollmentLevel;
}

/** Validación estricta para rutas API — lanza si el cliente envía otro nivel. */
export function assertAuthorizedCommunityLevel(
  enrollmentLevel: CommunityLevel,
  clientRequestedLevel?: string | null
): CommunityLevel {
  if (
    clientRequestedLevel != null &&
    clientRequestedLevel !== "" &&
    isCommunityLevel(clientRequestedLevel) &&
    clientRequestedLevel !== enrollmentLevel
  ) {
    throw new CommunityAccessDeniedError();
  }

  return enrollmentLevel;
}

export interface CommunityRequestScope {
  level: CommunityLevel;
  instrument: string;
  lessonNumber: number | null;
}

export function buildCommunityRequestScope(input: {
  programLabel: string;
  instrument: string;
  lessonNumber?: number | null;
  clientRequestedLevel?: string | null;
}): CommunityRequestScope {
  const enrollmentLevel = parseCommunityLevelFromProgramLabel(input.programLabel);
  if (!enrollmentLevel) {
    throw new CommunityAccessDeniedError("Inscripción activa sin nivel de comunidad válido.");
  }

  const level = resolveAuthorizedCommunityLevel(enrollmentLevel, input.clientRequestedLevel);

  return {
    level,
    instrument: input.instrument.trim(),
    lessonNumber: input.lessonNumber ?? null,
  };
}
