import type { AcademiaTierId } from "../utils/academia-track-matrix";

/** Nivel de comunidad canónico (API / dominio). */
export type CommunityLevel = "BASIC" | "INTERMEDIATE" | "ADVANCED";

export const COMMUNITY_LEVELS: readonly CommunityLevel[] = [
  "BASIC",
  "INTERMEDIATE",
  "ADVANCED",
] as const;

export const COMMUNITY_LEVEL_LABELS: Record<CommunityLevel, string> = {
  BASIC: "Básico",
  INTERMEDIATE: "Intermedio",
  ADVANCED: "Avanzado",
};

export function isCommunityLevel(value: string): value is CommunityLevel {
  return (COMMUNITY_LEVELS as readonly string[]).includes(value);
}

export function communityLevelFromAcademicTier(tierId: AcademiaTierId): CommunityLevel {
  switch (tierId) {
    case "basico":
      return "BASIC";
    case "intermedio":
      return "INTERMEDIATE";
    case "avanzado":
      return "ADVANCED";
  }
}

export function academicTierFromCommunityLevel(level: CommunityLevel): AcademiaTierId {
  switch (level) {
    case "BASIC":
      return "basico";
    case "INTERMEDIATE":
      return "intermedio";
    case "ADVANCED":
      return "avanzado";
  }
}

/** Ej. "Guitarra Básico", "Guitarra Intermedio", "inscripción avanzado". */
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
