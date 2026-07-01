import type { CommunityLevel } from "./community-level";
import { COMMUNITY_LEVEL_LABELS } from "./community-level";

/** Sector interno de Comunidad — uno por nivel académico activo. */
export interface CommunitySectorDefinition {
  level: CommunityLevel;
  sectorId: "basic" | "intermediate" | "advanced";
  label: string;
  description: string;
}

export const COMMUNITY_SECTORS: readonly CommunitySectorDefinition[] = [
  {
    level: "BASIC",
    sectorId: "basic",
    label: COMMUNITY_LEVEL_LABELS.BASIC,
    description: "Preguntas, progresos y música de alumnos en Guitarra Básico.",
  },
  {
    level: "INTERMEDIATE",
    sectorId: "intermediate",
    label: COMMUNITY_LEVEL_LABELS.INTERMEDIATE,
    description: "Comunidad de alumnos en Guitarra Intermedio — feedback y retos del nivel.",
  },
  {
    level: "ADVANCED",
    sectorId: "advanced",
    label: COMMUNITY_LEVEL_LABELS.ADVANCED,
    description: "Comunidad de alumnos en Guitarra Avanzado — demos, música y mentoría.",
  },
] as const;

export function getCommunitySectorForLevel(level: CommunityLevel): CommunitySectorDefinition {
  const sector = COMMUNITY_SECTORS.find((item) => item.level === level);
  if (!sector) {
    return COMMUNITY_SECTORS[0];
  }
  return sector;
}
